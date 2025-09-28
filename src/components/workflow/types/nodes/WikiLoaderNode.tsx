import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { Search, Settings, Trash2 } from 'lucide-react';
import { useFlowStore } from '../../../../store/flowStore';

interface WikiLoaderNodeProps {
  id: string;
  data: {
    params?: {
      searchQuery?: string;
      resultsCount?: number;
      language?: string;
      showSettings?: boolean;
    };
  };
  selected?: boolean;
}

const WikiLoaderNode: React.FC<WikiLoaderNodeProps> = ({ id, data, selected }) => {
  const removeNode = useFlowStore((state) => state.removeNode);
  const updateNodeData = useFlowStore((state) => state.updateNodeData);
  const [searchQuery, setSearchQuery] = useState(data.params?.searchQuery || '');

  const handleDelete = () => {
    removeNode(id);
  };

  const handleSearchQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    updateNodeData(id, { searchQuery: value });
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-md overflow-hidden w-[300px] ${
        selected ? 'ring-2 ring-blue-500' : 'border border-gray-200'
      }`}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-600 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
              <Search className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-medium text-white">Wikipedia Search</h3>
              <p className="text-xs text-gray-300">{`wiki_${id}`}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => updateNodeData(id, { showSettings: !data.params?.showSettings })}
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

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Search Query */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Search Query <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchQueryChange}
            placeholder='Type "{{" to utilize variables'
            className={`w-full text-sm border rounded-md px-3 py-1.5 ${
              searchQuery ? 'border-gray-200' : 'border-red-300'
            }`}
          />
          {!searchQuery && (
            <p className="text-xs text-red-500 mt-1">Search Query field is required</p>
          )}
        </div>

        {/* Results Count */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Results count
          </label>
          <input
            type="number"
            value={data.params?.resultsCount || 10}
            onChange={(e) => updateNodeData(id, { resultsCount: parseInt(e.target.value) })}
            min={1}
            max={50}
            className="w-full text-sm border border-gray-200 rounded-md px-3 py-1.5"
          />
        </div>

        {/* Language Selection */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Language</label>
          <select
            value={data.params?.language || 'en'}
            onChange={(e) => updateNodeData(id, { language: e.target.value })}
            className="w-full text-sm border border-gray-200 rounded-md px-3 py-1.5"
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
            <option value="it">Italian</option>
          </select>
        </div>
      </div>

      {/* Handles */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 -ml-0.5 bg-gray-700 border-2 border-white rounded-full"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 -mr-0.5 bg-gray-700 border-2 border-white rounded-full"
      />
    </div>
  );
};

export default WikiLoaderNode;