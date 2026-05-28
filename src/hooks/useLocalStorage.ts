import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for syncing state with localStorage
 * @param key - localStorage key
 * @param initialValue - default value if key doesn't exist
 * @returns [value, setValue, removeValue]
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void, () => void] {
  // Get initial value from localStorage or use provided initial value
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      // Check if localStorage is available
      if (typeof window === 'undefined' || !window.localStorage) {
        console.warn('localStorage is not available');
        return initialValue;
      }

      const item = window.localStorage.getItem(key);
      
      if (!item) {
        return initialValue;
      }

      // Try to parse the JSON
      try {
        return JSON.parse(item);
      } catch (parseError) {
        // If JSON is corrupted, log warning and remove the corrupted data
        console.warn(`Corrupted data in localStorage key "${key}", resetting to default`);
        window.localStorage.removeItem(key);
        return initialValue;
      }
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Update localStorage when state changes
  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        // Check if localStorage is available
        if (typeof window === 'undefined' || !window.localStorage) {
          console.warn('localStorage is not available');
          return;
        }

        // Allow value to be a function (like useState)
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        
        // Try to serialize and store
        try {
          const serialized = JSON.stringify(valueToStore);
          
          // Check serialized size (warn if > 1MB, reject if > 5MB)
          const sizeInBytes = new Blob([serialized]).size;
          const sizeInMB = sizeInBytes / (1024 * 1024);
          
          if (sizeInMB > 5) {
            console.error(`Data too large for localStorage (${sizeInMB.toFixed(2)}MB). Maximum 5MB.`);
            throw new Error('Data too large to store');
          } else if (sizeInMB > 1) {
            console.warn(`Large data stored in localStorage (${sizeInMB.toFixed(2)}MB). Consider reducing data size.`);
          }
          
          window.localStorage.setItem(key, serialized);
        } catch (serializeError) {
          // Check for quota exceeded
          if (serializeError instanceof Error && serializeError.name === 'QuotaExceededError') {
            console.error(`localStorage quota exceeded for key "${key}"`);
            throw new Error('Storage quota exceeded. Please clear some data.');
          }
          console.error(`Error serializing value for key "${key}":`, serializeError);
          throw new Error('Failed to save data: value cannot be serialized');
        }
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  // Remove value from localStorage
  const removeValue = useCallback(() => {
    try {
      // Check if localStorage is available
      if (typeof window === 'undefined' || !window.localStorage) {
        console.warn('localStorage is not available');
        setStoredValue(initialValue);
        return;
      }

      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  // Listen for changes to localStorage from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          setStoredValue(parsed);
        } catch (error) {
          console.warn(`Error parsing storage event for key "${key}":`, error);
          // If corrupted, remove it
          try {
            window.localStorage.removeItem(key);
          } catch {
            // Ignore cleanup errors
          }
        }
      } else if (e.key === key && e.newValue === null) {
        // Key was removed in another tab
        setStoredValue(initialValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}

