"use client";

import { createContext, useContext, useState } from "react";
import {
  INITIAL_FAVORITE_BREAKS,
  KNOWN_BREAKS,
  type FavoriteBreak,
} from "@/lib/breaks";

type FavoriteBreaksContextValue = {
  favoriteBreaks: FavoriteBreak[];
  knownBreaks: FavoriteBreak[];
  addFavoriteBreak: (breakData: FavoriteBreak) => void;
  createAndAddBreak: (name: string) => void;
  getFavoriteById: (id: string) => FavoriteBreak | undefined;
};

const FavoriteBreaksContext = createContext<FavoriteBreaksContextValue | null>(
  null
);

export function FavoriteBreaksProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [favoriteBreaks, setFavoriteBreaks] = useState(INITIAL_FAVORITE_BREAKS);
  const [knownBreaks, setKnownBreaks] = useState(KNOWN_BREAKS);

  const addFavoriteBreak = (breakData: FavoriteBreak) => {
    setFavoriteBreaks((prev) => {
      if (prev.some((item) => item.id === breakData.id)) return prev;
      return [...prev, breakData];
    });
  };

  const createAndAddBreak = (name: string) => {
    const trimmedName = name.trim();
    if (!trimmedName) return;

    const existing = knownBreaks.find(
      (item) => item.name.toLowerCase() === trimmedName.toLowerCase()
    );
    if (existing) {
      addFavoriteBreak(existing);
      return;
    }

    const newBreak: FavoriteBreak = {
      id: String(Date.now()),
      name: trimmedName,
    };
    setKnownBreaks((prev) => [...prev, newBreak]);
    setFavoriteBreaks((prev) => [...prev, newBreak]);
  };

  const getFavoriteById = (id: string) =>
    favoriteBreaks.find((item) => item.id === id);

  return (
    <FavoriteBreaksContext.Provider
      value={{
        favoriteBreaks,
        knownBreaks,
        addFavoriteBreak,
        createAndAddBreak,
        getFavoriteById,
      }}
    >
      {children}
    </FavoriteBreaksContext.Provider>
  );
}

export function useFavoriteBreaks() {
  const ctx = useContext(FavoriteBreaksContext);
  if (!ctx) {
    throw new Error("useFavoriteBreaks must be used within FavoriteBreaksProvider");
  }
  return ctx;
}
