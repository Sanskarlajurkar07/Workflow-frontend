import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { Settings, Trash2, Share2, Lock, Unlock, Move, Users, Link, Clock, Shield, ToggleLeft, ToggleRight, UserPlus, Mail } from 'lucide-react';
import { useFlowStore } from '../../../../store/flowStore';

interface ShareObjectNodeProps {
  id: string;
  data: {
    params?: {
      nodeName?: string;
      objectType?: 'workflow' | 'file' | 'knowledge_base' | 'dataset' | 'model';
      objectId?: string;
      shareType?: 'user' | 'team' | 'public' | 'link';
      recipients?: Array<{
        id: string;
        type: 'user' | 'team';
        name: string;
        email?: string;
      }>;
      permissions?: 'view' | 'edit' | 'admin';
      expiryTime?: string;
      notifyUsers?: boolean;
      customMessage?: string;
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

const ShareObjectNode: React.FC<ShareObjectNodeProps> = ({ id, data, selected }) => {
  const [activeTab, setActiveTab] = useState<'settings' | 'recipients' | 'response'>('settings');
  const [dragMode, setDragMode] = useState<boolean>(false);
  const [recipientInput, setRecipientInput] = useState<string>('');
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

  // Add recipient
  const addRecipient = () => {
    if (!recipientInput.trim()) return;
    
    const newRecipient = {
      id: `user-${Date.now()}`,
      type: 'user' as const,
      name: recipientInput,
      email: recipientInput.includes('@') ? recipientInput : undefined
    };
    
    const recipients = [...(data.params?.recipients || []), newRecipient];
    updateNodeData(id, {
      params: {
        ...data.params,
        recipients
      }
    });
    
    setRecipientInput('');
  };

  // Remove recipient
  const removeRecipient = (recipientId: string) => {
    const recipients = data.params?.recipients?.filter(r => r.id !== recipientId) || [];
    updateNodeData(id, {
      params: {
        ...data.params,
        recipients
      }
    });
  };

  // Test share operation
  const testShareOperation = async () => {
    // In a real implementation, this would communicate with the backend
    // For now, we'll just simulate a successful share operation
    try {
      const mockResponse = {
        status: 200,
        content: {
          object_id: data.params?.objectId || 'obj-123456',
          object_type: data.params?.objectType || 'workflow',
          share_type: data.params?.shareType || 'user',
          recipients: data.params?.recipients?.map(r => ({
            id: r.id,
            type: r.type,
            name: r.name,
            email: r.email,
            status: 'pending'
          })) || [],
          permissions: data.params?.permissions || 'view',
          share_url: data.params?.shareType === 'link' ? 'https://app.example.com/share/s-abcdef123456' : undefined,
          expiry: data.params?.expiryTime || null,
          notifications_sent: data.params?.notifyUsers ? data.params?.recipients?.length || 0 : 0
        },
        success: true,
        execution_time_ms: 245
      };
      
      updateNodeData(id, { 
        params: { 
          ...data.params, 
          testResponse: mockResponse
        } 
      });
    } catch (err: any) {
      setError(err.message || 'An error occurred during share operation test');
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
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 px-4 py-2 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white rounded-md shadow-sm">
              <Share2 className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Share Object</h3>
              <p className="text-xs text-gray-500">{data.params?.nodeName || 'share_object_0'}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setDragMode(!dragMode)}
              className={`p-1 rounded-md transition-colors ${
                dragMode ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-white/50 text-gray-600'
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
            {(['settings', 'recipients', 'response'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-2 text-sm font-medium rounded-t-lg -mb-px ${
                  activeTab === tab
                    ? 'text-indigo-600 border-b-2 border-indigo-600'
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
              {/* Object Type */}
              <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-500">Object Type</label>
                <select
                  value={data.params?.objectType || 'workflow'}
                  onChange={(e) => updateNodeData(id, {
                    params: {
                      ...data.params,
                      objectType: e.target.value as 'workflow' | 'file' | 'knowledge_base' | 'dataset' | 'model'
                    }
                  })}
                  disabled={data.params?.locked}
                  className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="workflow">Workflow</option>
                  <option value="file">File</option>
                  <option value="knowledge_base">Knowledge Base</option>
                  <option value="dataset">Dataset</option>
                  <option value="model">Model</option>
                </select>
              </div>

              {/* Object ID */}
              <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-500">Object ID</label>
                <input
                  type="text"
                  placeholder="Enter object ID or variable..."
                  value={data.params?.objectId || ''}
                  onChange={(e) => updateNodeData(id, {
                    params: { ...data.params, objectId: e.target.value }
                  })}
                  disabled={data.params?.locked}
                  className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Share Type */}
              <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-500">Share Type</label>
                <select
                  value={data.params?.shareType || 'user'}
                  onChange={(e) => updateNodeData(id, {
                    params: {
                      ...data.params,
                      shareType: e.target.value as 'user' | 'team' | 'public' | 'link'
                    }
                  })}
                  disabled={data.params?.locked}
                  className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="user">Specific Users</option>
                  <option value="team">Team</option>
                  <option value="public">Public</option>
                  <option value="link">Share Link</option>
                </select>
              </div>

              {/* Permissions */}
              <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-500">Permissions</label>
                <select
                  value={data.params?.permissions || 'view'}
                  onChange={(e) => updateNodeData(id, {
                    params: {
                      ...data.params,
                      permissions: e.target.value as 'view' | 'edit' | 'admin'
                    }
                  })}
                  disabled={data.params?.locked}
                  className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="view">View Only</option>
                  <option value="edit">Edit</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {/* Expiry Time */}
              {(data.params?.shareType === 'link' || data.params?.shareType === 'public') && (
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-gray-500">Expiry Time (optional)</label>
                  <input
                    type="datetime-local"
                    value={data.params?.expiryTime || ''}
                    onChange={(e) => updateNodeData(id, {
                      params: { ...data.params, expiryTime: e.target.value }
                    })}
                    disabled={data.params?.locked}
                    className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}

              {/* Share Options */}
              <div className="space-y-3">
                {/* Notify Users */}
                <div className="flex items-center justify-between">
                  <label className="text-sm text-gray-700 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-500" />
                    Notify users
                  </label>
                  <button 
                    type="button"
                    onClick={() => updateNodeData(id, {
                      params: { ...data.params, notifyUsers: !data.params?.notifyUsers }
                    })}
                    disabled={data.params?.locked}
                    className="text-sm"
                  >
                    {data.params?.notifyUsers !== false ? (
                      <ToggleRight className="w-6 h-6 text-indigo-600" />
                    ) : (
                      <ToggleLeft className="w-6 h-6 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* Custom Message */}
              {data.params?.notifyUsers && (
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-gray-500">Custom Message</label>
                  <textarea
                    placeholder="Optional message to include in the notification..."
                    value={data.params?.customMessage || ''}
                    onChange={(e) => updateNodeData(id, {
                      params: { ...data.params, customMessage: e.target.value }
                    })}
                    disabled={data.params?.locked}
                    rows={3}
                    className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>
              )}
            </div>
          )}

          {activeTab === 'recipients' && (
            <div className="space-y-4">
              {/* Recipients input */}
              {(data.params?.shareType === 'user' || data.params?.shareType === 'team') && (
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-gray-500">Add Recipients</label>
                  <div className="flex">
                    <input
                      type="text"
                      placeholder="Enter email or username..."
                      value={recipientInput}
                      onChange={(e) => setRecipientInput(e.target.value)}
                      disabled={data.params?.locked}
                      className="flex-1 px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addRecipient();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={addRecipient}
                      disabled={data.params?.locked || !recipientInput.trim()}
                      className={`px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border border-indigo-200 rounded-r-lg ${
                        data.params?.locked || !recipientInput.trim() ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <UserPlus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Recipients list */}
              <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-500">Recipients</label>
                {data.params?.shareType === 'public' ? (
                  <div className="p-4 border border-dashed border-gray-200 rounded-lg bg-gray-50 flex flex-col items-center justify-center">
                    <Users className="w-8 h-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">Object will be shared publicly</p>
                    <p className="text-xs text-gray-400 mt-1">Anyone with the link can access</p>
                  </div>
                ) : data.params?.shareType === 'link' ? (
                  <div className="p-4 border border-dashed border-gray-200 rounded-lg bg-gray-50 flex flex-col items-center justify-center">
                    <Link className="w-8 h-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">Share via link</p>
                    <p className="text-xs text-gray-400 mt-1">A unique link will be generated</p>
                  </div>
                ) : (
                  <div className="max-h-[150px] overflow-y-auto space-y-1">
                    {data.params?.recipients?.length ? (
                      data.params.recipients.map((recipient) => (
                        <div key={recipient.id} className="flex items-center justify-between bg-indigo-50 px-2 py-1.5 rounded-md">
                          <div className="text-xs text-gray-700 truncate flex-1">
                            <span className="font-medium">{recipient.name}</span>
                            {recipient.email && <span className="text-gray-500 ml-1">({recipient.email})</span>}
                          </div>
                          <button
                            type="button"
                            onClick={() => removeRecipient(recipient.id)}
                            disabled={data.params?.locked}
                            className="p-0.5 rounded-md hover:bg-indigo-100 text-indigo-700 ml-2"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 border border-dashed border-gray-200 rounded-lg bg-gray-50 flex flex-col items-center justify-center">
                        <Users className="w-6 h-6 text-gray-400 mb-2" />
                        <p className="text-xs text-gray-500">No recipients added yet</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'response' && (
            <div className="space-y-3">
              {!data.params?.testResponse ? (
                <div className="p-4 flex flex-col items-center justify-center bg-gray-50 border border-dashed border-gray-200 rounded-lg text-gray-500">
                  <Share2 className="w-8 h-8 mb-2 text-gray-400" />
                  <p className="text-sm mb-1">No share operation performed yet</p>
                  <p className="text-xs">Run the workflow to see results</p>
                </div>
              ) : (
                <div className="rounded-lg border border-gray-200 overflow-hidden">
                  <div className="bg-gray-50 border-b border-gray-200 px-3 py-1.5 text-xs text-gray-500 flex justify-between">
                    <span>Share Result</span>
                    {data.params.testResponse.execution_time_ms && (
                      <span>{data.params.testResponse.execution_time_ms}ms</span>
                    )}
                  </div>
                  
                  <div className="p-3 bg-white">
                    {data.params.testResponse.success ? (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 font-medium">Object:</span>
                          <span className="text-gray-800">
                            {data.params.testResponse.content?.object_type} ({data.params.testResponse.content?.object_id})
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 font-medium">Share Type:</span>
                          <span className="text-gray-800">{data.params.testResponse.content?.share_type}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 font-medium">Permissions:</span>
                          <span className="text-gray-800">{data.params.testResponse.content?.permissions}</span>
                        </div>
                        {data.params.testResponse.content?.share_url && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600 font-medium">Share URL:</span>
                            <a 
                              href={data.params.testResponse.content.share_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              {data.params.testResponse.content.share_url}
                            </a>
                          </div>
                        )}
                        {data.params.testResponse.content?.notifications_sent > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600 font-medium">Notifications:</span>
                            <span className="text-gray-800">{data.params.testResponse.content.notifications_sent} sent</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">
                        {data.params.testResponse.content?.error || 'An error occurred during the share operation'}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Test Button */}
              <button
                onClick={testShareOperation}
                disabled={data.params?.locked}
                className={`mt-2 w-full flex items-center justify-center gap-2 py-2 px-3 text-sm rounded-lg transition-all ${
                  data.params?.locked 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                }`}
              >
                <Share2 className="w-4 h-4" />
                Test Share Operation
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
          {data.params?.shareType === 'user' ? 'User Sharing' : 
           data.params?.shareType === 'team' ? 'Team Sharing' : 
           data.params?.shareType === 'public' ? 'Public Access' : 'Link Sharing'}
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
        className={`w-3 h-3 -mr-0.5 bg-indigo-500 border-2 border-white rounded-full shadow-md transition-opacity ${data.params?.locked ? 'opacity-50' : 'hover:scale-110'}`}
      />
    </div>
  );
};

export default ShareObjectNode; 