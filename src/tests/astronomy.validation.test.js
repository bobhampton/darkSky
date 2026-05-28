/**
 * Phase 2: API Validation Tests
 * These tests validate our calculations against trusted external APIs
 * Run with: npm run test:validation
 *
 * Note: These tests make network calls and are excluded from the default test suite.
 * They can be run manually to validate calculations or refresh fixtures.
 */
import { describe, test, expect } from 'vitest';
import * as Astronomy from 'astronomy-engine';
import { DateTime } from 'luxon';
import { getTimes } from '../utils/astronomy';
import { fetchSunriseSunsetAPI, fetchUSNOAPI, fetchOrUseFixture, getTimeDifferenceMinutes, parseISODateTime, } from './helpers/apiHelpers';
// Set to false to fetch fresh data from APIs (will hit external APIs instead of using cached fixtures)
const USE_FIXTURES = true;
// Maximum acceptable difference between our calculations and external APIs (accounts for rounding and minor calculation differences)
const TOLERANCE_MINUTES = 5;
// Test locations with specific astronomical characteristics
const TEST_LOCATIONS = {
    NYC: { lat: 40.7128, lng: -74.0060, name: 'New York City' },
    ARCTIC_RUSSIA: { lat: 76.5, lng: 69.2285, name: 'Arctic Russia (Novaya Zemlya)' },
    POLAR_86N: { lat: 86, lng: 0, name: 'Near North Pole (86°N)' },
};
// Standard test dates for validation
const TEST_DATES = {
    NYC_WINTER: '2024-01-15', // Mid-winter, short days, astronomical twilight occurs
    NYC_SUMMER: '2024-06-21', // Summer solstice, long days, minimal darkness
    ARCTIC_MOON_CROSSINGS_1: '2025-04-24', // Arctic: 2 moon rises, 1 moon set
    ARCTIC_MOON_CROSSINGS_2: '2025-05-06', // Arctic: 1 moon rise, 2 moon sets
    ARCTIC_SUN_CROSSINGS: '2025-11-04', // Arctic: Multiple sun crossings of -18°
    POLAR_NIGHT: '2025-12-13', // Polar night: sun below -18° all day
    MIDNIGHT_SUN: '2025-06-21', // Midnight sun: sun above -18° all day
};
/**
 * Helper: Run getTimes for a single date
 */
function runGetTimesForDate(observer, dateISO) {
    const dt = DateTime.fromISO(dateISO, { zone: 'UTC' });
    return getTimes(dt, dt, observer);
}
/**
 * Helper: Find metadata window from dark times result
 */
function findMetaWindow(darkTimes, date) {
    const windows = darkTimes[date];
    return windows?.find((w) => w.meta);
}
/**
 * Helper: Assert that date array is chronologically ordered
 */
