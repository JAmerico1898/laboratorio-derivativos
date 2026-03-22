"use client";

import { useState, useEffect } from "react";
import type { CompletedScenario } from "@/types/results";

const STORAGE_KEY = "derivativos-lab-completed";

export function useCompletedScenarios() {
  const [completedScenarios, setCompletedScenarios] = useState<CompletedScenario[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as CompletedScenario[];
        setCompletedScenarios(parsed);
      }
    } catch {
      // Ignore parse errors — start with empty state
    }
  }, []);

  const addCompletedScenario = (scenario: CompletedScenario) => {
    setCompletedScenarios((prev) => {
      const next = [...prev, scenario];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Ignore storage errors
      }
      return next;
    });
  };

  const getCompletedScenarios = (): CompletedScenario[] => completedScenarios;

  return {
    completedScenarios,
    addCompletedScenario,
    getCompletedScenarios,
  };
}
