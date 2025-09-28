import React, { useRef } from 'react'; // Removed unused useState
import { VariableInsertButton } from './VariableInsertButton';
import { useTheme } from '../../utils/themeProvider'; // Added useTheme

interface VariableInputFieldProps {
  name: string;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  multiline?: boolean;
  rows?: number;
  helperText?: string;
}

/**
 * A reusable input field component with a variable insert button
 */
export const VariableInputField: React.FC<VariableInputFieldProps> = ({
  name,
  label,
  value,
  onChange,
  placeholder = '',
  className = '',
  disabled = false,
  multiline = false,
  rows = 3,
  helperText
}) => {
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const { theme } = useTheme();
  const isLight = theme === 'light';

  // Base input styling
  const baseInputClasses = `w-full p-2 rounded-md transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 ${isLight ? 'border-gray-300 focus:border-blue-500 focus:ring-blue-200 bg-white text-gray-900 placeholder-gray-400' : 'border-slate-600 focus:border-blue-500 focus:ring-blue-500/50 bg-slate-700 text-slate-100 placeholder-slate-400'} ${className}`;
  
  // Handle inserting variables at cursor position
  const handleInsertVariable = (newValue: string) => {
    onChange(newValue);
    
    // Focus the input field after inserting
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 0);
  };

  const InputElement = multiline ? (
    <textarea
      ref={inputRef as React.RefObject<HTMLTextAreaElement>}
      id={name}
      name={name}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={baseInputClasses} // Use theme-aware classes
      disabled={disabled}
      rows={rows}
    />
  ) : (
    <input
      ref={inputRef as React.RefObject<HTMLInputElement>}
      type="text"
      id={name}
      name={name}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={baseInputClasses} // Use theme-aware classes
      disabled={disabled}
    />
  );

  return (
    <div className="relative w-full">
      {label && <label htmlFor={name} className={`block text-sm font-medium mb-1 ${isLight ? 'text-gray-700' : 'text-slate-300'}`}>{label}</label>}
      <div className="flex items-center">
        <div className="relative flex-1">
          {InputElement}
          <div className="absolute inset-y-0 right-0 flex items-center pr-2">
            <VariableInsertButton
              fieldName={name}
              currentValue={value}
              onInsert={handleInsertVariable}
            />
          </div>
        </div>
      </div>
      {helperText && <p className={`mt-1 text-xs ${isLight ? 'text-gray-500' : 'text-slate-400'}`}>{helperText}</p>}
    </div>
  );
};