import { describe, test, expect, vi, beforeEach } from 'vitest';
import { saveDefaultTimezone, getDefaultTimezone, removeDefaultTimezone } from '../../utils/timezones';

describe('timezones localStorage validation', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('saveDefaultTimezone rejects invalid timezone', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    
    saveDefaultTimezone('Invalid/Timezone');
    
    expect(localStorage.getItem('DefaultTimeZone')).toBeNull();
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Cannot save invalid timezone')
    );
    
    consoleSpy.mockRestore();
  });

  test('saveDefaultTimezone accepts valid timezone', () => {
    saveDefaultTimezone('America/New_York');
    
    expect(localStorage.getItem('DefaultTimeZone')).toBe('America/New_York');
  });

  test('getDefaultTimezone returns UTC for invalid stored timezone', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    
    // Directly set invalid timezone (bypassing validation)
    localStorage.setItem('DefaultTimeZone', 'Invalid/Timezone');
    
    const result = getDefaultTimezone();
    
    expect(result).toBe('UTC');
    expect(localStorage.getItem('DefaultTimeZone')).toBeNull(); // Should be cleared
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Invalid timezone')
    );
    
    consoleSpy.mockRestore();
  });

  test('getDefaultTimezone returns valid stored timezone', () => {
    localStorage.setItem('DefaultTimeZone', 'Europe/London');
    
    const result = getDefaultTimezone();
    
    expect(result).toBe('Europe/London');
  });

  test('getDefaultTimezone returns UTC when no timezone stored', () => {
    const result = getDefaultTimezone();
    
    expect(result).toBe('UTC');
  });

  test('saveDefaultTimezone handles quota exceeded error', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    // Mock localStorage to throw QuotaExceededError
    const originalSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = vi.fn(() => {
      const error = new Error('Quota exceeded');
      error.name = 'QuotaExceededError';
      throw error;
    });
    
    saveDefaultTimezone('America/New_York');
    
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('localStorage quota exceeded')
    );
    
    // Restore original method
    Storage.prototype.setItem = originalSetItem;
    consoleSpy.mockRestore();
  });

  test('removeDefaultTimezone clears stored timezone', () => {
    localStorage.setItem('DefaultTimeZone', 'America/Chicago');
    
    removeDefaultTimezone();
    
    expect(localStorage.getItem('DefaultTimeZone')).toBeNull();
  });
});
