import React from 'react';
import { Handle, Position } from 'reactflow';
import { Settings, Trash2, Zap, ChevronDown, AlertCircle } from 'lucide-react';
import { useFlowStore } from '../../../../store/flowStore';

interface PipelineNodeProps {
  id: string;
  data: {
    params?: {
      nodeName?: string;
      pipeline?: string;
      showSettings?: boolean;
      isDeployed?: boolean;
    };
  };
  selected?: boolean;
}

const PipelineNode: React.FC<PipelineNodeProps> = ({ id, data, selected }) => {
  const removeNode = useFlowStore((state) => state.removeNode);
  const updateNodeData = useFlowStore((state) => state.updateNodeData);

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
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-medium text-white">Workflow Node</h3>
              <p className="text-xs text-blue-50/80">
                {data.params?.pipeline ? 'Connected' : 'Select workflow'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
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
        {/* Node Name */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Node Name</label>
          <input
            type="text"
            value={data.params?.nodeName || 'workflow_0'}
            onChange={(e) => updateNodeData(id, { params: { ...data.params, nodeName: e.target.value } })}
            className="w-full px-3 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Workflow Selection */}
        <div className="space-y-2">
          <label className="block text-xs font-medium text-gray-500">Select Workflow</label>
          <div className="relative">
            <select
              value={data.params?.pipeline || ''}
              onChange={(e) => updateNodeData(id, { params: { ...data.params, pipeline: e.target.value } })}
              className="w-full appearance-none px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
            >
              <option value="">Choose a workflow</option>
              <option value="pipeline_1">Data Processing Workflow</option>
              <option value="pipeline_2">Document Analysis Workflow</option>
              <option value="pipeline_3">Customer Support Workflow</option>
            </select>
            <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Warning Message */}
        {!data.params?.isDeployed && data.params?.pipeline && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <p className="text-xs text-amber-700 font-medium">Workflow Not Deployed</p>
              <p className="text-xs text-amber-600">Deploy your workflow to enable proper input/output connections.</p>
            </div>
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <span className={`w-2 h-2 rounded-full ${data.params?.pipeline ? 'bg-green-500' : 'bg-gray-300'}`} />
          <span>{data.params?.pipeline ? 'Workflow connected' : 'No workflow selected'}</span>
        </div>
        {data.params?.isDeployed && (
          <span className="text-blue-600 font-medium">Deployed</span>
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

export default PipelineNode;