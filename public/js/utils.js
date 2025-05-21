import { DateTime } from 'https://cdn.jsdelivr.net/npm/luxon@2.0.0/build/es6/luxon.js';

export function IsValidNumber(s) {
  return typeof s === 'string' && /^[\-\+]?\d+(\.\d*)?$/.test(s);
}

export function FormatDate(date, zone) {
  return DateTime.fromJSDate(new Date(date)).setZone(zone).toFormat('HH:mm:ss');
}
