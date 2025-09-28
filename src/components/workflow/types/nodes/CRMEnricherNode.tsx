import React from 'react';
import { Trash2, Settings, Users, Mail, Database } from 'lucide-react';
import { Handle, Position } from 'reactflow';
import { useFlowStore } from '../../../../store/flowStore';

interface CRMEnricherNodeProps {
  data: {
    params?: {
      nodeName?: string;
      showSettings?: boolean;
      operation?: string;
      email?: string;
      model?: string;
    };
  };
  id: string;
  selected?: boolean;
}

const CRMEnricherNode: React.FC<CRMEnricherNodeProps> = ({ data, id, selected }) => {
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

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
      {/* Enhanced Header with Gradient */}
      <div className="bg-gradient-to-r from-cyan-500 to-blue-500 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-medium text-white">Sales Data Enrichment</h3>
              <p className="text-xs text-cyan-50/80">
                {data.params?.operation 
                  ? data.params.operation.split('-').map(word => 
                      word.charAt(0).toUpperCase() + word.slice(1)
                    ).join(' ')
                  : 'Select operation'}
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

      {/* Main Content */}
      <div className="p-4 space-y-4">
        {/* Settings Panel */}
        {data.params?.showSettings && (
          <div className="bg-gray-50 rounded-lg p-3 space-y-3 border border-gray-100">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Node Name</label>
              <input
                type="text"
                value={data.params?.nodeName || 'sales_data_enrichment_0'}
                onChange={(e) => updateNodeData(id, { nodeName: e.target.value })}
                className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>
          </div>
        )}

        {/* Operation Selection */}
        <div className="space-y-2">
          <label className="block text-xs font-medium text-gray-500">Select Operation</label>
          <div className="grid grid-cols-1 gap-2">
            <button
              onClick={() => updateNodeData(id, { operation: 'validate-email' })}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                data.params?.operation === 'validate-email'
                  ? 'bg-cyan-100 text-cyan-700 font-medium'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Mail className="w-4 h-4" />
              <span>Validate Email</span>
            </button>
          </div>
        </div>

        {/* Dynamic Content Based on Operation */}
        {data.params?.operation === 'validate-email' && (
          <div className="bg-gray-50 rounded-lg p-4 space-y-3 border border-gray-100">
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Email to Validate *</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Enter email address"
                    value={data.params?.email || ''}
                    onChange={(e) => updateNodeData(id, { email: e.target.value })}
                    className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                </div>
                {!data.params?.email && (
                  <p className="text-xs text-red-500 mt-1">Email to validate field is required</p>
                )}
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Validation Model *</label>
                <div className="relative">
                  <select
                    value={data.params?.model || 'Regex'}
                    onChange={(e) => updateNodeData(id, { model: e.target.value })}
                    className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent appearance-none"
                  >
                    <option value="Regex">Regex Validation</option>
                    <option value="AI Model">AI Model Validation</option>
                  </select>
                  <Database className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <span className={`w-2 h-2 rounded-full ${
            data.params?.email ? 'bg-green-500' : 'bg-gray-300'
          }`} />
          <span>{data.params?.email ? 'Ready to validate' : 'Waiting for input'}</span>
        </div>
        {data.params?.model && (
          <span className="text-cyan-600 font-medium">Using {data.params.model}</span>
        )}
      </div>

      {/* Handles */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 -ml-0.5 bg-cyan-500 border-2 border-white rounded-full"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 -mr-0.5 bg-green-500 border-2 border-white rounded-full"
      />
    </div>
  );
};

export default CRMEnricherNode;