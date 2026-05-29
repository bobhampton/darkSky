import { describe, test, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTimezones } from '../useTimezones';

describe('useTimezones', () => {
  test('returns all available timezones', () => {
    const { result } = renderHook(() => useTimezones());

    expect(result.current.allTimezones.length).toBeGreaterThan(0);
    expect(result.current.allTimezones).toContain('America/New_York');
    expect(result.current.allTimezones).toContain('Europe/London');
    expect(result.current.allTimezones).toContain('Asia/Tokyo');
  });

  test('initially shows all timezones in filtered list', () => {
    const { result } = renderHook(() => useTimezones());

    expect(result.current.filteredTimezones.length).toBe(result.current.allTimezones.length);
  });

  test('filters timezones based on filter text', () => {
    const { result } = renderHook(() => useTimezones());

    act(() => {
      result.current.setFilterText('America');
    });

    expect(result.current.filteredTimezones.every((tz) => 
      tz.toLowerCase().includes('america')
    )).toBe(true);
  });

  test('includes major timezone regions', () => {
    const { result } = renderHook(() => useTimezones());

    const timezones = result.current.allTimezones;
    
    // Check for major regions
    expect(timezones.some((tz) => tz.startsWith('America/'))).toBe(true);
    expect(timezones.some((tz) => tz.startsWith('Europe/'))).toBe(true);
    expect(timezones.some((tz) => tz.startsWith('Asia/'))).toBe(true);
    expect(timezones.some((tz) => tz.startsWith('Pacific/'))).toBe(true);
  });
});
