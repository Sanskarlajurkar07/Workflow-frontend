import React, { useState, useEffect } from 'react';
import { Handle, Position } from 'reactflow';
import { Settings, Trash2, BookOpen, Search, Database, Plus, ChevronDown, RefreshCw } from 'lucide-react';
import { useFlowStore } from '../../../../store/flowStore';
import smartDatabaseService, { SmartDatabase } from '../../../../lib/knowledgeBaseService';

interface NodeProps {
  id: string;
  data: any;
  selected?: boolean;
}

interface SmartDatabaseReaderNodeProps {
  id: string;
  data: {
    params?: {
      searchQuery?: string;
      smartDatabase?: string;
      showSettings?: boolean;
      isLoading?: boolean;
    };
  };
  selected?: boolean;
}

const KBReaderNode: React.FC<SmartDatabaseReaderNodeProps> = ({ id, data, selected }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const removeNode = useFlowStore((state) => state.removeNode);
  const updateNodeData = useFlowStore((state) => state.updateNodeData);
  const [smartDatabases, setSmartDatabases] = useState<SmartDatabase[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate refresh
    setIsRefreshing(false);
  };

  useEffect(() => {
    fetchSmartDatabases();
  }, []);

  const fetchSmartDatabases = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await smartDatabaseService.getSmartDatabases();
      setSmartDatabases(data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch smart databases:', err);
      setError('Failed to load smart databases');
      setLoading(false);
    }
  };

  return (
    <div
      className={`bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-200 w-[380px] ${
        selected ? 'ring-2 ring-blue-500 shadow-blue-100' : 'shadow-gray-200/50'
      }`}
    >
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 relative">
        <div className="absolute inset-0 bg-grid-pattern opacity-10" />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/10 backdrop-blur-sm rounded-lg">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-medium text-white">Smart Database Reader</h3>
              <p className="text-xs text-blue-50/80">
                {data.params?.smartDatabase ? 'DB Connected' : 'Configure DB'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleRefresh}
              className={`p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors ${
                isRefreshing ? 'animate-spin' : ''
              }`}
              title="Refresh DB"
              disabled={isRefreshing}
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => updateNodeData(id, { params: { ...data.params, showSettings: !data.params?.showSettings } })}
              className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={() => removeNode(id)}
              className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-red-400/20 transition-colors"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 space-y-4">
        {/* Smart Database Selection - Moved to top */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Smart Database <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <select
              value={data.params?.smartDatabase || ''}
              onChange={(e) => updateNodeData(id, { params: { ...data.params, smartDatabase: e.target.value } })}
              className="w-full pl-8 pr-10 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              <option value="">Select Smart Database</option>
              {smartDatabases.map((db) => (
                <option key={db.id} value={db.id}>
                  {db.name}
                </option>
              ))}
            </select>
            <Database className="w-4 h-4 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
          {!data.params?.smartDatabase && (
            <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-red-500" />
              Smart database is required
            </p>
          )}
        </div>

        {/* Search Query Input */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Search Query <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <textarea
              placeholder="Enter your search query here..."
              value={data.params?.searchQuery || ''}
              onChange={(e) => updateNodeData(id, { params: { ...data.params, searchQuery: e.target.value } })}
              className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[80px] resize-none"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-2.5 top-3" />
          </div>
          {!data.params?.searchQuery && (
            <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-red-500" />
              Search query is required
            </p>
          )}
        </div>

        {/* Create New DB Button */}
        <button
          onClick={() => console.log('Create New Smart Database')}
          className="w-full flex items-center justify-center gap-2 py-2.5 text-sm text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create New Smart Database
        </button>

        {/* Info Card */}
        <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-3">
          <p className="text-xs text-blue-700 leading-relaxed">
            Query your smart database using natural language. The results will be semantically ranked by relevance.
          </p>
        </div>
      </div>

      {/* Enhanced Status Bar */}
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1">
          <span className={`w-2 h-2 rounded-full ${
            data.params?.searchQuery && data.params?.smartDatabase ? 'bg-green-500' : 'bg-gray-300'
          }`} />
          <span className="text-gray-600">
            {data.params?.searchQuery && data.params?.smartDatabase 
              ? 'Ready to query' 
              : 'Configure required fields'}
          </span>
        </div>
        {data.params?.smartDatabase && (
          <span className="text-blue-600 font-medium">
            {data.params.smartDatabase}
          </span>
        )}
      </div>

      {/* Enhanced Handles */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 -ml-0.5 bg-blue-500 border-2 border-white rounded-full shadow-md transition-transform hover:scale-110"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 -mr-0.5 bg-indigo-500 border-2 border-white rounded-full shadow-md transition-transform hover:scale-110"
      />
    </div>
  );
};

export default KBReaderNode;