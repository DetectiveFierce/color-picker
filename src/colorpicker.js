import React, { useState, useEffect, useRef, useCallback } from "react";
import { Plus, Trash2, Save, X, RotateCcw, Pencil, ChevronDown, ChevronRight, Palette, Sparkles, Shuffle, Copy, ArrowRight, XCircle } from "lucide-react";
import "./ColorPicker.css"; // Import the CSS file
// Color conversion and utility functions
import { hexToRgb, rgbToHex, hexToHsl, hslToHex, getContrastColor, generateColorName } from "./components/utils/colorUtils";
import ColorSquare from "./components/ColorPicker/ColorSquare";
import ColorSliders from "./components/ColorPicker/ColorSliders";

// Add CSS for the color cycling animation
const colorCycleStyles = `
  @keyframes colorCycle {
    0% { color: #ff0000; } /* Red */
    16.666% { color: #ff8000; } /* Orange */
    33.333% { color: #ffff00; } /* Yellow */
    50% { color: #00ff00; } /* Green */
    66.666% { color: #0080ff; } /* Blue */
    83.333% { color: #8000ff; } /* Purple */
    100% { color: #ff0000; } /* Back to red */
  }
  
  @keyframes borderColorCycle {
    0% { border-color: #ff0000; } /* Red */
    16.666% { border-color: #ff8000; } /* Orange */
    33.333% { border-color: #ffff00; } /* Yellow */
    50% { border-color: #00ff00; } /* Green */
    66.666% { border-color: #0080ff; } /* Blue */
    83.333% { border-color: #8000ff; } /* Purple */
    100% { border-color: #ff0000; } /* Back to red */
  }
  
  @keyframes paletteSelectionBorder {
    0% { border-color: #ff0000; box-shadow: 0 0 20px rgba(255, 0, 0, 0.6); } /* Red */
    16.666% { border-color: #ff8000; box-shadow: 0 0 20px rgba(255, 128, 0, 0.6); } /* Orange */
    33.333% { border-color: #ffff00; box-shadow: 0 0 20px rgba(255, 255, 0, 0.6); } /* Yellow */
    50% { border-color: #00ff00; box-shadow: 0 0 20px rgba(0, 255, 0, 0.6); } /* Green */
    66.666% { border-color: #0080ff; box-shadow: 0 0 20px rgba(0, 128, 255, 0.6); } /* Blue */
    83.333% { border-color: #8000ff; box-shadow: 0 0 20px rgba(128, 0, 255, 0.6); } /* Purple */
    100% { border-color: #ff0000; box-shadow: 0 0 20px rgba(255, 0, 0, 0.6); } /* Back to red */
  }
  
  .color-cycle-text {
    animation: colorCycle 3s linear infinite;
    font-weight: bold;
    font-style: italic;
  }
  
  .color-cycle-border {
    animation: borderColorCycle 3s linear infinite;
    border-width: 3px !important;
    border-style: solid !important;
  }
  
  .palette-selection-border {
    animation: paletteSelectionBorder 2s linear infinite;
    border-width: 4px !important;
    border-style: solid !important;
    transform: scale(1.05);
  }
  
  @keyframes menuLineGrow {
    0% { 
      height: 0;
      opacity: 0;
    }
    100% { 
      height: 256px;
      opacity: 1;
    }
  }
  
  @keyframes menuItemReveal {
    0% { 
      opacity: 0;
    }
    100% { 
      opacity: 1;
    }
  }
  
  .menu-line-growing {
    animation: menuLineGrow 0.4s ease-out forwards;
  }
  
  .menu-item-reveal {
    animation: menuItemReveal 0.15s ease-out forwards;
  }
  
  .menu-item-hidden {
    opacity: 0;
  }
  
  .menu-item-delay-1 { animation-delay: 0.1s; }
  .menu-item-delay-2 { animation-delay: 0.2s; }
  .menu-item-delay-3 { animation-delay: 0.3s; }
  .menu-item-delay-4 { animation-delay: 0.4s; }
  .menu-item-delay-5 { animation-delay: 0.5s; }
  
  .input-hex:focus,
  .input-palette-name:focus {
    animation: borderColorCycle 3s linear infinite;
    border-width: 2px !important;
    border-style: solid !important;
    outline: none !important;
  }
  
  .slider-value-input {
    background: #262626;
    border: 1px solid #525252;
    border-radius: 4px;
    color: #f3f4f6;
    font-size: 12px;
    padding: 2px 4px;
    text-align: center;
    transition: all 0.2s ease;
  }
  
  .slider-value-input:focus {
    animation: borderColorCycle 3s linear infinite;
    border-width: 2px !important;
    border-style: solid !important;
    outline: none !important;
  }
  
  /* Resize handle - centered on edge for easy grabbing */
  .resize-handle {
    position: absolute;
    top: 0;
    right: -12px;
    width: 24px;
    height: 100%;
    cursor: ew-resize;
    background: transparent;
    z-index: 10;
    pointer-events: auto;
  }
  
  .resize-handle:hover ~ .picker-content {
    border-right: 3px solid;
    animation: borderColorCycle 3s linear infinite;
  }
  
  /* Prevent text selection during resize */
  .resizing {
    user-select: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
  }
`;

// Inject the styles into the document head
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = colorCycleStyles;
  document.head.appendChild(styleElement);
}

// Custom hook to measure text and determine if it fits
const useTextFit = (text, containerRef) => {
  const [fontSize, setFontSize] = useState(12);
  const [shouldShow, setShouldShow] = useState(true);
  const [wrappedText, setWrappedText] = useState(text);

  useEffect(() => {
    if (!containerRef.current || !text) {
      setShouldShow(false);
      return;
    }

    const container = containerRef.current;
    const testDiv = document.createElement('div');
    testDiv.style.position = 'absolute';
    testDiv.style.visibility = 'hidden';
    testDiv.style.whiteSpace = 'normal';
    testDiv.style.wordBreak = 'break-word';
    testDiv.style.hyphens = 'auto';
    testDiv.style.lineHeight = '1';
    testDiv.style.textAlign = 'center';
    testDiv.style.fontFamily = window.getComputedStyle(container).fontFamily;
    testDiv.style.fontWeight = window.getComputedStyle(container).fontWeight;
    testDiv.textContent = text;
    
    document.body.appendChild(testDiv);
    
    const containerRect = container.getBoundingClientRect();
    const containerWidth = containerRect.width - 8; // Account for padding
    const containerHeight = containerRect.height - 8;
    
    let currentFontSize = 11;
    let fits = false;
    let needsWrapping = false;
    
    // Try to find the largest font size that fits
    while (currentFontSize >= 8) { // Increased minimum from 6 to 8
      testDiv.style.fontSize = `${currentFontSize}px`;
      // Force wrapping by setting a narrower width - this encourages multi-line
      const wrapWidth = Math.min(containerWidth, containerWidth * 0.8);
      testDiv.style.width = `${wrapWidth}px`;
      
      // Force a reflow to get accurate measurements
      // eslint-disable-next-line no-unused-expressions
      testDiv.offsetHeight;
      
      const textRect = testDiv.getBoundingClientRect();
      
      if (textRect.height <= containerHeight) {
        fits = true;
        // Check if text actually wrapped (height is greater than single line)
        const singleLineHeight = currentFontSize; // Approximate single line height
        needsWrapping = textRect.height > singleLineHeight * 1.2; // 20% tolerance
        break;
      }
      currentFontSize -= 1;
    }
    
    document.body.removeChild(testDiv);
    
    if (fits) {
      setFontSize(currentFontSize);
      setShouldShow(true);
      // Remove dash when wrapping
      setWrappedText(text);
    } else {
      setShouldShow(false);
    }
  }, [text, containerRef]);

  return { fontSize, shouldShow, wrappedText };
};

