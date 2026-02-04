/**
 * Time range filter for filtering dark time windows
 * Times are stored in 24-hour format (HH:mm) but displayed to users in 12-hour format
 */
export interface TimeRangeFilter {
  /** Start time in 24-hour format (e.g., "21:00" for 9:00 PM) */
  startTime: string;
  /** End time in 24-hour format (e.g., "22:00" for 10:00 PM) */
  endTime: string;
  /** Whether the time range filter is enabled */
  enabled: boolean;
}

/**
 * Form data structure for observer input
 */
export interface ObserverFormData {
  /** Latitude value as string for form input */
  latitude: string;
  /** Longitude value as string for form input */
  longitude: string;
  /** Elevation value as string for form input */
  elevation: string;
  /** Start date in YYYY-MM-DD format */
  dateStart: string;
  /** End date in YYYY-MM-DD format */
  dateEnd: string;
  /** IANA timezone identifier */
  timezone: string;
  /** Whether to save this timezone as default */
  saveDefaultTimezone: boolean;
  /** Optional time range filter for filtering dark windows by time of day */
  timeRangeFilter?: TimeRangeFilter;
}

/**
 * Validation error for a specific form field
 */
export interface ValidationError {
  /** The form field that has an error */
  field: keyof ObserverFormData;
  /** Human-readable error message */
  message: string;
}

/**
 * Form field names for type-safe reference
 */
export type FormFieldName = keyof ObserverFormData;

/**
 * Form input props for reusable input components
 */
export interface FormInputProps {
  /** Field label */
  label: string;
  /** Current value */
  value: string;
  /** Change handler */
  onChange: (value: string) => void;
  /** Input type */
  type?: 'text' | 'date' | 'number';
  /** Placeholder text */
  placeholder?: string;
  /** Tooltip help text */
  tooltip?: string;
  /** Whether field is required */
  required?: boolean;
  /** Validation pattern */
  pattern?: string;
  /** Error message if validation fails */
  error?: string;
}
