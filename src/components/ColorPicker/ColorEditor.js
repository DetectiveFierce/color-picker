import React, { useRef } from 'react';
import { Pencil, X } from 'lucide-react';
import ColorSquare from './ColorSquare';
import ColorSliders from './ColorSliders';
import ColorInputs from './ColorInputs';
import { hexToHsl } from '../utils/colorUtils';

/**
 * ColorEditor - The entire left-side color picker section
 */
const ColorEditor = ({
  // Color state
  currentColor,
  setCurrentColor,
  rgbValues,
  normalizedRgbValues,
  handleRgbChange,
  handleNormalizedRgbChange,
  
  // Name editing
  isEditingName,
  setIsEditingName,
  editNameValue,
  setEditNameValue,
  saveNameEdit,
  currentEditingName,
  
  // Layout and mode
  useCompactLayout,
  paletteModificationMode,
  paletteSelectionMode,
  
  // Editing state
  editingChip,
  cancelColorEdit,
  
  // Palette modification
  selectedPaletteForModification,
  modifiedPaletteColors,
  cancelPaletteModification,
  saveModifiedPalette,
  
  // Resize handling
  pickerContainerRef,
  preservedPickerWidth,
  pickerWidth,
  isResizing,
  handleResizeStart,
  
  // Icon sizes
  largeIconSize = 20,
  mediumIconSize = 16
}) => {
  const nameInputRef = useRef(null);

  return (
    <div 
      ref={pickerContainerRef}
      style={{ 
        width: paletteModificationMode && preservedPickerWidth 
          ? `${preservedPickerWidth}px` 
          : pickerWidth 
            ? `${pickerWidth}px` 
            : 'auto', 
        minWidth: useCompactLayout ? '400px' : '300px',
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
        {/* Color name editor */}
        <div className="flex flex-col items-start w-full">
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
                  style={{ justifyContent: 'flex-start', textAlign: 'left' }}
                >
                  {currentEditingName || <span className="italic text-neutral-400">(No Name)</span>}
                  <Pencil size={largeIconSize} className="ml-1 text-amber-400 opacity-70 group-hover:opacity-100" />
                </div>
              )}
            </>
          )}
        </div>

        {/* Color picker main content */}
        <div className="flex flex-col gap-3 w-full">
          {useCompactLayout ? (
            /* Compact layout */
            <div className="space-y-3 w-full">
              <div className="flex flex-row items-stretch gap-3 w-full" style={{height: '120px'}}>
                <div
                  className="color-swatch color-swatch-large flex-shrink-0"
                  style={{ backgroundColor: currentColor, width: '120px', height: '120px', minWidth: '120px', minHeight: '120px' }}
                />
                <ColorInputs
                  currentColor={currentColor}
                  setCurrentColor={setCurrentColor}
                  rgbValues={rgbValues}
                  normalizedRgbValues={normalizedRgbValues}
                  handleRgbChange={handleRgbChange}
                  handleNormalizedRgbChange={handleNormalizedRgbChange}
                  useCompactLayout={true}
                />
              </div>
              
              {/* Color square in its own row */}
              <div className="w-full" style={{height: '120px'}}>
                <ColorSquare
                  hue={(() => { const hsl = hexToHsl(currentColor); return hsl ? hsl.h : 0; })()}
                  size={120}
                  color={currentColor}
                  onChange={setCurrentColor}
                />
              </div>
            </div>
          ) : (
            /* Normal layout */
            <div className="space-y-3 flex-shrink-0 w-full">
              <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
                <div
                  className="color-swatch color-swatch-large flex-shrink-0 w-full max-w-[160px]"
                  style={{ backgroundColor: currentColor }}
                />
                <ColorInputs
                  currentColor={currentColor}
                  setCurrentColor={setCurrentColor}
                  rgbValues={rgbValues}
                  normalizedRgbValues={normalizedRgbValues}
                  handleRgbChange={handleRgbChange}
                  handleNormalizedRgbChange={handleNormalizedRgbChange}
                  useCompactLayout={false}
                />
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

          {/* Sliders */}
          <div className="flex-1 min-w-0 w-full">
            <ColorSliders
              color={currentColor}
              onChange={setCurrentColor}
              modificationMode={paletteModificationMode}
            />
          </div>
        </div>

        {/* Cancel button for editing */}
        {editingChip && (
          <div className="flex">
            <button
              onClick={cancelColorEdit}
              className="btn-secondary w-full flex items-center justify-center gap-2"
            >
              <X size={mediumIconSize} />
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
                <X size={mediumIconSize} />
                <span>Cancel</span>
              </button>
              <button
                onClick={saveModifiedPalette}
                className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 rounded text-white transition-colors text-sm flex items-center justify-center gap-2"
              >
                <span>Save as New Palette</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ColorEditor; 