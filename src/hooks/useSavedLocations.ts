import { useState, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import type { SavedLocation, SavedLocationsData } from '@/types/savedLocation.types';

const STORAGE_KEY = 'darksky-saved-locations';

const defaultSavedLocations: SavedLocationsData = {
  locations: [],
};

/**
 * Custom hook for managing saved locations
 * @returns Saved locations and methods to add/remove/load them
 */
export function useSavedLocations() {
  const [storedData, setStoredData] = useLocalStorage<SavedLocationsData>(
    STORAGE_KEY,
    defaultSavedLocations
  );

  const [nicknameInput, setNicknameInput] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  // Get all saved locations
  const savedLocations = storedData.locations || [];

  // Add a new saved location
  const saveLocation = useCallback(
    (location: Omit<SavedLocation, 'id' | 'savedAt'>) => {
      const newLocation: SavedLocation = {
        ...location,
        id: crypto.randomUUID(),
        savedAt: new Date().toISOString(),
      };

      setStoredData((prev) => ({
        locations: [...prev.locations, newLocation],
      }));

      setNicknameInput('');
      setShowSaveDialog(false);
    },
    [setStoredData]
  );

  // Remove a saved location by ID
  const removeLocation = useCallback(
    (id: string) => {
      setStoredData((prev) => ({
        locations: prev.locations.filter((loc) => loc.id !== id),
      }));
    },
    [setStoredData]
  );

  // Check if a location is already saved (by coordinates)
  const isLocationSaved = useCallback(
    (lat: number, lng: number) => {
      return savedLocations.some(
        (loc) => Math.abs(loc.lat - lat) < 0.0001 && Math.abs(loc.lng - lng) < 0.0001
      );
    },
    [savedLocations]
  );

  // Clear all saved locations
  const clearAllLocations = useCallback(() => {
    setStoredData(defaultSavedLocations);
  }, [setStoredData]);

  return {
    savedLocations,
    saveLocation,
    removeLocation,
    isLocationSaved,
    clearAllLocations,
    nicknameInput,
    setNicknameInput,
    showSaveDialog,
    setShowSaveDialog,
  };
}
