import React from 'react';
import { Trash2, ChevronDown, ChevronRight, Plus, X } from 'lucide-react';
import FittedText from '../ui/FittedText';
import { getContrastColor } from '../utils/colorUtils';

/**
 * PaletteCard - Individual palette display with colors, drag/drop, and controls
 */
const PaletteCard = ({
  palette,
  
  // Selection and mode states
  paletteSelectionMode,
  showModificationDialog,
  paletteModificationMode,
  selectedPaletteForModification,
  hoveredPaletteId,
  setHoveredPaletteId,
  
  // Expansion state
  expandedPalettes,
  togglePaletteExpansion,
  
  // Event handlers
  handlePaletteSelection,
  handlePaletteSelectionForModification,
  confirmDeletePalette,
  
  // Color interaction
  editingChip,
  handleColorClick,
  handleColorDoubleClick,
  addColorToPalette,
  removeColorFromPalette,
  
  // Drag and drop
  handleDragStart,
  handleDragOver,
  handleColorDragOver,
  handleColorDragLeave,
  handleDragEnd,
  handleDrop,
  dragOverTarget,
  draggedColor,
  
  // Icon sizes
  smallIconSize = 14,
  mediumIconSize = 16,
  largeIconSize = 20
}) => {
  const isExpanded = expandedPalettes.has(palette.id);
  
  return (
    <div
      key={palette.id}
      className={`rounded-lg p-3 sm:p-4 relative transition-all duration-200 group ${
        (paletteSelectionMode || showModificationDialog)
          ? 'cursor-pointer hover:scale-105 bg-neutral-600 hover:bg-neutral-500 shadow-lg hover:shadow-xl ring-2 ring-purple-500/30 hover:ring-purple-500/50 z-40' 
          : paletteModificationMode && selectedPaletteForModification?.id === palette.id
          ? 'bg-neutral-600 shadow-lg z-40'
          : 'bg-neutral-700'
      } ${
        (paletteSelectionMode || showModificationDialog) && hoveredPaletteId === palette.id
          ? 'palette-selection-border shadow-2xl'
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
      {!(paletteSelectionMode || showModificationDialog || paletteModificationMode) && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            confirmDeletePalette(palette);
          }}
          className="absolute -top-4 -right-4 w-10 h-10 bg-red-500/80 hover:bg-red-600/90 rounded-lg flex items-center justify-center text-white shadow-xl transition-all z-20 opacity-0 group-hover:opacity-100 border-2 border-white/30 hover:border-white/60"
          title="Delete palette"
        >
          <Trash2 size={24} />
        </button>
      )}

      {/* Palette header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 flex-1">
          {!(paletteSelectionMode || showModificationDialog) && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                togglePaletteExpansion(palette.id);
              }}
              className="text-neutral-400 hover:text-neutral-100 transition-colors p-1"
              title={isExpanded ? "Collapse palette" : "Expand palette"}
            >
              {isExpanded ? (
                <ChevronDown size={mediumIconSize} />
              ) : (
                <ChevronRight size={mediumIconSize} />
              )}
            </button>
          )}
          {!(paletteSelectionMode || showModificationDialog) && (
            <span className="text-sm text-neutral-400">
              {palette.colors.length} colors
            </span>
          )}
          <h3 className="text-lg font-semibold text-neutral-100 truncate">
            {palette.name}
          </h3>
        </div>
      </div>

      {/* Color chips */}
      <div className={`${
        isExpanded 
          ? 'grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6' 
          : 'flex flex-row items-center flex-1 overflow-visible'
      } transition-all duration-300 ease-in-out`}
      style={isExpanded ? {
        // Ensure equal spacing in both directions
        gap: '16px',
        gridTemplateColumns: 'repeat(auto-fit, minmax(63px, 63px))',
        justifyContent: 'start',
        alignItems: 'start'
      } : {}}
      >
        {(isExpanded ? palette.colors : palette.colors).map((color, index) => (
          <div
            key={color.id}
            className={`relative color-chip-group aspect-square rounded border-2 transition-all duration-300 ease-in-out flex-shrink-0 overflow-visible ${
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
              backgroundColor: color.hex, 
              minWidth: '48px', 
              minHeight: '48px', 
              width: '63px', 
              height: '63px', 
              maxWidth: '72px', 
              maxHeight: '72px', 
              padding: '6px',
              ...(isExpanded ? {
                // Expanded mode: no overlap, fixed size
                margin: '0',
                zIndex: 1
              } : {
                // Collapsed mode: original overlap logic
                marginLeft: index === 0 ? '0' : (() => {
                  const chipWidth = 63;
                  const chipSpacing = 16; // Same spacing as expanded mode
                  // Use a much more aggressive container width calculation
                  // Account for the add button and count display space
                  const containerWidth = 600; // Reduced to account for add button and count
                  const maxChipsWithoutOverlap = Math.floor((containerWidth - chipSpacing) / (chipWidth + chipSpacing));
                  
                  // If we have fewer chips than can fit with proper spacing, use consistent spacing
                  if (palette.colors.length <= maxChipsWithoutOverlap) {
                    return `${chipSpacing}px`;
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
            onClick={(e) => {
              e.stopPropagation();
              if (!(paletteSelectionMode || showModificationDialog)) {
                handleColorClick(palette.id, color);
              }
            }}
            onDoubleClick={(e) => {
              e.stopPropagation();
              if (!(paletteSelectionMode || showModificationDialog)) {
                handleColorDoubleClick(color);
              }
            }}
            draggable={!(paletteSelectionMode || showModificationDialog)}
            onDragStart={(e) => !(paletteSelectionMode || showModificationDialog) && handleDragStart(e, color, palette.id)}
            onDragOver={(e) => !(paletteSelectionMode || showModificationDialog) && handleColorDragOver(e, palette.id, color.id)}
            onDragLeave={(e) => !(paletteSelectionMode || showModificationDialog) && handleColorDragLeave(e)}
            onDragEnd={(e) => !(paletteSelectionMode || showModificationDialog) && handleDragEnd(e)}
            onDrop={(e) => !(paletteSelectionMode || showModificationDialog) && handleDrop(e, palette.id, color.id)}
            title={color.name || color.hex}
          >
            {/* Color name overlay */}
            <FittedText 
              text={color.name || ""} 
              color={getContrastColor(color.hex)}
              className="pointer-events-none"
            />
            
            {/* Remove button */}
            {!(paletteSelectionMode || showModificationDialog) && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeColorFromPalette(palette.id, color.id);
                }}
                className="color-chip-remove absolute -top-6 -right-2 w-12 h-12 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 color-chip-group-hover:opacity-100 transition-opacity z-10"
                title="Remove color"
              >
                <X size={18} className="flex-shrink-0" />
              </button>
            )}
          </div>
        ))}
        
        {/* Add color button */}
        {!(paletteSelectionMode || showModificationDialog) && (
          <div
            className="relative aspect-square rounded border-2 border-dashed border-neutral-500 hover:border-neutral-300 bg-neutral-800/50 hover:bg-neutral-700/50 cursor-pointer flex items-center justify-center transition-all duration-300 ease-in-out flex-shrink-0 overflow-visible"
            style={{
              minWidth: '48px', 
              minHeight: '48px', 
              width: '63px', 
              height: '63px', 
              maxWidth: '72px', 
              maxHeight: '72px', 
              padding: '6px',
              ...(isExpanded ? {
                // Expanded mode: no overlap, fixed size
                margin: '0',
                zIndex: 1
              } : {
                // Collapsed mode: original margin logic
                marginLeft: (() => {
                  const chipWidth = 63;
                  const chipSpacing = 16; // Same spacing as expanded mode
                  const containerWidth = 600;
                  const maxChipsWithoutOverlap = Math.floor((containerWidth - chipSpacing) / (chipWidth + chipSpacing));
                  
                  // If we have fewer chips than can fit with proper spacing, use consistent spacing
                  if (palette.colors.length <= maxChipsWithoutOverlap) {
                    return `${chipSpacing}px`;
                  }
                  
                  // Use 8px spacing when overlap is needed (original behavior)
                  return '8px';
                })(),
                zIndex: 1
              })
            }}
            onClick={(e) => {
              e.stopPropagation();
              addColorToPalette(palette.id);
            }}
            onDragOver={(e) => handleDragOver(e)}
            onDrop={(e) => handleDrop(e, palette.id)}
            title="Add current color to palette"
          >
            <Plus 
              size={isExpanded ? largeIconSize : mediumIconSize} 
              className="text-neutral-400 group-hover:text-neutral-200" 
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default PaletteCard; 