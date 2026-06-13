// Drug Nova — shared TypeScript types matching backend Pydantic schemas

export interface Gene {
  id: string;
  symbol: string;
  name: string;
  chromosome: string | null;
  relevance_score: number;
}

export interface Protein {
  id: string;
  name: string;
  uniprot_id: string;
  function: string;
  structure_available: boolean;
}

export interface Drug {
  id: string;
  name: string;
  generic_name: string;
  confidence_score: number; // 0–1
  mechanism: string;
  target_proteins: string[];
  side_effects: string[];
  rationale: string;
  approval_status: string;
  original_indication: string;
  pubmed_refs: string[];
}

export interface DiseaseInfo {
  id: string;
  name: string;
  description: string;
  prevalence: string | null;
  icd_code: string | null;
}

export interface DiseaseSearchResponse {
  disease: DiseaseInfo;
  genes: Gene[];
  proteins: Protein[];
  drugs: Drug[];
}

export interface GraphNode {
  id: string;
  label: string;
  type: "disease" | "gene" | "protein" | "drug";
  data: Record<string, unknown>;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  weight: number;
}

export interface KnowledgeGraphResponse {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface AIExplanationResponse {
  explanation: string;
  pathways: string[];
  confidence: string;
  disclaimer: string;
}

export interface ProteinStructureResponse {
  uniprot_id: string;
  protein_name: string;
  alphafold_url: string;
  pdb_id: string | null;
  description: string;
}

export type NodeType = "disease" | "gene" | "protein" | "drug";

export interface FeatureContribution {
  feature: string;
  contribution: string;
  score_value: number;
}

export interface PredictionResult {
  drug_id: string;
  drug_name: string;
  generic_name: string;
  repurposing_score: number;
  protein_compatibility: number;
  toxicity_risk_score: number;
  toxicity_risk_label: string;
  confidence_score: number;
  recommendation_score: number;
  is_primary_treatment: boolean;
  contributing_factors: FeatureContribution[];
  target_proteins: string[];
}
