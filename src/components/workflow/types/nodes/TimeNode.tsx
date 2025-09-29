import React from 'react';
import { Handle, Position } from 'reactflow';
import { Trash2, Settings, Clock, ChevronDown } from 'lucide-react';
import { useFlowStore } from '../../../../store/flowStore';

interface TimeNodeProps {
  data: {
    params?: {
      nodeName?: string;
      timezone?: string;
      showSettings?: boolean;
    };
  };
  id: string;
  selected?: boolean;
}

const TimeNode: React.FC<TimeNodeProps> = ({ data, id, selected }) => {
  // Get functions from store
  const removeNode = useFlowStore((state) => state.removeNode);
  const updateNodeData = useFlowStore((state) => state.updateNodeData);

  return (
    <div className={`bg-white rounded-lg shadow-lg overflow-hidden ${
      selected ? 'ring-2 ring-blue-500' : 'border border-gray-200'
    }`}>
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-500 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-medium text-white">Time Node</h3>
              <p className="text-xs text-blue-50/80">{data.params?.timezone || 'UTC'}</p>
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
              onClick={() => removeNode(id)}
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
                value={data.params?.nodeName || 'time_0'}
                onChange={(e) => updateNodeData(id, { nodeName: e.target.value })}
                className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="p-4 space-y-4">
        <div className="bg-blue-50 rounded-md p-3">
          <p className="text-xs text-blue-600">
            Outputs the current time in the selected timezone. Connect to LLM nodes for time-aware responses.
          </p>
        </div>

        {/* Timezone Selection */}
        <div className="space-y-2">
          <label className="block text-xs font-medium text-gray-500">Timezone</label>
          <div className="relative">
            <select
              value={data.params?.timezone || 'UTC'}
              onChange={(e) => updateNodeData(id, { timezone: e.target.value })}
              className="w-full appearance-none px-3 py-2 bg-white text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
            >
              <option value="UTC">UTC | GMT+00:00</option>
              <option value="America/New_York">America/New York | GMT-04:00</option>
              <option value="Europe/London">Europe/London | GMT+01:00</option>
              <option value="Asia/Kolkata">Asia/Kolkata | GMT+05:30</option>
              <option value="Asia/Tokyo">Asia/Tokyo | GMT+09:00</option>
              <option value="Australia/Sydney">Australia/Sydney | GMT+10:00</option>
              <option value="Pacific/Auckland">Pacific/Auckland | GMT+12:00</option>
            </select>
            <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-green-500" />
          <span>Active</span>
        </span>
        <span>Updates: Real-time</span>
      </div>

      {/* Handle */}
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 -mr-0.5 bg-blue-500 border-2 border-white rounded-full"
      />
    </div>
  );
};

export default TimeNode;