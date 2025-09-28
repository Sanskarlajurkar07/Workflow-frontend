import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { useFlowStore } from '../../store/flowStore';
import { ChevronDown, AlertTriangle, Braces } from 'lucide-react'; // Added AlertTriangle, Braces
import { useTheme } from '../../utils/themeProvider'; // Added useTheme

interface FlowNode {
  id: string;
  data: {
    params?: {
      nodeName?: string;
      type?: string;
    };
  };
}

interface Variable {
  nodeName: string;
  fields: string[];
}

interface PromptInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  rows?: number;
  className?: string;
}

export interface PromptInputRef {
  activateVariableMode: () => void;
}

export const PromptInput = forwardRef<PromptInputRef, PromptInputProps>(({
  value,
  onChange,
  placeholder = 'Enter text...',
  multiline = false,
  rows = 3,
  className = ''
}, ref) => {
  const [cursorPosition, setCursorPosition] = useState<number>(0);
  const [showVariables, setShowVariables] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [variableError, setVariableError] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | HTMLInputElement>(null);
  const variableMenuRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme(); // Added theme
  const isLight = theme === 'light'; // Added isLight

  const { nodes } = useFlowStore();

  // Expose activateVariableMode function to parent components
  useImperativeHandle(ref, () => ({
    activateVariableMode: () => {
      if (inputRef.current) {
        const currentPos = inputRef.current.selectionStart || value.length;
        const before = value.slice(0, currentPos);
        const after = value.slice(currentPos);
        const newValue = `${before}{{}}${after}`;
        onChange(newValue);
        
        // Set cursor position inside the braces and show variables
        setTimeout(() => {
          if (inputRef.current) {
            const newPos = currentPos + 2;
            inputRef.current.selectionStart = newPos;
            inputRef.current.selectionEnd = newPos;
            inputRef.current.focus();
            setCursorPosition(newPos);
            setShowVariables(true);
            setSearchTerm('');
          }
        }, 0);
      }
    }
  }));

  // Get available variables from connected nodes
  const getAvailableVariables = () => {
    const vars: Variable[] = [
      { nodeName: 'workflow', fields: ['input', 'variables'] },
    ];

    (nodes as FlowNode[]).forEach(node => {
      const nodeName = node.data?.params?.nodeName || node.id;
      let outputFields: string[] = [];

      // Prioritize explicitly defined outputFields
      // Assuming node.data might have an outputFields array similar to other components
      if (node.data && Array.isArray((node.data as any).outputFields) && (node.data as any).outputFields.length > 0) {
        outputFields = (node.data as any).outputFields;
      } else {
        // Fallback to type-based common fields
        const type = (node as any).type?.toLowerCase() || ''; // Assuming node has a 'type' property
        if (type.includes('input')) {
          const inputType = node.data?.params?.type || 'Text';
          switch (inputType) {
            case 'Text':
              outputFields = ['text'];
              break;
            case 'Image':
              outputFields = ['image'];
              break;
            case 'Audio':
              outputFields = ['audio'];
              break;
            case 'File':
              outputFields = ['file'];
              break;
            case 'JSON':
              outputFields = ['json'];
              break;
            default:
              outputFields = ['text'];
          }
        } else if (type.includes('ai') || type.includes('openai') || type.includes('anthropic') || type.includes('gemini') || type.includes('claude')) {
          outputFields = ['response', 'content', 'text', 'message', 'full_response', 'error'];
        } else if (type.includes('transform') || type.includes('processor') || type.includes('text-processor')) {
          outputFields = ['transformed_text', 'output', 'result', 'processed_data'];
        } else if (type.includes('kb-search') || type.includes('knowledge') || type.includes('vector')) {
          outputFields = ['results', 'documents', 'metadata', 'summary'];
        } else if (type.includes('data_collector') || type.includes('form')) {
          outputFields = ['collected_data', 'form_data', 'submission'];
        } else if (type.includes('json_handler') || type.includes('json')) {
          outputFields = ['json_object', 'parsed_data', 'error'];
        } else if (type.includes('api_loader') || type.includes('http_request')) {
          outputFields = ['response_data', 'status_code', 'headers', 'error'];
        } else if (type.includes('file_reader') || type.includes('document_loader')) {
          outputFields = ['file_content', 'text', 'metadata'];
        } else if (type.includes('condition')) {
          outputFields = ['condition_met', 'output_true', 'output_false'];
        } else if (type.includes('merge')) {
          outputFields = ['merged_data', 'combined_output'];
        } else if (type.includes('time') || type.includes('delay')) {
          outputFields = ['current_time', 'timestamp', 'status'];
        } else if (type.includes('output') || type.includes('result_node')) {
          outputFields = ['value', 'final_output'];
        } else {
          // Generic fallback
          outputFields = ['output', 'result', 'data', 'value', 'text', 'content', 'summary']; // Added original defaults here as a broader fallback
        }
      }
      vars.push({
        nodeName,
        fields: outputFields
      });
    });
    return vars;
  };

  const availableVariables = getAvailableVariables(); // Memoize or compute less frequently if performance is an issue

  // Validate variables in the input value
  const validateVariables = (currentValue: string) => {
    const regex = /\{\{(.*?)\}\}/g;
    let match;
    const usedVariables: string[] = [];
    while ((match = regex.exec(currentValue)) !== null) {
      const varName = match[1].trim();
      if (varName) {
        usedVariables.push(varName);
      }
    }

    if (usedVariables.length === 0) {
      setVariableError(null);
      return;
    }

    const allAvailableVariableStrings: string[] = [];
    availableVariables.forEach(v => {
      v.fields.forEach(f => {
        allAvailableVariableStrings.push(`${v.nodeName}.${f}`);
      });
    });

    const invalidVariables = usedVariables.filter(uv => !allAvailableVariableStrings.includes(uv));

    if (invalidVariables.length > 0) {
      setVariableError(`Invalid variable(s): ${invalidVariables.join(', ')}. Please check available variables.`);
    } else {
      setVariableError(null);
    }
  };

  // Effect to validate variables when value changes
  useEffect(() => {
    validateVariables(value);
  }, [value, availableVariables]);

  // Filter variables based on search term
  const filteredVariables = availableVariables.filter((variable: Variable) =>
    variable.nodeName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle variable insertion
  const insertVariable = (nodeName: string, field: string) => {
    if (inputRef.current) {
      const before = value.slice(0, cursorPosition);
      const after = value.slice(cursorPosition);
      
      // Find if we're inside existing braces and replace content
      const beforeBraceMatch = before.match(/\{\{([^}]*)$/);
      if (beforeBraceMatch) {
        const braceStart = before.length - beforeBraceMatch[0].length;
        const afterBraceMatch = after.match(/^([^}]*)\}\}/);
        if (afterBraceMatch) {
          const braceEnd = cursorPosition + afterBraceMatch[0].length;
          const newValue = value.slice(0, braceStart) + `{{${nodeName}.${field}}}` + value.slice(braceEnd);
          onChange(newValue);
          
          // Position cursor after the inserted variable
          const newPosition = braceStart + `{{${nodeName}.${field}}}`.length;
          setTimeout(() => {
            if (inputRef.current) {
              inputRef.current.selectionStart = newPosition;
              inputRef.current.selectionEnd = newPosition;
              inputRef.current.focus();
            }
          }, 0);
        } else {
          const newValue = `${before.slice(0, braceStart)}{{${nodeName}.${field}}}${after}`;
          onChange(newValue);
          
          const newPosition = braceStart + `{{${nodeName}.${field}}}`.length;
          setTimeout(() => {
            if (inputRef.current) {
              inputRef.current.selectionStart = newPosition;
              inputRef.current.selectionEnd = newPosition;
              inputRef.current.focus();
            }
          }, 0);
        }
      } else {
        const newValue = `${before}{{${nodeName}.${field}}}${after}`;
        onChange(newValue);
        
        const newPosition = cursorPosition + `{{${nodeName}.${field}}}`.length;
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.selectionStart = newPosition;
            inputRef.current.selectionEnd = newPosition;
            inputRef.current.focus();
          }
        }, 0);
      }
    }
    setShowVariables(false);
    // Validate variables after insertion, need to get the latest value from onChange
    // This might be tricky due to async nature of onChange. Consider validating in useEffect or after onChange completes.
    // For simplicity, we'll rely on the useEffect [value] dependency for now.
  };

  // Handle cursor position tracking
  const handleSelect = (e: React.SyntheticEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    setCursorPosition(e.currentTarget.selectionStart || 0);
  };

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setCursorPosition(e.target.selectionStart || 0);

    // Check if we should show variables menu
    if (newValue.slice(0, e.target.selectionStart || 0).match(/\{\{$/)) {
      setShowVariables(true);
      setSearchTerm('');
    } else if (showVariables) {
      const match = newValue.slice(0, e.target.selectionStart || 0).match(/\{\{([^}]*)$/);
      if (match) {
        setSearchTerm(match[1]);
      } else {
        setShowVariables(false);
      }
    }
    validateVariables(newValue); // Validate on manual change
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === '{' && e.shiftKey) {
      e.preventDefault();
      const pos = inputRef.current?.selectionStart || 0;
      const newValue = value.slice(0, pos) + '{{}}' + value.slice(pos);
      onChange(newValue);
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.selectionStart = pos + 2;
          inputRef.current.selectionEnd = pos + 2;
        }
      }, 0);
      setShowVariables(true);
      setSearchTerm('');
      validateVariables(newValue); // Validate on manual change
    }
  };

  // Close variables menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (variableMenuRef.current && !variableMenuRef.current.contains(event.target as HTMLElement)) {
        setShowVariables(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const baseClasses = [
    'w-full px-3 py-2 text-sm',
    isLight 
      ? 'bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:bg-blue-50/30' 
      : 'bg-slate-800 border-slate-600 text-white focus:border-blue-500 focus:bg-blue-900/30',
    'border-2 rounded-lg',
    'placeholder-gray-500 dark:placeholder-gray-400',
    'focus:ring-2 focus:ring-blue-500/20 focus:outline-none',
    'transition-all duration-200',
    // 'font-mono', // Removing mono font for consistency with other inputs
    className
  ].filter(Boolean).join(' ');

  const renderVariableMenu = () => (
    <div
      ref={variableMenuRef}
      className={`absolute z-50 mt-2 max-h-80 w-full overflow-auto rounded-lg shadow-xl border-2 ${ // Matched EnhancedVariableInput styling
        isLight 
          ? 'bg-white text-gray-900 border-gray-200' 
          : 'bg-slate-800 text-white border-slate-600'
      }`}
    >
      <div className={`sticky top-0 px-4 py-3 text-xs font-semibold border-b ${ 
        isLight ? 'bg-gray-100 border-gray-300 text-gray-800' : 'bg-slate-700 border-slate-500 text-slate-200'
      }`}>
        <div className="flex items-center justify-between">
          <span>Available variables</span>
          <span className={`px-2 py-1 rounded-full text-xs ${isLight ? 'bg-blue-100 text-blue-800' : 'bg-blue-900/50 text-blue-300'}`}>
            {filteredVariables.length}
          </span>
        </div>
      </div>
      {filteredVariables.length > 0 ? (
        <div className="py-2">
          {filteredVariables.map((variable: Variable) => (
            <div key={variable.nodeName} className={`px-4 py-3 border-b ${isLight ? 'border-gray-100' : 'border-slate-700'} last:border-0`}>
              <div className={`font-semibold text-sm mb-1.5 ${isLight ? 'text-gray-700' : 'text-slate-300'}`}>{variable.nodeName}</div>
              <div className="space-y-1">
                {variable.fields.map((field: string) => (
                  <div 
                    key={field}
                    onClick={() => insertVariable(variable.nodeName, field)}
                    className={`px-3 py-2 cursor-pointer rounded-md transition-colors flex justify-between items-center ${ 
                      isLight ? 'hover:bg-blue-50' : 'hover:bg-slate-700'
                    }`}
                  >
                    <div>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${ 
                        isLight ? 'bg-blue-100 text-blue-700 border border-blue-300' : 'bg-blue-600/30 text-blue-300 border border-blue-500/50'
                      }`}>
                        {variable.nodeName}<span className="opacity-60">.</span>{field}
                      </span>
                    </div>
                    <div className={`ml-3 text-xs px-2 py-1 rounded-md font-medium ${ 
                      isLight ? 'bg-gray-200 text-gray-700 group-hover:bg-blue-500 group-hover:text-white' : 'bg-slate-600 text-slate-200 group-hover:bg-blue-500 group-hover:text-white'
                    } transition-colors duration-150`}>
                      Insert
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <Braces className="h-10 w-10 mx-auto mb-3 opacity-40" />
          <p className="font-medium">No Matching Variables</p>
          <p className="text-xs mt-1">Try a different search or ensure nodes are configured.</p>
        </div>
      )}
    </div>
  );

  if (multiline) {
    return (
      <div className="relative">
        <textarea
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
          value={value}
          onChange={handleChange}
          onSelect={handleSelect}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={rows}
          className={baseClasses}
          style={{ resize: 'vertical', minHeight: '80px' }}
        />
        {showVariables && renderVariableMenu()}
        {variableError && (
          <div className="mt-2 flex items-center p-2 rounded-md border border-red-500/50 bg-red-500/10 text-red-700 dark:text-red-400 dark:bg-red-900/20 dark:border-red-500/30">
            <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0" />
            <p className="text-xs">{variableError}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <input
        ref={inputRef as React.RefObject<HTMLInputElement>}
        type="text"
        value={value}
        onChange={handleChange}
        onSelect={handleSelect}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={baseClasses}
      />
      {showVariables && renderVariableMenu()}
      {variableError && (
        <div className="mt-2 flex items-center p-2 rounded-md border border-red-500/50 bg-red-500/10 text-red-700 dark:text-red-400 dark:bg-red-900/20 dark:border-red-500/30">
          <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0" />
          <p className="text-xs">{variableError}</p>
        </div>
      )}
    </div>
  );
});