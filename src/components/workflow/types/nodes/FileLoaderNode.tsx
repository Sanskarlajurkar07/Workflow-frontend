import React from 'react';
import { Handle, Position } from 'reactflow';
import { Trash2, Settings, Upload, FileText, ChevronDown } from 'lucide-react';
import { useFlowStore } from '../../../../store/flowStore';

interface FileLoaderNodeProps {
  data: {
    params?: {
      nodeName?: string;
      showSettings?: boolean;
      mode?: string;
      selectedFile?: string;
      fileName?: string;
    };
  };
  id: string;
  selected?: boolean;
}

const FileLoaderNode: React.FC<FileLoaderNodeProps> = ({ data, id, selected }) => {
  const removeNode = useFlowStore((state) => state.removeNode);
  const updateNodeData = useFlowStore((state) => state.updateNodeData);

  return (
    <div className={`bg-white rounded-lg shadow-sm overflow-hidden ${
      selected ? 'ring-2 ring-blue-500' : 'ring-1 ring-gray-200'
    }`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-2 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white rounded-md shadow-sm">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">File Loader</h3>
              <p className="text-xs text-gray-500">{data.params?.nodeName || 'file_loader_0'}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => updateNodeData(id, { showSettings: !data.params?.showSettings })}
              className="p-1 rounded-md hover:bg-white/50 transition-colors"
            >
              <Settings className="w-4 h-4 text-gray-600" />
            </button>
            <button
              onClick={() => removeNode(id)}
              className="p-1 rounded-md hover:bg-white/50 transition-colors"
            >
              <Trash2 className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* File Upload/Name Mode Selection */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => updateNodeData(id, { mode: 'upload' })}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-md text-sm transition-colors ${
              data.params?.mode === 'upload'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Upload File</span>
          </button>
          <button
            onClick={() => updateNodeData(id, { mode: 'fileName' })}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-md text-sm transition-colors ${
              data.params?.mode === 'fileName'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>File Name</span>
          </button>
        </div>

        {/* File Selection/Input Area */}
        {data.params?.mode === 'upload' && (
          <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-500">Select File</label>
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <select
                  value={data.params?.selectedFile || ''}
                  onChange={(e) => updateNodeData(id, { selectedFile: e.target.value })}
                  className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-md pl-3 pr-8 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Choose a file...</option>
                  <option value="knowledge_base_1">Knowledge Base 1</option>
                  <option value="knowledge_base_2">Knowledge Base 2</option>
                  <option value="upload_new">Upload New File</option>
                </select>
                <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none" />
              </div>
              <button className="p-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors">
                <Upload className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {data.params?.mode === 'fileName' && (
          <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-500">File Name</label>
            <input
              type="text"
              placeholder="Enter file path or name..."
              value={data.params?.fileName || ''}
              onChange={(e) => updateNodeData(id, { fileName: e.target.value })}
              className="w-full bg-gray-50 border border-gray-200 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        )}

        {/* Status */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Mode: {data.params?.mode || 'Not selected'}</span>
          <span>
            {data.params?.selectedFile || data.params?.fileName ? 'File selected' : 'No file selected'}
          </span>
        </div>
      </div>

      {/* Handles */}
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 -mr-0.5 bg-blue-500 border-2 border-white rounded-full"
      />
    </div>
  );
};

export default FileLoaderNode;