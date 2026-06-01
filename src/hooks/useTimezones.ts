import { useState, useMemo } from 'react';
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

  const [filterText, setFilterText] = useState<string>('');

  // Filter timezones when filter text changes - use useMemo for derived state
  const filteredTimezones = useMemo(() => {
    return filterTimezones(filterText);
  }, [filterText]);

  return {
    allTimezones,
    filteredTimezones,
    filterText,
    setFilterText,
  };
}
