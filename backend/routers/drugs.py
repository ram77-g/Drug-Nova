"""
Drugs router — retrieve drug details and repurposing candidates from MongoDB.
"""
from fastapi import APIRouter, HTTPException, Query
from db.mongodb import get_db
from services.chembl import get_chembl_data
from services.openfda import get_fda_adverse_events

router = APIRouter()

@router.get("/shared")
async def shared_drugs(protein_a: str = Query(...), protein_b: str = Query(...)):
    """Return drugs that target both proteins (Polypharmacology intersect)."""
    db = get_db()
    
    if protein_a == protein_b:
        return {"shared_drugs": []}
        
    pA = await db.protein_structures.find_one({"uniprot_id": protein_a.upper()})
    pB = await db.protein_structures.find_one({"uniprot_id": protein_b.upper()})
    
    if not pA:
        pA = await db.proteins.find_one({"uniprot_id": protein_a.upper()})
    if not pB:
        pB = await db.proteins.find_one({"uniprot_id": protein_b.upper()})
        
    name_a = pA.get("protein_name", pA.get("name", "")) if pA else ""
    name_b = pB.get("protein_name", pB.get("name", "")) if pB else ""
    
    if not name_a or not name_b:
        return {"shared_drugs": []}
        
    syn_a = [name_a.lower().split("/")[0].strip()]
    syn_b = [name_b.lower().split("/")[0].strip()]
    
    if "p53" in syn_a[0]: syn_a.append("tp53")
    elif "her2" in syn_a[0] or "erbb2" in syn_a[0]: syn_a.append("her2")
    if "p53" in syn_b[0]: syn_b.append("tp53")
    elif "her2" in syn_b[0] or "erbb2" in syn_b[0]: syn_b.append("her2")
    
    cursor = db.drugs.find({})
    drugs = await cursor.to_list(length=1000)
    
    shared = []
    for d in drugs:
        targets = [t.lower() for t in d.get("target_proteins", [])]
        
        matches_a = any(any(s in t or t in s for s in syn_a) for t in targets)
        matches_b = any(any(s in t or t in s for s in syn_b) for t in targets)
        
        if matches_a and matches_b:
            d.pop("_id", None)
            shared.append(d)
            
    return {"shared_drugs": shared}

@router.get("/by-disease")
async def drugs_by_disease(disease: str = Query(...)):
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

@router.get("/chembl/{drug_name}")
async def chembl_drug_data(drug_name: str):
    """Fetch live ChEMBL data for a drug."""
    data = await get_chembl_data(drug_name)
    if not data:
        raise HTTPException(status_code=404, detail=f"No ChEMBL data found for '{drug_name}'")
    return data

@router.get("/fda/{drug_name}")
async def fda_adverse_events(drug_name: str):
    """Fetch live OpenFDA adverse events for a drug."""
    data = await get_fda_adverse_events(drug_name)
    if not data:
        raise HTTPException(status_code=404, detail=f"No OpenFDA data found for '{drug_name}'")
    return data

@router.get("/{drug_id}")
async def drug_detail(drug_id: str):
    """Return details for a specific drug ID from MongoDB."""
    db = get_db()
    drug_doc = await db.drugs.find_one({"id": drug_id})
    if not drug_doc:
        raise HTTPException(status_code=404, detail=f"Drug '{drug_id}' not found")
        
    drug_doc.pop("_id", None)
    return drug_doc
