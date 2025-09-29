import React, { useState } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Settings, Trash2, Copy, MessageSquare, Eye, EyeOff } from 'lucide-react';
import { useFlowStore } from '../../../../store/flowStore';

interface TeamsNodeData {
  params?: {
    nodeName?: string;
    webhookUrl?: string;
    message?: string;
    channel?: string;
    authToken?: string;
    showSettings?: boolean;
    messageType?: 'text' | 'adaptive-card';
    mentions?: string[];
  };
}

const TeamsNode: React.FC<NodeProps<TeamsNodeData>> = ({ id, data, selected }) => {
  const [showToken, setShowToken] = useState(false);
  const removeNode = useFlowStore((state) => state.removeNode);
  const updateNodeData = useFlowStore((state) => state.updateNodeData);

  const handleCopyNodeId = () => {
    navigator.clipboard.writeText(id);
  };

  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden ${
      selected ? 'ring-2 ring-blue-500' : 'border border-gray-200'
    }`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-medium text-white">Microsoft Teams</h3>
              <p className="text-xs text-purple-50/80">
                {data.params?.webhookUrl ? 'Configured' : 'Set webhook URL'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopyNodeId}
              className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/20 transition-colors"
              title="Copy Node ID"
            >
              <Copy className="w-4 h-4" />
            </button>
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

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Node Name */}
        <div className="space-y-2">
          <input
            type="text"
            value={data.params?.nodeName || 'teams_0'}
            onChange={(e) => updateNodeData(id, { nodeName: e.target.value })}
            className="w-full px-3 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Node name"
          />
        </div>

        {/* Webhook URL */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Webhook URL</label>
          <input
            type="text"
            value={data.params?.webhookUrl || ''}
            onChange={(e) => updateNodeData(id, { webhookUrl: e.target.value })}
            placeholder="https://outlook.office.com/webhook/..."
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
          />
        </div>

        {/* Channel */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Channel</label>
          <input
            type="text"
            value={data.params?.channel || ''}
            onChange={(e) => updateNodeData(id, { channel: e.target.value })}
            placeholder="General"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
          />
        </div>

        {/* Message Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Message Type</label>
          <select
            value={data.params?.messageType || 'text'}
            onChange={(e) => updateNodeData(id, { messageType: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
          >
            <option value="text">Text Message</option>
            <option value="adaptive-card">Adaptive Card</option>
          </select>
        </div>

        {/* Message Content */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Message</label>
          <textarea
            value={data.params?.message || ''}
            onChange={(e) => updateNodeData(id, { message: e.target.value })}
            placeholder={data.params?.messageType === 'adaptive-card' ? 
              '{"type": "AdaptiveCard", ...}' : 
              'Enter your message here...'
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm font-mono"
            rows={4}
          />
        </div>

        {/* Auth Token (Optional) */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Auth Token (Optional)</label>
          <div className="relative mt-1">
            <input
              type={showToken ? 'text' : 'password'}
              value={data.params?.authToken || ''}
              onChange={(e) => updateNodeData(id, { authToken: e.target.value })}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm pr-10"
              placeholder="Enter auth token"
            />
            <button
              type="button"
              onClick={() => setShowToken(!showToken)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {showToken ? 
                <EyeOff className="h-4 w-4 text-gray-400" /> : 
                <Eye className="h-4 w-4 text-gray-400" />
              }
            </button>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <span className={`w-2 h-2 rounded-full ${data.params?.webhookUrl ? 'bg-purple-500' : 'bg-gray-300'}`} />
          <span>{data.params?.webhookUrl ? 'Webhook configured' : 'URL required'}</span>
        </div>
        {data.params?.messageType && (
          <span className="text-purple-600 font-medium">
            {data.params.messageType === 'adaptive-card' ? 'Adaptive Card' : 'Text Message'}
          </span>
        )}
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

export default TeamsNode;