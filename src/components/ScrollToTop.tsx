import { ArrowUp } from 'lucide-react';
import { useScrollPosition } from '@/hooks';

/**
 * Scroll to Top button component
 * Appears when user scrolls down and smoothly scrolls back to top when clicked
 */
export function ScrollToTop() {
  const isVisible = useScrollPosition(400);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      scrollToTop();
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <button
      onClick={scrollToTop}
      onKeyDown={handleKeyDown}
      aria-label="Scroll to top"
      className="fixed bottom-8 right-8 z-50 p-3 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg hover:shadow-xl hover:scale-110 transform transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-gray-900"
    >
      <ArrowUp className="w-6 h-6" />
    </button>
  );
}
