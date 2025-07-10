import React from 'react';
import { X } from 'lucide-react';

/**
 * PaletteSelectionOverlay - Overlay for selecting palettes during generation
 */
export const PaletteSelectionOverlay = ({
  paletteSelectionMode,
  selectedGenerationType,
  cancelPaletteSelection
}) => {
  if (!paletteSelectionMode) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-30 pointer-events-none">
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
  );
};

/**
 * ModificationDialog - Overlay for palette modification selection
 */
export const ModificationDialog = ({
  showModificationDialog,
  setShowModificationDialog,
  setSelectedGenerationType
}) => {
  if (!showModificationDialog) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-30 pointer-events-none">
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
  );
};

/**
 * DeleteConfirmDialog - Confirmation dialog for palette deletion
 */
export const DeleteConfirmDialog = ({
  showDeleteConfirm,
  paletteToDelete,
  handleDeleteConfirm,
  handleDeleteCancel,
  xlIconSize = 24
}) => {
  if (!showDeleteConfirm) return null;

  return (
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
            <X size={xlIconSize} />
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
  );
}; 