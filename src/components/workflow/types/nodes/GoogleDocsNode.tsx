import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { Settings, Trash2, FileText, RefreshCw, LogIn, AlertCircle, Check } from 'lucide-react';
import { useFlowStore } from '../../../../store/flowStore';
import { useGoogleOAuth } from '../../../../hooks/useGoogleOAuth';

// Use environment variables instead of hard-coded secrets
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = import.meta.env.VITE_GOOGLE_CLIENT_SECRET || '';
const REDIRECT_URI = import.meta.env.VITE_GOOGLE_REDIRECT_URI || 'https://workflow-backend-2-1ki9.onrender.com/api/auth/googledocs/callback';

interface GoogleDocsNodeProps {
  id: string;
  data: {
    params?: {
      nodeName?: string;
      operation?: 'create_doc' | 'read_doc' | 'update_doc' | 'delete_doc' | 'list_docs' | 'share_doc';
      documentId?: string;
      title?: string;
      content?: string;
      folderId?: string;
      permissions?: {
        role: 'owner' | 'writer' | 'reader';
        type: 'user' | 'group' | 'domain' | 'anyone';
        emailAddress?: string;
      };
      showSettings?: boolean;
      authToken?: string;
      refreshToken?: string;
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

const GoogleDocsNode: React.FC<GoogleDocsNodeProps> = ({ id, data, selected }) => {
  const [activeTab, setActiveTab] = useState<'auth' | 'operation' | 'response'>('auth');
  const [testing, setTesting] = useState<boolean>(false);
  const removeNode = useFlowStore((state) => state.removeNode);
  const updateNodeData = useFlowStore((state) => state.updateNodeData);

  // Use the Google OAuth hook
  const { isLoading: connecting, error, connectToGoogle } = useGoogleOAuth(id, updateNodeData);

  const handleConnect = () => {
    const scopes = [
      'https://www.googleapis.com/auth/documents',
      'https://www.googleapis.com/auth/drive.file'
    ];
    connectToGoogle('googledocs', scopes);
  };

  const testOperation = async () => {
    setTesting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      let mockResponse;
      switch (data.params?.operation) {
        case 'create_doc':
          mockResponse = {
            status: 200,
            content: {
              documentId: 'doc_' + Date.now(),
              title: data.params.title,
              url: 'https://docs.google.com/document/d/...'
            },
            success: true,
            execution_time_ms: 450
          };
          break;
        case 'read_doc':
          mockResponse = {
            status: 200,
            content: {
              documentId: data.params.documentId,
              title: 'Sample Document',
              content: 'Document content goes here...',
              lastModified: new Date().toISOString()
            },
            success: true,
            execution_time_ms: 320
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
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-medium text-white">Google Docs</h3>
              <p className="text-xs text-blue-50/80">{data.params?.nodeName || 'google_docs_0'}</p>
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
              <span className="text-sm text-gray-600">Google Docs Authentication</span>
              {error && (
                <span className="text-xs text-red-500 flex items-center">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {error}
                </span>
              )}
            </div>
            <button
              onClick={handleConnect}
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
                  <span>Connect with Google Docs</span>
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
                value={data.params?.operation || 'create_doc'}
                onChange={(e) => updateNodeData(id, { params: { ...data.params, operation: e.target.value } })}
                className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="create_doc">Create Document</option>
                <option value="read_doc">Read Document</option>
                <option value="update_doc">Update Document</option>
                <option value="delete_doc">Delete Document</option>
                <option value="list_docs">List Documents</option>
                <option value="share_doc">Share Document</option>
              </select>
            </div>

            {/* Operation-specific Fields */}
            {['create_doc', 'update_doc'].includes(data.params?.operation || '') && (
              <>
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-gray-500">Title</label>
                  <input
                    type="text"
                    value={data.params?.title || ''}
                    onChange={(e) => updateNodeData(id, { params: { ...data.params, title: e.target.value } })}
                    placeholder="Document Title"
                    className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-gray-500">Content</label>
                  <textarea
                    value={data.params?.content || ''}
                    onChange={(e) => updateNodeData(id, { params: { ...data.params, content: e.target.value } })}
                    placeholder="Document Content"
                    rows={4}
                    className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </>
            )}

            {['read_doc', 'update_doc', 'delete_doc', 'share_doc'].includes(data.params?.operation || '') && (
              <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-500">Document ID</label>
                <input
                  type="text"
                  value={data.params?.documentId || ''}
                  onChange={(e) => updateNodeData(id, { params: { ...data.params, documentId: e.target.value } })}
                  placeholder="Enter Document ID"
                  className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}

            {data.params?.operation === 'share_doc' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-gray-500">Share With (Email)</label>
                  <input
                    type="email"
                    value={data.params?.permissions?.emailAddress || ''}
                    onChange={(e) => updateNodeData(id, { 
                      params: { 
                        ...(data.params || {}), 
                        permissions: { 
                          ...(data.params?.permissions || {}),
                          emailAddress: e.target.value 
                        } 
                      } 
                    })}
                    placeholder="user@example.com"
                    className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-gray-500">Role</label>
                    <select
                      value={data.params?.permissions?.role || 'reader'}
                      onChange={(e) => updateNodeData(id, { 
                        params: { 
                          ...(data.params || {}), 
                          permissions: { 
                            ...(data.params?.permissions || {}),
                            role: e.target.value 
                          } 
                        } 
                      })}
                      className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="reader">Reader</option>
                      <option value="writer">Writer</option>
                      <option value="owner">Owner</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-gray-500">Type</label>
                    <select
                      value={data.params?.permissions?.type || 'user'}
                      onChange={(e) => updateNodeData(id, { 
                        params: { 
                          ...(data.params || {}), 
                          permissions: { 
                            ...(data.params?.permissions || {}),
                            type: e.target.value 
                          } 
                        } 
                      })}
                      className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="user">User</option>
                      <option value="group">Group</option>
                      <option value="domain">Domain</option>
                      <option value="anyone">Anyone</option>
                    </select>
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

export default GoogleDocsNode; 