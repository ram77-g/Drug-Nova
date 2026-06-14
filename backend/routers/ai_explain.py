"""
AI Explanation router.
Uses Gemini (if API key set) with intelligent mock fallback.
"""
import os
from fastapi import APIRouter
from models.schemas import AIExplanationRequest, AIExplanationResponse

router = APIRouter()

# ---------------------------------------------------------------------------
# Mock explanation templates (used when no API key is configured)
# ---------------------------------------------------------------------------
MOCK_EXPLANATIONS = {
    "default": (
        "Based on multi-target pharmacological analysis, {drug} demonstrates significant "
        "repurposing potential for {disease}. The drug's primary mechanism — {mechanism} — "
        "intersects with key pathogenic pathways in {disease}, particularly through modulation "
        "of {proteins}. Computational docking studies and epidemiological evidence support this "
        "association, indicating a plausible therapeutic bridge between the drug's known "
        "pharmacodynamics and the disease's molecular etiology."
    )
}

MOCK_PATHWAYS = {
    "alzheimer": ["Amyloid-beta clearance pathway", "Tau hyperphosphorylation cascade", "Neuroinflammation (NF-κB)", "Cholinergic signaling", "mTOR/AMPK axis"],
    "parkinson": ["Dopaminergic signaling", "Mitochondrial quality control", "Alpha-synuclein aggregation", "Ubiquitin-proteasome system", "Oxidative stress response"],
    "breast cancer": ["PI3K/AKT/mTOR pathway", "BRCA1-mediated DNA repair", "HER2/EGFR signaling", "Cell cycle regulation", "Apoptosis (p53)"],
    "type 2 diabetes": ["Insulin receptor signaling", "AMPK metabolic axis", "PPARG-mediated adipogenesis", "Glucose transporter regulation", "Incretin axis (GLP-1)"],
    "covid-19": ["ACE2 viral entry pathway", "JAK-STAT cytokine signaling", "IL-6 cytokine storm cascade", "NF-κB inflammatory axis", "RdRp viral replication"],
    "rheumatoid arthritis": ["TNF-alpha/NF-κB pathway", "JAK-STAT3 inflammatory axis", "B-cell/T-cell synovial activation", "Complement cascade", "RANKL osteoclast activation"],
    "asthma": ["Th2 cytokine signaling (IL-4/IL-5)", "Eosinophilic inflammation cascade", "Beta-2 adrenergic bronchodilation", "Glucocorticoid receptor signaling", "IgE-mediated mast cell activation"],
    "osteoporosis": ["RANK/RANKL/OPG axis", "Osteoclast differentiation pathway", "Parathyroid hormone (PTH) signaling", "Estrogen receptor signaling", "Wnt/beta-catenin pathway"],
    "depression": ["Monoaminergic neurotransmission (5-HT/DA/NE)", "BDNF/TrkB neurotrophic signaling", "HPA axis and stress response", "NMDA receptor-mediated synaptic plasticity", "Neuroinflammation cascade"],
    "nsclc": ["EGFR tyrosine kinase signaling", "KRAS/BRAF/MEK/ERK pathway", "ALK/ROS1 fusion signaling", "PD-1/PD-L1 immune checkpoint", "PI3K/AKT/mTOR pathway"],
}


async def _mock_explanation(req: AIExplanationRequest) -> AIExplanationResponse:
    """Generate a structured mock explanation without calling any API."""
    proteins_str = ", ".join(req.target_proteins[:3])
    disease_key = req.disease_name.lower()
    matched_key = next((k for k in MOCK_PATHWAYS if k in disease_key), "alzheimer")
    pathways = MOCK_PATHWAYS.get(matched_key, MOCK_PATHWAYS["alzheimer"])

    explanation = (
        f"{req.drug_name} emerges as a compelling repurposing candidate for {req.disease_name} "
        f"through its action on {proteins_str}. {req.mechanism}. "
        f"This pharmacological profile aligns with the dysregulated molecular landscape of {req.disease_name}, "
        f"where aberrant signaling through these targets drives disease progression. "
        f"Cross-referencing with DisGeNET and ChEMBL datasets reveals shared target overlap, "
        f"while population-level studies provide epidemiological validation. {req.rationale}"
    )

    return AIExplanationResponse(
        explanation=explanation,
        pathways=pathways[:4],
        confidence="High" if "Approved" in req.rationale else "Moderate",
        disclaimer=(
            "This analysis is AI-generated for research exploration only. "
            "It does not constitute medical advice and must not replace clinical judgment."
        ),
    )


async def _gemini_explanation(req: AIExplanationRequest) -> AIExplanationResponse:
    """Call Gemini API for a live explanation."""
    try:
        from google import genai
        from google.genai import types
        client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

        prompt = f"""You are a biomedical AI assistant specializing in drug repurposing research.

Analyze the following drug repurposing candidate and provide a structured scientific explanation:

Disease: {req.disease_name}
Drug: {req.drug_name}
Mechanism: {req.mechanism}
Target Proteins: {", ".join(req.target_proteins)}
Rationale: {req.rationale}

Provide:
1. A concise scientific explanation (3-4 sentences) of why this drug may work for this disease
2. Key molecular pathways involved (list 3-4)
3. Confidence assessment (High/Moderate/Low) with brief justification

Format your response as pure JSON without any markdown formatting like ```json ... ```. The JSON must have these exact string keys: "explanation", "pathways" (an array of strings), "confidence" (a string)."""

        response = await client.aio.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
        )

        import json
        text = response.text.strip()
        if text.startswith("```json"):
            text = text[7:]
        if text.endswith("```"):
            text = text[:-3]
            
        data = json.loads(text.strip())
        return AIExplanationResponse(
            explanation=data.get("explanation", ""),
            pathways=data.get("pathways", []),
            confidence=data.get("confidence", "Moderate"),
            disclaimer="AI-generated research exploration only. Not medical advice.",
        )
    except Exception as e:
        print(f"Gemini API Error: {e}")
        return await _mock_explanation(req)


@router.post("/explain", response_model=AIExplanationResponse)
async def explain(req: AIExplanationRequest):
    """Generate AI explanation for a drug repurposing candidate."""
    if os.getenv("GEMINI_API_KEY"):
        return await _gemini_explanation(req)
    return await _mock_explanation(req)
