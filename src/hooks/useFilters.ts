import { useState, useEffect, useMemo } from 'react';
import { getAvailableWindowTypes, filterDarkTimesData } from '@/utils/filterUtils';
import type { DarkTimesData, DarkTimeWindow, TimeRangeFilter } from '@/types';

interface UseFiltersOptions {
  darkTimesData: DarkTimesData | null;
  timezone: string;
}

interface FilterState {
  minDurationInput: string;
  minDurationHours: number | undefined;
  availableTypes: Set<DarkTimeWindow['type']>;
  selectedTypes: Set<DarkTimeWindow['type']>;
  hideEmptyDays: boolean;
  timeRangeFilter: TimeRangeFilter;
}

interface FilterHandlers {
  onMinDurationChange: (value: string) => void;
  onTypeToggle: (type: DarkTimeWindow['type']) => void;
  onHideEmptyDaysChange: (checked: boolean) => void;
  onTimeRangeChange: (filter: TimeRangeFilter) => void;
  onClearFilters: () => void;
}

export interface UseFiltersReturn extends FilterState, FilterHandlers {
  filteredData: DarkTimesData;
}

/**
 * Custom hook to manage all filter state and logic for dark times data
 * Eliminates prop drilling by encapsulating filter state management
 */
export function useFilters({ darkTimesData, timezone }: UseFiltersOptions): UseFiltersReturn {
  // Filter state
  const [minDurationInput, setMinDurationInput] = useState<string>('');
  const [minDurationHours, setMinDurationHours] = useState<number | undefined>(undefined);
  const [availableTypes, setAvailableTypes] = useState<Set<DarkTimeWindow['type']>>(new Set());
  const [selectedTypes, setSelectedTypes] = useState<Set<DarkTimeWindow['type']>>(new Set());
  const [hideEmptyDays, setHideEmptyDays] = useState<boolean>(false);
  const [timeRangeFilter, setTimeRangeFilter] = useState<TimeRangeFilter>({
    startTime: '21:00', // 9:00 PM
    endTime: '22:00',   // 10:00 PM
    enabled: false,
  });

  // Detect available window types when data changes
  useEffect(() => {
    if (darkTimesData && Object.keys(darkTimesData).length > 0) {
      const types = getAvailableWindowTypes(darkTimesData);
      setAvailableTypes(types);
      // Initialize selected types to all available types
      setSelectedTypes(types);
    } else {
      setAvailableTypes(new Set());
      setSelectedTypes(new Set());
    }
  }, [darkTimesData]);

  // Filter handlers
  const handleMinDurationChange = (value: string) => {
    setMinDurationInput(value);
    
    if (!value || value.trim() === '') {
      setMinDurationHours(undefined);
    } else {
      const parsed = parseFloat(value);
      if (!isNaN(parsed) && parsed >= 0) {
        setMinDurationHours(parsed);
      } else {
        setMinDurationHours(undefined);
      }
    }
  };

  const handleTypeToggle = (type: DarkTimeWindow['type']) => {
    setSelectedTypes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(type)) {
        newSet.delete(type);
      } else {
        newSet.add(type);
      }
      return newSet;
    });
  };

  const handleClearFilters = () => {
    setMinDurationInput('');
    setMinDurationHours(undefined);
    // Reset to all available types (dynamic, not hardcoded)
    setSelectedTypes(new Set(availableTypes));
    setHideEmptyDays(false);
    setTimeRangeFilter({
      startTime: '21:00',
      endTime: '22:00',
      enabled: false,
    });
  };

  // Apply filters to create filtered dataset
  const filteredData = useMemo(() => {
    if (!darkTimesData) return {};
    
    return filterDarkTimesData(darkTimesData, {
      minDurationHours,
      selectedTypes,
      hideEmptyDays,
      timeRange: timeRangeFilter,
      timezone,
    });
  }, [darkTimesData, minDurationHours, selectedTypes, hideEmptyDays, timeRangeFilter, timezone]);

  return {
    // State
    minDurationInput,
    minDurationHours,
    availableTypes,
    selectedTypes,
    hideEmptyDays,
    timeRangeFilter,
    
    // Handlers
    onMinDurationChange: handleMinDurationChange,
    onTypeToggle: handleTypeToggle,
    onHideEmptyDaysChange: setHideEmptyDays,
    onTimeRangeChange: setTimeRangeFilter,
    onClearFilters: handleClearFilters,
    
    // Filtered data
    filteredData,
  };
}
