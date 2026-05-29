import { useState, useCallback } from 'react';
import type { NominatimResult } from '@/types/location.types';

/**
 * Hook for OpenStreetMap Nominatim geocoding API
 * Provides address search and reverse geocoding (no API key required)
 * Rate limit: 1 request per second
 */
export function useNominatim() {
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (query: string): Promise<void> => {
    // Require minimum 3 characters
    if (query.length < 3) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?` +
          `q=${encodeURIComponent(query)}&format=json&limit=5&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'darkSky/2.0 (https://darkskycalculator.com)',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`);
      }

      const data = await response.json();
      setResults(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Search failed';
      setError(errorMessage);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const reverseGeocode = useCallback(async (
    lat: number,
    lng: number
  ): Promise<string | null> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?` +
          `lat=${lat}&lon=${lng}&format=json`,
        {
          headers: {
            'User-Agent': 'darkSky/2.0 (https://darkskycalculator.com)',
          },
        }
      );

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return data.display_name || null;
    } catch {
      return null;
    }
  }, []);

  const clearResults = useCallback(() => {
    setResults([]);
    setError(null);
  }, []);

  return { search, reverseGeocode, results, loading, error, clearResults };
}
