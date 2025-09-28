import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { Settings, Trash2, Mail, RefreshCw, LogIn, AlertCircle } from 'lucide-react';
import { useFlowStore } from '../../../../store/flowStore';

// MailChimp API credentials (to be replaced with user's credentials)
const MAILCHIMP_API_KEY = 'your-mailchimp-api-key';
const MAILCHIMP_SERVER_PREFIX = 'us1'; // e.g., us1, us2, etc.

interface MailChimpNodeProps {
  id: string;
  data: {
    params?: {
      nodeName?: string;
      operation?: 'list_audiences' | 'add_subscriber' | 'remove_subscriber' | 'create_campaign' | 'send_campaign' | 'get_campaign_stats';
      audienceId?: string;
      email?: string;
      mergeFields?: {
        FNAME?: string;
        LNAME?: string;
        [key: string]: string | undefined;
      };
      campaignInfo?: {
        title?: string;
        subject?: string;
        fromName?: string;
        fromEmail?: string;
        content?: string;
      };
      showSettings?: boolean;
      apiKey?: string;
      serverPrefix?: string;
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

const MailChimpNode: React.FC<MailChimpNodeProps> = ({ id, data, selected }) => {
  const [connecting, setConnecting] = useState<boolean>(false);
  const [testing, setTesting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const removeNode = useFlowStore((state) => state.removeNode);
  const updateNodeData = useFlowStore((state) => state.updateNodeData);

  const connectToMailChimp = async () => {
    setConnecting(true);
    setError(null);
    
    try {
      // Simulate API validation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      updateNodeData(id, { 
        params: { 
          ...data.params, 
          apiKey: MAILCHIMP_API_KEY,
          serverPrefix: MAILCHIMP_SERVER_PREFIX,
          isAuthenticated: true
        } 
      });
      
    } catch (err: any) {
      setError(err.message || 'Failed to authenticate with MailChimp');
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
        case 'list_audiences':
          mockResponse = {
            status: 200,
            content: {
              lists: [
                { id: 'list1', name: 'Newsletter Subscribers', member_count: 1250 },
                { id: 'list2', name: 'Product Updates', member_count: 850 },
                { id: 'list3', name: 'Blog Subscribers', member_count: 2100 }
              ]
            },
            success: true,
            execution_time_ms: 450
          };
          break;
        case 'add_subscriber':
          mockResponse = {
            status: 200,
            content: {
              email: data.params?.email,
              status: 'subscribed',
              merge_fields: data.params?.mergeFields,
              timestamp_signup: new Date().toISOString()
            },
            success: true,
            execution_time_ms: 650
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
      selected ? 'ring-2 ring-orange-500' : 'ring-1 ring-gray-200'
    }`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-600 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
              <Mail className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-medium text-white">MailChimp</h3>
              <p className="text-xs text-orange-50/80">{data.params?.nodeName || 'mailchimp_0'}</p>
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
              <span className="text-sm text-gray-600">MailChimp Authentication</span>
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
                value={MAILCHIMP_API_KEY}
                placeholder="Enter your MailChimp API key"
                className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                readOnly
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-medium text-gray-500">Server Prefix</label>
              <input
                type="text"
                value={MAILCHIMP_SERVER_PREFIX}
                placeholder="e.g., us1"
                className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                readOnly
              />
            </div>
            <button
              onClick={connectToMailChimp}
              disabled={connecting}
              className={`w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg text-white ${
                connecting ? 'bg-orange-400' : 'bg-orange-500 hover:bg-orange-600'
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
                  <span>Connect with MailChimp</span>
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
                value={data.params?.operation || 'list_audiences'}
                onChange={(e) => updateNodeData(id, { params: { ...data.params, operation: e.target.value } })}
                className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="list_audiences">List Audiences</option>
                <option value="add_subscriber">Add Subscriber</option>
                <option value="remove_subscriber">Remove Subscriber</option>
                <option value="create_campaign">Create Campaign</option>
                <option value="send_campaign">Send Campaign</option>
                <option value="get_campaign_stats">Get Campaign Stats</option>
              </select>
            </div>

            {/* Operation-specific Fields */}
            {['add_subscriber', 'remove_subscriber'].includes(data.params?.operation || '') && (
              <>
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-gray-500">Audience ID</label>
                  <input
                    type="text"
                    value={data.params?.audienceId || ''}
                    onChange={(e) => updateNodeData(id, { params: { ...data.params, audienceId: e.target.value } })}
                    placeholder="Enter audience ID"
                    className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-gray-500">Email Address</label>
                  <input
                    type="email"
                    value={data.params?.email || ''}
                    onChange={(e) => updateNodeData(id, { params: { ...data.params, email: e.target.value } })}
                    placeholder="subscriber@example.com"
                    className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </>
            )}

            {data.params?.operation === 'add_subscriber' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-gray-500">First Name</label>
                  <input
                    type="text"
                    value={data.params?.mergeFields?.FNAME || ''}
                    onChange={(e) => updateNodeData(id, { 
                      params: { 
                        ...data.params, 
                        mergeFields: { 
                          ...data.params?.mergeFields,
                          FNAME: e.target.value 
                        } 
                      } 
                    })}
                    placeholder="First name"
                    className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-gray-500">Last Name</label>
                  <input
                    type="text"
                    value={data.params?.mergeFields?.LNAME || ''}
                    onChange={(e) => updateNodeData(id, { 
                      params: { 
                        ...data.params, 
                        mergeFields: { 
                          ...data.params?.mergeFields,
                          LNAME: e.target.value 
                        } 
                      } 
                    })}
                    placeholder="Last name"
                    className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}

            {['create_campaign', 'send_campaign'].includes(data.params?.operation || '') && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-gray-500">Campaign Title</label>
                  <input
                    type="text"
                    value={data.params?.campaignInfo?.title || ''}
                    onChange={(e) => updateNodeData(id, { 
                      params: { 
                        ...data.params, 
                        campaignInfo: { 
                          ...data.params?.campaignInfo,
                          title: e.target.value 
                        } 
                      } 
                    })}
                    placeholder="Campaign title"
                    className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-gray-500">Subject Line</label>
                  <input
                    type="text"
                    value={data.params?.campaignInfo?.subject || ''}
                    onChange={(e) => updateNodeData(id, { 
                      params: { 
                        ...data.params, 
                        campaignInfo: { 
                          ...data.params?.campaignInfo,
                          subject: e.target.value 
                        } 
                      } 
                    })}
                    placeholder="Email subject line"
                    className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-gray-500">Campaign Content</label>
                  <textarea
                    value={data.params?.campaignInfo?.content || ''}
                    onChange={(e) => updateNodeData(id, { 
                      params: { 
                        ...data.params, 
                        campaignInfo: { 
                          ...data.params?.campaignInfo,
                          content: e.target.value 
                        } 
                      } 
                    })}
                    placeholder="Campaign content (HTML supported)"
                    rows={4}
                    className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}

            {/* Test Operation Button */}
            <div className="flex items-center justify-between pt-4">
              <button
                onClick={testOperation}
                disabled={testing}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-white ${
                  testing ? 'bg-gray-400' : 'bg-orange-500 hover:bg-orange-600'
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
        className="w-3 h-3 -ml-0.5 bg-orange-500 border-2 border-white rounded-full"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 -mr-0.5 bg-orange-500 border-2 border-white rounded-full"
      />
    </div>
  );
};

export default MailChimpNode; 