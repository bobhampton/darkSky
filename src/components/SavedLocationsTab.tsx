import { MapPin, Trash2, AlertCircle } from 'lucide-react';
import type { SavedLocation } from '@/types/savedLocation.types';

interface SavedLocationsTabProps {
  savedLocations: SavedLocation[];
  onSelectLocation: (location: SavedLocation) => void;
  onDeleteLocation: (id: string) => void;
  selectedLocationId?: string;
  disabled?: boolean;
  showError?: boolean; // Show red border when validation fails
}

/**
 * Tab showing saved locations with radio selection and delete options
 */
export function SavedLocationsTab({
  savedLocations,
  onSelectLocation,
  onDeleteLocation,
  selectedLocationId,
  disabled = false,
  showError = false,
}: SavedLocationsTabProps) {
  return (
    <div className="space-y-4">
      {/* Warning about browser data */}
      <div className="flex items-start gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
        <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-yellow-200/90">
          <strong>Note:</strong> Saved locations are stored in your browser. Clearing your browser's
          website data will remove all saved locations.
        </p>
      </div>

      {savedLocations.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <MapPin className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">No saved locations yet</p>
          <p className="text-xs text-gray-500 mt-1">
            Search for a location and click "Save Location" to add it here
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-gray-400">
            Select a location below, then click "Calculate Dark Times" to run calculations
          </p>
          
          {/* Error message when no location selected */}
          {showError && (
            <div className="flex items-start gap-2 p-3 bg-red-900/20 border border-red-600/50 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-300">
                Please select a saved location to calculate dark times
              </p>
            </div>
          )}
          
          <div className="space-y-2">
            {savedLocations.map((location) => (
              <label
                key={location.id}
                className={`group flex items-start gap-3 p-4 rounded-lg transition-all cursor-pointer border-2 ${
                  selectedLocationId === location.id
                    ? 'bg-purple-600/20 border-purple-500'
                    : 'bg-gray-800/50 border-gray-700/50 hover:bg-gray-800 hover:border-gray-600'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {/* Radio Button */}
                <input
                  type="radio"
                  name="saved-location"
                  checked={selectedLocationId === location.id}
                  onChange={() => onSelectLocation(location)}
                  disabled={disabled}
                  className="mt-1 w-5 h-5 text-purple-600 bg-gray-900 border-gray-600 focus:ring-purple-500 focus:ring-2 cursor-pointer disabled:cursor-not-allowed"
                />

                <MapPin className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                  selectedLocationId === location.id ? 'text-purple-400' : 'text-blue-400'
                }`} />
                
                <div className="flex-1">
                  <div className="font-medium text-white">{location.nickname}</div>
                  <div className="text-sm text-gray-400 line-clamp-2">{location.address}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {location.lat.toFixed(4)}°, {location.lng.toFixed(4)}°
                    {location.timezone && ` • ${location.timezone}`}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    onDeleteLocation(location.id);
                  }}
                  disabled={disabled}
                  className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Delete saved location"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