// Component for text that fits within its container
const FittedText = ({ text, color, className = "" }) => {
  const containerRef = useRef(null);
  // Special case: force split for 'Goldenrod'
  let displayText = text;
  if (typeof text === 'string' && text.toLowerCase().includes('goldenrod')) {
    displayText = text.replace(/Goldenrod/i, 'Golden-\nrod');
  }
  const { fontSize, shouldShow, wrappedText } = useTextFit(displayText, containerRef);

  if (!shouldShow || !text) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 flex items-center justify-center font-medium text-center p-1 overflow-hidden ${className}`}
      style={{ color }}
    >
      <div 
        style={{ 
          fontSize: `${fontSize}px`,
          lineHeight: '1',
          wordBreak: 'break-word',
          hyphens: 'auto',
          width: '100%',
          maxWidth: '100%'
        }}
      >
        {wrappedText.split('\n').map((line, i) => (
          <React.Fragment key={i}>
            {line}
            {i < wrappedText.split('\n').length - 1 && <br />}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

// Component for individual menu items with sequential animation
const MenuItem = ({ icon: Icon, text, onClick, isVisible, onAnimationComplete, index }) => {
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (isVisible && !hasAnimated) {
      const timer = setTimeout(() => {
        setHasAnimated(true);
        onAnimationComplete();
      }, 150); // Animation duration (halved from 300ms)
      return () => clearTimeout(timer);
    }
  }, [isVisible, hasAnimated, onAnimationComplete]);

  if (!isVisible) return null;

  // Calculate position based on index - each item is positioned lower
  const bottomPosition = -20 + (index * 61); // Start at -20px, each item 55px lower

  return (
    <div className="flex items-center justify-end space-x-3 mb-6" style={{ position: 'absolute', bottom: `${bottomPosition}px`, right: '0' }}>
      <button
        onClick={onClick}
        className="px-3 py-2 bg-neutral-800/90 backdrop-blur-sm border border-neutral-600 rounded-lg text-sm text-neutral-100 hover:bg-neutral-700/90 transition-all duration-200 hover:scale-105 flex items-center space-x-2 menu-item-reveal"
        style={{ transform: 'translateX(-40px)' }}
      >
        <Icon size={14} />
        <span>{text}</span>
      </button>
      <div className="w-3 h-3 bg-purple-500 rounded-full shadow-lg" style={{ position: 'absolute', right: '28px', transform: 'translateX(50%)' }}></div>
    </div>
  );
};

const ColorPickerApp = () => {
  const [currentColor, setCurrentColor] = useState("#ff0000");
  const [palettes, setPalettes] = useState([]);
  const [draggedColor, setDraggedColor] = useState(null);
  const [draggedFrom, setDraggedFrom] = useState(null);
  const [editingChip, setEditingChip] = useState(null);
  const [newPaletteName, setNewPaletteName] = useState("");
  const [showNewPaletteInput, setShowNewPaletteInput] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editNameValue, setEditNameValue] = useState("");
  const nameInputRef = useRef(null);
  // Track the original color for cancel
  const [originalColor, setOriginalColor] = useState(null);
  // Track if we should use compact layout
  const [useCompactLayout, setUseCompactLayout] = useState(false);
  const [rgbValues, setRgbValues] = useState({ r: 255, g: 0, b: 0 });
  const [normalizedRgbValues, setNormalizedRgbValues] = useState({ r: 1.000, g: 0.000, b: 0.000 });
  
  // Generate dropdown state
  const [showGenerateDropdown, setShowGenerateDropdown] = useState(false);
  const [showPaletteSelector, setShowPaletteSelector] = useState(false);
  const [selectedGenerationType, setSelectedGenerationType] = useState(null);
  const [hoveredPaletteId, setHoveredPaletteId] = useState(null);
  const [paletteSelectionMode, setPaletteSelectionMode] = useState(false);
  const [menuAnimationState, setMenuAnimationState] = useState('closed'); // 'closed', 'opening', 'open'
  const [visibleMenuItems, setVisibleMenuItems] = useState(0); // Track how many menu items are visible
  const [dragOverTarget, setDragOverTarget] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [paletteToDelete, setPaletteToDelete] = useState(null);
  
  // New state for "Create new palette from existing" mode
  const [paletteModificationMode, setPaletteModificationMode] = useState(false);
  const [selectedPaletteForModification, setSelectedPaletteForModification] = useState(null);
  const [modifiedPaletteColors, setModifiedPaletteColors] = useState([]);
  const [showModificationDialog, setShowModificationDialog] = useState(false);
  
  // New state for delta-based palette modification
  const [originalPaletteColors, setOriginalPaletteColors] = useState([]);
  const [sliderDeltas, setSliderDeltas] = useState({ h: 0, s: 0, l: 0 });
  const [neutralColor, setNeutralColor] = useState("#808080"); // Center gray color for neutral sliders
  const [preservedPickerWidth, setPreservedPickerWidth] = useState(null); // Preserve picker width during modification
  
  // Resize state
  const [pickerWidth, setPickerWidth] = useState(null); // null means auto width
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStartX, setResizeStartX] = useState(0);
  const [resizeStartWidth, setResizeStartWidth] = useState(0);
  
  // Palette expansion state
  const [expandedPalettes, setExpandedPalettes] = useState(new Set());
  
  // Refs for dropdown handling
  const generateDropdownRef = useRef(null);
  const pickerContainerRef = useRef(null);
  
  // Constants for localStorage
  const STORAGE_KEY = "colorPalettes";

  // Load palettes from localStorage on component mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      console.log("Loading from localStorage:", saved ? "found data" : "no data");
      if (!saved) {
        // Only set default if nothing is saved at all
        const defaultPalette = {
          id: Date.now(),
          name: "Default Palette",
          colors: [
            { id: 1, hex: "#ff0000", name: "Red" },
            { id: 2, hex: "#00ff00", name: "Green" },
            { id: 3, hex: "#0000ff", name: "Blue" },
          ],
        };
        console.log("Creating default palette:", defaultPalette);
        setPalettes([defaultPalette]);
        // Save the default palette to localStorage immediately
        localStorage.setItem(STORAGE_KEY, JSON.stringify([defaultPalette]));
        console.log("Saved default palette to localStorage");
      } else {
        const savedPalettes = JSON.parse(saved);
        console.log("Loaded saved palettes:", savedPalettes.length, "palettes");
        setPalettes(savedPalettes);
      }
    } catch (error) {
      console.error("Error loading palettes:", error);
      // fallback
      const defaultPalette = {
        id: Date.now(),
        name: "Default Palette",
        colors: [
          { id: 1, hex: "#ff0000", name: "Red" },
          { id: 2, hex: "#00ff00", name: "Green" },
          { id: 3, hex: "#0000ff", name: "Blue" },
        ],
      };
      setPalettes([defaultPalette]);
      // Save the default palette to localStorage immediately even in error case
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([defaultPalette]));
      } catch (saveError) {
        console.error("Error saving default palette:", saveError);
      }
    }
  }, []);

  // Update RGB values when current color changes
  useEffect(() => {
    const rgb = hexToRgb(currentColor);
    if (rgb) {
      setRgbValues({ r: rgb.r, g: rgb.g, b: rgb.b });
      setNormalizedRgbValues({
        r: parseFloat((rgb.r / 255).toFixed(3)),
        g: parseFloat((rgb.g / 255).toFixed(3)),
        b: parseFloat((rgb.b / 255).toFixed(3))
      });
    }
  }, [currentColor]);

  // Save palettes to localStorage whenever they change
  useEffect(() => {
    // Don't save if palettes is empty (this could happen during initial load)
    if (palettes.length === 0) {
      console.log("Skipping save - palettes array is empty");
      return;
    }
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(palettes));
      console.log("Saved palettes to localStorage:", palettes.length, "palettes");
    } catch (error) {
      console.error("Error saving palettes:", error);
    }
  }, [palettes]);

  // Focus the input when entering edit mode
  useEffect(() => {
    if (isEditingName && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [isEditingName]);

  // Detect when to use compact layout based on viewport and zoom
  useEffect(() => {
    const checkLayout = () => {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const zoomLevel = window.devicePixelRatio || 1;
      
      // Use compact layout when:
      // 1. Viewport is narrow (mobile/tablet)
      // 2. User has zoomed in significantly (zoom > 1.7 to match palette shift)
      // 3. Viewport height is constrained (zoomed in vertically)
      const shouldUseCompact = 
        viewportWidth < 1024 || 
        zoomLevel > 1.8 || 
        viewportHeight < 500;
      
      setUseCompactLayout(shouldUseCompact);
    };

    checkLayout();
    window.addEventListener('resize', checkLayout);
    return () => window.removeEventListener('resize', checkLayout);
  }, []);

  // Handle clicking outside dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (generateDropdownRef.current && !generateDropdownRef.current.contains(event.target)) {
        setShowGenerateDropdown(false);
        setMenuAnimationState('closed');
      }
    };

    if (showGenerateDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showGenerateDropdown]);

  // Handle escape key to cancel palette selection
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        if (paletteSelectionMode) {
          cancelPaletteSelection();
        } else if (paletteModificationMode) {
          cancelPaletteModification();
        } else if (showModificationDialog) {
          setShowModificationDialog(false);
          setSelectedGenerationType(null);
        }
      }
    };

    if (paletteSelectionMode || paletteModificationMode || showModificationDialog) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [paletteSelectionMode, paletteModificationMode, showModificationDialog]);

  // Palette generation
  const generatePalette = (baseColors) => {
    const colors = [];
    const existingNames = [];

    baseColors.forEach((baseColor) => {
      const hsl = hexToHsl(baseColor);
      if (!hsl) return;

      // Generate variations
      const variations = [
        { h: hsl.h, s: hsl.s, l: Math.min(hsl.l + 20, 100) }, // Lighter
        { h: hsl.h, s: hsl.s, l: hsl.l }, // Original
        { h: hsl.h, s: hsl.s, l: Math.max(hsl.l - 20, 0) }, // Darker
        { h: (hsl.h + 30) % 360, s: hsl.s, l: hsl.l }, // Analogous 1
        { h: (hsl.h - 30 + 360) % 360, s: hsl.s, l: hsl.l }, // Analogous 2
      ];

      variations.forEach((variation, index) => {
        const hex = hslToHex(variation.h, variation.s, variation.l);
        const name = generateColorName(variation.h, variation.s, variation.l, existingNames);
        existingNames.push(name);
        
        colors.push({
          id: Date.now() + Math.random(),
          hex: hex,
          name: name,
        });
      });
    });

    return colors;
  };

  // New generation functions
  const generateShades = (baseColor) => {
    const hsl = hexToHsl(baseColor);
    if (!hsl) return [];

    const colors = [];
    const existingNames = [];
    const lightnessSteps = [10, 20, 30, 40, 50, 60, 70, 80, 90];
    
    lightnessSteps.forEach((l, index) => {
      const hex = hslToHex(hsl.h, hsl.s, l);
      const name = generateColorName(hsl.h, hsl.s, l, existingNames);
      existingNames.push(name);
      
      colors.push({
        id: Date.now() + Math.random(),
        hex: hex,
        name: name,
      });
    });

    return colors;
  };

  const generateComplements = (baseColor) => {
    const hsl = hexToHsl(baseColor);
    if (!hsl) return [];

    const colors = [];
    const existingNames = [];
    const complementaryHue = (hsl.h + 180) % 360;
    
    // Generate variations of the original color
    const originalVariations = [
      { h: hsl.h, s: hsl.s, l: Math.max(hsl.l - 20, 10) },
      { h: hsl.h, s: hsl.s, l: hsl.l },
      { h: hsl.h, s: hsl.s, l: Math.min(hsl.l + 20, 90) },
    ];

    // Generate variations of the complementary color
    const complementVariations = [
      { h: complementaryHue, s: hsl.s, l: Math.max(hsl.l - 20, 10) },
      { h: complementaryHue, s: hsl.s, l: hsl.l },
      { h: complementaryHue, s: hsl.s, l: Math.min(hsl.l + 20, 90) },
    ];

    [...originalVariations, ...complementVariations].forEach((variation, index) => {
      const hex = hslToHex(variation.h, variation.s, variation.l);
      const name = generateColorName(variation.h, variation.s, variation.l, existingNames);
      existingNames.push(name);
      
      colors.push({
        id: Date.now() + Math.random(),
        hex: hex,
        name: name,
      });
    });

    return colors;
  };

  const generateRandomPalette = () => {
    const colors = [];
    const existingNames = [];
    const hueStep = 360 / 8; // 8 colors evenly spaced around the color wheel
    
    for (let i = 0; i < 8; i++) {
      const hue = i * hueStep;
      const saturation = 60 + Math.random() * 40; // 60-100%
      const lightness = 40 + Math.random() * 30; // 40-70%
      
      const hex = hslToHex(hue, saturation, lightness);
      const name = generateColorName(hue, saturation, lightness, existingNames);
      existingNames.push(name);
      
      colors.push({
        id: Date.now() + Math.random(),
        hex: hex,
        name: name,
      });
    }

    return colors;
  };

  const generateFromPalette = (sourcePaletteId, type) => {
    const sourcePalette = palettes.find(p => p.id === sourcePaletteId);
    if (!sourcePalette) return;

    let generatedColors = [];
    const baseColors = sourcePalette.colors.map(c => c.hex);

    if (type === 'expand') {
      generatedColors = generatePalette(baseColors);
    } else if (type === 'new') {
      // Generate a completely new palette based on the source colors
      generatedColors = generatePalette(baseColors);
      // Add some random variations
      const randomColors = generateRandomPalette().slice(0, 3);
      generatedColors = [...generatedColors, ...randomColors];
    }

    const newPalette = {
      id: Date.now(),
      name: type === 'expand' 
        ? `Expanded from ${sourcePalette.name}`
        : `New from ${sourcePalette.name}`,
      colors: generatedColors,
    };

    setPalettes([...palettes, newPalette]);
    setPaletteSelectionMode(false);
    setSelectedGenerationType(null);
  };

  const handlePaletteSelection = (paletteId) => {
    if (paletteSelectionMode && selectedGenerationType) {
      generateFromPalette(paletteId, selectedGenerationType);
    }
  };

  const cancelPaletteSelection = () => {
    setPaletteSelectionMode(false);
    setSelectedGenerationType(null);
  };

  // New functions for palette modification mode
  const handlePaletteSelectionForModification = (paletteId) => {
    const selectedPalette = palettes.find(p => p.id === paletteId);
    if (!selectedPalette) return;

    // Preserve the current picker width
    const currentWidth = pickerWidth || (pickerContainerRef.current?.offsetWidth || null);
    setPreservedPickerWidth(currentWidth);

    setSelectedPaletteForModification(selectedPalette);
    setModifiedPaletteColors([...selectedPalette.colors]); // Create a copy
    setOriginalPaletteColors([...selectedPalette.colors]); // Store original colors
    setSliderDeltas({ h: 0, s: 0, l: 0 }); // Reset deltas
    setNeutralColor("#808080"); // Set neutral gray color
    setCurrentColor("#808080"); // Set current color to neutral for centered sliders
    setPaletteModificationMode(true);
    setShowModificationDialog(false);
  };

  const cancelPaletteModification = () => {
    setPaletteModificationMode(false);
    setSelectedPaletteForModification(null);
    setModifiedPaletteColors([]);
    setOriginalPaletteColors([]);
    setSliderDeltas({ h: 0, s: 0, l: 0 });
    setNeutralColor("#808080");
    setPreservedPickerWidth(null); // Clear preserved width
    setShowModificationDialog(false);
    setSelectedGenerationType(null);
  };

  const applyChangesToAllColors = () => {
    if (!selectedPaletteForModification || originalPaletteColors.length === 0) return;

    // Calculate the delta from the neutral color to the current color
    const neutralHsl = hexToHsl(neutralColor);
    const currentHsl = hexToHsl(currentColor);
    
    if (!neutralHsl || !currentHsl) return;

    // Calculate deltas (how much the sliders have moved from center)
    const newDeltas = {
      h: currentHsl.h - neutralHsl.h,
      s: currentHsl.s - neutralHsl.s,
      l: currentHsl.l - neutralHsl.l
    };

    // Update slider deltas
    setSliderDeltas(newDeltas);

    // Apply deltas to all original colors
    const updatedColors = originalPaletteColors.map((color) => {
      const originalHsl = hexToHsl(color.hex);
      if (!originalHsl) return color;

      // Apply deltas to the original color while preserving its essence
      const newHsl = {
        h: (originalHsl.h + newDeltas.h + 360) % 360, // Wrap around for hue
        s: Math.max(0, Math.min(100, originalHsl.s + newDeltas.s)), // Clamp saturation
        l: Math.max(0, Math.min(100, originalHsl.l + newDeltas.l))  // Clamp lightness
      };

      return {
        ...color,
        hex: hslToHex(newHsl.h, newHsl.s, newHsl.l)
      };
    });

    setModifiedPaletteColors(updatedColors);
  };

  // Update all colors in real-time when current color changes in modification mode
  useEffect(() => {
    if (paletteModificationMode && selectedPaletteForModification && originalPaletteColors.length > 0) {
      applyChangesToAllColors();
    }
  }, [currentColor, paletteModificationMode]);

  const saveModifiedPalette = () => {
    if (!selectedPaletteForModification || modifiedPaletteColors.length === 0) return;

    const newPalette = {
      id: Date.now(),
      name: `Modified ${selectedPaletteForModification.name}`,
      colors: modifiedPaletteColors,
    };

    setPalettes([...palettes, newPalette]);
    cancelPaletteModification(); // This will clear the preserved width
  };

  // Handler for saving the edited name
  const saveNameEdit = () => {
    if (editingChip && editNameValue.trim() !== "") {
      updateColorInPalette(editingChip.paletteId, editingChip.colorId, { name: editNameValue });
    }
    setIsEditingName(false);
  };

  // Handle RGB input changes
  const handleRgbChange = (component, value) => {
    const numValue = parseInt(value) || 0;
    const clampedValue = Math.max(0, Math.min(255, numValue));
    
    const newRgb = { ...rgbValues, [component]: clampedValue };
    setRgbValues(newRgb);
    
    // Convert to hex and update current color
    const hex = rgbToHex(newRgb.r, newRgb.g, newRgb.b);
    if (hex) {
      setCurrentColor(hex);
    }
  };

  // Handle normalized RGB input changes
  const handleNormalizedRgbChange = (component, value) => {
    const numValue = parseFloat(value) || 0;
    const clampedValue = Math.max(0, Math.min(1, numValue));
    
    const newNormalizedRgb = { ...normalizedRgbValues, [component]: clampedValue };
    setNormalizedRgbValues(newNormalizedRgb);
    
    // Convert to 0-255 range and then to hex
    const rgb = {
      r: Math.round(clampedValue * 255),
      g: Math.round(newNormalizedRgb.g * 255),
      b: Math.round(newNormalizedRgb.b * 255)
    };
    
    // Update the other component's normalized value
    if (component === 'r') {
      setNormalizedRgbValues({ ...newNormalizedRgb, r: clampedValue });
    } else if (component === 'g') {
      setNormalizedRgbValues({ ...newNormalizedRgb, g: clampedValue });
    } else if (component === 'b') {
      setNormalizedRgbValues({ ...newNormalizedRgb, b: clampedValue });
    }
    
    const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
    if (hex) {
      setCurrentColor(hex);
    }
  };

  // Palette management functions
  const createPalette = () => {
    if (!newPaletteName.trim()) return;

    const hsl = hexToHsl(currentColor);
    const colorName = hsl ? generateColorName(hsl.h, hsl.s, hsl.l, []) : "Color 1";

    const newPalette = {
      id: Date.now(),
      name: newPaletteName,
      colors: [{ id: Date.now(), hex: currentColor, name: colorName }],
    };

    setPalettes([...palettes, newPalette]);
    setNewPaletteName("");
    setShowNewPaletteInput(false);
  };

  const deletePalette = (paletteId) => {
    setPalettes(palettes.filter((p) => p.id !== paletteId));
  };

  const confirmDeletePalette = (palette) => {
    setPaletteToDelete(palette);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = () => {
    if (paletteToDelete) {
      deletePalette(paletteToDelete.id);
    }
    setShowDeleteConfirm(false);
    setPaletteToDelete(null);
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
    setPaletteToDelete(null);
  };

  const addColorToPalette = (paletteId, colorToAdd = null) => {
    const palette = palettes.find(p => p.id === paletteId);
    const existingNames = palette ? palette.colors.map(c => c.name) : [];
    
    const color = colorToAdd || {
      id: Date.now(),
      hex: currentColor,
      name: (() => {
        const hsl = hexToHsl(currentColor);
        if (hsl) {
          return generateColorName(hsl.h, hsl.s, hsl.l, existingNames);
        }
        return `Color ${palette?.colors.length + 1 || 1}`;
      })(),
    };

    setPalettes(
      palettes.map((palette) =>
        palette.id === paletteId
          ? {
              ...palette,
              colors: [
                ...palette.colors,
                color,
              ],
            }
          : palette,
      ),
    );
  };

  const removeColorFromPalette = (paletteId, colorId) => {
    setPalettes(
      palettes.map((palette) =>
        palette.id === paletteId
          ? {
              ...palette,
              colors: palette.colors.filter((c) => c.id !== colorId),
            }
          : palette,
      ),
    );
  };

  const updateColorInPalette = (paletteId, colorId, updates) => {
    setPalettes(
      palettes.map((palette) =>
        palette.id === paletteId
          ? {
              ...palette,
              colors: palette.colors.map((color) =>
                color.id === colorId ? { ...color, ...updates } : color,
              ),
            }
          : palette,
      ),
    );
  };

  const generatePaletteFromExisting = (paletteId) => {
    const palette = palettes.find((p) => p.id === paletteId);
    if (!palette) return;

    const baseColors = palette.colors.map((c) => c.hex);
    const generatedColors = generatePalette(baseColors);

    const newPalette = {
      id: Date.now(),
      name: `Generated from ${palette.name}`,
      colors: generatedColors,
    };

    setPalettes([...palettes, newPalette]);
  };

  // Drag and drop functions
  const handleDragStart = (e, color, paletteId) => {
    setDraggedColor(color);
    setDraggedFrom({ paletteId, colorId: color.id });
    
    // Add visual feedback to the dragged element
    if (e.target) {
      e.target.style.opacity = '0.5';
      e.target.style.transform = 'rotate(5deg)';
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleColorDragOver = (e, paletteId, colorId) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverTarget({ paletteId, colorId });
  };

  const handleColorDragLeave = (e) => {
    e.preventDefault();
    setDragOverTarget(null);
  };

  const handleDragEnd = (e) => {
    // Reset visual feedback
    if (e.target) {
      e.target.style.opacity = '';
      e.target.style.transform = '';
    }
    setDragOverTarget(null);
  };

  const handleDrop = (e, targetPaletteId, targetColorId = null) => {
    e.preventDefault();
    if (!draggedColor || !draggedFrom) return;

    // If dropping on a specific color (for reordering)
    if (targetColorId && draggedFrom.paletteId === targetPaletteId) {
      // Reorder within the same palette
      reorderColorInPalette(targetPaletteId, draggedFrom.colorId, targetColorId);
    } else {
      // Move between palettes or add to empty palette
      if (draggedFrom.paletteId !== targetPaletteId) {
        // Remove from source palette first
        removeColorFromPalette(draggedFrom.paletteId, draggedFrom.colorId);
        // Add to target palette with the dragged color
        addColorToPalette(targetPaletteId, {
          id: Date.now(),
          hex: draggedColor.hex,
          name: draggedColor.name,
        });
      }
    }

    setDraggedColor(null);
    setDraggedFrom(null);
  };

  // New function to reorder colors within a palette
  const reorderColorInPalette = (paletteId, draggedColorId, targetColorId) => {
    setPalettes(palettes.map(palette => {
      if (palette.id !== paletteId) return palette;

      const colors = [...palette.colors];
      const draggedIndex = colors.findIndex(c => c.id === draggedColorId);
      const targetIndex = colors.findIndex(c => c.id === targetColorId);

      if (draggedIndex === -1 || targetIndex === -1) return palette;

      // Remove the dragged color
      const [draggedColor] = colors.splice(draggedIndex, 1);
      
      // Insert at target position
      colors.splice(targetIndex, 0, draggedColor);

      return { ...palette, colors };
    }));
  };

  // Resize handlers
  const handleResizeStart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setResizeStartX(e.clientX);
    const currentWidth = pickerWidth || (pickerContainerRef.current?.offsetWidth || 0);
    setResizeStartWidth(currentWidth);
    
    // Add global event listeners
    document.addEventListener('mousemove', handleResizeMove);
    document.addEventListener('mouseup', handleResizeEnd);
    
    // Prevent text selection during resize
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'ew-resize';
  };

  const handleResizeMove = useCallback((e) => {
    if (!isResizing) return;
    
    const deltaX = e.clientX - resizeStartX;
    const newWidth = Math.max(300, Math.min(800, resizeStartWidth + deltaX)); // Min 300px, max 800px
    setPickerWidth(newWidth);
  }, [isResizing, resizeStartX, resizeStartWidth]);

  const handleResizeEnd = useCallback(() => {
    setIsResizing(false);
    
    // Remove global event listeners
    document.removeEventListener('mousemove', handleResizeMove);
    document.removeEventListener('mouseup', handleResizeEnd);
    
    // Restore normal cursor and text selection
    document.body.style.userSelect = '';
    document.body.style.cursor = '';
  }, [handleResizeMove]);

  // Cleanup resize listeners on unmount
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleResizeMove);
      document.removeEventListener('mouseup', handleResizeEnd);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
  }, [handleResizeMove, handleResizeEnd]);

  // Palette expansion toggle
  const togglePaletteExpansion = (paletteId) => {
    setExpandedPalettes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(paletteId)) {
        newSet.delete(paletteId);
      } else {
        newSet.add(paletteId);
      }
      return newSet;
    });
  };

  // Color chip click handlers
  const handleColorClick = (paletteId, color) => {
    setCurrentColor(color.hex);
    setEditingChip({ paletteId, colorId: color.id });
  };

  const handleColorDoubleClick = (color) => {
    navigator.clipboard.writeText(color.hex);
    // Visual feedback could be added here
  };

  const saveColorEdit = () => {
    if (editingChip) {
      updateColorInPalette(editingChip.paletteId, editingChip.colorId, {
        hex: currentColor,
      });
      setEditingChip(null);
    }
  };

  // When a chip is selected for editing, store its original color
  useEffect(() => {
    if (editingChip) {
      const palette = palettes.find(p => p.id === editingChip.paletteId);
      if (palette) {
        const color = palette.colors.find(c => c.id === editingChip.colorId);
        if (color) setOriginalColor(color.hex);
      }
    } else {
      setOriginalColor(null);
    }
  }, [editingChip, palettes]);

  // When editing a chip, update its color in real time
  useEffect(() => {
    if (editingChip) {
      updateColorInPalette(editingChip.paletteId, editingChip.colorId, { hex: currentColor });
    }
    // eslint-disable-next-line
  }, [currentColor]);

  // Cancel handler restores the original color
  const cancelColorEdit = () => {
    if (editingChip && originalColor) {
      updateColorInPalette(editingChip.paletteId, editingChip.colorId, { hex: originalColor });
    }
    setEditingChip(null);
  };

  // Get the currently editing color name (for the picker box)
  const currentEditingName = (() => {
    if (editingChip) {
      const palette = palettes.find(p => p.id === editingChip.paletteId);
      if (palette) {
        const color = palette.colors.find(c => c.id === editingChip.colorId);
        return color ? color.name : "";
      }
    }
    return "";
  })();

  // Menu and generation functions
  const handleMenuToggle = () => {
    if (showGenerateDropdown) {
      setShowGenerateDropdown(false);
      setMenuAnimationState('closed');
      setVisibleMenuItems(0);
    } else {
      setShowGenerateDropdown(true);
      setMenuAnimationState('opening');
      setVisibleMenuItems(0);
      // Start the first menu item animation after a short delay
      setTimeout(() => {
        setVisibleMenuItems(1);
      }, 50);
    }
  };

  const handleMenuItemAnimationComplete = () => {
    setVisibleMenuItems(prev => Math.min(prev + 1, 5));
  };

  const handleGenerateOption = (type) => {
    setSelectedGenerationType(type);
    setShowGenerateDropdown(false);
    setMenuAnimationState('closed');
    
    if (type === 'shades' || type === 'complements') {
      // Generate directly from current color
      let generatedColors = [];
      if (type === 'shades') {
        generatedColors = generateShades(currentColor);
      } else if (type === 'complements') {
        generatedColors = generateComplements(currentColor);
      }

      const newPalette = {
        id: Date.now(),
        name: type === 'shades' 
          ? `Shades of ${currentColor}`
          : `Complements of ${currentColor}`,
        colors: generatedColors,
      };

      setPalettes([...palettes, newPalette]);
    } else if (type === 'random') {
      // Generate random palette
      const generatedColors = generateRandomPalette();
      const newPalette = {
        id: Date.now(),
        name: "Random Palette",
        colors: generatedColors,
      };

      setPalettes([...palettes, newPalette]);
    } else if (type === 'expand') {
      // Enter palette selection mode
      setPaletteSelectionMode(true);
    } else if (type === 'modify') {
      // Enter palette selection mode for modification
      setShowModificationDialog(true);
    }
  };

  return (
    <div className={`min-h-screen bg-neutral-800 text-neutral-100 p-2 sm:p-4 lg:p-6 relative ${paletteSelectionMode || showModificationDialog ? 'overflow-hidden' : ''}`}>
      {/* Palette selection overlay */}
      {paletteSelectionMode && (
        <div className="fixed inset-0 bg-black/50 z-30 pointer-events-none">
          {/* Instruction box positioned over color picker controls */}
          <div className="absolute top-1/4 left-8 bg-neutral-800 rounded-lg p-6 max-w-lg text-center pointer-events-auto shadow-2xl border border-neutral-600">
            <h3 className="text-xl font-semibold text-neutral-100 mb-2">
              {selectedGenerationType === 'expand' ? 'Select palette to expand from:' : 'Select palette to create new from:'}
            </h3>
            <p className="text-neutral-300 mb-4">Click on a palette below or press Escape to cancel</p>
            <button
              onClick={cancelPaletteSelection}
              className="bg-neutral-600 hover:bg-neutral-700 px-4 py-2 rounded text-white transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Palette modification selection dialog */}
      {showModificationDialog && (
        <div className="fixed inset-0 bg-black/50 z-30 pointer-events-none">
          {/* Instruction box positioned over color picker controls */}
          <div className="absolute top-1/4 left-8 bg-neutral-800 rounded-lg p-6 max-w-lg text-center pointer-events-auto shadow-2xl border border-neutral-600">
            <h3 className="text-xl font-semibold text-neutral-100 mb-2">
              Select palette to modify:
            </h3>
            <p className="text-neutral-300 mb-4">Click on a palette below or press Escape to cancel</p>
            <button
              onClick={() => {
                setShowModificationDialog(false);
                setSelectedGenerationType(null);
              }}
              className="bg-neutral-600 hover:bg-neutral-700 px-4 py-2 rounded text-white transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      <div className="max-w-7xl mx-auto">
        {/* Main layout container */}
        <div className="flex items-start gap-8">
          {/* Left: Color Picker */}
          <div 
            ref={pickerContainerRef}
            style={{ 
              width: paletteModificationMode && preservedPickerWidth 
                ? `${preservedPickerWidth}px` 
                : pickerWidth 
                  ? `${pickerWidth}px` 
                  : 'auto', 
              flexShrink: 0 
            }}
            className={`relative overflow-visible ${isResizing ? 'resizing' : ''} ${paletteSelectionMode ? 'blur-sm opacity-50' : ''}`}
          >
            {/* Resize handle */}
            <div
              className="resize-handle"
              onMouseDown={handleResizeStart}
              title="Drag to resize"
            />
            <div 
              className={`bg-neutral-700 rounded-lg p-3 sm:p-4 lg:p-6 space-y-3 sm:space-y-4 picker-content ${useCompactLayout ? 'color-picker-compact-layout' : ''}`}
            >


              <div className="flex flex-col items-start w-full">
                {/* Color name display/edit toggle, now left-aligned */}
                {!paletteModificationMode && (
                  <>
                    {isEditingName ? (
                      <input
                        ref={nameInputRef}
                        type="text"
                        value={editNameValue}
                        onChange={e => setEditNameValue(e.target.value)}
                        onBlur={saveNameEdit}
                        onKeyDown={e => {
                          if (e.key === "Enter") saveNameEdit();
                          if (e.key === "Escape") setIsEditingName(false);
                        }}
                        className="input-hex w-full max-w-xs text-left mb-2 px-2 py-1 text-lg font-bold"
                        style={{ fontSize: "2rem" }}
                      />
                    ) : (
                      <div
                        className="color-name-display -mb-3 -mt-2 flex items-center gap-2 justify-start w-full "
                        tabIndex={0}
                        onClick={() => {
                          setEditNameValue(currentEditingName);
                          setIsEditingName(true);
                        }}
                        onKeyDown={e => {
                          if (e.key === "Enter" || e.key === " ") {
                            setEditNameValue(currentEditingName);
                            setIsEditingName(true);
                          }
                        }}
                        title="Click to edit color name"
                        style={{ justifyContent: 'flex-start', textAlign: 'left',  }}
                      >
                        {currentEditingName || <span className="italic text-neutral-400">(No Name)</span>}
                        <Pencil size={20} className="ml-1 text-amber-400 opacity-70 group-hover:opacity-100" />
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="flex flex-col gap-3 w-full">
                {/* Color picker layout - changes based on compact mode */}
                {useCompactLayout ? (
                  /* Compact layout: swatch, inputs, and color square in one row */
                  <div className="flex flex-row items-stretch gap-3 w-full" style={{height: '120px'}}>
                    <div
                      className="color-swatch color-swatch-large flex-shrink-0"
                      style={{ backgroundColor: currentColor, width: '120px', height: '120px', minWidth: '120px', minHeight: '120px' }}
                    />
                    <div className="flex flex-col gap-1 flex-shrink-0 justify-center" style={{width: '120px', minWidth: '120px'}}>
                      <input
                        type="text"
                        value={currentColor}
                        onChange={(e) => setCurrentColor(e.target.value)}
                        className="input-hex w-full"
                        placeholder="#000000"
                        style={{fontSize: '1rem'}}
                      />
                      <input
                        type="text"
                        value={`${rgbValues.r}, ${rgbValues.g}, ${rgbValues.b}`}
                        onChange={(e) => {
                          const parts = e.target.value.split(',').map(s => s.trim());
                          if (parts.length === 3) {
                            handleRgbChange('r', parts[0]);
                            handleRgbChange('g', parts[1]);
                            handleRgbChange('b', parts[2]);
                          }
                        }}
                        className="input-hex w-full"
                        placeholder="255, 255, 255"
                        style={{fontSize: '1rem'}}
                      />
                      <input
                        type="text"
                        value={`${normalizedRgbValues.r.toFixed(3)}, ${normalizedRgbValues.g.toFixed(3)}, ${normalizedRgbValues.b.toFixed(3)}`}
                        onChange={(e) => {
                          const parts = e.target.value.split(',').map(s => s.trim());
                          if (parts.length === 3) {
                            handleNormalizedRgbChange('r', parts[0]);
                            handleNormalizedRgbChange('g', parts[1]);
                            handleNormalizedRgbChange('b', parts[2]);
                          }
                        }}
                        className="input-hex w-full"
                        placeholder="1.000, 1.000, 1.000"
                        style={{fontSize: '1rem'}}
                      />
                    </div>
                    <div className="flex-1 flex items-center justify-center min-w-0" style={{minWidth: '120px'}}>
                      <ColorSquare
                        hue={(() => { const hsl = hexToHsl(currentColor); return hsl ? hsl.h : 0; })()}
                        size={120}
                        color={currentColor}
                        onChange={setCurrentColor}
                      />
                    </div>
                  </div>
                ) : (
                  /* Normal layout: swatch and inputs in one row, color square below */
                  <div className="space-y-3 flex-shrink-0 w-full">
                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
                      <div
                        className="color-swatch color-swatch-large flex-shrink-0 w-full max-w-[160px]"
                        style={{ backgroundColor: currentColor }}
                      />
                      <div className="w-full max-w-xs">
                        <div className="flex flex-col gap-2 w-full">
                          <input
                            type="text"
                            value={currentColor}
                            onChange={(e) => setCurrentColor(e.target.value)}
                            className="input-hex w-full"
                            placeholder="#000000"
                          />
                          <input
                            type="text"
                            value={`${rgbValues.r}, ${rgbValues.g}, ${rgbValues.b}`}
                            onChange={(e) => {
                              const parts = e.target.value.split(',').map(s => s.trim());
                              if (parts.length === 3) {
                                handleRgbChange('r', parts[0]);
                                handleRgbChange('g', parts[1]);
                                handleRgbChange('b', parts[2]);
                              }
                            }}
                            className="input-hex w-full"
                            placeholder="255, 255, 255"
                          />
                          <input
                            type="text"
                            value={`${normalizedRgbValues.r.toFixed(3)}, ${normalizedRgbValues.g.toFixed(3)}, ${normalizedRgbValues.b.toFixed(3)}`}
                            onChange={(e) => {
                              const parts = e.target.value.split(',').map(s => s.trim());
                              if (parts.length === 3) {
                                handleNormalizedRgbChange('r', parts[0]);
                                handleNormalizedRgbChange('g', parts[1]);
                                handleNormalizedRgbChange('b', parts[2]);
                              }
                            }}
                            className="input-hex w-full"
                            placeholder="1.000, 1.000, 1.000"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-center w-full">
                      <div style={{ width: '100%' }}>
                        <ColorSquare
                          hue={(() => { const hsl = hexToHsl(currentColor); return hsl ? hsl.h : 0; })()}
                          color={currentColor}
                          onChange={setCurrentColor}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Sliders always below picker */}
                <div className="flex-1 min-w-0 w-full">
                  <ColorSliders
                    color={currentColor}
                    onChange={setCurrentColor}
                    modificationMode={paletteModificationMode}
                  />
                </div>
              </div>

              {editingChip && (
                <div className="flex">
                  <button
                    onClick={cancelColorEdit}
                    className="btn-secondary w-full flex items-center justify-center gap-2"
                  >
                    <X size={16} />
                    <span>Cancel</span>
                  </button>
                </div>
              )}

              {/* Palette modification controls */}
              {paletteModificationMode && selectedPaletteForModification && (
                <div className="space-y-3 border-t border-neutral-600 pt-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-neutral-100">
                      Modifying: {selectedPaletteForModification.name}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-neutral-300">
                      <span>{modifiedPaletteColors.length} colors</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={cancelPaletteModification}
                      className="flex-1 px-3 py-2 bg-neutral-600 hover:bg-neutral-700 rounded text-white transition-colors text-sm flex items-center justify-center gap-2"
                    >
                      <X size={16} />
                      <span>Cancel</span>
                    </button>
                    <button
                      onClick={saveModifiedPalette}
                      className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 rounded text-white transition-colors text-sm flex items-center justify-center gap-2"
                    >
                      <Save size={16} />
                      <span>Save as New Palette</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Palettes Section - dynamically sized */}
          <div className="flex-1 min-w-0">
            {/* Move heading here, above palettes */}
            <div className={`${paletteSelectionMode ? 'blur-sm opacity-50' : ''} ${paletteModificationMode ? 'blur-sm opacity-50' : ''}`}>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-0 text-neutral-100 text-right flex items-baseline justify-end">
                <span className="color-cycle-text mt-3" style={{ position: "relative", top: "0.4em", display: "inline-block" }}><b><i>Hue</i></b></span>
                <span
                  style={{
                    fontSize: "2.9rem",
                    fontWeight: 600,
                    marginLeft: "0.18em",
                    verticalAlign: "super",
                    display: "inline-block",
                    lineHeight: 1,
                    position: "relative",
                    left: "-0.1em",
                    top: "-0.3em"
                  }}
                >
                  gol
                  <span
                    style={{
                      fontSize: "2.9rem",
                      fontWeight: 500,
                      position: "relative",
                      left: "0.16em",
                      verticalAlign: "super",
                      display: "inline-block",
                      top: "-0.5em"
                    }}
                  >
                    plex
                  </span>
                </span>
              </h1>
              <div className="space-y-4 sm:space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <h2 className="text-lg mb-4 sm:text-xl font-semibold text-neutral-100">
                    Your Palettes
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {showNewPaletteInput ? (
                      <div className="flex flex-wrap gap-2">
                        <input
                          type="text"
                          value={newPaletteName}
                          onChange={(e) => setNewPaletteName(e.target.value)}
                          placeholder="Palette name"
                          className="bg-neutral-800 border border-neutral-600 rounded px-3 py-2 text-neutral-100 text-sm"
                          onKeyPress={(e) => e.key === "Enter" && createPalette()}
                        />
                        <button
                          onClick={createPalette}
                          className="bg-green-600 hover:bg-green-700 px-3 py-2 rounded text-white transition-colors text-sm"
                        >
                          Create
                        </button>
                        <button
                          onClick={() => setShowNewPaletteInput(false)}
                          className="bg-neutral-600 hover:bg-neutral-700 px-3 py-2 rounded text-white transition-colors text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <></>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className={`space-y-4 ${paletteSelectionMode ? 'blur-sm opacity-50' : ''}`}>
              {palettes.map((palette) => (
                <div
                  key={palette.id}
                  className={`rounded-lg p-3 sm:p-4 relative transition-all duration-200 ${
                    (paletteSelectionMode || showModificationDialog)
                      ? 'cursor-pointer hover:scale-105 bg-neutral-600 hover:bg-neutral-500 shadow-lg hover:shadow-xl ring-2 ring-purple-500/30 hover:ring-purple-500/50 z-40' 
                      : paletteModificationMode && selectedPaletteForModification?.id === palette.id
                      ? 'bg-neutral-600 shadow-lg z-40'
                      : 'bg-neutral-700'
                  } ${
                    (paletteSelectionMode || showModificationDialog) && hoveredPaletteId === palette.id
                      ? 'palette-selection-border shadow-2xl ring-purple-500/70'
                      : ''
                  } ${paletteModificationMode && selectedPaletteForModification?.id !== palette.id ? 'blur-sm opacity-50' : ''}`}
                  onMouseEnter={() => (paletteSelectionMode || showModificationDialog) && setHoveredPaletteId(palette.id)}
                  onMouseLeave={() => (paletteSelectionMode || showModificationDialog) && setHoveredPaletteId(null)}
                  onClick={() => {
                    if (paletteSelectionMode) {
                      handlePaletteSelection(palette.id);
                    } else if (showModificationDialog) {
                      handlePaletteSelectionForModification(palette.id);
                    }
                  }}
                >
                  {/* Delete button in top-right corner */}
                  <button
                    onClick={() => confirmDeletePalette(palette)}
                    className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-700 rounded-full w-6 h-6 flex items-center justify-center transition-all duration-200 hover:scale-110 z-10"
                    title={`Delete palette "${palette.name}"`}
                  >
                    <X size={14} className="text-white" />
                  </button>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                    <div className="flex items-center gap-2">
                      {!paletteSelectionMode && (
                        <button
                          onClick={() => togglePaletteExpansion(palette.id)}
                          className="text-neutral-400 hover:text-neutral-100 transition-colors"
                          title={expandedPalettes.has(palette.id) ? "Collapse palette" : "Expand palette"}
                        >
                          <ChevronRight 
                            size={16} 
                            className={`transition-transform ${expandedPalettes.has(palette.id) ? 'rotate-90' : ''}`} 
                          />
                        </button>
                      )}
                      <h3 className="text-base sm:text-lg font-medium text-neutral-100">
                        {palette.name}
                      </h3>
                    </div>
                  </div>

                  <div
                    className={`${
                      expandedPalettes.has(palette.id) 
                        ? 'grid gap-1 sm:gap-2 grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12' 
                        : 'flex flex-row items-center overflow-visible'
                    }`}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, palette.id)}
                    onDragLeave={() => setDragOverTarget(null)}
                    style={{
                      height: expandedPalettes.has(palette.id) ? 'auto' : '63px',
                      maxHeight: expandedPalettes.has(palette.id) ? 'none' : '63px'
                    }}
                  >
                    {/* Container for overlapping chips with reserved space for add button */}
                    <div className={`${
                      expandedPalettes.has(palette.id) 
                        ? 'contents' 
                        : 'flex flex-row items-center flex-1 overflow-visible'
                    }`}>
                      {(expandedPalettes.has(palette.id) ? palette.colors : palette.colors).map((color, index) => (
                        <div
                          key={color.id}
                          className={`relative group aspect-square rounded border-2 transition-all flex-shrink-0 overflow-visible ${
                            (paletteSelectionMode || showModificationDialog)
                              ? "cursor-default border-neutral-600" 
                              : editingChip?.paletteId === palette.id &&
                                editingChip?.colorId === color.id
                                ? "cursor-pointer color-cycle-border shadow-lg"
                                : dragOverTarget?.paletteId === palette.id && dragOverTarget?.colorId === color.id
                                ? "cursor-pointer border-amber-400 shadow-lg scale-105"
                                : "cursor-pointer border-neutral-600 hover:border-neutral-400"
                          }`}
                          style={{ 
                            backgroundColor: paletteModificationMode && selectedPaletteForModification?.id === palette.id 
                              ? modifiedPaletteColors.find(c => c.id === color.id)?.hex || color.hex
                              : color.hex, 
                            minWidth: '48px', 
                            minHeight: '48px', 
                            width: '63px', 
                            height: '63px', 
                            maxWidth: '72px', 
                            maxHeight: '72px', 
                            padding: '6px',
                            ...(expandedPalettes.has(palette.id) ? {} : {
                              marginLeft: index === 0 ? '0' : (() => {
                                const chipWidth = 63;
                                // Use a much more aggressive container width calculation
                                // Account for the add button and count display space
                                const containerWidth = 600; // Reduced to account for add button and count
                                const maxChipsWithoutOverlap = Math.floor(containerWidth / chipWidth);
                                
                                // If we have fewer chips than can fit, no overlap needed
                                if (palette.colors.length <= maxChipsWithoutOverlap) {
                                  return '0px';
                                }
                                
                                // Much more aggressive overlap calculation
                                // We want to fit ALL chips in the available space
                                const totalSpaceNeeded = palette.colors.length * chipWidth;
                                const overlapNeeded = totalSpaceNeeded - containerWidth;
                                const overlapPerChip = overlapNeeded / (palette.colors.length - 1);
                                
                                // Ensure we get aggressive overlap for large palettes
                                return `-${Math.max(overlapPerChip, 30)}px`;
                              })(),
                              zIndex: palette.colors.length - index
                            })
                          }}
                          draggable={!(paletteSelectionMode || showModificationDialog || paletteModificationMode) && (editingChip?.paletteId !== palette.id || editingChip?.colorId !== color.id)}
                          onDragStart={!(paletteSelectionMode || showModificationDialog || paletteModificationMode) ? (e) => handleDragStart(e, color, palette.id) : undefined}
                          onDragEnd={!(paletteSelectionMode || showModificationDialog || paletteModificationMode) ? handleDragEnd : undefined}
                          onDragOver={!(paletteSelectionMode || showModificationDialog || paletteModificationMode) ? (e) => handleColorDragOver(e, palette.id, color.id) : undefined}
                          onDragLeave={!(paletteSelectionMode || showModificationDialog || paletteModificationMode) ? handleColorDragLeave : undefined}
                          onDrop={!(paletteSelectionMode || showModificationDialog || paletteModificationMode) ? (e) => handleDrop(e, palette.id, color.id) : undefined}
                          onClick={!(paletteSelectionMode || showModificationDialog || paletteModificationMode) ? () => handleColorClick(palette.id, color) : undefined}
                          onDoubleClick={!(paletteSelectionMode || showModificationDialog || paletteModificationMode) ? () => handleColorDoubleClick(color) : undefined}
                        >
                          <FittedText 
                            text={color.name} 
                            color={getContrastColor(paletteModificationMode && selectedPaletteForModification?.id === palette.id 
                              ? modifiedPaletteColors.find(c => c.id === color.id)?.hex || color.hex
                              : color.hex)}
                          />
                                                  {!(paletteSelectionMode || showModificationDialog || paletteModificationMode) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeColorFromPalette(palette.id, color.id);
                            }}
                            className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-700 rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-50"
                            style={{
                              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
                            }}
                          >
                            <X size={12} className="text-white" />
                          </button>
                        )}
                        </div>
                      ))}
                    </div>
                    
                    {/* Dark gray plus icon after the last color - always unoverlapped */}
                    {!(paletteSelectionMode || showModificationDialog || paletteModificationMode) && (
                      <button
                        onClick={() => addColorToPalette(palette.id)}
                        className="relative group aspect-square rounded cursor-pointer border-2 border-dashed border-neutral-600 hover:border-neutral-400 bg-neutral-700 hover:bg-neutral-600 flex items-center justify-center transition-all flex-shrink-0"
                        style={{ 
                          minWidth: '48px', 
                          minHeight: '48px', 
                          width: '63px', 
                          height: '63px', 
                          maxWidth: '72px', 
                          maxHeight: '72px', 
                          padding: '6px',
                          ...(expandedPalettes.has(palette.id) ? {} : {
                            marginLeft: '8px',
                            zIndex: 1
                          })
                        }}
                        title="Add color to palette"
                      >
                        <Plus size={20} className="text-neutral-400" />
                      </button>
                    )}
                    
                    {/* Total colors indicator when collapsed */}
                    {!(paletteSelectionMode || showModificationDialog || paletteModificationMode) && !expandedPalettes.has(palette.id) && (
                      <div className="flex items-center ml-2">
                        <span className="text-neutral-400 text-sm bg-neutral-800 px-2 py-1 rounded">
                          {palette.colors.length} colors
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {/* New Palette Frame */}
              <div className={`bg-neutral-800 rounded-lg p-3 sm:p-4 relative ${paletteModificationMode ? 'blur-sm opacity-50' : ''}`}>
                <button
                  onClick={() => setShowNewPaletteInput(true)}
                  className="w-full h-24 sm:h-32 border-2 border-dashed border-neutral-600 hover:border-neutral-400 bg-neutral-800 hover:bg-neutral-700 rounded-lg flex items-center justify-center transition-all group"
                  title="Create new palette"
                >
                  <div className="flex flex-col items-center space-y-2">
                    <Plus size={24} className="text-neutral-400 group-hover:text-neutral-300 transition-colors" />
                    <span className="text-sm text-neutral-400 group-hover:text-neutral-300 transition-colors font-medium">
                      New Palette
                    </span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-800 rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-neutral-100">
                Delete Palette
              </h3>
              <button
                onClick={handleDeleteCancel}
                className="text-neutral-400 hover:text-neutral-100"
              >
                <X size={24} />
              </button>
            </div>
            
            <p className="text-neutral-300 mb-6">
              Are you sure you want to delete the palette "{paletteToDelete?.name}"? This action cannot be undone.
            </p>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleDeleteCancel}
                className="bg-neutral-600 hover:bg-neutral-700 px-4 py-2 rounded text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-white transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Generate Button */}
      <div className={`fixed bottom-8 right-8 z-40 ${paletteSelectionMode ? 'blur-sm opacity-50' : ''} ${paletteModificationMode ? 'blur-sm opacity-50' : ''}`}>
        <div className="relative" ref={generateDropdownRef}>
          <button
            onClick={handleMenuToggle}
            className="w-14 h-14 bg-purple-600 hover:bg-purple-700 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
            title="Generate colors"
          >
            <Sparkles size={24} className="text-white" />
          </button>
          
          {showGenerateDropdown && (
            <div className="absolute bottom-full right-0 mb-4 z-50">
              {/* Thick rounded semi-transparent line - centered on icon */}
              <div className={`w-3 h-64 bg-purple-500/30 rounded-full mb-4 ${menuAnimationState === 'opening' ? 'menu-line-growing' : ''}`} 
                   style={{ 
                     position: 'absolute',
                     bottom: '0',
                     right: '28px', // Aligned with center of 56px diameter button
                     transform: 'translateX(50%)'
                   }}></div>
              
              {/* Menu items positioned along the line */}
              <div className="absolute bottom-0 right-0 w-64">
                <MenuItem
                  icon={Palette}
                  text="Generate shades"
                  onClick={() => handleGenerateOption('shades')}
                  isVisible={visibleMenuItems >= 1}
                  onAnimationComplete={handleMenuItemAnimationComplete}
                  index={0}
                />
                <MenuItem
                  icon={Copy}
                  text="Generate complements"
                  onClick={() => handleGenerateOption('complements')}
                  isVisible={visibleMenuItems >= 2}
                  onAnimationComplete={handleMenuItemAnimationComplete}
                  index={1}
                />
                <MenuItem
                  icon={Shuffle}
                  text="Random palette"
                  onClick={() => handleGenerateOption('random')}
                  isVisible={visibleMenuItems >= 3}
                  onAnimationComplete={handleMenuItemAnimationComplete}
                  index={2}
                />
                <MenuItem
                  icon={ArrowRight}
                  text="Expand from existing..."
                  onClick={() => handleGenerateOption('expand')}
                  isVisible={visibleMenuItems >= 4}
                  onAnimationComplete={handleMenuItemAnimationComplete}
                  index={3}
                />
                <MenuItem
                  icon={Plus}
                  text="Modify existing palette..."
                  onClick={() => handleGenerateOption('modify')}
                  isVisible={visibleMenuItems >= 5}
                  onAnimationComplete={handleMenuItemAnimationComplete}
                  index={4}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ColorPickerApp;