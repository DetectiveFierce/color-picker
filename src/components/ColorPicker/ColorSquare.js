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
const ColorSquare = ({ hue = 0, color, onChange }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [canvasDims, setCanvasDims] = useState({ width: 320, height: 120 }); // default width, 120px tall

  // Resize canvas to match displayed size and device pixel ratio
  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current || !canvasRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      
      // Calculate available width within the container
      const availableWidth = Math.max(120, rect.width); // Minimum 120px width
      const height = 120; // Fixed height as requested
      
      setCanvasDims({ width: availableWidth, height });
      canvasRef.current.width = availableWidth * dpr;
      canvasRef.current.height = height * dpr;
      canvasRef.current.style.width = `${availableWidth}px`;
      canvasRef.current.style.height = `${height}px`;
    };
    
    handleResize();
    
    // Use ResizeObserver for more responsive resizing
    let resizeObserver;
    if (window.ResizeObserver && containerRef.current) {
      resizeObserver = new ResizeObserver(handleResize);
      resizeObserver.observe(containerRef.current);
    }
    
    // Fallback to window resize listener
    window.addEventListener('resize', handleResize);
    
    return () => {
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Draw the color rectangle and selection circle
  const drawAll = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const { width, height } = canvasDims;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, width * dpr, height * dpr);
    // Precompute top edge (white to hue)
    const topEdge = [];
    for (let x = 0; x < width * dpr; x++) {
      const t = x / (width * dpr - 1);
      const hueColor = hexToRgb(hslToHex(hue, 100, 50));
      const r = Math.round((1 - t) * 255 + t * hueColor.r);
      const g = Math.round((1 - t) * 255 + t * hueColor.g);
      const b = Math.round((1 - t) * 255 + t * hueColor.b);
      topEdge.push({ r, g, b });
    }
    for (let y = 0; y < height * dpr; y++) {
      const l = 1 - y / (height * dpr - 1);
      for (let x = 0; x < width * dpr; x++) {
        const r = Math.round((1 - l) * 0 + l * topEdge[x].r);
        const g = Math.round((1 - l) * 0 + l * topEdge[x].g);
        const b = Math.round((1 - l) * 0 + l * topEdge[x].b);
        ctx.fillStyle = rgbToHex(r, g, b);
        ctx.fillRect(x, y, 1, 1);
      }
    }
    // Draw selection circle
    const hsl = hexToHsl(color);
    if (hsl) {
      const x = (hsl.s / 100) * (width * dpr - 1);
      const y = (1 - hsl.l / 100) * (height * dpr - 1);
      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, 8 * dpr, 0, 2 * Math.PI);
      ctx.lineWidth = 2 * dpr;
      ctx.strokeStyle = getContrastColor(color);
      ctx.stroke();
      ctx.restore();
    }
  }, [hue, color, canvasDims]);

  useEffect(() => {
    drawAll();
  }, [drawAll, canvasDims]);

  // Handle mouse events for picking a color
  const handleMouse = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const { width, height } = canvasDims;
    const x = Math.max(0, Math.min(width - 1, (e.clientX - rect.left) ));
    const y = Math.max(0, Math.min(height - 1, (e.clientY - rect.top) ));
    const s = (x / (width - 1)) * 100;
    const l = 100 - (y / (height - 1)) * 100;
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

  return (
    <div 
      ref={containerRef} 
      style={{ 
        width: '100%', 
        height: '120px', 
        minHeight: '120px',
        maxWidth: '100%',
        overflow: 'hidden'
      }}
    >
      <canvas
        ref={canvasRef}
        style={{ 
          width: '100%', 
          height: '100%', 
          borderRadius: 8, 
          border: '1px solid #525252', 
          display: 'block',
          maxWidth: '100%'
        }}
        onMouseDown={handleMouseDown}
        className="color-square-canvas"
      />
    </div>
  );
};

export default ColorSquare; 