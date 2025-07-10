import React from 'react';

/**
 * ColorInputs - Handles the hex, RGB, and normalized RGB input fields
 * @param {string} currentColor - Current hex color value
 * @param {function} setCurrentColor - Function to update the current color
 * @param {object} rgbValues - RGB values {r, g, b}
 * @param {object} normalizedRgbValues - Normalized RGB values {r, g, b}
 * @param {function} handleRgbChange - Function to handle RGB changes
 * @param {function} handleNormalizedRgbChange - Function to handle normalized RGB changes
 * @param {boolean} useCompactLayout - Whether to use compact layout styling
 */
const ColorInputs = ({
  currentColor,
  setCurrentColor,
  rgbValues,
  normalizedRgbValues,
  handleRgbChange,
  handleNormalizedRgbChange,
  useCompactLayout = false
}) => {
  const inputClasses = useCompactLayout 
    ? "input-hex w-full" 
    : "input-hex w-full";
    
  const containerClasses = useCompactLayout
    ? "flex flex-col gap-1 flex-shrink-0 justify-center"
    : "w-full max-w-xs";
    
  const inputGroupClasses = useCompactLayout
    ? ""
    : "flex flex-col gap-2 w-full";
    
  const inputStyle = useCompactLayout
    ? { fontSize: '1rem' }
    : {};

  return (
    <div className={containerClasses}>
      <div className={inputGroupClasses}>
        {/* Hex Input */}
        <input
          type="text"
          value={currentColor}
          onChange={(e) => setCurrentColor(e.target.value)}
          className={inputClasses}
          placeholder="#000000"
          style={inputStyle}
        />
        
        {/* RGB Input */}
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
          className={inputClasses}
          placeholder="255, 255, 255"
          style={inputStyle}
        />
        
        {/* Normalized RGB Input */}
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
          className={inputClasses}
          placeholder="1.000, 1.000, 1.000"
          style={inputStyle}
        />
      </div>
    </div>
  );
};

export default ColorInputs; 