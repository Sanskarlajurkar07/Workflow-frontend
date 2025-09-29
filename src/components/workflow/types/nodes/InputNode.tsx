import React from 'react';
import { Handle, Position } from 'reactflow';
import { Trash2, Settings, Type, Image as ImageIcon, FileAudio, Upload, FileJson } from 'lucide-react';
import { useFlowStore } from '../../../../store/flowStore';

interface InputNodeProps {
  id: string;
  data: {
    params?: {
      nodeName?: string;
      type?: string;
      showSettings?: boolean;
    };
  };
  selected?: boolean;
}

const InputNode: React.FC<InputNodeProps> = ({ id, data, selected }) => {
  const removeNode = useFlowStore((state) => state.removeNode);
  const updateNodeData = useFlowStore((state) => state.updateNodeData);

  // Set default node name on first render
  React.useEffect(() => {
    if (!data.params?.nodeName) {
      const defaultName = `input_${id.split('-')[1] || '0'}`;
      updateNodeData(id, { nodeName: defaultName });
    }
  }, [id, data.params?.nodeName, updateNodeData]);

  const handleDelete = () => {
    removeNode(id);
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateNodeData(id, { type: e.target.value });
  };

  // Get the output field based on type
  const getOutputField = () => {
    switch (data.params?.type) {
      case 'Text':
        return 'text';
      case 'Image':
        return 'image';
      case 'Audio':
        return 'audio';
      case 'File':
        return 'file';
      case 'JSON':
        return 'json';
      default:
        return 'text';
    }
  };

  // Get icon based on type
  const getTypeIcon = () => {
    switch (data.params?.type) {
      case 'Text':
        return <Type className="w-4 h-4 text-blue-500" />;
      case 'Image':
        return <ImageIcon className="w-4 h-4 text-purple-500" />;
      case 'Audio':
        return <FileAudio className="w-4 h-4 text-green-500" />;
      case 'File':
        return <Upload className="w-4 h-4 text-yellow-500" />;
      case 'JSON':
        return <FileJson className="w-4 h-4 text-orange-500" />;
      default:
        return <Type className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div
      className={`relative bg-white rounded-lg shadow-md border-2 ${
        selected ? 'border-blue-500' : 'border-gray-200'
      }`}
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            {getTypeIcon()}
            <div className="text-sm font-medium text-gray-900">Input</div>
          </div>
          <button
            onClick={handleDelete}
            className="text-gray-400 hover:text-red-500"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Node Name */}
        <div className="mb-3">
          <label className="block text-xs text-gray-500 mb-1">Node Name</label>
          <input
            type="text"
            value={data.params?.nodeName || ''}
            onChange={(e) => updateNodeData(id, { nodeName: e.target.value })}
            className="w-full text-sm border border-gray-200 rounded px-2 py-1"
            placeholder="Enter node name..."
          />
        </div>

        {/* Type Dropdown */}
        <div>
          <label className="block text-xs text-gray-500 mb-1">Type</label>
          <select
            value={data.params?.type || 'Text'}
            onChange={handleTypeChange}
            className="w-full text-sm border border-gray-200 rounded px-2 py-1"
          >
            <option value="Text">Text</option>
            <option value="Image">Image</option>
            <option value="Audio">Audio</option>
            <option value="File">File</option>
            <option value="JSON">JSON</option>
          </select>
        </div>

        {/* Output Field Preview */}
        <div className="mt-3 p-2 bg-gray-50 rounded-md">
          <label className="block text-xs text-gray-500 mb-1">Output Variable</label>
          <code className="text-xs text-blue-600">
            {`{{${data.params?.nodeName || id}.${getOutputField()}}}`}
          </code>
        </div>
      </div>

      {/* Handle */}
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-blue-500 border-2 border-white rounded-full"
        style={{ right: -6 }}
      />
    </div>
  );
};

export default InputNode;