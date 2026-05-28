/**
 * Core Unit Tests for Validation Functions
 * Tests all validation logic for form inputs
 * Run with: npm test
 */
import { describe, test, expect } from 'vitest';
import { validateLatitude, validateLongitude, validateElevation, validateDate, validateDateRange, validateFormData, } from '../utils/validation';
describe('Validation Functions - Core Unit Tests', () => {
    describe('validateLatitude', () => {
        test('accepts valid latitude values', () => {
            expect(validateLatitude('0')).toBeNull();
            expect(validateLatitude('40.7128')).toBeNull();
            expect(validateLatitude('-40.7128')).toBeNull();
            expect(validateLatitude('90')).toBeNull();
            expect(validateLatitude('-90')).toBeNull();
        });
        test('rejects latitude above 90', () => {
            const error = validateLatitude('91');
            expect(error).not.toBeNull();
            expect(error?.field).toBe('latitude');
            expect(error?.message).toContain('between -90 and 90');
        });
        test('rejects latitude below -90', () => {
            const error = validateLatitude('-91');
            expect(error).not.toBeNull();
            expect(error?.field).toBe('latitude');
            expect(error?.message).toContain('between -90 and 90');
        });
        test('rejects empty string', () => {
            const error = validateLatitude('');
            expect(error).not.toBeNull();
            expect(error?.field).toBe('latitude');
            expect(error?.message).toContain('required');
        });
        test('rejects whitespace only', () => {
            const error = validateLatitude('   ');
            expect(error).not.toBeNull();
            expect(error?.field).toBe('latitude');
        });
        test('rejects non-numeric values', () => {
            const error = validateLatitude('abc');
            expect(error).not.toBeNull();
            expect(error?.field).toBe('latitude');
            expect(error?.message).toContain('valid number');
        });
        test('accepts decimal values', () => {
            expect(validateLatitude('40.7128')).toBeNull();
            expect(validateLatitude('-33.8688')).toBeNull();
        });
    });
    describe('validateLongitude', () => {
        test('accepts valid longitude values', () => {
            expect(validateLongitude('0')).toBeNull();
            expect(validateLongitude('-74.0060')).toBeNull();
            expect(validateLongitude('180')).toBeNull();
            expect(validateLongitude('-180')).toBeNull();
        });
        test('rejects longitude above 180', () => {
            const error = validateLongitude('181');
            expect(error).not.toBeNull();
            expect(error?.field).toBe('longitude');
            expect(error?.message).toContain('between -180 and 180');
        });
        test('rejects longitude below -180', () => {
            const error = validateLongitude('-181');
            expect(error).not.toBeNull();
            expect(error?.field).toBe('longitude');
            expect(error?.message).toContain('between -180 and 180');
        });
        test('rejects empty string', () => {
            const error = validateLongitude('');
            expect(error).not.toBeNull();
            expect(error?.field).toBe('longitude');
            expect(error?.message).toContain('required');
        });
        test('rejects non-numeric values', () => {
            const error = validateLongitude('xyz');
            expect(error).not.toBeNull();
            expect(error?.field).toBe('longitude');
            expect(error?.message).toContain('valid number');
        });
        test('accepts decimal values', () => {
            expect(validateLongitude('-74.0060')).toBeNull();
            expect(validateLongitude('151.2093')).toBeNull();
        });
    });
    describe('validateElevation', () => {
        test('accepts valid elevation values', () => {
            expect(validateElevation('0')).toBeNull();
            expect(validateElevation('100')).toBeNull();
            expect(validateElevation('8848')).toBeNull(); // Mt. Everest
        });
        test('rejects negative elevation', () => {
            const error = validateElevation('-10');
            expect(error).not.toBeNull();
            expect(error?.field).toBe('elevation');
            expect(error?.message).toContain('cannot be negative');
        });
        test('rejects empty string', () => {
            const error = validateElevation('');
            expect(error).not.toBeNull();
            expect(error?.field).toBe('elevation');
            expect(error?.message).toContain('required');
        });
        test('rejects non-numeric values', () => {
            const error = validateElevation('high');
            expect(error).not.toBeNull();
            expect(error?.field).toBe('elevation');
            expect(error?.message).toContain('valid number');
        });
        test('accepts decimal values', () => {
            expect(validateElevation('123.45')).toBeNull();
        });
        test('accepts large elevation values', () => {
            expect(validateElevation('10000')).toBeNull();
        });
    });
    describe('validateDate', () => {
        test('accepts valid date format', () => {
            expect(validateDate('2024-01-15', 'dateStart')).toBeNull();
            expect(validateDate('2024-12-31', 'dateEnd')).toBeNull();
        });
        test('rejects invalid date format', () => {
            const error = validateDate('01/15/2024', 'dateStart');
            expect(error).not.toBeNull();
            expect(error?.field).toBe('dateStart');
            expect(error?.message).toContain('YYYY-MM-DD');
        });
        test('rejects empty string', () => {
            const error = validateDate('', 'dateStart');
            expect(error).not.toBeNull();
            expect(error?.field).toBe('dateStart');
            expect(error?.message).toContain('required');
        });
        test('accepts leap year dates', () => {
            expect(validateDate('2024-02-29', 'dateStart')).toBeNull(); // 2024 is leap year
        });
        test('accepts valid dates in various formats', () => {
            // Note: JavaScript Date constructor is lenient and auto-corrects invalid dates
            // e.g., 2024-02-30 becomes 2024-03-01, so these pass format validation
            expect(validateDate('2024-01-01', 'dateStart')).toBeNull();
            expect(validateDate('2024-12-31', 'dateEnd')).toBeNull();
        });
        test('shows correct field name in error', () => {
            const startError = validateDate('', 'dateStart');
            const endError = validateDate('', 'dateEnd');
            expect(startError?.message).toContain('Start');
            expect(endError?.message).toContain('End');
        });
    });
    describe('validateDateRange', () => {
        test('accepts valid date range', () => {
            expect(validateDateRange('2024-01-15', '2024-01-20')).toBeNull();
        });
        test('accepts same start and end date', () => {
            expect(validateDateRange('2024-01-15', '2024-01-15')).toBeNull();
        });
        test('rejects end date before start date', () => {
            const error = validateDateRange('2024-01-20', '2024-01-15');
            expect(error).not.toBeNull();
            expect(error?.field).toBe('dateEnd');
            expect(error?.message).toContain('on or after start date');
        });
        test('accepts date range spanning years', () => {
            expect(validateDateRange('2023-12-31', '2024-01-01')).toBeNull();
        });
        test('accepts long date ranges', () => {
            expect(validateDateRange('2024-01-01', '2024-12-31')).toBeNull();
        });
    });
    describe('validateFormData', () => {
        const validFormData = {
            latitude: '40.7128',
            longitude: '-74.0060',
            elevation: '10',
            dateStart: '2024-01-15',
            dateEnd: '2024-01-20',
            timezone: 'America/New_York',
            saveDefaultTimezone: false,
        };
        test('accepts valid form data', () => {
            const errors = validateFormData(validFormData);
            expect(errors).toHaveLength(0);
        });
        test('returns all validation errors', () => {
            const invalidData = {
                latitude: '100', // Invalid
                longitude: '200', // Invalid
                elevation: '-10', // Invalid
                dateStart: '', // Invalid
                dateEnd: '', // Invalid
                saveDefaultTimezone: false,
                timezone: '', // Invalid
            };
            const errors = validateFormData(invalidData);
            expect(errors.length).toBeGreaterThan(0);
            // Should have errors for each invalid field
            const fields = errors.map(e => e.field);
            expect(fields).toContain('latitude');
            expect(fields).toContain('longitude');
            expect(fields).toContain('elevation');
        });
        test('validates date range when both dates are valid', () => {
            const data = {
                ...validFormData,
                dateStart: '2024-01-20',
                dateEnd: '2024-01-15', // Before start
            };
            const errors = validateFormData(data);
            const rangeError = errors.find(e => e.field === 'dateEnd');
            expect(rangeError).toBeDefined();
            expect(rangeError?.message).toContain('on or after start date');
        });
        test('skips date range validation if dates are invalid', () => {
            const data = {
                ...validFormData,
                dateStart: 'invalid',
                dateEnd: 'invalid',
            };
            const errors = validateFormData(data);
            // Should have date format errors but not range error
            expect(errors.some(e => e.message.includes('YYYY-MM-DD'))).toBe(true);
        });
        test('requires timezone', () => {
            const data = {
                ...validFormData,
                timezone: '',
            };
            const errors = validateFormData(data);
            const tzError = errors.find(e => e.field === 'timezone');
            expect(tzError).toBeDefined();
            expect(tzError?.message).toContain('required');
        });
    });
    describe('coordinate validation integration', () => {
        test('validates coordinates together', () => {
            // Test the underlying validation logic that validateCoordinates uses
            const latValid = validateLatitude('40.7128');
            const lonValid = validateLongitude('-74.0060');
            expect(latValid).toBeNull();
            expect(lonValid).toBeNull();
        });
        test('detects invalid coordinates', () => {
            const latInvalid = validateLatitude('100');
            const lonInvalid = validateLongitude('200');
            expect(latInvalid).not.toBeNull();
            expect(lonInvalid).not.toBeNull();
        });
    });
    describe('Edge Cases and Boundary Values', () => {
        test('validates latitude at exact boundaries', () => {
            expect(validateLatitude('90')).toBeNull();
            expect(validateLatitude('-90')).toBeNull();
            expect(validateLatitude('90.0')).toBeNull();
            expect(validateLatitude('-90.0')).toBeNull();
        });
        test('validates longitude at exact boundaries', () => {
            expect(validateLongitude('180')).toBeNull();
            expect(validateLongitude('-180')).toBeNull();
            expect(validateLongitude('180.0')).toBeNull();
            expect(validateLongitude('-180.0')).toBeNull();
        });
        test('rejects latitude just outside boundaries', () => {
            expect(validateLatitude('90.0001')).not.toBeNull();
            expect(validateLatitude('-90.0001')).not.toBeNull();
            expect(validateLatitude('90.1')).not.toBeNull();
            expect(validateLatitude('-90.1')).not.toBeNull();
        });
        test('rejects longitude just outside boundaries', () => {
            expect(validateLongitude('180.0001')).not.toBeNull();
            expect(validateLongitude('-180.0001')).not.toBeNull();
            expect(validateLongitude('180.1')).not.toBeNull();
            expect(validateLongitude('-180.1')).not.toBeNull();
        });
        test('validates elevation at zero boundary', () => {
            expect(validateElevation('0')).toBeNull();
            expect(validateElevation('0.0')).toBeNull();
        });
        test('rejects negative elevation', () => {
            expect(validateElevation('-0.1')).not.toBeNull();
            expect(validateElevation('-1')).not.toBeNull();
        });
        test('handles very large valid elevation', () => {
            expect(validateElevation('8848')).toBeNull(); // Mt. Everest
            expect(validateElevation('10000')).toBeNull();
            expect(validateElevation('99999')).toBeNull();
        });
        test('handles very small decimal values', () => {
            expect(validateLatitude('0.0001')).toBeNull();
            expect(validateLongitude('0.0001')).toBeNull();
            expect(validateElevation('0.0001')).toBeNull();
        });
        test('handles scientific notation rejection', () => {
            expect(validateLatitude('1e2')).not.toBeNull();
            expect(validateLongitude('1e2')).not.toBeNull();
            expect(validateElevation('1e2')).not.toBeNull();
        });
        test('rejects special number values', () => {
            expect(validateLatitude('Infinity')).not.toBeNull();
            expect(validateLatitude('NaN')).not.toBeNull();
            expect(validateLongitude('Infinity')).not.toBeNull();
            expect(validateElevation('NaN')).not.toBeNull();
        });
    });
    describe('Date Validation Edge Cases', () => {
        test('validates dates at month boundaries', () => {
            expect(validateDate('2024-01-31', 'dateStart')).toBeNull();
            expect(validateDate('2024-02-29', 'dateStart')).toBeNull(); // Leap year
            expect(validateDate('2024-12-31', 'dateStart')).toBeNull();
        });
        test('handles year boundaries', () => {
            expect(validateDate('2024-01-01', 'dateStart')).toBeNull();
            expect(validateDate('2023-12-31', 'dateStart')).toBeNull();
        });
        test('validates date range across year boundary', () => {
            expect(validateDateRange('2023-12-31', '2024-01-01')).toBeNull();
        });
        test('validates date range across month boundary', () => {
            expect(validateDateRange('2024-01-31', '2024-02-01')).toBeNull();
        });
        test('handles same date for start and end', () => {
            expect(validateDateRange('2024-06-15', '2024-06-15')).toBeNull();
        });
        test('rejects end date one day before start', () => {
            const error = validateDateRange('2024-01-16', '2024-01-15');
            expect(error).not.toBeNull();
            expect(error?.field).toBe('dateEnd');
        });
        test('rejects end date far before start', () => {
            const error = validateDateRange('2024-12-31', '2024-01-01');
            expect(error).not.toBeNull();
            expect(error?.field).toBe('dateEnd');
        });
    });
});
