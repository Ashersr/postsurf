import { CONDITION_FIELDS, type ConditionKey, type Conditions } from "./conditions";

export type TimeHorizon = "today" | "1w" | "1m" | "all";

export type MetricVoteCounts = {
  timestamp: number;
  counts: Map<string, number>;
};

export type ConditionReport = {
  reportedAt: string; // ISO timestamp
  reporterId: string;
  reporterName: string;
  conditions: Conditions;
};

// ~30 days of seeded reports, anchored relative to a fixed reference time so
// the mock data is stable across renders. The reference is 2026-07-05 18:00 UTC
// (3 PM PT on the day the feature was built).
export const REFERENCE_NOW = new Date("2026-07-05T18:00:00.000Z").getTime();
const REF = REFERENCE_NOW;

type Reporter = { id: string; name: string };

const BREAK_REPORTERS: Record<string, Reporter[]> = {
  "1": [
    { id: "alex", name: "Alex" },
    { id: "jamie", name: "Jamie" },
    { id: "sam", name: "Sam" },
  ],
  "2": [
    { id: "riley", name: "Riley" },
    { id: "casey", name: "Casey" },
    { id: "morgan", name: "Morgan" },
  ],
  "3": [
    { id: "alex", name: "Alex" },
    { id: "sam", name: "Sam" },
    { id: "riley", name: "Riley" },
  ],
};

