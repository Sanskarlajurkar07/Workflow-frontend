import React from 'react';
import { Handle, Position } from 'reactflow';
import { Trash2, Settings, Link, Globe, ChevronDown } from 'lucide-react';
import { useFlowStore } from '../../../../store/flowStore';

interface URLLoaderNodeProps {
  id: string;
  data: {
    params?: {
      nodeName?: string;
      showSettings?: boolean;
      provider?: string;
      url?: string;
      urlMode?: string;
      recursive?: boolean;
      urlLimit?: number;
    };
  };
  selected?: boolean;
}

const URLLoaderNode: React.FC<URLLoaderNodeProps> = ({ id, data, selected }) => {
  const removeNode = useFlowStore((state) => state.removeNode);
  const updateNodeData = useFlowStore((state) => state.updateNodeData);

  const handleDelete = () => {
    removeNode(id);
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm overflow-hidden ${
      selected ? 'ring-2 ring-blue-500' : 'ring-1 ring-gray-200'
    }`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-2 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white rounded-md shadow-sm">
              <Globe className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">URL Loader</h3>
              <p className="text-xs text-gray-500">{data.params?.nodeName || 'url_loader_0'}</p>
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
        {/* Provider Selection */}
        <div className="relative">
          <label className="block text-xs font-medium text-gray-500 mb-1">Provider</label>
          <div className="relative">
            <select
              value={data.params?.provider || 'Default'}
              onChange={(e) => updateNodeData(id, { provider: e.target.value })}
              className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-md pl-3 pr-8 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="Default">Default</option>
              <option value="Jina">Jina</option>
              <option value="Apify">Apify</option>
            </select>
            <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* URL Input Section */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">URL *</label>
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Enter URL (e.g., https://example.com)"
                value={data.params?.url || ''}
                onChange={(e) => updateNodeData(id, { url: e.target.value })}
                className={`w-full bg-gray-50 border rounded-md pl-8 pr-3 py-1.5 text-sm ${
                  !data.params?.url ? 'border-red-300' : 'border-gray-200'
                } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              />
              <Link className="w-4 h-4 text-gray-400 absolute left-2 top-1/2 transform -translate-y-1/2" />
            </div>
            <button
              onClick={() => updateNodeData(id, { 
                urlMode: data.params?.urlMode === 'variable' ? 'text' : 'variable' 
              })}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                data.params?.urlMode === 'variable'
                  ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {data.params?.urlMode === 'variable' ? 'Variable' : 'Text'}
            </button>
          </div>
          {!data.params?.url && (
            <p className="text-xs text-red-500 mt-1">URL is required</p>
          )}
        </div>

        {/* Advanced Options */}
        <div className="space-y-3 pt-2 border-t border-gray-100">
          {/* Recursive Option */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="recursive"
                checked={data.params?.recursive || false}
                onChange={(e) => updateNodeData(id, { recursive: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="recursive" className="text-sm text-gray-600">Enable Recursive Crawling</label>
            </div>
          </div>

          {/* URL Limit (Conditional) */}
          {data.params?.recursive && (
            <div className="ml-6">
              <label className="block text-xs font-medium text-gray-500 mb-1">URL Limit</label>
              <input
                type="number"
                min="1"
                max="100"
                value={data.params?.urlLimit || 10}
                onChange={(e) => updateNodeData(id, { urlLimit: parseInt(e.target.value, 10) || 1 })}
                className="w-32 bg-gray-50 border border-gray-200 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-400 mt-1">Maximum number of URLs to crawl</p>
            </div>
          )}
        </div>

        {/* Status Indicator */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Status: {data.params?.url ? 'Ready' : 'Waiting for URL'}</span>
          <span>{data.params?.provider}</span>
        </div>
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
        className="w-3 h-3 -mr-0.5 bg-blue-500 border-2 border-white rounded-full"
      />
    </div>
  );
};

export default URLLoaderNode;