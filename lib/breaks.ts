export type FavoriteBreak = {
  id: string;
  name: string;
};

export function getFavoriteBreakById(id: string): FavoriteBreak | undefined {
  return FAVORITE_BREAKS.find((b) => b.id === id);
}

export const FAVORITE_BREAKS: FavoriteBreak[] = [
  { id: "1", name: "Ocean Beach" },
  { id: "2", name: "Tourmaline" },
  { id: "3", name: "Sunset cliffs" },
];
