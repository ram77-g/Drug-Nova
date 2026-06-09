"""
Drugs router — retrieve drug details and repurposing candidates.
"""
from fastapi import APIRouter, HTTPException, Query
from services.mock_data import DRUGS_BY_DISEASE, search_disease

router = APIRouter()


@router.get("/by-disease")
async def drugs_by_disease(disease: str = Query(...)):
    """Return repurposing candidates for a disease."""
    key = search_disease(disease)
    if not key:
        raise HTTPException(status_code=404, detail=f"Disease '{disease}' not found")
    drugs = DRUGS_BY_DISEASE.get(key, [])
    return {"disease": disease, "count": len(drugs), "drugs": [d.model_dump() for d in drugs]}


@router.get("/{drug_id}")
async def drug_detail(drug_id: str):
    """Return details for a specific drug ID."""
    for drugs in DRUGS_BY_DISEASE.values():
        for drug in drugs:
            if drug.id == drug_id:
                return drug.model_dump()
    raise HTTPException(status_code=404, detail=f"Drug '{drug_id}' not found")
