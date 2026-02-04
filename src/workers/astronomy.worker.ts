/**
 * Web Worker for astronomical calculations
 * Runs getTimes() on a separate thread to prevent UI blocking
 */

import { Observer } from 'astronomy-engine';
import { DateTime } from 'luxon';
import { getTimes } from '../utils/astronomy';
import { getValidTimezone } from '../utils/timezones';
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

    // Calculate total days for progress reporting
    const totalDays = Math.ceil(end.diff(start, 'days').days) + 1;

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
