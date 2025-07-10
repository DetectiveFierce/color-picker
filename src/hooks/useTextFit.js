import { useState, useEffect } from 'react';

// Custom hook to measure text and determine if it fits
const useTextFit = (text, containerRef) => {
  const [fontSize, setFontSize] = useState(12);
  const [shouldShow, setShouldShow] = useState(true);
  const [wrappedText, setWrappedText] = useState(text);

  useEffect(() => {
    if (!containerRef.current || !text) {
      setShouldShow(false);
      return;
    }

    const container = containerRef.current;
    const testDiv = document.createElement('div');
    testDiv.style.position = 'absolute';
    testDiv.style.visibility = 'hidden';
    testDiv.style.whiteSpace = 'normal';
    testDiv.style.wordBreak = 'break-word';
    testDiv.style.hyphens = 'auto';
    testDiv.style.lineHeight = '1';
    testDiv.style.textAlign = 'center';
    testDiv.style.fontFamily = window.getComputedStyle(container).fontFamily;
    testDiv.style.fontWeight = window.getComputedStyle(container).fontWeight;
    testDiv.textContent = text;
    
    document.body.appendChild(testDiv);
    
    const containerRect = container.getBoundingClientRect();
    const containerWidth = containerRect.width - 8; // Account for padding
    const containerHeight = containerRect.height - 8;
    
    let currentFontSize = 11;
    let fits = false;
    
    // Try to find the largest font size that fits
    while (currentFontSize >= 8) { // Increased minimum from 6 to 8
      testDiv.style.fontSize = `${currentFontSize}px`;
      // Force wrapping by setting a narrower width - this encourages multi-line
      const wrapWidth = Math.min(containerWidth, containerWidth * 0.8);
      testDiv.style.width = `${wrapWidth}px`;
      
      // Force a reflow to get accurate measurements
      // eslint-disable-next-line no-unused-expressions
      testDiv.offsetHeight;
      
      const textRect = testDiv.getBoundingClientRect();
      
      if (textRect.height <= containerHeight) {
        fits = true;
        break;
      }
      currentFontSize -= 1;
    }
    
    document.body.removeChild(testDiv);
    
    if (fits) {
      setFontSize(currentFontSize);
      setShouldShow(true);
      setWrappedText(text);
    } else {
      setShouldShow(false);
    }
  }, [text, containerRef]);

  return { fontSize, shouldShow, wrappedText };
};

export default useTextFit; 