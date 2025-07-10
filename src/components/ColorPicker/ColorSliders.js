// ColorSliders.js
// Renders RGB and HSL sliders for fine-tuning the selected color.

import React, { useState, useEffect } from 'react';
import { hexToRgb, hexToHsl, rgbToHex, hslToHex } from '../utils/colorUtils';

/**
 * ColorSliders
 * @param {string} color - The current color (hex)
 * @param {function} onChange - Callback when the color changes
 * @param {boolean} modificationMode - Whether we're in palette modification mode
 */
const ColorSliders = ({ color, onChange, modificationMode = false }) => {
  const rgb = hexToRgb(color);
  const hsl = hexToHsl(color);

  // State for editable values
  const [editableRgb, setEditableRgb] = useState({ r: 0, g: 0, b: 0 });
  const [editableHsl, setEditableHsl] = useState({ h: 0, s: 0, l: 0 });

  // Update editable values when color changes
  useEffect(() => {
    if (rgb) {
      setEditableRgb({ r: rgb.r, g: rgb.g, b: rgb.b });
    }
    if (hsl) {
      setEditableHsl({ h: Math.round(hsl.h), s: Math.round(hsl.s), l: Math.round(hsl.l) });
    }
  }, [color]);

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

  // Handle RGB input changes
  const handleRgbInputChange = (component, value) => {
    const numValue = parseInt(value) || 0;
    const clampedValue = Math.max(0, Math.min(255, numValue));
    
    setEditableRgb(prev => ({ ...prev, [component]: clampedValue }));
    updateRgb(component, clampedValue);
  };

  // Handle HSL input changes
  const handleHslInputChange = (component, value) => {
    let numValue = parseInt(value) || 0;
    
    // Clamp based on component
    if (component === 'h') {
      numValue = Math.max(0, Math.min(360, numValue));
    } else {
      numValue = Math.max(0, Math.min(100, numValue));
    }
    
    setEditableHsl(prev => ({ ...prev, [component]: numValue }));
    updateHsl(component, numValue);
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
    <div className="space-y-2">
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
            <input
              type="text"
              value={editableRgb.r}
              onChange={(e) => handleRgbInputChange('r', e.target.value)}
              className="slider-value-input"
              style={{ width: '40px', textAlign: 'center' }}
            />
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
            <input
              type="text"
              value={editableRgb.g}
              onChange={(e) => handleRgbInputChange('g', e.target.value)}
              className="slider-value-input"
              style={{ width: '40px', textAlign: 'center' }}
            />
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
            <input
              type="text"
              value={editableRgb.b}
              onChange={(e) => handleRgbInputChange('b', e.target.value)}
              className="slider-value-input"
              style={{ width: '40px', textAlign: 'center' }}
            />
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
            <input
              type="text"
              value={editableHsl.h}
              onChange={(e) => handleHslInputChange('h', e.target.value)}
              className="slider-value-input"
              style={{ width: '40px', textAlign: 'center' }}
            />
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
            <input
              type="text"
              value={editableHsl.s}
              onChange={(e) => handleHslInputChange('s', e.target.value)}
              className="slider-value-input"
              style={{ width: '40px', textAlign: 'center' }}
            />
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
            <input
              type="text"
              value={editableHsl.l}
              onChange={(e) => handleHslInputChange('l', e.target.value)}
              className="slider-value-input"
              style={{ width: '40px', textAlign: 'center' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorSliders; 