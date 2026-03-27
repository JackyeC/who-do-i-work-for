import { useCallback, useSyncExternalStore } from "react";
import type { AlignmentResults, ValueWeight } from "@/lib/alignmentMapping";
import type { ValuesLensKey } from "@/lib/valuesLenses";

const STORAGE_KEY_RESULTS = "wdiwf_alignment_results";
const STORAGE_KEY_VALUES = "wdiwf_user_values";
const EVENT_NAME = "alignment-updated";

export interface AlignmentState {
  alignmentResults: AlignmentResults | null;
  userValues: Record<ValuesLensKey, ValueWeight> | null;
  hasCompletedAlignmentQuiz: boolean;
}

function readState(): AlignmentState {
  try {
    const rawResults = localStorage.getItem(STORAGE_KEY_RESULTS);
    const rawValues = localStorage.getItem(STORAGE_KEY_VALUES);
    const alignmentResults = rawResults ? JSON.parse(rawResults) as AlignmentResults : null;
    const userValues = rawValues ? JSON.parse(rawValues) as Record<ValuesLensKey, ValueWeight> : null;
    return {
      alignmentResults,
      userValues,
      hasCompletedAlignmentQuiz: !!alignmentResults,
    };
  } catch {
    return { alignmentResults: null, userValues: null, hasCompletedAlignmentQuiz: false };
  }
}

let listeners: Array<() => void> = [];
let cachedState = readState();

function subscribe(listener: () => void) {
  listeners.push(listener);
  return () => { listeners = listeners.filter(l => l !== listener); };
}

function getSnapshot() {
  return cachedState;
}

function notifyListeners() {
  cachedState = readState();
  listeners.forEach(l => l());
}

if (typeof window !== "undefined") {
  window.addEventListener("storage", notifyListeners);
  window.addEventListener(EVENT_NAME, notifyListeners);
}

export function useAlignment() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const saveAlignmentResults = useCallback((results: AlignmentResults) => {
    localStorage.setItem(STORAGE_KEY_RESULTS, JSON.stringify(results));
    window.dispatchEvent(new Event(EVENT_NAME));
  }, []);

  const saveUserValues = useCallback((values: Record<ValuesLensKey, ValueWeight>) => {
    localStorage.setItem(STORAGE_KEY_VALUES, JSON.stringify(values));
    window.dispatchEvent(new Event(EVENT_NAME));
  }, []);

  const updateSingleValue = useCallback((key: ValuesLensKey, weight: ValueWeight) => {
    const current = state.userValues ?? {} as Record<ValuesLensKey, ValueWeight>;
    const updated = { ...current, [key]: weight };
    localStorage.setItem(STORAGE_KEY_VALUES, JSON.stringify(updated));
    window.dispatchEvent(new Event(EVENT_NAME));
  }, [state.userValues]);

  const clearAlignment = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY_RESULTS);
    localStorage.removeItem(STORAGE_KEY_VALUES);
    window.dispatchEvent(new Event(EVENT_NAME));
  }, []);

  return {
    ...state,
    saveAlignmentResults,
    saveUserValues,
    updateSingleValue,
    clearAlignment,
  };
}
