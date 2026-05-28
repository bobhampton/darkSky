/**
 * Application-wide constants
 * Centralizes magic numbers and configuration values
 */

// ===== Astronomical Constants =====

/**
 * Astronomical twilight threshold in degrees below horizon
 * When the sun is at or below this altitude, astronomical darkness begins
 */
export const ASTRONOMICAL_TWILIGHT_THRESHOLD = -18;

/**
 * Horizon threshold in degrees
 * Altitude of 0° represents the horizon
 */
export const HORIZON_THRESHOLD = 0;

// ===== Geographic Limits =====

/**
 * Minimum latitude in degrees (South Pole)
 */
export const MIN_LATITUDE = -90;

/**
 * Maximum latitude in degrees (North Pole)
 */
export const MAX_LATITUDE = 90;

/**
 * Minimum longitude in degrees
 */
export const MIN_LONGITUDE = -180;

/**
 * Maximum longitude in degrees
 */
export const MAX_LONGITUDE = 180;

/**
 * Minimum elevation in meters (sea level)
 */
export const MIN_ELEVATION = 0;

// ===== Date Range Limits =====

/**
 * Maximum date range for calculations in days (2 years)
 * Prevents excessive computation time
 */
export const MAX_DATE_RANGE_DAYS = 730;

// ===== Time Constants =====

/**
 * Number of hours in a day
 */
export const HOURS_IN_DAY = 24;

/**
 * Number of minutes in an hour
 */
export const MINUTES_IN_HOUR = 60;

/**
 * Chart sampling interval in minutes
 * Controls granularity of altitude chart data
 */
export const CHART_SAMPLE_INTERVAL_MINUTES = 1;

// ===== Altitude Limits =====

/**
 * Minimum possible altitude in degrees
 * Represents directly below (nadir)
 */
export const MIN_ALTITUDE_DEGREES = -90;

/**
 * Maximum possible altitude in degrees
 * Represents directly overhead (zenith)
 */
export const MAX_ALTITUDE_DEGREES = 90;
