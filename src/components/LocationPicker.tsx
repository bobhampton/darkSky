import { lazy, Suspense, useCallback, useEffect } from 'react';
import { Save, Search, MapPin } from 'lucide-react';
import { LocationSearch } from './LocationSearch';
import { SavedLocationsTab } from './SavedLocationsTab';
import { useNominatim, useSavedLocations, useLocationPickerState, type TabType } from '@/hooks';
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
  const { state, actions } = useLocationPickerState();
  const { reverseGeocode } = useNominatim();
  const {
    savedLocations,
    saveLocation,
    removeLocation,
    isLocationSaved,
  } = useSavedLocations();

  // Use pending location if available, otherwise use prop
  const currentLocation = state.pendingLocation || location;

  // Clear pending location when prop updates to match it
  useEffect(() => {
    if (state.pendingLocation && 
        location.lat === state.pendingLocation.lat && 
        location.lng === state.pendingLocation.lng &&
        location.address === state.pendingLocation.address) {
      actions.clearPendingLocation();
    }
  }, [location, state.pendingLocation, actions]);

  // Notify parent of selection state changes
  useEffect(() => {
    if (onSelectionStateChange) {
      const hasSelection = state.activeTab !== 'saved' || state.selectedSavedLocationId !== undefined;
      onSelectionStateChange(hasSelection, state.activeTab, state.locationSource, state.selectedSavedLocationId);
    }
  }, [state.selectedSavedLocationId, state.activeTab, state.locationSource, onSelectionStateChange]);

  // Update location with optional reverse geocoding and timezone lookup
  // Clear current location
  const handleClearLocation = () => {
    onLocationChange({
      lat: 0,
      lng: 0,
      address: '',
    });
    actions.clearAll();
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

      actions.setPendingLocation(newLocation); // Track pending location to prevent race conditions
      onLocationChange(newLocation);
      
      // Look up timezone from coordinates if callback provided
      if (onTimezoneChange) {
        const timezone = await getTimezoneFromCoordinates(coords.lat, coords.lng);
        if (timezone) {
          onTimezoneChange(timezone);
        }
      }
    },
    [actions, onLocationChange, onTimezoneChange, reverseGeocode]
  );

  // Handle GPS button click
  const handleGPSLocation = useCallback(
    async (coords: Coordinates) => {
      actions.handleSearchInteraction();
      await updateLocation(coords);
      // Stay on GPS tab to show the map
    },
    [updateLocation, actions]
  );

  // Handle search result selection
  const handleSearchSelection = useCallback(
    async (coords: Coordinates, address: string) => {
      actions.handleSearchInteraction();
      await updateLocation(coords, address);
      // Stay on search tab to show the map
    },
    [updateLocation, actions]
  );

  // Handle map marker drag or click
  const handleMapChange = useCallback(
    async (coords: Coordinates) => {
      actions.handleSearchInteraction();
      await updateLocation(coords);
    },
    [updateLocation, actions]
  );

  // Handle saving current location
  const handleSaveLocation = useCallback(() => {
    if (!currentLocation.address) {
      return; // Can't save without an address
    }

    const nickname = state.saveNickname.trim() || currentLocation.address.split(',')[0];
    
    saveLocation({
      nickname,
      address: currentLocation.address,
      lat: currentLocation.lat,
      lng: currentLocation.lng,
      elevation: currentLocation.elevation,
      timezone: undefined, // Could optionally store timezone
    });

    actions.completeSave();
  }, [currentLocation, state.saveNickname, saveLocation, actions]);

  // Handle loading a saved location
  const handleLoadSavedLocation = useCallback(
    async (savedLoc: SavedLocation) => {
      actions.handleSavedInteraction(savedLoc.id);
      await updateLocation(
        { lat: savedLoc.lat, lng: savedLoc.lng },
        savedLoc.address
      );
      // Stay on saved tab - user will click "Calculate Dark Times" when ready
    },
    [updateLocation, actions]
  );

  // Handle deleting a saved location
  const handleDeleteSavedLocation = useCallback(
    (id: string) => {
      // Clear selection if deleting the selected location
      actions.clearSavedSelection(id);
      removeLocation(id);
    },
    [actions, removeLocation]
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
            aria-selected={state.activeTab === tab.id}
            aria-controls={`${tab.id}-panel`}
            id={`${tab.id}-tab`}
            onClick={() => actions.setActiveTab(tab.id)}
            disabled={disabled}
            title={tab.tooltip}
            className={`px-4 py-2 min-h-[44px] rounded-lg font-medium transition-all duration-200 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 ${
              state.activeTab === tab.id
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
        {state.activeTab === 'search' && (
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
                  showMarker={state.hasInteracted && (state.locationSource === 'search' || state.locationSource === 'saved')}
                  address={currentLocation.address}
                  isLocationSaved={isLocationSaved(currentLocation.lat, currentLocation.lng)}
                  disabled={disabled}
                />
              </Suspense>
            </div>

            {/* Save Location Button - Below Map */}
            {currentLocation.address && !isLocationSaved(currentLocation.lat, currentLocation.lng) && (
              <div>
                {!state.showSaveDialog ? (
                  <button
                    type="button"
                    onClick={() => actions.showSaveDialog()}
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
                        value={state.saveNickname}
                        onChange={(e) => actions.setSaveNickname(e.target.value)}
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
                          actions.cancelSaveDialog();
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
        {state.activeTab === 'saved' && (
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
              selectedLocationId={state.selectedSavedLocationId}
              disabled={disabled}
              showError={showSavedTabError}
            />
          </div>
        )}
      </div>
    </div>
  );
}
