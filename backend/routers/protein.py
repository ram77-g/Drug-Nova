from fastapi import APIRouter, HTTPException, Path, Query
from models.schemas import ProteinStructureResponse
from db.mongodb import get_db
import httpx
from Bio import Align
import asyncio

router = APIRouter()

# Simple in-memory caches to prevent UniProt rate limits and timeouts
FASTA_CACHE = {}
BINDING_SITES_CACHE = {}

async def fetch_uniprot_fasta(uniprot_id: str) -> str:
    """Helper to fetch FASTA from UniProt with User-Agent and retries."""
    if uniprot_id in FASTA_CACHE:
        return FASTA_CACHE[uniprot_id]
        
    url = f"https://rest.uniprot.org/uniprotkb/{uniprot_id}.fasta"
    headers = {"User-Agent": "Drug-Nova/1.0 (contact@example.com)"}
    async with httpx.AsyncClient(headers=headers) as client:
        for _ in range(3):
            try:
                resp = await client.get(url, follow_redirects=True, timeout=10.0)
                if resp.status_code == 200:
                    lines = resp.text.split("\n")
                    seq = "".join(lines[1:])
                    FASTA_CACHE[uniprot_id] = seq
                    return seq
            except httpx.RequestError:
                await asyncio.sleep(1)
        return ""

@router.get("/align")
async def align_proteins(uniprot_a: str = Query(...), uniprot_b: str = Query(...)):
    """Perform a live sequence alignment between two proteins using UniProt sequences."""
    seq_a = await fetch_uniprot_fasta(uniprot_a.upper())
    seq_b = await fetch_uniprot_fasta(uniprot_b.upper())
    
    if not seq_a or not seq_b:
        raise HTTPException(status_code=404, detail="Could not fetch sequence for one or both proteins from UniProt.")
        
    aligner = Align.PairwiseAligner()
    aligner.mode = 'global'
    aligner.match_score = 1.0
    aligner.mismatch_score = 0.0
    aligner.open_gap_score = 0.0
    aligner.extend_gap_score = 0.0
    aligner.target_end_gap_score = 0.0
    aligner.query_end_gap_score = 0.0
    
    matches = aligner.score(seq_a, seq_b)
    ratio = matches / max(len(seq_a), len(seq_b))
    
    return {
        "protein_a": uniprot_a,
        "protein_b": uniprot_b,
        "similarity_score": round(ratio * 100, 2),
        "seq_a_length": len(seq_a),
        "seq_b_length": len(seq_b),
        "identical_residues": int(matches)
    }

@router.get("/{uniprot_id}", response_model=ProteinStructureResponse)
async def get_protein_structure(uniprot_id: str = Path(..., description="UniProt protein ID")):
    """Return protein structure metadata and AlphaFold URL from MongoDB."""
    db = get_db()
    uniprot_id_upper = uniprot_id.upper()
    
    doc = await db.protein_structures.find_one({"uniprot_id": uniprot_id_upper})
    
    if not doc:
        # Return a generic AlphaFold link for any valid-looking UniProt ID
        if len(uniprot_id_upper) in (6, 10):
            return ProteinStructureResponse(
                uniprot_id=uniprot_id_upper,
                protein_name="Protein Structure",
                alphafold_url=f"https://alphafold.ebi.ac.uk/entry/{uniprot_id_upper}",
                description="Structure available via AlphaFold Protein Structure Database.",
            )
        raise HTTPException(status_code=404, detail=f"Protein '{uniprot_id}' not found")
        
    return ProteinStructureResponse(**doc)

@router.get("/{uniprot_id}/binding_sites")
async def get_binding_sites(uniprot_id: str = Path(..., description="UniProt protein ID")):
    """Return binding site residues from UniProt API."""
    uniprot_id_upper = uniprot_id.upper()
    if uniprot_id_upper in BINDING_SITES_CACHE:
        return {"residues": BINDING_SITES_CACHE[uniprot_id_upper]}
        
    url = f"https://rest.uniprot.org/uniprotkb/{uniprot_id_upper}"
    headers = {"User-Agent": "Drug-Nova/1.0 (contact@example.com)"}
    
    data = None
    async with httpx.AsyncClient(headers=headers) as client:
        for _ in range(3):
            try:
                resp = await client.get(url, timeout=10.0)
                if resp.status_code == 200:
                    data = resp.json()
                    break
            except httpx.RequestError:
                await asyncio.sleep(1)
                
    if not data:
        return {"residues": ""}
        
    features = data.get("features", [])
    
    def extract_sites(allowed_types, require_interact_keyword=False):
        sites = []
        for f in features:
            f_type = f.get("type")
            if f_type in allowed_types:
                if require_interact_keyword:
                    desc = f.get("description", "").lower()
                    if "interact" not in desc and "bind" not in desc:
                        continue
                        
                start = f.get("location", {}).get("start", {}).get("value")
                end = f.get("location", {}).get("end", {}).get("value")
                if start and end:
                    if start == end:
                        sites.append(str(start))
                    else:
                        sites.extend([str(i) for i in range(start, end + 1)])
        return sites

    # 1. Try highly specific precise pockets first
    binding_sites = extract_sites(["Binding site", "Active site", "Site"])
    
    # 2. Fallback to domains
    if not binding_sites:
        binding_sites = extract_sites(["Domain", "DNA-binding region"])
        
    # 3. Fallback to broad interaction regions
    if not binding_sites:
        binding_sites = extract_sites(["Region"], require_interact_keyword=True)
        
    # 4. Final fallback for circulating peptides (like Insulin/IL6)
    if not binding_sites:
        binding_sites = extract_sites(["Peptide", "Chain"])
        
    if not binding_sites:
        return {"residues": ""}
        
    # Return unique sorted residues as comma separated string
    unique_sites = sorted(list(set(int(x) for x in binding_sites)))
    final_residues = ",".join(str(x) for x in unique_sites)
    
    BINDING_SITES_CACHE[uniprot_id_upper] = final_residues
    return {"residues": final_residues}

@router.get("/")
async def list_proteins():
    """Return all available protein structures from MongoDB."""
    db = get_db()
    cursor = db.protein_structures.find({})
    docs = await cursor.to_list(length=100)
    
    return {
        "proteins": [
            {"uniprot_id": d["uniprot_id"], "name": d["protein_name"], "pdb_id": d.get("pdb_id")}
            for d in docs
        ]
    }
