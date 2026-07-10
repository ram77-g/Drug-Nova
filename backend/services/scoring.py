"""
Drug repurposing scoring pipeline.
Applies a weighted multi-factor ranking to candidate drugs.
"""

from models.schemas import Drug

# ✅ ADD THIS
try:
    from services.gnn_inference import predict_delta_g, delta_g_to_score
    GNN_AVAILABLE = True
except ImportError:
    GNN_AVAILABLE = False


def rank_drugs(drugs: list[Drug], disease_name: str,
               uniprot_id: str = None) -> list[Drug]:
    # ✅ Added uniprot_id parameter — pass this from predict.py when calling rank_drugs
    """
    Weighted scoring model.
    If GNN is available and a uniprot_id is provided, real binding energy
    replaces the fake protein_score. Otherwise falls back to old formula.
    """
    ranked = []

    for drug in drugs:
        # Approval weight — UNCHANGED
        approval_weight = 0.0
        status = drug.approval_status.lower()
        if "fda approved" in status:
            approval_weight = 1.0
        elif "ema approved" in status or "approved" in status:
            approval_weight = 0.85
        elif "otc" in status:
            approval_weight = 0.75
        elif "withdrawn" in status:
            approval_weight = 0.20

        # ✅ CHANGED: Try real GNN binding score first
        gnn_binding = None
        if GNN_AVAILABLE and uniprot_id and hasattr(drug, 'smiles') and drug.smiles:
            try:
                result      = predict_delta_g(uniprot_id, drug.name, drug.smiles)
                gnn_binding = delta_g_to_score(result["predicted_delta_g"])
            except Exception:
                gnn_binding = None

        if gnn_binding is not None:
            # Real GNN score replaces the fake protein_score
            # GNN binding now carries 40% weight instead of 15%
            adjusted = (
                gnn_binding           * 0.40
                + drug.confidence_score * 0.30
                + approval_weight       * 0.15
                + min(len(drug.target_proteins) / 2.0, 1.0) * 0.15
            )
        else:
            # ✅ Original fallback — UNCHANGED from your original file
            protein_score = min(len(drug.target_proteins) / 2.0, 1.0)
            adjusted = (
                drug.confidence_score * 0.70
                + protein_score       * 0.15
                + approval_weight     * 0.15
            )

        ranked.append(
            Drug(
                **{
                    **drug.model_dump(),
                    "confidence_score": round(min(adjusted, 0.99), 3),
                }
            )
        )

    ranked.sort(key=lambda d: d.confidence_score, reverse=True)
    return ranked