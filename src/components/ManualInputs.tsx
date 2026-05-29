import { useState, useEffect } from 'react';
import { MapPin } from 'lucide-react';
import { Tooltip } from './Tooltip';
import type { LocationData } from '@/types';

interface ManualInputsProps {
  location: LocationData;
  onLocationChange: (location: LocationData) => void;
  isActive?: boolean; // Whether this tab is currently active
  disabled?: boolean;
}

/**
 * Manual coordinate input component
 * Features: validation, submit-based updates (not real-time)
 */
export function ManualInputs({
  location,
  onLocationChange,
  isActive = true,
  disabled = false,
}: ManualInputsProps) {
  const [latInput, setLatInput] = useState('');
  const [lngInput, setLngInput] = useState('');
  const [hasPopulated, setHasPopulated] = useState(false);

  const [errors, setErrors] = useState<{
    lat?: string;
    lng?: string;
  }>({});

  // Populate inputs when tab becomes active (only once per activation)
  useEffect(() => {
    if (isActive && !hasPopulated) {
      setLatInput(location.lat.toString());
      setLngInput(location.lng.toString());
      setHasPopulated(true);
      setErrors({}); // Clear any errors
    }
  }, [isActive, hasPopulated, location.lat, location.lng]);

  // Reset hasPopulated when tab becomes inactive
  useEffect(() => {
    if (!isActive) {
      setHasPopulated(false);
    }
  }, [isActive]);

  // Validate a single field and update its error state
  const validateField = (field: 'lat' | 'lng', value: string): boolean => {
    const newErrors = { ...errors };

    if (field === 'lat') {
      if (value === '') {
        newErrors.lat = 'Latitude is required';
        setErrors(newErrors);
        return false;
      } else {
        const num = parseFloat(value);
        if (isNaN(num)) {
          newErrors.lat = 'Must be a valid number';
          setErrors(newErrors);
          return false;
        } else if (num < -90 || num > 90) {
          newErrors.lat = 'Must be between -90 and 90';
          setErrors(newErrors);
          return false;
        } else {
          delete newErrors.lat;
          setErrors(newErrors);
          return true;
        }
      }
    } else if (field === 'lng') {
      if (value === '') {
        newErrors.lng = 'Longitude is required';
        setErrors(newErrors);
        return false;
      } else {
        const num = parseFloat(value);
        if (isNaN(num)) {
          newErrors.lng = 'Must be a valid number';
          setErrors(newErrors);
          return false;
        } else if (num < -180 || num > 180) {
          newErrors.lng = 'Must be between -180 and 180';
          setErrors(newErrors);
          return false;
        } else {
          delete newErrors.lng;
          setErrors(newErrors);
          return true;
        }
      }
    }

    return false;
  };

  // Handle input changes and validate
  const handleInputChange = (field: 'lat' | 'lng', value: string) => {
    if (field === 'lat') {
      setLatInput(value);
      if (value !== '') {
        validateField('lat', value);
      } else {
        // Clear error when empty (allow user to clear field)
        setErrors(prev => ({ ...prev, lat: undefined }));
      }
    } else if (field === 'lng') {
      setLngInput(value);
      if (value !== '') {
        validateField('lng', value);
      } else {
        setErrors(prev => ({ ...prev, lng: undefined }));
      }
    }
  };

  // Handle form submission
  const handleSubmit = () => {
    // Validate both fields
    const latValid = validateField('lat', latInput);
    const lngValid = validateField('lng', lngInput);

    // Only update parent if both are valid
    if (latValid && lngValid) {
      onLocationChange({
        lat: parseFloat(latInput),
        lng: parseFloat(lngInput),
        elevation: location.elevation,
        address: undefined, // Clear address when manually entering coordinates
      });
    }
  };

  // Check if form is valid for submission
  const canSubmit = 
    latInput !== '' && 
    lngInput !== '' && 
    !errors.lat && 
    !errors.lng;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Latitude */}
        <div>
          <label
            htmlFor="manual-latitude"
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            Latitude
            <Tooltip text="Latitude in decimal degrees (-90 to 90). Positive values are North, negative are South." />
          </label>
          <input
            id="manual-latitude"
            type="number"
            step="any"
            value={latInput}
            onChange={(e) => handleInputChange('lat', e.target.value)}
            disabled={disabled}
            className={`w-full px-4 py-2 min-h-[44px] bg-gray-700/50 border ${
              errors.lat
                ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/50'
                : 'border-gray-600 focus:ring-2 focus:ring-purple-500'
            } rounded-lg text-white focus:outline-none focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors disabled:bg-gray-800 disabled:cursor-not-allowed`}
            placeholder="40.7128"
            aria-invalid={errors.lat ? 'true' : 'false'}
            aria-describedby={errors.lat ? 'manual-latitude-error' : undefined}
          />
          {errors.lat && (
            <p
              id="manual-latitude-error"
              className="mt-1.5 text-sm text-red-400 flex items-start gap-1.5"
              role="alert"
            >
              <span className="text-red-400 mt-0.5">⚠</span>
              <span>{errors.lat}</span>
            </p>
          )}
        </div>

        {/* Longitude */}
        <div>
          <label
            htmlFor="manual-longitude"
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            Longitude
            <Tooltip text="Longitude in decimal degrees (-180 to 180). Positive values are East, negative are West." />
          </label>
          <input
            id="manual-longitude"
            type="number"
            step="any"
            value={lngInput}
            onChange={(e) => handleInputChange('lng', e.target.value)}
            disabled={disabled}
            className={`w-full px-4 py-2 min-h-[44px] bg-gray-700/50 border ${
              errors.lng
                ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/50'
                : 'border-gray-600 focus:ring-2 focus:ring-purple-500'
            } rounded-lg text-white focus:outline-none focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors disabled:bg-gray-800 disabled:cursor-not-allowed`}
            placeholder="-74.0060"
            aria-invalid={errors.lng ? 'true' : 'false'}
            aria-describedby={
              errors.lng ? 'manual-longitude-error' : undefined
            }
          />
          {errors.lng && (
            <p
              id="manual-longitude-error"
              className="mt-1.5 text-sm text-red-400 flex items-start gap-1.5"
              role="alert"
            >
              <span className="text-red-400 mt-0.5">⚠</span>
              <span>{errors.lng}</span>
            </p>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={disabled || !canSubmit}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 min-h-[44px] bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
      >
        <MapPin className="w-5 h-5" />
        Place Pin on Map
      </button>
    </div>
  );
}
