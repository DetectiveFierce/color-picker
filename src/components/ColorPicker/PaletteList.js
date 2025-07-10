import React from 'react';
import { Plus } from 'lucide-react';
import PaletteCard from './PaletteCard';

/**
 * PaletteList - Container for all palettes and new palette creation
 */
const PaletteList = ({
  // Palette data
  palettes,
  
  // New palette creation
  showNewPaletteInput,
  setShowNewPaletteInput,
  newPaletteName,
  setNewPaletteName,
  createPalette,
  
  // Mode states
  paletteSelectionMode,
  showModificationDialog,
  paletteModificationMode,
  
  // All palette card props
  selectedPaletteForModification,
  hoveredPaletteId,
  setHoveredPaletteId,
  expandedPalettes,
  togglePaletteExpansion,
  handlePaletteSelection,
  handlePaletteSelectionForModification,
  confirmDeletePalette,
  editingChip,
  handleColorClick,
  handleColorDoubleClick,
  addColorToPalette,
  removeColorFromPalette,
  handleDragStart,
  handleDragOver,
  handleColorDragOver,
  handleColorDragLeave,
  handleDragEnd,
  handleDrop,
  dragOverTarget,
  draggedColor,
  
  // Icon sizes
  xlIconSize = 24
}) => {
  return (
    <div className="flex-1 min-w-0">
      {/* Header */}
      <div className={`${paletteSelectionMode ? 'blur-sm opacity-50' : ''} ${paletteModificationMode ? 'blur-sm opacity-50' : ''}`}>
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-0 text-neutral-100 text-right flex items-baseline justify-end">
          <span className="color-cycle-text mt-3" style={{ position: "relative", top: "0.4em", display: "inline-block" }}>
            <b><i>Hue</i></b>
          </span>
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
          </div>
        </div>
      </div>

      {/* Palette list */}
      <div className={`space-y-4 ${paletteSelectionMode ? '' : ''}`}>
        {palettes.map((palette) => (
          <PaletteCard
            key={palette.id}
            palette={palette}
            paletteSelectionMode={paletteSelectionMode}
            showModificationDialog={showModificationDialog}
            paletteModificationMode={paletteModificationMode}
            selectedPaletteForModification={selectedPaletteForModification}
            hoveredPaletteId={hoveredPaletteId}
            setHoveredPaletteId={setHoveredPaletteId}
            expandedPalettes={expandedPalettes}
            togglePaletteExpansion={togglePaletteExpansion}
            handlePaletteSelection={handlePaletteSelection}
            handlePaletteSelectionForModification={handlePaletteSelectionForModification}
            confirmDeletePalette={confirmDeletePalette}
            editingChip={editingChip}
            handleColorClick={handleColorClick}
            handleColorDoubleClick={handleColorDoubleClick}
            addColorToPalette={addColorToPalette}
            removeColorFromPalette={removeColorFromPalette}
            handleDragStart={handleDragStart}
            handleDragOver={handleDragOver}
            handleColorDragOver={handleColorDragOver}
            handleColorDragLeave={handleColorDragLeave}
            handleDragEnd={handleDragEnd}
            handleDrop={handleDrop}
            dragOverTarget={dragOverTarget}
            draggedColor={draggedColor}
          />
        ))}
        
        {/* New palette creation */}
        {showNewPaletteInput && (
          <div className={`bg-neutral-700 rounded-lg p-3 sm:p-4 relative transition-all duration-200 border-2 border-purple-500/30 ${paletteModificationMode ? 'blur-sm opacity-50' : ''}`}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <input
                type="text"
                value={newPaletteName}
                onChange={(e) => setNewPaletteName(e.target.value)}
                placeholder="Enter palette name..."
                className="flex-1 bg-neutral-800 border border-neutral-600 rounded px-3 py-2 text-neutral-100 text-sm focus:border-purple-500 focus:outline-none"
                onKeyPress={(e) => e.key === "Enter" && createPalette()}
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={createPalette}
                  className="px-4 py-2 rounded text-white transition-all duration-200 text-sm font-medium color-cycle-border"
                  disabled={!newPaletteName.trim()}
                >
                  Create Palette
                </button>
                <button
                  onClick={() => setShowNewPaletteInput(false)}
                  className="px-4 py-2 bg-neutral-500 hover:bg-neutral-600 rounded text-white transition-colors text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* New Palette Frame */}
        {!showNewPaletteInput && (
          <div className={`bg-neutral-800 rounded-lg p-3 sm:p-4 relative ${paletteModificationMode ? 'blur-sm opacity-50' : ''}`}>
            <button
              onClick={() => setShowNewPaletteInput(true)}
              className="w-full h-24 sm:h-32 border-2 border-dashed border-neutral-600 hover:border-neutral-400 bg-neutral-800 hover:bg-neutral-700 rounded-lg flex items-center justify-center transition-all group"
              title="Create new palette"
            >
              <div className="flex flex-col items-center space-y-2">
                <Plus size={xlIconSize} className="text-neutral-400 group-hover:text-neutral-300 transition-colors" />
                <span className="text-sm text-neutral-400 group-hover:text-neutral-300 transition-colors font-medium">
                  New Palette
                </span>
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaletteList; 