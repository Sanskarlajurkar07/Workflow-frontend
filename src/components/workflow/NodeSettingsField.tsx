import React from 'react';
import { Copy, PlusCircle, Trash } from 'lucide-react';
import { useTheme } from '../../utils/themeProvider';
import AutocompleteInput from './AutocompleteInput';

interface NodeSettingsFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
  rows?: number;
  description?: string;
  placeholder?: string;
  required?: boolean;
  variableSupport?: boolean;
  copyButton?: boolean;
  onCopy?: () => void;
  className?: string;
}

export const NodeSettingsField: React.FC<NodeSettingsFieldProps> = ({
  label,
  value,
  onChange,
  multiline = false,
  rows = 3,
  description,
  placeholder,
  required = false,
  variableSupport = false,
  copyButton = false,
  onCopy,
  className = '',
}) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  return (
    <div className={`mb-4 ${className}`}>
      <div className="flex justify-between items-center mb-1">
        <label className={`block text-sm font-medium ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        
        {copyButton && (
          <button
            onClick={onCopy}
            className={`p-1 rounded-md text-xs flex items-center ${
              isLight ? 'text-gray-500 hover:bg-gray-100' : 'text-gray-400 hover:bg-gray-800'
            }`}
            title="Copy to clipboard"
          >
            <Copy className="w-3 h-3 mr-1" />
            <span>Copy</span>
          </button>
        )}
      </div>
      
      {description && (
        <p className={`text-xs mb-2 ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
          {description}
        </p>
      )}
      
      {variableSupport ? (
        <AutocompleteInput
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          multiline={multiline}
          rows={rows}
          className={`${isLight ? 'bg-white' : 'bg-slate-800'}`}
        />
      ) : (
        <>
          {multiline ? (
            <textarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              rows={rows}
              className={`w-full px-3 py-2 border ${
                isLight 
                  ? 'bg-white border-gray-300 text-gray-900' 
                  : 'bg-slate-800 border-slate-600 text-white'
              } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder={placeholder}
            />
          ) : (
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className={`w-full px-3 py-2 border ${
                isLight 
                  ? 'bg-white border-gray-300 text-gray-900' 
                  : 'bg-slate-800 border-slate-600 text-white'
              } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder={placeholder}
            />
          )}
        </>
      )}
    </div>
  );
};

export default NodeSettingsField; 