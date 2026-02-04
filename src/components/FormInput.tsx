import { Tooltip } from './Tooltip';

interface FormInputProps {
  id: string;
  label: string;
  tooltip: string;
  type?: 'text' | 'date';
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  className?: string;
}

/**
 * Reusable form input component with label, tooltip, and error handling
 */
export function FormInput({
  id,
  label,
  tooltip,
  type = 'text',
  value,
  onChange,
  error,
  placeholder,
  className = '',
}: FormInputProps) {
  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-medium text-gray-300 mb-2">
        {label}
        <Tooltip text={tooltip} />
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-4 py-2 bg-gray-700/50 border ${
          error ? 'border-red-500' : 'border-gray-600'
        } rounded-lg text-white focus:outline-none focus:border-purple-500 transition-colors ${
          type === 'date' ? '[color-scheme:dark]' : ''
        }`}
        placeholder={placeholder}
        style={type === 'date' ? {
          WebkitAppearance: 'none',
          MozAppearance: 'textfield',
        } as React.CSSProperties : undefined}
      />
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}
