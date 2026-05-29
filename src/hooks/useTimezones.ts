import { useState, useEffect } from 'react';
import { filterTimezones } from '@/utils/timezones';

interface UseTimezonesReturn {
  allTimezones: string[];
  filteredTimezones: string[];
  filterText: string;
  setFilterText: (text: string) => void;
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
  const [filterText, setFilterText] = useState<string>('');

  // Filter timezones when filter text changes
  useEffect(() => {
    const filtered = filterTimezones(filterText);
    setFilteredTimezones(filtered);
  }, [filterText]);

  return {
    allTimezones,
    filteredTimezones,
    filterText,
    setFilterText,
  };
}
