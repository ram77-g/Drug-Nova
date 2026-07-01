"""
Prediction router — AI scoring and ranking for candidate drugs.
"""
from fastapi import APIRouter, HTTPException, Query
from db.mongodb import get_db
from models.schemas import DiseaseInfo, Gene, Protein, Drug
from services.prediction_engine import calculate_predictions, PredictionResult
from typing import List

router = APIRouter()

@router.get("/", response_model=List[PredictionResult])
async def predict_drugs(disease: str = Query(..., description="Disease name to generate predictions for")):
    """Run the Hybrid GNN-Weighted Scoring Engine for a given disease."""
    db = get_db()

    q_lower = disease.lower().strip()
    disease_doc = await db.diseases.find_one({"$text": {"$search": q_lower}})
    if not disease_doc:
        disease_doc = await db.diseases.find_one({"name": {"$regex": q_lower, "$options": "i"}})
    if not disease_doc:
        disease_doc = await db.diseases.find_one({"key": {"$regex": q_lower, "$options": "i"}})
    if not disease_doc:
        raise HTTPException(status_code=404, detail=f"No data found for '{disease}'.")

    disease_key = disease_doc["key"]

    genes_cursor = db.genes.find({"disease_key": disease_key})
    proteins_cursor = db.proteins.find({"disease_key": disease_key})
    drugs_cursor = db.drugs.find({})

    genes_data = await genes_cursor.to_list(length=100)
    proteins_data = await proteins_cursor.to_list(length=100)
    drugs_data = await drugs_cursor.to_list(length=1000)

    disease_info = DiseaseInfo(**disease_doc)
    genes = [Gene(**g) for g in genes_data]
    proteins = [Protein(**p) for p in proteins_data]
    drugs = [Drug(**d) for d in drugs_data]

    predictions = calculate_predictions(disease_info, genes, proteins, drugs)
    return predictions