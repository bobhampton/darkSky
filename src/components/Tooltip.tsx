import { useState } from 'react';
import { Info } from 'lucide-react';

interface TooltipProps {
  text: string;
}

/**
 * Tooltip component that displays helpful information on hover
 * Matches the legacy version's info icon style
 */
export function Tooltip({ text }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <span 
      className="relative inline-block ml-1"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      <Info 
        className="inline-block text-blue-400 cursor-help"
        size={16}
        aria-label="Information"
      />
      {isVisible && (
        <span
          role="tooltip"
          className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 
                     px-3 py-2 text-xs text-white bg-black border border-purple-500 rounded-md shadow-lg 
                     z-50 pointer-events-none w-64
                     before:content-[''] before:absolute before:top-full before:left-1/2 
                     before:transform before:-translate-x-1/2 before:border-4 
                     before:border-transparent before:border-t-black"
        >
          {text}
        </span>
      )}
    </span>
  );
}
