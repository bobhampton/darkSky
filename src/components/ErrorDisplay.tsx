import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorDisplayProps {
  error: string;
  onRetry?: () => void;
  className?: string;
}

/**
 * Displays error messages with optional retry functionality
 * Provides user-friendly error messages with actionable steps
 */
export function ErrorDisplay({ error, onRetry, className = '' }: ErrorDisplayProps) {
  // Categorize error and provide helpful message
  const getErrorDetails = (errorMessage: string) => {
    const lowerError = errorMessage.toLowerCase();
    
    // Worker initialization errors
    if (lowerError.includes('worker not initialized')) {
      return {
        title: 'Calculation Engine Error',
        message: 'The calculation system failed to initialize. Please refresh the page and try again.',
        canRetry: false,
      };
    }
    
    // Worker calculation errors
    if (lowerError.includes('calculation failed') || lowerError.includes('worker error')) {
      return {
        title: 'Calculation Error',
        message: 'An error occurred while calculating dark times. This may be due to invalid date ranges or location data.',
        canRetry: true,
      };
    }
    
    // Date/timezone errors
    if (lowerError.includes('invalid date') || lowerError.includes('invalid time')) {
      return {
        title: 'Invalid Date',
        message: 'The date range you entered is invalid. Please check your start and end dates.',
        canRetry: false,
      };
    }
    
    // Location errors
    if (lowerError.includes('latitude') || lowerError.includes('longitude') || lowerError.includes('elevation')) {
      return {
        title: 'Invalid Location',
        message: 'The location coordinates you entered are invalid. Please check your latitude, longitude, and elevation values.',
        canRetry: false,
      };
    }
    
    // Generic error
    return {
      title: 'Calculation Error',
      message: errorMessage,
      canRetry: true,
    };
  };
  
  const { title, message, canRetry } = getErrorDetails(error);
  const showRetry = onRetry && canRetry;

  return (
    <div className={`bg-red-900/50 border border-red-700 rounded-lg p-4 ${className}`}>
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-red-400 mb-1">{title}</h3>
          <p className="text-red-200 mb-3">{message}</p>
          
          {showRetry && (
            <button
              onClick={onRetry}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-800/50 hover:bg-red-800/70 
                       border border-red-700 rounded-md text-red-100 transition-colors"
              type="button"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          )}
          
          {!canRetry && (
            <p className="text-sm text-red-300 mt-2">
              💡 Tip: Double-check your input values and try again.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
