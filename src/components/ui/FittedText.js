import React, { useRef } from 'react';
import useTextFit from '../../hooks/useTextFit';

// Component for text that fits within its container
const FittedText = ({ text, color, className = "" }) => {
  const containerRef = useRef(null);
  // Special case: force split for 'Goldenrod'
  let displayText = text;
  if (typeof text === 'string' && text.toLowerCase().includes('goldenrod')) {
    displayText = text.replace(/Goldenrod/i, 'Golden-\\nrod');
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
        {wrappedText.split('\\n').map((line, i) => (
          <React.Fragment key={i}>
            {line}
            {i < wrappedText.split('\\n').length - 1 && <br />}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default FittedText; 