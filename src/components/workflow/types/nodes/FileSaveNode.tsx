import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { Settings, Trash2, Save, Lock, Unlock, Move, FolderOpen, Calendar, Database, ToggleLeft, ToggleRight } from 'lucide-react';
import { useFlowStore } from '../../../../store/flowStore';

interface FileSaveNodeProps {
  id: string;
  data: {
    params?: {
      nodeName?: string;
      saveLocation?: 'local' | 's3' | 'azure';
      path?: string;
      filename?: string;
      createDirectories?: boolean;
      overwriteExisting?: boolean;
      addTimestamp?: boolean;
      storageConfig?: {
        bucket?: string;
        accessKey?: string;
        secretKey?: string;
        region?: string;
      };
      showSettings?: boolean;
      locked?: boolean;
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

const FileSaveNode: React.FC<FileSaveNodeProps> = ({ id, data, selected }) => {
  const [activeTab, setActiveTab] = useState<'settings' | 'storage' | 'response'>('settings');
  const [dragMode, setDragMode] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const removeNode = useFlowStore((state) => state.removeNode);
  const updateNodeData = useFlowStore((state) => state.updateNodeData);

  // Toggle node lock state
  const toggleLock = () => {
    updateNodeData(id, {
      params: {
        ...data.params,
        locked: !data.params?.locked
      }
    });
  };

  // Test file save operation
  const testSaveOperation = async () => {
    // In a real implementation, this would communicate with the backend
    // For now, we'll just simulate a successful file save operation
    try {
      const mockResponse = {
        status: 200,
        content: {
          path: data.params?.saveLocation === 's3' 
            ? `s3://${data.params?.storageConfig?.bucket || 'my-bucket'}/${data.params?.path || ''}/${data.params?.filename || 'file.txt'}`
            : `${data.params?.path || '/uploads'}/${data.params?.filename || 'file.txt'}`,
          filename: data.params?.filename || 'file.txt',
          size_bytes: 12345,
          url: data.params?.saveLocation === 's3'
            ? `https://${data.params?.storageConfig?.bucket || 'my-bucket'}.s3.${data.params?.storageConfig?.region || 'us-east-1'}.amazonaws.com/${data.params?.path || ''}/${data.params?.filename || 'file.txt'}`
            : `file://${data.params?.path || '/uploads'}/${data.params?.filename || 'file.txt'}`,
          storage_type: data.params?.saveLocation || 'local'
        },
        success: true,
        execution_time_ms: 315
      };
      
      updateNodeData(id, { 
        params: { 
          ...data.params, 
          testResponse: mockResponse
        } 
      });
    } catch (err: any) {
      setError(err.message || 'An error occurred during file save test');
    }
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-sm overflow-hidden ${
        selected ? 'ring-2 ring-blue-500' : 'ring-1 ring-gray-200'
      } ${dragMode ? 'cursor-move' : ''}`}
      style={{ minWidth: '320px' }}
      data-no-drag={dragMode ? 'false' : 'true'}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-green-50 to-teal-50 px-4 py-2 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white rounded-md shadow-sm">
              <Save className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">File Save</h3>
              <p className="text-xs text-gray-500">{data.params?.nodeName || 'file_save_0'}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setDragMode(!dragMode)}
              className={`p-1 rounded-md transition-colors ${
                dragMode ? 'bg-teal-100 text-teal-700' : 'hover:bg-white/50 text-gray-600'
              }`}
              title={dragMode ? "Exit move mode" : "Enter move mode"}
            >
              <Move className="w-4 h-4" />
            </button>
            <button
              onClick={toggleLock}
              className={`p-1 rounded-md transition-colors ${
                data.params?.locked ? 'bg-red-100 text-red-700' : 'hover:bg-white/50 text-gray-600'
              }`}
              title={data.params?.locked ? "Unlock node" : "Lock node"}
            >
              {data.params?.locked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
            </button>
            <button
              onClick={() => updateNodeData(id, { params: { ...data.params, showSettings: !data.params?.showSettings } })}
              className="p-1 rounded-md hover:bg-white/50 transition-colors"
            >
              <Settings className="w-4 h-4 text-gray-600" />
            </button>
            <button
              onClick={() => removeNode(id)}
              className="p-1 rounded-md hover:bg-white/50 transition-colors"
              disabled={data.params?.locked}
            >
              <Trash2 className={`w-4 h-4 ${data.params?.locked ? 'text-gray-400' : 'text-gray-600'}`} />
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
            disabled={data.params?.locked}
          />
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-1">
            {(['settings', 'storage', 'response'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-2 text-sm font-medium rounded-t-lg -mb-px ${
                  activeTab === tab
                    ? 'text-teal-600 border-b-2 border-teal-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="min-h-[200px]">
          {activeTab === 'settings' && (
            <div className="space-y-4">
              {/* Save Location */}
              <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-500">Save Location</label>
                <select
                  value={data.params?.saveLocation || 'local'}
                  onChange={(e) => updateNodeData(id, {
                    params: {
                      ...data.params,
                      saveLocation: e.target.value as 'local' | 's3' | 'azure'
                    }
                  })}
                  disabled={data.params?.locked}
                  className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="local">Local Filesystem</option>
                  <option value="s3">AWS S3</option>
                  <option value="azure">Azure Blob Storage</option>
                </select>
              </div>

              {/* Path */}
              <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-500">
                  {data.params?.saveLocation === 's3' ? 'S3 Path' : 
                   data.params?.saveLocation === 'azure' ? 'Container Path' : 'Directory Path'}
                </label>
                <div className="flex">
                  <input
                    type="text"
                    placeholder={data.params?.saveLocation === 's3' ? 'path/to/folder' : 
                                data.params?.saveLocation === 'azure' ? 'container/path' : '/path/to/folder'}
                    value={data.params?.path || ''}
                    onChange={(e) => updateNodeData(id, {
                      params: { ...data.params, path: e.target.value }
                    })}
                    disabled={data.params?.locked}
                    className="flex-1 px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    className={`px-3 py-1.5 bg-teal-50 text-teal-600 hover:bg-teal-100 border border-teal-200 rounded-r-lg ${
                      data.params?.locked ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    disabled={data.params?.locked}
                  >
                    <FolderOpen className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Filename */}
              <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-500">Filename Template</label>
                <input
                  type="text"
                  placeholder="{original_filename}"
                  value={data.params?.filename || '{original_filename}'}
                  onChange={(e) => updateNodeData(id, {
                    params: { ...data.params, filename: e.target.value }
                  })}
                  disabled={data.params?.locked}
                  className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500">
                  Supports variables: {'{original_filename}'}, {'{timestamp}'}, {'{node_id}'}
                </p>
              </div>

              {/* File Options */}
              <div className="space-y-3">
                {/* Create Directories */}
                <div className="flex items-center justify-between">
                  <label className="text-sm text-gray-700 flex items-center gap-2">
                    <FolderOpen className="w-4 h-4 text-gray-500" />
                    Create missing directories
                  </label>
                  <button 
                    type="button"
                    onClick={() => updateNodeData(id, {
                      params: { ...data.params, createDirectories: !data.params?.createDirectories }
                    })}
                    disabled={data.params?.locked}
                    className="text-sm"
                  >
                    {data.params?.createDirectories !== false ? (
                      <ToggleRight className="w-6 h-6 text-teal-600" />
                    ) : (
                      <ToggleLeft className="w-6 h-6 text-gray-400" />
                    )}
                  </button>
                </div>
                
                {/* Overwrite Existing */}
                <div className="flex items-center justify-between">
                  <label className="text-sm text-gray-700 flex items-center gap-2">
                    <Save className="w-4 h-4 text-gray-500" />
                    Overwrite existing files
                  </label>
                  <button 
                    type="button"
                    onClick={() => updateNodeData(id, {
                      params: { ...data.params, overwriteExisting: !data.params?.overwriteExisting }
                    })}
                    disabled={data.params?.locked}
                    className="text-sm"
                  >
                    {data.params?.overwriteExisting ? (
                      <ToggleRight className="w-6 h-6 text-teal-600" />
                    ) : (
                      <ToggleLeft className="w-6 h-6 text-gray-400" />
                    )}
                  </button>
                </div>

                {/* Add Timestamp */}
                <div className="flex items-center justify-between">
                  <label className="text-sm text-gray-700 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    Add timestamp to filename
                  </label>
                  <button 
                    type="button"
                    onClick={() => updateNodeData(id, {
                      params: { ...data.params, addTimestamp: !data.params?.addTimestamp }
                    })}
                    disabled={data.params?.locked}
                    className="text-sm"
                  >
                    {data.params?.addTimestamp ? (
                      <ToggleRight className="w-6 h-6 text-teal-600" />
                    ) : (
                      <ToggleLeft className="w-6 h-6 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'storage' && (
            <div className="space-y-4">
              {data.params?.saveLocation === 'local' ? (
                <div className="p-4 border border-dashed border-gray-200 rounded-lg bg-gray-50 flex flex-col items-center justify-center">
                  <Database className="w-8 h-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">Using local file storage</p>
                  <p className="text-xs text-gray-400 mt-1">Files will be saved to the server's filesystem</p>
                </div>
              ) : (
                <>
                  {/* Cloud Storage Options */}
                  {data.params?.saveLocation === 's3' && (
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <label className="block text-xs font-medium text-gray-500">S3 Bucket Name</label>
                        <input
                          type="text"
                          placeholder="my-bucket"
                          value={data.params?.storageConfig?.bucket || ''}
                          onChange={(e) => updateNodeData(id, {
                            params: { 
                              ...data.params, 
                              storageConfig: { 
                                ...(data.params?.storageConfig || {}),
                                bucket: e.target.value 
                              } 
                            }
                          })}
                          disabled={data.params?.locked}
                          className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="block text-xs font-medium text-gray-500">Region</label>
                        <input
                          type="text"
                          placeholder="us-east-1"
                          value={data.params?.storageConfig?.region || ''}
                          onChange={(e) => updateNodeData(id, {
                            params: { 
                              ...data.params, 
                              storageConfig: { 
                                ...(data.params?.storageConfig || {}),
                                region: e.target.value 
                              } 
                            }
                          })}
                          disabled={data.params?.locked}
                          className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="block text-xs font-medium text-gray-500">Access Key</label>
                        <input
                          type="password"
                          placeholder="AWS Access Key"
                          value={data.params?.storageConfig?.accessKey || ''}
                          onChange={(e) => updateNodeData(id, {
                            params: { 
                              ...data.params, 
                              storageConfig: { 
                                ...(data.params?.storageConfig || {}),
                                accessKey: e.target.value 
                              } 
                            }
                          })}
                          disabled={data.params?.locked}
                          className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="block text-xs font-medium text-gray-500">Secret Key</label>
                        <input
                          type="password"
                          placeholder="AWS Secret Key"
                          value={data.params?.storageConfig?.secretKey || ''}
                          onChange={(e) => updateNodeData(id, {
                            params: { 
                              ...data.params, 
                              storageConfig: { 
                                ...(data.params?.storageConfig || {}),
                                secretKey: e.target.value 
                              } 
                            }
                          })}
                          disabled={data.params?.locked}
                          className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  )}

                  {data.params?.saveLocation === 'azure' && (
                    <div className="p-4 border border-dashed border-gray-200 rounded-lg bg-gray-50 flex flex-col items-center justify-center">
                      <Database className="w-8 h-8 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500">Azure Blob Storage</p>
                      <p className="text-xs text-gray-400 mt-1">Configure Azure credentials in settings</p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {activeTab === 'response' && (
            <div className="space-y-3">
              {!data.params?.testResponse ? (
                <div className="p-4 flex flex-col items-center justify-center bg-gray-50 border border-dashed border-gray-200 rounded-lg text-gray-500">
                  <Save className="w-8 h-8 mb-2 text-gray-400" />
                  <p className="text-sm mb-1">No save operation performed yet</p>
                  <p className="text-xs">Run the workflow to see results</p>
                </div>
              ) : (
                <div className="rounded-lg border border-gray-200 overflow-hidden">
                  <div className="bg-gray-50 border-b border-gray-200 px-3 py-1.5 text-xs text-gray-500 flex justify-between">
                    <span>Save Result</span>
                    {data.params.testResponse.execution_time_ms && (
                      <span>{data.params.testResponse.execution_time_ms}ms</span>
                    )}
                  </div>
                  
                  <div className="p-3 bg-white">
                    {data.params.testResponse.success ? (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 font-medium">Path:</span>
                          <span className="text-gray-800">{data.params.testResponse.content?.path}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 font-medium">Filename:</span>
                          <span className="text-gray-800">{data.params.testResponse.content?.filename}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 font-medium">Size:</span>
                          <span className="text-gray-800">{data.params.testResponse.content?.size_bytes} bytes</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 font-medium">Storage:</span>
                          <span className="text-gray-800">{data.params.testResponse.content?.storage_type}</span>
                        </div>
                        {data.params.testResponse.content?.url && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600 font-medium">URL:</span>
                            <a 
                              href={data.params.testResponse.content.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              {data.params.testResponse.content.url}
                            </a>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">
                        {data.params.testResponse.content?.error || 'An error occurred during the save operation'}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Test Button */}
              <button
                onClick={testSaveOperation}
                disabled={data.params?.locked}
                className={`mt-2 w-full flex items-center justify-center gap-2 py-2 px-3 text-sm rounded-lg transition-all ${
                  data.params?.locked 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-teal-50 text-teal-600 hover:bg-teal-100'
                }`}
              >
                <Save className="w-4 h-4" />
                Test Save Operation
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Status Bar */}
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <span className={`w-2 h-2 rounded-full ${data.params?.locked ? 'bg-red-500' : 'bg-green-500'}`} />
          <span>{data.params?.locked ? 'Locked' : 'Ready'}</span>
        </div>
        <div>
          {data.params?.saveLocation === 'local' ? 'Local Storage' : data.params?.saveLocation === 's3' ? 'S3 Storage' : 'Azure Storage'}
        </div>
      </div>

      {/* Handles */}
      <Handle
        type="target"
        position={Position.Left}
        className={`w-3 h-3 -ml-0.5 bg-blue-500 border-2 border-white rounded-full shadow-md transition-opacity ${data.params?.locked ? 'opacity-50' : 'hover:scale-110'}`}
      />
      <Handle
        type="source"
        position={Position.Right}
        className={`w-3 h-3 -mr-0.5 bg-teal-500 border-2 border-white rounded-full shadow-md transition-opacity ${data.params?.locked ? 'opacity-50' : 'hover:scale-110'}`}
      />
    </div>
  );
};

export default FileSaveNode;