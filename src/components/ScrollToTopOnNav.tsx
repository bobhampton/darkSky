import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Component that scrolls window to top on route changes
 * Must be placed inside Router but outside Routes
 */
export function ScrollToTopOnNav() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
