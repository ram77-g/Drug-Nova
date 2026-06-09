"""
Protein structure router — returns AlphaFold structure URLs and metadata from MongoDB.
"""
from fastapi import APIRouter, HTTPException, Path
from models.schemas import ProteinStructureResponse
from db.mongodb import get_db

router = APIRouter()

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
