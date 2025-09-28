import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { Settings, Trash2, Calendar, RefreshCw, LogIn, AlertCircle } from 'lucide-react';
import { useFlowStore } from '../../../../store/flowStore';
import { useGoogleOAuth } from '../../../../hooks/useGoogleOAuth';

// Google Calendar API credentials (to be replaced with user's credentials)
const GOOGLE_CALENDAR_API_KEY = 'your-google-calendar-api-key';
const GOOGLE_CALENDAR_CLIENT_ID = 'your-google-calendar-client-id';

interface GoogleCalendarNodeProps {
  id: string;
  data: {
    params?: {
      nodeName?: string;
      operation?: 'list_events' | 'create_event' | 'get_event' | 'update_event' | 'delete_event' | 'list_calendars';
      calendarId?: string;
      eventId?: string;
      summary?: string;
      description?: string;
      location?: string;
      startDateTime?: string;
      endDateTime?: string;
      timeZone?: string;
      attendees?: string[];
      recurrence?: string[];
      reminders?: {
        useDefault?: boolean;
        overrides?: Array<{
          method: 'email' | 'popup';
          minutes: number;
        }>;
      };
      showSettings?: boolean;
      apiKey?: string;
      clientId?: string;
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

const GoogleCalendarNode: React.FC<GoogleCalendarNodeProps> = ({ id, data, selected }) => {
  const [testing, setTesting] = useState<boolean>(false);
  const removeNode = useFlowStore((state) => state.removeNode);
  const updateNodeData = useFlowStore((state) => state.updateNodeData);

  // Use the Google OAuth hook
  const { isLoading: connecting, error, connectToGoogle } = useGoogleOAuth(id, updateNodeData);

  const handleConnect = () => {
    const scopes = [
      'https://www.googleapis.com/auth/calendar.events',
      'https://www.googleapis.com/auth/calendar.readonly'
    ];
    connectToGoogle('googlecalendar', scopes);
  };

  const testOperation = async () => {
    setTesting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      let mockResponse;
      switch (data.params?.operation) {
        case 'list_events':
          mockResponse = {
            status: 200,
            content: {
              items: [
                {
                  id: '123456789',
                  summary: 'Team Meeting',
                  description: 'Weekly sync',
                  start: {
                    dateTime: '2024-03-20T10:00:00Z',
                    timeZone: 'UTC'
                  },
                  end: {
                    dateTime: '2024-03-20T11:00:00Z',
                    timeZone: 'UTC'
                  },
                  attendees: [
                    { email: 'john@example.com' },
                    { email: 'jane@example.com' }
                  ]
                },
                {
                  id: '987654321',
                  summary: 'Project Review',
                  description: 'Monthly review',
                  start: {
                    dateTime: '2024-03-21T15:00:00Z',
                    timeZone: 'UTC'
                  },
                  end: {
                    dateTime: '2024-03-21T16:00:00Z',
                    timeZone: 'UTC'
                  },
                  attendees: [
                    { email: 'alice@example.com' },
                    { email: 'bob@example.com' }
                  ]
                }
              ]
            },
            success: true,
            execution_time_ms: 450
          };
          break;
        case 'create_event':
          mockResponse = {
            status: 201,
            content: {
              id: Date.now().toString(),
              summary: data.params?.summary,
              description: data.params?.description,
              location: data.params?.location,
              start: {
                dateTime: data.params?.startDateTime,
                timeZone: data.params?.timeZone
              },
              end: {
                dateTime: data.params?.endDateTime,
                timeZone: data.params?.timeZone
              },
              attendees: data.params?.attendees?.map(email => ({ email })),
              reminders: data.params?.reminders,
              created: new Date().toISOString()
            },
            success: true,
            execution_time_ms: 850
          };
          break;
        case 'list_calendars':
          mockResponse = {
            status: 200,
            content: {
              items: [
                {
                  id: 'primary',
                  summary: 'My Calendar',
                  description: 'Personal calendar',
                  timeZone: 'UTC',
                  accessRole: 'owner'
                },
                {
                  id: 'team@company.com',
                  summary: 'Team Calendar',
                  description: 'Shared team calendar',
                  timeZone: 'UTC',
                  accessRole: 'writer'
                }
              ]
            },
            success: true,
            execution_time_ms: 380
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
          ...(data.params || {}), 
          testResponse: mockResponse
        } 
      });
      
    } catch (err: any) {
      console.error('An error occurred while testing the operation:', err);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden ${
      selected ? 'ring-2 ring-blue-500' : 'ring-1 ring-gray-200'
    }`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-medium text-white">Google Calendar</h3>
              <p className="text-xs text-green-50/80">{data.params?.nodeName || 'google_calendar_0'}</p>
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
              <span className="text-sm text-gray-600">Google Calendar Authentication</span>
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
                value={GOOGLE_CALENDAR_API_KEY}
                placeholder="Enter your Google Calendar API key"
                className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                readOnly
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-medium text-gray-500">Client ID</label>
              <input
                type="password"
                value={GOOGLE_CALENDAR_CLIENT_ID}
                placeholder="Enter your Google Calendar client ID"
                className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                readOnly
              />
            </div>
            <button
              onClick={handleConnect}
              disabled={connecting}
              className={`w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg text-white ${
                connecting ? 'bg-green-400' : 'bg-green-500 hover:bg-green-600'
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
                  <span>Connect with Google Calendar</span>
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
                className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="list_calendars">List Calendars</option>
                <option value="list_events">List Events</option>
                <option value="create_event">Create Event</option>
                <option value="get_event">Get Event</option>
                <option value="update_event">Update Event</option>
                <option value="delete_event">Delete Event</option>
              </select>
            </div>

            {/* Calendar Selection */}
            {data.params?.operation !== 'list_calendars' && (
              <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-500">Calendar ID</label>
                <input
                  type="text"
                  value={data.params?.calendarId || 'primary'}
                  onChange={(e) => updateNodeData(id, { params: { ...data.params, calendarId: e.target.value } })}
                  placeholder="Enter calendar ID or 'primary'"
                  className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            )}

            {/* Event ID for specific operations */}
            {['get_event', 'update_event', 'delete_event'].includes(data.params?.operation || '') && (
              <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-500">Event ID</label>
                <input
                  type="text"
                  value={data.params?.eventId || ''}
                  onChange={(e) => updateNodeData(id, { params: { ...data.params, eventId: e.target.value } })}
                  placeholder="Enter event ID"
                  className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            )}

            {/* Event Details */}
            {['create_event', 'update_event'].includes(data.params?.operation || '') && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-gray-500">Summary</label>
                  <input
                    type="text"
                    value={data.params?.summary || ''}
                    onChange={(e) => updateNodeData(id, { params: { ...data.params, summary: e.target.value } })}
                    placeholder="Enter event summary"
                    className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-gray-500">Description</label>
                  <textarea
                    value={data.params?.description || ''}
                    onChange={(e) => updateNodeData(id, { params: { ...data.params, description: e.target.value } })}
                    placeholder="Enter event description"
                    rows={3}
                    className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-gray-500">Location</label>
                  <input
                    type="text"
                    value={data.params?.location || ''}
                    onChange={(e) => updateNodeData(id, { params: { ...data.params, location: e.target.value } })}
                    placeholder="Enter event location"
                    className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-gray-500">Start Time</label>
                    <input
                      type="datetime-local"
                      value={data.params?.startDateTime || ''}
                      onChange={(e) => updateNodeData(id, { params: { ...data.params, startDateTime: e.target.value } })}
                      className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-gray-500">End Time</label>
                    <input
                      type="datetime-local"
                      value={data.params?.endDateTime || ''}
                      onChange={(e) => updateNodeData(id, { params: { ...data.params, endDateTime: e.target.value } })}
                      className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-gray-500">Time Zone</label>
                  <select
                    value={data.params?.timeZone || 'UTC'}
                    onChange={(e) => updateNodeData(id, { params: { ...data.params, timeZone: e.target.value } })}
                    className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">America/New_York</option>
                    <option value="Europe/London">Europe/London</option>
                    <option value="Asia/Tokyo">Asia/Tokyo</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-gray-500">Attendees (one email per line)</label>
                  <textarea
                    value={data.params?.attendees?.join('\n') || ''}
                    onChange={(e) => updateNodeData(id, {
                      params: {
                        ...data.params,
                        attendees: e.target.value.split('\n').filter(email => email.trim())
                      }
                    })}
                    placeholder="Enter attendee emails"
                    rows={3}
                    className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-gray-500">Reminders</label>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={data.params?.reminders?.useDefault}
                        onChange={(e) => updateNodeData(id, {
                          params: {
                            ...data.params,
                            reminders: { ...data.params?.reminders, useDefault: e.target.checked }
                          }
                        })}
                        className="rounded border-gray-300 text-green-500 focus:ring-green-500"
                      />
                      <span className="text-sm text-gray-600">Use default reminders</span>
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
                  testing ? 'bg-gray-400' : 'bg-green-500 hover:bg-green-600'
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
        className="w-3 h-3 -ml-0.5 bg-green-500 border-2 border-white rounded-full"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 -mr-0.5 bg-green-500 border-2 border-white rounded-full"
      />
    </div>
  );
};

export default GoogleCalendarNode; 