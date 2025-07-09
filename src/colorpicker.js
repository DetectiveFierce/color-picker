import React, { useState, useEffect, useRef, useCallback } from "react";
import { Plus, Trash2, Save, X, RotateCcw } from "lucide-react";
import "./ColorPicker.css"; // Import the CSS file
// Color conversion and utility functions
import { hexToRgb, rgbToHex, hexToHsl, hslToHex, getContrastColor } from "./components/utils/colorUtils";
import ColorSquare from "./components/ColorPicker/ColorSquare";
import ColorSliders from "./components/ColorPicker/ColorSliders";

const ColorPickerApp = () => {
  const [currentColor, setCurrentColor] = useState("#ff0000");
  const [palettes, setPalettes] = useState([]);
  const [draggedColor, setDraggedColor] = useState(null);
  const [draggedFrom, setDraggedFrom] = useState(null);
  const [editingChip, setEditingChip] = useState(null);
  const [newPaletteName, setNewPaletteName] = useState("");
  const [showNewPaletteInput, setShowNewPaletteInput] = useState(false);

  // Load palettes from localStorage on component mount
  useEffect(() => {
    try {
      const savedPalettes = JSON.parse(
        localStorage.getItem("colorPalettes") || "[]",
      );
      if (savedPalettes.length === 0) {
        // Create a default palette
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
      } else {
        setPalettes(savedPalettes);
      }
    } catch (error) {
      console.error("Error loading palettes:", error);
      // Create default palette on error
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
    }
  }, []);

  // Save palettes to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem("colorPalettes", JSON.stringify(palettes));
    } catch (error) {
      console.error("Error saving palettes:", error);
    }
  }, [palettes]);

  // Palette generation
  const generatePalette = (baseColors) => {
    const colors = [];

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
        colors.push({
          id: Date.now() + Math.random(),
          hex: hslToHex(variation.h, variation.s, variation.l),
          name: `Generated ${colors.length + 1}`,
        });
      });
    });

    return colors;
  };

  // Palette management
  const createPalette = () => {
    if (!newPaletteName.trim()) return;

    const newPalette = {
      id: Date.now(),
      name: newPaletteName,
      colors: [{ id: Date.now(), hex: currentColor, name: "Color 1" }],
    };

    setPalettes([...palettes, newPalette]);
    setNewPaletteName("");
    setShowNewPaletteInput(false);
  };

  const deletePalette = (paletteId) => {
    setPalettes(palettes.filter((p) => p.id !== paletteId));
  };

  const addColorToPalette = (paletteId) => {
    setPalettes(
      palettes.map((palette) =>
        palette.id === paletteId
          ? {
              ...palette,
              colors: [
                ...palette.colors,
                {
                  id: Date.now(),
                  hex: currentColor,
                  name: `Color ${palette.colors.length + 1}`,
                },
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

  // Drag and drop
  const handleDragStart = (e, color, paletteId) => {
    setDraggedColor(color);
    setDraggedFrom({ paletteId, colorId: color.id });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetPaletteId) => {
    e.preventDefault();
    if (!draggedColor || !draggedFrom) return;

    // Add to target palette
    addColorToPalette(targetPaletteId);

    // Remove from source palette if different
    if (draggedFrom.paletteId !== targetPaletteId) {
      removeColorFromPalette(draggedFrom.paletteId, draggedFrom.colorId);
    }

    setDraggedColor(null);
    setDraggedFrom(null);
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

  const cancelColorEdit = () => {
    setEditingChip(null);
  };

  return (
    <div className="min-h-screen bg-neutral-800 text-neutral-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-neutral-100">
          Color Palette Studio
        </h1>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Color Picker Section */}
          <div className="xl:col-span-1">
            <div className="bg-neutral-700 rounded-lg p-6 space-y-6">
              <h2 className="text-xl font-semibold text-neutral-100">
                Color Picker
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', marginTop: -24, marginBottom: 0 }}>
                <input
                  type="text"
                  value={(() => {
                    if (editingChip) {
                      const palette = palettes.find(p => p.id === editingChip.paletteId);
                      if (palette) {
                        const color = palette.colors.find(c => c.id === editingChip.colorId);
                        return color ? color.name : '';
                      }
                    }
                    return '';
                  })()}
                  onChange={e => {
                    if (editingChip) {
                      updateColorInPalette(editingChip.paletteId, editingChip.colorId, { name: e.target.value });
                    }
                  }}
                  placeholder="Color Name"
                  className="input-hex"
                  style={{ width: 280, textAlign: 'center', margin: 0, marginBottom: 4, padding: '2px 6px', fontWeight: 500, fontSize: '1.25rem' }}
                />
              </div>

              <div className="flex gap-4">
                {/* Left side - Color square and swatch */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div
                      className="color-swatch color-swatch-large"
                      style={{ backgroundColor: currentColor }}
                    />
                    <div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <input
                          type="text"
                          value={currentColor}
                          onChange={(e) => setCurrentColor(e.target.value)}
                          className="input-hex"
                          style={{ width: 200 }}
                          placeholder="#000000"
                        />
                        <input
                          type="text"
                          value={(() => { const rgb = hexToRgb(currentColor); return rgb ? `${rgb.r}, ${rgb.g}, ${rgb.b}` : "-"; })()}
                          readOnly
                          className="input-hex"
                          style={{ width: 200 }}
                          tabIndex={-1}
                        />
                        <input
                          type="text"
                          value={(() => { const rgb = hexToRgb(currentColor); return rgb ? `${(rgb.r/255).toFixed(3)}, ${(rgb.g/255).toFixed(3)}, ${(rgb.b/255).toFixed(3)}` : "-"; })()}
                          readOnly
                          className="input-hex"
                          style={{ width: 200 }}
                          tabIndex={-1}
                        />
                      </div>
                    </div>
                  </div>

                  <ColorSquare
                    hue={(() => { const hsl = hexToHsl(currentColor); return hsl ? hsl.h : 0; })()}
                    size={200}
                    color={currentColor}
                    onChange={setCurrentColor}
                  />
                </div>

                {/* Right side - Sliders */}
                <div className="flex-1 min-w-0">
                  <ColorSliders
                    color={currentColor}
                    onChange={setCurrentColor}
                  />
                </div>
              </div>

              {editingChip && (
                <div className="flex space-x-2">
                  <button
                    onClick={saveColorEdit}
                    className="btn-success flex-1"
                  >
                    <Save size={16} />
                    <span>Save</span>
                  </button>
                  <button
                    onClick={cancelColorEdit}
                    className="btn-secondary flex-1"
                  >
                    <X size={16} />
                    <span>Cancel</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Palettes Section */}
          <div className="xl:col-span-2">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-neutral-100">
                  Color Palettes
                </h2>
                <div className="flex space-x-2">
                  {showNewPaletteInput ? (
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newPaletteName}
                        onChange={(e) => setNewPaletteName(e.target.value)}
                        placeholder="Palette name"
                        className="bg-neutral-800 border border-neutral-600 rounded px-3 py-2 text-neutral-100"
                        onKeyPress={(e) => e.key === "Enter" && createPalette()}
                      />
                      <button
                        onClick={createPalette}
                        className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-white transition-colors"
                      >
                        Create
                      </button>
                      <button
                        onClick={() => setShowNewPaletteInput(false)}
                        className="bg-neutral-600 hover:bg-neutral-700 px-4 py-2 rounded text-white transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowNewPaletteInput(true)}
                      className="bg-amber-600 hover:bg-amber-700 px-4 py-2 rounded text-white flex items-center space-x-2 transition-colors"
                    >
                      <Plus size={16} />
                      <span>New Palette</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                {palettes.map((palette) => (
                  <div
                    key={palette.id}
                    className="bg-neutral-700 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-neutral-100">
                        {palette.name}
                      </h3>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => addColorToPalette(palette.id)}
                          className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-white text-sm flex items-center space-x-1 transition-colors"
                        >
                          <Plus size={12} />
                          <span>Add</span>
                        </button>
                        <button
                          onClick={() =>
                            generatePaletteFromExisting(palette.id)
                          }
                          className="bg-purple-600 hover:bg-purple-700 px-3 py-1 rounded text-white text-sm flex items-center space-x-1 transition-colors"
                        >
                          <RotateCcw size={12} />
                          <span>Generate</span>
                        </button>
                        <button
                          onClick={() => deletePalette(palette.id)}
                          className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-white text-sm flex items-center space-x-1 transition-colors"
                        >
                          <Trash2 size={12} />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>

                    <div
                      className="grid grid-cols-8 gap-2"
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, palette.id)}
                    >
                      {palette.colors.map((color) => (
                        <div
                          key={color.id}
                          className={`relative group h-16 rounded cursor-pointer border-2 transition-all ${
                            editingChip?.paletteId === palette.id &&
                            editingChip?.colorId === color.id
                              ? "border-white shadow-lg"
                              : "border-neutral-600 hover:border-neutral-400"
                          }`}
                          style={{ backgroundColor: color.hex }}
                          draggable
                          onDragStart={(e) =>
                            handleDragStart(e, color, palette.id)
                          }
                          onClick={() => handleColorClick(palette.id, color)}
                          onDoubleClick={() => handleColorDoubleClick(color)}
                        >
                          {color.name && (
                            <div
                              className="absolute inset-0 flex items-center justify-center text-xs font-medium text-center p-1"
                              style={{ color: getContrastColor(color.hex) }}
                            >
                              {color.name}
                            </div>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeColorFromPalette(palette.id, color.id);
                            }}
                            className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-700 rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={12} className="text-white" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorPickerApp;
