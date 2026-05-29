/**
 * Location-related type definitions
 */

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface LocationData extends Coordinates {
  elevation?: number;
  address?: string;
}

export interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
  place_id: number;
  address?: {
    country?: string;
    state?: string;
    city?: string;
    town?: string;
    village?: string;
  };
}

export interface GeolocationError {
  code: number;
  message: string;
}
