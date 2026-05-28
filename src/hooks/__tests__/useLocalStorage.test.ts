import { describe, test, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from '../useLocalStorage';

describe('useLocalStorage', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    vi.clearAllMocks();
  });

  test('returns default value when key does not exist', () => {
    const { result } = renderHook(() =>
      useLocalStorage('test-key', 'default-value')
    );

    expect(result.current[0]).toBe('default-value');
  });

  test('reads existing value from localStorage', () => {
    localStorage.setItem('test-key', JSON.stringify('stored-value'));

    const { result } = renderHook(() =>
      useLocalStorage('test-key', 'default-value')
    );

    expect(result.current[0]).toBe('stored-value');
  });

  test('updates localStorage when value is set', () => {
    const { result } = renderHook(() =>
      useLocalStorage('test-key', 'initial')
    );

    act(() => {
      result.current[1]('updated');
    });

    expect(result.current[0]).toBe('updated');
    expect(localStorage.getItem('test-key')).toBe(JSON.stringify('updated'));
  });

  test('handles function updater', () => {
    const { result } = renderHook(() =>
      useLocalStorage('counter', 0)
    );

    act(() => {
      result.current[1]((prev) => prev + 1);
    });

    expect(result.current[0]).toBe(1);
    expect(localStorage.getItem('counter')).toBe('1');
  });

  test('resets to default value with reset function', () => {
    const { result } = renderHook(() =>
      useLocalStorage('test-key', 'default')
    );

    // Update value first
    act(() => {
      result.current[1]('updated');
    });

    expect(result.current[0]).toBe('updated');
    expect(localStorage.getItem('test-key')).toBe(JSON.stringify('updated'));

    // Reset to default (removes from localStorage)
    act(() => {
      result.current[2](); // removeValue function
    });

    // After reset, should be back to default
    expect(result.current[0]).toBe('default');
    
    // Verify it's removed from localStorage
    expect(localStorage.getItem('test-key')).toBeNull();
  });

  test('handles corrupted JSON gracefully', () => {
    localStorage.setItem('test-key', 'invalid-json{{{');

    const { result } = renderHook(() =>
      useLocalStorage('test-key', 'default-fallback')
    );

    // Should fall back to default value
    expect(result.current[0]).toBe('default-fallback');
  });

  test('works with complex objects', () => {
    const complexObject = {
      name: 'Test',
      nested: { value: 42 },
      array: [1, 2, 3],
    };

    const { result } = renderHook(() =>
      useLocalStorage('complex-key', complexObject)
    );

    expect(result.current[0]).toEqual(complexObject);

    const updatedObject = { ...complexObject, name: 'Updated' };

    act(() => {
      result.current[1](updatedObject);
    });

    expect(result.current[0]).toEqual(updatedObject);
    expect(JSON.parse(localStorage.getItem('complex-key')!)).toEqual(updatedObject);
  });

  test('handles null value', () => {
    const { result } = renderHook(() =>
      useLocalStorage<string | null>('nullable-key', null)
    );

    expect(result.current[0]).toBe(null);

    act(() => {
      result.current[1]('not-null');
    });

    expect(result.current[0]).toBe('not-null');

    act(() => {
      result.current[1](null);
    });

    expect(result.current[0]).toBe(null);
  });
});
