import { useState, lazy, Suspense, useCallback, useEffect } from 'react';
import { Save, Search, MapPin } from 'lucide-react';
import { LocationSearch } from './LocationSearch';
import { SavedLocationsTab } from './SavedLocationsTab';
import { useNominatim, useSavedLocations } from '@/hooks';
import { getTimezoneFromCoordinates } from '@/utils/timezones';
import type { LocationData, Coordinates } from '@/types';
import type { SavedLocation } from '@/types/savedLocation.types';

// Lazy load map component to keep initial bundle small
const LocationMap = lazy(() =>
  import('./LocationMap').then((module) => ({ default: module.LocationMap }))
);

interface LocationPickerProps {
  location: LocationData;
  onLocationChange: (location: LocationData) => void;
  onTimezoneChange?: (timezone: string) => void;
  onSelectionStateChange?: (hasSelection: boolean, activeTab: TabType, locationSource: TabType | null, selectedSavedId?: string) => void;
  disabled?: boolean;
  showSavedTabError?: boolean; // Highlight saved tab with red border when validation fails
}

type TabType = 'search' | 'saved';

/**
 * Comprehensive location picker with multiple input methods
 * Features: search (text or coordinates), interactive map with GPS, saved locations
 * All methods stay synchronized through central state management
 */
