"use client";

import { useState, useCallback } from "react";
import { searchDisease, getDiseaseSuggestions } from "@/lib/api";
import type { DiseaseSearchResponse } from "@/types";

interface UseDiseaseReturn {
  results: DiseaseSearchResponse | null;
  loading: boolean;
  error: string | null;
  search: (query: string) => Promise<void>;
  suggestions: Array<{ key: string; name: string }>;
  fetchSuggestions: (query: string) => Promise<void>;
  clearResults: () => void;
}

export function useDisease(): UseDiseaseReturn {
  const [results, setResults] = useState<DiseaseSearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<Array<{ key: string; name: string }>>([]);

  const search = useCallback(async (query: string) => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await searchDisease(query);
      setResults(data);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        "Failed to retrieve data. Make sure the backend is running.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSuggestions = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }
    try {
      const data = await getDiseaseSuggestions(query);
      setSuggestions(data);
    } catch {
      setSuggestions([]);
    }
  }, []);

  const clearResults = useCallback(() => {
    setResults(null);
    setError(null);
    setSuggestions([]);
  }, []);

  return { results, loading, error, search, suggestions, fetchSuggestions, clearResults };
}
