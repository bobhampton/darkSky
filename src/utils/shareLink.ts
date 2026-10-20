import type { ObserverFormData } from '@/types';
import { validateLatitude, validateLongitude } from './validation';
import { isValidNumber } from './dateUtils';
import { isValidTimezone } from './timezones';

/**
 * Query parameters used by shareable result links.
 * These carry the observer's location, so they must also be listed under
 * Admin > Data streams > Redact data in Google Analytics (see the Privacy page).
 */
export const SHARE_PARAMS = {
  latitude: 'lat',
  longitude: 'lon',
  elevation: 'elev',
  timezone: 'tz',
  dateStart: 'start',
  dateEnd: 'end',
  address: 'name',
} as const;

/** Inputs read from a share link; only the coordinates are guaranteed */
export type SharedObserverData = Pick<ObserverFormData, 'latitude' | 'longitude'> & Partial<ObserverFormData>;

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const MAX_NAME_LENGTH = 200;

/** Rounds a coordinate to 5 decimal places (~1 m) and drops trailing zeros */
function formatCoordinate(value: string): string {
  return String(Number(parseFloat(value).toFixed(5)));
}

/**
 * Builds a link that reproduces a calculation when opened
 * @param data - Observer inputs used for the calculation
 * @param baseUrl - Absolute URL of the calculator page (e.g. https://darkskycalculator.com/)
 */
export function buildShareUrl(data: ObserverFormData, baseUrl: string): string {
  const params = new URLSearchParams();
  params.set(SHARE_PARAMS.latitude, formatCoordinate(data.latitude));
  params.set(SHARE_PARAMS.longitude, formatCoordinate(data.longitude));
  if (data.elevation && parseFloat(data.elevation) !== 0) {
    params.set(SHARE_PARAMS.elevation, data.elevation);
  }
  params.set(SHARE_PARAMS.timezone, data.timezone);
  params.set(SHARE_PARAMS.dateStart, data.dateStart);
  params.set(SHARE_PARAMS.dateEnd, data.dateEnd);
  if (data.address) {
    params.set(SHARE_PARAMS.address, data.address);
  }

  const url = new URL(baseUrl);
  url.search = params.toString();
  return url.toString();
}

/**
 * Reads observer inputs from a shared link's query string.
 * Latitude and longitude are required; other values are included only when valid,
 * so callers can fill in defaults (e.g. look up the timezone) for anything missing.
 * @returns Parsed inputs, or null if the URL isn't a valid share link
 */
export function parseShareParams(search: string): SharedObserverData | null {
  const params = new URLSearchParams(search);
  const latitude = params.get(SHARE_PARAMS.latitude)?.trim() ?? '';
  const longitude = params.get(SHARE_PARAMS.longitude)?.trim() ?? '';

  if (validateLatitude(latitude) || validateLongitude(longitude)) {
    return null;
  }

  const shared: SharedObserverData = { latitude, longitude };

  const elevation = params.get(SHARE_PARAMS.elevation)?.trim();
  if (elevation && isValidNumber(elevation)) {
    shared.elevation = elevation;
  }

  const timezone = params.get(SHARE_PARAMS.timezone)?.trim();
  if (timezone && isValidTimezone(timezone)) {
    shared.timezone = timezone;
  }

  const dateStart = params.get(SHARE_PARAMS.dateStart)?.trim();
  const dateEnd = params.get(SHARE_PARAMS.dateEnd)?.trim();
  if (dateStart && dateEnd && ISO_DATE.test(dateStart) && ISO_DATE.test(dateEnd)) {
    shared.dateStart = dateStart;
    shared.dateEnd = dateEnd;
  }

  const address = params.get(SHARE_PARAMS.address)?.trim();
  if (address) {
    shared.address = address.slice(0, MAX_NAME_LENGTH);
  }

  return shared;
}
