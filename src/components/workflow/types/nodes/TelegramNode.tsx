import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { Settings, Trash2, MessageCircle, RefreshCw, LogIn, AlertCircle } from 'lucide-react';
import { useFlowStore } from '../../../../store/flowStore';

// Telegram Bot API credentials (to be replaced with user's credentials)
const TELEGRAM_BOT_TOKEN = 'your-telegram-bot-token';

interface TelegramNodeProps {
  id: string;
  data: {
    params?: {
      nodeName?: string;
      operation?: 'send_message' | 'send_photo' | 'send_document' | 'send_poll' | 'get_chat_info' | 'get_chat_members';
      chatId?: string;
      message?: string;
      photoUrl?: string;
      documentUrl?: string;
      pollQuestion?: string;
      pollOptions?: string[];
      parseMode?: 'HTML' | 'Markdown' | 'MarkdownV2';
      disableNotification?: boolean;
      replyToMessageId?: string;
      showSettings?: boolean;
      botToken?: string;
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

const TelegramNode: React.FC<TelegramNodeProps> = ({ id, data, selected }) => {
  const [connecting, setConnecting] = useState<boolean>(false);
  const [testing, setTesting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const removeNode = useFlowStore((state) => state.removeNode);
  const updateNodeData = useFlowStore((state) => state.updateNodeData);

  const connectToTelegram = async () => {
    setConnecting(true);
    setError(null);
    
    try {
      // Simulate API validation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      updateNodeData(id, { 
        params: { 
          ...data.params, 
          botToken: TELEGRAM_BOT_TOKEN,
          isAuthenticated: true
        } 
      });
      
    } catch (err: any) {
      setError(err.message || 'Failed to authenticate with Telegram');
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
              message_id: Date.now(),
              chat: {
                id: data.params.chatId,
                type: 'private',
                title: 'Test Chat'
              },
              date: Math.floor(Date.now() / 1000),
              text: data.params.message
            },
            success: true,
            execution_time_ms: 450
          };
          break;
        case 'send_photo':
          mockResponse = {
            status: 200,
            content: {
              message_id: Date.now(),
              chat: {
                id: data.params.chatId,
                type: 'group',
                title: 'Test Group'
              },
              date: Math.floor(Date.now() / 1000),
              photo: [
                {
                  file_id: 'photo_' + Date.now(),
                  file_size: 12345,
                  width: 800,
                  height: 600
                }
              ]
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
      <div className="bg-gradient-to-r from-blue-400 to-cyan-500 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-medium text-white">Telegram</h3>
              <p className="text-xs text-blue-50/80">{data.params?.nodeName || 'telegram_0'}</p>
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
              <span className="text-sm text-gray-600">Telegram Authentication</span>
              {error && (
                <span className="text-xs text-red-500 flex items-center">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {error}
                </span>
              )}
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-medium text-gray-500">Bot Token</label>
              <input
                type="password"
                value={TELEGRAM_BOT_TOKEN}
                placeholder="Enter your Telegram bot token"
                className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                readOnly
              />
            </div>
            <button
              onClick={connectToTelegram}
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
                  <span>Connect with Telegram</span>
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
                className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="send_message">Send Message</option>
                <option value="send_photo">Send Photo</option>
                <option value="send_document">Send Document</option>
                <option value="send_poll">Send Poll</option>
                <option value="get_chat_info">Get Chat Info</option>
                <option value="get_chat_members">Get Chat Members</option>
              </select>
            </div>

            {/* Common Fields */}
            <div className="space-y-2">
              <label className="block text-xs font-medium text-gray-500">Chat ID</label>
              <input
                type="text"
                value={data.params?.chatId || ''}
                onChange={(e) => updateNodeData(id, { params: { ...data.params, chatId: e.target.value } })}
                placeholder="Enter chat ID or @username"
                className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Operation-specific Fields */}
            {data.params?.operation === 'send_message' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-gray-500">Message</label>
                  <textarea
                    value={data.params?.message || ''}
                    onChange={(e) => updateNodeData(id, { params: { ...data.params, message: e.target.value } })}
                    placeholder="Enter your message"
                    rows={4}
                    className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-gray-500">Parse Mode</label>
                  <select
                    value={data.params?.parseMode || 'HTML'}
                    onChange={(e) => updateNodeData(id, { params: { ...data.params, parseMode: e.target.value } })}
                    className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="HTML">HTML</option>
                    <option value="Markdown">Markdown</option>
                    <option value="MarkdownV2">MarkdownV2</option>
                  </select>
                </div>
              </div>
            )}

            {data.params?.operation === 'send_photo' && (
              <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-500">Photo URL</label>
                <input
                  type="text"
                  value={data.params?.photoUrl || ''}
                  onChange={(e) => updateNodeData(id, { params: { ...data.params, photoUrl: e.target.value } })}
                  placeholder="Enter photo URL"
                  className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}

            {data.params?.operation === 'send_document' && (
              <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-500">Document URL</label>
                <input
                  type="text"
                  value={data.params?.documentUrl || ''}
                  onChange={(e) => updateNodeData(id, { params: { ...data.params, documentUrl: e.target.value } })}
                  placeholder="Enter document URL"
                  className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}

            {data.params?.operation === 'send_poll' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-gray-500">Poll Question</label>
                  <input
                    type="text"
                    value={data.params?.pollQuestion || ''}
                    onChange={(e) => updateNodeData(id, { params: { ...data.params, pollQuestion: e.target.value } })}
                    placeholder="Enter poll question"
                    className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-gray-500">Poll Options (one per line)</label>
                  <textarea
                    value={data.params?.pollOptions?.join('\n') || ''}
                    onChange={(e) => updateNodeData(id, { 
                      params: { 
                        ...data.params, 
                        pollOptions: e.target.value.split('\n').filter(Boolean)
                      } 
                    })}
                    placeholder="Enter poll options"
                    rows={4}
                    className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}

            {/* Additional Options */}
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={data.params?.disableNotification || false}
                  onChange={(e) => updateNodeData(id, { 
                    params: { 
                      ...data.params, 
                      disableNotification: e.target.checked 
                    } 
                  })}
                  className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600">Disable Notification</span>
              </label>
            </div>

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

export default TelegramNode; 