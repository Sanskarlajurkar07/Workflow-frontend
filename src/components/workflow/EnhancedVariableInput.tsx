import React, { useState, useRef, useEffect } from 'react';
import { useFlowStore } from '../../store/flowStore';
import { Braces, Lightbulb, X, AlertTriangle } from 'lucide-react'; // Added AlertTriangle
import { useTheme } from '../../utils/themeProvider';

interface Variable {
  nodeId: string;
  field: string;
  label: string;
  description: string;
}

interface EnhancedVariableInputProps {
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

export const EnhancedVariableInput: React.FC<EnhancedVariableInputProps> = ({
  name,
  label,
  value,
  onChange,
  placeholder = 'Enter text...',
  className = '',
  disabled = false,
  multiline = false,
  rows = 3,
  helperText
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [suggestionFilter, setSuggestionFilter] = useState('');
  const [activeSuggestion, setActiveSuggestion] = useState(0);
  const [showTooltip, setShowTooltip] = useState(false);
  const [variableError, setVariableError] = useState<string | null>(null);
  
  const { theme } = useTheme();
  const isLight = theme === 'light';
  
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  
  // Get nodes from the flow store
  const nodes = useFlowStore(state => state.nodes);
  
  // Generate variables from nodes
  const variables: Variable[] = React.useMemo(() => {
    const vars: Variable[] = [
      { nodeId: 'workflow', field: 'input', label: 'Workflow Input', description: 'The initial input to the workflow.' },
      { nodeId: 'workflow', field: 'variables', label: 'Workflow Variables', description: 'Custom variables defined in the workflow.' },
    ];

    nodes.forEach(node => {
      // Skip the current node to avoid self-reference in some contexts, though for a general variable pool it might be fine.
      // if (node.id === name) return; 

      const nodeName = node.data?.params?.nodeName || node.data?.label || node.id;
      let outputFields: string[] = [];
      let description = `Output from ${nodeName}`;

      // Prioritize explicitly defined outputFields
      if (node.data && Array.isArray(node.data.outputFields) && node.data.outputFields.length > 0) {
        outputFields = node.data.outputFields;
        description = `Custom outputs from ${nodeName}`;
      } else {
        // Fallback to type-based common fields
        const type = node.type?.toLowerCase() || '';
        if (type.includes('input')) {
          outputFields = ['output', 'text', 'value'];
          description = `Input data from ${nodeName}`;
        } else if (type.includes('ai') || type.includes('openai') || type.includes('anthropic') || type.includes('gemini') || type.includes('claude')) {
          outputFields = ['output', 'response', 'content', 'text', 'message', 'full_response', 'error'];
          description = `AI model output from ${nodeName}`;
        } else if (type.includes('transform') || type.includes('processor') || type.includes('text-processor')) {
          outputFields = ['output', 'transformed_text', 'result', 'processed_data'];
          description = `Processed data from ${nodeName}`;
        } else if (type.includes('kb') || type.includes('knowledge')) {
          outputFields = ['output', 'results', 'documents', 'metadata', 'summary'];
          description = `Knowledge base results from ${nodeName}`;
        } else if (type.includes('data_collector') || type.includes('form')) {
          outputFields = ['output', 'collected_data', 'form_data', 'submission'];
          description = `Collected data from ${nodeName}`;
        } else if (type.includes('json_handler') || type.includes('json')) {
          outputFields = ['output', 'json_object', 'parsed_data', 'error'];
          description = `JSON data from ${nodeName}`;
        } else if (type.includes('api_loader') || type.includes('http_request')) {
          outputFields = ['output', 'response_data', 'status_code', 'headers', 'error'];
          description = `API response from ${nodeName}`;
        } else if (type.includes('file_reader') || type.includes('document_loader')) {
          outputFields = ['output', 'file_content', 'text', 'metadata'];
          description = `File content from ${nodeName}`;
        } else if (type.includes('condition')) {
          outputFields = ['output', 'condition_met', 'output_true', 'output_false'];
          description = `Conditional output from ${nodeName}`;
        } else if (type.includes('merge')) {
          outputFields = ['output', 'merged_data', 'combined_output'];
          description = `Merged data from ${nodeName}`;
        } else if (type.includes('time') || type.includes('delay')) {
          outputFields = ['output', 'current_time', 'timestamp', 'status'];
          description = `Time-related output from ${nodeName}`;
        } else if (type.includes('output') || type.includes('result_node')) {
          outputFields = ['output', 'value', 'final_output'];
          description = `Final output from ${nodeName}`;
        } else {
          // Generic fallback
          outputFields = ['output', 'result', 'data', 'value'];
        }
      }

      outputFields.forEach(field => {
        vars.push({
          nodeId: nodeName, // Use the more readable name
          field,
          label: `${nodeName} (${field})`, // Display readable name in label
          description
        });
      });
    });

    return vars;
  }, [nodes, name]);

  // Validate variables in the input value
  const validateVariables = (currentValue: string) => {
    const regex = /\{\{(.*?)\}\}/g;
    let match;
    const usedVariables: string[] = [];
    while ((match = regex.exec(currentValue)) !== null) {
      usedVariables.push(match[1].trim());
    }

    if (usedVariables.length === 0) {
      setVariableError(null);
      return;
    }

    const availableVariableStrings = variables.map(v => `${v.nodeId}.${v.field}`);
    const invalidVariables = usedVariables.filter(uv => !availableVariableStrings.includes(uv));

    if (invalidVariables.length > 0) {
      setVariableError(`Invalid variable(s): ${invalidVariables.join(', ')}. Please check available variables.`);
    } else {
      setVariableError(null);
    }
  };

  // Effect to validate variables when value changes
  useEffect(() => {
    validateVariables(value);
  }, [value, variables]);
  
  // Find the current token being typed (for variable suggestion)
  const getCurrentToken = (text: string, position: number): string => {
    const textBeforeCursor = text.slice(0, position);
    const openBraceIndex = textBeforeCursor.lastIndexOf('{{');
    
    if (openBraceIndex !== -1) {
      const closeBraceIndex = textBeforeCursor.indexOf('}}', openBraceIndex);
      if (closeBraceIndex === -1) {
        return textBeforeCursor.slice(openBraceIndex + 2).trim();
      }
    }
    
    return '';
  };
  
  // Get filtered suggestions based on what's being typed
  const filteredSuggestions = React.useMemo(() => {
    if (!suggestionFilter) return variables;
    
    return variables.filter(variable => {
      const searchText = `${variable.nodeId}.${variable.field}`.toLowerCase();
      return searchText.includes(suggestionFilter.toLowerCase());
    });
  }, [variables, suggestionFilter]);
  
  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    
    // Update cursor position
    if (inputRef.current) {
      setCursorPosition(e.target.selectionStart || 0);
    }
    
    // Check if we're in a variable context
    const currentToken = getCurrentToken(newValue, e.target.selectionStart || 0);
    setSuggestionFilter(currentToken);
    
    // Show suggestions if we're typing a variable
    setShowSuggestions(currentToken.length > 0);
    setActiveSuggestion(0);
  };
  
  // Insert a variable at the current cursor position
  const insertVariable = (variable: Variable) => {
    if (!inputRef.current) return;
    
    const varText = `${variable.nodeId}.${variable.field}}}`;
    
    // Find the position to insert the variable (after the last {{)
    const textBeforeCursor = value.slice(0, cursorPosition);
    const openBraceIndex = textBeforeCursor.lastIndexOf('{{');
    
    if (openBraceIndex !== -1) {
      // Replace text between {{ and cursor with the variable
      const newValue = 
        value.slice(0, openBraceIndex + 2) + 
        " " + varText + 
        value.slice(cursorPosition);
      
      onChange(newValue);
      validateVariables(newValue); // Validate after insertion
      
      // Set the cursor position after the inserted variable
      const newPosition = openBraceIndex + varText.length + 3;
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          (inputRef.current as HTMLInputElement).setSelectionRange(newPosition, newPosition);
        }
      }, 0);
    }
    
    // Hide suggestions
    setShowSuggestions(false);
  };
  
  // Handle special keys (arrow keys, enter, escape)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    // If no suggestions or suggestions not shown, just return
    if (!showSuggestions || filteredSuggestions.length === 0) return;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveSuggestion(prev => 
          prev < filteredSuggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveSuggestion(prev => (prev > 0 ? prev - 1 : 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredSuggestions[activeSuggestion]) {
          insertVariable(filteredSuggestions[activeSuggestion]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setShowSuggestions(false);
        break;
      case '{':
        // If the user types {, check if they've already typed { before it
        if (value[cursorPosition - 1] === '{') {
          // Open suggestions
          setShowSuggestions(true);
        }
        break;
      default:
        break;
    }
  };
  
  // Close suggestions panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current && 
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Show tooltip when input is focused and hide after 3 seconds
  useEffect(() => {
    if (isFocused && !showSuggestions) {
      setShowTooltip(true);
      const timer = setTimeout(() => {
        setShowTooltip(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isFocused, showSuggestions]);

  // Handle variable button click
  const handleVariableButtonClick = () => {
    if (!inputRef.current) return;
    
    inputRef.current.focus();
    const currentPos = inputRef.current.selectionStart || 0;
    const newValue = value.slice(0, currentPos) + '{{ ' + value.slice(currentPos);
    onChange(newValue);
    validateVariables(newValue); // Validate after button click insertion
    
    const newCursorPos = currentPos + 3;
    setCursorPosition(newCursorPos);
    setShowSuggestions(true);
    setSuggestionFilter('');
    
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        (inputRef.current as HTMLInputElement).setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 10);
  };
  
  // Render the input
  const renderInput = () => {
    const inputProps = {
      ref: inputRef as any,
      value,
      onChange: handleInputChange,
      onKeyDown: handleKeyDown,
      onFocus: () => setIsFocused(true),
      onBlur: () => setIsFocused(false),
      onClick: (e: React.MouseEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setCursorPosition(e.currentTarget.selectionStart || 0);
        
        const currentToken = getCurrentToken(value, e.currentTarget.selectionStart || 0);
        if (currentToken.length > 0) {
          setShowSuggestions(true);
          setSuggestionFilter(currentToken);
        }
      },
      placeholder,
      disabled,
      className: `w-full rounded-lg px-4 py-3 text-sm ${
        isLight 
          ? 'bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:bg-blue-50/30' 
          : 'bg-slate-800 border-slate-600 text-white focus:border-blue-500 focus:bg-blue-900/30'
      } border-2 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all duration-200 ${className}`
    };
    
    return multiline ? (
      <textarea 
        {...inputProps}
        rows={rows}
        style={{ resize: 'vertical', minHeight: '100px' }}
      />
    ) : (
      <input
        type="text"
        {...inputProps}
      />
    );
  };
  
  return (
    <div className="relative w-full">
      {label && (
        <label htmlFor={name} className={`block text-sm font-medium mb-2 ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>
          {label}
        </label>
      )}
      
      <div className="relative">
        {renderInput()}
        
        {/* Variable insertion button */}
        <button
          type="button"
          onClick={handleVariableButtonClick}
          className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full ${ 
            isLight 
              ? 'hover:bg-gray-200' 
              : 'hover:bg-slate-700' 
          } flex items-center group transition-all duration-200 ${multiline ? 'top-6' : ''}`}
          title="Insert variable"
        >
          <Braces size={18} className="text-gray-600 group-hover:text-blue-600 transition-colors" />
        </button>
        
        {/* Type indicator tooltip */}
        {showTooltip && (
          <div className={`absolute left-0 -top-10 z-10 p-2 rounded-lg shadow-lg text-xs ${ // Adjusted tooltip position and styling
            isLight 
              ? 'bg-gray-700 text-white border border-gray-800' 
              : 'bg-slate-200 text-slate-800 border border-slate-300'
          }`}>
            <div className="flex items-center">
              <Braces className="h-3 w-3 mr-1.5" /> {/* Changed icon to Braces */}
              Type <code className={`mx-1 px-1 rounded ${isLight ? 'bg-gray-600' : 'bg-slate-300'}`}>{'{{'}</code> 
              to insert variables
            </div>
          </div>
        )}
      </div>

      {/* Display variable error message */}
      {variableError && (
        <div className="mt-2 flex items-center p-2 rounded-md border border-red-500/50 bg-red-500/10 text-red-700 dark:text-red-400 dark:bg-red-900/20 dark:border-red-500/30">
          <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0" />
          <p className="text-xs">{variableError}</p>
        </div>
      )}
      
      {/* Helper text */}
      {helperText && !variableError && (
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">{helperText}</p>
      )}
      
      {/* Suggestions dropdown */} organisme
      {showSuggestions && (
        <div 
          ref={suggestionsRef}
          className={`absolute z-50 mt-2 max-h-80 w-full overflow-auto rounded-lg shadow-xl border-2 ${
            isLight 
              ? 'bg-white text-gray-900 border-gray-200' 
              : 'bg-slate-800 text-white border-slate-600'
          }`}
        >
          <div className={`sticky top-0 px-4 py-3 text-xs font-semibold border-b ${ // Made font semibold
            isLight ? 'bg-gray-100 border-gray-300 text-gray-800' : 'bg-slate-700 border-slate-500 text-slate-200'
          }`}>
            <div className="flex items-center justify-between">
              <span>Available variables</span>
              <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                {filteredSuggestions.length}
              </span>
            </div>
          </div>
          
          {filteredSuggestions.length > 0 ? (
            <div className="py-2">
              {filteredSuggestions.map((variable, index) => (
                <div
                  key={`${variable.nodeId}.${variable.field}`}
                  data-index={index}
                  className={`px-4 py-3 cursor-pointer transition-colors ${
                    index === activeSuggestion 
                      ? (isLight ? 'bg-blue-100 border-l-4 border-blue-500' : 'bg-blue-900/40 border-l-4 border-blue-400') 
                      : 'hover:bg-gray-100 dark:hover:bg-slate-700'
                  } flex items-center`}
                  onClick={() => insertVariable(variable)}
                >
                  <div className="flex-1">
                    <div className="flex items-baseline mb-0.5">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mr-2 ${ // Enhanced pill styling
                        isLight ? 'bg-blue-100 text-blue-700 border border-blue-300' : 'bg-blue-600/30 text-blue-300 border border-blue-500/50'
                      }`}>
                        {variable.nodeId}<span className="opacity-60">.</span>{variable.field}
                      </span>
                      <span className={`font-medium text-sm ${isLight ? 'text-gray-800' : 'text-gray-200'}`}> {/* Made label more prominent */}
                        {variable.label}
                      </span>
                    </div>
                    <div className={`text-xs ml-1 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}> {/* Adjusted description alignment and color */}
                      {variable.description}
                    </div>
                  </div>
                  <div className={`ml-3 text-xs px-2.5 py-1 rounded-md font-medium ${ // Enhanced insert button styling
                    index === activeSuggestion 
                      ? (isLight ? 'bg-blue-500 text-white' : 'bg-blue-500 text-white') 
                      : (isLight ? 'bg-gray-200 text-gray-700 group-hover:bg-blue-500 group-hover:text-white' : 'bg-slate-600 text-slate-200 group-hover:bg-blue-500 group-hover:text-white')
                  } transition-colors duration-150`}>
                    Insert
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
              <Braces className="h-10 w-10 mx-auto mb-3 opacity-40" /> {/* Changed icon to Braces */}
              <p className="font-medium">No Matching Variables</p>
              <p className="text-xs mt-1">Try a different search or ensure nodes are configured.</p>
            </div>
          )}
        </div>
      )}
      
      {helperText && (
        <div className="mt-2 flex items-start">
          <Lightbulb className={`h-4 w-4 mt-0.5 mr-2 ${isLight ? 'text-blue-500' : 'text-blue-400'}`} />
          <p className={`text-xs ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
            {helperText}
          </p>
        </div>
      )}
    </div>
  );
};