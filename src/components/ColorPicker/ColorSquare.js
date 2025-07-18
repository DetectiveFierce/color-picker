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
  const [canvasDims, setCanvasDims] = useState({ width: 320, height: 120 });
  const [dpr, setDpr] = useState(1);

  // Get device pixel ratio and handle changes
  useEffect(() => {
    const updateDpr = () => {
      const newDpr = window.devicePixelRatio || 1;
      setDpr(newDpr);
    };

    updateDpr();
    window.addEventListener('resize', updateDpr);
    
    // Listen for zoom changes
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(resolution: 1dppx)');
      mediaQuery.addEventListener('change', updateDpr);
    }

    return () => {
      window.removeEventListener('resize', updateDpr);
      if (window.matchMedia) {
        const mediaQuery = window.matchMedia('(resolution: 1dppx)');
        mediaQuery.removeEventListener('change', updateDpr);
      }
    };
  }, []);

  // Resize canvas to match displayed size and device pixel ratio
  useEffect(() => {
    let resizeTimeout;
    
    const handleResize = () => {
      if (!containerRef.current || !canvasRef.current) return;
      
      // Clear any pending resize timeout
      if (resizeTimeout) {
        clearTimeout(resizeTimeout);
      }
      
      // Debounce resize events to prevent ResizeObserver loop errors
      resizeTimeout = setTimeout(() => {
        const rect = containerRef.current.getBoundingClientRect();
        
        // Calculate available width within the container
        const availableWidth = Math.max(120, rect.width); // Minimum 120px width
        const height = 120; // Fixed height as requested
        
        setCanvasDims({ width: availableWidth, height });
        
        // Set canvas size accounting for device pixel ratio
        canvasRef.current.width = availableWidth * dpr;
        canvasRef.current.height = height * dpr;
        canvasRef.current.style.width = `${availableWidth}px`;
        canvasRef.current.style.height = `${height}px`;
        
        // Set canvas context scale for HiDPI
        const ctx = canvasRef.current.getContext('2d');
        ctx.scale(dpr, dpr);
      }, 16); // ~60fps debounce
    };
    
    // Initial setup - draw immediately with default dimensions
    if (canvasRef.current) {
      const defaultWidth = 320;
      const defaultHeight = 120;
      
      canvasRef.current.width = defaultWidth * dpr;
      canvasRef.current.height = defaultHeight * dpr;
      canvasRef.current.style.width = `${defaultWidth}px`;
      canvasRef.current.style.height = `${defaultHeight}px`;
      
      const ctx = canvasRef.current.getContext('2d');
      ctx.scale(dpr, dpr);
      
      setCanvasDims({ width: defaultWidth, height: defaultHeight });
    }
    
    // Then handle resize
    handleResize();
    
    // Use ResizeObserver for more responsive resizing with error handling
    let resizeObserver;
    if (window.ResizeObserver && containerRef.current) {
      try {
        resizeObserver = new ResizeObserver((entries) => {
          // Prevent ResizeObserver loop errors by using requestAnimationFrame
          window.requestAnimationFrame(() => {
            if (!Array.isArray(entries) || entries.length === 0) return;
            handleResize();
          });
        });
        resizeObserver.observe(containerRef.current);
      } catch (error) {
        console.warn('ResizeObserver not supported, falling back to window resize');
      }
    }
    
    // Fallback to window resize listener
    window.addEventListener('resize', handleResize);
    
    return () => {
      if (resizeTimeout) {
        clearTimeout(resizeTimeout);
      }
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [dpr]);

  // Draw the color rectangle and selection circle
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Use default dimensions if not set yet
    const width = canvasDims.width || 320;
    const height = canvasDims.height || 120;
    const ctx = canvas.getContext('2d');
    
    // Clear the canvas and fill with solid background
    ctx.clearRect(0, 0, width * dpr, height * dpr);
    
    // Reset transform and scale for HiDPI
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
    
    // Fill entire canvas with solid background to prevent transparency
    ctx.fillStyle = '#404040';
    ctx.fillRect(0, 0, width, height);
    
    // Precompute top edge (white to hue)
    const topEdge = [];
    for (let x = 0; x < width; x++) {
      const t = x / (width - 1);
      const hueColor = hexToRgb(hslToHex(hue, 100, 50));
      const r = Math.round((1 - t) * 255 + t * hueColor.r);
      const g = Math.round((1 - t) * 255 + t * hueColor.g);
      const b = Math.round((1 - t) * 255 + t * hueColor.b);
      topEdge.push({ r, g, b });
    }
    
    // Draw the color rectangle
    for (let y = 0; y < height; y++) {
      const l = 1 - y / (height - 1);
      for (let x = 0; x < width; x++) {
        const r = Math.round((1 - l) * 0 + l * topEdge[x].r);
        const g = Math.round((1 - l) * 0 + l * topEdge[x].g);
        const b = Math.round((1 - l) * 0 + l * topEdge[x].b);
        ctx.fillStyle = rgbToHex(r, g, b);
        ctx.fillRect(x, y, 1, 1);
      }
    }
    
    // Draw selection circle with HiDPI-aware sizing
    const hsl = hexToHsl(color);
    if (hsl) {
      const x = (hsl.s / 100) * (width - 1);
      const y = (1 - hsl.l / 100) * (height - 1);
      
      ctx.save();
      ctx.beginPath();
      
      // Scale circle size based on DPR for crisp rendering
      const circleRadius = Math.max(6, 8 / dpr);
      ctx.arc(x, y, circleRadius, 0, 2 * Math.PI);
      
      // Draw outer ring for better visibility
      ctx.lineWidth = Math.max(1, 2 / dpr);
      ctx.strokeStyle = getContrastColor(color);
      ctx.stroke();
      
      // Draw inner white ring for better contrast
      ctx.beginPath();
      ctx.arc(x, y, circleRadius - Math.max(1, 2 / dpr), 0, 2 * Math.PI);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = Math.max(0.5, 1 / dpr);
      ctx.stroke();
      
      ctx.restore();
    }
  }, [hue, color, canvasDims.width, canvasDims.height, dpr]);

  // Force initial draw when component mounts
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Set up canvas immediately with default dimensions
    const defaultWidth = 320;
    const defaultHeight = 120;
    
    canvas.width = defaultWidth * dpr;
    canvas.height = defaultHeight * dpr;
    canvas.style.width = `${defaultWidth}px`;
    canvas.style.height = `${defaultHeight}px`;
    
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    
    // Draw immediately
    ctx.clearRect(0, 0, defaultWidth * dpr, defaultHeight * dpr);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
    
    // Fill with solid background
    ctx.fillStyle = '#404040';
    ctx.fillRect(0, 0, defaultWidth, defaultHeight);
    
    // Draw the color gradient
    const topEdge = [];
    for (let x = 0; x < defaultWidth; x++) {
      const t = x / (defaultWidth - 1);
      const hueColor = hexToRgb(hslToHex(hue, 100, 50));
      const r = Math.round((1 - t) * 255 + t * hueColor.r);
      const g = Math.round((1 - t) * 255 + t * hueColor.g);
      const b = Math.round((1 - t) * 255 + t * hueColor.b);
      topEdge.push({ r, g, b });
    }
    
    for (let y = 0; y < defaultHeight; y++) {
      const l = 1 - y / (defaultHeight - 1);
      for (let x = 0; x < defaultWidth; x++) {
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
      const x = (hsl.s / 100) * (defaultWidth - 1);
      const y = (1 - hsl.l / 100) * (defaultHeight - 1);
      
      ctx.save();
      ctx.beginPath();
      
      const circleRadius = Math.max(6, 8 / dpr);
      ctx.arc(x, y, circleRadius, 0, 2 * Math.PI);
      
      ctx.lineWidth = Math.max(1, 2 / dpr);
      ctx.strokeStyle = getContrastColor(color);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.arc(x, y, circleRadius - Math.max(1, 2 / dpr), 0, 2 * Math.PI);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = Math.max(0.5, 1 / dpr);
      ctx.stroke();
      
      ctx.restore();
    }
  }, []); // Only run once on mount

  // Handle mouse/touch events for picking a color
  const handlePointer = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const { width, height } = canvasDims;
    
    // Get pointer coordinates (works for both mouse and touch)
    const clientX = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
    const clientY = e.clientY || (e.touches && e.touches[0] ? e.touches[0].clientY : 0);
    
    const x = Math.max(0, Math.min(width - 1, (clientX - rect.left)));
    const y = Math.max(0, Math.min(height - 1, (clientY - rect.top)));
    
    const s = (x / (width - 1)) * 100;
    const l = 100 - (y / (height - 1)) * 100;
    
    onChange(hslToHex(hue, s, l));
  };

  const handlePointerDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    handlePointer(e);
  };

  const handlePointerMove = (e) => {
    if (isDragging) {
      e.preventDefault();
      handlePointer(e);
    }
  };

  const handlePointerUp = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  // Handle both mouse and touch events
  useEffect(() => {
    if (isDragging) {
      // Mouse events
      document.addEventListener('mousemove', handlePointerMove);
      document.addEventListener('mouseup', handlePointerUp);
      
      // Touch events
      document.addEventListener('touchmove', handlePointerMove, { passive: false });
      document.addEventListener('touchend', handlePointerUp, { passive: false });
      
      return () => {
        document.removeEventListener('mousemove', handlePointerMove);
        document.removeEventListener('mouseup', handlePointerUp);
        document.removeEventListener('touchmove', handlePointerMove);
        document.removeEventListener('touchend', handlePointerUp);
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
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      <canvas
        ref={canvasRef}
        style={{ 
          width: '100%', 
          height: '100%', 
          borderRadius: 'clamp(6px, 1vw, 8px)', 
          border: 'clamp(1px, 0.2vw, 2px) solid #525252', 
          display: 'block',
          maxWidth: '100%',
          cursor: 'crosshair',
          touchAction: 'none', // Prevent default touch behaviors
          backgroundColor: '#404040', // Ensure canvas element is opaque
          /* Ensure crisp rendering on HiDPI */
          imageRendering: '-webkit-optimize-contrast',
          imageRendering: 'crisp-edges'
        }}
        onMouseDown={handlePointerDown}
        onTouchStart={handlePointerDown}
        className="color-square-canvas"
      />
    </div>
  );
};

export default ColorSquare; 