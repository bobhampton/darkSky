import type { ObserverFormData, ValidationError } from '@/types';
import { isValidNumber } from './dateUtils';

/**
 * Validates latitude value
 * @param lat - Latitude string to validate
 * @returns ValidationError if invalid, null if valid
 */
export function validateLatitude(lat: string): ValidationError | null {
  if (!lat || lat.trim() === '') {
    return {
      field: 'latitude',
      message: 'Latitude is required',
    };
  }

  if (!isValidNumber(lat)) {
    return {
      field: 'latitude',
      message: 'Latitude must be a valid number',
    };
  }

  const num = parseFloat(lat);
  if (isNaN(num) || num < -90 || num > 90) {
    return {
      field: 'latitude',
      message: 'Latitude must be between -90 and 90',
    };
  }

  return null;
}

/**
 * Validates longitude value
 * @param lon - Longitude string to validate
 * @returns ValidationError if invalid, null if valid
 */
export function validateLongitude(lon: string): ValidationError | null {
  if (!lon || lon.trim() === '') {
    return {
      field: 'longitude',
      message: 'Longitude is required',
    };
  }

  if (!isValidNumber(lon)) {
    return {
      field: 'longitude',
      message: 'Longitude must be a valid number',
    };
  }

  const num = parseFloat(lon);
  if (isNaN(num) || num < -180 || num > 180) {
    return {
      field: 'longitude',
      message: 'Longitude must be between -180 and 180',
    };
  }

  return null;
}

/**
 * Validates elevation value
 * @param elev - Elevation string to validate
 * @returns ValidationError if invalid, null if valid
 */
export function validateElevation(elev: string): ValidationError | null {
  if (!elev || elev.trim() === '') {
    return {
      field: 'elevation',
      message: 'Elevation is required',
    };
  }

  if (!isValidNumber(elev)) {
    return {
      field: 'elevation',
      message: 'Elevation must be a valid number',
    };
  }

  const num = parseFloat(elev);
  if (isNaN(num) || num < 0) {
    return {
      field: 'elevation',
      message: 'Elevation cannot be negative',
    };
  }

  return null;
}

/**
 * Validates date string is in correct format
 * @param date - Date string to validate
 * @param fieldName - Name of the field being validated
 * @returns ValidationError if invalid, null if valid
 */
export function validateDate(
  date: string,
  fieldName: 'dateStart' | 'dateEnd'
): ValidationError | null {
  if (!date || date.trim() === '') {
    return {
      field: fieldName,
      message: `${fieldName === 'dateStart' ? 'Start' : 'End'} date is required`,
    };
  }

  // Check if date is in YYYY-MM-DD format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return {
      field: fieldName,
      message: 'Date must be in YYYY-MM-DD format',
    };
  }

  // Check if date is valid
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    return {
      field: fieldName,
      message: 'Invalid date',
    };
  }

  return null;
}

/**
 * Validates date range (start must be before or equal to end)
 * @param dateStart - Start date string
 * @param dateEnd - End date string
 * @returns ValidationError if invalid, null if valid
 */
export function validateDateRange(
  dateStart: string,
  dateEnd: string
): ValidationError | null {
  const start = new Date(dateStart);
  const end = new Date(dateEnd);

  if (start > end) {
    return {
      field: 'dateEnd',
      message: 'End date must be on or after start date',
    };
  }

  return null;
}

/**
 * Validates minimum duration value
 * @param duration - Duration string to validate
 * @returns ValidationError if invalid, null if valid
 */
export function validateMinDuration(duration: string): ValidationError | null {
  // Empty string is valid (no filter)
  if (!duration || duration.trim() === '') {
    return null;
  }

  if (!isValidNumber(duration)) {
    return {
      field: 'minDuration' as keyof ObserverFormData,
      message: 'Minimum duration must be a valid number',
    };
  }

  const num = parseFloat(duration);
  if (isNaN(num) || num < 0) {
    return {
      field: 'minDuration' as keyof ObserverFormData,
      message: 'Minimum duration cannot be negative',
    };
  }

  return null;
}

/**
 * Validates complete observer form data
 * @param data - Form data to validate
 * @returns Array of validation errors (empty if all valid)
 */
export function validateFormData(data: ObserverFormData): ValidationError[] {
  const errors: ValidationError[] = [];

  // Validate latitude
  const latError = validateLatitude(data.latitude);
  if (latError) errors.push(latError);

  // Validate longitude
  const lonError = validateLongitude(data.longitude);
  if (lonError) errors.push(lonError);

  // Validate elevation
  const elevError = validateElevation(data.elevation);
  if (elevError) errors.push(elevError);

  // Validate start date
  const startDateError = validateDate(data.dateStart, 'dateStart');
  if (startDateError) errors.push(startDateError);

  // Validate end date
  const endDateError = validateDate(data.dateEnd, 'dateEnd');
  if (endDateError) errors.push(endDateError);

  // Validate date range (only if both dates are valid)
  if (!startDateError && !endDateError) {
    const rangeError = validateDateRange(data.dateStart, data.dateEnd);
    if (rangeError) errors.push(rangeError);
  }

  // Timezone is required
  if (!data.timezone || data.timezone.trim() === '') {
    errors.push({
      field: 'timezone',
      message: 'Timezone is required',
    });
  }

  return errors;
}

/**
 * Validates coordinates specifically for observer form
 * @param latId - Latitude value
 * @param lonId - Longitude value
 * @returns true if valid, false if invalid
 */
export function validateCoordinates(lat: string, lon: string): boolean {
  const latError = validateLatitude(lat);
  const lonError = validateLongitude(lon);

  if (latError || lonError) {
    const messages: string[] = [];
    if (latError) messages.push(latError.message);
    if (lonError) messages.push(lonError.message);
    // Alert is handled by the calling component
    console.error('Validation errors:', messages.join('\n'));
    return false;
  }

  return true;
}

/**
 * Validates time format (HH:mm in 24-hour format)
 * @param time - Time string to validate
 * @returns true if valid format, false otherwise
 */
function isValidTimeFormat(time: string): boolean {
  const timeRegex = /^([0-1][0-9]|2[0-3]):([0-5][0-9])$/;
  return timeRegex.test(time);
}

/**
 * Validates time range filter
 * @param timeRange - TimeRangeFilter object to validate
 * @returns Error message string if invalid, null if valid
 */
export function validateTimeRange(timeRange: {
  startTime: string;
  endTime: string;
  enabled: boolean;
}): string | null {
  // If disabled, no validation needed
  if (!timeRange.enabled) {
    return null;
  }

  // Validate start time format
  if (!isValidTimeFormat(timeRange.startTime)) {
    return 'Start time must be in valid format (HH:mm)';
  }

  // Validate end time format
  if (!isValidTimeFormat(timeRange.endTime)) {
    return 'End time must be in valid format (HH:mm)';
  }

  // Validate that start and end times are different
  if (timeRange.startTime === timeRange.endTime) {
    return 'Start and end times must be different';
  }

  // Note: We allow overnight ranges (e.g., "23:00" to "02:00")
  // So we don't validate that startTime < endTime

  return null;
}
