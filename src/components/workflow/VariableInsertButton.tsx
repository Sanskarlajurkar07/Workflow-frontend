import React, { useState, useRef, useEffect } from 'react'; // Added useRef, useEffect
import { Braces } from 'lucide-react';
import { useFlowStore } from '../../store/flowStore';
import { useTheme } from '../../utils/themeProvider'; // Added useTheme
import { FlowNode } from '../../types/flow';

interface VariableInsertButtonProps {
  fieldName: string;
  currentValue: string;
  onInsert: (value: string) => void;
  buttonClassName?: string;
  popupClassName?: string;
}

/**
 * A reusable component that adds variable insertion capability to any input field
 */
export const VariableInsertButton: React.FC<VariableInsertButtonProps> = ({
  fieldName,
  currentValue,
  onInsert,
  buttonClassName,
  popupClassName
}) => {
  const [showVariables, setShowVariables] = useState(false);
  const { nodes } = useFlowStore(); // Removed unused 'edges'
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const popupRef = useRef<HTMLDivElement>(null);

  // Default button class if not provided
  const defaultButtonClassName = `p-1 rounded-full ${isLight ? 'hover:bg-gray-200' : 'hover:bg-slate-700'} transition-colors`;
  const finalButtonClassName = buttonClassName || defaultButtonClassName;

  // Default popup class if not provided
  const defaultPopupClassName = `absolute z-50 mt-2 p-3 rounded-lg shadow-xl border ${ 
    isLight 
      ? 'bg-white text-gray-900 border-gray-200' 
      : 'bg-slate-800 text-white border-slate-600'
  } w-72`; // Added w-72 for a fixed width
  const finalPopupClassName = popupClassName || defaultPopupClassName;

  // Get available variables from connected nodes
  const getAvailableVariables = () => {
    // Start with some common variables
    const variables = [
      { nodeId: 'workflow', field: 'input', name: 'workflow.input', description: 'Main workflow input' },
      { nodeId: 'workflow', field: 'variables', name: 'workflow.variables', description: 'Workflow variables' }
    ];

    // Add variables from all nodes
    nodes.forEach((node: FlowNode) => {
      if (node.data?.params?.nodeName) {
        const nodeName = node.data.params.nodeName;
        
        // Determine likely output fields based on node type
        let outputFields = ['output'];
        
        // Check if node is an AI type node
        const nodeType = node.type || '';
        if (nodeType.includes('ai') || 
            nodeType.includes('openai') || 
            nodeType.includes('anthropic') || 
            nodeType.includes('gemini')) {
          outputFields = ['response', 'output'];
        } else if (nodeType.includes('text')) {
          outputFields = ['text', 'output'];
        } else if (nodeType === 'json_handler') {
          outputFields = ['json', 'output'];
        } else if (nodeType === 'audio-processor') {
          outputFields = ['text', 'output'];
        } else if (nodeType === 'image-processor') {
          outputFields = ['text', 'analysis', 'output'];
        }

        // Add each output field as a variable
        outputFields.forEach(field => {
          variables.push({
            nodeId: nodeName,
            field,
            name: `${nodeName}.${field}`,
            description: `Output from ${nodeName}`
          });
        });
      }
    });

    return variables;
  };

  const handleInsertVariable = (variable: string) => {
    // Insert variable at the end or at cursor position
    // Insert variable at the end or at cursor position (simplified for this component)
    const currentVal = currentValue || '';
    const separator = currentVal.endsWith(' ') || currentVal === '' || currentVal.endsWith('{{') ? '' : ' ';
    onInsert(`${currentVal}${separator}{{${variable}}}`);
    setShowVariables(false);
  };

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        // Also check if the click was on the button itself to prevent immediate closing
        const buttonElement = popupRef.current.previousElementSibling;
        if (buttonElement && !buttonElement.contains(event.target as Node)) {
          setShowVariables(false);
        }
      }
    };

    if (showVariables) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showVariables]);

  return (
    <div className="relative">
      <button 
        type="button"
        className={finalButtonClassName} // Use finalButtonClassName
        onClick={() => setShowVariables(prev => !prev)} // Toggle based on previous state
        title="Insert Variable"
      >
        <Braces size={18} className={`${isLight ? 'text-gray-600 group-hover:text-blue-600' : 'text-slate-400 group-hover:text-blue-400'} transition-colors`} />
      </button>
      
      {showVariables && (
        <div ref={popupRef} className={finalPopupClassName}> {/* Use finalPopupClassName and add ref */}
          <div className={`text-xs font-semibold mb-2 pb-2 border-b ${isLight ? 'text-gray-700 border-gray-200' : 'text-slate-300 border-slate-600'}`}>Insert a variable:</div>
          <div className="flex flex-col gap-1.5 max-h-60 overflow-y-auto pr-1"> {/* Changed to flex-col and added pr-1 for scrollbar */} 
            {getAvailableVariables().map(variable => (
              <button
                key={variable.name}
                onClick={() => handleInsertVariable(variable.name)}
                className={`w-full text-left px-2.5 py-1.5 text-xs rounded-md transition-colors ${ 
                  isLight 
                    ? 'bg-gray-50 text-gray-800 hover:bg-blue-100 hover:text-blue-700 border border-gray-200 hover:border-blue-300'
                    : 'bg-slate-700 text-slate-200 hover:bg-blue-600/30 hover:text-blue-300 border border-slate-600 hover:border-blue-500/50'
                }`}
                title={variable.description}
              >
                <span className={`font-medium ${isLight ? 'text-blue-600' : 'text-blue-400'}`}>{variable.nodeId}</span>
                <span className={`opacity-70 ${isLight ? 'text-gray-500' : 'text-slate-400'}`}>.</span>
                <span className={`font-semibold ${isLight ? 'text-gray-700' : 'text-slate-200'}`}>{variable.field}</span>
                {variable.description && <p className={`mt-0.5 text-xxs ${isLight ? 'text-gray-500' : 'text-slate-400'}`}>{variable.description}</p>} 
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};