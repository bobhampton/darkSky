/**
 * Unit tests for shareable result links
 * Run with: npm test
 */

import { describe, test, expect } from 'vitest';
import { buildShareUrl, parseShareParams } from '../utils/shareLink';
import type { ObserverFormData } from '../types';

const BASE_URL = 'https://darkskycalculator.com/';

const formData: ObserverFormData = {
  latitude: '40.760779123',
  longitude: '-111.891047',
  elevation: '1288',
  dateStart: '2026-10-20',
  dateEnd: '2026-10-27',
  timezone: 'America/Denver',
  address: 'Salt Lake City, Utah, United States',
};

describe('buildShareUrl', () => {
  test('encodes the calculation inputs as query parameters', () => {
    const url = new URL(buildShareUrl(formData, BASE_URL));

    expect(url.origin + url.pathname).toBe(BASE_URL);
    expect(Object.fromEntries(url.searchParams)).toEqual({
      lat: '40.76078',
      lon: '-111.89105',
      elev: '1288',
      tz: 'America/Denver',
      start: '2026-10-20',
      end: '2026-10-27',
      name: 'Salt Lake City, Utah, United States',
    });
  });

  test('omits sea-level elevation and an empty location name', () => {
    const url = new URL(buildShareUrl({ ...formData, elevation: '0', address: '' }, BASE_URL));

    expect(url.searchParams.has('elev')).toBe(false);
    expect(url.searchParams.has('name')).toBe(false);
  });

  test('round-trips through parseShareParams', () => {
    const url = new URL(buildShareUrl(formData, BASE_URL));

    expect(parseShareParams(url.search)).toEqual({
      ...formData,
      latitude: '40.76078',
      longitude: '-111.89105',
    });
  });
});

describe('parseShareParams', () => {
  test('returns null without valid coordinates', () => {
    expect(parseShareParams('')).toBeNull();
    expect(parseShareParams('?utm_source=newsletter')).toBeNull();
    expect(parseShareParams('?lat=40.7')).toBeNull();
    expect(parseShareParams('?lat=91&lon=0')).toBeNull();
    expect(parseShareParams('?lat=abc&lon=10')).toBeNull();
  });

  test('accepts coordinates alone so callers can fill in defaults', () => {
    expect(parseShareParams('?lat=40.7&lon=-111.9')).toEqual({ latitude: '40.7', longitude: '-111.9' });
  });

  test('drops invalid optional values', () => {
    const parsed = parseShareParams('?lat=40.7&lon=-111.9&elev=high&tz=Mars/Olympus&start=tomorrow&end=2026-10-27');

    expect(parsed).toEqual({ latitude: '40.7', longitude: '-111.9' });
  });

  test('requires both dates', () => {
    expect(parseShareParams('?lat=40.7&lon=-111.9&start=2026-10-20')).not.toHaveProperty('dateStart');
  });

  test('limits the location name length', () => {
    const parsed = parseShareParams(`?lat=40.7&lon=-111.9&name=${'x'.repeat(500)}`);

    expect(parsed?.address).toHaveLength(200);
  });
});
