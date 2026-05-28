import * as Astronomy from 'astronomy-engine';
import { DateTime } from 'luxon';
import type { DarkTimesData, DarkTimeMetadata } from '@/types';

/**
 * Calculates the altitude of a celestial body at a specific time
 * @param body - Celestial body ('Sun' or 'Moon')
 * @param observer - Observer location
 * @param date - Date/time for calculation
 * @returns Altitude in degrees
 */
export function calculateAltitude(
  body: 'Sun' | 'Moon',
  observer: Astronomy.Observer,
  date: Date
): number {
  const bodyEnum = body === 'Sun' ? Astronomy.Body.Sun : Astronomy.Body.Moon;
  const eq = Astronomy.Equator(bodyEnum, date, observer, true, true);
  const hor = Astronomy.Horizon(date, observer, eq.ra, eq.dec, 'normal');
  return hor.altitude;
}

/**
 * Scans a celestial body's altitude throughout an entire day
 * @param body - Celestial body to check
 * @param dtStart - Start DateTime for the day
 * @param observer - Observer location
 * @param threshold - Altitude threshold in degrees
 * @param intervalMinutes - Sampling interval (default: 1 minute)
 * @returns Object with alwaysAbove and alwaysBelow flags
 */
function scanAltitudeAllDay(
  body: 'Sun' | 'Moon',
  dtStart: DateTime,
  observer: Astronomy.Observer,
  threshold: number,
  intervalMinutes: number = 1
): { alwaysAbove: boolean; alwaysBelow: boolean } {
  let dt = dtStart.set({ hour: 0, minute: 0 });
  const end = dtStart.set({ hour: 23, minute: 59 });
  let alwaysAbove = true;
  let alwaysBelow = true;

  while (dt <= end) {
    const jsDate = dt.toUTC().toJSDate();
    const altitude = calculateAltitude(body, observer, jsDate);
    
    if (altitude > threshold) {
      alwaysBelow = false;
    } else {
      alwaysAbove = false;
    }
    
    // Early exit if we know both are false
    if (!alwaysAbove && !alwaysBelow) {
      return { alwaysAbove: false, alwaysBelow: false };
    }
    
    dt = dt.plus({ minutes: intervalMinutes });
  }

  return { alwaysAbove, alwaysBelow };
}

/**
 * Checks if a celestial body maintains an altitude condition throughout the entire day
 * @param body - Celestial body to check
 * @param dtStart - Start DateTime for the day
 * @param observer - Observer location
 * @param threshold - Altitude threshold in degrees
 * @param checkBelow - If true, checks if body stays BELOW threshold. If false, checks if it stays ABOVE
 * @param intervalMinutes - Sampling interval (default: 1 minute)
 * @returns true if the condition holds for the entire day
 */
function checkAltitudeAllDay(
  body: 'Sun' | 'Moon',
  dtStart: DateTime,
  observer: Astronomy.Observer,
  threshold: number,
  checkBelow: boolean,
  intervalMinutes: number = 1
): boolean {
  const result = scanAltitudeAllDay(body, dtStart, observer, threshold, intervalMinutes);
  return checkBelow ? result.alwaysBelow : result.alwaysAbove;
}

/**
 * Checks if an entire day is dark (sun below -18° and moon below horizon)
 * @param dtStart - Start DateTime for the day
 * @param observer - Observer location
 * @returns true if the entire day is dark
 */
function checkPolarNightDay(dtStart: DateTime, observer: Astronomy.Observer): boolean {
  // Sun must stay below -18° AND moon must stay below 0°
  return checkAltitudeAllDay('Sun', dtStart, observer, -18, true) &&
         checkAltitudeAllDay('Moon', dtStart, observer, 0, true);
}

