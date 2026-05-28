/**
 * Default timezone to use when no timezone is specified or validation fails
 */
export const DEFAULT_TIMEZONE = 'UTC';

/**
 * List of all IANA timezone identifiers supported by the browser
 */
export const timezones: readonly string[] = Intl.supportedValuesOf('timeZone');

/**
 * Filters timezones by search term
 * @param searchTerm - String to search for in timezone names
 * @returns Filtered array of timezone names
 */
export function filterTimezones(searchTerm: string): string[] {
  if (!searchTerm || searchTerm.trim() === '') {
    return [...timezones];
  }

  const search = searchTerm.toLowerCase();
  return timezones.filter((tz) => tz.toLowerCase().includes(search));
}

/**
 * Gets the default timezone from localStorage or returns UTC
 * @returns Default timezone identifier
 */
export function getDefaultTimezone(): string {
  try {
    const storedTimezone = localStorage.getItem('DefaultTimeZone');
    
    // Validate stored timezone before returning it
    if (storedTimezone && isValidTimezone(storedTimezone)) {
      return storedTimezone;
    }
    
    // If invalid or missing, remove corrupted data and return default
    if (storedTimezone) {
      console.warn(`Invalid timezone "${storedTimezone}" in localStorage, clearing`);
      localStorage.removeItem('DefaultTimeZone');
    }
    
    return DEFAULT_TIMEZONE;
  } catch (error) {
    console.warn('Error reading default timezone from localStorage:', error);
    return DEFAULT_TIMEZONE;
  }
}

/**
 * Saves the default timezone to localStorage
 * @param timezone - IANA timezone identifier to save
 */
export function saveDefaultTimezone(timezone: string): void {
  try {
    // Validate timezone before saving
    if (!isValidTimezone(timezone)) {
      console.warn(`Cannot save invalid timezone "${timezone}" to localStorage`);
      return;
    }
    localStorage.setItem('DefaultTimeZone', timezone);
  } catch (error) {
    // Check for quota exceeded error
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      console.error('localStorage quota exceeded, cannot save default timezone');
    } else {
      console.warn('Error saving default timezone to localStorage:', error);
    }
  }
}

/**
 * Removes the default timezone from localStorage
 */
export function removeDefaultTimezone(): void {
  try {
    localStorage.removeItem('DefaultTimeZone');
  } catch (error) {
    console.warn('Error removing default timezone from localStorage:', error);
  }
}

/**
 * Validates if a timezone string is a valid IANA timezone
 * @param timezone - Timezone to validate
 * @returns true if valid, false otherwise
 */
export function isValidTimezone(timezone: string): boolean {
  return timezones.includes(timezone);
}

/**
 * Gets the user's system timezone
 * @returns System timezone identifier or UTC if unable to determine
 */
export function getSystemTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || DEFAULT_TIMEZONE;
  } catch (error) {
    console.warn('Error getting system timezone:', error);
    return DEFAULT_TIMEZONE;
  }
}

/**
 * Validates timezone and returns UTC if invalid/empty
 * @param timezone - Timezone string to validate
 * @returns Valid timezone string or UTC as fallback
 */
export function getValidTimezone(timezone: string | undefined | null): string {
  if (!timezone || timezone.trim() === '') {
    return DEFAULT_TIMEZONE;
  }
  
  // Check if timezone is valid by attempting to use it
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone });
    return timezone;
  } catch {
    console.warn(`Invalid timezone "${timezone}", defaulting to ${DEFAULT_TIMEZONE}`);
    return DEFAULT_TIMEZONE;
  }
}
