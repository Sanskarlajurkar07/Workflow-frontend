import React from 'react';
import { Settings, Trash2 } from 'lucide-react';

interface TextNodeProps {
  data: {
    params?: {
      nodeName?: string;
      text?: string;
      showSettings?: boolean;
    };
  };
  id: string;
  updateNodeData: (id: string, params: any) => void;
  removeNode: (id: string) => void;
}

const TextNode: React.FC<TextNodeProps> = ({ data, id, updateNodeData, removeNode }) => {
  return (
    <div className="p-3 border border-gray-200 rounded-md shadow-sm text-sm space-y-3 bg-white">
      {/* Header with Title and Settings */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <span className="text-blue-500">📝</span>
          <div className="font-semibold text-gray-800">Text Input</div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => updateNodeData(id, { showSettings: !data.params?.showSettings })}
            className="text-gray-400 hover:text-gray-600"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button
            onClick={() => removeNode(id)}
            className="text-gray-400 hover:text-gray-600"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Node Name Field */}
      <div>
        <label className="block text-xs text-gray-500 mb-1">Node Name</label>
        <input
          type="text"
          value={data.params?.nodeName || 'text_0'}
          onChange={(e) => updateNodeData(id, { nodeName: e.target.value })}
          className="w-full text-sm border border-gray-200 rounded px-2 py-1"
        />
      </div>

      {/* Text Input Field */}
      <div>
        <label className="block text-xs text-gray-500 mb-1">Text *</label>
        <input
          type="text"
          placeholder="Enter text..."
          value={data.params?.text || ''}
          onChange={(e) => updateNodeData(id, { text: e.target.value })}
          className={`w-full text-sm border rounded px-2 py-1 ${
            !data.params?.text ? 'border-red-500' : 'border-gray-200'
          }`}
        />
        {!data.params?.text && (
          <p className="text-xs text-red-500">Text field is required</p>
        )}
      </div>

      {/* Description */}
      <p className="text-xs text-gray-500">
        Enter text that can be used as input for other nodes.
      </p>
    </div>
  );
};

export default TextNode;