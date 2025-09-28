import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { Settings, Trash2, Globe, Plus, Send, Check, Code, ChevronDown, AlertCircle, Info, ExternalLink, Copy } from 'lucide-react';
import { useFlowStore } from '../../../../store/flowStore';

interface ApiLoaderNodeProps {
  id: string;
  data: {
    params?: {
      nodeName?: string;
      method?: string;
      url?: string;
      headers?: Array<{ key: string; value: string }>;
      queryParams?: Array<{ key: string; value: string }>;
      files?: Array<{ name: string; file?: File }>;
      body?: string;
      bodyType?: 'raw' | 'json';
      showSettings?: boolean;
      testResponse?: {
        status?: number;
        content?: any;
        success?: boolean;
        execution_time_ms?: number;
      };
      responseFormat?: 'preview' | 'raw';
    };
  };
  selected?: boolean;
}

const ApiLoaderNode: React.FC<ApiLoaderNodeProps> = ({ id, data, selected }) => {
  const [activeTab, setActiveTab] = useState<'headers' | 'query' | 'body' | 'files' | 'response'>('headers');
  const [testingApi, setTestingApi] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const removeNode = useFlowStore((state) => state.removeNode);
  const updateNodeData = useFlowStore((state) => state.updateNodeData);

  // Mock function to test API call (in real app, this would connect to the backend)
  const testApiCall = async () => {
    setTestingApi(true);
    setError(null);
    
    try {
      // In a real implementation, this would call the backend
      // For now, we'll just simulate a response
      const mockResponses: Record<string, any> = {
        'https://jsonplaceholder.typicode.com/posts': {
          status: 200,
          content: [{ id: 1, title: 'Example Post', body: 'This is a sample post body' }],
          success: true,
          execution_time_ms: 320
        },
        'https://api.github.com/users/octocat': {
          status: 200, 
          content: { 
            login: "octocat", 
            id: 583231, 
            avatar_url: "https://avatars.githubusercontent.com/u/583231?v=4", 
            name: "The Octocat" 
          },
          success: true,
          execution_time_ms: 450
        }
      };
      
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network delay
      
      let responseData;
      
      if (mockResponses[data.params?.url || '']) {
        responseData = mockResponses[data.params?.url || ''];
      } else {
        responseData = {
          status: 200,
          content: { message: "API test successful", request: { method: data.params?.method, url: data.params?.url } },
          success: true,
          execution_time_ms: 250
        };
      }
      
      updateNodeData(id, { 
        params: { 
          ...data.params, 
          testResponse: responseData,
          responseFormat: 'preview'
        } 
      });
      
    } catch (err: any) {
      setError(err.message || 'An error occurred while testing the API');
      updateNodeData(id, { 
        params: { 
          ...data.params, 
          testResponse: {
            status: 500,
            content: { error: err.message || 'Unknown error' },
            success: false
          }
        } 
      });
    } finally {
      setTestingApi(false);
    }
  };

  const formatJsonString = (jsonObj: any) => {
    try {
      return JSON.stringify(jsonObj, null, 2);
    } catch (e) {
      return String(jsonObj);
    }
  };

  const getStatusColor = (status?: number) => {
    if (!status) return 'bg-gray-300';
    if (status >= 200 && status < 300) return 'bg-green-500';
    if (status >= 300 && status < 400) return 'bg-blue-500';
    if (status >= 400 && status < 500) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const copyResponseToClipboard = () => {
    const response = data.params?.testResponse?.content;
    if (response) {
      try {
        navigator.clipboard.writeText(
          typeof response === 'object' ? JSON.stringify(response, null, 2) : String(response)
        );
      } catch (e) {
        console.error('Failed to copy response', e);
      }
    }
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-sm overflow-hidden ${
        selected ? 'ring-2 ring-blue-500' : 'ring-1 ring-gray-200'
      }`}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-green-50 to-teal-50 px-4 py-2 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white rounded-md shadow-sm">
              <Globe className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">API Loader</h3>
              <p className="text-xs text-gray-500">{data.params?.nodeName || 'api_loader_0'}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => updateNodeData(id, { params: { ...data.params, showSettings: !data.params?.showSettings } })}
              className="p-1 rounded-md hover:bg-white/50 transition-colors"
            >
              <Settings className="w-4 h-4 text-gray-600" />
            </button>
            <button
              onClick={() => removeNode(id)}
              className="p-1 rounded-md hover:bg-white/50 transition-colors"
            >
              <Trash2 className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 space-y-4">
        {/* Node Name Input */}
        <div className="space-y-2">
          <label className="block text-xs font-medium text-gray-500 mb-1">Variable Name</label>
          <input
            type="text"
            placeholder="Enter variable name..."
            value={data.params?.nodeName || ''}
            onChange={(e) => updateNodeData(id, { params: { ...data.params, nodeName: e.target.value } })}
            className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Method Selection */}
        <div className="flex gap-4">
          <div className="w-1/3">
            <label className="block text-xs font-medium text-gray-500 mb-1">Method</label>
            <select
              value={data.params?.method || 'GET'}
              onChange={(e) => updateNodeData(id, { params: { ...data.params, method: e.target.value } })}
              className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option>GET</option>
              <option>POST</option>
              <option>PUT</option>
              <option>PATCH</option>
              <option>DELETE</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-500 mb-1">URL</label>
            <input
              type="text"
              placeholder="https://api.example.com"
              value={data.params?.url || ''}
              onChange={(e) => updateNodeData(id, { params: { ...data.params, url: e.target.value } })}
              className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* API Test Button */}
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={testApiCall}
            disabled={testingApi || !data.params?.url}
            className={`flex items-center justify-center gap-2 py-2 px-3 text-sm rounded-lg transition-all ${
              testingApi
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : data.params?.url
                ? 'bg-teal-50 text-teal-600 hover:bg-teal-100'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {testingApi ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-teal-600 border-t-transparent rounded-full"></div>
                Testing...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Test API
              </>
            )}
          </button>
          
          {data.params?.testResponse?.status && (
            <div className="flex items-center space-x-2 text-sm">
              <div className={`h-2 w-2 rounded-full ${getStatusColor(data.params.testResponse.status)}`}></div>
              <span className="text-gray-600">Status: {data.params.testResponse.status}</span>
              {data.params.testResponse.execution_time_ms && (
                <span className="text-gray-400 text-xs">{data.params.testResponse.execution_time_ms}ms</span>
              )}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-1">
            {(['headers', 'query', 'body', 'files', 'response'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-2 text-sm font-medium rounded-t-lg -mb-px ${
                  activeTab === tab
                    ? 'text-teal-600 border-b-2 border-teal-600'
                    : 'text-gray-500 hover:text-gray-700'
                } ${tab === 'response' && data.params?.testResponse ? 'text-green-600 font-semibold' : ''}`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                {tab === 'response' && data.params?.testResponse?.success && (
                  <Check className="inline-block w-3 h-3 ml-1 text-green-500" />
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="min-h-[200px]">
          {activeTab === 'headers' && (
            <div className="space-y-2">
              {(data.params?.headers || [{ key: '', value: '' }]).map((header, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    placeholder="Key"
                    value={header.key || ''}
                    onChange={(e) => {
                      const newHeaders = [...(data.params?.headers || [])];
                      newHeaders[index] = { ...header, key: e.target.value, value: header.value || '' };
                      updateNodeData(id, { params: { ...data.params, headers: newHeaders } });
                    }}
                    className="w-[45%] px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    placeholder="Value"
                    value={header.value || ''}
                    onChange={(e) => {
                      const newHeaders = [...(data.params?.headers || [])];
                      newHeaders[index] = { ...header, value: e.target.value };
                      updateNodeData(id, { params: { ...data.params, headers: newHeaders } });
                    }}
                    className="w-[45%] px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const newHeaders = data.params?.headers?.filter((_, i) => i !== index) || [];
                      updateNodeData(id, { params: { ...data.params, headers: newHeaders.length ? newHeaders : [{ key: '', value: '' }] } });
                    }}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    title="Remove header"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => {
                  const newHeaders = [...(data.params?.headers || []), { key: '', value: '' }];
                  updateNodeData(id, { params: { ...data.params, headers: newHeaders } });
                }}
                className="w-full flex items-center justify-center gap-2 py-2 text-sm text-teal-600 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Header
              </button>
            </div>
          )}

          {activeTab === 'query' && (
            <div className="space-y-2">
              {(data.params?.queryParams || [{ key: '', value: '' }]).map((param, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    placeholder="Key"
                    value={param.key || ''}
                    onChange={(e) => {
                      const newParams = [...(data.params?.queryParams || [])];
                      newParams[index] = { ...param, key: e.target.value };
                      updateNodeData(id, { params: { ...data.params, queryParams: newParams } });
                    }}
                    className="w-[45%] px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    placeholder="Value"
                    value={param.value || ''}
                    onChange={(e) => {
                      const newParams = [...(data.params?.queryParams || [])];
                      newParams[index] = { ...param, value: e.target.value };
                      updateNodeData(id, { params: { ...data.params, queryParams: newParams } });
                    }}
                    className="w-[45%] px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const newParams = data.params?.queryParams?.filter((_, i) => i !== index) || [];
                      updateNodeData(id, { params: { ...data.params, queryParams: newParams.length ? newParams : [{ key: '', value: '' }] } });
                    }}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    title="Remove parameter"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => {
                  const existingParams = data.params?.queryParams || [];
                  const newParams = [...existingParams, { key: '', value: '' }];
                  updateNodeData(id, { 
                    params: { 
                      ...data.params, 
                      queryParams: newParams 
                    } 
                  });
                }}
                className="w-full flex items-center justify-center gap-2 py-2 text-sm text-teal-600 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Query Parameter
              </button>
            </div>
          )}

          {activeTab === 'body' && (
            <div className="space-y-2">
              <div className="flex items-center space-x-4 mb-2 p-2 bg-gray-50 rounded-lg">
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={data.params?.bodyType === 'raw' || !data.params?.bodyType}
                    onChange={() => updateNodeData(id, { params: { ...data.params, bodyType: 'raw' } })}
                    className="w-4 h-4 text-teal-600"
                  />
                  <span className="ml-2 text-sm text-gray-600">Raw</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={data.params?.bodyType === 'json'}
                    onChange={() => updateNodeData(id, { params: { ...data.params, bodyType: 'json' } })}
                    className="w-4 h-4 text-teal-600"
                  />
                  <span className="ml-2 text-sm text-gray-600">JSON</span>
                </label>
              </div>
              <textarea
                value={data.params?.body || ''}
                onChange={(e) => updateNodeData(id, { params: { ...data.params, body: e.target.value } })}
                placeholder={data.params?.bodyType === 'json' ? '{\n  "key": "value"\n}' : 'Request body...'}
                className="w-full h-[150px] px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
              />
              
              {/* Variable usage hint */}
              <div className="text-xs text-gray-500 p-2 bg-blue-50 rounded-lg border border-blue-100">
                <div className="flex items-start">
                  <Info className="w-4 h-4 text-blue-500 mr-2 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-700 mb-1">Tip: Use variables</p>
                    <p>You can use variables from previous nodes with double curly braces:</p>
                    <code className="bg-blue-100 px-1 rounded text-blue-800">{"{{nodeName.output}}"}</code>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'files' && (
            <div className="space-y-2">
              {(data.params?.files || []).length === 0 ? (
                <div className="p-4 flex flex-col items-center justify-center bg-gray-50 border border-dashed border-gray-200 rounded-lg">
                  <p className="text-sm text-gray-500 mb-2">No files added yet</p>
                </div>
              ) : (
                (data.params?.files || []).map((file, index) => (
                  <div key={index} className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg">
                    <div className="flex-1 overflow-hidden">
                      <input
                        type="file"
                        onChange={(e) => {
                          const newFiles = [...(data.params?.files || [])];
                          newFiles[index] = { 
                            name: e.target.files?.[0]?.name || '',
                            file: e.target.files?.[0]
                          };
                          updateNodeData(id, { params: { ...data.params, files: newFiles } });
                        }}
                        className="w-full text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      {file.name && (
                        <p className="text-xs text-gray-500 mt-1 truncate">{file.name}</p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const newFiles = data.params?.files?.filter((_, i) => i !== index) || [];
                        updateNodeData(id, { params: { ...data.params, files: newFiles } });
                      }}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      title="Remove file"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
              <button
                type="button"
                onClick={() => {
                  const newFiles = [...(data.params?.files || []), { name: '' }];
                  updateNodeData(id, { params: { ...data.params, files: newFiles } });
                }}
                className="w-full flex items-center justify-center gap-2 py-2 text-sm text-teal-600 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add File
              </button>
            </div>
          )}

          {activeTab === 'response' && (
            <div className="space-y-3">
              {!data.params?.testResponse ? (
                <div className="p-4 flex flex-col items-center justify-center bg-gray-50 border border-dashed border-gray-200 rounded-lg text-gray-500">
                  <Globe className="w-8 h-8 mb-2 text-gray-400" />
                  <p className="text-sm mb-1">No API response yet</p>
                  <p className="text-xs">Test your API to see response data here</p>
                </div>
              ) : (
                <>
                  {/* Response actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => updateNodeData(id, { 
                          params: { 
                            ...data.params, 
                            responseFormat: data.params?.responseFormat === 'raw' ? 'preview' : 'raw' 
                          } 
                        })}
                        className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700 transition-colors"
                      >
                        <Code className="w-3 h-3" />
                        {data.params.responseFormat === 'raw' ? 'Preview' : 'Raw'}
                      </button>
                      <button
                        type="button"
                        onClick={copyResponseToClipboard}
                        className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700 transition-colors"
                      >
                        <Copy className="w-3 h-3" />
                        Copy
                      </button>
                    </div>
                    
                    {/* Status indicator */}
                    <div className="flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(data.params.testResponse.status)}`}></div>
                      <span className="text-xs text-gray-500">
                        Status: {data.params.testResponse.status}
                      </span>
                    </div>
                  </div>
                  
                  {/* Response content */}
                  <div className="rounded-lg border border-gray-200 overflow-hidden">
                    <div className="bg-gray-50 border-b border-gray-200 px-3 py-1.5 text-xs text-gray-500 flex justify-between">
                      <span>Response</span>
                      {data.params.testResponse.execution_time_ms && (
                        <span>{data.params.testResponse.execution_time_ms}ms</span>
                      )}
                    </div>
                    
                    <pre className="p-3 text-xs font-mono bg-gray-50 h-[180px] overflow-auto">
                      {data.params.responseFormat === 'raw' 
                        ? formatJsonString(data.params.testResponse.content)
                        : (
                          <div className="space-y-2">
                            {typeof data.params.testResponse.content === 'object' ? (
                              Object.entries(data.params.testResponse.content).map(([key, value], i) => (
                                <div key={i} className="flex flex-col">
                                  <span className="text-blue-600 font-bold">{key}: </span>
                                  <span className="pl-2 text-gray-800 break-all">
                                    {typeof value === 'object' 
                                      ? JSON.stringify(value).substring(0, 100) + (JSON.stringify(value).length > 100 ? '...' : '')
                                      : String(value)}
                                  </span>
                                </div>
                              ))
                            ) : (
                              <span className="text-gray-800">{String(data.params.testResponse.content)}</span>
                            )}
                          </div>
                        )
                      }
                    </pre>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Status Bar */}
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <span className={`w-2 h-2 rounded-full ${data.params?.url ? 'bg-green-500' : 'bg-gray-300'}`} />
          <span>{data.params?.url ? 'Ready to send' : 'Configure URL'}</span>
        </div>
        <div className="flex items-center gap-2">
          {data.params?.queryParams?.filter(p => p.key).length ? (
            <span>{data.params.queryParams.filter(p => p.key).length} query params</span>
          ) : null}
          {data.params?.files?.length ? (
            <span>{data.params.files.length} files</span>
          ) : null}
        </div>
      </div>

      {/* Handles */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 -ml-0.5 bg-blue-500 border-2 border-white rounded-full shadow-md transition-transform hover:scale-110"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 -mr-0.5 bg-teal-500 border-2 border-white rounded-full shadow-md transition-transform hover:scale-110"
      />
    </div>
  );
};

export default ApiLoaderNode;