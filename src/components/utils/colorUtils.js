// Color conversion and utility functions for the color picker

/**
 * Converts a hex color string to an RGB object.
 * @param {string} hex - The hex color string (e.g. '#ff0000').
 * @returns {{r: number, g: number, b: number} | null}
 */
export function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Converts RGB values to a hex color string.
 * @param {number} r - Red (0-255)
 * @param {number} g - Green (0-255)
 * @param {number} b - Blue (0-255)
 * @returns {string} Hex color string
 */
export function rgbToHex(r, g, b) {
  return (
    "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
  );
}

/**
 * Converts a hex color string to an HSL object.
 * @param {string} hex - The hex color string.
 * @returns {{h: number, s: number, l: number} | null}
 */
export function hexToHsl(hex) {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l;
  l = (max + min) / 2;
  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
      default:
        h = 0;
    }
    h /= 6;
  }
  return { h: h * 360, s: s * 100, l: l * 100 };
}

/**
 * Converts HSL values to a hex color string.
 * @param {number} h - Hue (0-360)
 * @param {number} s - Saturation (0-100)
 * @param {number} l - Lightness (0-100)
 * @returns {string} Hex color string
 */
export function hslToHex(h, s, l) {
  h = h / 360;
  s = s / 100;
  l = l / 100;
  const hue2rgb = (p, q, t) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const r = Math.round(hue2rgb(p, q, h + 1 / 3) * 255);
  const g = Math.round(hue2rgb(p, q, h) * 255);
  const b = Math.round(hue2rgb(p, q, h - 1 / 3) * 255);
  return rgbToHex(r, g, b);
}

/**
 * Gets the contrast color (black or white) for a given hex color.
 * @param {string} hex - The hex color string.
 * @returns {string} '#000000' or '#ffffff'
 */
export function getContrastColor(hex) {
  const rgb = hexToRgb(hex);
  if (!rgb) return '#000000';
  
  // Calculate relative luminance
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminance > 0.5 ? '#000000' : '#ffffff';
}

// Color naming system word lists
const FIRST_WORDS = [
  'Deep', 'Dark', 'Dusky', 'Muted', 'Dull', 'Dusty', 'Smoky', 'Subdued',
  'Earthy', 'Soft', 'Faded', 'Washed', 'Chalky', 'Misty', 'Hazy', 'Airy',
  'Light', 'Pale', 'Bright', 'Intense'
];

const SECOND_WORDS = [
  'Red', 'Burgundy', 'Scarlet', 'Salmon', 'Orange', 'Rust', 'Tangerine', 'Peach',
  'Yellow', 'Ochre', 'Goldenrod', 'Sand', 'Green', 'Forest', 'Olive', 'Mint',
  'Blue', 'Navy', 'Cobalt', 'Sky', 'Purple', 'Eggplant', 'Orchid', 'Lavender',
  'Pink', 'Rosewood', 'Blush', 'Bubblegum',
  'Magenta', 'Fuchsia', 'Violet', 'Mauve', // Added for magenta/violet range
  'Brown', 'Umber', 'Chestnut', 'Beige',
  'Black', 'Charcoal', 'Onyx', 'Slate', 'White', 'Ivory', 'Alabaster', 'Snow',
  'Gray', 'Gunmetal', 'Ash', 'Silver', 'Cyan', 'Teal', 'Aqua', 'Ice'
];

/**
 * Generates a funny color name based on HSL values.
 * @param {number} h - Hue (0-360)
 * @param {number} s - Saturation (0-100)
 * @param {number} l - Lightness (0-100)
 * @param {Array} existingNames - Array of existing color names to avoid duplicates
 * @returns {string} Generated color name
 */
export function generateColorName(h, s, l, existingNames = []) {
  // First word logic
  let firstWordCandidates = [];
  if (s < 35 && l < 35) {
    // Very low sat, very dark
    firstWordCandidates = ['Smoky', 'Dusky', 'Muted', 'Dull', 'Dusty', 'Subdued', 'Washed', 'Chalky'];
  } else if (s < 35 && l > 65) {
    // Very low sat, very light
    firstWordCandidates = ['Chalky', 'Misty', 'Hazy', 'Muted', 'Dull', 'Dusty', 'Subdued', 'Washed'];
  } else if (s < 35) {
    // Low sat, any lightness
    firstWordCandidates = ['Muted', 'Dull', 'Dusty', 'Subdued', 'Washed', 'Chalky'];
  } else if (s > 65 && l > 65) {
    // High sat, high light
    firstWordCandidates = ['Light', 'Airy'];
  } else if (s > 65 && l > 40 && l < 65) {
    // High sat, medium light
    firstWordCandidates = ['Bright', 'Intense'];
  } else if (l < 35 && s > 65) {
    // Low light, high sat
    firstWordCandidates = ['Deep', 'Dark'];
  } else if (l < 35) {
    firstWordCandidates = ['Deep', 'Dark', 'Dusky'];
  } else if (l > 65) {
    firstWordCandidates = ['Light', 'Airy', 'Pale'];
  } else {
    firstWordCandidates = ['Soft', 'Faded', 'Earthy'];
  }
  // Pick one based on hue for some variety
  let firstWord = firstWordCandidates[Math.floor((h / 360) * firstWordCandidates.length)] || 'Soft';

  // Second word logic (hue)
  let secondWord = 'Gray';
  if ((h >= 345 && h <= 360) || (h >= 0 && h < 15)) {
    secondWord = 'Red';
  } else if (h >= 15 && h < 36) {
    secondWord = 'Orange';
  } else if (h >= 36 && h < 51) {
    secondWord = 'Goldenrod';
  } else if (h >= 51 && h < 66) {
    secondWord = 'Yellow';
  } else if (h >= 66 && h < 81) {
    secondWord = 'Chartreuse';
  } else if (h >= 81 && h < 111) {
    secondWord = 'Lime';
  } else if (h >= 111 && h < 151) {
    secondWord = 'Green';
  } else if (h >= 151 && h < 201) {
    secondWord = 'Teal';
  } else if (h >= 201 && h < 221) {
    secondWord = 'Cerulean';
  } else if (h >= 221 && h < 256) {
    secondWord = 'Blue';
  } else if (h >= 256 && h < 271) {
    secondWord = 'Indigo';
  } else if (h >= 271 && h < 286) {
    secondWord = 'Violet';
  } else if (h >= 286 && h < 301) {
    secondWord = 'Purple';
  } else if (h >= 301 && h < 325) {
    secondWord = 'Magenta';
  } else if (h >= 325 && h < 345) {
    secondWord = 'Pink';
  }

  const baseName = `${firstWord} ${secondWord}`;
  let finalName = baseName;
  let counter = 1;
  while (existingNames.includes(finalName)) {
    finalName = `${baseName} ${counter}`;
    counter++;
  }
  return finalName;
} 