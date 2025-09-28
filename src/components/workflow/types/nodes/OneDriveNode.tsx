import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { Settings, Trash2, Cloud, RefreshCw, LogIn, AlertCircle, Check } from 'lucide-react';
import { useFlowStore } from '../../../../store/flowStore';

// Microsoft OAuth2 credentials (you'll need to replace these with your own)
const MS_CLIENT_ID = 'your_microsoft_client_id';
const MS_CLIENT_SECRET = 'your_microsoft_client_secret';

interface OneDriveNodeProps {
  id: string;
  data: {
    params?: {
      nodeName?: string;
      operation?: 'list_files' | 'upload_file' | 'download_file' | 'delete_file' | 'create_folder' | 'share_file';
      fileId?: string;
      filePath?: string;
      fileName?: string;
      folderId?: string;
      folderPath?: string;
      shareType?: 'view' | 'edit';
      shareEmail?: string;
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

const OneDriveNode: React.FC<OneDriveNodeProps> = ({ id, data, selected }) => {
  const [connecting, setConnecting] = useState<boolean>(false);
  const [testing, setTesting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const removeNode = useFlowStore((state) => state.removeNode);
  const updateNodeData = useFlowStore((state) => state.updateNodeData);

  const connectToOneDrive = async () => {
    setConnecting(true);
    setError(null);
    
    try {
      const redirectUri = `${window.location.origin}/auth/microsoft/callback`;
      const scope = 'Files.ReadWrite.All offline_access';
      
      const state = Math.random().toString(36).substring(7);
      localStorage.setItem('msOAuthState', state);
      
      const authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?` +
        `client_id=${MS_CLIENT_ID}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=code&` +
        `scope=${encodeURIComponent(scope)}&` +
        `state=${state}`;
      
      window.location.href = authUrl;
      
    } catch (err: any) {
      setError(err.message || 'An error occurred while connecting to OneDrive');
      setConnecting(false);
    }
  };

  const handleOAuthCallback = async (code: string) => {
    try {
      const response = await fetch('/api/auth/microsoft/callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          client_id: MS_CLIENT_ID,
          client_secret: MS_CLIENT_SECRET,
          redirect_uri: `${window.location.origin}/auth/microsoft/callback`,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to exchange code for tokens');
      }

      const tokens = await response.json();
      
      updateNodeData(id, { 
        params: { 
          ...data.params, 
          authToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          isAuthenticated: true
        } 
      });

    } catch (err: any) {
      setError(err.message || 'Failed to complete authentication');
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
              files: [
                { id: 'file1', name: 'Document.docx', size: 1024 },
                { id: 'file2', name: 'Image.jpg', size: 2048 },
                { id: 'file3', name: 'Spreadsheet.xlsx', size: 512 }
              ]
            },
            success: true,
            execution_time_ms: 450
          };
          break;
        case 'upload_file':
          mockResponse = {
            status: 200,
            content: {
              id: 'file_' + Date.now(),
              name: data.params?.fileName,
              path: data.params?.filePath,
              size: 1024
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
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
              <Cloud className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-medium text-white">OneDrive</h3>
              <p className="text-xs text-blue-50/80">{data.params?.nodeName || 'onedrive_0'}</p>
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
              <span className="text-sm text-gray-600">OneDrive Authentication</span>
              {error && (
                <span className="text-xs text-red-500 flex items-center">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {error}
                </span>
              )}
            </div>
            <button
              onClick={connectToOneDrive}
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
                  <span>Connect with OneDrive</span>
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
                <option value="delete_file">Delete File</option>
                <option value="create_folder">Create Folder</option>
                <option value="share_file">Share File</option>
              </select>
            </div>

            {/* Operation-specific Fields */}
            {['upload_file'].includes(data.params?.operation || '') && (
              <>
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-gray-500">File Name</label>
                  <input
                    type="text"
                    value={data.params?.fileName || ''}
                    onChange={(e) => updateNodeData(id, { params: { ...data.params, fileName: e.target.value } })}
                    placeholder="example.txt"
                    className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-gray-500">File Path</label>
                  <input
                    type="text"
                    value={data.params?.filePath || ''}
                    onChange={(e) => updateNodeData(id, { params: { ...data.params, filePath: e.target.value } })}
                    placeholder="/folder/subfolder"
                    className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </>
            )}

            {['download_file', 'delete_file', 'share_file'].includes(data.params?.operation || '') && (
              <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-500">File ID</label>
                <input
                  type="text"
                  value={data.params?.fileId || ''}
                  onChange={(e) => updateNodeData(id, { params: { ...data.params, fileId: e.target.value } })}
                  placeholder="Enter file ID"
                  className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}

            {data.params?.operation === 'create_folder' && (
              <>
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-gray-500">Folder Name</label>
                  <input
                    type="text"
                    value={data.params?.fileName || ''}
                    onChange={(e) => updateNodeData(id, { params: { ...data.params, fileName: e.target.value } })}
                    placeholder="New Folder"
                    className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-gray-500">Parent Folder Path</label>
                  <input
                    type="text"
                    value={data.params?.folderPath || ''}
                    onChange={(e) => updateNodeData(id, { params: { ...data.params, folderPath: e.target.value } })}
                    placeholder="/parent/folder"
                    className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </>
            )}

            {data.params?.operation === 'share_file' && (
              <>
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-gray-500">Share With (Email)</label>
                  <input
                    type="email"
                    value={data.params?.shareEmail || ''}
                    onChange={(e) => updateNodeData(id, { params: { ...data.params, shareEmail: e.target.value } })}
                    placeholder="user@example.com"
                    className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-gray-500">Share Type</label>
                  <select
                    value={data.params?.shareType || 'view'}
                    onChange={(e) => updateNodeData(id, { params: { ...data.params, shareType: e.target.value } })}
                    className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="view">View</option>
                    <option value="edit">Edit</option>
                  </select>
                </div>
              </>
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

export default OneDriveNode; 