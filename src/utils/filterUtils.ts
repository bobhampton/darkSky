import type { DarkTimesData, DarkTimeWindow, TimeRangeFilter } from '@/types';
import { extractTimeFromDate } from './dateUtils';

/**
 * Filter to get only actual dark windows (exclude metaOnly entries)
 */
export function getActualDarkWindows(windows: DarkTimeWindow[]): DarkTimeWindow[] {
  return windows.filter(w => w.type !== 'metaOnly');
}

/**
 * Scan dark times data and return all unique window types that are present
 * Excludes 'metaOnly' since it's metadata, not a filterable window type
 */
export function getAvailableWindowTypes(darkTimesData: DarkTimesData): Set<DarkTimeWindow['type']> {
  const types = new Set<DarkTimeWindow['type']>();
  
  for (const date in darkTimesData) {
    const windows = darkTimesData[date];
    for (const window of windows) {
      if (window.type !== 'metaOnly') {
        types.add(window.type);
      }
    }
  }
  
  return types;
}

/**
 * Calculate duration in hours (numeric value)
 */
export function calculateDurationHours(start: Date, end: Date): number {
  const diffMs = end.getTime() - start.getTime();
  return diffMs / (1000 * 60 * 60);
}

/**
 * Filter windows by minimum duration
 */
export function filterWindowsByDuration(
  windows: DarkTimeWindow[],
  minHours: number | undefined
): DarkTimeWindow[] {
  if (!minHours || minHours <= 0) return windows;
  
  return windows.filter(window => 
    calculateDurationHours(window.start, window.end) >= minHours
  );
}

/**
 * Filter windows by selected types
 * Returns empty array if no types are selected
 */
export function filterWindowsByType(
  windows: DarkTimeWindow[],
  selectedTypes: Set<DarkTimeWindow['type']>
): DarkTimeWindow[] {
  return windows.filter(window => selectedTypes.has(window.type));
}

/**
 * Check if a time range crosses midnight (e.g., 23:00-02:00)
 */
function isOvernightRange(startTime: string, endTime: string): boolean {
  return startTime > endTime;
}

/**
 * Check if a window overlaps with the desired time range
 * Handles overnight ranges (e.g., 23:00-02:00) and windows that cross midnight
 * @param window - Dark time window to check
 * @param timeRange - Time range filter to check against
 * @param timezone - IANA timezone for conversion
 * @returns true if window overlaps with time range
 */
export function windowOverlapsTimeRange(
  window: DarkTimeWindow,
  timeRange: TimeRangeFilter,
  timezone: string
): boolean {
  // Extract time components from window in the specified timezone
  const windowStartTime = extractTimeFromDate(window.start, timezone);
  const windowEndTime = extractTimeFromDate(window.end, timezone);
  
  const filterStart = timeRange.startTime;
  const filterEnd = timeRange.endTime;
  
  const isFilterOvernight = isOvernightRange(filterStart, filterEnd);
  const isWindowOvernight = isOvernightRange(windowStartTime, windowEndTime);
  
  // Case 1: Neither filter nor window crosses midnight
  if (!isFilterOvernight && !isWindowOvernight) {
    // Simple overlap check: window.start < filter.end AND window.end > filter.start
    return windowStartTime < filterEnd && windowEndTime > filterStart;
  }
  
  // Case 2: Filter crosses midnight (e.g., 23:00-02:00)
  if (isFilterOvernight && !isWindowOvernight) {
    // Window overlaps if it's in the late night (>= filterStart) OR early morning (< filterEnd)
    return windowStartTime >= filterStart || windowEndTime <= filterEnd || 
           (windowStartTime < filterEnd && windowEndTime > filterStart);
  }
  
  // Case 3: Window crosses midnight (e.g., dark window from 22:00 to 01:00)
  if (!isFilterOvernight && isWindowOvernight) {
    // Check if filter range intersects with either part of the window
    // Part 1: windowStart to midnight (23:59)
    // Part 2: midnight (00:00) to windowEnd
    return windowStartTime < filterEnd || windowEndTime > filterStart ||
           (windowStartTime >= filterStart && windowStartTime < "23:59") ||
           (windowEndTime > "00:00" && windowEndTime <= filterEnd);
  }
  
  // Case 4: Both cross midnight
  // Both ranges span across midnight, so they will always overlap
  return true;
}

/**
 * Filter windows by time range
 * @param windows - Array of dark time windows
 * @param timeRange - Time range filter (undefined or disabled means no filtering)
 * @param timezone - IANA timezone for time comparison
 * @returns Filtered array of windows
 */
export function filterWindowsByTimeRange(
  windows: DarkTimeWindow[],
  timeRange: TimeRangeFilter | undefined,
  timezone: string
): DarkTimeWindow[] {
  // If no time range filter or disabled, return all windows
  if (!timeRange || !timeRange.enabled) {
    return windows;
  }
  
  return windows.filter(window => 
    windowOverlapsTimeRange(window, timeRange, timezone)
  );
}

/**
 * Filter complete dark times data based on all filter criteria
 * Returns a new DarkTimesData object with filtered dates and windows
 */
export function filterDarkTimesData(
  darkTimesData: DarkTimesData,
  filters: {
    minDurationHours: number | undefined;
    selectedTypes: Set<DarkTimeWindow['type']>;
    hideEmptyDays: boolean;
    timeRange?: TimeRangeFilter;
    timezone?: string;
  }
): DarkTimesData {
  const filtered: DarkTimesData = {};
  const dates = Object.keys(darkTimesData).sort();

  for (const date of dates) {
    const allWindows = darkTimesData[date];
    
    // Apply filters in sequence: type → duration → time range
    const actualWindows = getActualDarkWindows(allWindows);
    const typeFilteredWindows = filterWindowsByType(actualWindows, filters.selectedTypes);
    const durationFilteredWindows = filterWindowsByDuration(typeFilteredWindows, filters.minDurationHours);
    const timeRangeFilteredWindows = filters.timezone 
      ? filterWindowsByTimeRange(durationFilteredWindows, filters.timeRange, filters.timezone)
      : durationFilteredWindows;
    
    // If hideEmptyDays is true, skip dates with no matching windows
    if (filters.hideEmptyDays && timeRangeFilteredWindows.length === 0) {
      continue;
    }
    
    // Always include metaOnly entries in the output for metadata preservation
    const metaOnlyWindows = allWindows.filter(w => w.type === 'metaOnly');
    filtered[date] = [...timeRangeFilteredWindows, ...metaOnlyWindows];
  }

  return filtered;
}
