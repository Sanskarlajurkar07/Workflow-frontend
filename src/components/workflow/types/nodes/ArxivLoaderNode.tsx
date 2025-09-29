import React from 'react';
import { Handle, Position } from 'reactflow';
import { Trash2, Settings, BookOpen, Search, Filter, SortAsc } from 'lucide-react';
import { useFlowStore } from '../../../../store/flowStore';

interface ArxivLoaderNodeProps {
  data: {
    params?: {
      nodeName?: string;
      showSettings?: boolean;
      searchQuery?: string;
      queryMode?: string;
      sortBy?: 'relevance' | 'lastUpdated' | 'submitted';
      maxResults?: number;
      category?: string;
      dateRange?: 'all' | 'lastWeek' | 'lastMonth' | 'lastYear';
    };
  };
  id: string;
  selected?: boolean;
}

const ArxivLoaderNode: React.FC<ArxivLoaderNodeProps> = ({ data, id, selected }) => {
  const removeNode = useFlowStore((state) => state.removeNode);
  const updateNodeData = useFlowStore((state) => state.updateNodeData);

  return (
    <div className={`bg-white rounded-lg shadow-sm overflow-hidden ${
      selected ? 'ring-2 ring-purple-500' : 'ring-1 ring-gray-200'
    }`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 px-4 py-2 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white rounded-md shadow-sm">
              <BookOpen className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Arxiv Loader</h3>
              <p className="text-xs text-gray-500">{data.params?.nodeName || 'arxiv_0'}</p>
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
        {/* Search Query Input */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Search Query *</label>
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Enter search terms..."
                value={data.params?.searchQuery || ''}
                onChange={(e) => updateNodeData(id, { searchQuery: e.target.value })}
                className="w-full pl-8 pr-3 py-1.5 text-sm border rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-2 top-1/2 transform -translate-y-1/2" />
            </div>
            <button
              onClick={() => updateNodeData(id, { 
                queryMode: data.params?.queryMode === 'variable' ? 'text' : 'variable' 
              })}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                data.params?.queryMode === 'variable'
                  ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {data.params?.queryMode === 'variable' ? 'Variable' : 'Text'}
            </button>
          </div>
          {!data.params?.searchQuery && (
            <p className="text-xs text-red-500 mt-1">Search query is required</p>
          )}
        </div>

        {/* Settings Panel */}
        {data.params?.showSettings && (
          <div className="space-y-3 pt-2 border-t border-gray-100">
            {/* Category Selection */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
              <select
                value={data.params?.category || 'all'}
                onChange={(e) => updateNodeData(id, { category: e.target.value })}
                className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                <option value="cs">Computer Science</option>
                <option value="math">Mathematics</option>
                <option value="physics">Physics</option>
                <option value="q-bio">Quantitative Biology</option>
                <option value="q-fin">Quantitative Finance</option>
                <option value="stat">Statistics</option>
              </select>
            </div>

            {/* Sort and Filter Controls */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Sort By</label>
                <select
                  value={data.params?.sortBy || 'relevance'}
                  onChange={(e) => updateNodeData(id, { sortBy: e.target.value })}
                  className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="relevance">Relevance</option>
                  <option value="lastUpdated">Last Updated</option>
                  <option value="submitted">Submission Date</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Date Range</label>
                <select
                  value={data.params?.dateRange || 'all'}
                  onChange={(e) => updateNodeData(id, { dateRange: e.target.value })}
                  className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="all">All Time</option>
                  <option value="lastWeek">Last Week</option>
                  <option value="lastMonth">Last Month</option>
                  <option value="lastYear">Last Year</option>
                </select>
              </div>
            </div>

            {/* Max Results */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Max Results</label>
              <input
                type="number"
                min="1"
                max="100"
                value={data.params?.maxResults || 10}
                onChange={(e) => updateNodeData(id, { maxResults: parseInt(e.target.value) || 10 })}
                className="w-32 px-3 py-1.5 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
        )}

        {/* Status */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Status: {data.params?.searchQuery ? 'Ready' : 'Waiting for query'}</span>
          <span>{data.params?.category ? `Category: ${data.params.category}` : 'All categories'}</span>
        </div>
      </div>

      {/* Handles */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 -ml-0.5 bg-purple-500 border-2 border-white rounded-full"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 -mr-0.5 bg-purple-500 border-2 border-white rounded-full"
      />
    </div>
  );
};

export default ArxivLoaderNode;