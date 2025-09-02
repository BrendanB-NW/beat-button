import React, { useState, useRef, useEffect } from 'react';
import { HelpCircle } from 'lucide-react';

interface TooltipProps {
  content: string;
  children?: React.ReactNode;
  showIcon?: boolean;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export function Tooltip({ 
  content, 
  children, 
  showIcon = true, 
  position = 'top',
  className = ''
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [actualPosition, setActualPosition] = useState(position);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVisible && tooltipRef.current && triggerRef.current) {
      const tooltip = tooltipRef.current;
      const trigger = triggerRef.current;
      const rect = trigger.getBoundingClientRect();
      const tooltipRect = tooltip.getBoundingClientRect();
      
      // Check if tooltip would go off screen and adjust position
      let newPosition = position;
      
      if (position === 'top' && rect.top - tooltipRect.height < 0) {
        newPosition = 'bottom';
      } else if (position === 'bottom' && rect.bottom + tooltipRect.height > window.innerHeight) {
        newPosition = 'top';
      } else if (position === 'left' && rect.left - tooltipRect.width < 0) {
        newPosition = 'right';
      } else if (position === 'right' && rect.right + tooltipRect.width > window.innerWidth) {
        newPosition = 'left';
      }
      
      setActualPosition(newPosition);
    }
  }, [isVisible, position]);

  const getTooltipStyles = () => {
    const baseStyles = 'absolute z-50 px-3 py-2 text-sm bg-gray-900 text-white rounded-lg shadow-lg border border-gray-700 whitespace-nowrap max-w-xs';
    
    switch (actualPosition) {
      case 'top':
        return `${baseStyles} bottom-full left-1/2 transform -translate-x-1/2 mb-2`;
      case 'bottom':
        return `${baseStyles} top-full left-1/2 transform -translate-x-1/2 mt-2`;
      case 'left':
        return `${baseStyles} right-full top-1/2 transform -translate-y-1/2 mr-2`;
      case 'right':
        return `${baseStyles} left-full top-1/2 transform -translate-y-1/2 ml-2`;
      default:
        return `${baseStyles} bottom-full left-1/2 transform -translate-x-1/2 mb-2`;
    }
  };

  const getArrowStyles = () => {
    const baseArrow = 'absolute w-2 h-2 bg-gray-900 border border-gray-700 transform rotate-45';
    
    switch (actualPosition) {
      case 'top':
        return `${baseArrow} top-full left-1/2 -translate-x-1/2 -mt-1 border-t-0 border-l-0`;
      case 'bottom':
        return `${baseArrow} bottom-full left-1/2 -translate-x-1/2 -mb-1 border-b-0 border-r-0`;
      case 'left':
        return `${baseArrow} left-full top-1/2 -translate-y-1/2 -ml-1 border-l-0 border-b-0`;
      case 'right':
        return `${baseArrow} right-full top-1/2 -translate-y-1/2 -mr-1 border-r-0 border-t-0`;
      default:
        return `${baseArrow} top-full left-1/2 -translate-x-1/2 -mt-1 border-t-0 border-l-0`;
    }
  };

  return (
    <div 
      ref={triggerRef}
      className={`relative inline-flex items-center ${className}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children || (showIcon && (
        <button
          type="button"
          className="text-gray-400 hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-full p-1"
          aria-label="Help"
        >
          <HelpCircle size={16} />
        </button>
      ))}
      
      {isVisible && (
        <div ref={tooltipRef} className={getTooltipStyles()}>
          <div className={getArrowStyles()} />
          <div className="relative z-10 whitespace-pre-wrap break-words">
            {content}
          </div>
        </div>
      )}
    </div>
  );
}