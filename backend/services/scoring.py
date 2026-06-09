"""
Drug repurposing scoring pipeline.
Applies a weighted multi-factor ranking to candidate drugs.
Designed to be swappable with an ML model in production.
"""

from models.schemas import Drug


def rank_drugs(drugs: list[Drug], disease_name: str) -> list[Drug]:
    """
    Apply a simple weighted scoring model:
      - Base confidence score                  (40%)
      - Number of target proteins overlapping  (30%)
      - Approval status bonus                  (20%)
      - Literature evidence (ref count)        (10%)

    Returns drugs sorted by adjusted score descending.
    """
    ranked = []
    for drug in drugs:
        # Approval status weight
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

        # Protein target coverage (normalized 0–1, cap at 5 targets)
        protein_score = min(len(drug.target_proteins) / 5.0, 1.0)

        # Literature evidence (normalized 0–1, cap at 5 refs)
        lit_score = min(len(drug.pubmed_refs) / 5.0, 1.0)

        adjusted = (
            drug.confidence_score * 0.40
            + protein_score * 0.30
            + approval_weight * 0.20
            + lit_score * 0.10
        )

        # Return a copy with adjusted confidence
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
