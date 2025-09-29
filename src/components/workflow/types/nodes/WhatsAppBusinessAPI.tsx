import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { Settings, Trash2, MessageSquare, RefreshCw, LogIn, AlertCircle } from 'lucide-react';
import { useFlowStore } from '../../../../store/flowStore';

// WhatsApp Business API credentials (to be replaced with user's credentials)
const WHATSAPP_ACCESS_TOKEN = 'your-whatsapp-access-token';
const WHATSAPP_PHONE_NUMBER_ID = 'your-whatsapp-phone-number-id';

interface WhatsAppBusinessAPINodeProps {
  id: string;
  data: {
    params?: {
      nodeName?: string;
      operation?: 'send_message' | 'send_template' | 'send_media' | 'send_location' | 'mark_as_read' | 'get_business_profile';
      recipientPhone?: string;
      message?: string;
      templateName?: string;
      templateLanguage?: string;
      templateComponents?: {
        type: 'header' | 'body' | 'button';
        parameters: any[];
      }[];
      mediaType?: 'image' | 'video' | 'document' | 'audio';
      mediaUrl?: string;
      caption?: string;
      location?: {
        latitude: number;
        longitude: number;
        name?: string;
        address?: string;
      };
      messageId?: string;
      showSettings?: boolean;
      accessToken?: string;
      phoneNumberId?: string;
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

const WhatsAppBusinessAPINode: React.FC<WhatsAppBusinessAPINodeProps> = ({ id, data, selected }) => {
  const [connecting, setConnecting] = useState<boolean>(false);
  const [testing, setTesting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const removeNode = useFlowStore((state) => state.removeNode);
  const updateNodeData = useFlowStore((state) => state.updateNodeData);

  const connectToWhatsApp = async () => {
    setConnecting(true);
    setError(null);
    
    try {
      // Simulate API validation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      updateNodeData(id, { 
        params: { 
          ...data.params, 
          accessToken: WHATSAPP_ACCESS_TOKEN,
          phoneNumberId: WHATSAPP_PHONE_NUMBER_ID,
          isAuthenticated: true
        } 
      });
      
    } catch (err: any) {
      setError(err.message || 'Failed to authenticate with WhatsApp Business API');
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
        case 'send_message':
          mockResponse = {
            status: 200,
            content: {
              messaging_product: 'whatsapp',
              contacts: [{ wa_id: data.params.recipientPhone }],
              messages: [{
                id: 'wamid.' + Date.now(),
                message_status: 'sent'
              }]
            },
            success: true,
            execution_time_ms: 450
          };
          break;
        case 'send_template':
          mockResponse = {
            status: 200,
            content: {
              messaging_product: 'whatsapp',
              contacts: [{ wa_id: data.params.recipientPhone }],
              messages: [{
                id: 'wamid.' + Date.now(),
                message_status: 'sent',
                template: {
                  name: data.params.templateName,
                  language: data.params.templateLanguage
                }
              }]
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
      selected ? 'ring-2 ring-green-500' : 'ring-1 ring-gray-200'
    }`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-teal-600 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-medium text-white">WhatsApp Business</h3>
              <p className="text-xs text-green-50/80">{data.params?.nodeName || 'whatsapp_0'}</p>
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
              <span className="text-sm text-gray-600">WhatsApp Business API Authentication</span>
              {error && (
                <span className="text-xs text-red-500 flex items-center">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {error}
                </span>
              )}
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-medium text-gray-500">Access Token</label>
              <input
                type="password"
                value={WHATSAPP_ACCESS_TOKEN}
                placeholder="Enter your WhatsApp access token"
                className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                readOnly
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-medium text-gray-500">Phone Number ID</label>
              <input
                type="text"
                value={WHATSAPP_PHONE_NUMBER_ID}
                placeholder="Enter your WhatsApp phone number ID"
                className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                readOnly
              />
            </div>
            <button
              onClick={connectToWhatsApp}
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
                  <span>Connect with WhatsApp</span>
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
                value={data.params?.operation || 'send_message'}
                onChange={(e) => updateNodeData(id, { params: { ...data.params, operation: e.target.value } })}
                className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="send_message">Send Message</option>
                <option value="send_template">Send Template</option>
                <option value="send_media">Send Media</option>
                <option value="send_location">Send Location</option>
                <option value="mark_as_read">Mark as Read</option>
                <option value="get_business_profile">Get Business Profile</option>
              </select>
            </div>

            {/* Common Fields */}
            {['send_message', 'send_template', 'send_media', 'send_location'].includes(data.params?.operation || '') && (
              <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-500">Recipient Phone</label>
                <input
                  type="text"
                  value={data.params?.recipientPhone || ''}
                  onChange={(e) => updateNodeData(id, { params: { ...data.params, recipientPhone: e.target.value } })}
                  placeholder="Enter recipient's phone number"
                  className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            )}

            {/* Operation-specific Fields */}
            {data.params?.operation === 'send_message' && (
              <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-500">Message</label>
                <textarea
                  value={data.params?.message || ''}
                  onChange={(e) => updateNodeData(id, { params: { ...data.params, message: e.target.value } })}
                  placeholder="Enter your message"
                  rows={4}
                  className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            )}

            {data.params?.operation === 'send_template' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-gray-500">Template Name</label>
                  <input
                    type="text"
                    value={data.params?.templateName || ''}
                    onChange={(e) => updateNodeData(id, { params: { ...data.params, templateName: e.target.value } })}
                    placeholder="Enter template name"
                    className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-gray-500">Language Code</label>
                  <input
                    type="text"
                    value={data.params?.templateLanguage || ''}
                    onChange={(e) => updateNodeData(id, { params: { ...data.params, templateLanguage: e.target.value } })}
                    placeholder="e.g., en_US"
                    className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}

            {data.params?.operation === 'send_media' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-gray-500">Media Type</label>
                  <select
                    value={data.params?.mediaType || 'image'}
                    onChange={(e) => updateNodeData(id, { params: { ...data.params, mediaType: e.target.value } })}
                    className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="image">Image</option>
                    <option value="video">Video</option>
                    <option value="document">Document</option>
                    <option value="audio">Audio</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-gray-500">Media URL</label>
                  <input
                    type="text"
                    value={data.params?.mediaUrl || ''}
                    onChange={(e) => updateNodeData(id, { params: { ...data.params, mediaUrl: e.target.value } })}
                    placeholder="Enter media URL"
                    className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-gray-500">Caption</label>
                  <input
                    type="text"
                    value={data.params?.caption || ''}
                    onChange={(e) => updateNodeData(id, { params: { ...data.params, caption: e.target.value } })}
                    placeholder="Enter media caption"
                    className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}

            {data.params?.operation === 'send_location' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-gray-500">Latitude</label>
                    <input
                      type="number"
                      step="any"
                      value={data.params?.location?.latitude || ''}
                      onChange={(e) => updateNodeData(id, { 
                        params: { 
                          ...data.params, 
                          location: { 
                            ...data.params?.location,
                            latitude: parseFloat(e.target.value) 
                          } 
                        } 
                      })}
                      placeholder="Enter latitude"
                      className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-gray-500">Longitude</label>
                    <input
                      type="number"
                      step="any"
                      value={data.params?.location?.longitude || ''}
                      onChange={(e) => updateNodeData(id, { 
                        params: { 
                          ...data.params, 
                          location: { 
                            ...data.params?.location,
                            longitude: parseFloat(e.target.value) 
                          } 
                        } 
                      })}
                      placeholder="Enter longitude"
                      className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-gray-500">Location Name</label>
                  <input
                    type="text"
                    value={data.params?.location?.name || ''}
                    onChange={(e) => updateNodeData(id, { 
                      params: { 
                        ...data.params, 
                        location: { 
                          ...data.params?.location,
                          name: e.target.value 
                        } 
                      } 
                    })}
                    placeholder="Enter location name"
                    className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-gray-500">Address</label>
                  <input
                    type="text"
                    value={data.params?.location?.address || ''}
                    onChange={(e) => updateNodeData(id, { 
                      params: { 
                        ...data.params, 
                        location: { 
                          ...data.params?.location,
                          address: e.target.value 
                        } 
                      } 
                    })}
                    placeholder="Enter address"
                    className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}

            {data.params?.operation === 'mark_as_read' && (
              <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-500">Message ID</label>
                <input
                  type="text"
                  value={data.params?.messageId || ''}
                  onChange={(e) => updateNodeData(id, { params: { ...data.params, messageId: e.target.value } })}
                  placeholder="Enter message ID"
                  className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
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

export default WhatsAppBusinessAPINode; 