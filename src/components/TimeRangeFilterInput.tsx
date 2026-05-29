import { useState, useEffect } from 'react';
import { Tooltip } from './Tooltip';
import { convert24To12Hour, convert12To24Hour } from '@/utils/dateUtils';
import { validateTimeRange } from '@/utils/validation';
import type { TimeRangeFilter } from '@/types';

interface TimeRangeFilterInputProps {
  value: TimeRangeFilter;
  onChange: (value: TimeRangeFilter) => void;
}

/**
 * Component for filtering dark time windows by time of day
 * Allows users to specify a time range in 12-hour format with AM/PM
 */
export function TimeRangeFilterInput({ value, onChange }: TimeRangeFilterInputProps) {
  // Convert 24-hour stored values to 12-hour format for display
  const startTime12 = convert24To12Hour(value.startTime);
  const endTime12 = convert24To12Hour(value.endTime);

  const [startHours, setStartHours] = useState(startTime12.hours);
  const [startMinutes, setStartMinutes] = useState(startTime12.minutes);
  const [startPeriod, setStartPeriod] = useState<'AM' | 'PM'>(startTime12.period);

  const [endHours, setEndHours] = useState(endTime12.hours);
  const [endMinutes, setEndMinutes] = useState(endTime12.minutes);
  const [endPeriod, setEndPeriod] = useState<'AM' | 'PM'>(endTime12.period);

  const [validationError, setValidationError] = useState<string | null>(null);

  // Sync local state when parent value changes
  useEffect(() => {
    const start12 = convert24To12Hour(value.startTime);
    const end12 = convert24To12Hour(value.endTime);
    
    setStartHours(start12.hours);
    setStartMinutes(start12.minutes);
    setStartPeriod(start12.period);
    
    setEndHours(end12.hours);
    setEndMinutes(end12.minutes);
    setEndPeriod(end12.period);
  }, [value.startTime, value.endTime]);

  // Update parent when time values change
  useEffect(() => {
    const newStartTime = convert12To24Hour(startHours, startMinutes, startPeriod);
    const newEndTime = convert12To24Hour(endHours, endMinutes, endPeriod);
    
    const newValue: TimeRangeFilter = {
      startTime: newStartTime,
      endTime: newEndTime,
      enabled: value.enabled,
    };

    // Validate the new time range
    const error = validateTimeRange(newValue);
    setValidationError(error);

    // Only update parent if different and valid when enabled
    if (newStartTime !== value.startTime || newEndTime !== value.endTime) {
      onChange(newValue);
    }
  }, [startHours, startMinutes, startPeriod, endHours, endMinutes, endPeriod, value.enabled]);

  const handleEnabledChange = (checked: boolean) => {
    onChange({ ...value, enabled: checked });
    if (!checked) {
      setValidationError(null);
    }
  };

  // Generate hour options (1-12)
  const hourOptions = Array.from({ length: 12 }, (_, i) => i + 1);
  
  // Generate minute options (00, 15, 30, 45)
  const minuteOptions = [0, 15, 30, 45];

  return (
    <div className="space-y-2">
      {/* Enable checkbox */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="timeRangeEnabled"
          checked={value.enabled}
          onChange={(e) => handleEnabledChange(e.target.checked)}
          className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500 focus:ring-2"
        />
        <label htmlFor="timeRangeEnabled" className="text-sm font-medium text-gray-300">
          Filter by Time Range
        </label>
        <Tooltip text="Filter windows to only show those overlapping with your desired time range. Overnight ranges are supported (e.g., 11:00 PM - 1:00 AM)." />
      </div>

      {/* Time inputs - Compact layout */}
      <div className={`pl-6 ${!value.enabled ? 'opacity-50' : ''}`}>
        {/* Single row with Start and End times on desktop, stacked on mobile */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
          {/* Start Time */}
          <div className="flex items-center gap-1.5">
            <label className="text-xs text-gray-400 w-10 flex-shrink-0">Start:</label>
            <select
              value={startHours}
              onChange={(e) => setStartHours(parseInt(e.target.value))}
              disabled={!value.enabled}
              className="bg-gray-700 border border-gray-600 text-white text-xs rounded px-1.5 py-1 focus:ring-purple-500 focus:border-purple-500 disabled:opacity-50 disabled:cursor-not-allowed w-12"
            >
              {hourOptions.map(hour => (
                <option key={hour} value={hour}>{hour}</option>
              ))}
            </select>
            <span className="text-gray-400 text-xs">:</span>
            <select
              value={startMinutes}
              onChange={(e) => setStartMinutes(parseInt(e.target.value))}
              disabled={!value.enabled}
              className="bg-gray-700 border border-gray-600 text-white text-xs rounded px-1.5 py-1 focus:ring-purple-500 focus:border-purple-500 disabled:opacity-50 disabled:cursor-not-allowed w-12"
            >
              {minuteOptions.map(min => (
                <option key={min} value={min}>{min.toString().padStart(2, '0')}</option>
              ))}
            </select>
            <div className="flex gap-0.5">
              <button
                type="button"
                onClick={() => setStartPeriod('AM')}
                disabled={!value.enabled}
                className={`px-1.5 py-0.5 text-xs rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  startPeriod === 'AM'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                AM
              </button>
              <button
                type="button"
                onClick={() => setStartPeriod('PM')}
                disabled={!value.enabled}
                className={`px-1.5 py-0.5 text-xs rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  startPeriod === 'PM'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                PM
              </button>
            </div>
          </div>

          {/* Separator */}
          <span className="hidden sm:inline text-gray-500 text-xs">→</span>

          {/* End Time */}
          <div className="flex items-center gap-1.5">
            <label className="text-xs text-gray-400 w-10 flex-shrink-0">End:</label>
            <select
              value={endHours}
              onChange={(e) => setEndHours(parseInt(e.target.value))}
              disabled={!value.enabled}
              className="bg-gray-700 border border-gray-600 text-white text-xs rounded px-1.5 py-1 focus:ring-purple-500 focus:border-purple-500 disabled:opacity-50 disabled:cursor-not-allowed w-12"
            >
              {hourOptions.map(hour => (
                <option key={hour} value={hour}>{hour}</option>
              ))}
            </select>
            <span className="text-gray-400 text-xs">:</span>
            <select
              value={endMinutes}
              onChange={(e) => setEndMinutes(parseInt(e.target.value))}
              disabled={!value.enabled}
              className="bg-gray-700 border border-gray-600 text-white text-xs rounded px-1.5 py-1 focus:ring-purple-500 focus:border-purple-500 disabled:opacity-50 disabled:cursor-not-allowed w-12"
            >
              {minuteOptions.map(min => (
                <option key={min} value={min}>{min.toString().padStart(2, '0')}</option>
              ))}
            </select>
            <div className="flex gap-0.5">
              <button
                type="button"
                onClick={() => setEndPeriod('AM')}
                disabled={!value.enabled}
                className={`px-1.5 py-0.5 text-xs rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  endPeriod === 'AM'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                AM
              </button>
              <button
                type="button"
                onClick={() => setEndPeriod('PM')}
                disabled={!value.enabled}
                className={`px-1.5 py-0.5 text-xs rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  endPeriod === 'PM'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                PM
              </button>
            </div>
          </div>
        </div>

        {/* Validation error */}
        {validationError && value.enabled && (
          <div className="text-xs text-red-400 bg-red-900/20 border border-red-800 rounded px-2 py-1">
            {validationError}
          </div>
        )}
      </div>
    </div>
  );
}
