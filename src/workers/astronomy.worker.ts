/**
 * Web Worker for astronomical calculations
 * Runs getTimes() on a separate thread to prevent UI blocking
 */

import { Observer } from 'astronomy-engine';
import { DateTime } from 'luxon';
import { getTimes } from '../utils/astronomy';
import { getValidTimezone } from '../utils/timezones';
import {
  MIN_LATITUDE,
  MAX_LATITUDE,
  MIN_LONGITUDE,
  MAX_LONGITUDE,
  MAX_DATE_RANGE_DAYS,
} from '../utils/constants';
import type {
  WorkerCalculateMessage,
  WorkerProgressMessage,
  WorkerResultMessage,
  WorkerErrorMessage,
} from '../types/worker.types';
import type { DarkTimesData } from '../types/astronomy.types';

// Listen for messages from main thread
self.addEventListener('message', (event: MessageEvent<WorkerCalculateMessage>) => {
  const { type, params } = event.data;

  if (type !== 'calculate') {
    return;
  }

  try {
    // Validate input parameters
    if (!params.latitude || isNaN(params.latitude) || params.latitude < MIN_LATITUDE || params.latitude > MAX_LATITUDE) {
      throw new Error(`Invalid latitude: must be between ${MIN_LATITUDE} and ${MAX_LATITUDE} degrees`);
    }
    if (!params.longitude || isNaN(params.longitude) || params.longitude < MIN_LONGITUDE || params.longitude > MAX_LONGITUDE) {
      throw new Error(`Invalid longitude: must be between ${MIN_LONGITUDE} and ${MAX_LONGITUDE} degrees`);
    }
    if (params.elevation === undefined || isNaN(params.elevation)) {
      throw new Error('Invalid elevation: must be a number');
    }

    // Create observer object
    const observer = new Observer(
      params.latitude,
      params.longitude,
      params.elevation
    );

    // Validate timezone and fall back to UTC if invalid
    const validTimezone = getValidTimezone(params.timezone);

    // Convert start date and end date to DateTime objects
    const start = DateTime.fromISO(params.dateStart, { zone: validTimezone });
    const end = DateTime.fromISO(params.dateEnd, { zone: validTimezone });

    // Validate dates
    if (!start.isValid) {
      throw new Error('Invalid start date: ' + start.invalidReason);
    }
    if (!end.isValid) {
      throw new Error('Invalid end date: ' + end.invalidReason);
    }
    if (end < start) {
      throw new Error('End date must be after start date');
    }

    // Calculate total days for progress reporting
    const totalDays = Math.ceil(end.diff(start, 'days').days) + 1;

    // Check for reasonable date range (e.g., max 2 years)
    if (totalDays > MAX_DATE_RANGE_DAYS) {
      throw new Error(`Date range too large: maximum 2 years (${MAX_DATE_RANGE_DAYS} days)`);
    }

    // Modified getTimes to support progress reporting
    const data = getTimesWithProgress(start, end, observer, totalDays);

    // Send result back to main thread
    const resultMessage: WorkerResultMessage = {
      type: 'result',
      data,
    };
    self.postMessage(resultMessage);
  } catch (err) {
    // Send error back to main thread
    const errorMessage: WorkerErrorMessage = {
      type: 'error',
      error: err instanceof Error ? err.message : 'Calculation failed',
    };
    self.postMessage(errorMessage);
    console.error('Worker error:', err);
  }
});

/**
 * Modified version of getTimes that reports progress
 * This is a copy of the getTimes function with progress reporting added
 */
function getTimesWithProgress(
  dtStart: DateTime,
  dtEnd: DateTime,
  observer: Observer,
  totalDays: number
): DarkTimesData {
  const darkObj: Record<string, any[]> = {};
  let currentDay = 0;

  // Import the getTimes function logic inline to add progress reporting
  const startDate = dtStart;
  let dt = startDate;

  while (dt <= dtEnd) {
    currentDay++;

    // Report progress every 10 days or at the end
    if (currentDay % 10 === 0 || currentDay === totalDays) {
      const progressMessage: WorkerProgressMessage = {
        type: 'progress',
        current: currentDay,
        total: totalDays,
        currentDate: dt.toISODate() || '',
      };
      self.postMessage(progressMessage);
    }

    // Use the original getTimes logic for a single day
    // We'll call getTimes for just this one day
    const dayEnd = dt.plus({ days: 1 }).minus({ milliseconds: 1 });
    const dayData = getTimes(dt, dayEnd, observer);

    // Merge day data into result
    Object.assign(darkObj, dayData);

    dt = dt.plus({ days: 1 });
  }

  return darkObj;
}
