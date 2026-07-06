"use client";

import { notFound } from "next/navigation";
import BreakDetailView from "./BreakDetailView";
import { useFavoriteBreaks } from "./FavoriteBreaksProvider";

export default function BreakDetailClient({ id }: { id: string }) {
  const { getFavoriteById } = useFavoriteBreaks();
  const breakData = getFavoriteById(id);

  if (!breakData) {
    notFound();
  }

  return <BreakDetailView breakData={breakData} />;
}
