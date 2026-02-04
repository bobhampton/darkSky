

/**
 * Metadata for a dark time window containing astronomical event details
 */
export interface DarkTimeMetadata {
  /** Astronomical night start times (sun descends below -18°, evening) - can be multiple in polar regions */
  astronomicalNightStarts: Date[];
  /** Astronomical night end times (sun ascends above -18°, morning) - can be multiple in polar regions */
  astronomicalNightEnds: Date[];
  /** Moon rise times - can be multiple in polar regions */
  moonRises: Date[];
  /** Moon set times - can be multiple in polar regions */
  moonSets: Date[];
  /** Moon altitude at start of day (00:00:00) */
  moonAltStartDay: number;
  /** Moon altitude at end of day (23:59:59) */
  moonAltEndDay: number;
  /** Moon altitude at astronomical night start */
  moonAltStartNight?: number | null;
  /** Moon altitude at astronomical night end */
  moonAltEndNight?: number | null;
  /** Indicates if this is a polar night (24 hours of darkness) */
  polarNight?: boolean;
  /** Sun stays above -18° all day (no astronomical night) */
  sunContinuouslyAboveTwilight?: boolean;
  /** Sun stays below -18° all day (perpetual astronomical night) */
  sunContinuouslyBelowTwilight?: boolean;
  /** Moon stays above horizon all day */
  moonContinuouslyAboveHorizon?: boolean;
  /** Moon stays below horizon all day */
  moonContinuouslyBelowHorizon?: boolean;
}

/**
 * Represents a single dark sky time window
 */
export interface DarkTimeWindow {
  /** Start time of the dark window */
  start: Date;
  /** End time of the dark window */
  end: Date;
  /** Type of dark window */
  type: 'dawn' | 'dusk' | 'polarNight' | 'metaOnly';
  /** Detailed metadata about astronomical events */
  meta: DarkTimeMetadata;
}

/**
 * Collection of dark time windows organized by date
 * Key format: YYYY-MM-DD
 */
export interface DarkTimesData {
  [date: string]: DarkTimeWindow[];
}

/**
 * Parameters required for calculating dark sky times
 */
export interface CalculationParams {
  /** Latitude in degrees (-90 to 90) */
  latitude: number;
  /** Longitude in degrees (-180 to 180) */
  longitude: number;
  /** Elevation in meters */
  elevation: number;
  /** Start date in ISO format (YYYY-MM-DD) */
  dateStart: string;
  /** End date in ISO format (YYYY-MM-DD) */
  dateEnd: string;
  /** IANA timezone identifier (e.g., 'America/New_York') */
  timezone: string;
}

/**
 * Observer configuration for astronomical calculations
 */
export interface ObserverConfig {
  /** Latitude in degrees */
  latitude: number;
  /** Longitude in degrees */
  longitude: number;
  /** Elevation in meters */
  elevation: number;
  /** IANA timezone identifier */
  timezone: string;
}
