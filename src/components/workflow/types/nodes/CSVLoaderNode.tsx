import React from 'react';
import { Handle, Position } from 'reactflow';
import { Trash2, Settings, Upload, FileSpreadsheet, ChevronDown } from 'lucide-react';
import { useFlowStore } from '../../../../store/flowStore';

interface CSVLoaderNodeProps {
  id: string;
  data: {
    params?: {
      nodeName?: string;
      showSettings?: boolean;
      selectedFile?: string;
      searchQuery?: string;
      queryMode?: string;
      delimiter?: string;
      hasHeader?: boolean;
    };
  };
  selected?: boolean;
}

const CSVLoaderNode: React.FC<CSVLoaderNodeProps> = ({ id, data, selected }) => {
  const removeNode = useFlowStore((state) => state.removeNode);
  const updateNodeData = useFlowStore((state) => state.updateNodeData);

  const handleDelete = () => {
    removeNode(id);
  };

  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden ${
      selected ? 'ring-2 ring-blue-500' : 'ring-1 ring-gray-200'
    }`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 px-4 py-2 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white rounded-md shadow-sm">
              <FileSpreadsheet className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">CSV Query Agent</h3>
              <p className="text-xs text-gray-500">{data.params?.nodeName || 'csv_query_0'}</p>
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
              onClick={handleDelete}
              className="p-1 rounded-md hover:bg-white/50 transition-colors"
            >
              <Trash2 className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* File Selection */}
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <select
              value={data.params?.selectedFile || ''}
              onChange={(e) => updateNodeData(id, { selectedFile: e.target.value })}
              className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-md pl-3 pr-8 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select CSV File</option>
              <option value="file_1">customers.csv</option>
              <option value="file_2">products.csv</option>
              <option value="file_3">orders.csv</option>
            </select>
            <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none" />
          </div>
          <button 
            className="flex items-center space-x-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
          >
            <Upload className="w-4 h-4" />
            <span className="text-sm">Upload</span>
          </button>
        </div>

        {/* Settings Panel */}
        {data.params?.showSettings && (
          <div className="space-y-3 pt-2 border-t border-gray-100">
            {/* Delimiter */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Delimiter</label>
                <select
                  value={data.params?.delimiter || ','}
                  onChange={(e) => updateNodeData(id, { delimiter: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-md px-2 py-1 text-sm"
                >
                  <option value=",">Comma (,)</option>
                  <option value=";">Semicolon (;)</option>
                  <option value="\t">Tab (\t)</option>
                  <option value="|">Pipe (|)</option>
                </select>
              </div>

              {/* Header Toggle */}
              <div className="flex items-start space-x-2 pt-6">
                <input
                  type="checkbox"
                  checked={data.params?.hasHeader || true}
                  onChange={(e) => updateNodeData(id, { hasHeader: e.target.checked })}
                  className="mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label className="text-xs text-gray-600">Has Header Row</label>
              </div>
            </div>

            {/* Query Input */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Search Query</label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Enter your query..."
                  value={data.params?.searchQuery || ''}
                  onChange={(e) => updateNodeData(id, { searchQuery: e.target.value })}
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={() => updateNodeData(id, { 
                    queryMode: data.params?.queryMode === 'variable' ? 'text' : 'variable' 
                  })}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    data.params?.queryMode === 'variable'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {data.params?.queryMode === 'variable' ? 'Variable' : 'Text'}
                </button>
              </div>
            </div>

            {/* Preview Button */}
            <button
              onClick={() => console.log('Preview CSV data')}
              className="w-full px-4 py-2 bg-green-50 text-green-700 rounded-md hover:bg-green-100 transition-colors text-sm font-medium"
            >
              Preview Data
            </button>
          </div>
        )}

        {/* Status Indicators */}
        <div className="flex items-center justify-between text-xs text-gray-500 pt-2">
          <span>Status: Ready</span>
          <span>{data.params?.selectedFile ? 'File loaded' : 'No file selected'}</span>
        </div>
      </div>

      {/* Handles */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 -ml-0.5 bg-green-500 border-2 border-white rounded-full"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 -mr-0.5 bg-green-500 border-2 border-white rounded-full"
      />
    </div>
  );
};

export default CSVLoaderNode;