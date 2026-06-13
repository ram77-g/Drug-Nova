import random
from models.schemas import Drug, DiseaseInfo, Gene, Protein
from pydantic import BaseModel
from typing import List, Dict, Any

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

def calculate_predictions(disease: DiseaseInfo, genes: List[Gene], proteins: List[Protein], drugs: List[Drug]) -> List[PredictionResult]:
    """
    Simulates the Weighted Scoring Prediction Engine.
    Implements a Context-Aware Tiered Model to properly score primary treatments vs repurposed drugs.
    """
    
    predictions = []
    
    # Internal counts for overlap calculation
    disease_proteins = {p.name.lower() for p in proteins}
    disease_name_lower = disease.name.lower()
    
    for drug in drugs:
        # 1. Clinical Evidence & Approval Score (30%)
        clinical_evidence = 0.0
        status = drug.approval_status.lower()
        indication = drug.original_indication.lower()
        
        # Is it approved FOR THIS disease?
        is_primary_treatment = False
        if "approved" in status:
            # Check if the disease name is in the indication, or vice versa
            if disease_name_lower in indication or indication in disease_name_lower:
                clinical_evidence = 1.0  # Primary Treatment
                is_primary_treatment = True
            else:
                clinical_evidence = 0.60  # Repurposing Candidate
        elif "investigational" in status or "experimental" in status:
            clinical_evidence = 0.20
        else:
            clinical_evidence = 0.40
            
        # 2. Target Overlap / Shared Proteins
        drug_targets = {t.lower() for t in drug.target_proteins}
        overlap = disease_proteins.intersection(drug_targets)
        shared_proteins_raw = min(len(overlap) / 2.0, 1.0)
        
        # FIX for missing pathway targets (e.g. RdRp for COVID not in host protein list)
        if is_primary_treatment or drug.confidence_score > 0.90:
            shared_proteins_raw = max(shared_proteins_raw, 0.90)
            
        # 3. Stricter Simulated Biochemical Features (Overlap-Gated)
        hash_var = (sum(ord(c) for c in drug.name) % 20) / 100.0  # Variance of 0.0 to 0.20
        
        has_overlap = shared_proteins_raw > 0
        
        # Base biochem is strictly gated by biological reality
        if is_primary_treatment:
            base_biochem = 0.85
        elif has_overlap:
            base_biochem = 0.65
        else:
            base_biochem = 0.20 # Severe penalty for zero biological overlap
            
        binding_pocket = min(max(base_biochem + hash_var, 0.1), 0.99)
        binding_affinity = min(max(base_biochem - 0.05 + hash_var, 0.1), 0.99)
        
        # Toxicity is inversely weighted (Higher score = Safer)
        if "approved" in status:
            toxicity_inv = min(max(0.70 + hash_var, 0.5), 0.98) 
        else:
            toxicity_inv = min(max(0.40 + hash_var, 0.2), 0.80)
            
        # Systemic relevance
        protein_sim = min(max(binding_pocket - 0.1 + hash_var, 0.1), 0.96)
        
        # KG proximity relies heavily on overlap
        if is_primary_treatment:
            kg_proximity = min(max(0.85 + hash_var, 0.5), 0.99)
        elif has_overlap:
            kg_proximity = min(max(0.60 + hash_var, 0.4), 0.85)
        else:
            kg_proximity = min(max(0.20 + hash_var, 0.1), 0.40)
        
        # 4. New Weighting System (Adds up to 1.0)
        weights = {
            "Clinical Evidence": {"val": clinical_evidence, "weight": 0.30},
            "Binding Pocket Compatibility": {"val": binding_pocket, "weight": 0.15},
            "Binding Affinity": {"val": binding_affinity, "weight": 0.15},
            "Target Overlap": {"val": shared_proteins_raw, "weight": 0.10},
            "Toxicity Safety": {"val": toxicity_inv, "weight": 0.20},
            "Systemic Relevance": {"val": kg_proximity, "weight": 0.10},
        }
        
        final_score = sum(data["val"] * data["weight"] for data in weights.values())
        
        # 5. Define Specific Output Scores
        # Compatibility Score (Pure biochemistry)
        protein_compat = (binding_pocket + binding_affinity + shared_proteins_raw + protein_sim) / 4.0
        
        # Toxicity risk (inverse of toxicity safety)
        tox_risk_score = 1.0 - toxicity_inv
        if tox_risk_score < 0.25:
            tox_label = "Low"
        elif tox_risk_score < 0.55:
            tox_label = "Medium"
        else:
            tox_label = "High"
            
        # Confidence Score: Enforce "Burden of Proof" penalty
        base_confidence = (clinical_evidence + drug.confidence_score) / 2.0
        if is_primary_treatment:
            confidence_score = base_confidence
        elif has_overlap:
            confidence_score = base_confidence * 0.75 # Strict capping for true repurposing
        else:
            confidence_score = base_confidence * 0.40 # Heavy penalty for no evidence
            
        # 6. Explainability Breakdown
        factors = []
        for feature_name, data in weights.items():
            contribution_abs = data["val"] * data["weight"]
            contribution_pct = (contribution_abs / final_score) * 100
            
            factors.append(FeatureContribution(
                feature=feature_name,
                contribution=f"+{contribution_pct:.1f}%",
                score_value=data["val"]
            ))
            
        factors.sort(key=lambda x: float(x.contribution.replace("+", "").replace("%", "")), reverse=True)
        
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
            contributing_factors=factors
        )
        predictions.append(res)
        
    predictions.sort(key=lambda x: x.repurposing_score, reverse=True)
    return predictions
