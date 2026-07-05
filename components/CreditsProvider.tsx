"use client";

import { createContext, useContext, useState } from "react";

type CreditsContextValue = {
  credits: number;
  deductCredit: (amount?: number) => void;
  addCredit: (amount?: number) => void;
};

const CreditsContext = createContext<CreditsContextValue | null>(null);

export function CreditsProvider({ children }: { children: React.ReactNode }) {
  const [credits, setCredits] = useState(10);

  const deductCredit = (amount = 1) => {
    setCredits((prev) => Math.max(0, prev - amount));
  };

  const addCredit = (amount = 1) => {
    setCredits((prev) => prev + amount);
  };

  return (
    <CreditsContext.Provider value={{ credits, deductCredit, addCredit }}>
      {children}
    </CreditsContext.Provider>
  );
}

export function useCredits() {
  const ctx = useContext(CreditsContext);
  if (!ctx) throw new Error("useCredits must be used within CreditsProvider");
  return ctx;
}
