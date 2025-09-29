import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { Settings, Trash2, Cloud, RefreshCw, LogIn, AlertCircle } from 'lucide-react';
import { useFlowStore } from '../../../../store/flowStore';

// Dropbox API credentials (to be replaced with user's credentials)
const DROPBOX_APP_KEY = 'your-dropbox-app-key';
const DROPBOX_APP_SECRET = 'your-dropbox-app-secret';

interface DropboxNodeProps {
  id: string;
  data: {
    params?: {
      nodeName?: string;
      operation?: 'list_files' | 'upload_file' | 'download_file' | 'create_folder' | 'delete_file' | 'share_file' | 'search_files';
      path?: string;
      fileUrl?: string;
      fileName?: string;
      folderName?: string;
      searchQuery?: string;
      recursive?: boolean;
      includeDeleted?: boolean;
      showSettings?: boolean;
      appKey?: string;
      appSecret?: string;
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

const DropboxNode: React.FC<DropboxNodeProps> = ({ id, data, selected }) => {
  const [connecting, setConnecting] = useState<boolean>(false);
  const [testing, setTesting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const removeNode = useFlowStore((state) => state.removeNode);
  const updateNodeData = useFlowStore((state) => state.updateNodeData);

  const connectToDropbox = async () => {
    setConnecting(true);
    setError(null);
    
    try {
      // Simulate API validation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      updateNodeData(id, { 
        params: { 
          ...data.params, 
          appKey: DROPBOX_APP_KEY,
          appSecret: DROPBOX_APP_SECRET,
          isAuthenticated: true
        } 
      });
      
    } catch (err: any) {
      setError(err.message || 'Failed to authenticate with Dropbox');
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
        case 'list_files':
          mockResponse = {
            status: 200,
            content: {
              entries: [
                {
                  ".tag": "file",
                  name: "document.pdf",
                  path_lower: "/document.pdf",
                  size: 1024000,
                  client_modified: new Date().toISOString()
                },
                {
                  ".tag": "folder",
                  name: "Projects",
                  path_lower: "/projects"
                }
              ],
              cursor: "xyz123",
              has_more: false
            },
            success: true,
            execution_time_ms: 450
          };
          break;
        case 'upload_file':
          mockResponse = {
            status: 200,
            content: {
              name: data.params.fileName,
              path_lower: `/${data.params.fileName?.toLowerCase()}`,
              size: 2048000,
              client_modified: new Date().toISOString(),
              rev: "012345abcdef",
              content_hash: "0123456789abcdef"
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
              <Cloud className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-medium text-white">Dropbox</h3>
              <p className="text-xs text-blue-50/80">{data.params?.nodeName || 'dropbox_0'}</p>
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
              <span className="text-sm text-gray-600">Dropbox Authentication</span>
              {error && (
                <span className="text-xs text-red-500 flex items-center">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {error}
                </span>
              )}
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-medium text-gray-500">App Key</label>
              <input
                type="password"
                value={DROPBOX_APP_KEY}
                placeholder="Enter your Dropbox app key"
                className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                readOnly
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-medium text-gray-500">App Secret</label>
              <input
                type="password"
                value={DROPBOX_APP_SECRET}
                placeholder="Enter your Dropbox app secret"
                className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                readOnly
              />
            </div>
            <button
              onClick={connectToDropbox}
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
                  <span>Connect with Dropbox</span>
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
                value={data.params?.operation || 'list_files'}
                onChange={(e) => updateNodeData(id, { params: { ...data.params, operation: e.target.value } })}
                className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="list_files">List Files</option>
                <option value="upload_file">Upload File</option>
                <option value="download_file">Download File</option>
                <option value="create_folder">Create Folder</option>
                <option value="delete_file">Delete File</option>
                <option value="share_file">Share File</option>
                <option value="search_files">Search Files</option>
              </select>
            </div>

            {/* Operation-specific Fields */}
            {['list_files', 'create_folder'].includes(data.params?.operation || '') && (
              <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-500">Path</label>
                <input
                  type="text"
                  value={data.params?.path || ''}
                  onChange={(e) => updateNodeData(id, { params: { ...data.params, path: e.target.value } })}
                  placeholder="Enter path (e.g., /folder)"
                  className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}

            {data.params?.operation === 'upload_file' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-gray-500">File URL</label>
                  <input
                    type="text"
                    value={data.params?.fileUrl || ''}
                    onChange={(e) => updateNodeData(id, { params: { ...data.params, fileUrl: e.target.value } })}
                    placeholder="Enter file URL"
                    className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-gray-500">File Name</label>
                  <input
                    type="text"
                    value={data.params?.fileName || ''}
                    onChange={(e) => updateNodeData(id, { params: { ...data.params, fileName: e.target.value } })}
                    placeholder="Enter file name"
                    className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}

            {data.params?.operation === 'create_folder' && (
              <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-500">Folder Name</label>
                <input
                  type="text"
                  value={data.params?.folderName || ''}
                  onChange={(e) => updateNodeData(id, { params: { ...data.params, folderName: e.target.value } })}
                  placeholder="Enter folder name"
                  className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}

            {data.params?.operation === 'search_files' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-gray-500">Search Query</label>
                  <input
                    type="text"
                    value={data.params?.searchQuery || ''}
                    onChange={(e) => updateNodeData(id, { params: { ...data.params, searchQuery: e.target.value } })}
                    placeholder="Enter search query"
                    className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={data.params?.recursive || false}
                      onChange={(e) => updateNodeData(id, { 
                        params: { 
                          ...data.params, 
                          recursive: e.target.checked 
                        } 
                      })}
                      className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-600">Search in Subfolders</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={data.params?.includeDeleted || false}
                      onChange={(e) => updateNodeData(id, { 
                        params: { 
                          ...data.params, 
                          includeDeleted: e.target.checked 
                        } 
                      })}
                      className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-600">Include Deleted Files</span>
                  </label>
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

export default DropboxNode; 