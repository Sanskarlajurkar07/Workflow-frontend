import React, { useState, useEffect } from 'react';
import { Handle, Position } from 'reactflow';
import { Trash2, Settings, Eye, ArrowRight, Variable, Box, AlertTriangle, CheckCircle } from 'lucide-react';
import { useFlowStore } from '../../../../store/flowStore';
import AutocompleteInput from '../../AutocompleteInput';
import { VariableHighlighter } from '../../VariableHighlighter';

interface OutputNodeProps {
  id: string;
  data: {
    params?: {
      fieldName?: string;
      type?: string;
      output?: string;
      showSettings?: boolean;
      description?: string;
    };
  };
  selected?: boolean;
}

const outputTypeColors = {
  'Text': { bg: 'bg-blue-100', text: 'text-blue-800', icon: <ArrowRight className="w-4 h-4" /> },
  'Image': { bg: 'bg-purple-100', text: 'text-purple-800', icon: <Eye className="w-4 h-4" /> },
  'Formatted Text': { bg: 'bg-emerald-100', text: 'text-emerald-800', icon: <ArrowRight className="w-4 h-4" /> },
  'Audio': { bg: 'bg-amber-100', text: 'text-amber-800', icon: <ArrowRight className="w-4 h-4" /> },
  'JSON': { bg: 'bg-gray-100', text: 'text-gray-800', icon: <Box className="w-4 h-4" /> },
  'File': { bg: 'bg-indigo-100', text: 'text-indigo-800', icon: <ArrowRight className="w-4 h-4" /> },
};

// Explicit border removal styles
const nodeBorderStyles = {
  border: 'none',
  outline: 'none',
  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  borderWidth: '0',
  borderStyle: 'none',
  borderColor: 'transparent'
};

// Custom CSS for the component
const customStyles = {
  autocompleteDropdown: {
    zIndex: 40,
    maxHeight: '300px',
    overflowY: 'auto'
  },
  outputNodeWrapper: {
    border: 'none',
    outline: 'none',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
  }
};

