import { Link, useLocation } from 'react-router-dom';

/**
 * Navigation bar component
 * Displays on all pages with brand and navigation links
 */
export function Navbar() {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="sticky top-0 z-40 bg-gray-800 border-b border-gray-700 shadow-lg">
      {/* Gradient top border */}
      <div className="h-1 bg-gradient-to-r from-transparent via-purple-500/40 via-cyan-500/40 via-fuchsia-500/40 to-transparent"></div>
      <div className="px-4">
        <div className="flex items-center h-16 space-x-6">
          {/* Brand/Logo */}
          <Link
            to="/"
            className="text-xl font-bold text-blue-400 hover:text-blue-300 transition-colors"
          >
            Dark Sky Times
          </Link>

          {/* Vertical Divider */}
          <div className="h-8 w-px bg-gray-600"></div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-6">
            <Link
              to="/"
              className={`text-sm transition-colors pb-1 border-b-2 ${
                isActive('/')
                  ? 'text-purple-400 border-purple-500 font-semibold'
                  : 'text-gray-300 hover:text-white border-transparent'
              }`}
            >
              Home
            </Link>
            <Link
              to="/getting-started"
              className={`text-sm transition-colors pb-1 border-b-2 ${
                isActive('/getting-started')
                  ? 'text-purple-400 border-purple-500 font-semibold'
                  : 'text-gray-300 hover:text-white border-transparent'
              }`}
            >
              Getting Started
            </Link>
            {/* <Link
              to="/partners"
              className={`text-sm transition-colors pb-1 border-b-2 ${
                isActive('/partners')
                  ? 'text-purple-400 border-purple-500 font-semibold'
                  : 'text-gray-300 hover:text-white border-transparent'
              }`}
            >
              Partners & Resources
            </Link> */}
          </div>
        </div>
      </div>
    </nav>
  );
}
