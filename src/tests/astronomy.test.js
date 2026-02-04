/**
 * Core Unit Tests for Astronomy Calculations
 * These tests run offline without API calls for fast, reliable testing
 * Run with: npm test
 */
import { describe, test, expect } from 'vitest';
import * as Astronomy from 'astronomy-engine';
import { DateTime } from 'luxon';
import { calculateAltitude, getTimes } from '../utils/astronomy';
// Astronomical constants
const ASTRONOMICAL_TWILIGHT_THRESHOLD = -18; // Degrees below horizon for astronomical twilight
// Expected sun altitudes (with tolerances for calculation variations)
const SUN_ALTITUDE_RANGES = {
    NYC_SUMMER_SOLSTICE_NOON: { min: 65, max: 75 }, // Expected ~70° ±5° at NYC latitude
    NYC_WINTER_SOLSTICE_MIDNIGHT: { max: -30 }, // Well below horizon
};
// Test locations
const TEST_OBSERVERS = {
    NYC: new Astronomy.Observer(40.7128, -74.0060, 0), // New York City
    ARCTIC: new Astronomy.Observer(78.2232, 15.6267, 0), // Svalbard, Norway
    EQUATOR: new Astronomy.Observer(0, -78.4678, 0), // Quito, Ecuador
};
// Test dates
const TEST_DATES = {
    SUMMER_SOLSTICE_2024: '2024-06-21',
    WINTER_SOLSTICE_2024: '2024-12-21',
    MID_WINTER_2024: '2024-01-15',
    MID_WINTER_WEEK_START: '2024-01-15',
    MID_WINTER_WEEK_END: '2024-01-21',
};
// Minimum altitude difference threshold (degrees) for comparing different latitudes
const MIN_LATITUDE_ALTITUDE_DIFFERENCE = 5;
describe('Astronomy Calculations - Core Unit Tests', () => {
    // Test locations (kept for backwards compatibility with existing observer pattern)
    const nycObserver = TEST_OBSERVERS.NYC;
    const arcticObserver = TEST_OBSERVERS.ARCTIC;
    const equatorObserver = TEST_OBSERVERS.EQUATOR;
    describe('calculateAltitude - Sun', () => {
        test('calculates sun altitude at noon on summer solstice in NYC', () => {
            // Summer solstice: sun should be high in sky
            const date = new Date('2024-06-21T12:00:00-04:00');
            const sunAlt = calculateAltitude('Sun', nycObserver, date);
            // Expected: ~70° at noon (varies with exact time and atmospheric conditions)
            expect(sunAlt).toBeGreaterThan(SUN_ALTITUDE_RANGES.NYC_SUMMER_SOLSTICE_NOON.min);
            expect(sunAlt).toBeLessThan(SUN_ALTITUDE_RANGES.NYC_SUMMER_SOLSTICE_NOON.max);
        });
        test('calculates sun altitude at midnight on winter solstice in NYC', () => {
            // Winter solstice midnight: sun should be well below horizon
            const date = new Date('2024-12-21T00:00:00-05:00');
            const sunAlt = calculateAltitude('Sun', nycObserver, date);
            // Expected: well below horizon (negative altitude)
            expect(sunAlt).toBeLessThan(SUN_ALTITUDE_RANGES.NYC_WINTER_SOLSTICE_MIDNIGHT.max);
        });
        test('calculates sun altitude below -18° for astronomical darkness', () => {
            // During astronomical twilight, sun should be below -18°
            const date = new Date('2024-01-15T22:00:00-05:00'); // Late evening
            const sunAlt = calculateAltitude('Sun', nycObserver, date);
            // Should be well into astronomical twilight
            expect(sunAlt).toBeLessThan(ASTRONOMICAL_TWILIGHT_THRESHOLD);
        });
        test('calculates sun altitude at different latitudes', () => {
            const date = new Date('2024-06-21T12:00:00Z');
            // NYC (mid-latitude)
            const nycAlt = calculateAltitude('Sun', nycObserver, date);
            // Arctic (high latitude)
            const arcticAlt = calculateAltitude('Sun', arcticObserver, date);
            // Equator (low latitude)
            const equatorAlt = calculateAltitude('Sun', equatorObserver, date);
            // All should be valid altitudes
            expect(nycAlt).toBeGreaterThan(-90);
            expect(nycAlt).toBeLessThan(90);
            expect(arcticAlt).toBeGreaterThan(-90);
            expect(arcticAlt).toBeLessThan(90);
            expect(equatorAlt).toBeGreaterThan(-90);
            expect(equatorAlt).toBeLessThan(90);
            // Arctic should have different altitude than NYC (at least 5° difference)
            expect(Math.abs(arcticAlt - nycAlt)).toBeGreaterThan(MIN_LATITUDE_ALTITUDE_DIFFERENCE);
        });
        test('sun altitude changes over time', () => {
            const morning = new Date('2024-01-15T07:00:00-05:00');
            const noon = new Date('2024-01-15T12:00:00-05:00');
            const evening = new Date('2024-01-15T17:00:00-05:00');
            const morningAlt = calculateAltitude('Sun', nycObserver, morning);
            const noonAlt = calculateAltitude('Sun', nycObserver, noon);
            const eveningAlt = calculateAltitude('Sun', nycObserver, evening);
            // Noon should have highest altitude
            expect(noonAlt).toBeGreaterThan(morningAlt);
            expect(noonAlt).toBeGreaterThan(eveningAlt);
        });
    });
    describe('calculateAltitude - Moon', () => {
        test('calculates moon altitude within valid range', () => {
            const date = new Date('2024-06-21T12:00:00-04:00');
            const moonAlt = calculateAltitude('Moon', nycObserver, date);
            // Moon altitude must be between -90° and +90°
            expect(typeof moonAlt).toBe('number');
            expect(moonAlt).toBeGreaterThan(-90);
            expect(moonAlt).toBeLessThan(90);
            expect(Number.isFinite(moonAlt)).toBe(true);
        });
        test('calculates moon altitude at different times', () => {
            const time1 = new Date('2024-01-15T00:00:00-05:00');
            const time2 = new Date('2024-01-15T12:00:00-05:00');
            const alt1 = calculateAltitude('Moon', nycObserver, time1);
            const alt2 = calculateAltitude('Moon', nycObserver, time2);
            // Both should be valid numbers
            expect(Number.isFinite(alt1)).toBe(true);
            expect(Number.isFinite(alt2)).toBe(true);
        });
    });
    describe('getTimes - Basic Functionality', () => {
        test('calculates dark times for a single day', () => {
            const start = DateTime.fromISO(TEST_DATES.MID_WINTER_2024, { zone: 'America/New_York' });
            const end = DateTime.fromISO(TEST_DATES.MID_WINTER_2024, { zone: 'America/New_York' });
            const darkTimes = getTimes(start, end, nycObserver);
            expect(darkTimes).toBeDefined();
            expect(darkTimes[TEST_DATES.MID_WINTER_2024]).toBeDefined();
            expect(Array.isArray(darkTimes[TEST_DATES.MID_WINTER_2024])).toBe(true);
            expect(darkTimes[TEST_DATES.MID_WINTER_2024].length).toBeGreaterThan(0);
        });
        test('calculates dark times for date range (3 days)', () => {
            const start = DateTime.fromISO(TEST_DATES.MID_WINTER_2024, { zone: 'America/New_York' });
            const end = DateTime.fromISO('2024-01-17', { zone: 'America/New_York' });
            const darkTimes = getTimes(start, end, nycObserver);
            expect(Object.keys(darkTimes)).toHaveLength(3);
            expect(darkTimes[TEST_DATES.MID_WINTER_2024]).toBeDefined();
            expect(darkTimes['2024-01-16']).toBeDefined();
            expect(darkTimes['2024-01-17']).toBeDefined();
        });
        test('returns windows with correct structure', () => {
            const start = DateTime.fromISO(TEST_DATES.MID_WINTER_2024, { zone: 'America/New_York' });
            const end = DateTime.fromISO(TEST_DATES.MID_WINTER_2024, { zone: 'America/New_York' });
            const darkTimes = getTimes(start, end, nycObserver);
            const windows = darkTimes[TEST_DATES.MID_WINTER_2024];
            expect(windows.length).toBeGreaterThan(0);
            // Check structure of each window
            windows.forEach(window => {
                expect(window).toHaveProperty('start');
                expect(window).toHaveProperty('end');
                expect(window).toHaveProperty('type');
                expect(window).toHaveProperty('meta');
                expect(window.start).toBeInstanceOf(Date);
                expect(window.end).toBeInstanceOf(Date);
                expect(['dawn', 'dusk', 'polarNight', 'metaOnly']).toContain(window.type);
            });
        });
        test('handles date range spanning week', () => {
            const start = DateTime.fromISO(TEST_DATES.MID_WINTER_WEEK_START, { zone: 'America/New_York' });
            const end = DateTime.fromISO(TEST_DATES.MID_WINTER_WEEK_END, { zone: 'America/New_York' });
            const darkTimes = getTimes(start, end, nycObserver);
            // Should have 7 days of data
            expect(Object.keys(darkTimes)).toHaveLength(7);
        });
        test('metadata contains expected properties', () => {
            const start = DateTime.fromISO(TEST_DATES.MID_WINTER_2024, { zone: 'America/New_York' });
            const end = DateTime.fromISO(TEST_DATES.MID_WINTER_2024, { zone: 'America/New_York' });
            const darkTimes = getTimes(start, end, nycObserver);
            const window = darkTimes[TEST_DATES.MID_WINTER_2024][0];
            expect(window.meta).toBeDefined();
            expect(window.meta).toHaveProperty('moonAltStartDay');
            expect(window.meta).toHaveProperty('moonAltEndDay');
            expect(typeof window.meta.moonAltStartDay).toBe('number');
            expect(typeof window.meta.moonAltEndDay).toBe('number');
        });
    });
    describe('Observer Creation', () => {
        test('creates observer with correct coordinates', () => {
            const observer = new Astronomy.Observer(40.7128, -74.0060, 10);
            expect(observer.latitude).toBe(40.7128);
            expect(observer.longitude).toBe(-74.0060);
            expect(observer.height).toBe(10);
        });
        test('creates observer with zero elevation', () => {
            const observer = new Astronomy.Observer(40.7128, -74.0060, 0);
            expect(observer.height).toBe(0);
        });
        test('creates observer at different locations', () => {
            const observers = [
                new Astronomy.Observer(0, 0, 0), // Equator
                new Astronomy.Observer(90, 0, 0), // North Pole
                new Astronomy.Observer(-90, 0, 0), // South Pole
                new Astronomy.Observer(40.7128, -74.0060, 0), // NYC
            ];
            observers.forEach(obs => {
                expect(obs.latitude).toBeGreaterThanOrEqual(-90);
                expect(obs.latitude).toBeLessThanOrEqual(90);
                expect(obs.longitude).toBeGreaterThanOrEqual(-180);
                expect(obs.longitude).toBeLessThanOrEqual(180);
            });
        });
    });
    describe('getTimes - Edge Cases', () => {
        test('handles date range spanning month boundary', () => {
            const start = DateTime.fromISO('2024-01-30', { zone: 'America/New_York' });
            const end = DateTime.fromISO('2024-02-02', { zone: 'America/New_York' });
            const darkTimes = getTimes(start, end, nycObserver);
            // Should have 4 days: Jan 30, 31 and Feb 1, 2
            expect(Object.keys(darkTimes)).toHaveLength(4);
            expect(darkTimes['2024-01-30']).toBeDefined();
            expect(darkTimes['2024-01-31']).toBeDefined();
            expect(darkTimes['2024-02-01']).toBeDefined();
            expect(darkTimes['2024-02-02']).toBeDefined();
        });
        test('handles date range spanning year boundary', () => {
            const start = DateTime.fromISO('2023-12-30', { zone: 'America/New_York' });
            const end = DateTime.fromISO('2024-01-02', { zone: 'America/New_York' });
            const darkTimes = getTimes(start, end, nycObserver);
            // Should have 4 days spanning two years
            expect(Object.keys(darkTimes)).toHaveLength(4);
            expect(darkTimes['2023-12-30']).toBeDefined();
            expect(darkTimes['2023-12-31']).toBeDefined();
            expect(darkTimes['2024-01-01']).toBeDefined();
            expect(darkTimes['2024-01-02']).toBeDefined();
        });
        test('handles leap year date (Feb 29)', () => {
            const start = DateTime.fromISO('2024-02-29', { zone: 'America/New_York' });
            const end = DateTime.fromISO('2024-02-29', { zone: 'America/New_York' });
            const darkTimes = getTimes(start, end, nycObserver);
            expect(darkTimes['2024-02-29']).toBeDefined();
            expect(darkTimes['2024-02-29'].length).toBeGreaterThan(0);
        });
        test('handles single day range (start equals end)', () => {
            const start = DateTime.fromISO(TEST_DATES.MID_WINTER_2024, { zone: 'America/New_York' });
            const end = DateTime.fromISO(TEST_DATES.MID_WINTER_2024, { zone: 'America/New_York' });
            const darkTimes = getTimes(start, end, nycObserver);
            expect(Object.keys(darkTimes)).toHaveLength(1);
            expect(darkTimes[TEST_DATES.MID_WINTER_2024]).toBeDefined();
        });
        test('produces consistent results for same date range', () => {
            const start = DateTime.fromISO(TEST_DATES.MID_WINTER_2024, { zone: 'America/New_York' });
            const end = DateTime.fromISO(TEST_DATES.MID_WINTER_2024, { zone: 'America/New_York' });
            const result1 = getTimes(start, end, nycObserver);
            const result2 = getTimes(start, end, nycObserver);
            expect(Object.keys(result1)).toEqual(Object.keys(result2));
            expect(result1[TEST_DATES.MID_WINTER_2024].length).toBe(result2[TEST_DATES.MID_WINTER_2024].length);
        });
    });
    describe('Elevation Impact', () => {
        test('elevation affects calculations for same location', () => {
            const date = new Date('2024-06-21T12:00:00Z');
            const observerSeaLevel = new Astronomy.Observer(40.7128, -74.0060, 0);
            const observerHighElevation = new Astronomy.Observer(40.7128, -74.0060, 3000); // 3000m elevation
            const altSeaLevel = calculateAltitude('Sun', observerSeaLevel, date);
            const altHighElev = calculateAltitude('Sun', observerHighElevation, date);
            // Both should be valid
            expect(Number.isFinite(altSeaLevel)).toBe(true);
            expect(Number.isFinite(altHighElev)).toBe(true);
            // They should be very close but may differ slightly
            expect(Math.abs(altSeaLevel - altHighElev)).toBeLessThan(1); // Less than 1° difference
        });
        test('getTimes works with various elevation values', () => {
            const start = DateTime.fromISO(TEST_DATES.MID_WINTER_2024, { zone: 'America/New_York' });
            const end = DateTime.fromISO(TEST_DATES.MID_WINTER_2024, { zone: 'America/New_York' });
            const elevations = [0, 100, 1000, 5000];
            elevations.forEach(elev => {
                const observer = new Astronomy.Observer(40.7128, -74.0060, elev);
                const darkTimes = getTimes(start, end, observer);
                expect(darkTimes[TEST_DATES.MID_WINTER_2024]).toBeDefined();
                expect(darkTimes[TEST_DATES.MID_WINTER_2024].length).toBeGreaterThan(0);
            });
        });
    });
    describe('Boundary Conditions', () => {
        test('calculates altitude near twilight threshold', () => {
            // Test times when sun should be near -18° threshold
            const testTimes = [
                new Date('2024-01-15T05:30:00-05:00'), // Near dawn
                new Date('2024-01-15T18:30:00-05:00'), // Near dusk
            ];
            testTimes.forEach(date => {
                const sunAlt = calculateAltitude('Sun', nycObserver, date);
                // Should be within reasonable range of twilight threshold
                expect(sunAlt).toBeGreaterThan(-30);
                expect(sunAlt).toBeLessThan(10);
            });
        });
        test('handles moon altitude at horizon (0° crossing)', () => {
            // Moon altitude should be calculable at all times
            const testDate = new Date('2024-01-15T12:00:00-05:00');
            const moonAlt = calculateAltitude('Moon', nycObserver, testDate);
            expect(Number.isFinite(moonAlt)).toBe(true);
            expect(moonAlt).toBeGreaterThan(-90);
            expect(moonAlt).toBeLessThan(90);
        });
        test('handles extreme latitudes', () => {
            const date = new Date('2024-06-21T12:00:00Z');
            const extremeObservers = [
                new Astronomy.Observer(89, 0, 0), // Near North Pole
                new Astronomy.Observer(-89, 0, 0), // Near South Pole
            ];
            extremeObservers.forEach(obs => {
                const sunAlt = calculateAltitude('Sun', obs, date);
                const moonAlt = calculateAltitude('Moon', obs, date);
                expect(Number.isFinite(sunAlt)).toBe(true);
                expect(Number.isFinite(moonAlt)).toBe(true);
            });
        });
    });
});
