// ColorSliders.js
// Renders RGB and HSL sliders for fine-tuning the selected color.

import React from 'react';
import { hexToRgb, hexToHsl, rgbToHex, hslToHex } from '../utils/colorUtils';

/**
 * ColorSliders
 * @param {string} color - The current color (hex)
 * @param {function} onChange - Callback when the color changes
 */
const ColorSliders = ({ color, onChange }) => {
  const rgb = hexToRgb(color);
  const hsl = hexToHsl(color);

  if (!rgb || !hsl) return null;

  // Update color by changing one RGB component
  const updateRgb = (component, value) => {
    const newRgb = { ...rgb, [component]: value };
    onChange(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
  };

  // Update color by changing one HSL component
  const updateHsl = (component, value) => {
    const newHsl = { ...hsl, [component]: value };
    onChange(hslToHex(newHsl.h, newHsl.s, newHsl.l));
  };

  // Generate gradient backgrounds for each slider
  const getRgbGradient = (component) => {
    const baseColor = { ...rgb };
    baseColor[component] = 0;
    const startColor = rgbToHex(baseColor.r, baseColor.g, baseColor.b);
    baseColor[component] = 255;
    const endColor = rgbToHex(baseColor.r, baseColor.g, baseColor.b);
    return `linear-gradient(to right, ${startColor} 0%, ${endColor} 100%)`;
  };

  const getHueGradient = () => {
    return `linear-gradient(to right,
      #ff0000 0%, #ffff00 16.67%, #00ff00 33.33%,
      #00ffff 50%, #0000ff 66.67%, #ff00ff 83.33%, #ff0000 100%)`;
  };

  const getSaturationGradient = () => {
    const baseHsl = { ...hsl };
    const lowSat = hslToHex(baseHsl.h, 0, baseHsl.l);
    const highSat = hslToHex(baseHsl.h, 100, baseHsl.l);
    return `linear-gradient(to right, ${lowSat} 0%, ${highSat} 100%)`;
  };

  const getLightnessGradient = () => {
    const baseHsl = { ...hsl };
    const dark = hslToHex(baseHsl.h, baseHsl.s, 0);
    const mid = hslToHex(baseHsl.h, baseHsl.s, 50);
    const light = hslToHex(baseHsl.h, baseHsl.s, 100);
    return `linear-gradient(to right, ${dark} 0%, ${mid} 50%, ${light} 100%)`;
  };

  return (
    <div className="space-y-3">
      {/* RGB Sliders */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-neutral-200">RGB</label>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="slider-label red">R</span>
            <input
              type="range"
              min="0"
              max="255"
              value={rgb.r}
              onChange={(e) => updateRgb('r', parseInt(e.target.value))}
              className="color-slider flex-1"
              style={{ background: getRgbGradient('r') }}
            />
            <span className="slider-value">{rgb.r}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="slider-label green">G</span>
            <input
              type="range"
              min="0"
              max="255"
              value={rgb.g}
              onChange={(e) => updateRgb('g', parseInt(e.target.value))}
              className="color-slider flex-1"
              style={{ background: getRgbGradient('g') }}
            />
            <span className="slider-value">{rgb.g}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="slider-label blue">B</span>
            <input
              type="range"
              min="0"
              max="255"
              value={rgb.b}
              onChange={(e) => updateRgb('b', parseInt(e.target.value))}
              className="color-slider flex-1"
              style={{ background: getRgbGradient('b') }}
            />
            <span className="slider-value">{rgb.b}</span>
          </div>
        </div>
      </div>
      {/* HSL Sliders */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-neutral-200">HSL</label>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="slider-label yellow">H</span>
            <input
              type="range"
              min="0"
              max="360"
              value={hsl.h}
              onChange={(e) => updateHsl('h', parseInt(e.target.value))}
              className="color-slider flex-1"
              style={{ background: getHueGradient() }}
            />
            <span className="slider-value">{Math.round(hsl.h)}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="slider-label purple">S</span>
            <input
              type="range"
              min="0"
              max="100"
              value={hsl.s}
              onChange={(e) => updateHsl('s', parseInt(e.target.value))}
              className="color-slider flex-1"
              style={{ background: getSaturationGradient() }}
            />
            <span className="slider-value">{Math.round(hsl.s)}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="slider-label orange">L</span>
            <input
              type="range"
              min="0"
              max="100"
              value={hsl.l}
              onChange={(e) => updateHsl('l', parseInt(e.target.value))}
              className="color-slider flex-1"
              style={{ background: getLightnessGradient() }}
            />
            <span className="slider-value">{Math.round(hsl.l)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorSliders; 