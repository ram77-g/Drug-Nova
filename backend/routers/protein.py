from fastapi import APIRouter, HTTPException, Path, Query
from fastapi.responses import Response
from models.schemas import ProteinStructureResponse
from db.mongodb import get_db
import httpx
from Bio import Align
from Bio.SeqUtils.ProtParam import ProteinAnalysis
import asyncio
from fpdf import FPDF
import tempfile
import os

router = APIRouter()

# To avoid circular imports, import locally inside the route if needed
# We will just import the router method directly here
from routers.drugs import shared_drugs

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

@router.get("/{uniprot_id}/properties")
async def get_protein_properties(uniprot_id: str = Path(..., description="UniProt protein ID")):
    """Return physicochemical properties of a protein calculated from its sequence."""
    seq = await fetch_uniprot_fasta(uniprot_id.upper())
    
    if not seq:
        raise HTTPException(status_code=404, detail="Could not fetch sequence from UniProt.")
        
    # Remove any non-amino acid characters (like newline, whitespace, ambiguous X, U, O)
    # ProtParam can fail if sequence contains certain non-standard characters
    clean_seq = ''.join([c for c in seq.upper() if c in 'ACDEFGHIKLMNPQRSTVWY'])
    
    if not clean_seq:
        raise HTTPException(status_code=400, detail="Invalid protein sequence.")
        
    analysis = ProteinAnalysis(clean_seq)
    
    sec_struct = analysis.secondary_structure_fraction() # (helix, turn, sheet)
    
    return {
        "molecular_weight": round(analysis.molecular_weight(), 2),
        "isoelectric_point": round(analysis.isoelectric_point(), 2),
        "hydrophobicity_index": round(analysis.gravy(), 3),
        "residues_count": len(clean_seq),
        "helix_fraction": round(sec_struct[0] * 100, 1),
        "turn_fraction": round(sec_struct[1] * 100, 1),
        "sheet_fraction": round(sec_struct[2] * 100, 1)
    }

