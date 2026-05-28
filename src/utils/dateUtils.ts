import { DateTime } from 'luxon';

/**
 * Validates if a string is a valid number
 * @param s - String to validate
 * @returns true if string is a valid number format
 */
export function isValidNumber(s: string): boolean {
  return /^[\-\+]?\d+(\.\d*)?$/.test(s);
}

/**
 * Formats a Date object to HH:mm:ss in the specified timezone
 * @param date - Date to format
 * @param zone - IANA timezone identifier
 * @returns Formatted time string (HH:mm:ss)
 */
export function formatDate(date: Date, zone: string): string {
  return DateTime.fromJSDate(date).setZone(zone).toFormat('HH:mm:ss');
}

/**
 * Formats a Date object to full date and time in the specified timezone
 * @param date - Date to format
 * @param zone - IANA timezone identifier
 * @returns Formatted datetime string (yyyy-MM-dd HH:mm:ss)
 */
export function formatDateTime(date: Date, zone: string): string {
  return DateTime.fromJSDate(date).setZone(zone).toFormat('yyyy-MM-dd HH:mm:ss');
}

/**
 * Formats a Date object to ISO date format
 * @param date - Date to format
 * @param zone - IANA timezone identifier
 * @returns ISO date string (yyyy-MM-dd)
 */
export function formatISODate(date: Date, zone: string): string {
  return DateTime.fromJSDate(date).setZone(zone).toFormat('yyyy-MM-dd');
}

/**
 * Safely formats a nullable date
 * @param date - Date to format or null
 * @param zone - IANA timezone identifier
 * @param fallback - Fallback string if date is null
 * @returns Formatted time string or fallback
 */
export function formatDateSafe(
  date: Date | null,
  zone: string,
  fallback: string = 'N/A'
): string {
  if (!date) return fallback;
  return formatDate(date, zone);
}

/**
 * Formats a number to a fixed decimal places, handling null values
 * @param value - Number to format or null
 * @param decimals - Number of decimal places
 * @param fallback - Fallback string if value is null
 * @returns Formatted number string or fallback
 */
export function formatNumber(
  value: number | null | undefined,
  decimals: number = 2,
  fallback: string = 'N/A'
): string {
  if (value === null || value === undefined) return fallback;
  return value.toFixed(decimals);
}

/**
 * Convert 24-hour format time to 12-hour format with AM/PM
 * @param time24 - Time string in 24-hour format (e.g., "21:00")
 * @returns Object with hours (1-12), minutes (0-59), and period ('AM' | 'PM')
 */
export function convert24To12Hour(time24: string): {
  hours: number;
  minutes: number;
  period: 'AM' | 'PM';
} {
  const [hoursStr, minutesStr] = time24.split(':');
  const hours24 = parseInt(hoursStr, 10);
  const minutes = parseInt(minutesStr, 10);
  
  const period: 'AM' | 'PM' = hours24 >= 12 ? 'PM' : 'AM';
  let hours12 = hours24 % 12;
  if (hours12 === 0) hours12 = 12; // 0:00 -> 12:00 AM, 12:00 -> 12:00 PM
  
  return { hours: hours12, minutes, period };
}

/**
 * Convert 12-hour format time to 24-hour format
 * @param hours - Hours in 12-hour format (1-12)
 * @param minutes - Minutes (0-59)
 * @param period - 'AM' or 'PM'
 * @returns Time string in 24-hour format (e.g., "21:00")
 */
export function convert12To24Hour(
  hours: number,
  minutes: number,
  period: 'AM' | 'PM'
): string {
  let hours24 = hours;
  
  if (period === 'AM') {
    if (hours === 12) hours24 = 0; // 12:00 AM -> 00:00
  } else {
    if (hours !== 12) hours24 = hours + 12; // 1:00 PM -> 13:00, but 12:00 PM stays 12:00
  }
  
  const hoursStr = hours24.toString().padStart(2, '0');
  const minutesStr = minutes.toString().padStart(2, '0');
  
  return `${hoursStr}:${minutesStr}`;
}

/**
 * Format time in 24-hour format to 12-hour format with AM/PM for display
 * @param time24 - Time string in 24-hour format (e.g., "21:00")
 * @returns Formatted time string (e.g., "9:00 PM")
 */
export function formatTime12Hour(time24: string): string {
  const { hours, minutes, period } = convert24To12Hour(time24);
  const minutesStr = minutes.toString().padStart(2, '0');
  return `${hours}:${minutesStr} ${period}`;
}

/**
 * Extract time in HH:mm format from a Date object in a specific timezone
 * @param date - Date object to extract time from
 * @param timezone - IANA timezone identifier
 * @returns Time string in 24-hour format (e.g., "21:00")
 */
export function extractTimeFromDate(date: Date, timezone: string): string {
  return DateTime.fromJSDate(date).setZone(timezone).toFormat('HH:mm');
}
