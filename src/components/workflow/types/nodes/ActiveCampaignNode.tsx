import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { Settings, Trash2, Megaphone, RefreshCw, LogIn, AlertCircle } from 'lucide-react';
import { useFlowStore } from '../../../../store/flowStore';

// ActiveCampaign API credentials (to be replaced with user's credentials)
const AC_API_KEY = 'your-activecampaign-api-key';
const AC_API_URL = 'https://your-account.api-us1.com'; // e.g., https://account.api-us1.com

interface ActiveCampaignNodeProps {
  id: string;
  data: {
    params?: {
      nodeName?: string;
      operation?: 'list_contacts' | 'add_contact' | 'update_contact' | 'create_automation' | 'trigger_automation' | 'get_contact_tags';
      contactId?: string;
      email?: string;
      firstName?: string;
      lastName?: string;
      phone?: string;
      automationId?: string;
      tags?: string[];
      customFields?: {
        [key: string]: string;
      };
      showSettings?: boolean;
      apiKey?: string;
      apiUrl?: string;
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

const ActiveCampaignNode: React.FC<ActiveCampaignNodeProps> = ({ id, data, selected }) => {
  const [connecting, setConnecting] = useState<boolean>(false);
  const [testing, setTesting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const removeNode = useFlowStore((state) => state.removeNode);
  const updateNodeData = useFlowStore((state) => state.updateNodeData);

  const connectToActiveCampaign = async () => {
    setConnecting(true);
    setError(null);
    
    try {
      // Simulate API validation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      updateNodeData(id, { 
        params: { 
          ...data.params, 
          apiKey: AC_API_KEY,
          apiUrl: AC_API_URL,
          isAuthenticated: true
        } 
      });
      
    } catch (err: any) {
      setError(err.message || 'Failed to authenticate with ActiveCampaign');
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
        case 'list_contacts':
          mockResponse = {
            status: 200,
            content: {
              contacts: [
                { id: '1', email: 'john@example.com', firstName: 'John', lastName: 'Doe' },
                { id: '2', email: 'jane@example.com', firstName: 'Jane', lastName: 'Smith' },
                { id: '3', email: 'bob@example.com', firstName: 'Bob', lastName: 'Johnson' }
              ],
              meta: { total: 3 }
            },
            success: true,
            execution_time_ms: 450
          };
          break;
        case 'add_contact':
          mockResponse = {
            status: 200,
            content: {
              contact: {
                id: Date.now().toString(),
                email: data.params?.email,
                firstName: data.params?.firstName,
                lastName: data.params?.lastName,
                phone: data.params?.phone
              }
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
      selected ? 'ring-2 ring-purple-500' : 'ring-1 ring-gray-200'
    }`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
              <Megaphone className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-medium text-white">ActiveCampaign</h3>
              <p className="text-xs text-purple-50/80">{data.params?.nodeName || 'activecampaign_0'}</p>
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
              <span className="text-sm text-gray-600">ActiveCampaign Authentication</span>
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
                value={AC_API_KEY}
                placeholder="Enter your ActiveCampaign API key"
                className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                readOnly
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-medium text-gray-500">API URL</label>
              <input
                type="text"
                value={AC_API_URL}
                placeholder="https://your-account.api-us1.com"
                className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                readOnly
              />
            </div>
            <button
              onClick={connectToActiveCampaign}
              disabled={connecting}
              className={`w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg text-white ${
                connecting ? 'bg-purple-400' : 'bg-purple-500 hover:bg-purple-600'
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
                  <span>Connect with ActiveCampaign</span>
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
                value={data.params?.operation || 'list_contacts'}
                onChange={(e) => updateNodeData(id, { params: { ...data.params, operation: e.target.value } })}
                className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="list_contacts">List Contacts</option>
                <option value="add_contact">Add Contact</option>
                <option value="update_contact">Update Contact</option>
                <option value="create_automation">Create Automation</option>
                <option value="trigger_automation">Trigger Automation</option>
                <option value="get_contact_tags">Get Contact Tags</option>
              </select>
            </div>

            {/* Operation-specific Fields */}
            {['add_contact', 'update_contact'].includes(data.params?.operation || '') && (
              <div className="space-y-4">
                {data.params?.operation === 'update_contact' && (
                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-gray-500">Contact ID</label>
                    <input
                      type="text"
                      value={data.params?.contactId || ''}
                      onChange={(e) => updateNodeData(id, { params: { ...data.params, contactId: e.target.value } })}
                      placeholder="Enter contact ID"
                      className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-gray-500">Email Address</label>
                  <input
                    type="email"
                    value={data.params?.email || ''}
                    onChange={(e) => updateNodeData(id, { params: { ...data.params, email: e.target.value } })}
                    placeholder="contact@example.com"
                    className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-gray-500">First Name</label>
                    <input
                      type="text"
                      value={data.params?.firstName || ''}
                      onChange={(e) => updateNodeData(id, { params: { ...data.params, firstName: e.target.value } })}
                      placeholder="First name"
                      className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-gray-500">Last Name</label>
                    <input
                      type="text"
                      value={data.params?.lastName || ''}
                      onChange={(e) => updateNodeData(id, { params: { ...data.params, lastName: e.target.value } })}
                      placeholder="Last name"
                      className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-gray-500">Phone Number</label>
                  <input
                    type="tel"
                    value={data.params?.phone || ''}
                    onChange={(e) => updateNodeData(id, { params: { ...data.params, phone: e.target.value } })}
                    placeholder="+1234567890"
                    className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}

            {['create_automation', 'trigger_automation'].includes(data.params?.operation || '') && (
              <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-500">Automation ID</label>
                <input
                  type="text"
                  value={data.params?.automationId || ''}
                  onChange={(e) => updateNodeData(id, { params: { ...data.params, automationId: e.target.value } })}
                  placeholder="Enter automation ID"
                  className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            )}

            {/* Test Operation Button */}
            <div className="flex items-center justify-between pt-4">
              <button
                onClick={testOperation}
                disabled={testing}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-white ${
                  testing ? 'bg-gray-400' : 'bg-purple-500 hover:bg-purple-600'
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

export default ActiveCampaignNode; 