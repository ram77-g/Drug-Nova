"""
Drugs router — retrieve drug details and repurposing candidates from MongoDB.
"""
from fastapi import APIRouter, HTTPException, Query, Depends
from db.mongodb import get_db
from routers.auth import get_current_user

router = APIRouter()

@router.get("/by-disease")
async def drugs_by_disease(
    disease: str = Query(...),
    current_user: dict = Depends(get_current_user)
):
    """Return repurposing candidates for a disease from MongoDB."""
    db = get_db()
    disease_lower = disease.lower().strip()
    
    # Resolve disease key
    disease_doc = await db.diseases.find_one({"$text": {"$search": disease_lower}})
    if not disease_doc:
        disease_doc = await db.diseases.find_one({"name": {"$regex": disease_lower, "$options": "i"}})
    if not disease_doc:
        disease_doc = await db.diseases.find_one({"key": {"$regex": disease_lower, "$options": "i"}})
        
    if not disease_doc:
        raise HTTPException(status_code=404, detail=f"Disease '{disease}' not found")
        
    disease_key = disease_doc["key"]
    
    cursor = db.drugs.find({"disease_key": disease_key})
    drugs = await cursor.to_list(length=100)
    
    # Remove _id from response
    for d in drugs:
        d.pop("_id", None)
        
    return {"disease": disease, "count": len(drugs), "drugs": drugs}

@router.get("/{drug_id}")
async def drug_detail(
    drug_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Return details for a specific drug ID from MongoDB."""
    db = get_db()
    drug_doc = await db.drugs.find_one({"id": drug_id})
    if not drug_doc:
        raise HTTPException(status_code=404, detail=f"Drug '{drug_id}' not found")
        
    drug_doc.pop("_id", None)
    return drug_doc
