import { useLocation, Link } from 'react-router-dom';
import { AlertCircle, Home, BookOpen, HelpCircle, Shield, Calculator } from 'lucide-react';
import { usePageMetadata } from '@/hooks';

/**
 * Generic error page that displays error code and reason
 * Error information is passed via React Router location state
 */
export function ErrorPage() {
  const location = useLocation();
  const state = location.state as { code?: number; reason?: string } | null;

  // Extract error details from state or use defaults
  const errorCode = state?.code || 500;
  const errorReason = state?.reason || 'An unexpected error occurred';

  // Set page metadata
  usePageMetadata({
    title: `${errorCode === 404 ? 'Page Not Found' : 'Error'} - darkSky Calculator`,
    description: 'The page you are looking for could not be found. Visit the darkSky calculator homepage to find dark sky times for astronomy and light pollution monitoring.',
  });

  // Generate title based on error code
  const getErrorTitle = (code: number): string => {
    switch (code) {
      case 404:
        return 'Page Not Found';
      case 403:
        return 'Forbidden';
      case 500:
        return 'Internal Server Error';
      case 503:
        return 'Service Unavailable';
      default:
        return 'Error';
    }
  };

  // Generate helpful message for 404
  const getHelpfulMessage = (code: number): string => {
    if (code === 404) {
      return "The page you're looking for doesn't exist. But don't worry, we can help you find what you need!";
    }
    return errorReason;
  };

  // Navigation links for 404 page
  const navigationLinks = [
    {
      to: '/',
      icon: <Calculator className="w-5 h-5" />,
      title: 'Calculator',
      description: 'Calculate dark sky times',
    },
    {
      to: '/getting-started',
      icon: <BookOpen className="w-5 h-5" />,
      title: 'Getting Started',
      description: 'Learn how to use the calculator',
    },
    {
      to: '/faq',
      icon: <HelpCircle className="w-5 h-5" />,
      title: 'FAQ',
      description: 'Frequently asked questions',
    },
    {
      to: '/privacy',
      icon: <Shield className="w-5 h-5" />,
      title: 'Privacy',
      description: 'Privacy policy and data usage',
    },
  ];

  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <div className="bg-gray-800 rounded-lg shadow-xl p-8 md:p-12">
        {/* Error Icon */}
        <div className="flex justify-center mb-6">
          <AlertCircle className="w-20 h-20 text-red-400" aria-hidden="true" />
        </div>

        {/* Error Code */}
        <h1 className="text-8xl font-bold text-blue-400 mb-4 text-center">
          {errorCode}
        </h1>

        {/* Error Title */}
        <h2 className="text-2xl font-semibold text-white mb-4 text-center">
          {getErrorTitle(errorCode)}
        </h2>

        {/* Error Reason/Message */}
        <p className="text-gray-300 mb-8 text-lg text-center max-w-2xl mx-auto">
          {getHelpfulMessage(errorCode)}
        </p>

        {/* 404-specific helpful navigation */}
        {errorCode === 404 && (
          <>
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-white mb-4 text-center">
                Explore Our Site
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
                {navigationLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="flex items-start gap-3 p-4 bg-gray-700/50 hover:bg-gray-700 rounded-lg transition-colors group"
                  >
                    <div className="text-blue-400 group-hover:text-blue-300 transition-colors flex-shrink-0 mt-0.5">
                      {link.icon}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-white group-hover:text-blue-300 transition-colors">
                        {link.title}
                      </div>
                      <div className="text-sm text-gray-400 mt-0.5">
                        {link.description}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Common searches / What users might be looking for */}
            <div className="bg-gray-700/30 rounded-lg p-6 mb-8 max-w-2xl mx-auto">
              <h3 className="text-lg font-semibold text-white mb-3">
                Looking for something specific?
              </h3>
              <ul className="text-gray-300 space-y-2 text-sm">
                <li>
                  • <Link to="/getting-started#understanding-inputs" className="text-blue-400 hover:text-blue-300 underline">How to enter coordinates</Link>
                </li>
                <li>
                  • <Link to="/faq" className="text-blue-400 hover:text-blue-300 underline">What is astronomical twilight?</Link>
                </li>
                <li>
                  • <Link to="/getting-started#exporting-data" className="text-blue-400 hover:text-blue-300 underline">How to export results as CSV</Link>
                </li>
                <li>
                  • <Link to="/privacy" className="text-blue-400 hover:text-blue-300 underline">Is my location data private?</Link>
                </li>
              </ul>
            </div>
          </>
        )}

        {/* Return Home Button */}
        <div className="text-center">
          <Link
            to="/"
            className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-gray-800"
          >
            <Home className="w-5 h-5" />
            <span>Return to Calculator</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
