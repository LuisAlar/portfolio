/**
 * Knobs for the Photography page.
 *
 * SCATTER: expanded photos sit a little off-center horizontally, each by its own fixed
 * "random" amount (seeded from the photo id, so it's the same on every visit).
 * Set `enabled: false` for centered photos. Try it without editing code by
 * adding ?scatter=off (or ?scatter=on) to the URL.
 */
export const SCATTER = {
  enabled: true,
  /** Max horizontal shift from center, as % of the photo's width */
  maxOffsetPct: 14,
};

/** Width of an expanded photo, as % of the column, before the height cap kicks in */
export const EXPANDED_WIDTH_PCT = 68;
/** Tallest an expanded photo may be, in vh (keeps portrait shots on screen) */
export const EXPANDED_MAX_VH = 82;

const scatterFromUrl = () => {
  if (typeof window === "undefined") return undefined;
  const v = new URLSearchParams(window.location.search).get("scatter");
  return v === "off" ? false : v === "on" ? true : undefined;
};

export const scatterEnabled = () => scatterFromUrl() ?? SCATTER.enabled;

/** Deterministic pseudo-random numbers in [-1, 1] from a string (FNV-1a seed + mulberry32). */
const seeded = (seed: string, count: number) => {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  const out: number[] = [];
  for (let i = 0; i < count; i++) {
    h = (h + 0x6d2b79f5) | 0;
    let t = Math.imul(h ^ (h >>> 15), 1 | h);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    out.push((((t ^ (t >>> 14)) >>> 0) / 4294967296) * 2 - 1);
  }
  return out;
};

/** CSS transform for one photo: a horizontal shift only. Undefined when scatter is off. */
export const scatterTransform = (id: string, enabled = scatterEnabled()) => {
  if (!enabled) return undefined;
  const [x] = seeded(id, 1);
  return `translateX(${(x * SCATTER.maxOffsetPct).toFixed(2)}%)`;
};
