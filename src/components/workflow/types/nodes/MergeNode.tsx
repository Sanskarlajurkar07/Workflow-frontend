import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { Trash2, Settings, GitMerge, Plus, ChevronDown, Info, HelpCircle, Code, Clipboard, ArrowDown, Tag } from 'lucide-react';
import { useFlowStore } from '../../../../store/flowStore';

// Available merge functions with descriptions
const MERGE_FUNCTIONS = [
  { value: 'Pick First', description: 'Use the first non-null value from specified paths' },
  { value: 'Join All', description: 'Join values from all paths (text concatenation or numeric sum)' },
  { value: 'Concatenate Arrays', description: 'Combine arrays from different paths into a single array' },
  { value: 'Merge Objects', description: 'Deep merge objects from selected paths' },
  { value: 'Average', description: 'Calculate the average of numeric values' },
  { value: 'Min', description: 'Find the minimum value' },
  { value: 'Max', description: 'Find the maximum value' },
  { value: 'Create Object', description: 'Create a new object with keys from path names' }
];

// Available data types with descriptions
const DATA_TYPES = [
  { value: 'Text', description: 'String values' },
  { value: 'Integer', description: 'Whole numbers' },
  { value: 'Float', description: 'Decimal numbers' },
  { value: 'Boolean', description: 'True/false values' },
  { value: 'Any', description: 'Any type of data' },
  { value: 'JSON', description: 'JSON structured data' },
  { value: 'Array', description: 'List of values' },
  { value: 'Object', description: 'Key-value pairs' },
  { value: 'File', description: 'File data' },
  { value: 'Image', description: 'Image data' },
  { value: 'Audio', description: 'Audio data' },
  { value: 'Knowledge Base', description: 'KB data' }
];

// Variable suggestions
const VARIABLE_SUGGESTIONS = [
  '{{input}}',
  '{{input.data}}',
  '{{input.result}}',
  '{{workflow.variables.userValue}}',
  '{{previous.output}}'
];

interface MergeNodeProps {
  data: {
    params?: {
      nodeName?: string;
      showSettings?: boolean;
      type?: string;
      function?: string;
      paths?: string[];
      joinDelimiter?: string;
      variableName?: string;
    };
  };
  id: string;
  selected?: boolean;
}