/**
 * Finds all altitude crossings for a celestial body within a time range
 * Handles polar edge cases where a body can cross a threshold multiple times per day
 * @param body - Celestial body name ('Sun' or 'Moon')
 * @param observer - Observer location
 * @param startTime - Start of search window
 * @param endTime - End of search window (typically 1 day later)
 * @param altitude - Altitude threshold in degrees
 * @param direction - Direction of crossing: +1 (ascending), -1 (descending)
 * @param maxEvents - Maximum number of events to find (default: 3)
 * @returns Array of Date objects when crossings occur
 */
function findAllAltitudeCrossings(
  body: 'Sun' | 'Moon',
  observer: Astronomy.Observer,
  startTime: Date,
  endTime: Date,
  altitude: number,
  direction: 1 | -1,
  maxEvents: number = 3
): Date[] {
  const events: Date[] = [];
  let searchStart = startTime;
  const bodyEnum = body === 'Sun' ? Astronomy.Body.Sun : Astronomy.Body.Moon;
  
  while (searchStart < endTime && events.length < maxEvents) {
    try {
      const daysToSearch = (endTime.getTime() - searchStart.getTime()) / (1000 * 60 * 60 * 24);
      const event = Astronomy.SearchAltitude(bodyEnum, observer, direction, searchStart, daysToSearch, altitude);
      if (event && event.date <= endTime) {
        events.push(event.date);
        // Continue searching 1 minute after this event
        searchStart = new Date(event.date.getTime() + 60000);
      } else {
        break;
      }
    } catch {
      break;
    }
  }
  
  return events;
}

/**
 * Finds all rise/set events for a celestial body within a time range
 * Handles polar edge cases where a body can rise or set multiple times per day
 * @param body - Celestial body enum
 * @param observer - Observer location
 * @param startTime - Start of search window
 * @param endTime - End of search window (typically 1 day later)
 * @param direction - Direction: +1 (rise), -1 (set)
 * @param maxEvents - Maximum number of events to find (default: 3)
 * @returns Array of Date objects when rise/set occurs
 */
function findAllRiseSet(
  body: Astronomy.Body,
  observer: Astronomy.Observer,
  startTime: Date,
  endTime: Date,
  direction: 1 | -1,
  maxEvents: number = 3
): Date[] {
  const events: Date[] = [];
  let searchStart = startTime;
  
  while (searchStart < endTime && events.length < maxEvents) {
    try {
      const daysToSearch = (endTime.getTime() - searchStart.getTime()) / (1000 * 60 * 60 * 24);
      const event = Astronomy.SearchRiseSet(body, observer, direction, searchStart, daysToSearch);
      if (event && event.date <= endTime) {
        events.push(event.date);
        // Continue searching 1 minute after this event
        searchStart = new Date(event.date.getTime() + 60000);
      } else {
        break;
      }
    } catch {
      break;
    }
  }
  
  return events;
}

/**
 * Calculates dark sky time windows for a date range
 * This is the core function that determines when the sky is darkest
 * (sun below -18° and moon not visible)
 * 
 * @param dtStart - Start DateTime
 * @param dtEnd - End DateTime
 * @param observer - Observer location (lat, lon, elevation)
 * @returns Object mapping dates to arrays of dark time windows
 */
