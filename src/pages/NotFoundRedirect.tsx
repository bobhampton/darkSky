import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * Component that redirects unmatched routes to the error page with 404 code
 * This component renders nothing - it just performs the redirect
 */
export function NotFoundRedirect() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    navigate('/error', {
      replace: true,
      state: {
        code: 404,
        reason: `The page "${location.pathname}" could not be found.`,
      },
    });
  }, [navigate, location.pathname]);

  return null;
}
