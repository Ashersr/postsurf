export type FavoriteBreak = {
  id: string;
  name: string;
};

export const INITIAL_FAVORITE_BREAKS: FavoriteBreak[] = [
  { id: "1", name: "Ocean Beach" },
  { id: "2", name: "Tourmaline" },
  { id: "3", name: "Sunset cliffs" },
];

export const KNOWN_BREAKS: FavoriteBreak[] = [
  ...INITIAL_FAVORITE_BREAKS,
  { id: "4", name: "Pacific Beach" },
  { id: "5", name: "Windansea" },
  { id: "6", name: "Swamis" },
  { id: "7", name: "Blacks Beach" },
  { id: "8", name: "Cardiff Reef" },
];

/** @deprecated Use useFavoriteBreaks() in client components */
export const FAVORITE_BREAKS = INITIAL_FAVORITE_BREAKS;

export function getFavoriteBreakById(id: string): FavoriteBreak | undefined {
  return INITIAL_FAVORITE_BREAKS.find((b) => b.id === id);
}
