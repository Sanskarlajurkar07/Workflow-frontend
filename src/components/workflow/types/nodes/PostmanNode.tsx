import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { Settings, Trash2, Send, RefreshCw, LogIn, AlertCircle } from 'lucide-react';
import { useFlowStore } from '../../../../store/flowStore';

// Postman API credentials (to be replaced with user's credentials)
const POSTMAN_API_KEY = 'your-postman-api-key';

interface PostmanNodeProps {
  id: string;
  data: {
    params?: {
      nodeName?: string;
      operation?: 'list_collections' | 'run_collection' | 'create_collection' | 'create_request' | 'run_request' | 'get_environment';
      collectionId?: string;
      collectionName?: string;
      requestName?: string;
      requestUrl?: string;
      requestMethod?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
      requestHeaders?: { key: string; value: string }[];
      requestBody?: string;
      environmentId?: string;
      variables?: { key: string; value: string }[];
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

const PostmanNode: React.FC<PostmanNodeProps> = ({ id, data, selected }) => {
  const [connecting, setConnecting] = useState<boolean>(false);
  const [testing, setTesting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const removeNode = useFlowStore((state) => state.removeNode);
  const updateNodeData = useFlowStore((state) => state.updateNodeData);

  const connectToPostman = async () => {
    setConnecting(true);
    setError(null);
    
    try {
      // Simulate API validation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      updateNodeData(id, { 
        params: { 
          ...data.params, 
          apiKey: POSTMAN_API_KEY,
          isAuthenticated: true
        } 
      });
      
    } catch (err: any) {
      setError(err.message || 'Failed to authenticate with Postman');
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
        case 'list_collections':
          mockResponse = {
            status: 200,
            content: {
              collections: [
                {
                  id: 'col-1',
                  name: 'API Tests',
                  owner: 'John Doe',
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
                },
                {
                  id: 'col-2',
                  name: 'Integration Tests',
                  owner: 'Jane Smith',
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
                }
              ]
            },
            success: true,
            execution_time_ms: 450
          };
          break;
        case 'run_request':
          mockResponse = {
            status: 200,
            content: {
              execution: {
                id: 'exec-' + Date.now(),
                requestId: data.params.requestName,
                url: data.params.requestUrl,
                method: data.params.requestMethod,
                response: {
                  code: 200,
                  status: 'OK',
                  headers: {
                    'content-type': 'application/json'
                  },
                  body: {
                    message: 'Request executed successfully'
                  }
                },
                startTime: new Date().toISOString(),
                endTime: new Date().toISOString()
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
      selected ? 'ring-2 ring-orange-500' : 'ring-1 ring-gray-200'
    }`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
              <Send className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-medium text-white">Postman</h3>
              <p className="text-xs text-orange-50/80">{data.params?.nodeName || 'postman_0'}</p>
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
              <span className="text-sm text-gray-600">Postman Authentication</span>
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
                value={POSTMAN_API_KEY}
                placeholder="Enter your Postman API key"
                className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                readOnly
              />
            </div>
            <button
              onClick={connectToPostman}
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
                  <span>Connect with Postman</span>
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
                value={data.params?.operation || 'list_collections'}
                onChange={(e) => updateNodeData(id, { params: { ...data.params, operation: e.target.value } })}
                className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="list_collections">List Collections</option>
                <option value="run_collection">Run Collection</option>
                <option value="create_collection">Create Collection</option>
                <option value="create_request">Create Request</option>
                <option value="run_request">Run Request</option>
                <option value="get_environment">Get Environment</option>
              </select>
            </div>

            {/* Operation-specific Fields */}
            {['run_collection', 'create_request'].includes(data.params?.operation || '') && (
              <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-500">Collection ID</label>
                <input
                  type="text"
                  value={data.params?.collectionId || ''}
                  onChange={(e) => updateNodeData(id, { params: { ...data.params, collectionId: e.target.value } })}
                  placeholder="Enter collection ID"
                  className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            )}

            {data.params?.operation === 'create_collection' && (
              <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-500">Collection Name</label>
                <input
                  type="text"
                  value={data.params?.collectionName || ''}
                  onChange={(e) => updateNodeData(id, { params: { ...data.params, collectionName: e.target.value } })}
                  placeholder="Enter collection name"
                  className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            )}

            {['create_request', 'run_request'].includes(data.params?.operation || '') && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-gray-500">Request Name</label>
                  <input
                    type="text"
                    value={data.params?.requestName || ''}
                    onChange={(e) => updateNodeData(id, { params: { ...data.params, requestName: e.target.value } })}
                    placeholder="Enter request name"
                    className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-gray-500">Request URL</label>
                  <input
                    type="text"
                    value={data.params?.requestUrl || ''}
                    onChange={(e) => updateNodeData(id, { params: { ...data.params, requestUrl: e.target.value } })}
                    placeholder="Enter request URL"
                    className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-gray-500">Request Method</label>
                  <select
                    value={data.params?.requestMethod || 'GET'}
                    onChange={(e) => updateNodeData(id, { params: { ...data.params, requestMethod: e.target.value as any } })}
                    className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="DELETE">DELETE</option>
                    <option value="PATCH">PATCH</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-gray-500">Request Body</label>
                  <textarea
                    value={data.params?.requestBody || ''}
                    onChange={(e) => updateNodeData(id, { params: { ...data.params, requestBody: e.target.value } })}
                    placeholder="Enter request body (JSON)"
                    rows={4}
                    className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}

            {data.params?.operation === 'get_environment' && (
              <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-500">Environment ID</label>
                <input
                  type="text"
                  value={data.params?.environmentId || ''}
                  onChange={(e) => updateNodeData(id, { params: { ...data.params, environmentId: e.target.value } })}
                  placeholder="Enter environment ID"
                  className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
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

export default PostmanNode; 