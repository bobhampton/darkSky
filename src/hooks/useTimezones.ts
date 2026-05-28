import { useState, useEffect, useCallback } from 'react';
import { filterTimezones, getDefaultTimezone, saveDefaultTimezone } from '@/utils/timezones';

interface UseTimezonesReturn {
  allTimezones: string[];
  filteredTimezones: string[];
  defaultTimezone: string;
  filterText: string;
  setFilterText: (text: string) => void;
  setDefaultTimezone: (timezone: string) => void;
}

/**
 * Custom hook for managing timezone selection and filtering
 * @returns Timezone state and handlers
 */
export function useTimezones(): UseTimezonesReturn {
  const [allTimezones] = useState<string[]>(() => {
    // Get all IANA timezone names
    return Intl.supportedValuesOf('timeZone');
  });

  const [filteredTimezones, setFilteredTimezones] = useState<string[]>(allTimezones);
  const [defaultTimezone, setDefaultTimezoneState] = useState<string>(() => 
    getDefaultTimezone()
  );
  const [filterText, setFilterText] = useState<string>('');

  // Filter timezones when filter text changes
  useEffect(() => {
    const filtered = filterTimezones(filterText);
    setFilteredTimezones(filtered);
  }, [filterText]);

  // Save default timezone to localStorage
  const setDefaultTimezone = useCallback((timezone: string) => {
    setDefaultTimezoneState(timezone);
    saveDefaultTimezone(timezone);
  }, []);

  return {
    allTimezones,
    filteredTimezones,
    defaultTimezone,
    filterText,
    setFilterText,
    setDefaultTimezone,
  };
}
