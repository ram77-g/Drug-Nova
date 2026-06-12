"""
Disease router — search and retrieve disease info, genes, proteins, drugs from MongoDB.
"""
from fastapi import APIRouter, HTTPException, Query, Depends
from models.schemas import DiseaseSearchResponse, DiseaseInfo, Gene, Protein, Drug
from db.mongodb import get_db
from services.scoring import rank_drugs
from routers.auth import get_current_user

router = APIRouter()

@router.get("/search", response_model=DiseaseSearchResponse)
async def search(
    q: str = Query(..., description="Disease name to search"),
    current_user: dict = Depends(get_current_user)
):
    """Search for a disease and return full biomedical context using MongoDB."""
    db = get_db()
    
    # 1. Search for disease using text index or regex
    q_lower = q.lower().strip()
    disease_doc = await db.diseases.find_one({"$text": {"$search": q_lower}})
    
    if not disease_doc:
        # Fallback to regex if text search fails
        disease_doc = await db.diseases.find_one({"name": {"$regex": q_lower, "$options": "i"}})
        
    if not disease_doc:
        # Fallback to key match
        disease_doc = await db.diseases.find_one({"key": {"$regex": q_lower, "$options": "i"}})
        
    if not disease_doc:
        raise HTTPException(
            status_code=404,
            detail=f"No data found for '{q}'. Try: alzheimer, parkinson, breast cancer, type 2 diabetes, covid-19, rheumatoid arthritis",
        )
        
    disease_key = disease_doc["key"]
    
    # 2. Fetch related entities
    genes_cursor = db.genes.find({"disease_key": disease_key})
    proteins_cursor = db.proteins.find({"disease_key": disease_key})
    drugs_cursor = db.drugs.find({"disease_key": disease_key})
    
    genes_data = await genes_cursor.to_list(length=100)
    proteins_data = await proteins_cursor.to_list(length=100)
    drugs_data = await drugs_cursor.to_list(length=100)
    
    # Transform to Pydantic models
    disease = DiseaseInfo(**disease_doc)
    genes = [Gene(**g) for g in genes_data]
    proteins = [Protein(**p) for p in proteins_data]
    drugs = [Drug(**d) for d in drugs_data]
    
    ranked_drugs = rank_drugs(drugs, disease.name)
    
    return DiseaseSearchResponse(
        disease=disease,
        genes=genes,
        proteins=proteins,
        drugs=ranked_drugs,
    )

@router.get("/suggestions")
async def suggestions(
    q: str = Query(..., description="Partial disease name"),
    current_user: dict = Depends(get_current_user)
):
    """Return disease name suggestions for autocomplete from MongoDB."""
    db = get_db()
    q_lower = q.lower().strip()
    cursor = db.diseases.find({"name": {"$regex": q_lower, "$options": "i"}})
    docs = await cursor.to_list(length=10)
    
    matches = [{"key": d["key"], "name": d["name"]} for d in docs]
    return {"suggestions": matches}

@router.get("/list")
async def list_diseases(current_user: dict = Depends(get_current_user)):
    """Return all available diseases from MongoDB."""
    db = get_db()
    cursor = db.diseases.find({})
    docs = await cursor.to_list(length=100)
    
    diseases = [{"key": d["key"], "name": d["name"], "icd_code": d["icd_code"]} for d in docs]
    return {"diseases": diseases}
