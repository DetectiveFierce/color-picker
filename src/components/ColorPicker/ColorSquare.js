// ColorSquare.js
// Renders the color picking square for a given hue.
// X axis: saturation, Y axis: lightness. Top left: white, top right: hue, bottom left: black.

import React, { useRef, useEffect, useCallback, useState } from 'react';
import { hexToRgb, hslToHex, rgbToHex, hexToHsl, getContrastColor } from '../utils/colorUtils';

/**
 * ColorSquare
 * @param {number} hue - The hue to use for the right edge (0-360)
 * @param {number} size - The width/height of the square in px
 * @param {string} color - The currently selected color (hex)
 * @param {function} onChange - Callback when a color is picked
 */
const ColorSquare = ({ hue = 0, size = 180, color, onChange }) => {
  const canvasRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  // Draw the color square: top left is white, top right is hue, bottom left is black
  const drawColorSquare = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    // Precompute top edge (white to hue)
    const topEdge = [];
    for (let x = 0; x < size; x++) {
      const t = x / (size - 1);
      // Interpolate in RGB between white and the hue color
      const hueColor = hexToRgb(hslToHex(hue, 100, 50));
      const r = Math.round((1 - t) * 255 + t * hueColor.r);
      const g = Math.round((1 - t) * 255 + t * hueColor.g);
      const b = Math.round((1 - t) * 255 + t * hueColor.b);
      topEdge.push({ r, g, b });
    }
    for (let y = 0; y < size; y++) {
      const l = 1 - y / (size - 1); // 1 at top, 0 at bottom
      for (let x = 0; x < size; x++) {
        // Interpolate in RGB between black and topEdge[x]
        const r = Math.round((1 - l) * 0 + l * topEdge[x].r);
        const g = Math.round((1 - l) * 0 + l * topEdge[x].g);
        const b = Math.round((1 - l) * 0 + l * topEdge[x].b);
        ctx.fillStyle = rgbToHex(r, g, b);
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }, [hue, size]);

  useEffect(() => {
    drawColorSquare();
  }, [drawColorSquare]);

  // Handle mouse events for picking a color
  const handleMouse = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = Math.max(0, Math.min(size - 1, e.clientX - rect.left));
    const y = Math.max(0, Math.min(size - 1, e.clientY - rect.top));
    const s = (x / (size - 1)) * 100;
    const l = 100 - (y / (size - 1)) * 100;
    onChange(hslToHex(hue, s, l));
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    handleMouse(e);
  };
  const handleMouseMove = (e) => {
    if (isDragging) handleMouse(e);
  };
  const handleMouseUp = () => setIsDragging(false);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  // Draw a circle for the current color position
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const hsl = hexToHsl(color);
    if (!hsl) return;
    const x = (hsl.s / 100) * (size - 1);
    const y = (1 - hsl.l / 100) * (size - 1);
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, 8, 0, 2 * Math.PI);
    ctx.lineWidth = 2;
    ctx.strokeStyle = getContrastColor(color);
    ctx.stroke();
    ctx.restore();
  }, [color, size, hue]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      onMouseDown={handleMouseDown}
      className="color-square-canvas"
      style={{ cursor: 'crosshair', borderRadius: 8, border: '1px solid #525252' }}
    />
  );
};

export default ColorSquare; 