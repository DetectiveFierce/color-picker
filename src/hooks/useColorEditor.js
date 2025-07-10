import { useState, useEffect } from 'react';
import { hexToRgb, generateColorName } from '../components/utils/colorUtils';

/**
 * Custom hook for managing color editor state
 */
const useColorEditor = () => {
  const [currentColor, setCurrentColor] = useState("#ff0000");
  const [rgbValues, setRgbValues] = useState({ r: 255, g: 0, b: 0 });
  const [normalizedRgbValues, setNormalizedRgbValues] = useState({ r: 1.000, g: 0.000, b: 0.000 });
  
  // Name editing
  const [isEditingName, setIsEditingName] = useState(false);
  const [editNameValue, setEditNameValue] = useState("");
  
  // Editing state
  const [editingChip, setEditingChip] = useState(null);
  const [originalColor, setOriginalColor] = useState(null);

  // Update RGB values when color changes
  useEffect(() => {
    const rgb = hexToRgb(currentColor);
    if (rgb) {
      setRgbValues({ r: rgb.r, g: rgb.g, b: rgb.b });
      setNormalizedRgbValues({ 
        r: rgb.r / 255, 
        g: rgb.g / 255, 
        b: rgb.b / 255 
      });
    }
  }, [currentColor]);

  const handleRgbChange = (component, value) => {
    const numValue = parseInt(value) || 0;
    const clampedValue = Math.max(0, Math.min(255, numValue));
    
    const newRgb = { ...rgbValues, [component]: clampedValue };
    setRgbValues(newRgb);
    
    const hexValue = `#${newRgb.r.toString(16).padStart(2, '0')}${newRgb.g.toString(16).padStart(2, '0')}${newRgb.b.toString(16).padStart(2, '0')}`;
    setCurrentColor(hexValue);
  };

  const handleNormalizedRgbChange = (component, value) => {
    const numValue = parseFloat(value) || 0;
    const clampedValue = Math.max(0, Math.min(1, numValue));
    
    const newNormalizedRgb = { ...normalizedRgbValues, [component]: clampedValue };
    setNormalizedRgbValues(newNormalizedRgb);
    
    const rgbValue = Math.round(clampedValue * 255);
    const newRgb = { ...rgbValues, [component]: rgbValue };
    setRgbValues(newRgb);
    
    const hexValue = `#${newRgb.r.toString(16).padStart(2, '0')}${newRgb.g.toString(16).padStart(2, '0')}${newRgb.b.toString(16).padStart(2, '0')}`;
    setCurrentColor(hexValue);
  };

  const saveNameEdit = () => {
    // This would typically save to the current editing chip
    setIsEditingName(false);
  };

  const handleColorClick = (paletteId, color) => {
    setEditingChip({ paletteId, colorId: color.id });
    setOriginalColor(currentColor);
    setCurrentColor(color.hex);
    setEditNameValue(color.name || generateColorName(color.hex));
  };

  const handleColorDoubleClick = (color) => {
    setCurrentColor(color.hex);
  };

  const saveColorEdit = () => {
    // This would be handled by the parent component
    setEditingChip(null);
    setOriginalColor(null);
  };

  const cancelColorEdit = () => {
    if (originalColor) {
      setCurrentColor(originalColor);
    }
    setEditingChip(null);
    setOriginalColor(null);
  };

  // Compute current editing name
  const currentEditingName = editingChip ? editNameValue : generateColorName(currentColor);

  return {
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
    
    // Editing state
    editingChip,
    setEditingChip,
    originalColor,
    handleColorClick,
    handleColorDoubleClick,
    saveColorEdit,
    cancelColorEdit
  };
};

export default useColorEditor; 