import { DateTime } from 'https://cdn.jsdelivr.net/npm/luxon@2.0.0/build/es6/luxon.js';

export function calculateAltitude(body, observer, date) {
  const eq = Astronomy.Equator(body, date, observer, true, true);
  const hor = Astronomy.Horizon(date, observer, eq.ra, eq.dec, 'normal');
  return hor.altitude;
}

export function getTimes(dtStart, dtEnd, observer) {
  let darkObj = {};

  while (dtStart <= dtEnd) {
    const currentDate = dtStart.toISODate();

    let twilightStart = null;
    let twilightEnd = null;
    let moonRise = null;
    let moonSet = null;

    if (!darkObj[currentDate]) darkObj[currentDate] = [];

    const checkFullDarkDay = () => {
      const intervalMinutes = 1;
      let dt = dtStart.set({ hour: 0, minute: 0 });
      const end = dtStart.set({ hour: 23, minute: 59 });

      while (dt <= end) {
        const jsDate = dt.toUTC().toJSDate();
        const sunAlt = calculateAltitude('Sun', observer, jsDate);
        const moonAlt = calculateAltitude('Moon', observer, jsDate);

        // If either body breaks dark condition, bail out
        if (sunAlt > -18 || moonAlt >= 0) {
          return false;
        }

        dt = dt.plus({ minutes: intervalMinutes });
      }

      return true;
    };

    try {
      twilightStart = Astronomy.SearchAltitude('Sun', observer, -1, dtStart.toJSDate(), 1, -18);
    } catch (err) {
      console.log(`No astronomical twilight start found for ${dtStart.toISODate()}`);
    }

    try {
      twilightEnd = Astronomy.SearchAltitude('Sun', observer, +1, dtStart.toJSDate(), 1, -18);
    } catch (err) {
      console.log(`No astronomical twilight end found for ${dtStart.toISODate()}`);
    }

    try {
      moonRise = Astronomy.SearchRiseSet('Moon', observer, +1, dtStart.toJSDate(), 1);
    } catch (err) {
      console.log(`No moon rise found for ${dtStart.toISODate()}`);
    }

    try {
      moonSet = Astronomy.SearchRiseSet('Moon', observer, -1, dtStart.toJSDate(), 1);
    } catch (err) {
      console.log(`No moon set found for ${dtStart.toISODate()}`);
    }

    const moonAltStartDay = calculateAltitude('Moon', observer, dtStart.toJSDate());
    const moonAltEndDay = calculateAltitude('Moon', observer, dtStart.plus({ days: 1 }).toJSDate());

    const moonAltEndTwilight = twilightEnd ? calculateAltitude('Moon', observer, twilightEnd.date) : null;
    const moonAltStartTwilight = twilightStart ? calculateAltitude('Moon', observer, twilightStart.date) : null;

    let meta = {
      twilightStart: twilightStart?.date || null,
      twilightEnd: twilightEnd?.date || null,
      moonRise: moonRise?.date || null,
      moonSet: moonSet?.date || null,
      moonAltStartTwilight: moonAltStartTwilight ? moonAltStartTwilight : null,
      moonAltEndTwilight: moonAltEndTwilight ? moonAltEndTwilight : null,
      moonAltStartDay,
      moonAltEndDay
    }

    // Sun always below -18 degrees and moon always below horizon for entire day
    if (!twilightStart && !twilightEnd) {
      if (!moonRise && !moonSet && moonAltStartDay <= 0 && moonAltEndDay <= 0) {
        // Double check the that the whole day is dark
        if (checkFullDarkDay()) {
          darkObj[currentDate].push({
            start: dtStart.toJSDate(),
            end: dtStart.plus({ days: 1 }).minus({ milliseconds: 1 }).toJSDate(),
            type: 'fullDark',
            meta: {
              moonAltStartDay: calculateAltitude('Moon', observer, dtStart.toJSDate()),
              moonAltEndDay: calculateAltitude('Moon', observer, dtStart.plus({ days: 1 }).toJSDate()),
              fullDark: true
            }
          });
        }
        // Sun always below -18 degrees and moon rises above horizon
      } else if (moonRise && moonAltStartDay <= 0) {
        if (moonRise.date > dtStart.toJSDate()) {
          darkObj[currentDate].push({
            start: dtStart.toJSDate(),
            end: moonRise.date,
            type: 'dawn',
            meta: {
              twilightStart: null,
              twilightEnd: null,
              moonRise: moonRise.date,
              moonSet: null,
              moonAltStartDay: calculateAltitude('Moon', observer, dtStart.toJSDate()),
              moonAltEndDay: calculateAltitude('Moon', observer, dtStart.plus({ days: 1 }).toJSDate()),
              fullDark: true
            }
          })
        }
        // Sun always below -18 degrees and moon sets below horizon
      } else if (moonSet && moonAltEndDay <= 0) {
        if (moonSet.date < dtStart.plus({ days: 1 }).minus({ milliseconds: 1 }).toJSDate()) {
          darkObj[currentDate].push({
            start: moonSet.date,
            end: dtStart.plus({ days: 1 }).minus({ milliseconds: 1 }).toJSDate(),
            type: 'dusk',
            meta: {
              twilightStart: null,
              twilightEnd: null,
              moonRise: null,
              moonSet: moonSet.date,
              moonAltStartDay: calculateAltitude('Moon', observer, dtStart.toJSDate()),
              moonAltEndDay: calculateAltitude('Moon', observer, dtStart.plus({ days: 1 }).toJSDate()),
              fullDark: true
            }
          });
        }
      }
    }

    // If there is twilight start, but no twilight end
    if (twilightStart && !twilightEnd) {
      // Moon stays below horizon and doesn't rise
      if (moonAltStartDay <= 0 && moonAltEndTwilight <= 0 && !moonRise) {
        darkObj[currentDate].push({
          start: dtStart.toJSDate(),
          end: twilightEnd.date,
          type: 'dawn',
          meta
        });
      }
    }

    // If there is twilight end and moon altitude at twilight end is not null
    if (twilightEnd && moonAltEndTwilight !== null) {
      // Moon stays below horizon from beginning of day to twilight end
      if (moonAltStartDay <= 0 && moonAltEndTwilight <= 0) {
        darkObj[currentDate].push({
          start: dtStart.toJSDate(),
          end: twilightEnd.date,
          type: 'dawn',
          meta
        });
        // Moon above horizon at beginning of day and sets before twilight end
      } else if (moonSet && moonAltStartDay >= 0 && moonSet.date < twilightEnd.date) {
        darkObj[currentDate].push({
          start: moonSet.date,
          end: twilightEnd.date,
          type: 'dawn',
          meta
        });
        // Moon below horizon at beginning of day and rises before twilight end
      } else if (moonRise && moonAltStartDay <= 0 && moonRise.date < twilightEnd.date) {
        darkObj[currentDate].push({
          start: dtStart.toJSDate(),
          end: moonRise.date,
          type: 'dawn',
          meta
        });
      }
    }

    // If there is twilight start and moon altitude at twilight start is not null
    if (twilightStart && moonAltStartTwilight !== null) {
      // Moon stays below horizon from twilight start to end of day
      if (moonAltStartTwilight <= 0 && moonAltEndDay <= 0) {
        darkObj[currentDate].push({
          start: twilightStart.date,
          end: dtStart.plus({ days: 1 }).minus({ milliseconds: 1 }).toJSDate(),
          type: 'dusk',
          meta
        });
        // Moon above horizon at twilight start and sets after twilight start
      } else if (moonSet && moonAltEndDay <= 0 && moonSet.date > twilightStart.date) {
        darkObj[currentDate].push({
          start: moonSet.date,
          end: dtStart.plus({ days: 1 }).minus({ milliseconds: 1 }).toJSDate(),
          type: 'dusk',
          meta
        });
        // Moon below horizon at twilight start and rises after twilight start
      } else if (moonRise && moonAltEndDay >= 0 && moonRise.date > twilightStart.date) {
        darkObj[currentDate].push({
          start: twilightStart.date,
          end: moonRise.date,
          type: 'dusk',
          meta
        });
      }
    }

    // Save fallback metadata for the day, even if no dark times found
    darkObj[currentDate].push({
      type: 'metaOnly',
      meta
    });

    dtStart = dtStart.plus({ days: 1 });
  }

  return darkObj;
}