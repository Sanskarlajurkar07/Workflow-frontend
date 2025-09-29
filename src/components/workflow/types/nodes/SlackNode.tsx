import React, { useState, useEffect } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Settings, Trash2, Copy, Slack, ChevronRight, AlertCircle } from 'lucide-react';
import { useFlowStore } from '../../../../store/flowStore';

// Slack OAuth Configuration
const SLACK_CONFIG = {
  clientId: '8803196426178.8946644524070',
  redirectUri: 'http://localhost:8000/api/slack/oauth/callback',
  scope: 'chat:write,channels:read,channels:history,groups:read,im:read,mpim:read',
};

interface SlackNodeData {
  params?: {
    nodeName?: string;
    action?: 'send-message' | 'read-message';
    channel?: string;
    message?: string;
    oauthToken?: string;
    messageCount?: number;
    showSettings?: boolean;
    connectionStatus?: 'connected' | 'disconnected' | 'error';
    errorMessage?: string;
  };
}

interface SlackChannel {
  id: string;
  name: string;
}

const SlackNode: React.FC<NodeProps<SlackNodeData>> = ({ id, data, selected }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [channels, setChannels] = useState<SlackChannel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const removeNode = useFlowStore((state) => state.removeNode);
  const updateNodeData = useFlowStore((state) => state.updateNodeData);

  useEffect(() => {
    // Check if we have a valid OAuth token on component mount
    if (data.params?.oauthToken) {
      fetchSlackChannels();
    }
  }, [data.params?.oauthToken]);

  const handleActionChange = (action: 'send-message' | 'read-message') => {
    updateNodeData(id, { action });
    setCurrentStep(2);
  };

  const handleOAuthConnect = () => {
    // Generate a random state for CSRF protection
    const state = Math.random().toString(36).substring(7);
    sessionStorage.setItem('slackOAuthState', state);

    // Construct the Slack OAuth URL with the correct redirect_uri
    const slackAuthUrl = `https://slack.com/oauth/v2/authorize?client_id=${SLACK_CONFIG.clientId}&user_scope=${SLACK_CONFIG.scope}&redirect_uri=${encodeURIComponent(SLACK_CONFIG.redirectUri)}&state=${state}`;

    // Open Slack OAuth in a popup window
    const width = 600;
    const height = 700;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    window.open(
      slackAuthUrl,
      'Slack OAuth',
      `width=${width},height=${height},left=${left},top=${top}`
    );
  };

  const fetchSlackChannels = async () => {
    if (!data.params?.oauthToken) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/slack/channels', {
        headers: {
          'Authorization': `Bearer ${data.params.oauthToken}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch channels');

      const channelsData = await response.json();
      setChannels(channelsData.channels);
      updateNodeData(id, { connectionStatus: 'connected' });
    } catch (error) {
      console.error('Error fetching Slack channels:', error);
      updateNodeData(id, {
        connectionStatus: 'error',
        errorMessage: 'Failed to fetch channels',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Listen for OAuth callback message from popup
  useEffect(() => {
    const handleOAuthCallback = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data.type === 'SLACK_OAUTH_SUCCESS') {
        const { access_token } = event.data;
        updateNodeData(id, {
          oauthToken: access_token,
          connectionStatus: 'connected',
        });
        setCurrentStep(3);
        fetchSlackChannels();
      } else if (event.data.type === 'SLACK_OAUTH_ERROR') {
        updateNodeData(id, {
          connectionStatus: 'error',
          errorMessage: event.data.error || 'Authentication failed',
        });
      }
    };

    window.addEventListener('message', handleOAuthCallback);
    return () => window.removeEventListener('message', handleOAuthCallback);
  }, [id, updateNodeData]);

  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden ${
      selected ? 'ring-2 ring-blue-500' : 'border border-gray-200'
    }`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-cyan-600 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
              <Slack className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-medium text-white">Slack</h3>
              <p className="text-xs text-blue-50/80">
                {data.params?.connectionStatus === 'connected' ? (
                  <span className="flex items-center">
                    <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                    Connected
                  </span>
                ) : data.params?.nodeName || 'slack_1'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigator.clipboard.writeText(id)}
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

      {/* Error Message */}
      {data.params?.connectionStatus === 'error' && (
        <div className="px-4 py-2 bg-red-50 border-b border-red-100">
          <div className="flex items-center text-red-700 text-sm">
            <AlertCircle className="w-4 h-4 mr-2" />
            <span>{data.params.errorMessage || 'An error occurred'}</span>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-4 space-y-4">
        {currentStep === 1 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Select an action</h4>
            <div className="space-y-2">
              <button
                onClick={() => handleActionChange('send-message')}
                className="w-full flex items-center justify-between px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <span className="text-sm font-medium text-gray-700">Send Message</span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
              <button
                onClick={() => handleActionChange('read-message')}
                className="w-full flex items-center justify-between px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <span className="text-sm font-medium text-gray-700">Read Message</span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Connect your Slack account</h4>
            <button
              onClick={handleOAuthConnect}
              disabled={isLoading}
              className={`w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? 'Connecting...' : 'Connect with Slack'}
            </button>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-4">
            {data.params?.action === 'send-message' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Channel</label>
                  <select
                    value={data.params?.channel || ''}
                    onChange={(e) => updateNodeData(id, { channel: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  >
                    <option value="">Select a channel</option>
                    {channels.map((channel) => (
                      <option key={channel.id} value={channel.name}>
                        #{channel.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Message</label>
                  <textarea
                    value={data.params?.message || ''}
                    onChange={(e) => updateNodeData(id, { message: e.target.value })}
                    placeholder="Enter your message here..."
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    rows={4}
                  />
                </div>
              </>
            )}

            {data.params?.action === 'read-message' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Channel</label>
                  <select
                    value={data.params?.channel || ''}
                    onChange={(e) => updateNodeData(id, { channel: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  >
                    <option value="">Select a channel</option>
                    {channels.map((channel) => (
                      <option key={channel.id} value={channel.name}>
                        #{channel.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Number of Messages</label>
                  <input
                    type="number"
                    value={data.params?.messageCount || 1}
                    onChange={(e) => updateNodeData(id, { messageCount: parseInt(e.target.value, 10) })}
                    min="1"
                    max="100"
                    placeholder="Enter the number of messages to read"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Handles */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 -ml-0.5 bg-blue-500 border-2 border-white rounded-full"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 -mr-0.5 bg-blue-500 border-2 border-white rounded-full"
      />
    </div>
  );
};

export default SlackNode;