@router.get("/report")
async def generate_protein_comparison_report(uniprot_a: str = Query(...), uniprot_b: str = Query(...)):
    """Generate a Markdown report comparing two proteins."""
    db = get_db()
    
    # 1. Fetch metadata
    pA = await db.protein_structures.find_one({"uniprot_id": uniprot_a.upper()})
    pB = await db.protein_structures.find_one({"uniprot_id": uniprot_b.upper()})
    
    if not pA:
        pA = await db.proteins.find_one({"uniprot_id": uniprot_a.upper()})
    if not pB:
        pB = await db.proteins.find_one({"uniprot_id": uniprot_b.upper()})
        
    name_a = pA.get("protein_name", pA.get("name", uniprot_a)) if pA else uniprot_a
    name_b = pB.get("protein_name", pB.get("name", uniprot_b)) if pB else uniprot_b
    
    # 2. Fetch Sequence Alignment
    try:
        alignment = await align_proteins(uniprot_a=uniprot_a, uniprot_b=uniprot_b)
    except Exception:
        alignment = None

    # 3. Fetch Properties
    try:
        prop_a = await get_protein_properties(uniprot_id=uniprot_a)
    except Exception:
        prop_a = None
        
    try:
        prop_b = await get_protein_properties(uniprot_id=uniprot_b)
    except Exception:
        prop_b = None

    # 4. Fetch Shared Drugs
    try:
        drugs_resp = await shared_drugs(protein_a=uniprot_a, protein_b=uniprot_b)
        drugs = drugs_resp.get("shared_drugs", [])
    except Exception:
        drugs = []
        
    # Build Markdown
    md = f"# Protein Structure Comparison Report\n\n"
    md += f"**Structure A:** {name_a} ({uniprot_a.upper()})\n"
    md += f"**Structure B:** {name_b} ({uniprot_b.upper()})\n\n"
    md += f"---\n\n"
    
    md += f"## 1. Sequence Alignment\n"
    if alignment:
        md += f"- **Similarity Score:** {alignment['similarity_score']}%\n"
        md += f"- **Identical Residues:** {alignment['identical_residues']} aa\n"
        md += f"- **Structure A Length:** {alignment['seq_a_length']} aa\n"
        md += f"- **Structure B Length:** {alignment['seq_b_length']} aa\n"
    else:
        md += f"*Alignment data unavailable.*\n"
    md += f"\n"
    
    md += f"## 2. Physicochemical Properties\n"
    md += f"| Property | {uniprot_a.upper()} | {uniprot_b.upper()} |\n"
    md += f"|----------|-----|-----|\n"
    if prop_a and prop_b:
        md += f"| Molecular Weight | {prop_a['molecular_weight']} Da | {prop_b['molecular_weight']} Da |\n"
        md += f"| Isoelectric Point (pI) | {prop_a['isoelectric_point']} | {prop_b['isoelectric_point']} |\n"
        md += f"| Hydrophobicity (GRAVY) | {prop_a['hydrophobicity_index']} | {prop_b['hydrophobicity_index']} |\n"
        md += f"| Alpha Helix | {prop_a['helix_fraction']}% | {prop_b['helix_fraction']}% |\n"
        md += f"| Beta Sheet | {prop_a['sheet_fraction']}% | {prop_b['sheet_fraction']}% |\n"
        md += f"| Turn / Coil | {prop_a['turn_fraction']}% | {prop_b['turn_fraction']}% |\n"
    else:
        md += f"| Data | Unavailable | Unavailable |\n"
    md += f"\n"
    
    md += f"## 3. Polypharmacology Intersect (Shared Drugs)\n"
    if drugs:
        md += f"Found **{len(drugs)}** drug(s) targeting both structures:\n\n"
        for i, d in enumerate(drugs, 1):
            md += f"### {i}. {d.get('name', 'Unknown')}\n"
            md += f"- **Approval Status:** {d.get('approval_status', 'Unknown')}\n"
            md += f"- **Mechanism:** {d.get('mechanism', 'Unknown')}\n"
            md += f"- **Targets:** {', '.join(d.get('target_proteins', []))}\n\n"
    else:
        md += f"*No intersecting drugs found in the database.*\n\n"
        
    md += f"---\n*Generated by Drug Nova AI Platform*\n"
    
    filename = f"Comparison_Report_{uniprot_a.upper()}_vs_{uniprot_b.upper()}.md"
    
    return Response(
        content=md, 
        media_type="text/markdown", 
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@router.get("/report/pdf")
async def generate_protein_comparison_report_pdf(uniprot_a: str = Query(...), uniprot_b: str = Query(...)):
    """Generate a 1-page PDF report comparing two proteins."""
    db = get_db()
    
    # 1. Fetch metadata
    pA = await db.protein_structures.find_one({"uniprot_id": uniprot_a.upper()})
    pB = await db.protein_structures.find_one({"uniprot_id": uniprot_b.upper()})
    
    if not pA: pA = await db.proteins.find_one({"uniprot_id": uniprot_a.upper()})
    if not pB: pB = await db.proteins.find_one({"uniprot_id": uniprot_b.upper()})
        
    name_a = pA.get("protein_name", pA.get("name", uniprot_a)) if pA else uniprot_a
    name_b = pB.get("protein_name", pB.get("name", uniprot_b)) if pB else uniprot_b
    
    url_a = pA.get("alphafold_url", f"https://alphafold.ebi.ac.uk/entry/{uniprot_a.upper()}") if pA else f"https://alphafold.ebi.ac.uk/entry/{uniprot_a.upper()}"
    url_b = pB.get("alphafold_url", f"https://alphafold.ebi.ac.uk/entry/{uniprot_b.upper()}") if pB else f"https://alphafold.ebi.ac.uk/entry/{uniprot_b.upper()}"

    # 2. Fetch Alignment, Properties, Drugs
    try: alignment = await align_proteins(uniprot_a=uniprot_a, uniprot_b=uniprot_b)
    except Exception: alignment = None
    try: prop_a = await get_protein_properties(uniprot_id=uniprot_a)
    except Exception: prop_a = None
    try: prop_b = await get_protein_properties(uniprot_id=uniprot_b)
    except Exception: prop_b = None
    try:
        drugs_resp = await shared_drugs(protein_a=uniprot_a, protein_b=uniprot_b)
        drugs = drugs_resp.get("shared_drugs", [])
    except Exception: drugs = []

    # 3. Build PDF
    pdf = FPDF()
    pdf.add_page()
    pdf.set_auto_page_break(auto=True, margin=15)
    
    def safe_str(s: str) -> str:
        """Sanitize string for fpdf2 default helvetica font to prevent UnicodeEncodeError."""
        if not s: return ""
        return str(s).encode('latin-1', 'replace').decode('latin-1')
    
    # Title
    pdf.set_font("helvetica", "B", 18)
    pdf.cell(0, 10, "Protein Structure Comparison Report", ln=True, align="C")
    pdf.ln(5)
    
    # Overview
    pdf.set_font("helvetica", "B", 12)
    pdf.cell(0, 8, "Target Overview", ln=True)
    pdf.set_font("helvetica", "", 10)
    
    pdf.set_font("helvetica", "B", 10)
    pdf.cell(30, 6, "Structure A: ")
    pdf.set_font("helvetica", "", 10)
    pdf.cell(0, 6, f"{name_a} ({uniprot_a.upper()})", ln=True)
    pdf.set_text_color(0, 0, 255)
    pdf.cell(30, 6, "")
    pdf.cell(0, 6, "View in AlphaFold Database", ln=True, link=url_a)
    pdf.set_text_color(0, 0, 0)
    
    pdf.set_font("helvetica", "B", 10)
    pdf.cell(30, 6, "Structure B: ")
    pdf.set_font("helvetica", "", 10)
    pdf.cell(0, 6, f"{name_b} ({uniprot_b.upper()})", ln=True)
    pdf.set_text_color(0, 0, 255)
    pdf.cell(30, 6, "")
    pdf.cell(0, 6, "View in AlphaFold Database", ln=True, link=url_b)
    pdf.set_text_color(0, 0, 0)
    pdf.ln(5)
    
    # Alignment
    pdf.set_font("helvetica", "B", 12)
    pdf.cell(0, 8, "Sequence Alignment", ln=True)
    pdf.set_font("helvetica", "", 10)
    if alignment:
        pdf.cell(0, 6, f"Similarity Score: {alignment['similarity_score']}%", ln=True)
        pdf.cell(0, 6, f"Identical Residues: {alignment['identical_residues']} aa", ln=True)
        pdf.cell(0, 6, f"Structure A Length: {alignment['seq_a_length']} aa", ln=True)
        pdf.cell(0, 6, f"Structure B Length: {alignment['seq_b_length']} aa", ln=True)
    else:
        pdf.cell(0, 6, "Alignment data unavailable.", ln=True)
    pdf.ln(5)
    
    # Properties
    pdf.set_font("helvetica", "B", 12)
    pdf.cell(0, 8, "Physicochemical Properties", ln=True)
    pdf.set_font("helvetica", "B", 10)
    
    col_w = [60, 60, 60]
    pdf.cell(col_w[0], 8, "Property", border=1)
    pdf.cell(col_w[1], 8, f"Structure A ({uniprot_a.upper()})", border=1)
    pdf.cell(col_w[2], 8, f"Structure B ({uniprot_b.upper()})", border=1, ln=True)
    
    pdf.set_font("helvetica", "", 10)
    if prop_a and prop_b:
        data_rows = [
            ("Molecular Weight", f"{prop_a['molecular_weight']} Da", f"{prop_b['molecular_weight']} Da"),
            ("Isoelectric Point (pI)", str(prop_a['isoelectric_point']), str(prop_b['isoelectric_point'])),
            ("Hydrophobicity (GRAVY)", str(prop_a['hydrophobicity_index']), str(prop_b['hydrophobicity_index'])),
            ("Alpha Helix", f"{prop_a['helix_fraction']}%", f"{prop_b['helix_fraction']}%"),
            ("Beta Sheet", f"{prop_a['sheet_fraction']}%", f"{prop_b['sheet_fraction']}%"),
            ("Turn / Coil", f"{prop_a['turn_fraction']}%", f"{prop_b['turn_fraction']}%"),
        ]
        for row in data_rows:
            pdf.cell(col_w[0], 8, row[0], border=1)
            pdf.cell(col_w[1], 8, row[1], border=1)
            pdf.cell(col_w[2], 8, row[2], border=1, ln=True)
    else:
        pdf.cell(col_w[0], 8, "Data", border=1)
        pdf.cell(col_w[1], 8, "Unavailable", border=1)
        pdf.cell(col_w[2], 8, "Unavailable", border=1, ln=True)
    pdf.ln(5)
    
    # Drugs
    pdf.set_font("helvetica", "B", 12)
    pdf.cell(0, 8, "Polypharmacology Intersect (Shared Drugs)", ln=True)
    pdf.set_font("helvetica", "", 10)
    if drugs:
        pdf.cell(0, 6, f"Found {len(drugs)} drug(s) targeting both structures:", ln=True)
        pdf.ln(2)
        for i, d in enumerate(drugs, 1):
            pdf.set_font("helvetica", "B", 10)
            pdf.cell(0, 6, safe_str(f"{i}. {d.get('name', 'Unknown')}"), ln=True)
            pdf.set_font("helvetica", "", 10)
            pdf.cell(0, 6, safe_str(f"  Approval Status: {d.get('approval_status', 'Unknown')}"), ln=True)
            pdf.cell(0, 6, safe_str(f"  Mechanism: {d.get('mechanism', 'Unknown')}"), ln=True)
            pdf.cell(0, 6, safe_str(f"  Targets: {', '.join(d.get('target_proteins', []))}"), ln=True)
            pdf.ln(2)
    else:
        pdf.cell(0, 6, "No intersecting drugs found in the database.", ln=True)

    pdf.ln(10)
    pdf.set_font("helvetica", "I", 8)
    pdf.set_text_color(150, 150, 150)
    pdf.cell(0, 5, "Generated by Drug Nova AI Platform", ln=True, align="C")

    # Output to temp file then read bytes
    fd, temp_path = tempfile.mkstemp(suffix=".pdf")
    os.close(fd)
    
    try:
        pdf.output(temp_path)
        with open(temp_path, "rb") as f:
            pdf_bytes = f.read()
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)
    
    filename = f"Comparison_Report_{uniprot_a.upper()}_vs_{uniprot_b.upper()}.pdf"
    
    return Response(
        content=pdf_bytes, 
        media_type="application/pdf", 
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

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
