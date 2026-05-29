import { useState } from 'react';
import { useGeolocation } from '@/hooks';
import type { Coordinates } from '@/types';

interface GPSButtonProps {
  onLocationFound: (coords: Coordinates) => void;
  disabled?: boolean;
}

/**
 * GPS location button component
 * Uses browser geolocation API to get current position
 */
export function GPSButton({ onLocationFound, disabled = false }: GPSButtonProps) {
  const { getCurrentPosition, loading, error } = useGeolocation();
  const [localError, setLocalError] = useState<string | null>(null);

  const handleClick = async () => {
    setLocalError(null);
    const result = await getCurrentPosition();
    
    if (result) {
      onLocationFound({ lat: result.lat, lng: result.lng });
      // Success feedback
      setLocalError(null);
    }
  };

  // Display error from hook or local error
  const displayError = error || localError;

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled || loading}
        className="w-full sm:w-auto px-4 py-2 min-h-[44px] bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-gray-900"
        aria-label="Use my current location"
        aria-live="polite"
        aria-busy={loading}
      >
        {loading ? (
          <>
            <svg
              className="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Getting location...</span>
          </>
        ) : (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span>Use My Location</span>
          </>
        )}
      </button>

      {displayError && (
        <div
          className="text-sm text-red-400 bg-red-950/30 border border-red-800/50 rounded-lg p-3"
          role="alert"
        >
          <p className="font-medium">Location Error</p>
          <p className="mt-1">{displayError}</p>
        </div>
      )}
    </div>
  );
}
