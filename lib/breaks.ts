export type FavoriteBreak = {
  id: string;
  name: string;
};

export const SURF_LOCATIONS: FavoriteBreak[] = [
  { id: "1", name: "Upper Trestles" },
  { id: "2", name: "Lower Trestles" },
  { id: "3", name: "Church" },
  { id: "4", name: "Trails" },
  { id: "5", name: "San Onofre State Beach" },
  { id: "6", name: "Oceanside Harbor" },
  { id: "7", name: "The Rock, Oceanside" },
  { id: "8", name: "Oceanside Pier" },
  { id: "9", name: "Forster St. Oceanside" },
  { id: "10", name: "Carlsbad State Beach" },
  { id: "11", name: "Tamarack" },
  { id: "12", name: "Middles" },
  { id: "13", name: "Ponto" },
  { id: "14", name: "Terramar Point" },
  { id: "15", name: "Grandview" },
  { id: "16", name: "Beacons" },
  { id: "17", name: "Moonlight State Beach" },
  { id: "18", name: "D Street" },
  { id: "19", name: "San Elijo State Beach" },
  { id: "20", name: "Swami's" },
  { id: "21", name: "Pipes" },
  { id: "22", name: "Cardiff Reef" },
  { id: "23", name: "Seaside Reef" },
  { id: "24", name: "Fletcher Cove" },
  { id: "25", name: "Del Mar Rivermouth" },
  { id: "26", name: "Del Mar" },
  { id: "27", name: "Torrey Pines State Beach" },
  { id: "28", name: "Blacks" },
  { id: "29", name: "Scripps" },
  { id: "30", name: "George's" },
  { id: "31", name: "La Jolla Shores" },
  { id: "32", name: "La Jolla Cove" },
  { id: "33", name: "Birdrock" },
  { id: "34", name: "Windansea" },
  { id: "35", name: "Old Man's at Tourmaline" },
  { id: "36", name: "PB Point" },
  { id: "37", name: "Pacific Beach Drive" },
  { id: "38", name: "Law Street" },
  { id: "39", name: "Avalanche" },
  { id: "40", name: "Horseshoe" },
  { id: "41", name: "Crystal Pier" },
  { id: "42", name: "Mission Beach" },
  { id: "43", name: "Ocean Beach Pier" },
  { id: "44", name: "Sunset Cliffs" },
  { id: "45", name: "Coronado Beach" },
  { id: "46", name: "Imperial Beach Pier" },
  { id: "47", name: "Tijuana Slough" },
];

export const KNOWN_BREAKS: FavoriteBreak[] = SURF_LOCATIONS;

const INITIAL_FAVORITE_BREAK_IDS = ["43", "35", "44"] as const;

export const INITIAL_FAVORITE_BREAKS: FavoriteBreak[] =
  INITIAL_FAVORITE_BREAK_IDS.map(
    (id) => SURF_LOCATIONS.find((breakItem) => breakItem.id === id)!
  );

/** @deprecated Use useFavoriteBreaks() in client components */
export const FAVORITE_BREAKS = INITIAL_FAVORITE_BREAKS;

export function getFavoriteBreakById(id: string): FavoriteBreak | undefined {
  return SURF_LOCATIONS.find((b) => b.id === id);
}
