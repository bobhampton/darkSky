import { useState, useEffect, useRef } from 'react';
import { useNominatim } from '@/hooks';
import type { Coordinates } from '@/types';

interface LocationSearchProps {
  onLocationSelected: (coords: Coordinates, address: string) => void;
  disabled?: boolean;
  address?: string; // Current address to display in search field
}

/**
 * Location search component using OpenStreetMap Nominatim
 * Features: manual search with button/Enter, keyboard navigation, 5 result limit
 * Also supports direct coordinate input (e.g., "40.7128, -74.006")
 */
export function LocationSearch({
  onLocationSelected,
  disabled = false,
  address,
}: LocationSearchProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [lastSelectedAddress, setLastSelectedAddress] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { search, results, loading, error, clearResults } = useNominatim();

  /**
   * Detects if input is coordinate pair and parses it
   * Supports formats: "lat, lng" or "lat lng"
   * Returns null if not valid coordinates
   */
  const parseCoordinates = (input: string): Coordinates | null => {
    const trimmed = input.trim();
    
    // Match patterns like: "40.7128, -74.006" or "40.7128 -74.006"
    const coordPattern = /^(-?\d+\.?\d*)\s*[,\s]\s*(-?\d+\.?\d*)$/;
    const match = trimmed.match(coordPattern);
    
    if (match) {
      const lat = parseFloat(match[1]);
      const lng = parseFloat(match[2]);
      
      // Validate ranges: lat must be -90 to 90, lng must be -180 to 180
      if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        return { lat, lng };
      }
    }
    
    return null;
  };

  // Clear results when query is deleted or too short
  useEffect(() => {
    if (query.trim().length < 3 && results.length > 0) {
      clearResults();
      setIsOpen(false);
      setSelectedIndex(-1);
    }
  }, [query, results.length, clearResults]);

  // Detect when user modifies a previously selected address
  useEffect(() => {
    if (lastSelectedAddress && query !== lastSelectedAddress) {
      // User has modified the selected address, clear the selection marker
      setLastSelectedAddress('');
    }
  }, [query, lastSelectedAddress]);

  // Sync query with address prop (for cross-tab updates from saved locations)
  useEffect(() => {
    if (address && address !== query) {
      setQuery(address);
      setLastSelectedAddress(address);
    }
  }, [address]);

  // Manual search handler
  const handleSearch = () => {
    const trimmedQuery = query.trim();
    
    // First check if input is coordinate pair
    const coords = parseCoordinates(trimmedQuery);
    if (coords) {
      // Use exact coordinates - no API call, no rounding
      // Address will be reverse geocoded in LocationPicker
      onLocationSelected(coords, '');
      setQuery(`${coords.lat}, ${coords.lng}`);
      setLastSelectedAddress(`${coords.lat}, ${coords.lng}`);
      setIsOpen(false);
      clearResults();
      return;
    }
    
    // Otherwise, do normal text search
    if (trimmedQuery.length >= 3) {
      search(trimmedQuery);
      setIsOpen(true);
      setSelectedIndex(-1);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (index: number) => {
    const result = results[index];
    if (result) {
      const coords = { lat: parseFloat(result.lat), lng: parseFloat(result.lon) };
      onLocationSelected(coords, result.display_name);
      setQuery(result.display_name);
      setLastSelectedAddress(result.display_name);
      setIsOpen(false);
      clearResults();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case 'ArrowDown':
        if (isOpen && results.length > 0) {
          e.preventDefault();
          setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
        }
        break;
      case 'ArrowUp':
        if (isOpen && results.length > 0) {
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        }
        break;
      case 'Enter':
        e.preventDefault();
        if (isOpen && results.length > 0 && selectedIndex >= 0) {
          handleSelect(selectedIndex);
        } else {
          handleSearch();
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  return (
    <div className="relative w-full">
      <label htmlFor="location-search" className="block text-sm font-medium mb-2">
        Search for a location
      </label>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            ref={inputRef}
            id="location-search"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => results.length > 0 && setIsOpen(true)}
            disabled={disabled}
            placeholder="Search by location name, city, address, or coordinates (40.7128, -74.006)..."
            className="w-full px-4 py-2 min-h-[44px] bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:ring-offset-2 focus:ring-offset-gray-900 disabled:bg-gray-900 disabled:cursor-not-allowed transition-colors"
            aria-label="Search for a location"
            aria-autocomplete="list"
            aria-controls="search-results"
            aria-expanded={isOpen && results.length > 0}
            aria-activedescendant={selectedIndex >= 0 ? `search-result-${selectedIndex}` : undefined}
          />

        </div>

        <button
          type="button"
          onClick={handleSearch}
          disabled={disabled || (query.trim().length < 3 && !parseCoordinates(query.trim())) || loading}
          className="px-4 py-2 min-h-[44px] bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 flex items-center gap-2"
          aria-label="Search for location"
        >
          {loading ? (
            <svg
              className="animate-spin h-5 w-5"
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
          ) : (
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
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          )}
          <span>Search</span>
        </button>
      </div>

      {/* Helper text */}
      <p className="mt-1 text-sm text-gray-400">
        Search by location name, city, address, or coordinates (latitude, longitude). Press Enter or click Search.
      </p>

      {/* Error message */}
      {error && (
        <div className="mt-2 text-sm text-red-400 bg-red-950/30 border border-red-800/50 rounded-lg p-2">
          {error}
        </div>
      )}

      {/* Results dropdown */}
      {isOpen && results.length > 0 && (
        <div
          ref={dropdownRef}
          id="search-results"
          role="listbox"
          className="absolute z-50 w-full mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-xl max-h-80 overflow-y-auto"
        >
          {results.map((result, index) => (
            <button
              key={result.place_id}
              id={`search-result-${index}`}
              type="button"
              role="option"
              aria-selected={index === selectedIndex}
              onClick={() => handleSelect(index)}
              onMouseEnter={() => setSelectedIndex(index)}
              className={`w-full text-left px-4 py-3 min-h-[44px] hover:bg-gray-700 transition-colors border-b border-gray-700 last:border-b-0 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-400 ${
                index === selectedIndex ? 'bg-gray-700' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0"
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
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {result.display_name}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {parseFloat(result.lat).toFixed(4)}°,{' '}
                    {parseFloat(result.lon).toFixed(4)}°
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No results message */}
      {isOpen && !loading && results.length === 0 && query.length >= 3 && (
        <div className="absolute z-50 w-full mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-xl p-4 text-center text-sm text-gray-400">
          No locations found. Try a different search term.
        </div>
      )}
    </div>
  );
}
