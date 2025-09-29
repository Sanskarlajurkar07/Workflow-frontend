import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { Settings, Trash2, Database, RefreshCw, LogIn, Check, AlertCircle } from 'lucide-react';
import { useFlowStore } from '../../../../store/flowStore';
import { useGoogleOAuth } from '../../../../hooks/useGoogleOAuth';

interface GoogleDriveNodeProps {
  id: string;
  data: {
    params?: {
      nodeName?: string;
      operation?: string;
      folderId?: string;
      pageSize?: number;
      showSettings?: boolean;
      clientId?: string;
      clientSecret?: string;
      isAuthenticated?: boolean;
      testResponse?: any;
    };
  };
  selected?: boolean;
}

const GoogleDriveNode: React.FC<GoogleDriveNodeProps> = ({ id, data, selected }) => {
  const [activeTab, setActiveTab] = useState<'auth' | 'operation' | 'response'>('auth');
  const [testingOperation, setTestingOperation] = useState(false);
  const removeNode = useFlowStore((s) => s.removeNode);
  const updateNodeData = useFlowStore((s) => s.updateNodeData);

  const { isLoading: connectingDrive, error, connectToGoogle } = useGoogleOAuth(id, updateNodeData);

  const handleConnect = () => {
    const scopes = ['https://www.googleapis.com/auth/drive.file', 'https://www.googleapis.com/auth/drive.readonly'];
    connectToGoogle('googledrive', scopes);
  };

  const testOperation = async () => {
    setTestingOperation(true);
    try {
      await new Promise((r) => setTimeout(r, 500));
      const mock = { status: 200, content: { message: 'ok' }, success: true };
      updateNodeData(id, { params: { ...(data.params || {}), testResponse: mock } });
    } catch (e: any) {
      updateNodeData(id, { params: { ...(data.params || {}), testResponse: { status: 500, error: e?.message } } });
    } finally {
      setTestingOperation(false);
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm overflow-hidden ${selected ? 'ring-2 ring-blue-500' : 'ring-1 ring-gray-200'}`}>
      <div className="px-3 py-2 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white rounded-md shadow-sm">
            <Database className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">Google Drive</div>
            <div className="text-xs text-gray-500">{data.params?.nodeName || 'google_drive'}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => updateNodeData(id, { params: { ...(data.params || {}), showSettings: !data.params?.showSettings } })} className="p-1 rounded-md hover:bg-gray-100">
            <Settings className="w-4 h-4 text-gray-600" />
          </button>
          <button onClick={() => removeNode(id)} className="p-1 rounded-md hover:bg-gray-100">
            <Trash2 className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      <div className="p-3 space-y-3">
        {!data.params?.isAuthenticated ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">Google Drive Authentication</div>
              {error && <div className="text-xs text-red-500 flex items-center"><AlertCircle className="w-3 h-3 mr-1" />{String(error)}</div>}
            </div>
            <button onClick={handleConnect} disabled={connectingDrive} className={`w-full py-2 rounded-lg text-white ${connectingDrive ? 'bg-blue-400' : 'bg-blue-500 hover:bg-blue-600'}`}>
              {connectingDrive ? <><RefreshCw className="w-4 h-4 animate-spin inline-block mr-2" />Connecting...</> : <><LogIn className="w-4 h-4 inline-block mr-2" />Connect with Google</>}
            </button>
          </div>
        ) : (
          <>
            <div className="p-2 bg-green-50 border border-green-200 rounded-md flex items-center justify-between">
              <div className="flex items-center gap-2"><Check className="w-4 h-4 text-green-600" /><div className="text-sm text-green-700">Connected to Google Drive</div></div>
              <button onClick={() => updateNodeData(id, { params: { ...(data.params || {}), isAuthenticated: false, authToken: undefined } })} className="text-xs text-green-600">Disconnect</button>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-medium text-gray-500">Variable Name</label>
              <input type="text" value={data.params?.nodeName || ''} onChange={(e) => updateNodeData(id, { params: { ...(data.params || {}), nodeName: e.target.value } })} className="w-full px-2 py-1 text-sm border rounded" />
            </div>

            <div className="flex space-x-2">
              <button onClick={() => setActiveTab('operation')} className={`px-2 py-1 text-sm rounded ${activeTab === 'operation' ? 'bg-indigo-50 text-indigo-700' : 'bg-gray-100'}`}>Operation</button>
              <button onClick={() => setActiveTab('response')} className={`px-2 py-1 text-sm rounded ${activeTab === 'response' ? 'bg-indigo-50 text-indigo-700' : 'bg-gray-100'}`}>Response</button>
            </div>

            {activeTab === 'operation' && (
              <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-500">Operation</label>
                <select value={data.params?.operation || 'list_files'} onChange={(e) => updateNodeData(id, { params: { ...(data.params || {}), operation: e.target.value } })} className="w-full px-2 py-1 border rounded text-sm">
                  <option value="list_files">List Files</option>
                  <option value="get_file">Get File</option>
                  <option value="upload_file">Upload File</option>
                  <option value="create_folder">Create Folder</option>
                  <option value="delete_file">Delete File</option>
                  <option value="search_files">Search Files</option>
                </select>

                <div className="flex items-center space-x-2">
                  <button onClick={testOperation} disabled={testingOperation} className="px-3 py-1 bg-indigo-600 text-white rounded text-sm">{testingOperation ? 'Testing...' : 'Test'}</button>
                </div>
              </div>
            )}

            {activeTab === 'response' && (
              <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-500">Last Response</label>
                <pre className="max-h-40 overflow-auto text-xs bg-gray-50 p-2 rounded">{JSON.stringify(data.params?.testResponse || { status: 'no test yet' }, null, 2)}</pre>
              </div>
            )}
          </>
        )}
      </div>

      <Handle type="target" position={Position.Top} style={{ background: '#555' }} />
      <Handle type="source" position={Position.Bottom} style={{ background: '#555' }} />
    </div>
  );
};

export default GoogleDriveNode;