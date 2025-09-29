import React, { useState, useEffect } from 'react';
import { Handle, Position } from 'reactflow';
import { Settings, Trash2, Search, Database, FileText, Variable } from 'lucide-react';
import { useFlowStore } from '../../../../store/flowStore';
import smartDatabaseService, { SmartDatabase } from '../../../../lib/knowledgeBaseService';

interface NodeProps {
  id: string;
  data: any;
  selected?: boolean;
}

interface SmartDatabaseSearchNodeProps {
  id: string;
  data: {
    params?: {
      embeddingModel?: string;
      searchQuery?: string;
      documents?: string;
      showSettings?: boolean;
      dbId?: string;
      querySource?: string;
      query?: string;
      topK?: number;
    };
    onChange: (data: any) => void;
  };
  selected?: boolean;
}

export function KBSearchNode({ data, id, selected }: NodeProps) {
  const [smartDatabases, setSmartDatabases] = useState<SmartDatabase[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const removeNode = useFlowStore((state) => state.removeNode);
  const updateNodeData = useFlowStore((state) => state.updateNodeData);

  return (
    <div className={`node-container p-0 ${selected ? 'border-blue-500' : 'border-gray-300'}`}>
      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-3 rounded-t-lg">
        <div className="flex items-center">
          <Search className="h-5 w-5 text-white mr-2" />
          <div className="text-white font-medium">Smart Database Search</div>
        </div>
      </div>
      
      <div className="p-4">
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-700 mb-1">Smart Database</label>
          <select
            className="w-full p-2 text-sm border border-gray-300 rounded-md bg-white"
            value={data.params?.dbId || ''}
            onChange={(e) => updateNodeData(id, { params: { ...data.params, dbId: e.target.value } })}
          >
            <option value="">Select Smart Database</option>
            {smartDatabases.map((db) => (
              <option key={db.id} value={db.id}>
                {db.name}
              </option>
            ))}
          </select>
          {loading && <div className="text-xs text-gray-500 mt-1">Loading smart databases...</div>}
          {error && <div className="text-xs text-red-500 mt-1">{error}</div>}
        </div>

        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-700 mb-1">Search Query</label>
          <select
            className="w-full p-2 text-sm border border-gray-300 rounded-md bg-white"
            value={data.params?.querySource || 'input'}
            onChange={(e) => updateNodeData(id, { params: { ...data.params, querySource: e.target.value } })}
          >
            <option value="input">From Input Node</option>
            <option value="static">Static Query</option>
          </select>
        </div>

        {data.params?.querySource === 'static' && (
          <div className="mb-3">
            <label className="block text-xs font-medium text-gray-700 mb-1">Query</label>
            <input
              type="text"
              className="w-full p-2 text-sm border border-gray-300 rounded-md"
              value={data.params?.query || ''}
              onChange={(e) => updateNodeData(id, { params: { ...data.params, query: e.target.value } })}
              placeholder="Enter search query"
            />
          </div>
        )}

        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-700 mb-1">Results Limit</label>
          <input
            type="number"
            className="w-full p-2 text-sm border border-gray-300 rounded-md"
            value={data.params?.topK || 5}
            onChange={(e) => updateNodeData(id, { params: { ...data.params, topK: parseInt(e.target.value) } })}
            min={1}
            max={20}
          />
        </div>
      </div>

      <Handle
        type="target"
        position={Position.Top}
        id="in"
        style={{ background: '#64748B' }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="out"
        style={{ background: '#64748B' }}
      />
    </div>
  );
}

export default KBSearchNode;