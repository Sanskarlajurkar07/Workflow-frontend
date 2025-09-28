import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { Settings, Trash2, Trello as TrelloIcon, RefreshCw, LogIn, AlertCircle } from 'lucide-react';
import { useFlowStore } from '../../../../store/flowStore';

// Trello API credentials (to be replaced with user's credentials)
const TRELLO_API_KEY = 'your-trello-api-key';
const TRELLO_TOKEN = 'your-trello-token';

interface TrelloNodeProps {
  id: string;
  data: {
    params?: {
      nodeName?: string;
      operation?: 'list_boards' | 'create_board' | 'create_list' | 'create_card' | 'move_card' | 'add_comment' | 'get_board_members';
      boardId?: string;
      listId?: string;
      cardId?: string;
      boardName?: string;
      listName?: string;
      cardName?: string;
      cardDescription?: string;
      comment?: string;
      position?: 'top' | 'bottom';
      labels?: string[];
      dueDate?: string;
      showSettings?: boolean;
      apiKey?: string;
      token?: string;
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

const TrelloNode: React.FC<TrelloNodeProps> = ({ id, data, selected }) => {
  const [connecting, setConnecting] = useState<boolean>(false);
  const [testing, setTesting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const removeNode = useFlowStore((state) => state.removeNode);
  const updateNodeData = useFlowStore((state) => state.updateNodeData);

  const connectToTrello = async () => {
    setConnecting(true);
    setError(null);
    
    try {
      // Simulate API validation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      updateNodeData(id, { 
        params: { 
          ...data.params, 
          apiKey: TRELLO_API_KEY,
          token: TRELLO_TOKEN,
          isAuthenticated: true
        } 
      });
      
    } catch (err: any) {
      setError(err.message || 'Failed to authenticate with Trello');
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
        case 'list_boards':
          mockResponse = {
            status: 200,
            content: {
              boards: [
                { id: 'board1', name: 'Project Alpha', lists: 5, members: 3 },
                { id: 'board2', name: 'Marketing', lists: 3, members: 4 },
                { id: 'board3', name: 'Development', lists: 6, members: 8 }
              ]
            },
            success: true,
            execution_time_ms: 450
          };
          break;
        case 'create_card':
          mockResponse = {
            status: 200,
            content: {
              id: 'card_' + Date.now(),
              name: data.params?.cardName,
              description: data.params?.cardDescription,
              listId: data.params?.listId,
              position: data.params?.position || 'bottom',
              labels: data.params?.labels || [],
              dueDate: data.params?.dueDate
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
      selected ? 'ring-2 ring-blue-500' : 'ring-1 ring-gray-200'
    }`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-400 to-blue-600 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
              <TrelloIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-medium text-white">Trello</h3>
              <p className="text-xs text-blue-50/80">{data.params?.nodeName || 'trello_0'}</p>
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
              <span className="text-sm text-gray-600">Trello Authentication</span>
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
                value={TRELLO_API_KEY}
                placeholder="Enter your Trello API key"
                className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                readOnly
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-medium text-gray-500">Token</label>
              <input
                type="password"
                value={TRELLO_TOKEN}
                placeholder="Enter your Trello token"
                className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                readOnly
              />
            </div>
            <button
              onClick={connectToTrello}
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
                  <span>Connect with Trello</span>
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
                value={data.params?.operation || 'list_boards'}
                onChange={(e) => updateNodeData(id, { params: { ...data.params, operation: e.target.value } })}
                className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="list_boards">List Boards</option>
                <option value="create_board">Create Board</option>
                <option value="create_list">Create List</option>
                <option value="create_card">Create Card</option>
                <option value="move_card">Move Card</option>
                <option value="add_comment">Add Comment</option>
                <option value="get_board_members">Get Board Members</option>
              </select>
            </div>

            {/* Operation-specific Fields */}
            {['create_board'].includes(data.params?.operation || '') && (
              <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-500">Board Name</label>
                <input
                  type="text"
                  value={data.params?.boardName || ''}
                  onChange={(e) => updateNodeData(id, { params: { ...data.params, boardName: e.target.value } })}
                  placeholder="Enter board name"
                  className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}

            {['create_list', 'get_board_members'].includes(data.params?.operation || '') && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-gray-500">Board ID</label>
                  <input
                    type="text"
                    value={data.params?.boardId || ''}
                    onChange={(e) => updateNodeData(id, { params: { ...data.params, boardId: e.target.value } })}
                    placeholder="Enter board ID"
                    className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                {data.params?.operation === 'create_list' && (
                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-gray-500">List Name</label>
                    <input
                      type="text"
                      value={data.params?.listName || ''}
                      onChange={(e) => updateNodeData(id, { params: { ...data.params, listName: e.target.value } })}
                      placeholder="Enter list name"
                      className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                )}
              </div>
            )}

            {['create_card', 'move_card', 'add_comment'].includes(data.params?.operation || '') && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-gray-500">List ID</label>
                  <input
                    type="text"
                    value={data.params?.listId || ''}
                    onChange={(e) => updateNodeData(id, { params: { ...data.params, listId: e.target.value } })}
                    placeholder="Enter list ID"
                    className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                {data.params?.operation === 'create_card' && (
                  <>
                    <div className="space-y-2">
                      <label className="block text-xs font-medium text-gray-500">Card Name</label>
                      <input
                        type="text"
                        value={data.params?.cardName || ''}
                        onChange={(e) => updateNodeData(id, { params: { ...data.params, cardName: e.target.value } })}
                        placeholder="Enter card name"
                        className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-medium text-gray-500">Description</label>
                      <textarea
                        value={data.params?.cardDescription || ''}
                        onChange={(e) => updateNodeData(id, { params: { ...data.params, cardDescription: e.target.value } })}
                        placeholder="Enter card description"
                        rows={3}
                        className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-medium text-gray-500">Due Date</label>
                      <input
                        type="datetime-local"
                        value={data.params?.dueDate || ''}
                        onChange={(e) => updateNodeData(id, { params: { ...data.params, dueDate: e.target.value } })}
                        className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </>
                )}
                {['move_card', 'add_comment'].includes(data.params?.operation || '') && (
                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-gray-500">Card ID</label>
                    <input
                      type="text"
                      value={data.params?.cardId || ''}
                      onChange={(e) => updateNodeData(id, { params: { ...data.params, cardId: e.target.value } })}
                      placeholder="Enter card ID"
                      className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                )}
                {data.params?.operation === 'add_comment' && (
                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-gray-500">Comment</label>
                    <textarea
                      value={data.params?.comment || ''}
                      onChange={(e) => updateNodeData(id, { params: { ...data.params, comment: e.target.value } })}
                      placeholder="Enter your comment"
                      rows={3}
                      className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                )}
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

export default TrelloNode; 