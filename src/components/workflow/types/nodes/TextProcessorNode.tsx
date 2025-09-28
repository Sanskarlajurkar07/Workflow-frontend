import React from 'react';
import { Handle, Position } from 'reactflow';
import { Trash2, Settings, FileText } from 'lucide-react';
import { useFlowStore } from '../../../../store/flowStore';

interface TextProcessorNodeProps {
  data: {
    params?: {
      nodeName?: string;
      showSettings?: boolean;
      operation?: string;
      items?: string[];
      text?: string;
      delimiter?: string;
      formatter?: string;
      replacements?: { find: string; replace: string }[];
    };
  };
  id: string;
  selected?: boolean;
}

const TextProcessorNode: React.FC<TextProcessorNodeProps> = ({ 
  data, 
  id, 
  selected 
}) => {
  // Get store functions
  const removeNode = useFlowStore((state) => state.removeNode);
  const updateNodeData = useFlowStore((state) => state.updateNodeData);

  // Handle functions
  const handleDelete = () => {
    removeNode(id);
  };

  const toggleSettings = () => {
    updateNodeData(id, { showSettings: !data.params?.showSettings });
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg overflow-hidden ${
      selected ? 'ring-2 ring-blue-500' : 'border border-gray-200'
    }`}>
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-500 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-medium text-white">Text Processor</h3>
              <p className="text-xs text-blue-50/80">
                {data.params?.operation?.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || 'No operation'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
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

      {/* Settings Panel */}
      {data.params?.showSettings && (
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Node Name</label>
              <input
                type="text"
                value={data.params?.nodeName || 'text_processor_0'}
                onChange={(e) => updateNodeData(id, { nodeName: e.target.value })}
                className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="p-4 space-y-4">
        {/* Info Box */}
        <div className="bg-blue-50 rounded-md p-3">
          <p className="text-xs text-blue-600">
            Process and manipulate text with various operations. Select an operation to begin.
          </p>
        </div>

        {/* Operation Selection */}
        <div className="space-y-2">
          <label className="block text-xs font-medium text-gray-500">Operation</label>
          <div className="grid grid-cols-2 gap-2">
            {['combine-text', 'split-text', 'text-formatter', 'find-and-replace'].map((op) => (
              <button
                key={op}
                onClick={() => updateNodeData(id, { operation: op })}
                className={`flex items-center justify-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                  data.params?.operation === op
                    ? 'bg-blue-100 text-blue-700 font-medium'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span>{op.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Content Based on Operation */}
        {data.params?.operation === 'combine-text' && (
          <div>
            <label className="block text-xs text-gray-500 mb-1">List</label>
            <div>
              {data.params?.items?.map((item: string, index: number) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <label className="block text-xs text-gray-500">{`Item ${index + 1}`}</label>
                  <input
                    type="text"
                    placeholder={`Item ${index + 1}`}
                    value={item || ''}
                    onChange={(e) => {
                      const updatedItems = [...(data.params?.items || [])];
                      updatedItems[index] = e.target.value;
                      updateNodeData(id, { items: updatedItems });
                    }}
                    className="flex-1 text-sm border border-gray-200 rounded px-2 py-1"
                  />
                  <button
                    onClick={() => {
                      const updatedItems = (data.params?.items || []).filter((_: string, i: number) => i !== index);
                      updateNodeData(id, { items: updatedItems });
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => {
                  const updatedItems = [...(data.params?.items || []), ''];
                  updateNodeData(id, { items: updatedItems });
                }}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                + Add Item
              </button>
            </div>
          </div>
        )}

        {data.params?.operation === 'split-text' && (
          <div>
            <label className="block text-xs text-gray-500 mb-1">Text for Splitting *</label>
            <input
              type="text"
              placeholder="Type '{{}}' to utilize variables"
              value={data.params?.text || ''}
              onChange={(e) => updateNodeData(id, { text: e.target.value })}
              className="w-full text-sm border border-gray-200 rounded px-2 py-1"
            />
            <label className="block text-xs text-gray-500 mb-1">Delimiter</label>
            <select
              value={data.params?.delimiter || 'space'}
              onChange={(e) => updateNodeData(id, { delimiter: e.target.value })}
              className="w-full text-sm border border-gray-200 rounded px-2 py-1"
            >
              <option value="space">Space</option>
              <option value="newline">Newline</option>
              <option value="character">Character(s)</option>
            </select>
          </div>
        )}

        {data.params?.operation === 'text-formatter' && (
          <div>
            <label className="block text-xs text-gray-500 mb-1">Text for Formatting *</label>
            <input
              type="text"
              placeholder="Type '{{}}' to utilize variables"
              value={data.params?.text || ''}
              onChange={(e) => updateNodeData(id, { text: e.target.value })}
              className="w-full text-sm border border-gray-200 rounded px-2 py-1"
            />
            <label className="block text-xs text-gray-500 mb-1">Text Formatter</label>
            <select
              value={data.params?.formatter || 'To Uppercase'}
              onChange={(e) => updateNodeData(id, { formatter: e.target.value })}
              className="w-full text-sm border border-gray-200 rounded px-2 py-1"
            >
              <option value="To Uppercase">To Uppercase</option>
              <option value="To Lowercase">To Lowercase</option>
              <option value="To Propercase">To Propercase</option>
              <option value="Trim Spaces">Trim Spaces</option>
              <option value="Truncate">Truncate</option>
            </select>
          </div>
        )}

        {data.params?.operation === 'find-and-replace' && (
          <div>
            <label className="block text-xs text-gray-500 mb-1">Text to Manipulate *</label>
            <input
              type="text"
              placeholder="Type '{{}}' to utilize variables"
              value={data.params?.text || ''}
              onChange={(e) => updateNodeData(id, { text: e.target.value })}
              className="w-full text-sm border border-gray-200 rounded px-2 py-1"
            />
            <div>
              {data.params?.replacements?.map((replacement, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <input
                    type="text"
                    placeholder="Find word"
                    value={replacement.find || ''}
                    onChange={(e) => {
                      const updatedReplacements = [...(data.params?.replacements || [])];
                      updatedReplacements[index] = { ...updatedReplacements[index], find: e.target.value };
                      updateNodeData(id, { replacements: updatedReplacements });
                    }}
                    className="flex-1 text-sm border border-gray-200 rounded px-2 py-1"
                  />
                  <input
                    type="text"
                    placeholder="Replace with"
                    value={replacement.replace || ''}
                    onChange={(e) => {
                      const updatedReplacements = [...(data.params?.replacements || [])];
                      updatedReplacements[index] = { ...updatedReplacements[index], replace: e.target.value };
                      updateNodeData(id, { replacements: updatedReplacements });
                    }}
                    className="flex-1 text-sm border border-gray-200 rounded px-2 py-1"
                  />
                  <button
                    onClick={() => {
                      const updatedReplacements = (data.params?.replacements ?? []).filter((_, i) => i !== index);
                      updateNodeData(id, { replacements: updatedReplacements });
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => {
                  const updatedReplacements = [...(data.params?.replacements || []), { find: '', replace: '' }];
                  updateNodeData(id, { replacements: updatedReplacements });
                }}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                + Add Replacement
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <span className={`w-2 h-2 rounded-full ${data.params?.operation ? 'bg-green-500' : 'bg-gray-400'}`} />
          <span>{data.params?.operation ? 'Operation selected' : 'Select operation'}</span>
        </span>
        <span>{data.params?.operation?.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</span>
      </div>

      {/* Handles */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 -ml-0.5 bg-blue-500 border-2 border-white rounded-full"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 -mr-0.5 bg-green-500 border-2 border-white rounded-full"
      />
    </div>
  );
};

export default TextProcessorNode;