import { useState, useEffect } from 'react';
import { useObserver } from '@/context';
import { useTimezones } from '@/hooks';
import { validateFormData } from '@/utils/validation';
import { FormInput } from './FormInput';
import { FormTimezoneInput } from './FormTimezoneInput';
import { LocationPicker } from './LocationPicker';
import type { ObserverFormData, ValidationError, LocationData } from '@/types';

interface ObserverFormProps {
  onSubmit: (data: ObserverFormData) => void;
  isCalculating: boolean;
}

/**
 * Form for entering observer location and date range
 */
export function ObserverForm({ onSubmit, isCalculating }: ObserverFormProps) {
  const { observerData, updateObserverData } = useObserver();
  const { filteredTimezones, setFilterText } = useTimezones();
  
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [showTimezoneDropdown, setShowTimezoneDropdown] = useState(false);
  const [activeTab, setActiveTab] = useState<'search' | 'saved'>('search');
  const [selectedSavedLocationId, setSelectedSavedLocationId] = useState<string | undefined>();
  const [attemptedCalculate, setAttemptedCalculate] = useState(false);

  // Update timezone filter when observerData timezone changes
  useEffect(() => {
    setFilterText(observerData.timezone);
  }, [observerData.timezone, setFilterText]);

  const handleChange = (field: keyof ObserverFormData, value: string | boolean) => {
    updateObserverData({ [field]: value });
    // Clear errors for this field
    setErrors(prev => prev.filter(err => err.field !== field));
  };

  const handleLocationChange = (location: LocationData) => {
    // Convert LocationData to form fields
    const updates: Partial<ObserverFormData> = {
      latitude: location.lat.toString(),
      longitude: location.lng.toString(),
      elevation: location.elevation !== undefined ? location.elevation.toString() : '0',
      address: location.address,
    };
    
    updateObserverData(updates);
    
    // Clear errors for location fields
    setErrors(prev => prev.filter(
      err => err.field !== 'latitude' && err.field !== 'longitude' && err.field !== 'elevation'
    ));
  };

  const getCurrentLocation = (): LocationData => {
    return {
      lat: parseFloat(observerData.latitude) || 0,
      lng: parseFloat(observerData.longitude) || 0,
      elevation: observerData.elevation ? parseFloat(observerData.elevation) : undefined,
      address: observerData.address,
    };
  };

  const handleSelectionStateChange = (
    _hasSelection: boolean,
    currentTab: 'search' | 'saved',
    _currentLocationSource: 'search' | 'saved' | null,
    savedLocationId?: string
  ) => {
    setActiveTab(currentTab);
    setSelectedSavedLocationId(savedLocationId);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark that user attempted to calculate
    setAttemptedCalculate(true);
    
    // Validate form data
    const validationErrors = validateFormData(observerData);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    onSubmit(observerData);
  };

  const getFieldError = (field: keyof ObserverFormData): string | undefined => {
    return errors.find(err => err.field === field)?.message;
  };

  // Comprehensive validation for calculate button
  const canCalculate = () => {
    const lat = parseFloat(observerData.latitude);
    const lng = parseFloat(observerData.longitude);
    
    // Check lat/lng are valid non-zero numbers
    const hasValidLocation = 
      observerData.latitude !== '' &&
      observerData.longitude !== '' &&
      !isNaN(lat) &&
      !isNaN(lng) &&
      lat !== 0 &&
      lng !== 0;
    
    // Check dates are filled
    const hasDates = observerData.dateStart !== '' && observerData.dateEnd !== '';
    
    // Special validation for saved tab: must have a saved location selected
    const savedTabValid = activeTab !== 'saved' || selectedSavedLocationId !== undefined;
    
    return hasValidLocation && hasDates && savedTabValid;
  };

  // Get descriptive message for why calculate is disabled
  const getDisabledMessage = () => {
    const lat = parseFloat(observerData.latitude);
    const lng = parseFloat(observerData.longitude);
    
    if (observerData.latitude === '' || observerData.longitude === '' || isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0) {
      return 'Please enter a valid location';
    }
    if (observerData.dateStart === '' || observerData.dateEnd === '') {
      return 'Please select start and end dates';
    }
    if (activeTab === 'saved' && selectedSavedLocationId === undefined) {
      return 'Please select a saved location';
    }
    return '';
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white/2 backdrop-blur-[2px] border-2 border-purple-500/20 shadow-[0_0_20px_rgba(168,85,247,0.15)] rounded-lg p-6">
      {/* Validation Error Summary */}
      {errors.length > 0 && (
        <div className="mb-6 bg-red-900/30 border border-red-600 rounded-lg p-4" role="alert">
          <div className="flex items-start gap-2">
            <span className="text-red-400 text-lg mt-0.5">⚠</span>
            <div>
              <h3 className="text-red-400 font-semibold mb-1">Please fix the following errors:</h3>
              <ul className="list-disc list-inside text-sm text-red-300 space-y-1">
                {errors.map((err, idx) => (
                  <li key={idx}>{err.message}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
      
      {/* Location Picker - replaces separate lat/lng/elevation inputs */}
      <div className="mb-6">
        <LocationPicker
          location={getCurrentLocation()}
          onLocationChange={handleLocationChange}
          onTimezoneChange={(timezone) => handleChange('timezone', timezone)}
          onSelectionStateChange={handleSelectionStateChange}
          disabled={isCalculating}
          showSavedTabError={attemptedCalculate && activeTab === 'saved' && selectedSavedLocationId === undefined}
        />
        
        {/* Show location-specific errors if any */}
        {(getFieldError('latitude') || getFieldError('longitude') || getFieldError('elevation')) && (
          <div className="mt-4 bg-red-900/20 border border-red-600/50 rounded-lg p-3">
            <p className="text-sm font-medium text-red-400 mb-1">Location Errors:</p>
            <ul className="text-sm text-red-300 space-y-1">
              {getFieldError('latitude') && <li>• {getFieldError('latitude')}</li>}
              {getFieldError('longitude') && <li>• {getFieldError('longitude')}</li>}
              {getFieldError('elevation') && <li>• {getFieldError('elevation')}</li>}
            </ul>
          </div>
        )}
      </div>
      
      {/* Timezone and Elevation on same line */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormTimezoneInput
          id="timezone"
          label="Timezone"
          tooltip="Automatically detected from your location. You can also search and select a different time zone if needed."
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

        {/* Elevation */}
        <FormInput
          id="elevation"
          label="Elevation (meters)"
          tooltip="Enter the elevation of your observing location in meters above sea level. This affects the calculated twilight times. Defaults to 0 (sea level)."
          type="number"
          value={observerData.elevation}
          onChange={(value) => handleChange('elevation', value)}
          error={getFieldError('elevation')}
          placeholder="0"
        />
      </div>

      {/* Date Range - Start and End Date on same line */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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

      {/* Submit Button */}
      <div>
        <button
          type="submit"
          disabled={isCalculating || !canCalculate()}
          className="w-full px-6 py-3 bg-blue-800/70 text-white rounded-lg hover:bg-blue-700/80 
                     disabled:bg-blue-900/30 disabled:border-2 disabled:border-blue-700/40 disabled:text-blue-300/60 
                     disabled:cursor-not-allowed transition-colors font-medium shadow-lg disabled:shadow-none"
        >
          {isCalculating ? 'Calculating...' : 'Calculate Dark Times'}
        </button>
        {!canCalculate() && !isCalculating && (
          <p className={`text-sm mt-2 text-center ${
            activeTab === 'saved' && selectedSavedLocationId === undefined
              ? 'text-red-400'
              : 'text-yellow-400'
          }`}>
            {getDisabledMessage()}
          </p>
        )}
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
