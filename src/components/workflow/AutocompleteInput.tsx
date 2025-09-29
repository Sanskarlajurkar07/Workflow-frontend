import React, { useState, useRef, useEffect } from 'react';
import { useFlowStore } from '../../store/flowStore';
import { ChevronDown, Variable } from 'lucide-react';
import { useTheme } from '../../utils/themeProvider';

interface Variable {
  nodeId: string;
  field: string;
  label: string;
  description: string;
}

interface AutocompleteInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  multiline?: boolean;
  rows?: number;
}

export const AutocompleteInput: React.FC<AutocompleteInputProps> = ({
  value,
  onChange,
  placeholder = 'Enter text...',
  className = '',
  multiline = false,
  rows = 3
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [suggestionFilter, setSuggestionFilter] = useState('');
  const [activeSuggestion, setActiveSuggestion] = useState(0);
  const [showTooltip, setShowTooltip] = useState(false);
  
  const { theme } = useTheme();
  const isLight = theme === 'light';
  
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  
  // Get nodes from the flow store
  const nodes = useFlowStore(state => state.nodes);
  
  // Generate variables from nodes
  const variables: Variable[] = React.useMemo(() => {
    const vars: Variable[] = [];
    
    nodes.forEach(node => {
      // Default fields based on node type
      let fields: string[] = ['output'];
      let description = 'Node output';
      
      // Customize based on node type
      const nodeType = node.type || '';
      if (nodeType === 'input') {
        const inputType = node.data?.params?.type || 'Text';
        switch (inputType) {
          case 'Text':
            fields = ['text'];
            description = 'Text input from this node';
            break;
          case 'Image':
            fields = ['image'];
            description = 'Image input from this node';
            break;
          case 'Audio':
            fields = ['audio'];
            description = 'Audio input from this node';
            break;
          case 'File':
            fields = ['file'];
            description = 'File input from this node';
            break;
          case 'JSON':
            fields = ['json'];
            description = 'JSON input from this node';
            break;
          default:
            fields = ['text'];
            description = 'Text input from this node';
        }
      } else if (nodeType.includes('openai') || nodeType.includes('anthropic') || nodeType.includes('gemini')) {
        fields = ['response', 'full_response'];
        description = 'AI model response';
      } else if (nodeType === 'transform') {
        fields = ['output', 'transformed_text'];
        description = 'Transformed text output';
      } else if (nodeType === 'kb-search') {
        fields = ['results', 'metadata'];
        description = 'Knowledge base search results';
      }
      
      // Use node data for fields if available
      const nodeData = node.data as any;
      if (nodeData?.outputFields && Array.isArray(nodeData.outputFields)) {
        fields = nodeData.outputFields;
      }
      
      const nodeId = node.id.includes('_') 
        ? node.id 
        : `${node.type}_${node.id.replace(`${node.type}-`, '')}`;
      
      const nodeLabel = node.data?.label || nodeId;
      
      fields.forEach(field => {
        vars.push({
          nodeId,
          field,
          label: `${nodeLabel} (${field})`,
          description
        });
      });
    });
    
    return vars;
  }, [nodes]);
  
  // Find the current token being typed (for variable suggestion)
  const getCurrentToken = (text: string, position: number): string => {
    // Look for {{ in the text before the cursor
    const textBeforeCursor = text.slice(0, position);
    const openBraceIndex = textBeforeCursor.lastIndexOf('{{');
    
    // If we find {{ and don't find a closing }} between it and the cursor
    if (openBraceIndex !== -1) {
      const closeBraceIndex = textBeforeCursor.indexOf('}}', openBraceIndex);
      if (closeBraceIndex === -1) {
        // Extract what's being typed after {{
        return textBeforeCursor.slice(openBraceIndex + 2).trim();
      }
    }
    
    return '';
  };
  
  // Get filtered suggestions based on what's being typed
  const filteredSuggestions = React.useMemo(() => {
    if (!suggestionFilter) return variables;
    
    // Filter variables that match the current token
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
    
    const varText = `${variable.nodeId}.${variable.field}}`;
    
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
      
      // Set the cursor position after the inserted variable
      const newPosition = openBraceIndex + varText.length + 3; // +3 for {{ and space
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
  
  // Autofocus on suggestion when it changes
  useEffect(() => {
    if (showSuggestions && suggestionsRef.current) {
      const activeElement = suggestionsRef.current.querySelector(
        `[data-index="${activeSuggestion}"]`
      );
      
      if (activeElement) {
        activeElement.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth'
        });
      }
    }
  }, [activeSuggestion, showSuggestions]);
  
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

  // Handle variable button click - Enhanced to ensure suggestion box appears
  const handleVariableButtonClick = () => {
    if (!inputRef.current) return;
    
    // Focus the input first
    inputRef.current.focus();
    
    // Get current cursor position
    const currentPos = inputRef.current.selectionStart || 0;
    
    // Insert {{ at current position
    const newValue = value.slice(0, currentPos) + '{{ ' + value.slice(currentPos);
    onChange(newValue);
    
    // Update cursor position
    const newCursorPos = currentPos + 3; // +3 for {{ and space
    setCursorPosition(newCursorPos);
    
    // Force show suggestions
    setShowSuggestions(true);
    setSuggestionFilter('');
    
    // Set cursor position after {{ with a slight delay to ensure React updates
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        (inputRef.current as HTMLInputElement).setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 10);
  };
  
  // Render the input (textarea or input based on multiline prop)
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
        
        // Check if we're in a variable context
        const currentToken = getCurrentToken(value, e.currentTarget.selectionStart || 0);
        if (currentToken.length > 0) {
          setShowSuggestions(true);
          setSuggestionFilter(currentToken);
        }
      },
      placeholder,
      className: `w-full rounded-md px-3 py-2 ${
        isLight 
          ? 'bg-white border-gray-300 text-gray-900 focus:border-blue-500' 
          : 'bg-slate-800 border-slate-600 text-white focus:border-blue-500'
      } border focus:ring-1 focus:ring-blue-500 outline-none ${className}`
    };
    
    return multiline ? (
      <textarea 
        {...inputProps}
        rows={rows}
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
      {renderInput()}
      
      {/* Type indicator tooltip */}
      {showTooltip && (
        <div className={`absolute left-0 -top-8 z-10 p-2 rounded-md shadow-md text-xs animate-pulse ${
          isLight 
            ? 'bg-blue-100 text-blue-800 border border-blue-200' 
            : 'bg-blue-900/30 text-blue-300 border border-blue-800/30'
        }`}>
          <div className="flex items-center">
            <Variable className="h-3 w-3 mr-1" />
            Type <code className="mx-1 px-1 bg-blue-50 dark:bg-blue-900/50 rounded">{'{{'}</code> 
            to insert variables
          </div>
        </div>
      )}
      
      {/* Enhanced Variable suggestion button with more obvious styling */}
      <button
        type="button"
        onClick={handleVariableButtonClick}
        className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5 rounded-md ${
          isLight 
            ? 'bg-blue-100 text-blue-600 hover:bg-blue-200 border border-blue-200 hover:shadow-md' 
            : 'bg-blue-900/30 text-blue-400 hover:bg-blue-900/40 border border-blue-800/30 hover:shadow-md'
        } flex items-center group transition-all duration-150`}
        title="Insert variable"
      >
        <Variable className="h-4 w-4 mr-1 group-hover:animate-pulse" />
        <span className="text-xs font-medium">Variables</span>
        <ChevronDown className="h-3 w-3 ml-1 group-hover:translate-y-0.5 transition-transform duration-200" />
      </button>
      
      {/* Suggestions dropdown - improved styling and categorization */}
      {showSuggestions && (
        <div 
          ref={suggestionsRef}
          className={`absolute z-50 mt-1 max-h-72 w-full overflow-auto rounded-md py-1 ${
            isLight 
              ? 'bg-white text-gray-900 shadow-lg border border-gray-200' 
              : 'bg-slate-800 text-white shadow-lg border border-slate-700'
          }`}
        >
          <div className={`sticky top-0 px-3 py-2 text-xs font-medium ${
            isLight ? 'bg-gray-50 border-b border-gray-200' : 'bg-slate-700/50 border-b border-slate-600'
          }`}>
            <div className="flex items-center justify-between">
              <span>Available variables</span>
              <span className="px-1.5 py-0.5 rounded-full text-xs bg-blue-100 text-blue-800">
                {filteredSuggestions.length}
              </span>
            </div>
          </div>
          
          {filteredSuggestions.length > 0 ? (
            /* Group variables by node type */
            (() => {
              // Group variables by node type for better organization
              const groups: Record<string, Variable[]> = {};
              
              filteredSuggestions.forEach(variable => {
                const nodeType = variable.nodeId.split('_')[0];
                if (!groups[nodeType]) groups[nodeType] = [];
                groups[nodeType].push(variable);
              });
              
              return Object.entries(groups).map(([nodeType, variables]) => (
                <div key={nodeType} className="py-1">
                  <div className={`px-3 py-1 text-xs font-semibold uppercase ${
                    isLight ? 'text-gray-500 bg-gray-50' : 'text-gray-400 bg-slate-700/30'
                  }`}>
                    {nodeType}
                  </div>
                  
                  {variables.map((variable, index) => {
                    const globalIndex = filteredSuggestions.findIndex(
                      v => v.nodeId === variable.nodeId && v.field === variable.field
                    );
                    
                    return (
                      <div
                        key={`${variable.nodeId}.${variable.field}`}
                        data-index={globalIndex}
                        className={`px-3 py-2 cursor-pointer ${
                          globalIndex === activeSuggestion 
                            ? (isLight ? 'bg-blue-100' : 'bg-blue-900/30') 
                            : 'hover:bg-gray-100 dark:hover:bg-slate-700'
                        } flex items-center`}
                        onClick={() => insertVariable(variable)}
                      >
                        <div className="flex-1">
                          <div className="font-medium flex items-center">
                            {/* Show a preview of how the variable will look */}
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200 mr-2">
                              {variable.nodeId}
                              <span className="mx-0.5 text-blue-500">.</span>
                              <span className="font-semibold">{variable.field}</span>
                            </span>
                            <span className="text-xs opacity-70">{variable.label}</span>
                          </div>
                          <div className={`text-xs ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
                            {variable.description}
                          </div>
                        </div>
                        <div className={`ml-2 text-xs px-1.5 py-0.5 rounded ${
                          isLight ? 'bg-gray-100 text-gray-700' : 'bg-slate-700 text-gray-300'
                        }`}>
                          Insert
                        </div>
                      </div>
                    );
                  })}
                </div>
              ));
            })()
          ) : (
            <div className="px-3 py-4 text-center text-sm text-gray-500">
              No variables available. Connect some nodes to use their outputs.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AutocompleteInput; 