const OutputNode: React.FC<OutputNodeProps> = ({ id, data, selected }) => {
  const removeNode = useFlowStore((state) => state.removeNode);
  const updateNodeData = useFlowStore((state) => state.updateNodeData);
  const [showPreview, setShowPreview] = useState(false);
  const { nodes, edges } = useFlowStore();

  useEffect(() => {
    // Set default name if not already set
    if (!data.params?.fieldName) {
      const defaultName = id.replace('output-', 'output_');
      updateNodeData(id, { fieldName: defaultName });
    }
    
    // Add inline styles to remove borders via DOM when component mounts
    const nodeElement = document.getElementById(`output-node-${id}`);
    if (nodeElement) {
      Object.assign(nodeElement.style, nodeBorderStyles);
    }
    
    // Add global style to fix ReactFlow node border issues
    const styleEl = document.createElement('style');
    styleEl.innerHTML = `
      .output-node-wrapper {
        border: none !important;
        outline: none !important;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
      }
      
      .react-flow__node {
        border: none !important;
        outline: none !important;
      }
      
      .variable-input-container [class*="focus:border"] {
        border-color: transparent !important;
      }
      
      .autocomplete-wrapper .absolute {
        z-index: 40 !important;
        max-height: 300px !important;
        overflow-y: auto !important;
      }
    `;
    document.head.appendChild(styleEl);
    
    // Clean up style element when component unmounts
    return () => {
      document.head.removeChild(styleEl);
    };
  }, [id, data.params?.fieldName, updateNodeData]);

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this output node?')) {
      removeNode(id);
    }
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateNodeData(id, { type: e.target.value });
  };

  const handleVariableChange = (value: string) => {
    updateNodeData(id, { output: value });
  };

  const validateVariable = (variable: string): boolean => {
    if (!variable) return false;
    const variableRegex = /\{\{([a-zA-Z0-9_]+)\.([a-zA-Z0-9_]+)\}\}/;
    return variableRegex.test(variable);
  };

  const getConnectedNodes = () => {
    return edges
      .filter(edge => edge.target === id)
      .map(edge => edge.source)
      .map(sourceId => nodes.find(node => node.id === sourceId))
      .filter(Boolean);
  };

  const connectedNodes = getConnectedNodes();
  const variableName = data.params?.fieldName || id.replace('output-', 'output_');
  const selectedType = data.params?.type || 'Text';
  const typeStyle = outputTypeColors[selectedType as keyof typeof outputTypeColors] || outputTypeColors['Text'];

  return (
    <div
      id={`output-node-${id}`}
      className="output-node-wrapper relative bg-white rounded-xl shadow-xl overflow-hidden w-[375px]"
      style={nodeBorderStyles}
    >
      {selected && (
        <div className="absolute inset-0 ring-4 ring-blue-400/30 rounded-xl pointer-events-none" />
      )}
      
      {!data.params?.output && (
        <div className="absolute inset-0 ring-1 ring-red-300 rounded-xl pointer-events-none" />
      )}

      {/* Header - Increased height and element sizes */}
      <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-blue-500 to-blue-600">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-md bg-white/20 flex items-center justify-center">
            <Box className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="text-base font-medium text-white">Output Node</div>
            <div className="text-sm text-blue-100">
              {variableName}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => updateNodeData(id, { showSettings: !data.params?.showSettings })}
            className="p-2 rounded-md text-white/70 hover:text-white hover:bg-white/20"
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
          <button
            onClick={handleDelete}
            className="p-2 rounded-md text-white/70 hover:text-white hover:bg-red-400/30"
            title="Delete"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content - Increased padding and spacing */}
      <div className="p-5 space-y-5">
        {/* Connection Status */}
        <div>
          <label className="text-sm font-medium text-gray-600 flex items-center justify-between mb-2">
            <span>Connected Inputs</span>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
              connectedNodes.length > 0 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
            }`}>
              {connectedNodes.length > 0 ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-1.5" />
                  {connectedNodes.length} {connectedNodes.length === 1 ? 'source' : 'sources'}
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 mr-1.5" />
                  No connections
                </>
              )}
            </span>
          </label>
          
          {connectedNodes.length > 0 && (
            <div className="mt-2 p-3 bg-gray-50 rounded-md" style={{ border: '1px solid #e5e7eb' }}>
              <ul className="space-y-2">
                {connectedNodes.map((node: any) => (
                  <li key={node.id} className="flex items-center text-sm">
                    <span className="w-2.5 h-2.5 bg-blue-500 rounded-full mr-2"></span>
                    <span className="font-medium">{node.data.params?.nodeName || node.id}</span>
                    <span className="text-gray-500 ml-1.5">({node.type})</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Variable Name - Increased input sizing */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Variable Name</label>
          <div className="flex">
            <div className="relative flex-1">
              <input
                type="text"
                value={variableName}
                onChange={(e) => updateNodeData(id, { fieldName: e.target.value })}
                className="w-full text-base rounded-md px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                style={{ border: '1px solid #d1d5db' }}
              />
            </div>
            <div className="ml-2 px-4 py-2.5 bg-gray-100 text-gray-600 rounded-md text-base min-w-[100px] text-center"
                 style={{ border: '1px solid #d1d5db' }}>
              {variableName}
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-1">Unique identifier for this output node</p>
        </div>
        
        {/* Description - Increased input height */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Description (optional)</label>
          <input
            type="text"
            value={data.params?.description || ''}
            onChange={(e) => updateNodeData(id, { description: e.target.value })}
            placeholder="What this output represents"
            className="w-full text-base rounded-md px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none" 
            style={{ border: '1px solid #d1d5db' }}
          />
        </div>

        {/* Type Dropdown - Larger select with more padding */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Output Type</label>
          <div className="relative">
            <select
              value={selectedType}
              onChange={handleTypeChange}
              className="w-full text-base rounded-md px-4 py-2.5 appearance-none focus:ring-2 focus:ring-blue-500 focus:outline-none"
              style={{ border: '1px solid #d1d5db' }}
            >
              {Object.keys(outputTypeColors).map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <div className="absolute right-3 top-3 pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          
          <div className={`inline-flex items-center mt-1 px-3 py-1.5 rounded-md ${typeStyle.bg} ${typeStyle.text}`}>
            {typeStyle.icon}
            <span className="text-sm font-medium ml-1.5">{selectedType}</span>
          </div>
        </div>

        {/* Output Variable Field - SIGNIFICANTLY enlarged for better visibility */}
        <div className="space-y-2">
          <label className="block text-base font-medium text-gray-700 mb-1">Output Value *</label>
          
          <div className="variable-input-container bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-lg" 
               style={{ border: '1px solid #bfdbfe' }}>
            {/* Made the input field much larger and more prominent */}
            <div className="relative rounded-md overflow-visible mb-3 z-10" 
                 style={{ border: '2px solid #93c5fd', borderRadius: '0.375rem' }}>
              <div className="autocomplete-wrapper" style={{ position: 'relative', zIndex: 30 }}>
                <AutocompleteInput
                  value={data.params?.output || ''}
                  onChange={handleVariableChange}
                  placeholder='Use {{ nodeName.outputField }} format'
                  className="bg-white text-base py-3.5 z-20 border-none"
                />
              </div>
            </div>
            
            {/* Variable preview - Bigger button */}
            {data.params?.output && (
              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => setShowPreview(!showPreview)}
                  className="flex items-center text-sm text-blue-600 hover:text-blue-800 mb-2 px-3 py-1.5 hover:bg-blue-50 rounded-md transition-colors"
                  style={{ border: 'none' }}
                >
                  <Eye className="w-4 h-4 mr-1.5" />
                  {showPreview ? "Hide preview" : "Show variable preview"}
                </button>
                
                {showPreview && (
                  <div className="p-3 bg-white/90 rounded-md" style={{ border: '1px solid #bfdbfe' }}>
                    <VariableHighlighter 
                      text={data.params.output} 
                      className="text-base text-gray-700"
                    />
                  </div>
                )}
              </div>
            )}
            
            {/* Validation feedback - Increased padding */}
            {data.params?.output && !validateVariable(data.params.output) && (
              <div className="flex items-start mt-3 p-3 bg-red-50 rounded-md text-sm text-red-700"
                   style={{ border: '1px solid #fecaca' }}>
                <AlertTriangle className="w-4 h-4 mt-0.5 mr-2 flex-shrink-0 text-red-500" />
                <div>
                  <p className="font-medium">Invalid format</p>
                  <p className="mt-1">Use the format <code className="px-1.5 py-0.5 bg-red-100 rounded">&#123;&#123;nodeName.field&#125;&#125;</code></p>
                </div>
              </div>
            )}
            
            {!data.params?.output && (
              <div className="flex items-start mt-3 p-3 bg-yellow-50 rounded-md text-sm text-yellow-700"
                   style={{ border: '1px solid #fef3c7' }}>
                <AlertTriangle className="w-4 h-4 mt-0.5 mr-2 flex-shrink-0 text-yellow-500" />
                <div>
                  <p className="font-medium">Required field</p>
                  <p className="mt-1">Select an input source using the Variables button</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Handle - Increased size */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-4 h-4 -ml-0.5 bg-blue-500 rounded-full"
        style={{ top: '50%', border: '2px solid white' }}
      />
    </div>
  );
};

export default OutputNode;