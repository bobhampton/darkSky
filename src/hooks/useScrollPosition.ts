import { useState, useEffect } from 'react';

/**
 * Custom hook to track scroll position
 * @param threshold - The scroll position (in pixels) at which to trigger visibility
 * @returns boolean indicating if scroll position is past the threshold
 */
export function useScrollPosition(threshold: number = 400): boolean {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > threshold;
      setIsVisible(scrolled);
    };

    // Check initial scroll position
    handleScroll();

    // Add scroll event listener
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Cleanup
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [threshold]);

  return isVisible;
}