export function LocationPicker({
  location,
  onLocationChange,
  onTimezoneChange,
  onSelectionStateChange,
  disabled = false,
  showSavedTabError = false,
}: LocationPickerProps) {
  const [activeTab, setActiveTab] = useState<TabType>('search');
  const [hasInteracted, setHasInteracted] = useState(false);
  const [locationSource, setLocationSource] = useState<TabType | null>(null); // Track which tab set the location
  const [pendingLocation, setPendingLocation] = useState<LocationData | null>(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveNickname, setSaveNickname] = useState('');
  const [selectedSavedLocationId, setSelectedSavedLocationId] = useState<string | undefined>();
  const { reverseGeocode } = useNominatim();
  const {
    savedLocations,
    saveLocation,
    removeLocation,
    isLocationSaved,
  } = useSavedLocations();

  // Use pending location if available, otherwise use prop
  const currentLocation = pendingLocation || location;

  // Clear pending location when prop updates to match it
  useEffect(() => {
    if (pendingLocation && 
        location.lat === pendingLocation.lat && 
        location.lng === pendingLocation.lng &&
        location.address === pendingLocation.address) {
      setPendingLocation(null);
    }
  }, [location, pendingLocation]);

  // Notify parent of selection state changes
  useEffect(() => {
    if (onSelectionStateChange) {
      const hasSelection = activeTab !== 'saved' || selectedSavedLocationId !== undefined;
      onSelectionStateChange(hasSelection, activeTab, locationSource, selectedSavedLocationId);
    }
  }, [selectedSavedLocationId, activeTab, locationSource, onSelectionStateChange]);

  // Update location with optional reverse geocoding and timezone lookup
  // Clear current location
  const handleClearLocation = () => {
    onLocationChange({
      lat: 0,
      lng: 0,
      address: '',
    });
    setPendingLocation(null);
    setShowSaveDialog(false);
    setLocationSource(null);
    setHasInteracted(false);
    setSelectedSavedLocationId(undefined);
  };

  const updateLocation = useCallback(
    async (coords: Coordinates, address?: string) => {
      // Create new location with ONLY the new coordinates
      // Don't read any existing state to avoid race conditions
      let finalAddress = address || '';
      
      // If no address provided, try to reverse geocode
      if (!address) {
        const geocodedAddress = await reverseGeocode(coords.lat, coords.lng);
        if (geocodedAddress) {
          finalAddress = geocodedAddress;
        }
      }

      const newLocation: LocationData = {
        lat: coords.lat,
        lng: coords.lng,
        address: finalAddress,
        elevation: undefined, // Reset elevation when location changes
      };

      setPendingLocation(newLocation); // Track pending location to prevent race conditions
      onLocationChange(newLocation);
      
      // Look up timezone from coordinates if callback provided
      if (onTimezoneChange) {
        const timezone = await getTimezoneFromCoordinates(coords.lat, coords.lng);
        if (timezone) {
          onTimezoneChange(timezone);
        }
      }
    },
    [onLocationChange, onTimezoneChange, reverseGeocode]
  );

  // Handle GPS button click
  const handleGPSLocation = useCallback(
    async (coords: Coordinates) => {
      setHasInteracted(true);
      setLocationSource('search'); // GPS belongs to search tab
      setSelectedSavedLocationId(undefined); // Clear saved location selection
      await updateLocation(coords);
      // Stay on GPS tab to show the map
    },
    [updateLocation]
  );

  // Handle search result selection
  const handleSearchSelection = useCallback(
    async (coords: Coordinates, address: string) => {
      setHasInteracted(true);
      setLocationSource('search'); // Mark that search set this location
      setSelectedSavedLocationId(undefined); // Clear saved location selection
      await updateLocation(coords, address);
      // Stay on search tab to show the map
    },
    [updateLocation]
  );

  // Handle map marker drag or click
  const handleMapChange = useCallback(
    async (coords: Coordinates) => {
      setHasInteracted(true);
      setLocationSource('search'); // Map interactions belong to search tab
      setSelectedSavedLocationId(undefined); // Clear saved location selection
      await updateLocation(coords);
    },
    [updateLocation]
  );

  // Handle saving current location
  const handleSaveLocation = useCallback(() => {
    if (!currentLocation.address) {
      return; // Can't save without an address
    }

    const nickname = saveNickname.trim() || currentLocation.address.split(',')[0];
    
    saveLocation({
      nickname,
      address: currentLocation.address,
      lat: currentLocation.lat,
      lng: currentLocation.lng,
      elevation: currentLocation.elevation,
      timezone: undefined, // Could optionally store timezone
    });

    setSaveNickname('');
    setShowSaveDialog(false);
  }, [currentLocation, saveNickname, saveLocation]);

  // Handle loading a saved location
  const handleLoadSavedLocation = useCallback(
    async (savedLoc: SavedLocation) => {
      setHasInteracted(true);
      setLocationSource('saved'); // Mark that saved tab set this location
      setSelectedSavedLocationId(savedLoc.id);
      await updateLocation(
        { lat: savedLoc.lat, lng: savedLoc.lng },
        savedLoc.address
      );
      // Stay on saved tab - user will click "Calculate Dark Times" when ready
    },
    [updateLocation]
  );

  // Handle deleting a saved location
  const handleDeleteSavedLocation = useCallback(
    (id: string) => {
      // Clear selection if deleting the selected location
      if (selectedSavedLocationId === id) {
        setSelectedSavedLocationId(undefined);
      }
      removeLocation(id);
    },
    [selectedSavedLocationId, removeLocation]
  );

  const tabs = [
    { id: 'search' as TabType, label: 'Search', icon: Search, tooltip: 'Search by location name, city, address, or coordinates' },
    { id: 'saved' as TabType, label: 'Saved', icon: MapPin, tooltip: 'Select from your saved locations' },
  ];

  return (
    <div className="space-y-4">
      {/* Location Picker Header */}
      <div>
        <h3 className="text-lg font-semibold mb-1">Location</h3>
        <p className="text-sm text-gray-400">
          Search by name, enter coordinates, click the map, or load a saved location
        </p>
      </div>

      {/* Tab Navigation */}
      <div
        className="flex flex-wrap gap-2 border-b border-gray-700 pb-2"
        role="tablist"
        aria-label="Location input methods"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`${tab.id}-panel`}
            id={`${tab.id}-tab`}
            onClick={() => setActiveTab(tab.id)}
            disabled={disabled}
            title={tab.tooltip}
            className={`px-4 py-2 min-h-[44px] rounded-lg font-medium transition-all duration-200 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 ${
              activeTab === tab.id
                ? 'bg-purple-600 text-white shadow-lg focus:ring-purple-400'
                : 'bg-purple-900/20 border-2 border-purple-700/40 text-purple-300 hover:bg-purple-800/30 hover:border-purple-600/50 hover:text-purple-200 focus:ring-purple-500 disabled:bg-gray-800 disabled:border-gray-700 disabled:text-gray-600 disabled:cursor-not-allowed'
            }`}
          >
            <tab.icon className="w-4 h-4" aria-hidden="true" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <div className="min-h-[200px]">
        {/* Search Panel */}
        {activeTab === 'search' && (
          <div
            id="search-panel"
            role="tabpanel"
            aria-labelledby="search-tab"
            className="animate-fade-in space-y-4"
          >
            <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-6">
              <LocationSearch
                onLocationSelected={handleSearchSelection}
                disabled={disabled}
                address={currentLocation.address}
              />
            </div>

            {/* Always show map on search tab */}
            <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-6">
              <Suspense
                fallback={
                  <div className="flex items-center justify-center h-[400px] bg-gray-800 rounded-lg border border-gray-700">
                    <div className="text-center">
                      <svg
                        className="animate-spin h-8 w-8 text-purple-500 mx-auto mb-3"
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
                      <p className="text-sm text-gray-400">Loading map...</p>
                    </div>
                  </div>
                }
              >
                <LocationMap
                  coordinates={{ lat: currentLocation.lat, lng: currentLocation.lng }}
                  onCoordinatesChange={handleMapChange}
                  onGPSClick={handleGPSLocation}
                  onClearLocation={handleClearLocation}
                  height="400px"
                  hasAddress={!!currentLocation.address}
                  showMarker={hasInteracted && (locationSource === 'search' || locationSource === 'saved')}
                  address={currentLocation.address}
                  isLocationSaved={isLocationSaved(currentLocation.lat, currentLocation.lng)}
                  disabled={disabled}
                />
              </Suspense>
            </div>

            {/* Save Location Button - Below Map */}
            {currentLocation.address && !isLocationSaved(currentLocation.lat, currentLocation.lng) && (
              <div>
                {!showSaveDialog ? (
                  <button
                    type="button"
                    onClick={() => setShowSaveDialog(true)}
                    disabled={disabled}
                    title="Save this location for quick access later"
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save className="w-4 h-4" />
                    Save Location
                  </button>
                ) : (
                  <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-3 space-y-2">
                    <label className="block">
                      <span className="text-sm font-medium text-gray-300 mb-1 block">
                        Nickname (optional):
                      </span>
                      <input
                        type="text"
                        value={saveNickname}
                        onChange={(e) => setSaveNickname(e.target.value)}
                        placeholder={currentLocation.address?.split(',')[0]}
                        className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded text-white focus:outline-none focus:border-purple-500"
                        disabled={disabled}
                      />
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleSaveLocation}
                        disabled={disabled}
                        title="Save this location to your browser"
                        className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors disabled:opacity-50"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowSaveDialog(false);
                          setSaveNickname('');
                        }}
                        disabled={disabled}
                        title="Cancel and close this dialog"
                        className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Saved Panel */}
        {activeTab === 'saved' && (
          <div
            id="saved-panel"
            role="tabpanel"
            aria-labelledby="saved-tab"
            className="animate-fade-in"
          >
            <SavedLocationsTab
              savedLocations={savedLocations}
              onSelectLocation={handleLoadSavedLocation}
              onDeleteLocation={handleDeleteSavedLocation}
              selectedLocationId={selectedSavedLocationId}
              disabled={disabled}
              showError={showSavedTabError}
            />
          </div>
        )}
      </div>
    </div>
  );
}
