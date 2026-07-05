export type WaveHeight =
  | "Flat"
  | "Tiny"
  | "Waist height"
  | "Chest height"
  | "Head height"
  | "Over head";

export type Crowd = "Light" | "Medium" | "Crowded";

export type Temperature = "Cold" | "Comfortable" | "Warm";

export type Suggestion = "Don't go" | "Worth a try" | "Good day" | "Must go";

export type Conditions = {
  waveHeight: WaveHeight;
  surfCrowd: Crowd;
  parking: Crowd;
  temperature: Temperature;
  suggestion: Suggestion;
};

export const WAVE_HEIGHT_OPTIONS: WaveHeight[] = [
  "Flat",
  "Tiny",
  "Waist height",
  "Chest height",
  "Head height",
  "Over head",
];

export const CROWD_OPTIONS: Crowd[] = ["Light", "Medium", "Crowded"];

export const TEMPERATURE_OPTIONS: Temperature[] = [
  "Cold",
  "Comfortable",
  "Warm",
];

export const SUGGESTION_OPTIONS: Suggestion[] = [
  "Don't go",
  "Worth a try",
  "Good day",
  "Must go",
];

export const CONDITION_FIELDS = [
  { key: "waveHeight", label: "Wave height", options: WAVE_HEIGHT_OPTIONS },
  { key: "surfCrowd", label: "Surf crowd", options: CROWD_OPTIONS },
  { key: "parking", label: "Parking", options: CROWD_OPTIONS },
  { key: "temperature", label: "Temperature", options: TEMPERATURE_OPTIONS },
  { key: "suggestion", label: "Suggestion", options: SUGGESTION_OPTIONS },
] as const;

export const DEFAULT_CONDITIONS: Conditions = {
  waveHeight: "Waist height",
  surfCrowd: "Medium",
  parking: "Medium",
  temperature: "Comfortable",
  suggestion: "Worth a try",
};

const SCALE_RED = "#ef4444";
const SCALE_GREEN = "#22c55e";

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

function rgbToHex(r: number, g: number, b: number): string {
  return (
    "#" +
    [r, g, b]
      .map((v) => Math.round(v).toString(16).padStart(2, "0"))
      .join("")
  );
}

function interpolateColor(from: string, to: string, t: number): string {
  const [r1, g1, b1] = hexToRgb(from);
  const [r2, g2, b2] = hexToRgb(to);
  return rgbToHex(
    r1 + (r2 - r1) * t,
    g1 + (g2 - g1) * t,
    b1 + (b2 - b1) * t
  );
}

function gradientColors(
  options: readonly string[],
  from: string,
  to: string
): Record<string, string> {
  return Object.fromEntries(
    options.map((option, index) => {
      const t = options.length === 1 ? 0 : index / (options.length - 1);
      return [option, interpolateColor(from, to, t)];
    })
  );
}

export type ConditionKey = (typeof CONDITION_FIELDS)[number]["key"];

// Per-option colors for each metric, ordered from lowest to highest.
export const OPTION_COLORS: Record<ConditionKey, Record<string, string>> = {
  waveHeight: gradientColors(WAVE_HEIGHT_OPTIONS, SCALE_RED, SCALE_GREEN),
  surfCrowd: gradientColors(CROWD_OPTIONS, SCALE_GREEN, SCALE_RED),
  parking: gradientColors(CROWD_OPTIONS, SCALE_GREEN, SCALE_RED),
  temperature: {
    Cold: "#93c5fd",
    Comfortable: "#34d399",
    Warm: "#fb923c",
  },
  suggestion: gradientColors(SUGGESTION_OPTIONS, SCALE_RED, SCALE_GREEN),
};

export const SUGGESTION_COLORS: Record<Suggestion, string> =
  OPTION_COLORS.suggestion as Record<Suggestion, string>;

export function getSuggestionColor(suggestion: Suggestion): string {
  return SUGGESTION_COLORS[suggestion];
}

export function getOptionColor(key: ConditionKey, value: string): string {
  return OPTION_COLORS[key][value] ?? "var(--color-text-muted)";
}
