"""
Pydantic models for Drug Nova API request/response schemas.
"""
from pydantic import BaseModel, Field
from typing import List, Optional


class Gene(BaseModel):
    id: str
    symbol: str
    name: str
    chromosome: Optional[str] = None
    relevance_score: float


class Protein(BaseModel):
    id: str
    name: str
    uniprot_id: str
    function: str
    structure_available: bool = False


class Drug(BaseModel):
    id: str
    name: str
    generic_name: str
    confidence_score: float          # 0–1
    mechanism: str
    target_proteins: List[str]
    side_effects: List[str]
    rationale: str
    approval_status: str
    original_indication: str
    pubmed_refs: List[str] = []


class DiseaseInfo(BaseModel):
    id: str
    name: str
    description: str
    prevalence: Optional[str] = None
    icd_code: Optional[str] = None


class DiseaseSearchResponse(BaseModel):
    disease: DiseaseInfo
    genes: List[Gene]
    proteins: List[Protein]
    drugs: List[Drug]


class GraphNode(BaseModel):
    id: str
    label: str
    type: str          # "disease" | "gene" | "protein" | "drug"
    data: dict = {}


class GraphEdge(BaseModel):
    id: str
    source: str
    target: str
    label: str
    weight: float = 1.0


class KnowledgeGraphResponse(BaseModel):
    nodes: List[GraphNode]
    edges: List[GraphEdge]


class AIExplanationRequest(BaseModel):
    disease_name: str = Field(..., max_length=100)
    drug_name: str = Field(..., max_length=100)
    mechanism: str = Field(..., max_length=500)
    target_proteins: List[str] = Field(..., max_length=50)
    rationale: str = Field(..., max_length=2000)


class AIExplanationResponse(BaseModel):
    explanation: str
    pathways: List[str]
    confidence: str
    disclaimer: str


class ProteinStructureResponse(BaseModel):
    uniprot_id: str
    protein_name: str
    alphafold_url: str
    pdb_id: Optional[str] = None
    description: str
