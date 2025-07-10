import React, { useState, useEffect, useRef } from "react";
import "./ColorPicker.css";
import { hexToHsl, hslToHex, generateColorName } from "./components/utils/colorUtils";
// Components
import ColorEditor from "./components/ColorPicker/ColorEditor";
import PaletteList from "./components/ColorPicker/PaletteList";
import GenerationMenu from "./components/ColorPicker/GenerationMenu";
import { PaletteSelectionOverlay, ModificationDialog, DeleteConfirmDialog } from "./components/ui/OverlayDialogs";
// Hooks
import usePalettes from "./hooks/usePalettes";
import useColorEditor from "./hooks/useColorEditor";

// Add the CSS animation styles
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
  /* Additional animations would go here... */
`;

// Inject the styles
const style = document.createElement("style");
style.textContent = colorCycleStyles;
document.head.appendChild(style);

const ColorPickerApp = () => {
  // Use custom hooks
  const paletteHook = usePalettes();
  const colorEditorHook = useColorEditor();
  
  // Layout and UI state
  const [useCompactLayout, setUseCompactLayout] = useState(false);
  const [hoveredPaletteId, setHoveredPaletteId] = useState(null);
  
  // Generation and selection state
  const [selectedGenerationType, setSelectedGenerationType] = useState(null);
  const [paletteSelectionMode, setPaletteSelectionMode] = useState(false);
  const [showModificationDialog, setShowModificationDialog] = useState(false);
  
  // Palette modification state
  const [paletteModificationMode, setPaletteModificationMode] = useState(false);
  const [selectedPaletteForModification, setSelectedPaletteForModification] = useState(null);
  const [modifiedPaletteColors, setModifiedPaletteColors] = useState([]);
  const [originalPaletteColors, setOriginalPaletteColors] = useState([]);
  const [preservedPickerWidth, setPreservedPickerWidth] = useState(null);
  
  // Drag and drop state
  const [draggedColor, setDraggedColor] = useState(null);
  const [draggedFrom, setDraggedFrom] = useState(null);
  const [dragOverTarget, setDragOverTarget] = useState(null);
  
  // Resize state
  const [pickerWidth, setPickerWidth] = useState(null);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStartX, setResizeStartX] = useState(0);
  const [resizeStartWidth, setResizeStartWidth] = useState(0);
  
  // Refs
  const pickerContainerRef = useRef(null);
  
  // Icon sizes
  const smallIconSize = 14;
  const mediumIconSize = 16;
  const largeIconSize = 20;
  const xlIconSize = 24;

  // Detect layout changes
  useEffect(() => {
    const checkLayout = () => {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const zoomLevel = window.devicePixelRatio || 1;
      
      const shouldUseCompact = 
        viewportWidth < 1024 || 
        zoomLevel > 1.8 || 
        viewportHeight < 500 ||
        (zoomLevel > 1.5 && viewportWidth < 1400);
      
      setUseCompactLayout(shouldUseCompact);
    };

    checkLayout();
    window.addEventListener('resize', checkLayout);
    
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(resolution: 1dppx)');
      mediaQuery.addEventListener('change', checkLayout);
    }
    
    return () => {
      window.removeEventListener('resize', checkLayout);
      if (window.matchMedia) {
        const mediaQuery = window.matchMedia('(resolution: 1dppx)');
        mediaQuery.removeEventListener('change', checkLayout);
      }
    };
  }, []);

  // Handle escape key
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

  // Generation functions
  const generatePalette = (baseColors) => {
    const colors = [];
    baseColors.forEach((baseColor) => {
      colors.push({
        id: Date.now() + Math.random(),
        hex: baseColor,
        name: generateColorName(baseColor)
      });
    });
    return colors;
  };

  const generateShades = (baseColor) => {
    const hsl = hexToHsl(baseColor);
    if (!hsl) return [baseColor];
    
    const shades = [];
    for (let i = 0; i < 5; i++) {
      const lightness = Math.max(10, Math.min(90, hsl.l + (i - 2) * 20));
      shades.push(hslToHex(hsl.h, hsl.s, lightness));
    }
    return shades;
  };

  const generateComplements = (baseColor) => {
    const hsl = hexToHsl(baseColor);
    if (!hsl) return [baseColor];
    
    const complements = [baseColor];
    const complementHue = (hsl.h + 180) % 360;
    complements.push(hslToHex(complementHue, hsl.s, hsl.l));
    
    const triad1 = (hsl.h + 120) % 360;
    const triad2 = (hsl.h + 240) % 360;
    complements.push(hslToHex(triad1, hsl.s, hsl.l));
    complements.push(hslToHex(triad2, hsl.s, hsl.l));
    
    return complements;
  };

  const generateRandomPalette = () => {
    const colors = [];
    for (let i = 0; i < 5; i++) {
      const hue = Math.floor(Math.random() * 360);
      const saturation = Math.floor(Math.random() * 60) + 40;
      const lightness = Math.floor(Math.random() * 40) + 30;
      colors.push(hslToHex(hue, saturation, lightness));
    }
    return colors;
  };

  // Event handlers
  const handlePaletteSelection = (paletteId) => {
    if (selectedGenerationType === 'fromExisting') {
      generateFromPalette(paletteId, 'variations');
    } else if (selectedGenerationType === 'expand') {
      generateFromPalette(paletteId, 'expand');
    }
    setPaletteSelectionMode(false);
    setSelectedGenerationType(null);
  };

  const cancelPaletteSelection = () => {
    setPaletteSelectionMode(false);
    setSelectedGenerationType(null);
  };

  const handlePaletteSelectionForModification = (paletteId) => {
    const palette = paletteHook.palettes.find(p => p.id === paletteId);
    if (palette) {
      setSelectedPaletteForModification(palette);
      setOriginalPaletteColors([...palette.colors]);
      setModifiedPaletteColors([...palette.colors]);
      setPreservedPickerWidth(pickerWidth || pickerContainerRef.current?.offsetWidth || 400);
      setPaletteModificationMode(true);
    }
    setShowModificationDialog(false);
    setSelectedGenerationType(null);
  };

  const cancelPaletteModification = () => {
    setPaletteModificationMode(false);
    setSelectedPaletteForModification(null);
    setModifiedPaletteColors([]);
    setOriginalPaletteColors([]);
    setPreservedPickerWidth(null);
  };

  const saveModifiedPalette = () => {
    if (selectedPaletteForModification) {
      const newPalette = {
        id: Date.now().toString(),
        name: `Modified ${selectedPaletteForModification.name}`,
        colors: modifiedPaletteColors
      };
      paletteHook.setPalettes([...paletteHook.palettes, newPalette]);
      cancelPaletteModification();
    }
  };

  const generateFromPalette = (sourcePaletteId, type) => {
    const sourcePalette = paletteHook.palettes.find(p => p.id === sourcePaletteId);
    if (!sourcePalette) return;

    let newColors = [];
    if (type === 'variations') {
      newColors = sourcePalette.colors.map(color => {
        const hsl = hexToHsl(color.hex);
        if (!hsl) return color.hex;
        const newLightness = Math.max(10, Math.min(90, hsl.l + (Math.random() - 0.5) * 30));
        const newSaturation = Math.max(10, Math.min(100, hsl.s + (Math.random() - 0.5) * 20));
        return hslToHex(hsl.h, newSaturation, newLightness);
      });
    } else if (type === 'expand') {
      sourcePalette.colors.forEach(color => {
        newColors.push(...generateShades(color.hex));
      });
    }

    const newPalette = {
      id: Date.now().toString(),
      name: `Generated from ${sourcePalette.name}`,
      colors: generatePalette(newColors)
    };

    paletteHook.setPalettes([...paletteHook.palettes, newPalette]);
  };

  // Drag and drop handlers
  const handleDragStart = (e, color, paletteId) => {
    setDraggedColor(color);
    setDraggedFrom(paletteId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleColorDragOver = (e, paletteId, colorId) => {
    e.preventDefault();
    setDragOverTarget({ paletteId, colorId });
  };

  const handleColorDragLeave = (e) => {
    setDragOverTarget(null);
  };

  const handleDragEnd = (e) => {
    setDraggedColor(null);
    setDraggedFrom(null);
    setDragOverTarget(null);
  };

  const handleDrop = (e, targetPaletteId, targetColorId = null) => {
    e.preventDefault();
    
    if (!draggedColor) return;

    if (draggedFrom && targetColorId) {
      // Reordering within the same palette
      if (draggedFrom === targetPaletteId) {
        paletteHook.reorderColorInPalette(targetPaletteId, draggedColor.id, targetColorId);
      } else {
        // Moving to a different palette
        paletteHook.removeColorFromPalette(draggedFrom, draggedColor.id);
        paletteHook.addColorToPalette(targetPaletteId, draggedColor);
      }
    } else if (!targetColorId) {
      // Adding to the end of a palette
      paletteHook.addColorToPalette(targetPaletteId, draggedColor);
    }

    setDraggedColor(null);
    setDraggedFrom(null);
    setDragOverTarget(null);
  };

  // Resize handlers
  const handleResizeStart = (e) => {
    e.preventDefault();
    setIsResizing(true);
    setResizeStartX(e.clientX);
    setResizeStartWidth(pickerContainerRef.current?.offsetWidth || 400);

    const handleMouseMove = (e) => {
      const diff = e.clientX - resizeStartX;
      const newWidth = Math.max(300, resizeStartWidth + diff);
      setPickerWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Enhanced color operations with hook integration
  const enhancedColorClick = (paletteId, color) => {
    colorEditorHook.handleColorClick(paletteId, color);
  };

  const enhancedColorDoubleClick = (color) => {
    colorEditorHook.handleColorDoubleClick(color);
  };

  const enhancedAddColorToPalette = (paletteId, colorToAdd = null) => {
    const color = colorToAdd || { hex: colorEditorHook.currentColor, name: colorEditorHook.currentEditingName };
    paletteHook.addColorToPalette(paletteId, color);
  };

  const enhancedSaveNameEdit = () => {
    if (colorEditorHook.editingChip) {
      paletteHook.updateColorInPalette(
        colorEditorHook.editingChip.paletteId,
        colorEditorHook.editingChip.colorId,
        { name: colorEditorHook.editNameValue }
      );
    }
    colorEditorHook.saveNameEdit();
  };

  const handleGenerateOption = (type) => {
    let newColors = [];
    
    switch (type) {
      case 'shades':
        newColors = generateShades(colorEditorHook.currentColor);
        break;
      case 'complements':
        newColors = generateComplements(colorEditorHook.currentColor);
        break;
      case 'random':
        newColors = generateRandomPalette();
        break;
      case 'fromExisting':
        setSelectedGenerationType('fromExisting');
        setPaletteSelectionMode(true);
        return;
      case 'expand':
        setSelectedGenerationType('expand');
        setPaletteSelectionMode(true);
        return;
      case 'modify':
        setSelectedGenerationType('modify');
        setShowModificationDialog(true);
        return;
      default:
        return;
    }

    if (newColors.length > 0) {
      const newPalette = {
        id: Date.now().toString(),
        name: `Generated ${type.charAt(0).toUpperCase() + type.slice(1)}`,
        colors: generatePalette(newColors)
      };
      paletteHook.setPalettes([...paletteHook.palettes, newPalette]);
    }
  };

  return (
    <div className={`min-h-screen bg-neutral-800 text-neutral-100 p-2 sm:p-4 lg:p-6 relative ${paletteSelectionMode || showModificationDialog ? 'overflow-hidden' : ''}`}>
      {/* Overlay dialogs */}
      <PaletteSelectionOverlay
        paletteSelectionMode={paletteSelectionMode}
        selectedGenerationType={selectedGenerationType}
        cancelPaletteSelection={cancelPaletteSelection}
      />
      
      <ModificationDialog
        showModificationDialog={showModificationDialog}
        setShowModificationDialog={setShowModificationDialog}
        setSelectedGenerationType={setSelectedGenerationType}
      />
      
      <DeleteConfirmDialog
        showDeleteConfirm={paletteHook.showDeleteConfirm}
        paletteToDelete={paletteHook.paletteToDelete}
        handleDeleteConfirm={paletteHook.handleDeleteConfirm}
        handleDeleteCancel={paletteHook.handleDeleteCancel}
        xlIconSize={xlIconSize}
      />

      <div className="max-w-7xl mx-auto">
        <div className="flex items-start gap-8">
          {/* Left: Color Editor */}
          <ColorEditor
            // Color state
            currentColor={colorEditorHook.currentColor}
            setCurrentColor={colorEditorHook.setCurrentColor}
            rgbValues={colorEditorHook.rgbValues}
            normalizedRgbValues={colorEditorHook.normalizedRgbValues}
            handleRgbChange={colorEditorHook.handleRgbChange}
            handleNormalizedRgbChange={colorEditorHook.handleNormalizedRgbChange}
            
            // Name editing
            isEditingName={colorEditorHook.isEditingName}
            setIsEditingName={colorEditorHook.setIsEditingName}
            editNameValue={colorEditorHook.editNameValue}
            setEditNameValue={colorEditorHook.setEditNameValue}
            saveNameEdit={enhancedSaveNameEdit}
            currentEditingName={colorEditorHook.currentEditingName}
            
            // Layout and mode
            useCompactLayout={useCompactLayout}
            paletteModificationMode={paletteModificationMode}
            paletteSelectionMode={paletteSelectionMode}
            
            // Editing state
            editingChip={colorEditorHook.editingChip}
            cancelColorEdit={colorEditorHook.cancelColorEdit}
            
            // Palette modification
            selectedPaletteForModification={selectedPaletteForModification}
            modifiedPaletteColors={modifiedPaletteColors}
            cancelPaletteModification={cancelPaletteModification}
            saveModifiedPalette={saveModifiedPalette}
            
            // Resize handling
            pickerContainerRef={pickerContainerRef}
            preservedPickerWidth={preservedPickerWidth}
            pickerWidth={pickerWidth}
            isResizing={isResizing}
            handleResizeStart={handleResizeStart}
            
            // Icon sizes
            largeIconSize={largeIconSize}
            mediumIconSize={mediumIconSize}
          />

          {/* Right: Palette List */}
          <PaletteList
            // Palette data
            palettes={paletteHook.palettes}
            
            // New palette creation
            showNewPaletteInput={paletteHook.showNewPaletteInput}
            setShowNewPaletteInput={paletteHook.setShowNewPaletteInput}
            newPaletteName={paletteHook.newPaletteName}
            setNewPaletteName={paletteHook.setNewPaletteName}
            createPalette={paletteHook.createPalette}
            
            // Mode states
            paletteSelectionMode={paletteSelectionMode}
            showModificationDialog={showModificationDialog}
            paletteModificationMode={paletteModificationMode}
            
            // Palette card props
            selectedPaletteForModification={selectedPaletteForModification}
            hoveredPaletteId={hoveredPaletteId}
            setHoveredPaletteId={setHoveredPaletteId}
            expandedPalettes={paletteHook.expandedPalettes}
            togglePaletteExpansion={paletteHook.togglePaletteExpansion}
            handlePaletteSelection={handlePaletteSelection}
            handlePaletteSelectionForModification={handlePaletteSelectionForModification}
            confirmDeletePalette={paletteHook.confirmDeletePalette}
            editingChip={colorEditorHook.editingChip}
            handleColorClick={enhancedColorClick}
            handleColorDoubleClick={enhancedColorDoubleClick}
            addColorToPalette={enhancedAddColorToPalette}
            removeColorFromPalette={paletteHook.removeColorFromPalette}
            handleDragStart={handleDragStart}
            handleDragOver={handleDragOver}
            handleColorDragOver={handleColorDragOver}
            handleColorDragLeave={handleColorDragLeave}
            handleDragEnd={handleDragEnd}
            handleDrop={handleDrop}
            dragOverTarget={dragOverTarget}
            draggedColor={draggedColor}
            
            // Icon sizes
            xlIconSize={xlIconSize}
          />
        </div>
      </div>

      {/* Floating Generate Button */}
      <GenerationMenu 
        onGenerateOption={handleGenerateOption}
        isDisabled={paletteSelectionMode || paletteModificationMode}
      />
    </div>
  );
};

export default ColorPickerApp; 