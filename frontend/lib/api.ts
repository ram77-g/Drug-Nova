/**
 * Drug Nova API client
 * Communicates with the FastAPI backend at localhost:8000
 */
import axios from "axios";
import type {
  DiseaseSearchResponse,
  KnowledgeGraphResponse,
  AIExplanationResponse,
  ProteinStructureResponse,
} from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const client = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

// ── Disease ──────────────────────────────────────────────────────────────────

export async function searchDisease(query: string): Promise<DiseaseSearchResponse> {
  const { data } = await client.get<DiseaseSearchResponse>("/api/disease/search", {
    params: { q: query },
  });
  return data;
}

export async function getDiseaseSuggestions(
  query: string
): Promise<Array<{ key: string; name: string }>> {
  const { data } = await client.get("/api/disease/suggestions", {
    params: { q: query },
  });
  return data.suggestions;
}

export async function listDiseases(): Promise<
  Array<{ key: string; name: string; icd_code: string }>
> {
  const { data } = await client.get("/api/disease/list");
  return data.diseases;
}

// ── Knowledge Graph ───────────────────────────────────────────────────────────

export async function getKnowledgeGraph(
  disease: string
): Promise<KnowledgeGraphResponse> {
  const { data } = await client.get<KnowledgeGraphResponse>("/api/graph", {
    params: { disease },
  });
  return data;
}

// ── AI Explanation ────────────────────────────────────────────────────────────

export async function getAIExplanation(payload: {
  disease_name: string;
  drug_name: string;
  mechanism: string;
  target_proteins: string[];
  rationale: string;
}): Promise<AIExplanationResponse> {
  const { data } = await client.post<AIExplanationResponse>("/api/ai/explain", payload);
  return data;
}

// ── Protein Structure ─────────────────────────────────────────────────────────

export async function getProteinStructure(
  uniprotId: string
): Promise<ProteinStructureResponse> {
  const { data } = await client.get<ProteinStructureResponse>(
    `/api/protein/${uniprotId}`
  );
  return data;
}
