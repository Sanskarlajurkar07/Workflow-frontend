import React from 'react';
import { Handle, Position } from 'reactflow';
import { Trash2, Settings, FileText, Upload, Table, RefreshCw, File, ArrowUpDown } from 'lucide-react';
import { useFlowStore } from '../../../../store/flowStore';

interface FileTransformerNodeProps {
  data: {
    params?: {
      nodeName?: string;
      showSettings?: boolean;
      operation?: string;
      text?: string;
      file?: File;
      files?: File[];
      csvFile?: File;
      data?: string;
      sortColumn?: string;
      newName?: string;
    };
  };
  id: string;
  selected?: boolean;
}

const FileTransformerNode: React.FC<FileTransformerNodeProps> = ({ data, id, selected }) => {
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

  const operations = [
    { id: 'text-to-file', icon: FileText, label: 'Text to File' },
    { id: 'file-to-text', icon: File, label: 'File to Text' },
    { id: 'append-files', icon: Upload, label: 'Append Files' },
    { id: 'csv-reader', icon: Table, label: 'CSV Reader' },
    { id: 'csv-writer', icon: Table, label: 'CSV Writer' },
    { id: 'csv-to-excel', icon: Table, label: 'CSV to Excel' },
    { id: 'sort-csv', icon: ArrowUpDown, label: 'Sort CSV' },
    { id: 'rename-file', icon: RefreshCw, label: 'Rename File' },
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-500 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-medium text-white">File Transformer</h3>
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

      {/* Settings Panel */}
      {data.params?.showSettings && (
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Node Name</label>
              <input
                type="text"
                value={data.params?.nodeName || 'file_operations_0'}
                onChange={(e) => updateNodeData(id, { nodeName: e.target.value })}
                className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="p-4 space-y-4">
        {/* Operation Selection Grid */}
        <div className="space-y-2">
          <label className="block text-xs font-medium text-gray-500">Operation</label>
          <div className="grid grid-cols-2 gap-2">
            {operations.map(({ id: op, icon: Icon, label }) => (
              <button
                key={op}
                onClick={() => updateNodeData(id, { operation: op })}
                className={`flex items-center justify-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                  data.params?.operation === op
                    ? 'bg-blue-100 text-blue-700 font-medium'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Operation Specific Content */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          {data.params?.operation === 'text-to-file' && (
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Text Content *</label>
              <textarea
                placeholder="Enter text to convert to file"
                value={data.params?.text || ''}
                onChange={(e) => updateNodeData(id, { text: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[100px]"
              />
            </div>
          )}

          {data.params?.operation === 'file-to-text' && (
            <div className="space-y-2">
              <label className="block text-xs font-medium text-gray-500">Select File *</label>
              <div className="flex items-center space-x-2">
                <input
                  type="file"
                  onChange={(e) => updateNodeData(id, { file: e.target.files?.[0] })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          )}

          {data.params?.operation === 'append-files' && (
            <div className="space-y-2">
              <label className="block text-xs font-medium text-gray-500">Select Files *</label>
              <div className="flex items-center space-x-2">
                <input
                  type="file"
                  multiple
                  onChange={(e) => updateNodeData(id, { files: Array.from(e.target.files || []) })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              {data.params?.files?.length > 0 && (
                <p className="text-xs text-gray-500">{data.params.files.length} files selected</p>
              )}
            </div>
          )}

          {data.params?.operation === 'csv-reader' && (
            <div className="space-y-2">
              <label className="block text-xs font-medium text-gray-500">CSV File *</label>
              <div className="flex items-center space-x-2">
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => updateNodeData(id, { csvFile: e.target.files?.[0] })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          )}

          {data.params?.operation === 'csv-writer' && (
            <div className="space-y-2">
              <label className="block text-xs font-medium text-gray-500">CSV Data *</label>
              <textarea
                placeholder="Enter data to write to CSV"
                value={data.params?.data || ''}
                onChange={(e) => updateNodeData(id, { data: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[100px]"
              />
            </div>
          )}

          {data.params?.operation === 'csv-to-excel' && (
            <div className="space-y-2">
              <label className="block text-xs font-medium text-gray-500">CSV File *</label>
              <div className="flex items-center space-x-2">
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => updateNodeData(id, { csvFile: e.target.files?.[0] })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          )}

          {data.params?.operation === 'sort-csv' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-500">CSV File *</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => updateNodeData(id, { csvFile: e.target.files?.[0] })}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500">Sort Column *</label>
                <input
                  type="text"
                  placeholder="Enter column name to sort by"
                  value={data.params?.sortColumn || ''}
                  onChange={(e) => updateNodeData(id, { sortColumn: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          )}

          {data.params?.operation === 'rename-file' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-500">File *</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="file"
                    onChange={(e) => updateNodeData(id, { file: e.target.files?.[0] })}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500">New Name *</label>
                <input
                  type="text"
                  placeholder="Enter new file name"
                  value={data.params?.newName || ''}
                  onChange={(e) => updateNodeData(id, { newName: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Status Bar */}
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <span className={`w-2 h-2 rounded-full ${data.params?.operation ? 'bg-green-500' : 'bg-gray-300'}`} />
          <span>{data.params?.operation ? 'Operation selected' : 'Select an operation'}</span>
        </div>
        {data.params?.operation && (
          <span className="text-blue-600 font-medium">
            {data.params.operation.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
          </span>
        )}
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

export default FileTransformerNode;