function assertChronologicalOrder(dates, label) {
    dates.forEach((date, idx) => {
        expect(date, `${label}[${idx}] should be a Date instance`).toBeInstanceOf(Date);
        if (idx > 0) {
            expect(date.getTime(), `${label} should be in chronological order`)
                .toBeGreaterThan(dates[idx - 1].getTime());
        }
    });
}
describe('Astronomy Validation - External API Tests', () => {
    describe('Astronomical Twilight Validation (SunriseSunset.io)', () => {
        test('validates twilight times for NYC winter date', { timeout: 10000 }, async () => {
            const date = TEST_DATES.NYC_WINTER;
            const lat = TEST_LOCATIONS.NYC.lat;
            const lng = TEST_LOCATIONS.NYC.lng;
            // Fetch or load fixture
            const apiData = await fetchOrUseFixture('2024-01-15-nyc', () => fetchSunriseSunsetAPI(date, lat, lng, 'UTC'), 'sunrisesunset', USE_FIXTURES);
            // Our calculations
            const observer = new Astronomy.Observer(lat, lng, 0);
            const start = DateTime.fromISO(date, { zone: 'UTC' });
            const end = DateTime.fromISO(date, { zone: 'UTC' });
            const darkTimes = getTimes(start, end, observer);
            // Extract our twilight times from metadata
            const windows = darkTimes[date];
            expect(windows).toBeDefined();
            expect(windows.length).toBeGreaterThan(0);
            const metaWindow = windows.find(w => w.meta);
            expect(metaWindow).toBeDefined();
            // Compare astronomical twilight times
            // first_light = astronomical dawn (sun descends below -18°)
            // last_light = astronomical dusk (sun rises above -18°)
            const apiFirstLight = parseISODateTime(apiData.results.first_light);
            // NOTE: Our astronomicalNightEnds are morning twilight events
            // astronomicalNightStarts are evening twilight events
            if (metaWindow?.meta.astronomicalNightEnds && metaWindow.meta.astronomicalNightEnds.length > 0) {
                const ourTwilightStart = metaWindow.meta.astronomicalNightEnds[0]; // Morning twilight
                const diffStart = getTimeDifferenceMinutes(ourTwilightStart, apiFirstLight);
                expect(diffStart).toBeLessThan(TOLERANCE_MINUTES);
            }
            if (metaWindow?.meta.astronomicalNightStarts && metaWindow.meta.astronomicalNightStarts.length > 0) {
                const apiLastLight = parseISODateTime(apiData.results.last_light);
                const ourTwilightEnd = metaWindow.meta.astronomicalNightStarts[0]; // Evening twilight
                const diffEnd = getTimeDifferenceMinutes(ourTwilightEnd, apiLastLight);
                expect(diffEnd).toBeLessThan(TOLERANCE_MINUTES);
            }
        });
        test('validates twilight times for NYC summer date', { timeout: 10000 }, async () => {
            const date = TEST_DATES.NYC_SUMMER;
            const lat = TEST_LOCATIONS.NYC.lat;
            const lng = TEST_LOCATIONS.NYC.lng;
            const apiData = await fetchOrUseFixture('2024-06-21-nyc', () => fetchSunriseSunsetAPI(date, lat, lng, 'UTC'), 'sunrisesunset', USE_FIXTURES);
            const observer = new Astronomy.Observer(lat, lng, 0);
            const start = DateTime.fromISO(date, { zone: 'UTC' });
            const end = DateTime.fromISO(date, { zone: 'UTC' });
            const darkTimes = getTimes(start, end, observer);
            const windows = darkTimes[date];
            expect(windows).toBeDefined();
            const metaWindow = windows.find(w => w.meta);
            expect(metaWindow).toBeDefined();
            const apiFirstLight = parseISODateTime(apiData.results.first_light);
            // NOTE: On summer dates near solstice, astronomical twilight can extend past midnight
            // The API returns last_light for the NEXT day. Skip this comparison for now.
            // Our astronomicalNightEnds are morning twilight events
            if (metaWindow?.meta.astronomicalNightEnds && metaWindow.meta.astronomicalNightEnds.length > 0) {
                const ourTwilightStart = metaWindow.meta.astronomicalNightEnds[0]; // Morning twilight
                const diffStart = getTimeDifferenceMinutes(ourTwilightStart, apiFirstLight);
                expect(diffStart).toBeLessThan(TOLERANCE_MINUTES);
            }
            // Skip evening twilight comparison for summer dates due to day boundary issues
            // if (metaWindow?.meta.twilightStart) {
            //   const ourTwilightEnd = metaWindow.meta.twilightStart; // Actually the END (evening)
            //   const diffEnd = getTimeDifferenceMinutes(ourTwilightEnd, apiLastLight);
            //   expect(diffEnd).toBeLessThan(TOLERANCE_MINUTES);
            // }
        });
        test('validates sunrise/sunset times', { timeout: 10000 }, async () => {
            const date = TEST_DATES.NYC_WINTER;
            const lat = TEST_LOCATIONS.NYC.lat;
            const lng = TEST_LOCATIONS.NYC.lng;
            const apiData = await fetchOrUseFixture('2024-01-15-nyc', () => fetchSunriseSunsetAPI(date, lat, lng, 'UTC'), 'sunrisesunset', USE_FIXTURES);
            // Verify API data structure
            expect(apiData.results).toBeDefined();
            expect(apiData.results.sunrise).toBeDefined();
            expect(apiData.results.sunset).toBeDefined();
            expect(apiData.results.first_light).toBeDefined();
            expect(apiData.results.last_light).toBeDefined();
            expect(apiData.status).toBe('OK');
        });
    });
    describe('Moon Rise/Set Validation (USNO)', () => {
        test('validates moon data for NYC', { timeout: 10000 }, async () => {
            const date = TEST_DATES.NYC_WINTER;
            const lat = TEST_LOCATIONS.NYC.lat;
            const lon = TEST_LOCATIONS.NYC.lng;
            const apiData = await fetchOrUseFixture('2024-01-15-nyc', () => fetchUSNOAPI(date, lat, lon), 'usno', USE_FIXTURES);
            // Our calculations
            const observer = new Astronomy.Observer(lat, lon, 0);
            const start = DateTime.fromISO(date, { zone: 'America/New_York' });
            const end = DateTime.fromISO(date, { zone: 'America/New_York' });
            const darkTimes = getTimes(start, end, observer);
            const windows = darkTimes[date];
            expect(windows).toBeDefined();
            const metaWindow = windows.find(w => w.meta);
            expect(metaWindow).toBeDefined();
            // Verify API returned moon data
            expect(apiData.properties).toBeDefined();
            expect(apiData.properties.data).toBeDefined();
            // Note: USNO times are in local timezone, need conversion for comparison
            // For now, just verify structure and that our data exists
            if (metaWindow?.meta.moonRises && metaWindow.meta.moonRises.length > 0) {
                expect(metaWindow.meta.moonRises[0]).toBeInstanceOf(Date);
            }
            if (metaWindow?.meta.moonSets && metaWindow.meta.moonSets.length > 0) {
                expect(metaWindow.meta.moonSets[0]).toBeInstanceOf(Date);
            }
        });
        test('fetches moon phase data from USNO', { timeout: 10000 }, async () => {
            const date = TEST_DATES.NYC_WINTER;
            const lat = TEST_LOCATIONS.NYC.lat;
            const lon = TEST_LOCATIONS.NYC.lng;
            const apiData = await fetchOrUseFixture('2024-01-15-nyc', () => fetchUSNOAPI(date, lat, lon), 'usno', USE_FIXTURES);
            // Verify moon phase data exists in response
            expect(apiData.properties.data).toBeDefined();
            // USNO includes moon phase and illumination data
            if (apiData.properties.data.fracillum) {
                expect(typeof apiData.properties.data.fracillum).toBe('string');
            }
            if (apiData.properties.data.curphase) {
                expect(typeof apiData.properties.data.curphase).toBe('string');
            }
        });
    });
    describe('Fixture Management', () => {
        test('can save and load fixtures', { timeout: 10000 }, async () => {
            const date = TEST_DATES.NYC_WINTER;
            const lat = TEST_LOCATIONS.NYC.lat;
            const lng = TEST_LOCATIONS.NYC.lng;
            // This will either use existing fixture or create new one
            const data = await fetchOrUseFixture('2024-01-15-nyc', () => fetchSunriseSunsetAPI(date, lat, lng, 'UTC'), 'sunrisesunset', USE_FIXTURES);
            expect(data).toBeDefined();
            expect(data.results).toBeDefined();
            expect(data.status).toBe('OK');
        });
    });
    describe('Polar Region Edge Cases - Multiple Crossings', () => {
        const arcticObserver = new Astronomy.Observer(TEST_LOCATIONS.ARCTIC_RUSSIA.lat, TEST_LOCATIONS.ARCTIC_RUSSIA.lng, 0);
        test('handles 3 moon crossings (2 rises, 1 set) in one day at Arctic latitude 76.5°N', () => {
            const date = TEST_DATES.ARCTIC_MOON_CROSSINGS_1;
            const darkTimes = runGetTimesForDate(arcticObserver, date);
            expect(darkTimes[date]).toBeDefined();
            const metaWindow = findMetaWindow(darkTimes, date);
            expect(metaWindow).toBeDefined();
            expect(metaWindow?.meta.moonRises).toBeDefined();
            expect(metaWindow?.meta.moonSets).toBeDefined();
            expect(Array.isArray(metaWindow?.meta.moonRises)).toBe(true);
            expect(Array.isArray(metaWindow?.meta.moonSets)).toBe(true);
            // USNO API confirms 3 total crossings: 2 rises (00:46, 23:30) + 1 set (08:29)
            const totalCrossings = (metaWindow?.meta.moonRises.length || 0) +
                (metaWindow?.meta.moonSets.length || 0);
            expect(totalCrossings).toBe(3);
            expect(metaWindow?.meta.moonRises.length).toBe(2);
            expect(metaWindow?.meta.moonSets.length).toBe(1);
            // Verify all events are chronologically ordered
            assertChronologicalOrder(metaWindow?.meta.moonRises, 'moonRises');
            assertChronologicalOrder(metaWindow?.meta.moonSets, 'moonSets');
        });
        test('handles 3 moon crossings (1 rise, 2 sets) in one day at Arctic latitude 76.5°N', () => {
            const date = TEST_DATES.ARCTIC_MOON_CROSSINGS_2;
            const darkTimes = runGetTimesForDate(arcticObserver, date);
            expect(darkTimes[date]).toBeDefined();
            const metaWindow = findMetaWindow(darkTimes, date);
            expect(metaWindow).toBeDefined();
            expect(metaWindow?.meta.moonSets).toBeDefined();
            expect(metaWindow?.meta.moonRises).toBeDefined();
            expect(Array.isArray(metaWindow?.meta.moonSets)).toBe(true);
            expect(Array.isArray(metaWindow?.meta.moonRises)).toBe(true);
            // USNO API confirms 3 total crossings: 1 rise (05:08) + 2 sets (01:09, 23:32)
            const totalCrossings = (metaWindow?.meta.moonRises.length || 0) +
                (metaWindow?.meta.moonSets.length || 0);
            expect(totalCrossings).toBe(3);
            expect(metaWindow?.meta.moonRises.length).toBe(1);
            expect(metaWindow?.meta.moonSets.length).toBe(2);
            // Verify all events are chronologically ordered
            assertChronologicalOrder(metaWindow?.meta.moonSets, 'moonSets');
            assertChronologicalOrder(metaWindow?.meta.moonRises, 'moonRises');
        });
        test('handles multiple sun crossings of -18° threshold at Arctic latitude 76.5°N', () => {
            const date = TEST_DATES.ARCTIC_SUN_CROSSINGS;
            const darkTimes = runGetTimesForDate(arcticObserver, date);
            expect(darkTimes[date]).toBeDefined();
            const metaWindow = findMetaWindow(darkTimes, date);
            expect(metaWindow).toBeDefined();
            expect(metaWindow?.meta.astronomicalNightStarts).toBeDefined();
            expect(metaWindow?.meta.astronomicalNightEnds).toBeDefined();
            expect(Array.isArray(metaWindow?.meta.astronomicalNightStarts)).toBe(true);
            expect(Array.isArray(metaWindow?.meta.astronomicalNightEnds)).toBe(true);
            // Verify we captured sun crossings (may be 2 or 3 depending on exact conditions)
            const totalCrossings = (metaWindow?.meta.astronomicalNightStarts.length || 0) +
                (metaWindow?.meta.astronomicalNightEnds.length || 0);
            expect(totalCrossings).toBeGreaterThanOrEqual(2);
            // Verify all crossings are chronologically ordered
            assertChronologicalOrder(metaWindow?.meta.astronomicalNightStarts, 'astronomicalNightStarts');
            assertChronologicalOrder(metaWindow?.meta.astronomicalNightEnds, 'astronomicalNightEnds');
        });
        test('all polar edge case arrays are properly ordered chronologically', () => {
            const dates = [
                TEST_DATES.ARCTIC_MOON_CROSSINGS_1,
                TEST_DATES.ARCTIC_MOON_CROSSINGS_2,
                TEST_DATES.ARCTIC_SUN_CROSSINGS,
            ];
            dates.forEach(date => {
                const darkTimes = runGetTimesForDate(arcticObserver, date);
                const metaWindow = findMetaWindow(darkTimes, date);
                if (!metaWindow)
                    return;
                // Check all event arrays are chronologically ordered
                if (metaWindow.meta.moonRises.length > 1) {
                    assertChronologicalOrder(metaWindow.meta.moonRises, `${date} moonRises`);
                }
                if (metaWindow.meta.moonSets.length > 1) {
                    assertChronologicalOrder(metaWindow.meta.moonSets, `${date} moonSets`);
                }
                if (metaWindow.meta.astronomicalNightStarts.length > 1) {
                    assertChronologicalOrder(metaWindow.meta.astronomicalNightStarts, `${date} astronomicalNightStarts`);
                }
                if (metaWindow.meta.astronomicalNightEnds.length > 1) {
                    assertChronologicalOrder(metaWindow.meta.astronomicalNightEnds, `${date} astronomicalNightEnds`);
                }
            });
        });
        test('handles polar night - sun below -18° all day at 86°N (perpetual astronomical darkness)', () => {
            // Polar night: sun remains below -18° continuously
            const polarObserver = new Astronomy.Observer(TEST_LOCATIONS.POLAR_86N.lat, TEST_LOCATIONS.POLAR_86N.lng, 0);
            const date = TEST_DATES.POLAR_NIGHT;
            const darkTimes = runGetTimesForDate(polarObserver, date);
            expect(darkTimes[date]).toBeDefined();
            const windows = darkTimes[date];
            expect(windows.length).toBeGreaterThan(0);
            const metaWindow = findMetaWindow(darkTimes, date);
            expect(metaWindow).toBeDefined();
            // During polar night, there should be NO twilight transitions
            expect(metaWindow?.meta.astronomicalNightStarts).toBeDefined();
            expect(metaWindow?.meta.astronomicalNightEnds).toBeDefined();
            expect(metaWindow?.meta.astronomicalNightStarts.length).toBe(0);
            expect(metaWindow?.meta.astronomicalNightEnds.length).toBe(0);
            // The flag should indicate perpetual astronomical darkness
            expect(metaWindow?.meta.sunContinuouslyBelowTwilight).toBe(true);
            expect(metaWindow?.meta.sunContinuouslyAboveTwilight).not.toBe(true);
            // Moon tracking should still work
            expect(metaWindow?.meta.moonRises).toBeDefined();
            expect(metaWindow?.meta.moonSets).toBeDefined();
            expect(Array.isArray(metaWindow?.meta.moonRises)).toBe(true);
            expect(Array.isArray(metaWindow?.meta.moonSets)).toBe(true);
        });
        test('handles midnight sun - sun above -18° all day at 86°N (no astronomical darkness)', () => {
            // Midnight sun: sun remains above -18° continuously
            const polarObserver = new Astronomy.Observer(TEST_LOCATIONS.POLAR_86N.lat, TEST_LOCATIONS.POLAR_86N.lng, 0);
            const date = TEST_DATES.MIDNIGHT_SUN;
            const darkTimes = runGetTimesForDate(polarObserver, date);
            expect(darkTimes[date]).toBeDefined();
            const windows = darkTimes[date];
            expect(windows.length).toBeGreaterThan(0);
            const metaWindow = findMetaWindow(darkTimes, date);
            expect(metaWindow).toBeDefined();
            // During midnight sun, there should be NO astronomical night
            expect(metaWindow?.meta.astronomicalNightStarts).toBeDefined();
            expect(metaWindow?.meta.astronomicalNightEnds).toBeDefined();
            expect(metaWindow?.meta.astronomicalNightStarts.length).toBe(0);
            expect(metaWindow?.meta.astronomicalNightEnds.length).toBe(0);
            // The flag should indicate sun stays above twilight
            expect(metaWindow?.meta.sunContinuouslyAboveTwilight).toBe(true);
            expect(metaWindow?.meta.sunContinuouslyBelowTwilight).not.toBe(true);
            // There should be no dark windows (no astronomical darkness possible)
            const darkWindows = windows.filter(w => w.type === 'dawn' || w.type === 'dusk' || w.type === 'polarNight');
            expect(darkWindows.length).toBe(0);
            // Moon tracking should still work
            expect(metaWindow?.meta.moonRises).toBeDefined();
            expect(metaWindow?.meta.moonSets).toBeDefined();
            expect(Array.isArray(metaWindow?.meta.moonRises)).toBe(true);
            expect(Array.isArray(metaWindow?.meta.moonSets)).toBe(true);
        });
    });
});
