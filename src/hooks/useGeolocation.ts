import { useState } from 'react';

interface GeolocationResult {
  lat: number;
  lng: number;
  accuracy?: number;
}

/**
 * Hook for browser geolocation API
 * Provides one-click location detection using device GPS
 */
export function useGeolocation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getCurrentPosition = async (): Promise<GeolocationResult | null> => {
    // Check if geolocation is supported
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return null;
    }

    setLoading(true);
    setError(null);

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLoading(false);
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
          });
        },
        (err) => {
          setLoading(false);
          let errorMessage = 'Unable to retrieve your location';
          
          switch (err.code) {
            case err.PERMISSION_DENIED:
              errorMessage = 'Location permission denied. Please enable location access in your browser settings.';
              break;
            case err.POSITION_UNAVAILABLE:
              errorMessage = 'Location information is unavailable. Please try again or enter coordinates manually.';
              break;
            case err.TIMEOUT:
              errorMessage = 'Location request timed out. Please try again or enter coordinates manually.';
              break;
          }
          
          setError(errorMessage);
          resolve(null);
        },
        {
          enableHighAccuracy: true, // Use GPS if available
          timeout: 10000, // 10 second timeout
          maximumAge: 0, // Don't use cached position
        }
      );
    });
  };

  return { getCurrentPosition, loading, error };
}
