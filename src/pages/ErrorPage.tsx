import { useLocation, Link } from 'react-router-dom';
import { AlertCircle, Home } from 'lucide-react';

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

  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl">
      <div className="bg-gray-800 rounded-lg shadow-xl p-8 md:p-12 text-center">
        {/* Error Icon */}
        <div className="flex justify-center mb-6">
          <AlertCircle className="w-20 h-20 text-red-400" />
        </div>

        {/* Error Code */}
        <h1 className="text-8xl font-bold text-blue-400 mb-4">
          {errorCode}
        </h1>

        {/* Error Title */}
        <h2 className="text-2xl font-semibold text-white mb-4">
          {getErrorTitle(errorCode)}
        </h2>

        {/* Error Reason/Message */}
        <p className="text-gray-300 mb-8 text-lg">
          {errorReason}
        </p>

        {/* Return Home Button */}
        <Link
          to="/"
          className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-lg hover:shadow-xl"
        >
          <Home className="w-5 h-5" />
          <span>Return to Home</span>
        </Link>
      </div>
    </div>
  );
}