function mulberry32(seed: number): () => number {
  let state = seed;
  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pickRandom<T>(rng: () => number, options: readonly T[]): T {
  return options[Math.floor(rng() * options.length)];
}

function randomInt(rng: () => number, min: number, max: number): number {
  return min + Math.floor(rng() * (max - min + 1));
}

function buildTimeSlots(rng: () => number): number[] {
  const slots: number[] = [];

  // Today — roughly every 2–3 hours across the last 24 h.
  for (let h = 1; h <= 22; ) {
    slots.push(REF - h * 60 * 60 * 1000);
    h += randomInt(rng, 2, 3);
  }

  // Past 29 days — 1–2 report windows per day.
  for (let d = 2; d <= 29; d++) {
    const windows = randomInt(rng, 1, 2);
    for (let w = 0; w < windows; w++) {
      const hour = randomInt(rng, 7, 16);
      slots.push(REF - d * 24 * 60 * 60 * 1000 + hour * 60 * 60 * 1000);
    }
  }

  return slots.sort((a, b) => a - b);
}

function randomConditions(rng: () => number): Conditions {
  return Object.fromEntries(
    CONDITION_FIELDS.map((field) => [field.key, pickRandom(rng, field.options)])
  ) as Conditions;
}

function generateReportsForBreak(breakId: string, seed: number): ConditionReport[] {
  const rng = mulberry32(seed);
  const reporters = BREAK_REPORTERS[breakId] ?? [];
  const reports: ConditionReport[] = [];

  for (const timestamp of buildTimeSlots(rng)) {
    // A few votes per time slot — each metric gets its own random value per vote.
    const voteCount = randomInt(rng, 3, 6);
    for (let i = 0; i < voteCount; i++) {
      const reporter = reporters[i % reporters.length];
      reports.push({
        reportedAt: new Date(timestamp).toISOString(),
        reporterId: reporter.id,
        reporterName: reporter.name,
        conditions: randomConditions(rng),
      });
    }
  }

  return reports;
}

const REPORTS_BY_BREAK: Record<string, ConditionReport[]> = {
  "1": generateReportsForBreak("1", 0x0b34c7),
  "2": generateReportsForBreak("2", 0x7a91f2),
  "3": generateReportsForBreak("3", 0x3e5d18),
};

export function getReportsForBreak(
  breakId: string,
  horizon: TimeHorizon
): ConditionReport[] {
  const all = REPORTS_BY_BREAK[breakId] ?? [];
  const now = REF;

  if (horizon === "today") {
    const dayStart = getStartOfLocalDay(now);
    const dayEnd = dayStart + 24 * 60 * 60 * 1000;
    return all
      .filter((r) => {
        const ts = new Date(r.reportedAt).getTime();
        return ts >= dayStart && ts < dayEnd;
      })
      .sort((a, b) => new Date(a.reportedAt).getTime() - new Date(b.reportedAt).getTime());
  }

  const cutoffMs: Record<Exclude<TimeHorizon, "today">, number> = {
    "1w":  7  * 24 * 60 * 60 * 1000,
    "1m":  30 * 24 * 60 * 60 * 1000,
    all:   Infinity,
  };

  const cutoff = cutoffMs[horizon];
  return all
    .filter((r) => now - new Date(r.reportedAt).getTime() <= cutoff)
    .sort((a, b) => new Date(a.reportedAt).getTime() - new Date(b.reportedAt).getTime());
}

function getStartOfLocalDay(timestamp: number): number {
  const d = new Date(timestamp);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function floorToLocalHour(timestamp: number): number {
  const d = new Date(timestamp);
  d.setMinutes(0, 0, 0);
  return d.getTime();
}

export function getMetricCountsByTimestamp(
  reports: ConditionReport[],
  metric: ConditionKey,
  horizon: TimeHorizon = "all"
): MetricVoteCounts[] {
  if (horizon === "today") {
    const dayStart = getStartOfLocalDay(REF);
    const byHour = new Map<number, Map<string, number>>();

    for (let h = 0; h < 24; h++) {
      byHour.set(dayStart + h * 60 * 60 * 1000, new Map());
    }

    for (const report of reports) {
      const hourTs = floorToLocalHour(new Date(report.reportedAt).getTime());
      const counts = byHour.get(hourTs);
      if (!counts) continue;

      const value = report.conditions[metric] as string;
      counts.set(value, (counts.get(value) ?? 0) + 1);
    }

    return Array.from(byHour.entries())
      .sort(([a], [b]) => a - b)
      .map(([timestamp, counts]) => ({ timestamp, counts }));
  }

  const byTs = new Map<number, Map<string, number>>();
  for (const report of reports) {
    const ts = new Date(report.reportedAt).getTime();
    const value = report.conditions[metric] as string;
    if (!byTs.has(ts)) byTs.set(ts, new Map());
    const counts = byTs.get(ts)!;
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return Array.from(byTs.entries())
    .sort(([a], [b]) => a - b)
    .map(([timestamp, counts]) => ({ timestamp, counts }));
}

function getModeForMetric(reports: ConditionReport[], metric: ConditionKey): string | null {
  if (reports.length === 0) return null;
  const counts = new Map<string, number>();
  for (const report of reports) {
    const value = report.conditions[metric] as string;
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  let best: string | null = null;
  let bestCount = 0;
  for (const [value, count] of counts) {
    if (count > bestCount || (count === bestCount && best !== null && value < best)) {
      best = value;
      bestCount = count;
    }
  }
  return best;
}

export type BreakSummary = {
  reportFrequency: number;
  latestReport: string;
  conditions: Conditions;
};

export function getBreakSummary(breakId: string): BreakSummary {
  const all = REPORTS_BY_BREAK[breakId] ?? [];

  const todayCutoff = 24 * 60 * 60 * 1000;
  const todayReports = all.filter(
    (r) => REF - new Date(r.reportedAt).getTime() <= todayCutoff
  );

  const latestTs = all.length > 0
    ? Math.max(...all.map((r) => new Date(r.reportedAt).getTime()))
    : null;

  const latestReport = latestTs !== null
    ? new Date(latestTs).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
    : "—";

  const latestReports = latestTs !== null
    ? all.filter((r) => new Date(r.reportedAt).getTime() === latestTs)
    : [];

  const conditions = Object.fromEntries(
    CONDITION_FIELDS.map((field) => {
      const mode = getModeForMetric(latestReports, field.key) ?? field.options[0];
      return [field.key, mode];
    })
  ) as Conditions;

  return {
    reportFrequency: todayReports.length,
    latestReport,
    conditions,
  };
}