export function getTimes(
  dtStart: DateTime,
  dtEnd: DateTime,
  observer: Astronomy.Observer
): DarkTimesData {
  const darkObj: DarkTimesData = {};

  while (dtStart <= dtEnd) {
    const currentDate = dtStart.toISODate();
    if (!currentDate) {
      dtStart = dtStart.plus({ days: 1 });
      continue;
    }

    if (!darkObj[currentDate]) darkObj[currentDate] = [];

    const dayStart = dtStart.toJSDate();
    const dayEnd = dtStart.plus({ days: 1 }).toJSDate();

    // Find ALL astronomical night crossings (sun crossing -18°)
    const astronomicalNightStarts = findAllAltitudeCrossings('Sun', observer, dayStart, dayEnd, -18, -1);
    const astronomicalNightEnds = findAllAltitudeCrossings('Sun', observer, dayStart, dayEnd, -18, +1);

    // Find ALL moon rise/set events
    const moonRises = findAllRiseSet(Astronomy.Body.Moon, observer, dayStart, dayEnd, +1);
    const moonSets = findAllRiseSet(Astronomy.Body.Moon, observer, dayStart, dayEnd, -1);

    // Calculate moon altitudes at key times
    const moonAltStartDay = calculateAltitude('Moon', observer, dayStart);
    const moonAltEndDay = calculateAltitude('Moon', observer, dayEnd);
    const moonAltEndNight = astronomicalNightEnds.length > 0 ? calculateAltitude('Moon', observer, astronomicalNightEnds[0]) : null;
    const moonAltStartNight = astronomicalNightStarts.length > 0 ? calculateAltitude('Moon', observer, astronomicalNightStarts[0]) : null;

    // Detect circumpolar conditions
    let sunContinuouslyAboveTwilight = false;
    let sunContinuouslyBelowTwilight = false;
    let moonContinuouslyAboveHorizon = false;
    let moonContinuouslyBelowHorizon = false;

    // If no twilight crossings, determine if sun is continuously above or below -18°
    if (astronomicalNightStarts.length === 0 && astronomicalNightEnds.length === 0) {
      const sunRelationship = scanAltitudeAllDay('Sun', dtStart, observer, -18);
      sunContinuouslyAboveTwilight = sunRelationship.alwaysAbove;
      sunContinuouslyBelowTwilight = sunRelationship.alwaysBelow;
    }

    // If no moon crossings, determine if moon is continuously above or below horizon
    if (moonRises.length === 0 && moonSets.length === 0) {
      const moonRelationship = scanAltitudeAllDay('Moon', dtStart, observer, 0);
      moonContinuouslyAboveHorizon = moonRelationship.alwaysAbove;
      moonContinuouslyBelowHorizon = moonRelationship.alwaysBelow;
    }

    // Build metadata object
    const meta: DarkTimeMetadata = {
      astronomicalNightStarts,
      astronomicalNightEnds,
      moonRises,
      moonSets,
      moonAltStartNight: moonAltStartNight || null,
      moonAltEndNight: moonAltEndNight || null,
      moonAltStartDay,
      moonAltEndDay,
      sunContinuouslyAboveTwilight,
      sunContinuouslyBelowTwilight,
      moonContinuouslyAboveHorizon,
      moonContinuouslyBelowHorizon,
    };

    // Scenario 1: No astronomical night crossings found
    // This means either: sun stays above -18° all day OR sun stays below -18° all day
    if (astronomicalNightStarts.length === 0 && astronomicalNightEnds.length === 0) {
      // Check if sun stays above -18° all day (never gets dark enough)
      const sunStaysAbove = checkAltitudeAllDay('Sun', dtStart, observer, -18, false);
      
      if (sunStaysAbove) {
        // Sun never reaches -18° - no dark time possible, skip to metaOnly
      } else {
        // Sun stays below -18° all day - check moon conditions
        if (moonRises.length === 0 && moonSets.length === 0 && moonAltStartDay <= 0 && moonAltEndDay <= 0) {
          // Double check that the whole day is dark
          if (checkPolarNightDay(dtStart, observer)) {
            darkObj[currentDate].push({
              start: dayStart,
              end: dtStart.plus({ days: 1 }).minus({ milliseconds: 1 }).toJSDate(),
              type: 'polarNight',
              meta: {
                ...meta,
                polarNight: true,
              },
            });
          }
        }
        // Sun always below -18° and moon rises above horizon
        else if (moonRises.length > 0 && moonAltStartDay <= 0) {
          if (moonRises[0] > dayStart) {
            darkObj[currentDate].push({
              start: dayStart,
              end: moonRises[0],
              type: 'dawn',
              meta: {
                ...meta,
                polarNight: true,
              },
            });
          }
        }
        // Sun always below -18° and moon sets below horizon
        else if (moonSets.length > 0 && moonAltEndDay <= 0) {
          if (moonSets[0] < dtStart.plus({ days: 1 }).minus({ milliseconds: 1 }).toJSDate()) {
            darkObj[currentDate].push({
              start: moonSets[0],
              end: dtStart.plus({ days: 1 }).minus({ milliseconds: 1 }).toJSDate(),
              type: 'dusk',
              meta: {
                ...meta,
                polarNight: true,
              },
            });
          }
        }
      }
    }

    // Scenario 2: Astronomical night start exists but no night end
    if (astronomicalNightStarts.length > 0 && astronomicalNightEnds.length === 0) {
      // Moon stays below horizon and doesn't rise
      if (moonAltStartDay <= 0 && moonAltEndNight !== null && moonAltEndNight <= 0 && moonRises.length === 0) {
        darkObj[currentDate].push({
          start: dayStart,
          end: astronomicalNightStarts[0],
          type: 'dawn',
          meta,
        });
      }
    }

    // Scenario 3: Astronomical night end exists
    if (astronomicalNightEnds.length > 0 && moonAltEndNight !== null) {
      // Moon stays below horizon from beginning of day to night end
      if (moonAltStartDay <= 0 && moonAltEndNight <= 0) {
        darkObj[currentDate].push({
          start: dayStart,
          end: astronomicalNightEnds[0],
          type: 'dawn',
          meta,
        });
      }
      // Moon above horizon at beginning of day and sets before night end
      else if (moonSets.length > 0 && moonAltStartDay >= 0 && moonSets[0] < astronomicalNightEnds[0]) {
        darkObj[currentDate].push({
          start: moonSets[0],
          end: astronomicalNightEnds[0],
          type: 'dawn',
          meta,
        });
      }
      // Moon below horizon at beginning of day and rises before night end
      else if (moonRises.length > 0 && moonAltStartDay <= 0 && moonRises[0] < astronomicalNightEnds[0]) {
        darkObj[currentDate].push({
          start: dayStart,
          end: moonRises[0],
          type: 'dawn',
          meta,
        });
      }
    }

    // Scenario 4: Astronomical night start exists
    if (astronomicalNightStarts.length > 0 && moonAltStartNight !== null) {
      // Moon stays below horizon from night start to end of day
      if (moonAltStartNight <= 0 && moonAltEndDay <= 0) {
        darkObj[currentDate].push({
          start: astronomicalNightStarts[0],
          end: dtStart.plus({ days: 1 }).minus({ milliseconds: 1 }).toJSDate(),
          type: 'dusk',
          meta,
        });
      }
      // Moon above horizon at night start and sets after night start
      else if (moonSets.length > 0 && moonAltEndDay <= 0 && moonSets[0] > astronomicalNightStarts[0]) {
        darkObj[currentDate].push({
          start: moonSets[0],
          end: dtStart.plus({ days: 1 }).minus({ milliseconds: 1 }).toJSDate(),
          type: 'dusk',
          meta,
        });
      }
      // Moon below horizon at night start and rises after night start
      else if (moonRises.length > 0 && moonAltEndDay >= 0 && moonRises[0] > astronomicalNightStarts[0]) {
        darkObj[currentDate].push({
          start: astronomicalNightStarts[0],
          end: moonRises[0],
          type: 'dusk',
          meta,
        });
      }
    }

    // Save fallback metadata for the day, even if no dark times found
    darkObj[currentDate].push({
      start: dtStart.set({ hour: 0, minute: 0, second: 0 }).toJSDate(),
      end: dtStart.set({ hour: 0, minute: 0, second: 0 }).toJSDate(),
      type: 'metaOnly',
      meta,
    });

    dtStart = dtStart.plus({ days: 1 });
  }

  return darkObj;
}
