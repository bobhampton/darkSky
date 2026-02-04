/// <reference types="node" />

/**
 * Helper functions for fetching external API data and managing fixtures
 */

import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export interface SunriseSunsetResponse {
  results: {
    date: string;
    sunrise: string;
    sunset: string;
    first_light: string; // Astronomical dawn (sun @ -18°)
    last_light: string; // Astronomical dusk (sun @ -18°)
    dawn: string; // Civil dawn (sun @ -6°)
    dusk: string; // Civil dusk (sun @ -6°)
    nautical_twilight_begin: string;
    nautical_twilight_end: string;
    solar_noon: string;
    golden_hour: string;
    day_length: number;
    timezone: string;
    utc_offset: number;
  };
  status: string;
  tzid: string;
}

export interface USNOResponse {
  properties: {
    data: {
      sundata?: Array<{ phen: string; time: string }>;
      moondata?: Array<{ phen: string; time: string }>;
      fracillum?: string;
      curphase?: string;
    };
  };
}

/**
 * Fetches sunrise/sunset and twilight data from SunriseSunset.io API
 * @param date - Date in YYYY-MM-DD format
 * @param lat - Latitude in decimal degrees (-90 to 90)
 * @param lng - Longitude in decimal degrees (-180 to 180)
 * @param timezone - Timezone identifier (default: 'UTC')
 * @returns Promise resolving to sunrise/sunset data
 * @throws {Error} If API request fails or returns non-OK status
 */
export async function fetchSunriseSunsetAPI(
  date: string,
  lat: number,
  lng: number,
  timezone: string = 'UTC'
): Promise<SunriseSunsetResponse> {
  const url = `https://api.sunrisesunset.io/json?lat=${lat}&lng=${lng}&date=${date}&timezone=${timezone}&formatted=0`;
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`SunriseSunset API error: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json() as SunriseSunsetResponse;
  
  if (data.status !== 'OK') {
    throw new Error(`SunriseSunset API returned status: ${data.status}`);
  }
  
  return data;
}

/**
 * Fetches sun and moon data from USNO API
 * @param date - Date in YYYY-MM-DD format
 * @param lat - Latitude in decimal degrees (-90 to 90)
 * @param lon - Longitude in decimal degrees (-180 to 180)
 * @returns Promise resolving to USNO astronomical data
 * @throws {Error} If API request fails
 */
export async function fetchUSNOAPI(
  date: string,
  lat: number,
  lon: number
): Promise<USNOResponse> {
  const url = `https://aa.usno.navy.mil/api/rstt/oneday?date=${date}&coords=${lat},${lon}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`USNO API error: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json() as USNOResponse;
  return data;
}

/**
 * Saves API response as a fixture file
 * @template T - The type of data being saved
 * @param name - The fixture file name (without .json extension)
 * @param data - The data to save as JSON
 * @param subfolder - The subfolder within fixtures directory
 */
export function saveFixture<T>(
  name: string,
  data: T,
  subfolder: 'sunrisesunset' | 'usno' | 'arctic-russia' = 'sunrisesunset'
): void {
  const fixturesDir = join(__dirname, '..', 'fixtures', subfolder);
  const filePath = join(fixturesDir, `${name}.json`);
  
  writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

/**
 * Loads a fixture file if it exists
 * @template T - The expected type of the fixture data
 * @param name - The fixture file name (without .json extension)
 * @param subfolder - The subfolder within fixtures directory
 * @returns The parsed fixture data or null if file doesn't exist
 */
export function loadFixture<T>(
  name: string,
  subfolder: 'sunrisesunset' | 'usno' | 'arctic-russia' = 'sunrisesunset'
): T | null {
  const fixturesDir = join(__dirname, '..', 'fixtures', subfolder);
  const filePath = join(fixturesDir, `${name}.json`);
  
  if (!existsSync(filePath)) {
    return null;
  }
  
  const content = readFileSync(filePath, 'utf-8');
  return JSON.parse(content) as T;
}

/**
 * Fetches data from API or uses fixture if available
 * @template T - The type of data being fetched
 * @param name - The fixture file name (without .json extension)
 * @param fetchFn - Function that fetches the data from an API
 * @param subfolder - The subfolder within fixtures directory
 * @param useCache - Whether to use cached fixtures or fetch fresh data
 * @returns The fetched or cached data
 */
export async function fetchOrUseFixture<T>(
  name: string,
  fetchFn: () => Promise<T>,
  subfolder: 'sunrisesunset' | 'usno' | 'arctic-russia' = 'sunrisesunset',
  useCache: boolean = true
): Promise<T> {
  if (useCache) {
    const fixture = loadFixture<T>(name, subfolder);
    if (fixture) {
      return fixture;
    }
  }
  
  const data = await fetchFn();
  saveFixture<T>(name, data, subfolder);
  return data;
}

/**
 * Compares two times and returns the absolute difference in minutes
 * @param time1 - First date/time
 * @param time2 - Second date/time
 * @returns Absolute difference in minutes (always positive)
 */
export function getTimeDifferenceMinutes(time1: Date, time2: Date): number {
  return Math.abs(time1.getTime() - time2.getTime()) / (1000 * 60);
}

/**
 * Parses ISO 8601 datetime string to Date object
 * @param isoString - ISO 8601 formatted date string (e.g., "2024-01-15T12:00:00Z")
 * @returns Date object
 * @throws {Error} If the string is not a valid ISO date format
 */
export function parseISODateTime(isoString: string): Date {
  const date = new Date(isoString);
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid ISO date string: ${isoString}`);
  }
  return date;
}
