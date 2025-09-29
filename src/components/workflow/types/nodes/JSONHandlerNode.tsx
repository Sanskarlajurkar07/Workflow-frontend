import React from 'react';
import { Handle, Position } from 'reactflow';
import { Trash2, Settings, FileJson } from 'lucide-react';
import { useFlowStore } from '../../../../store/flowStore';

interface JSONHandlerNodeProps {
  data: {
    params?: {
      nodeName?: string;
      showSettings?: boolean;
      operation?: string;
      subOperation?: string;
      jsonString?: string;
      fields?: { key: string; value: string }[];
      keys?: string[];
    };
  };
  id: string;
  selected?: boolean;
}

const JSONHandlerNode: React.FC<JSONHandlerNodeProps> = ({ data, id, selected }) => {
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

  const handleOperationChange = (operation: string) => {
    updateNodeData(id, { operation });
  };

  const handleSubOperationChange = (subOperation: string) => {
    updateNodeData(id, { subOperation });
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg overflow-hidden ${
      selected ? 'ring-2 ring-blue-500' : 'border border-gray-200'
    }`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-500 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
              <FileJson className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-medium text-white">JSON Handler</h3>
              <p className="text-xs text-blue-50/80">
                {data.params?.operation?.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || 'Select operation'}
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

      {/* Rest of your existing component code */}
      <div className="p-3 text-sm space-y-3">
        {/* Node Name */}
        <div>
          <label className="block text-xs text-gray-500 mb-1">Node Name</label>
          <input
            type="text"
            value={data.params?.nodeName || 'json_operations_0'}
            onChange={(e) => updateNodeData(id, { nodeName: e.target.value })}
            className="w-full text-sm border border-gray-200 rounded px-2 py-1"
          />
        </div>

        {/* Operation Selection */}
        <div>
          <label className="block text-xs text-gray-500 mb-1">Select Operation</label>
          <div className="flex space-x-2">
            <button
              onClick={() => handleOperationChange('write-json-value')}
              className={`px-3 py-1.5 text-sm rounded ${
                data.params?.operation === 'write-json-value' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              Write JSON Value
            </button>
            <button
              onClick={() => handleOperationChange('read-json-value')}
              className={`px-3 py-1.5 text-sm rounded ${
                data.params?.operation === 'read-json-value' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              Read JSON Value
            </button>
          </div>
        </div>

        {/* Dynamic Content */}
        {data.params?.operation === 'write-json-value' && (
          <div>
            {/* Sub-Operation */}
            <div className="flex space-x-2 mb-3">
              <button
                onClick={() => handleSubOperationChange('create-json')}
                className={`px-3 py-1.5 text-sm rounded ${
                  data.params?.subOperation === 'create-json' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
                }`}
              >
                Create JSON
              </button>
              <button
                onClick={() => handleSubOperationChange('update-json')}
                className={`px-3 py-1.5 text-sm rounded ${
                  data.params?.subOperation === 'update-json' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
                }`}
              >
                Update JSON
              </button>
            </div>

            {/* JSON String */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">JSON String *</label>
              <input
                type="text"
                placeholder="Type '{{}}' to utilize variables"
                value={data.params?.jsonString || ''}
                onChange={(e) => updateNodeData(id, { jsonString: e.target.value })}
                className="w-full text-sm border border-gray-200 rounded px-2 py-1"
              />
              {!data.params?.jsonString && (
                <p className="text-xs text-red-500">JSON String field is required</p>
              )}
            </div>

            {/* Key-Value Pairs */}
            <div>
              {data.params?.fields?.map((field, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <input
                    type="text"
                    placeholder="Key"
                    value={field.key || ''}
                    onChange={(e) => {
                      const updatedFields = [...(data.params?.fields || [])];
                      updatedFields[index] = { ...updatedFields[index], key: e.target.value };
                      updateNodeData(id, { fields: updatedFields });
                    }}
                    className="flex-1 text-sm border border-gray-200 rounded px-2 py-1"
                  />
                  <input
                    type="text"
                    placeholder="Value"
                    value={field.value || ''}
                    onChange={(e) => {
                      const updatedFields = [...(data.params?.fields || [])];
                      updatedFields[index] = { ...updatedFields[index], value: e.target.value };
                      updateNodeData(id, { fields: updatedFields });
                    }}
                    className="flex-1 text-sm border border-gray-200 rounded px-2 py-1"
                  />
                  <button
                    onClick={() => {
                      const updatedFields = data.params?.fields?.filter((_, i) => i !== index) || [];
                      updateNodeData(id, { fields: updatedFields });
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => {
                  const updatedFields = [...(data.params?.fields || []), { key: '', value: '' }];
                  updateNodeData(id, { fields: updatedFields });
                }}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                + Add Field
              </button>
            </div>
          </div>
        )}

        {data.params?.operation === 'read-json-value' && (
          <div>
            {/* JSON String */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">JSON String *</label>
              <input
                type="text"
                placeholder="Type '{{}}' to utilize variables"
                value={data.params?.jsonString || ''}
                onChange={(e) => updateNodeData(id, { jsonString: e.target.value })}
                className="w-full text-sm border border-gray-200 rounded px-2 py-1"
              />
              {!data.params?.jsonString && (
                <p className="text-xs text-red-500">JSON String field is required</p>
              )}
            </div>

            {/* Keys */}
            <div>
              {data.params?.keys?.map((key, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <input
                    type="text"
                    placeholder={`Key ${index + 1}`}
                    value={key || ''}
                    onChange={(e) => {
                      const updatedKeys = [...(data.params?.keys || [])];
                      updatedKeys[index] = e.target.value;
                      updateNodeData(id, { keys: updatedKeys });
                    }}
                    className="flex-1 text-sm border border-gray-200 rounded px-2 py-1"
                  />
                  <button
                    onClick={() => {
                      const updatedKeys = data.params?.keys?.filter((_, i) => i !== index) || [];
                      updateNodeData(id, { keys: updatedKeys });
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => {
                  const updatedKeys = [...(data.params?.keys || []), ''];
                  updateNodeData(id, { keys: updatedKeys });
                }}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                + Add Key
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Handles for node connections */}
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

export default JSONHandlerNode;