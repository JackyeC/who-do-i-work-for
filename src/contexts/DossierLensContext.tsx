import { createContext, useContext, useState, useCallback, ReactNode } from "react";

export type DossierLens = "candidate" | "sales" | "hr";

interface DossierLensContextType {
  lens: DossierLens;
  setLens: (lens: DossierLens) => void;
}

const DossierLensContext = createContext<DossierLensContextType>({
  lens: "candidate",
  setLens: () => {},
});

export const useDossierLens = () => useContext(DossierLensContext);

export function DossierLensProvider({ children }: { children: ReactNode }) {
  const [lens, setLensState] = useState<DossierLens>(() => {
    const saved = localStorage.getItem("wdiwf-dossier-lens");
    if (saved === "sales" || saved === "hr") return saved;
    return "candidate";
  });

  const setLens = useCallback((l: DossierLens) => {
    setLensState(l);
    localStorage.setItem("wdiwf-dossier-lens", l);
  }, []);

  return (
    <DossierLensContext.Provider value={{ lens, setLens }}>
      {children}
    </DossierLensContext.Provider>
  );
}
