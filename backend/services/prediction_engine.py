import random
from models.schemas import Drug, DiseaseInfo, Gene, Protein
from pydantic import BaseModel
from typing import List, Dict, Any

# ✅ ADD THIS IMPORT (after you create gnn_inference.py from Colab Cell 17)
from services.gnn_inference import predict_delta_g, delta_g_to_score

class FeatureContribution(BaseModel):
    feature: str
    contribution: str
    score_value: float

class PredictionResult(BaseModel):
    drug_id: str
    drug_name: str
    generic_name: str
    repurposing_score: float
    protein_compatibility: float
    toxicity_risk_score: float
    toxicity_risk_label: str
    confidence_score: float
    recommendation_score: float
    is_primary_treatment: bool
    contributing_factors: List[FeatureContribution]
    target_proteins: List[str]
    # ✅ ADD THESE TWO NEW FIELDS so the frontend can show real numbers
    predicted_delta_g: float
    binding_source: str  # "GNN" or "fallback"
    smiles: str

def calculate_predictions(
    disease: DiseaseInfo,
    genes: List[Gene],
    proteins: List[Protein],
    drugs: List[Drug]
) -> List[PredictionResult]:

    predictions = []
    disease_proteins = {p.name.lower() for p in proteins}
    disease_name_lower = disease.name.lower()

    # ✅ Pre-fetch the first protein's uniprot_id for GNN calls
    # The GNN needs a protein to dock against — use the first disease protein
    primary_protein_uniprot = proteins[0].uniprot_id if proteins else None

    for drug in drugs:
        # 1. Clinical Evidence & Approval Score (30%) — UNCHANGED
        clinical_evidence = 0.0
        status = drug.approval_status.lower()
        indication = drug.original_indication.lower()

        is_primary_treatment = False
        if "approved" in status:
            if disease_name_lower in indication or indication in disease_name_lower:
                clinical_evidence = 1.0
                is_primary_treatment = True
            else:
                clinical_evidence = 0.60
        elif "investigational" in status or "experimental" in status:
            clinical_evidence = 0.20
        else:
            clinical_evidence = 0.40

        # 2. Target Overlap — UNCHANGED
        drug_targets = {t.lower() for t in drug.target_proteins}
        overlap = disease_proteins.intersection(drug_targets)
        shared_proteins_raw = min(len(overlap) / 2.0, 1.0)

        if is_primary_treatment or drug.confidence_score > 0.90:
            shared_proteins_raw = max(shared_proteins_raw, 0.90)

        has_overlap = shared_proteins_raw > 0

        # ✅ SECTION 3 — THIS IS THE ONLY REAL CHANGE
        # OLD CODE (delete these lines):
        #   hash_var = (sum(ord(c) for c in drug.name) % 20) / 100.0
        #   base_biochem = 0.85 / 0.65 / 0.20
        #   binding_pocket = min(max(base_biochem + hash_var, 0.1), 0.99)
        #   binding_affinity = min(max(base_biochem - 0.05 + hash_var, 0.1), 0.99)

        # NEW CODE — real GNN prediction:
        delta_g = None
        binding_source = "fallback"

        if primary_protein_uniprot and hasattr(drug, 'smiles') and drug.smiles:
            try:
                gnn_result = predict_delta_g(
                    uniprot_id=primary_protein_uniprot,
                    drug_smiles=drug.smiles,
                    drug_name=drug.name
                )
                delta_g = gnn_result["predicted_delta_g"]
                binding_source = "GNN"
            except Exception:
                delta_g = None  # fall through to fallback below

        if delta_g is not None:
            # Convert ΔG (kcal/mol) to 0-1 score
            # ΔG = -12 → score = 1.0 (very strong)
            # ΔG = -2  → score = 0.0 (very weak)
            binding_pocket   = delta_g_to_score(delta_g)
            binding_affinity = binding_pocket  # both from same real source
        else:
            # Fallback if GNN unavailable (no SMILES, model not loaded, etc.)
            hash_var = (sum(ord(c) for c in drug.name) % 20) / 100.0
            if is_primary_treatment:
                base_biochem = 0.85
            elif has_overlap:
                base_biochem = 0.65
            else:
                base_biochem = 0.20
            binding_pocket   = min(max(base_biochem + hash_var, 0.1), 0.99)
            binding_affinity = min(max(base_biochem - 0.05 + hash_var, 0.1), 0.99)
            delta_g          = -2.0 - (binding_pocket * 10.0)  # fake, for display only
        # ✅ END OF CHANGED SECTION

        # Everything below is UNCHANGED from your original file
        if "approved" in status:
            toxicity_inv = min(max(0.70 + (sum(ord(c) for c in drug.name) % 20) / 100.0, 0.5), 0.98)
        else:
            toxicity_inv = min(max(0.40 + (sum(ord(c) for c in drug.name) % 20) / 100.0, 0.2), 0.80)

        protein_sim = min(max(binding_pocket - 0.1 + (sum(ord(c) for c in drug.name) % 20) / 100.0, 0.1), 0.96)

        if is_primary_treatment:
            kg_proximity = min(max(0.85 + (sum(ord(c) for c in drug.name) % 20) / 100.0, 0.5), 0.99)
        elif has_overlap:
            kg_proximity = min(max(0.60 + (sum(ord(c) for c in drug.name) % 20) / 100.0, 0.4), 0.85)
        else:
            kg_proximity = min(max(0.20 + (sum(ord(c) for c in drug.name) % 20) / 100.0, 0.1), 0.40)

        weights = {
            "Clinical Evidence":            {"val": clinical_evidence,   "weight": 0.30},
            "Binding Pocket Compatibility": {"val": binding_pocket,      "weight": 0.15},
            "Binding Affinity":             {"val": binding_affinity,    "weight": 0.15},
            "Target Overlap":               {"val": shared_proteins_raw, "weight": 0.10},
            "Toxicity Safety":              {"val": toxicity_inv,        "weight": 0.20},
            "Systemic Relevance":           {"val": kg_proximity,        "weight": 0.10},
        }

        final_score   = sum(data["val"] * data["weight"] for data in weights.values())
        protein_compat = (binding_pocket + binding_affinity + shared_proteins_raw + protein_sim) / 4.0
        tox_risk_score = 1.0 - toxicity_inv
        tox_label      = "Low" if tox_risk_score < 0.25 else "Medium" if tox_risk_score < 0.55 else "High"

        base_confidence = (clinical_evidence + drug.confidence_score) / 2.0
        if is_primary_treatment:
            confidence_score = base_confidence
        elif has_overlap:
            confidence_score = base_confidence * 0.75
        else:
            confidence_score = base_confidence * 0.40

        factors = []
        for feature_name, data in weights.items():
            contribution_abs = data["val"] * data["weight"]
            contribution_pct = (contribution_abs / final_score) * 100
            factors.append(FeatureContribution(
                feature=feature_name,
                contribution=f"+{contribution_pct:.1f}%",
                score_value=data["val"]
            ))
        factors.sort(
            key=lambda x: float(x.contribution.replace("+", "").replace("%", "")),
            reverse=True
        )

        res = PredictionResult(
            drug_id=drug.id,
            drug_name=drug.name,
            generic_name=drug.generic_name,
            repurposing_score=round(final_score, 3),
            protein_compatibility=round(protein_compat, 3),
            toxicity_risk_score=round(tox_risk_score, 3),
            toxicity_risk_label=tox_label,
            confidence_score=round(confidence_score, 3),
            recommendation_score=round((final_score + confidence_score) / 2.0, 3),
            is_primary_treatment=is_primary_treatment,
            contributing_factors=factors,
            target_proteins=drug.target_proteins,
            # ✅ NEW fields
            predicted_delta_g=round(delta_g, 3),
            smiles=drug.smiles or "",
            binding_source=binding_source,
        )
        predictions.append(res)

    predictions.sort(key=lambda x: x.repurposing_score, reverse=True)
    return predictions