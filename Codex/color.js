/**
 * colorDescription.js
 * Clean JS helpers for Vue 3 Composition API (or anywhere):
 * - hexToHsl(hex)              -> { h, s, l } where s/l are 0..1, h is 0..360
 * - describeColor(hex)         -> "red", "green", "gray", etc.
 * - describeWithTone(hex)      -> "dark vibrant red", "light muted blue", etc.
 * - pickRandom(arr)            -> random element (useful if you want random pick)
 * - predominantColorHex(arr)   -> returns the most frequent hex in an array
 */

/** Normalize hex string to "#rrggbb" lowercase. Returns null if invalid. */
function normalizeHex(hex) {
  if (typeof hex !== "string") return null;
  let h = hex.trim().toLowerCase();

  // Allow "ff0000" or "#ff0000"
  if (!h.startsWith("#")) h = `#${h}`;

  // Expand shorthand "#f00" -> "#ff0000"
  if (/^#[0-9a-f]{3}$/.test(h)) {
    h = `#${h[1]}${h[1]}${h[2]}${h[2]}${h[3]}${h[3]}`;
  }

  if (!/^#[0-9a-f]{6}$/.test(h)) return null;
  return h;
}

/**
 * Step 1: HEX -> HSL conversion
 * Returns { h, s, l } with:
 * - h: 0..360
 * - s: 0..1
 * - l: 0..1
 */
export function hexToHsl(hex) {
  const hNorm = normalizeHex(hex);
  if (!hNorm) throw new Error(`Invalid hex color: "${hex}"`);

  const r = parseInt(hNorm.slice(1, 3), 16) / 255;
  const g = parseInt(hNorm.slice(3, 5), 16) / 255;
  const b = parseInt(hNorm.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (delta !== 0) {
    s = delta / (1 - Math.abs(2 * l - 1));

    switch (max) {
      case r:
        h = ((g - b) / delta) % 6;
        break;
      case g:
        h = (b - r) / delta + 2;
        break;
      case b:
        h = (r - g) / delta + 4;
        break;
    }

    h *= 60;
    if (h < 0) h += 360;
  }

  return { h, s, l };
}

/**
 * Step 2: Base color naming from HSL.
 * Tunable thresholds and hue buckets.
 */
export function describeColor(hex) {
  const { h, s, l } = hexToHsl(hex);

  // Near-neutral (low saturation): black/gray/white
  if (s < 0.12) {
    if (l < 0.12) return "black";
    if (l > 0.92) return "white";
    return "gray";
  }

  // Hue buckets (degrees)
  if (h < 15 || h >= 345) return "red";
  if (h < 45) return "orange";
  if (h < 70) return "yellow";
  if (h < 165) return "green";
  if (h < 205) return "cyan";
  if (h < 255) return "blue";
  if (h < 290) return "purple";
  if (h < 345) return "pink";

  return "unknown";
}

/**
 * Step 3: Add tone adjectives based on lightness/saturation.
 * Examples: "dark vibrant red", "light muted blue"
 */
export function describeWithTone(hex) {
  const { s, l } = hexToHsl(hex);
  const base = describeColor(hex);

  // If base is neutral, don't add "vibrant/muted" (usually weird for gray/black/white)
  const isNeutral = base === "black" || base === "white" || base === "gray";

  const parts = [];

  // Lightness adjectives
  if (l <= 0.28) parts.push("dark");
  else if (l >= 0.78) parts.push("light");

  // Saturation adjectives (only when not neutral)
  if (!isNeutral) {
    if (s >= 0.75) parts.push("vibrant");
    else if (s <= 0.35) parts.push("muted");
  }

  parts.push(base);
  return parts.join(" ");
}

/** Utility: pick a random element from an array (returns undefined for empty). */
export function pickRandom(arr) {
  if (!Array.isArray(arr) || arr.length === 0) return undefined;
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Utility: predominant hex in an array (mode).
 * - Normalizes values, ignores invalid entries.
 * - If tie, returns the first seen with the highest count.
 */
export function predominantColorHex(hexArray) {
  if (!Array.isArray(hexArray) || hexArray.length === 0) return undefined;

  const counts = new Map();
  let bestHex;
  let bestCount = 0;

  for (const raw of hexArray) {
    const h = normalizeHex(raw);
    if (!h) continue;

    const next = (counts.get(h) ?? 0) + 1;
    counts.set(h, next);

    if (next > bestCount) {
      bestCount = next;
      bestHex = h;
    }
  }

  return bestHex;
}

/**
 * Convenience: Given an array of hex colors:
 * - mode: "predominant" | "random"
 * - returns a description string (base or with tone)
 */
export function describeFromArray(hexArray, { mode = "predominant", withTone = true } = {}) {
  const chosenHex =
    mode === "random" ? pickRandom(hexArray) : predominantColorHex(hexArray);

  if (!chosenHex) return "unknown";

  return withTone ? describeWithTone(chosenHex) : describeColor(chosenHex);
}
