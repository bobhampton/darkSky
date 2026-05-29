/**
 * Type definitions for saved locations feature
 */

export interface SavedLocation {
  id: string;
  nickname: string;
  address: string;
  lat: number;
  lng: number;
  elevation?: number;
  timezone?: string;
  savedAt: string; // ISO timestamp
}

export interface SavedLocationsData {
  locations: SavedLocation[];
}
