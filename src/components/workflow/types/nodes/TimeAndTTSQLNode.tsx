import React from 'react';
import { Trash2 } from 'lucide-react';

interface TimeAndTTSQLNodeProps {
  data: {
    type: string;
    params?: {
      nodeName?: string;
      timezone?: string;
      query?: string;
    };
  };
  id: string;
  updateNodeData: (id: string, params: any) => void;
  removeNode: (id: string) => void;
}

const TimeAndTTSQLNode: React.FC<TimeAndTTSQLNodeProps> = ({ data, id, updateNodeData, removeNode }) => {
  return (
    <div className="p-3">
      {/* Header with Icon, Title, and Delete Button */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <div className="text-blue-600">
            {data.type === 'time' ? '🕒' : '📊'} {/* Icon for Time and TTSQL */}
          </div>
          <div className="text-sm font-medium text-gray-900">
            {data.type === 'time' ? 'Time' : 'TTSQL'}
          </div>
        </div>
        <button
          onClick={() => removeNode(id)}
          className="text-gray-400 hover:text-red-500 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Node Content */}
      <div className="space-y-2">
        {data.type === 'time' && (
          <>
            <p className="text-xs text-gray-500">
              Outputs the current time (often connected to LLM node)
            </p>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Node Name</label>
              <input
                type="text"
                value={data.params?.nodeName || 'time_0'}
                onChange={(e) => updateNodeData(id, { nodeName: e.target.value })}
                className="w-full text-sm border border-gray-200 rounded px-2 py-1"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Timezone</label>
              <select
                value={data.params?.timezone || 'America/New_York'}
                onChange={(e) => updateNodeData(id, { timezone: e.target.value })}
                className="w-full text-sm border border-gray-200 rounded px-2 py-1"
              >
                <option value="UTC">UTC | GMT+00:00</option>
                <option value="America/New_York">America/New York | GMT-04:00</option>
                <option value="Europe/London">Europe/London | GMT+01:00</option>
                <option value="Asia/Kolkata">Asia/Kolkata | GMT+05:30</option>
                <option value="Asia/Tokyo">Asia/Tokyo | GMT+09:00</option>
                <option value="Australia/Sydney">Australia/Sydney | GMT+10:00</option>
                <option value="Pacific/Auckland">Pacific/Auckland | GMT+12:00</option>
              </select>
            </div>
          </>
        )}

        {data.type === 'ttsql' && (
          <>
            <p className="text-xs text-gray-500">
              SQL transformation for structured data processing.
            </p>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Node Name</label>
              <input
                type="text"
                value={data.params?.nodeName || 'ttsql_0'}
                onChange={(e) => updateNodeData(id, { nodeName: e.target.value })}
                className="w-full text-sm border border-gray-200 rounded px-2 py-1"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Query</label>
              <textarea
                placeholder="SELECT * FROM table_name WHERE condition"
                value={data.params?.query || ''}
                onChange={(e) => updateNodeData(id, { query: e.target.value })}
                className="w-full text-sm border border-gray-200 rounded px-2 py-1"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TimeAndTTSQLNode;