import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { Settings, Trash2, Video, RefreshCw, LogIn, AlertCircle } from 'lucide-react';
import { useFlowStore } from '../../../../store/flowStore';

// Zoom API credentials (to be replaced with user's credentials)
const ZOOM_API_KEY = 'your-zoom-api-key';
const ZOOM_API_SECRET = 'your-zoom-api-secret';

interface ZoomNodeProps {
  id: string;
  data: {
    params?: {
      nodeName?: string;
      operation?: 'create_meeting' | 'list_meetings' | 'get_meeting' | 'update_meeting' | 'delete_meeting' | 'list_recordings';
      meetingId?: string;
      topic?: string;
      startTime?: string;
      duration?: number;
      timezone?: string;
      password?: string;
      settings?: {
        host_video?: boolean;
        participant_video?: boolean;
        join_before_host?: boolean;
        mute_upon_entry?: boolean;
        waiting_room?: boolean;
      };
      showSettings?: boolean;
      apiKey?: string;
      apiSecret?: string;
      isAuthenticated?: boolean;
      testResponse?: {
        status?: number;
        content?: any;
        success?: boolean;
        execution_time_ms?: number;
      };
    };
  };
  selected?: boolean;
}

const ZoomNode: React.FC<ZoomNodeProps> = ({ id, data, selected }) => {
  const [connecting, setConnecting] = useState<boolean>(false);
  const [testing, setTesting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const removeNode = useFlowStore((state) => state.removeNode);
  const updateNodeData = useFlowStore((state) => state.updateNodeData);

  const connectToZoom = async () => {
    setConnecting(true);
    setError(null);
    
    try {
      // Simulate API validation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      updateNodeData(id, { 
        params: { 
          ...data.params, 
          apiKey: ZOOM_API_KEY,
          apiSecret: ZOOM_API_SECRET,
          isAuthenticated: true
        } 
      });
      
    } catch (err: any) {
      setError(err.message || 'Failed to authenticate with Zoom');
    } finally {
      setConnecting(false);
    }
  };

  const testOperation = async () => {
    setTesting(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      let mockResponse;
      switch (data.params?.operation) {
        case 'list_meetings':
          mockResponse = {
            status: 200,
            content: {
              meetings: [
                {
                  id: '123456789',
                  topic: 'Weekly Team Sync',
                  type: 2,
                  start_time: '2024-03-20T10:00:00Z',
                  duration: 60,
                  timezone: 'UTC',
                  created_at: '2024-03-19T08:00:00Z',
                  join_url: 'https://zoom.us/j/123456789'
                },
                {
                  id: '987654321',
                  topic: 'Project Review',
                  type: 2,
                  start_time: '2024-03-21T15:00:00Z',
                  duration: 45,
                  timezone: 'UTC',
                  created_at: '2024-03-19T09:00:00Z',
                  join_url: 'https://zoom.us/j/987654321'
                }
              ],
              total_records: 2
            },
            success: true,
            execution_time_ms: 450
          };
          break;
        case 'create_meeting':
          mockResponse = {
            status: 201,
            content: {
              id: Date.now().toString(),
              topic: data.params?.topic,
              type: 2,
              start_time: data.params?.startTime,
              duration: data.params?.duration,
              timezone: data.params?.timezone,
              password: data.params?.password,
              settings: data.params?.settings,
              join_url: `https://zoom.us/j/${Date.now()}`,
              created_at: new Date().toISOString()
            },
            success: true,
            execution_time_ms: 850
          };
          break;
        default:
          mockResponse = {
            status: 200,
            content: { message: "Operation completed successfully" },
            success: true,
            execution_time_ms: 380
          };
      }
      
      updateNodeData(id, { 
        params: { 
          ...data.params, 
          testResponse: mockResponse
        } 
      });
      
    } catch (err: any) {
      setError(err.message || 'An error occurred while testing the operation');
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden ${
      selected ? 'ring-2 ring-blue-500' : 'ring-1 ring-gray-200'
    }`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
              <Video className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-medium text-white">Zoom</h3>
              <p className="text-xs text-blue-50/80">{data.params?.nodeName || 'zoom_0'}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => updateNodeData(id, { params: { ...data.params, showSettings: !data.params?.showSettings } })}
              className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/20 transition-colors"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={() => removeNode(id)}
              className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/20 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 space-y-4">
        {!data.params?.isAuthenticated ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Zoom Authentication</span>
              {error && (
                <span className="text-xs text-red-500 flex items-center">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {error}
                </span>
              )}
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-medium text-gray-500">API Key</label>
              <input
                type="password"
                value={ZOOM_API_KEY}
                placeholder="Enter your Zoom API key"
                className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                readOnly
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-medium text-gray-500">API Secret</label>
              <input
                type="password"
                value={ZOOM_API_SECRET}
                placeholder="Enter your Zoom API secret"
                className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                readOnly
              />
            </div>
            <button
              onClick={connectToZoom}
              disabled={connecting}
              className={`w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg text-white ${
                connecting ? 'bg-blue-400' : 'bg-blue-500 hover:bg-blue-600'
              } transition-colors`}
            >
              {connecting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Connect with Zoom</span>
                </>
              )}
            </button>
          </div>
        ) : (
          <>
            {/* Operation Selection */}
            <div className="space-y-2">
              <label className="block text-xs font-medium text-gray-500">Operation</label>
              <select
                value={data.params?.operation || 'list_meetings'}
                onChange={(e) => updateNodeData(id, { params: { ...data.params, operation: e.target.value } })}
                className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="create_meeting">Create Meeting</option>
                <option value="list_meetings">List Meetings</option>
                <option value="get_meeting">Get Meeting</option>
                <option value="update_meeting">Update Meeting</option>
                <option value="delete_meeting">Delete Meeting</option>
                <option value="list_recordings">List Recordings</option>
              </select>
            </div>

            {/* Operation-specific Fields */}
            {['get_meeting', 'update_meeting', 'delete_meeting'].includes(data.params?.operation || '') && (
              <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-500">Meeting ID</label>
                <input
                  type="text"
                  value={data.params?.meetingId || ''}
                  onChange={(e) => updateNodeData(id, { params: { ...data.params, meetingId: e.target.value } })}
                  placeholder="Enter meeting ID"
                  className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}

            {['create_meeting', 'update_meeting'].includes(data.params?.operation || '') && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-gray-500">Topic</label>
                  <input
                    type="text"
                    value={data.params?.topic || ''}
                    onChange={(e) => updateNodeData(id, { params: { ...data.params, topic: e.target.value } })}
                    placeholder="Enter meeting topic"
                    className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-gray-500">Start Time</label>
                    <input
                      type="datetime-local"
                      value={data.params?.startTime || ''}
                      onChange={(e) => updateNodeData(id, { params: { ...data.params, startTime: e.target.value } })}
                      className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-gray-500">Duration (minutes)</label>
                    <input
                      type="number"
                      value={data.params?.duration || 30}
                      onChange={(e) => updateNodeData(id, { params: { ...data.params, duration: parseInt(e.target.value) } })}
                      min={15}
                      step={15}
                      className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-gray-500">Timezone</label>
                  <select
                    value={data.params?.timezone || 'UTC'}
                    onChange={(e) => updateNodeData(id, { params: { ...data.params, timezone: e.target.value } })}
                    className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">America/New_York</option>
                    <option value="Europe/London">Europe/London</option>
                    <option value="Asia/Tokyo">Asia/Tokyo</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-gray-500">Password</label>
                  <input
                    type="text"
                    value={data.params?.password || ''}
                    onChange={(e) => updateNodeData(id, { params: { ...data.params, password: e.target.value } })}
                    placeholder="Enter meeting password"
                    className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-gray-500">Meeting Settings</label>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={data.params?.settings?.host_video}
                        onChange={(e) => updateNodeData(id, {
                          params: {
                            ...data.params,
                            settings: { ...data.params?.settings, host_video: e.target.checked }
                          }
                        })}
                        className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-600">Start video when host joins</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={data.params?.settings?.participant_video}
                        onChange={(e) => updateNodeData(id, {
                          params: {
                            ...data.params,
                            settings: { ...data.params?.settings, participant_video: e.target.checked }
                          }
                        })}
                        className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-600">Start video when participants join</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={data.params?.settings?.join_before_host}
                        onChange={(e) => updateNodeData(id, {
                          params: {
                            ...data.params,
                            settings: { ...data.params?.settings, join_before_host: e.target.checked }
                          }
                        })}
                        className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-600">Allow join before host</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={data.params?.settings?.mute_upon_entry}
                        onChange={(e) => updateNodeData(id, {
                          params: {
                            ...data.params,
                            settings: { ...data.params?.settings, mute_upon_entry: e.target.checked }
                          }
                        })}
                        className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-600">Mute participants upon entry</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={data.params?.settings?.waiting_room}
                        onChange={(e) => updateNodeData(id, {
                          params: {
                            ...data.params,
                            settings: { ...data.params?.settings, waiting_room: e.target.checked }
                          }
                        })}
                        className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-600">Enable waiting room</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Test Operation Button */}
            <div className="flex items-center justify-between pt-4">
              <button
                onClick={testOperation}
                disabled={testing}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-white ${
                  testing ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'
                } transition-colors`}
              >
                {testing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Testing...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    <span>Test Operation</span>
                  </>
                )}
              </button>

              {data.params?.testResponse?.status && (
                <div className="flex items-center space-x-2">
                  <div className={`h-2 w-2 rounded-full ${data.params.testResponse.success ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span className="text-sm text-gray-600">
                    Status: {data.params.testResponse.status}
                  </span>
                </div>
              )}
            </div>

            {/* Response Display */}
            {data.params?.testResponse && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <pre className="text-xs font-mono overflow-auto">
                  {JSON.stringify(data.params.testResponse.content, null, 2)}
                </pre>
              </div>
            )}
          </>
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

export default ZoomNode; 