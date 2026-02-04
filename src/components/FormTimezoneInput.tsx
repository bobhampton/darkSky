import { Tooltip } from './Tooltip';

interface FormTimezoneInputProps {
  id: string;
  label: string;
  tooltip: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  options: string[];
  showDropdown: boolean;
  onFocusChange: (show: boolean) => void;
  onOptionSelect: (value: string) => void;
}

/**
 * Specialized form input for timezone selection with dropdown
 */
export function FormTimezoneInput({
  id,
  label,
  tooltip,
  value,
  onChange,
  error,
  placeholder,
  options,
  showDropdown,
  onFocusChange,
  onOptionSelect,
}: FormTimezoneInputProps) {
  return (
    <div className="relative">
      <label htmlFor={id} className="block text-sm font-medium text-gray-300 mb-2">
        {label}
        <Tooltip text={tooltip} />
      </label>
      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => onFocusChange(true)}
        onBlur={() => setTimeout(() => onFocusChange(false), 200)}
        className={`w-full px-4 py-2 bg-gray-700/50 border ${
          error ? 'border-red-500' : 'border-gray-600'
        } rounded-lg text-white focus:outline-none focus:border-purple-500 transition-colors`}
        placeholder={placeholder}
      />
      {showDropdown && options.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-gray-700 border border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {options.slice(0, 10).map((option) => (
            <div
              key={option}
              onClick={() => onOptionSelect(option)}
              className="px-4 py-2 hover:bg-gray-600 cursor-pointer text-white"
            >
              {option}
            </div>
          ))}
        </div>
      )}
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}
