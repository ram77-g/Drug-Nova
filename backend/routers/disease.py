"""
Disease router — search and retrieve disease info, genes, proteins, drugs.
"""
from fastapi import APIRouter, HTTPException, Query
from models.schemas import DiseaseSearchResponse
from services.mock_data import search_disease, get_disease_data, DISEASE_CATALOG
from services.scoring import rank_drugs

router = APIRouter()


@router.get("/search", response_model=DiseaseSearchResponse)
async def search(q: str = Query(..., description="Disease name to search")):
    """Search for a disease and return full biomedical context."""
    key = search_disease(q)
    if not key:
        raise HTTPException(
            status_code=404,
            detail=f"No data found for '{q}'. Try: alzheimer, parkinson, breast cancer, type 2 diabetes, covid-19, rheumatoid arthritis",
        )
    disease, genes, proteins, drugs = get_disease_data(key)
    ranked_drugs = rank_drugs(drugs, disease.name)
    return DiseaseSearchResponse(
        disease=disease,
        genes=genes,
        proteins=proteins,
        drugs=ranked_drugs,
    )


@router.get("/suggestions")
async def suggestions(q: str = Query(..., description="Partial disease name")):
    """Return disease name suggestions for autocomplete."""
    q_lower = q.lower().strip()
    matches = [
        {"key": k, "name": v.name}
        for k, v in DISEASE_CATALOG.items()
        if q_lower in k or q_lower in v.name.lower()
    ]
    return {"suggestions": matches}


@router.get("/list")
async def list_diseases():
    """Return all available diseases."""
    return {
        "diseases": [
            {"key": k, "name": v.name, "icd_code": v.icd_code}
            for k, v in DISEASE_CATALOG.items()
        ]
    }
