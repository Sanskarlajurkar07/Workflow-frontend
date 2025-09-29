import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { Settings, Trash2, Calendar, RefreshCw, LogIn, AlertCircle } from 'lucide-react';
import { useFlowStore } from '../../../../store/flowStore';

// Calendly API credentials (to be replaced with user's credentials)
const CALENDLY_API_KEY = 'your-calendly-api-key';

interface CalendlyNodeProps {
  id: string;
  data: {
    params?: {
      nodeName?: string;
      operation?: 'list_events' | 'create_event' | 'get_event_details' | 'list_scheduled_events' | 'cancel_event' | 'create_webhook';
      eventTypeUuid?: string;
      eventUuid?: string;
      inviteeEmail?: string;
      startTime?: string;
      endTime?: string;
      timezone?: string;
      webhookUrl?: string;
      webhookEvents?: string[];
      showSettings?: boolean;
      apiKey?: string;
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

const CalendlyNode: React.FC<CalendlyNodeProps> = ({ id, data, selected }) => {
  const [connecting, setConnecting] = useState<boolean>(false);
  const [testing, setTesting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const removeNode = useFlowStore((state) => state.removeNode);
  const updateNodeData = useFlowStore((state) => state.updateNodeData);

  const connectToCalendly = async () => {
    setConnecting(true);
    setError(null);
    
    try {
      // Simulate API validation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      updateNodeData(id, { 
        params: { 
          ...data.params, 
          apiKey: CALENDLY_API_KEY,
          isAuthenticated: true
        } 
      });
      
    } catch (err: any) {
      setError(err.message || 'Failed to authenticate with Calendly');
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
        case 'list_events':
          mockResponse = {
            status: 200,
            content: {
              collection: [
                {
                  uri: 'https://api.calendly.com/event_types/123',
                  name: '30 Minute Meeting',
                  description: 'A quick sync',
                  duration: 30,
                  kind: 'solo',
                  slug: '30min',
                  color: '#0051ff'
                },
                {
                  uri: 'https://api.calendly.com/event_types/456',
                  name: '60 Minute Meeting',
                  description: 'In-depth discussion',
                  duration: 60,
                  kind: 'solo',
                  slug: '60min',
                  color: '#ff0000'
                }
              ],
              pagination: {
                count: 2,
                next_page: null
              }
            },
            success: true,
            execution_time_ms: 450
          };
          break;
        case 'create_event':
          mockResponse = {
            status: 200,
            content: {
              uri: `https://api.calendly.com/scheduled_events/${Date.now()}`,
              name: '30 Minute Meeting',
              status: 'active',
              start_time: data.params?.startTime,
              end_time: data.params?.endTime,
              timezone: data.params?.timezone,
              invitee: {
                email: data.params?.inviteeEmail
              }
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
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-medium text-white">Calendly</h3>
              <p className="text-xs text-blue-50/80">{data.params?.nodeName || 'calendly_0'}</p>
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
              <span className="text-sm text-gray-600">Calendly Authentication</span>
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
                value={CALENDLY_API_KEY}
                placeholder="Enter your Calendly API key"
                className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                readOnly
              />
            </div>
            <button
              onClick={connectToCalendly}
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
                  <span>Connect with Calendly</span>
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
                value={data.params?.operation || 'list_events'}
                onChange={(e) => updateNodeData(id, { params: { ...data.params, operation: e.target.value } })}
                className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="list_events">List Event Types</option>
                <option value="create_event">Create Event</option>
                <option value="get_event_details">Get Event Details</option>
                <option value="list_scheduled_events">List Scheduled Events</option>
                <option value="cancel_event">Cancel Event</option>
                <option value="create_webhook">Create Webhook</option>
              </select>
            </div>

            {/* Operation-specific Fields */}
            {['create_event', 'get_event_details', 'cancel_event'].includes(data.params?.operation || '') && (
              <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-500">Event Type UUID</label>
                <input
                  type="text"
                  value={data.params?.eventTypeUuid || ''}
                  onChange={(e) => updateNodeData(id, { params: { ...data.params, eventTypeUuid: e.target.value } })}
                  placeholder="Enter event type UUID"
                  className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}

            {data.params?.operation === 'create_event' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-gray-500">Invitee Email</label>
                  <input
                    type="email"
                    value={data.params?.inviteeEmail || ''}
                    onChange={(e) => updateNodeData(id, { params: { ...data.params, inviteeEmail: e.target.value } })}
                    placeholder="Enter invitee email"
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
                    <label className="block text-xs font-medium text-gray-500">End Time</label>
                    <input
                      type="datetime-local"
                      value={data.params?.endTime || ''}
                      onChange={(e) => updateNodeData(id, { params: { ...data.params, endTime: e.target.value } })}
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
              </div>
            )}

            {data.params?.operation === 'create_webhook' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-gray-500">Webhook URL</label>
                  <input
                    type="url"
                    value={data.params?.webhookUrl || ''}
                    onChange={(e) => updateNodeData(id, { params: { ...data.params, webhookUrl: e.target.value } })}
                    placeholder="Enter webhook URL"
                    className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-gray-500">Events to Subscribe</label>
                  <select
                    multiple
                    value={data.params?.webhookEvents || []}
                    onChange={(e) => updateNodeData(id, { 
                      params: { 
                        ...data.params, 
                        webhookEvents: Array.from(e.target.selectedOptions, option => option.value)
                      } 
                    })}
                    className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="invitee.created">Invitee Created</option>
                    <option value="invitee.canceled">Invitee Canceled</option>
                    <option value="routing_form.submitted">Routing Form Submitted</option>
                  </select>
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

export default CalendlyNode; 