const MergeNode: React.FC<MergeNodeProps> = ({ data, id, selected }) => {
  const removeNode = useFlowStore((state) => state.removeNode);
  const updateNodeData = useFlowStore((state) => state.updateNodeParams);
  const [showHelp, setShowHelp] = useState(false);
  const [showVariables, setShowVariables] = useState(false);
  const [variableName, setVariableName] = useState(data.params?.variableName || `merge_${id.substring(0, 4)}`);

  const handleDelete = () => {
    removeNode(id);
  };

  const toggleSettings = () => {
    updateNodeData(id, { showSettings: !data.params?.showSettings });
  };

  const insertVariable = (path: string, variable: string) => {
    updateNodeData(id, { 
      paths: (data.params?.paths || []).map((p, i) => 
        i.toString() === path ? variable : p
      )
    });
  };

  // Handle variable name change
  const handleVariableNameChange = (newName: string) => {
    setVariableName(newName);
    updateNodeData(id, { variableName: newName });
  };

  // Find if a function needs a delimiter
  const needsDelimiter = () => {
    return data.params?.function === 'Join All' && data.params?.type === 'Text';
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg overflow-hidden ${
      selected ? 'ring-2 ring-blue-500' : 'border border-gray-200'
    }`}>
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-purple-500 to-indigo-500 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
              <GitMerge className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-medium text-white">Merge Node</h3>
              <p className="text-xs text-purple-50/80">
                {data.params?.function || 'Path Combiner'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowHelp(!showHelp)}
              className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/20 transition-colors"
              title="Help"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
            <button
              onClick={toggleSettings}
              className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/20 transition-colors"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={handleDelete}
              className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-red-400/20 transition-colors"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Help Panel */}
      {showHelp && (
        <div className="p-4 bg-blue-50 border-b border-blue-100">
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-700 text-sm">About Merge Nodes</h4>
                <p className="text-xs text-blue-600">
                  Merge nodes combine data from different paths or process values through a selected function.
                  They're especially useful for combining results after condition nodes.
                </p>
              </div>
            </div>
            
            <div className="bg-white rounded-md p-3 text-xs space-y-2 border border-blue-100">
              <h5 className="font-medium text-blue-700">Available Functions</h5>
              <ul className="space-y-1 text-gray-600">
                {MERGE_FUNCTIONS.map(func => (
                  <li key={func.value} className="flex items-start gap-1">
                    <span className="font-medium">{func.value}:</span> 
                    <span>{func.description}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <button
              onClick={() => setShowHelp(false)}
              className="w-full text-blue-600 text-xs text-center hover:text-blue-700"
            >
              Close Help
            </button>
          </div>
        </div>
      )}

      {/* Settings Panel */}
      {data.params?.showSettings && (
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Node Name</label>
              <input
                type="text"
                value={data.params?.nodeName || 'merge_0'}
                onChange={(e) => updateNodeData(id, { nodeName: e.target.value })}
                className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="p-4 space-y-4">
        {/* Enhanced Variable Name Field */}
        <div className="p-3 border border-purple-200 bg-purple-50/50 rounded-lg mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Tag className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-gray-700">Variable Name</span>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3">
              <span className="text-purple-600 font-bold">&#123;&#123;</span>
            </div>
            <input
              type="text"
              value={variableName}
              onChange={(e) => handleVariableNameChange(e.target.value)}
              className="w-full pl-10 pr-10 py-2 text-sm border border-purple-200 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="merged_data"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <span className="text-purple-600 font-bold">&#125;&#125;</span>
            </div>
          </div>
          <div className="flex items-center mt-2">
            <Info className="w-4 h-4 text-purple-500 mr-1" />
            <span className="text-xs text-gray-600">Reference as: </span>
            <span className="ml-1 px-2 py-0.5 bg-purple-100 text-purple-700 rounded font-mono text-xs">{`{{${variableName}}}`}</span>
          </div>
        </div>
        
        {/* Type Selection with improved UI */}
        <div className="space-y-2">
          <label className="block text-xs font-medium text-gray-500">Output Data Type</label>
          <div className="relative">
            <select
              value={data.params?.type || 'Text'}
              onChange={(e) => updateNodeData(id, { type: e.target.value })}
              className="w-full appearance-none px-3 py-2 bg-white text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent pr-10"
            >
              {DATA_TYPES.map(type => (
                <option key={type.value} value={type.value} title={type.description}>
                  {type.value}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
          </div>
          <p className="text-xs text-gray-400 ml-1">
            {DATA_TYPES.find(t => t.value === (data.params?.type || 'Text'))?.description}
          </p>
        </div>

        {/* Merge Function with better UI */}
        <div className="space-y-2">
          <label className="block text-xs font-medium text-gray-500">Merge Function</label>
          <div className="grid grid-cols-2 gap-2">
            {MERGE_FUNCTIONS.slice(0, 4).map((func) => (
              <button
                key={func.value}
                onClick={() => updateNodeData(id, { function: func.value })}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  data.params?.function === func.value
                    ? 'bg-purple-100 text-purple-700 font-medium border border-purple-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-transparent'
                }`}
                title={func.description}
              >
                {func.value}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {MERGE_FUNCTIONS.slice(4).map((func) => (
              <button
                key={func.value}
                onClick={() => updateNodeData(id, { function: func.value })}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  data.params?.function === func.value
                    ? 'bg-purple-100 text-purple-700 font-medium border border-purple-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-transparent'
                }`}
                title={func.description}
              >
                {func.value}
              </button>
            ))}
          </div>
        </div>

        {/* Delimiter for Join All function */}
        {needsDelimiter() && (
          <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-500">Join Delimiter</label>
            <input
              type="text"
              value={data.params?.joinDelimiter || ' '}
              onChange={(e) => updateNodeData(id, { joinDelimiter: e.target.value })}
              className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Character(s) to join text with"
            />
            <div className="flex flex-wrap gap-2 mt-1">
              {[' ', ', ', ' - ', '. ', '\n', '|', ''].map((delimiter) => (
                <button
                  key={delimiter === '' ? 'empty' : delimiter}
                  onClick={() => updateNodeData(id, { joinDelimiter: delimiter })}
                  className="px-2 py-1 text-xs bg-gray-100 text-gray-700 hover:bg-gray-200 rounded"
                >
                  {delimiter === '' ? 'Empty' : delimiter === '\n' ? 'New Line' : `"${delimiter}"`}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Dynamic Paths with Variable Support */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-medium text-gray-500">Input Paths</label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowVariables(!showVariables)}
                className={`p-1.5 rounded text-xs ${
                  showVariables 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Code className="w-3 h-3 inline mr-1" />
                Variables
              </button>
              <span className="text-xs text-gray-400">{data.params?.paths?.length || 0} paths</span>
            </div>
          </div>
          
          {/* Variables Panel */}
          {showVariables && (
            <div className="bg-blue-50 p-3 rounded-md">
              <p className="text-xs text-blue-700 mb-2">Click to insert a variable:</p>
              <div className="flex flex-wrap gap-2">
                {VARIABLE_SUGGESTIONS.map(variable => (
                  <div key={variable} className="relative group">
                    <div className="absolute -bottom-1 left-0 right-0 invisible group-hover:visible">
                      <div className="flex justify-center">
                        <ArrowDown className="w-3 h-3 text-blue-500" />
                      </div>
                    </div>
                    <button
                      className="px-2 py-1 text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 rounded font-mono"
                      onClick={() => {
                        // Insert into the last active input or create a new path
                        const lastPath = data.params?.paths?.length ? (data.params.paths.length - 1).toString() : '0';
                        if (!data.params?.paths?.length) {
                          updateNodeData(id, { paths: [variable] });
                        } else {
                          insertVariable(lastPath, variable);
                        }
                      }}
                    >
                      {variable}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="space-y-2">
            {data.params?.paths?.map((path, index) => (
              <div key={index} className="flex items-center gap-2 group">
                <span className="text-xs font-medium text-gray-400 w-12">Path {index + 1}</span>
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={path}
                    onChange={(e) => {
                      const updatedPaths = [...(data.params?.paths || [])];
                      updatedPaths[index] = e.target.value;
                      updateNodeData(id, { paths: updatedPaths });
                    }}
                    className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder={`input.field${index + 1}`}
                  />
                  {showVariables && (
                    <div className="absolute top-1/2 right-2 transform -translate-y-1/2 flex">
                      {VARIABLE_SUGGESTIONS.map((variable, varIdx) => (
                        <button
                          key={varIdx}
                          className="p-1 text-xs text-blue-500 hover:text-blue-700 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => insertVariable(index.toString(), variable)}
                          title={variable}
                        >
                          {varIdx + 1}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => {
                    const updatedPaths = (data.params?.paths || []).filter((_, i) => i !== index);
                    updateNodeData(id, { paths: updatedPaths });
                  }}
                  className="p-1.5 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all rounded-full hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            {!data.params?.paths?.length && (
              <p className="text-xs text-amber-500 bg-amber-50 p-2 rounded">
                At least one path is required. Add a path to specify which data to merge.
              </p>
            )}
          </div>

          <button
            onClick={() => {
              const updatedPaths = [...(data.params?.paths || []), ''];
              updateNodeData(id, { paths: updatedPaths });
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-purple-600 hover:text-purple-700 border border-purple-200 hover:border-purple-300 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Path
          </button>
        </div>
      </div>

      {/* Enhanced Status Bar */}
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-xs">
        <span className="flex items-center gap-1">
          <span className={`w-2 h-2 rounded-full ${
            data.params?.paths?.length ? 'bg-green-500' : 'bg-amber-500'
          }`} />
          <span className={data.params?.paths?.length ? 'text-green-700' : 'text-amber-700'}>
            {data.params?.paths?.length ? 'Configured' : 'Needs configuration'}
          </span>
        </span>
        <span className="flex items-center gap-1">
          <span className="text-gray-500">Variable:</span>
          <span className="text-purple-700 font-medium">{variableName}</span>
        </span>
      </div>

      {/* Handles */}
      <Handle 
        type="target" 
        position={Position.Left} 
        style={{ background: '#6366f1' }} 
      />
      <Handle 
        type="source" 
        position={Position.Right} 
        style={{ background: '#8b5cf6' }} 
      />
    </div>
  );
};

export default MergeNode;