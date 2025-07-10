import { useState, useEffect } from 'react';

/**
 * Custom hook for managing palettes
 */
const usePalettes = () => {
  const [palettes, setPalettes] = useState([]);
  const [newPaletteName, setNewPaletteName] = useState("");
  const [showNewPaletteInput, setShowNewPaletteInput] = useState(false);
  const [expandedPalettes, setExpandedPalettes] = useState(new Set());
  
  // Delete confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [paletteToDelete, setPaletteToDelete] = useState(null);

  const STORAGE_KEY = "colorPalettes";

  // Load palettes from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      console.log("Loading from localStorage:", stored ? "found data" : "no data");
      if (!stored) {
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
      } else {
        const savedPalettes = JSON.parse(stored);
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
    }
  }, []);

  // Save palettes to localStorage whenever they change
  useEffect(() => {
    // Don't save if palettes is empty during initial load
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

  const createPalette = () => {
    if (!newPaletteName.trim()) return;

    const newPalette = {
      id: Date.now().toString(),
      name: newPaletteName.trim(),
      colors: []
    };

    setPalettes([...palettes, newPalette]);
    setNewPaletteName("");
    setShowNewPaletteInput(false);
  };

  const deletePalette = (paletteId) => {
    setPalettes(palettes.filter(p => p.id !== paletteId));
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
    if (!colorToAdd) return;

    const newColor = {
      id: Date.now().toString(),
      hex: colorToAdd.hex || colorToAdd,
      name: colorToAdd.name || ""
    };

    setPalettes(palettes.map(palette => 
      palette.id === paletteId 
        ? { ...palette, colors: [...palette.colors, newColor] }
        : palette
    ));
  };

  const removeColorFromPalette = (paletteId, colorId) => {
    setPalettes(palettes.map(palette => 
      palette.id === paletteId 
        ? { ...palette, colors: palette.colors.filter(color => color.id !== colorId) }
        : palette
    ));
  };

  const updateColorInPalette = (paletteId, colorId, updates) => {
    setPalettes(palettes.map(palette => 
      palette.id === paletteId 
        ? {
            ...palette,
            colors: palette.colors.map(color => 
              color.id === colorId ? { ...color, ...updates } : color
            )
          }
        : palette
    ));
  };

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

  const reorderColorInPalette = (paletteId, draggedColorId, targetColorId) => {
    setPalettes(palettes.map(palette => {
      if (palette.id === paletteId) {
        const colors = [...palette.colors];
        const draggedIndex = colors.findIndex(c => c.id === draggedColorId);
        const targetIndex = colors.findIndex(c => c.id === targetColorId);
        
        if (draggedIndex !== -1 && targetIndex !== -1) {
          const [draggedColor] = colors.splice(draggedIndex, 1);
          colors.splice(targetIndex, 0, draggedColor);
        }
        
        return { ...palette, colors };
      }
      return palette;
    }));
  };

  return {
    // State
    palettes,
    setPalettes,
    newPaletteName,
    setNewPaletteName,
    showNewPaletteInput,
    setShowNewPaletteInput,
    expandedPalettes,
    showDeleteConfirm,
    paletteToDelete,
    
    // Methods
    createPalette,
    deletePalette,
    confirmDeletePalette,
    handleDeleteConfirm,
    handleDeleteCancel,
    addColorToPalette,
    removeColorFromPalette,
    updateColorInPalette,
    togglePaletteExpansion,
    reorderColorInPalette
  };
};

export default usePalettes; 