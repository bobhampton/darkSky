import { useState, useEffect } from 'react';
import { useObserver } from '@/context';
import { useTimezones } from '@/hooks';
import { validateFormData } from '@/utils/validation';
import { Tooltip } from './Tooltip';
import { FormInput } from './FormInput';
import { FormTimezoneInput } from './FormTimezoneInput';
import type { ObserverFormData, ValidationError } from '@/types';

interface ObserverFormProps {
  onSubmit: (data: ObserverFormData) => void;
  isCalculating: boolean;
}

/**
 * Form for entering observer location and date range
 */
export function ObserverForm({ onSubmit, isCalculating }: ObserverFormProps) {
  const { observerData, updateObserverData } = useObserver();
  const { filteredTimezones, setFilterText, defaultTimezone, setDefaultTimezone } = useTimezones();
  
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [showTimezoneDropdown, setShowTimezoneDropdown] = useState(false);

  // Update timezone filter when observerData timezone changes
  useEffect(() => {
    setFilterText(observerData.timezone);
  }, [observerData.timezone, setFilterText]);

  const handleChange = (field: keyof ObserverFormData, value: string | boolean) => {
    updateObserverData({ [field]: value });
    // Clear errors for this field
    setErrors(prev => prev.filter(err => err.field !== field));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    const validationErrors = validateFormData(observerData);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Save timezone as default if checkbox is checked
    if (observerData.saveDefaultTimezone) {
      setDefaultTimezone(observerData.timezone);
    }

    onSubmit(observerData);
  };

  const getFieldError = (field: keyof ObserverFormData): string | undefined => {
    return errors.find(err => err.field === field)?.message;
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white/2 backdrop-blur-[2px] border-2 border-purple-500/20 shadow-[0_0_20px_rgba(168,85,247,0.15)] rounded-lg p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Latitude */}
        <FormInput
          id="latitude"
          label="Latitude (degrees)"
          tooltip="Enter the latitude for the location where the dark sky time is to be observed (e.g., 40.7720)."
          value={observerData.latitude}
          onChange={(value) => handleChange('latitude', value)}
          error={getFieldError('latitude')}
          placeholder="e.g., 40.7128"
        />

        {/* Longitude */}
        <FormInput
          id="longitude"
          label="Longitude (degrees)"
          tooltip="Enter the longitude for the location where the dark sky time is to be observed (e.g., -112.1012)."
          value={observerData.longitude}
          onChange={(value) => handleChange('longitude', value)}
          error={getFieldError('longitude')}
          placeholder="e.g., -74.0060"
        />

        {/* Elevation */}
        <FormInput
          id="elevation"
          label="Elevation (meters)"
          tooltip="Enter the elevation in meters for the location where the dark sky time is to be observed. Default is 0."
          value={observerData.elevation}
          onChange={(value) => handleChange('elevation', value)}
          error={getFieldError('elevation')}
          placeholder="e.g., 0"
        />

        {/* Timezone */}
        <FormTimezoneInput
          id="timezone"
          label="Timezone"
          tooltip="Select the time zone that you want the calculated times to be displayed in. Typically this will be the same time zone as the latitude and longitude entered above."
          value={observerData.timezone}
          onChange={(value) => {
            handleChange('timezone', value);
            setShowTimezoneDropdown(true);
          }}
          error={getFieldError('timezone')}
          placeholder="Type to search timezones..."
          options={filteredTimezones}
          showDropdown={showTimezoneDropdown}
          onFocusChange={setShowTimezoneDropdown}
          onOptionSelect={(value) => {
            handleChange('timezone', value);
            setShowTimezoneDropdown(false);
          }}
        />

        {/* Start Date */}
        <FormInput
          id="dateStart"
          label="Start Date"
          tooltip="Select the start date of the time period for which you want to calculate dark sky times."
          type="date"
          value={observerData.dateStart}
          onChange={(value) => handleChange('dateStart', value)}
          error={getFieldError('dateStart')}
        />

        {/* End Date */}
        <FormInput
          id="dateEnd"
          label="End Date"
          tooltip="Select the end date of the time period for which you want to calculate dark sky times."
          type="date"
          value={observerData.dateEnd}
          onChange={(value) => handleChange('dateEnd', value)}
          error={getFieldError('dateEnd')}
        />
      </div>

      {/* Save Default Timezone Checkbox */}
      <div className="mt-4">
        <label className="flex items-center text-gray-300">
          <input
            type="checkbox"
            checked={observerData.saveDefaultTimezone}
            onChange={(e) => handleChange('saveDefaultTimezone', e.target.checked)}
            className="mr-2 h-4 w-4 rounded border-gray-600 bg-gray-700 text-blue-600 
                       focus:ring-blue-500 focus:ring-offset-gray-800"
          />
          <span className="text-sm">
            Save this timezone as default
            <Tooltip text="Enable this to automatically select this time zone the next time you visit this page." />
          </span>
        </label>
        {defaultTimezone !== observerData.timezone && (
          <p className="mt-1 text-xs text-gray-400">
            Current default: {defaultTimezone}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <div className="mt-6">
        <button
          type="submit"
          disabled={isCalculating}
          className="w-full px-6 py-3 bg-blue-800/70 text-white rounded-lg hover:bg-blue-700/80 
                     disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {isCalculating ? 'Calculating...' : 'Calculate Dark Times'}
        </button>
      </div>

      {/* General Error Message */}
      {errors.length > 0 && !errors.some(err => err.field) && (
        <div className="mt-4 p-4 bg-red-900/50 border border-red-500 rounded-lg">
          <p className="text-red-200 text-sm">
            {errors.find(err => !err.field)?.message || 'Please correct the errors above'}
          </p>
        </div>
      )}
    </form>
  );
}
