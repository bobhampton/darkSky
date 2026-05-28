/**
 * Core Unit Tests for Date Utility Functions
 * Tests all date formatting and validation utilities
 * Run with: npm test
 */

import { describe, test, expect } from 'vitest';
import {
  isValidNumber,
  formatDate,
  formatDateTime,
  formatISODate,
  formatDateSafe,
  formatNumber,
} from '../utils/dateUtils';

describe('Date Utility Functions - Core Unit Tests', () => {
  describe('isValidNumber', () => {
    test('accepts valid integer strings', () => {
      expect(isValidNumber('0')).toBe(true);
      expect(isValidNumber('123')).toBe(true);
      expect(isValidNumber('-456')).toBe(true);
    });

    test('accepts valid decimal strings', () => {
      expect(isValidNumber('123.456')).toBe(true);
      expect(isValidNumber('-123.456')).toBe(true);
      expect(isValidNumber('0.5')).toBe(true);
    });

    test('accepts numbers with leading + sign', () => {
      expect(isValidNumber('+123')).toBe(true);
      expect(isValidNumber('+123.456')).toBe(true);
    });

    test('accepts numbers with trailing decimal point', () => {
      expect(isValidNumber('123.')).toBe(true);
    });

    test('rejects non-numeric strings', () => {
      expect(isValidNumber('abc')).toBe(false);
      expect(isValidNumber('12.34.56')).toBe(false);
      expect(isValidNumber('12a')).toBe(false);
    });

    test('rejects empty strings', () => {
      expect(isValidNumber('')).toBe(false);
    });

    test('rejects strings with spaces', () => {
      expect(isValidNumber('12 34')).toBe(false);
      expect(isValidNumber(' 123')).toBe(false);
    });

    test('rejects special characters', () => {
      expect(isValidNumber('$123')).toBe(false);
      expect(isValidNumber('123%')).toBe(false);
    });
  });

  describe('formatDate', () => {
    const testDate = new Date('2024-01-15T14:30:45Z');

    test('formats date in specified timezone', () => {
      const formatted = formatDate(testDate, 'America/New_York');
      expect(formatted).toMatch(/^\d{2}:\d{2}:\d{2}$/); // HH:mm:ss
    });

    test('formats date in UTC', () => {
      const formatted = formatDate(testDate, 'UTC');
      expect(formatted).toBe('14:30:45');
    });

    test('formats date in different timezones', () => {
      const utc = formatDate(testDate, 'UTC');
      const tokyo = formatDate(testDate, 'Asia/Tokyo');
      const la = formatDate(testDate, 'America/Los_Angeles');
      
      // All should have HH:mm:ss format
      expect(utc).toMatch(/^\d{2}:\d{2}:\d{2}$/);
      expect(tokyo).toMatch(/^\d{2}:\d{2}:\d{2}$/);
      expect(la).toMatch(/^\d{2}:\d{2}:\d{2}$/);
      
      // They should be different times
      expect(utc).not.toBe(tokyo);
    });

    test('handles midnight correctly', () => {
      const midnight = new Date('2024-01-15T00:00:00Z');
      const formatted = formatDate(midnight, 'UTC');
      expect(formatted).toBe('00:00:00');
    });

    test('handles noon correctly', () => {
      const noon = new Date('2024-01-15T12:00:00Z');
      const formatted = formatDate(noon, 'UTC');
      expect(formatted).toBe('12:00:00');
    });
  });

  describe('formatDateTime', () => {
    const testDate = new Date('2024-01-15T14:30:45Z');

    test('formats datetime with date and time', () => {
      const formatted = formatDateTime(testDate, 'UTC');
      expect(formatted).toBe('2024-01-15 14:30:45');
    });

    test('formats datetime in different timezones', () => {
      const utc = formatDateTime(testDate, 'UTC');
      const ny = formatDateTime(testDate, 'America/New_York');
      
      expect(utc).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
      expect(ny).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
    });

    test('handles year boundaries', () => {
      const newYear = new Date('2024-01-01T00:00:00Z');
      const formatted = formatDateTime(newYear, 'UTC');
      expect(formatted).toBe('2024-01-01 00:00:00');
    });
  });

  describe('formatISODate', () => {
    test('formats date in ISO format', () => {
      const testDate = new Date('2024-01-15T14:30:45Z');
      const formatted = formatISODate(testDate, 'UTC');
      expect(formatted).toBe('2024-01-15');
    });

    test('formats date in different timezones', () => {
      // Date near timezone boundary
      const testDate = new Date('2024-01-15T23:00:00Z');
      const utc = formatISODate(testDate, 'UTC');
      const tokyo = formatISODate(testDate, 'Asia/Tokyo');
      
      expect(utc).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(tokyo).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      
      // Tokyo should be next day
      expect(tokyo).toBe('2024-01-16');
    });

    test('handles leap year dates', () => {
      const leapDay = new Date('2024-02-29T12:00:00Z');
      const formatted = formatISODate(leapDay, 'UTC');
      expect(formatted).toBe('2024-02-29');
    });

    test('pads single digit months and days', () => {
      const testDate = new Date('2024-03-05T12:00:00Z');
      const formatted = formatISODate(testDate, 'UTC');
      expect(formatted).toBe('2024-03-05');
    });
  });

  describe('formatDateSafe', () => {
    const testDate = new Date('2024-01-15T14:30:45Z');

    test('formats valid date', () => {
      const formatted = formatDateSafe(testDate, 'UTC');
      expect(formatted).toBe('14:30:45');
    });

    test('returns fallback for null date', () => {
      const formatted = formatDateSafe(null, 'UTC');
      expect(formatted).toBe('N/A');
    });

    test('uses custom fallback', () => {
      const formatted = formatDateSafe(null, 'UTC', '---');
      expect(formatted).toBe('---');
    });

    test('formats valid date even with custom fallback', () => {
      const formatted = formatDateSafe(testDate, 'UTC', 'MISSING');
      expect(formatted).toBe('14:30:45');
      expect(formatted).not.toBe('MISSING');
    });

    test('handles different timezones', () => {
      const formatted = formatDateSafe(testDate, 'America/New_York');
      expect(formatted).toMatch(/^\d{2}:\d{2}:\d{2}$/);
    });
  });

  describe('formatNumber', () => {
    test('formats number with default decimals', () => {
      expect(formatNumber(123.456)).toBe('123.46');
      expect(formatNumber(123.4)).toBe('123.40');
    });

    test('formats number with specified decimals', () => {
      expect(formatNumber(123.456789, 4)).toBe('123.4568');
      expect(formatNumber(123.456789, 0)).toBe('123');
      expect(formatNumber(123.456789, 1)).toBe('123.5');
    });

    test('returns fallback for null', () => {
      expect(formatNumber(null)).toBe('N/A');
      expect(formatNumber(null, 2, '---')).toBe('---');
    });

    test('returns fallback for undefined', () => {
      expect(formatNumber(undefined)).toBe('N/A');
      expect(formatNumber(undefined, 2, 'NONE')).toBe('NONE');
    });

    test('formats zero correctly', () => {
      expect(formatNumber(0)).toBe('0.00');
      expect(formatNumber(0, 4)).toBe('0.0000');
    });

    test('formats negative numbers', () => {
      expect(formatNumber(-123.456)).toBe('-123.46');
      expect(formatNumber(-0.5, 1)).toBe('-0.5');
    });

    test('handles very small numbers', () => {
      expect(formatNumber(0.001, 3)).toBe('0.001');
      expect(formatNumber(0.001, 2)).toBe('0.00');
    });

    test('handles very large numbers', () => {
      expect(formatNumber(123456789.12, 2)).toBe('123456789.12');
    });

    test('rounds correctly', () => {
      expect(formatNumber(1.235, 2)).toBe('1.24'); // Rounds up
      expect(formatNumber(1.234, 2)).toBe('1.23'); // Rounds down
    });
  });
});
