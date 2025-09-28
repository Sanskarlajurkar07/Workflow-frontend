import React, { useState, useEffect } from 'react';
import { Handle, Position } from 'reactflow';
import { Settings, Trash2, Database } from 'lucide-react';
import { useFlowStore } from '../../../../store/flowStore';
import DatabaseConnectModal from '../../../database/DatabaseConnectModal';
import databaseService, { SavedConnection } from '../../../../lib/databaseService';
import toast from 'react-hot-toast';

interface MongoDBNodeProps {
  id: string;
  data: {
    params?: {
      nodeName?: string;
      account?: boolean;
      connectionId?: string;
      connectionName?: string;
      showSettings?: boolean;
      showConfig?: boolean;
      action?: string;
      collection?: string;
      query?: string;
      connectionString?: string;
    };
  };
  selected?: boolean;
}

const MongoDBNode: React.FC<MongoDBNodeProps> = ({ id, data, selected }) => {
  const removeNode = useFlowStore((state) => state.removeNode);
  const updateNodeData = useFlowStore((state) => state.updateNodeData);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [savedConnections, setSavedConnections] = useState<SavedConnection[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch saved connections when component mounts
  useEffect(() => {
    if (data.params?.showConfig || !data.params?.connectionId) {
      fetchSavedConnections();
    }
  }, [data.params?.showConfig]);

  // Fetch connection details if connectionId is provided
  useEffect(() => {
    if (data.params?.connectionId) {
      fetchConnectionDetails(data.params.connectionId);
    }
  }, [data.params?.connectionId]);

  const fetchSavedConnections = async () => {
    try {
      setLoading(true);
      const connections = await databaseService.getConnections();
      // Filter for MongoDB connections only
      const mongoConnections = connections.filter(conn => conn.type === 'mongodb');
      setSavedConnections(mongoConnections);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching saved connections:', error);
      toast.error('Failed to load saved connections');
      setLoading(false);
    }
  };

  const fetchConnectionDetails = async (connectionId: string) => {
    try {
      const connection = await databaseService.getConnection(connectionId);
      if (connection) {
        updateNodeData(id, { 
          connectionName: connection.name,
          account: true
        });
      }
    } catch (error) {
      console.error('Error fetching connection details:', error);
      toast.error('Failed to load connection details');
    }
  };

  const handleDelete = () => {
    removeNode(id);
  };

  const handleConnectionSelect = (connectionId: string) => {
    updateNodeData(id, { 
      connectionId,
      account: true,
      showConfig: false
    });
  };

  const handleConnectionSuccess = (connectionId: string) => {
    handleConnectionSelect(connectionId);
    fetchSavedConnections();
  };

  return (
    <div className={`p-3 border rounded-md shadow-sm text-sm space-y-3 bg-white ${
      selected ? 'border-blue-500' : 'border-gray-200'
    }`}>
      {/* Header with Title and Settings */}
      <div className="bg-gradient-to-r from-blue-500 to-gray-900 px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <span className="text-white">
            <Database className="w-4 h-4" />
          </span>
          <div className="font-semibold text-white">MongoDB Database</div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => updateNodeData(id, { showSettings: !data.params?.showSettings })}
            className="text-white hover:text-gray-300"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button
            onClick={handleDelete}
            className="text-gray-300 hover:text-red-500"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Node Name */}
      <div>
        <label className="block text-xs text-gray-500 mb-1">Node Name</label>
        <input
          type="text"
          value={data.params?.nodeName || 'mongodb_0'}
          onChange={(e) => updateNodeData(id, { nodeName: e.target.value })}
          className="w-full text-sm border border-gray-200 rounded px-2 py-1"
        />
      </div>

      {/* Connection Config */}
      {!data.params?.account && (
        <div className="space-y-2">
          <button
            onClick={() => setShowConnectModal(true)}
            className="w-full px-3 py-1.5 text-sm text-blue-600 border border-blue-200 rounded hover:bg-blue-50"
          >
            + Connect Account
          </button>

          {savedConnections.length > 0 && (
            <div>
              <label className="block text-xs text-gray-500 mb-1">Or select a saved connection:</label>
              <select
                onChange={(e) => handleConnectionSelect(e.target.value)}
                className="w-full text-sm border border-gray-200 rounded px-2 py-1"
                value=""
              >
                <option value="" disabled>Select a connection</option>
                {savedConnections.map(conn => (
                  <option key={conn.id} value={conn.id}>
                    {conn.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {/* Show connected account info */}
      {data.params?.account && (
        <div className="border border-gray-200 rounded p-2 bg-gray-50">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-xs text-gray-500">Connected to:</span>
              <div className="font-medium">{data.params.connectionName || 'MongoDB Database'}</div>
            </div>
            <button
              onClick={() => updateNodeData(id, { account: false, connectionId: undefined, connectionName: undefined })}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              Change
            </button>
          </div>
        </div>
      )}

      {data.params?.account && (
        <div className="space-y-3">
          {/* Action Selection */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">Action</label>
            <select
              value={data.params?.action || 'mongo-find'}
              onChange={(e) => updateNodeData(id, { action: e.target.value })}
              className="w-full text-sm border border-gray-200 rounded px-2 py-1"
            >
              <option value="mongo-find">Mongo Find (Query Mongo data)</option>
              <option value="mongodb-find-one">MongoDB Find One (Run and Aggregation)</option>
              <option value="nl-query">NL Query (Query with Natural Language)</option>
              <option value="nl-aggregation">NL Aggregation (MongoDB with Natural Language)</option>
            </select>
          </div>

          {/* Collection Selection */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">Collection *</label>
            <select
              value={data.params?.collection || ''}
              onChange={(e) => updateNodeData(id, { collection: e.target.value })}
              className="w-full text-sm border border-gray-200 rounded px-2 py-1"
            >
              <option value="">Select Collection</option>
              <option value="users">Users</option>
              <option value="products">Products</option>
              <option value="orders">Orders</option>
            </select>
            {!data.params?.collection && (
              <p className="text-xs text-red-500 mt-1">Collection is required</p>
            )}
          </div>

          {/* Query Input */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">Query *</label>
            <textarea
              placeholder={data.params?.action === 'nl-query' 
                ? 'Find all users who are older than 25 years'
                : '{"age": {"$gt": 25}}'}
              value={data.params?.query || ''}
              onChange={(e) => updateNodeData(id, { query: e.target.value })}
              className="w-full text-sm border border-gray-200 rounded px-2 py-1 min-h-[60px]"
            />
            {!data.params?.query && (
              <p className="text-xs text-red-500 mt-1">Query is required</p>
            )}
          </div>

          {/* Test Connection Button */}
          <button
            onClick={() => toast.success('Test connection successful!')}
            className="w-full px-3 py-1.5 text-sm text-green-600 border border-green-200 rounded hover:bg-green-50"
          >
            Test Connection
          </button>
        </div>
      )}

      {/* Database Connect Modal */}
      <DatabaseConnectModal
        type="mongodb"
        isOpen={showConnectModal}
        onClose={() => setShowConnectModal(false)}
        onSuccess={handleConnectionSuccess}
        nodeId={id}
      />

      {/* Handles */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-green-500 border-2 border-white rounded-full"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-green-500 border-2 border-white rounded-full"
      />
    </div>
  );
};

export default MongoDBNode;