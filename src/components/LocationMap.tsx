import { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import type { LatLngExpression, Map } from 'leaflet';
import type { Coordinates } from '@/types';
import { useGeolocation } from '@/hooks';
import { BookmarkCheck, X } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import '@/utils/leafletIcons'; // Fix marker icon bug

interface LocationMapProps {
  coordinates: Coordinates;
  onCoordinatesChange: (coords: Coordinates) => void;
  onGPSClick?: (coords: Coordinates) => void;
  onClearLocation?: () => void;
  height?: string;
  hasAddress?: boolean; // Whether user has selected a specific location
  showMarker?: boolean; // Whether to show the marker
  address?: string; // The location address to display
  isLocationSaved?: boolean; // Whether the current location is saved
  disabled?: boolean; // Whether controls are disabled
}

/**
 * Component to update map center when coordinates change externally
 */
function MapUpdater({ 
  center, 
  shouldCenter,
  zoom,
  onCentered
}: { 
  center: LatLngExpression; 
  shouldCenter: boolean;
  zoom: number;
  onCentered: () => void;
}) {
  const map = useMap();
  
  useEffect(() => {
    if (shouldCenter) {
      map.setView(center, zoom);
      onCentered();
    }
  }, [center, map, shouldCenter, zoom, onCentered]);
  
  return null;
}

/**
 * Component to handle map click events for pin dropping
 */
function MapClickHandler({ onClick }: { onClick: (coords: Coordinates) => void }) {
  useMapEvents({
    click: (e) => {
      onClick({
        lat: e.latlng.lat,
        lng: e.latlng.lng,
      });
    },
  });
  return null;
}

/**
 * Interactive map component with draggable marker
 * Features: OpenStreetMap tiles, light/dark theme toggle, lazy-loadable
 */
export function LocationMap({
  coordinates,
  onCoordinatesChange,
  onGPSClick,
  onClearLocation,
  height = '400px',
  hasAddress = false,
  showMarker = false,
  address,
  isLocationSaved = false,
  disabled = false,
}: LocationMapProps) {
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const [shouldCenter, setShouldCenter] = useState(true);
  const mapRef = useRef<Map | null>(null);
  const position: LatLngExpression = [coordinates.lat, coordinates.lng];
  const { getCurrentPosition, loading: gpsLoading } = useGeolocation();
  
  // Fixed zoom level - no auto-zoom
  const zoomLevel = 5;
  
  // Center on coordinates without changing zoom
  const initialZoom = 5;
  const initialCenter: LatLngExpression = position;

  // Center map when hasAddress or coordinates change
  useEffect(() => {
    setShouldCenter(true);
  }, [coordinates.lat, coordinates.lng, hasAddress, showMarker]);

  const handleCentered = useCallback(() => {
    setShouldCenter(false);
  }, []);

  const handleCenterClick = () => {
    if (mapRef.current) {
      mapRef.current.setView(position, mapRef.current.getZoom());
      setShouldCenter(true);
    }
  };

  const handleGPSClick = async () => {
    const result = await getCurrentPosition();
    if (result && onGPSClick) {
      onGPSClick({ lat: result.lat, lng: result.lng });
    }
  };

  // Tile layer URLs
  const tileUrls = {
    light: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
  };

  const tileAttribution = isDarkTheme
    ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
    : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium">
          Interactive Map
        </label>
        
        <div className="flex items-center gap-2">
          {/* GPS / Current Location button */}
          {onGPSClick && (
            <button
              type="button"
              onClick={handleGPSClick}
              disabled={gpsLoading}
              className="px-3 py-1 text-xs font-medium bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-gray-900 min-h-[32px]"
              aria-label="Use current location"
              title="Use my location"
            >
              {gpsLoading ? (
                <svg
                  className="animate-spin h-4 w-4"
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
                  className="h-4 w-4"
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
              )}
              <span>My Location</span>
            </button>
          )}

          {/* Center on marker button - only show when marker exists */}
          {showMarker && (
            <button
              type="button"
              onClick={handleCenterClick}
              className="px-3 py-1 text-xs font-medium bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-gray-900 min-h-[32px]"
              aria-label="Center map on marker"
              title="Center on marker"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
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
              <span>Center</span>
            </button>
          )}

          {/* Clear Location button */}
          {onClearLocation && showMarker && (
            <button
              type="button"
              onClick={onClearLocation}
              disabled={disabled}
              className="px-3 py-1 text-xs font-medium bg-gray-700 hover:bg-red-600/80 text-gray-300 hover:text-white rounded-lg transition-colors flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-gray-900 min-h-[32px] disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Clear location"
              title="Clear location"
            >
              <X className="h-4 w-4" aria-hidden="true" />
              <span>Clear</span>
            </button>
          )}

          {/* Light/Dark toggle */}
          <button
            type="button"
            onClick={() => setIsDarkTheme(!isDarkTheme)}
            className="px-3 py-1 text-xs font-medium bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-gray-900 min-h-[32px]"
            aria-label={`Switch to ${isDarkTheme ? 'light' : 'dark'} theme`}
            aria-pressed={isDarkTheme}
            title={`Switch to ${isDarkTheme ? 'light' : 'dark'} map theme`}
          >
          {isDarkTheme ? (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
              <span>Light</span>
            </>
          ) : (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
              </svg>
              <span>Dark</span>
            </>
          )}
        </button>
        </div>
      </div>

      <div
        className="rounded-lg overflow-hidden border border-gray-700"
        style={{ height }}
      >
        <MapContainer
          center={initialCenter}
          zoom={initialZoom}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
          ref={mapRef}
        >
          <TileLayer
            url={isDarkTheme ? tileUrls.dark : tileUrls.light}
            attribution={tileAttribution}
          />
          
          <MapUpdater 
            center={position} 
            shouldCenter={shouldCenter}
            zoom={zoomLevel}
            onCentered={handleCentered}
          />
          
          <MapClickHandler onClick={onCoordinatesChange} />
          
          {/* Show marker after user interaction */}
          {showMarker && (
            <Marker
              position={position}
              draggable={true}
              eventHandlers={{
                dragend: (e) => {
                  const marker = e.target;
                  const newPos = marker.getLatLng();
                  onCoordinatesChange({
                    lat: newPos.lat,
                    lng: newPos.lng,
                  });
                },
              }}
            />
          )}
        </MapContainer>
      </div>

      <p className="text-xs text-gray-400">
        {showMarker 
          ? 'Drag the marker to adjust location. Scroll to zoom.'
          : '💡 Click anywhere on the map to drop a pin, use your current location, or search above. Scroll to zoom.'}
      </p>

      {/* Display selected location info */}
      {showMarker && (
        <div className="mt-3 p-3 bg-gray-800/50 border border-gray-700 rounded-lg">
          <div className="flex items-start gap-2">
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
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-white">
                  Selected Location
                </p>
                {isLocationSaved && (
                  <div className="flex items-center gap-1 text-green-400/80">
                    <BookmarkCheck className="w-4 h-4" />
                    <span className="text-xs font-medium">Saved</span>
                  </div>
                )}
              </div>
              {address && (
                <p className="text-sm text-gray-300 mt-1 break-words">
                  {address}
                </p>
              )}
              <p className="text-xs text-gray-400 mt-1 font-mono">
                {coordinates.lat.toFixed(6)}°, {coordinates.lng.toFixed(6)}°
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
