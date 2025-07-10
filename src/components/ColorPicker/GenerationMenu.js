import React, { useState, useRef, useEffect } from "react";
import { Plus, Palette, Copy, Shuffle, ArrowRight, Sparkles } from "lucide-react";

// Custom hook to get responsive icon size based on DPR
const useResponsiveIconSize = (baseSize = 16) => {
  const [iconSize, setIconSize] = useState(baseSize);

  useEffect(() => {
    const updateIconSize = () => {
      const dpr = window.devicePixelRatio || 1;
      const responsiveSize = Math.max(baseSize, Math.min(baseSize * 1.5, baseSize * dpr * 0.8));
      setIconSize(Math.round(responsiveSize));
    };

    updateIconSize();
    window.addEventListener('resize', updateIconSize);
    
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(resolution: 1dppx)');
      mediaQuery.addEventListener('change', updateIconSize);
    }

    return () => {
      window.removeEventListener('resize', updateIconSize);
      if (window.matchMedia) {
        const mediaQuery = window.matchMedia('(resolution: 1dppx)');
        mediaQuery.removeEventListener('change', updateIconSize);
      }
    };
  }, [baseSize]);

  return iconSize;
};

// Menu item component with hover state
const MenuItemWithHover = ({ item, Icon, iconSize, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="relative overflow-hidden"
      style={{
        transform: isHovered ? 'scale(1.08)' : 'scale(1)',
        borderRadius: '16px',
        transition: 'all 0.3s ease-in-out',
      }}
    >
      {/* Animated border layer - positioned to be visible */}
      <div 
        className={`absolute inset-0 ${isHovered ? 'color-cycle-border' : ''}`}
        style={{
          zIndex: 1,
          opacity: isHovered ? 1 : 0,
          borderRadius: '16px',
          transition: 'all 0.3s ease-in-out',
        }}
      />
      
      {/* Background blur layers - constrained within container */}
      <div 
        className="absolute inset-0"
        style={{
          background: isHovered ? 'rgba(128, 128, 128, 0.12)' : 'rgba(128, 128, 128, 0.08)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: '16px',
          transition: 'all 0.3s ease-in-out',
          zIndex: 2
        }}
      />
      <div 
        className="absolute inset-0"
        style={{
          background: isHovered ? 'rgba(96, 96, 96, 0.25)' : 'rgba(96, 96, 96, 0.2)',
          backdropFilter: 'blur(40px) saturate(180%)',
          WebkitBackdropFilter: 'blur(40px) saturate(180%)',
          borderRadius: '16px',
          transition: 'all 0.3s ease-in-out',
          zIndex: 3
        }}
      />
      <div 
        className="absolute inset-0"
        style={{
          background: isHovered ? 'rgba(80, 80, 80, 0.15)' : 'rgba(80, 80, 80, 0.1)',
          backdropFilter: 'blur(60px) saturate(200%)',
          WebkitBackdropFilter: 'blur(60px) saturate(200%)',
          border: `1px solid ${isHovered ? 'rgba(120, 120, 120, 0.3)' : 'rgba(120, 120, 120, 0.2)'}`,
          borderRadius: '16px',
          transition: 'all 0.3s ease-in-out',
          zIndex: 4
        }}
      />
      
      {/* Button content */}
      <button 
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative z-10 flex items-center space-x-3 px-6 py-4 text-base text-white hover:text-white w-full h-full"
        style={{ 
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          animation: 'generateButtonFluid 20s ease-in-out infinite',
          background: 'transparent',
          outline: 'none',
          borderRadius: '16px',
          transition: 'all 0.3s ease-in-out',
        }}
      >
        <Icon size={iconSize} className="text-neutral-200 flex-shrink-0" />
        <span className="font-semibold text-left flex-1 truncate">{item.text}</span>
      </button>
    </div>
  );
};

const GenerationMenu = ({ 
  onGenerateOption, 
  isDisabled = false,
  className = "" 
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  
  // Responsive icon sizes for HiDPI
  const mediumIconSize = useResponsiveIconSize(16);
  const xlIconSize = useResponsiveIconSize(24);

  const menuItems = [
    { icon: Plus, text: "Modify existing palette...", action: () => onGenerateOption('modify') },
    { icon: Palette, text: "Generate shades", action: () => onGenerateOption('shades') },
    { icon: Copy, text: "Generate complements", action: () => onGenerateOption('complements') },
    { icon: Shuffle, text: "Random palette", action: () => onGenerateOption('random') },
    { icon: ArrowRight, text: "Expand from existing...", action: () => onGenerateOption('expand') }
  ];

  // Handle clicking outside dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  const handleMenuToggle = () => {
    if (!isDisabled) {
      setShowDropdown(!showDropdown);
    }
  };

  const handleMenuItemClick = (action) => {
    action();
    setShowDropdown(false);
  };

  return (
    <div className={`fixed bottom-8 right-8 z-40 ${isDisabled ? 'blur-sm opacity-50' : ''} ${className}`}>
      <div className="relative" ref={dropdownRef}>
        {/* Menu Button */}
        <button
          onClick={handleMenuToggle}
          className="relative z-20 w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
          style={{
            animation: 'generateButtonFluid 20s ease-in-out infinite'
          }}
          title="Generate colors"
          disabled={isDisabled}
        >
          <Sparkles size={xlIconSize} className="text-white" />
        </button>

        {/* Menu Items Container */}
        {showDropdown && (
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2">
            {/* Connecting Bar */}
            <div 
              className="absolute left-1/2 transform -translate-x-1/2 w-2 origin-bottom"
              style={{
                height: `${menuItems.length * 80}px`,
                animation: `barGrow ${menuItems.length * 0.1}s ease-out forwards, barGlowOnly 20s ease-in-out infinite`,
                animationDelay: '0.1s',
                transform: 'translateX(-50%) scaleY(0)',
                bottom: 0,
                borderRadius: '4px',
                background: 'linear-gradient(135deg, #a855f7, #3b82f6)',
                zIndex: 10
              }}
            />
            
            {/* Menu Items */}
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={index}
                  className="absolute opacity-0"
                  style={{
                    animation: `fadeInUp 0.3s ease-out forwards`,
                    animationDelay: `${(index + 1) * 0.1}s`,
                    bottom: `${(index * 80) + 20}px`,
                    right: '50%',
                    paddingRight: '20px'
                  }}
                >
                  <MenuItemWithHover
                    item={item}
                    Icon={Icon}
                    iconSize={mediumIconSize}
                    onClick={() => handleMenuItemClick(item.action)}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default GenerationMenu;