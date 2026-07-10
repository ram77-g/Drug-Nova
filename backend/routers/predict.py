"""
Prediction router — AI scoring and ranking for candidate drugs.
Now includes real GNN-based docking endpoints.
"""
from fastapi import APIRouter, HTTPException, Query
from db.mongodb import get_db
from models.schemas import DiseaseInfo, Gene, Protein, Drug, DockRequest
from services.prediction_engine import calculate_predictions, PredictionResult
from typing import List

# ── GNN imports (graceful — backend still works if torch not installed) ───
try:
    from services.gnn_inference import predict_delta_g, predict_delta_g_ensemble
    GNN_AVAILABLE = True
    print("[predict router] GNN inference loaded ✅")
except Exception as e:
    GNN_AVAILABLE = False
    print(f"[predict router] GNN not available — falling back to hash scores. ({e})")

router = APIRouter()


# ── existing endpoint — UNCHANGED ────────────────────────────────────────

@router.get("/", response_model=List[PredictionResult])
async def predict_drugs(
    disease: str = Query(..., description="Disease name to generate predictions for")
):
    """Run the Weighted Scoring Prediction Engine for a given disease."""
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

    genes_cursor    = db.genes.find({"disease_key": disease_key})
    proteins_cursor = db.proteins.find({"disease_key": disease_key})
    drugs_cursor    = db.drugs.find({})

    genes_data    = await genes_cursor.to_list(length=100)
    proteins_data = await proteins_cursor.to_list(length=100)
    drugs_data    = await drugs_cursor.to_list(length=1000)

    disease_info = DiseaseInfo(**disease_doc)
    genes        = [Gene(**g) for g in genes_data]
    proteins     = [Protein(**p) for p in proteins_data]
    drugs        = [Drug(**d) for d in drugs_data]

    predictions = calculate_predictions(disease_info, genes, proteins, drugs)
    return predictions


# ── NEW: single-structure GNN docking ────────────────────────────────────

@router.post("/dock")
async def dock_drug(req: DockRequest):
    """
    Real GNN docking endpoint.

    Takes a protein UniProt ID + drug SMILES string.
    Returns the GNN-predicted binding energy ΔG (kcal/mol).

    Falls back to a hash-based estimate if the GNN model is not loaded.

    Called by DockingSimulator.tsx when the user clicks RUN SIMULATION.

    Example:
        POST /api/predict/dock
        { "uniprot_id": "P00533", "smiles": "COCCOC1=CC2=C...", "drug_name": "Erlotinib" }
    """
    if not GNN_AVAILABLE:
        raise HTTPException(
            status_code=503,
            detail=(
                "GNN model not available. "
                "Install torch-geometric and place docking_gnn_full.pt in the backend/ folder."
            )
        )

    if not req.smiles or not req.smiles.strip():
        raise HTTPException(status_code=400, detail="smiles field is required and cannot be empty.")

    try:
        result = predict_delta_g(
            uniprot_id  = req.uniprot_id,
            drug_smiles = req.smiles,
            drug_name   = req.drug_name,
        )
        if "error" in result:
            raise HTTPException(status_code=422, detail=result["error"])
        return result

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Docking failed: {str(e)}")


# ── NEW: conformational ensemble docking ─────────────────────────────────

@router.post("/dock/ensemble")
async def dock_drug_ensemble(req: DockRequest):
    """
    Conformational ensemble docking.

    For proteins that have multiple known experimental structures
    (EGFR: active DFG-in 2GS6 vs inactive DFG-out 3W32,
     BRAF: active 2FB8 vs inactive 1UWH), this endpoint runs the GNN
    against EACH real conformation and returns a per-shape breakdown.

    This is the endpoint that surfaces the "protein isn't rigid" result —
    you can see the same drug score differently against different shapes
    of the same protein, proving static docking is unreliable.

    Falls back to single static shape if no ensemble is defined for
    this protein.

    Example response (EGFR + Erlotinib):
    {
        "ensemble": true,
        "shapes": [
            { "conformation": "active_DFG-in",   "pdb_id": "2GS6", "delta_g": -9.1 },
            { "conformation": "inactive_DFG-out", "pdb_id": "3W32", "delta_g": -6.3 }
        ],
        "delta_g_min": -9.1,
        "delta_g_max": -6.3,
        "conformational_spread_kcal_mol": 2.8
    }

    A spread > 2 kcal/mol means the protein shape MATTERS for this drug.
    Static docking (one structure) would get this wrong by up to 2.8 kcal/mol.
    """
    if not GNN_AVAILABLE:
        raise HTTPException(
            status_code=503,
            detail="GNN model not available. Install torch-geometric and add docking_gnn_full.pt."
        )

    if not req.smiles or not req.smiles.strip():
        raise HTTPException(status_code=400, detail="smiles field is required.")

    try:
        result = predict_delta_g_ensemble(
            uniprot_id  = req.uniprot_id,
            drug_smiles = req.smiles,
            drug_name   = req.drug_name,
        )
        if "error" in result:
            raise HTTPException(status_code=422, detail=result["error"])
        return result

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ensemble docking failed: {str(e)}")


# ── NEW: check GNN status ─────────────────────────────────────────────────

@router.get("/dock/status")
async def dock_status():
    """
    Health check for the GNN docking system.
    Call this from the frontend to decide whether to show the GNN badge.
    """
    return {
        "gnn_available": GNN_AVAILABLE,
        "message": "GNN docking ready" if GNN_AVAILABLE else "GNN not loaded — install dependencies",
    }