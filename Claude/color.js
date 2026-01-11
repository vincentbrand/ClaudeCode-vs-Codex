/**
 * Color utility functions for describing hex colors in human-readable terms.
 *
 * Exports:
 * - hexToHsl(hex)            -> { h, s, l } where h is 0..360, s/l are 0..1
 * - describeColor(hex)       -> "red", "green", "gray", etc.
 * - describeWithTone(hex)    -> "dark vibrant red", "light muted blue", etc.
 * - pickRandom(arr)          -> random element from array
 * - predominantColorHex(arr) -> most frequent hex in an array
 * - describeFromArray(arr)   -> description of predominant/random color
 */

// Threshold constants for color classification
const SATURATION_NEUTRAL_THRESHOLD = 0.12;
const LIGHTNESS_BLACK_THRESHOLD = 0.12;
const LIGHTNESS_WHITE_THRESHOLD = 0.92;
const LIGHTNESS_DARK_THRESHOLD = 0.28;
const LIGHTNESS_LIGHT_THRESHOLD = 0.78;
const SATURATION_VIBRANT_THRESHOLD = 0.75;
const SATURATION_MUTED_THRESHOLD = 0.35;

// Hue ranges for color names (upper bound, exclusive)
const HUE_RANGES = [
  { max: 15, name: "red" },
  { max: 45, name: "orange" },
  { max: 70, name: "yellow" },
  { max: 165, name: "green" },
  { max: 205, name: "cyan" },
  { max: 255, name: "blue" },
  { max: 290, name: "purple" },
  { max: 345, name: "pink" },
  { max: 360, name: "red" },
];

const NEUTRAL_COLORS = new Set(["black", "white", "gray"]);

/**
 * Normalize hex string to "#rrggbb" lowercase format.
 * @param {string} hex - The hex color string to normalize
 * @returns {string|null} Normalized hex string or null if invalid
 */
function normalizeHex(hex) {
  if (typeof hex !== "string") return null;

  let normalized = hex.trim().toLowerCase();
  if (!normalized.startsWith("#")) {
    normalized = `#${normalized}`;
  }

  // Expand shorthand "#f00" -> "#ff0000"
  if (/^#[0-9a-f]{3}$/.test(normalized)) {
    normalized = `#${normalized[1]}${normalized[1]}${normalized[2]}${normalized[2]}${normalized[3]}${normalized[3]}`;
  }

  if (!/^#[0-9a-f]{6}$/.test(normalized)) return null;
  return normalized;
}

/**
 * Convert a hex color to HSL values.
 * @param {string} hex - The hex color string
 * @returns {{ h: number, s: number, l: number }} HSL values (h: 0-360, s/l: 0-1)
 * @throws {Error} If the hex color is invalid
 */
export function hexToHsl(hex) {
  const normalized = normalizeHex(hex);
  if (!normalized) throw new Error(`Invalid hex color: "${hex}"`);

  const r = parseInt(normalized.slice(1, 3), 16) / 255;
  const g = parseInt(normalized.slice(3, 5), 16) / 255;
  const b = parseInt(normalized.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  const l = (max + min) / 2;

  if (delta === 0) {
    return { h: 0, s: 0, l };
  }

  const s = delta / (1 - Math.abs(2 * l - 1));
  let h = 0;

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

  return { h, s, l };
}

/**
 * Get the base color name from a hex color.
 * @param {string} hex - The hex color string
 * @returns {string} Color name: "red", "green", "gray", etc.
 */
export function describeColor(hex) {
  const { h, s, l } = hexToHsl(hex);

  // Handle near-neutral colors (low saturation)
  if (s < SATURATION_NEUTRAL_THRESHOLD) {
    if (l < LIGHTNESS_BLACK_THRESHOLD) return "black";
    if (l > LIGHTNESS_WHITE_THRESHOLD) return "white";
    return "gray";
  }

  // Find color name from hue ranges
  for (const range of HUE_RANGES) {
    if (h < range.max) return range.name;
  }

  return "unknown";
}

/**
 * Get a descriptive color name with tone adjectives.
 * @param {string} hex - The hex color string
 * @returns {string} Description like "dark vibrant red" or "light muted blue"
 */
export function describeWithTone(hex) {
  const { s, l } = hexToHsl(hex);
  const base = describeColor(hex);
  const isNeutral = NEUTRAL_COLORS.has(base);

  const parts = [];

  // Add lightness adjective
  if (l <= LIGHTNESS_DARK_THRESHOLD) {
    parts.push("dark");
  } else if (l >= LIGHTNESS_LIGHT_THRESHOLD) {
    parts.push("light");
  }

  // Add saturation adjective (only for chromatic colors)
  if (!isNeutral) {
    if (s >= SATURATION_VIBRANT_THRESHOLD) {
      parts.push("vibrant");
    } else if (s <= SATURATION_MUTED_THRESHOLD) {
      parts.push("muted");
    }
  }

  parts.push(base);
  return parts.join(" ");
}

/**
 * Pick a random element from an array.
 * @param {Array} arr - The array to pick from
 * @returns {*} A random element, or undefined if array is empty/invalid
 */
export function pickRandom(arr) {
  if (!Array.isArray(arr) || arr.length === 0) return undefined;
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Find the most frequent hex color in an array.
 * Normalizes values and ignores invalid entries.
 * On ties, returns the first color that reached the highest count.
 * @param {string[]} hexArray - Array of hex color strings
 * @returns {string|undefined} The most common hex color, or undefined if none valid
 */
export function predominantColorHex(hexArray) {
  if (!Array.isArray(hexArray) || hexArray.length === 0) return undefined;

  const counts = new Map();
  let bestHex;
  let bestCount = 0;

  for (const raw of hexArray) {
    const normalized = normalizeHex(raw);
    if (!normalized) continue;

    const newCount = (counts.get(normalized) ?? 0) + 1;
    counts.set(normalized, newCount);

    if (newCount > bestCount) {
      bestCount = newCount;
      bestHex = normalized;
    }
  }

  return bestHex;
}

/**
 * Describe a color from an array using either the predominant or a random color.
 * @param {string[]} hexArray - Array of hex color strings
 * @param {Object} options - Configuration options
 * @param {"predominant"|"random"} [options.mode="predominant"] - Selection mode
 * @param {boolean} [options.withTone=true] - Whether to include tone adjectives
 * @returns {string} Color description, or "unknown" if no valid colors
 */
export function describeFromArray(hexArray, { mode = "predominant", withTone = true } = {}) {
  const chosenHex = mode === "random"
    ? pickRandom(hexArray)
    : predominantColorHex(hexArray);

  if (!chosenHex) return "unknown";

  return withTone ? describeWithTone(chosenHex) : describeColor(chosenHex);
}

