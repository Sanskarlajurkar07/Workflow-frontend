import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { Settings, Trash2, LayoutGrid, RefreshCw, LogIn, AlertCircle } from 'lucide-react';
import { useFlowStore } from '../../../../store/flowStore';

// Linear API credentials (to be replaced with user's credentials)
const LINEAR_API_KEY = 'your-linear-api-key';

interface LinearNodeProps {
  id: string;
  data: {
    params?: {
      nodeName?: string;
      operation?: 'list_issues' | 'create_issue' | 'update_issue' | 'create_comment' | 'list_teams' | 'list_projects' | 'create_project';
      teamId?: string;
      projectId?: string;
      issueId?: string;
      title?: string;
      description?: string;
      assigneeId?: string;
      priority?: 0 | 1 | 2 | 3;
      status?: string;
      labels?: string[];
      dueDate?: string;
      comment?: string;
      projectName?: string;
      projectIcon?: string;
      projectColor?: string;
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

const LinearNode: React.FC<LinearNodeProps> = ({ id, data, selected }) => {
  const [connecting, setConnecting] = useState<boolean>(false);
  const [testing, setTesting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const removeNode = useFlowStore((state) => state.removeNode);
  const updateNodeData = useFlowStore((state) => state.updateNodeData);

  const connectToLinear = async () => {
    setConnecting(true);
    setError(null);
    
    try {
      // Simulate API validation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      updateNodeData(id, { 
        params: { 
          ...data.params, 
          apiKey: LINEAR_API_KEY,
          isAuthenticated: true
        } 
      });
      
    } catch (err: any) {
      setError(err.message || 'Failed to authenticate with Linear');
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
        case 'list_issues':
          mockResponse = {
            status: 200,
            content: {
              nodes: [
                {
                  id: 'ISS-1',
                  title: 'Implement new feature',
                  description: 'Add authentication flow',
                  priority: 2,
                  status: 'In Progress',
                  assignee: { id: 'USER-1', name: 'John Doe' },
                  createdAt: new Date().toISOString()
                },
                {
                  id: 'ISS-2',
                  title: 'Fix bug in API',
                  description: 'Handle edge cases',
                  priority: 1,
                  status: 'Todo',
                  assignee: { id: 'USER-2', name: 'Jane Smith' },
                  createdAt: new Date().toISOString()
                }
              ],
              pageInfo: {
                hasNextPage: false,
                endCursor: 'xyz123'
              }
            },
            success: true,
            execution_time_ms: 450
          };
          break;
        case 'create_issue':
          mockResponse = {
            status: 200,
            content: {
              issue: {
                id: 'ISS-' + Date.now(),
                title: data.params.title,
                description: data.params.description,
                priority: data.params.priority,
                status: data.params.status,
                assignee: data.params.assigneeId ? { id: data.params.assigneeId } : null,
                createdAt: new Date().toISOString()
              }
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
      selected ? 'ring-2 ring-purple-500' : 'ring-1 ring-gray-200'
    }`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
              <LayoutGrid className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-medium text-white">Linear</h3>
              <p className="text-xs text-purple-50/80">{data.params?.nodeName || 'linear_0'}</p>
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
              <span className="text-sm text-gray-600">Linear Authentication</span>
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
                value={LINEAR_API_KEY}
                placeholder="Enter your Linear API key"
                className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                readOnly
              />
            </div>
            <button
              onClick={connectToLinear}
              disabled={connecting}
              className={`w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg text-white ${
                connecting ? 'bg-purple-400' : 'bg-purple-500 hover:bg-purple-600'
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
                  <span>Connect with Linear</span>
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
                value={data.params?.operation || 'list_issues'}
                onChange={(e) => updateNodeData(id, { params: { ...data.params, operation: e.target.value } })}
                className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="list_issues">List Issues</option>
                <option value="create_issue">Create Issue</option>
                <option value="update_issue">Update Issue</option>
                <option value="create_comment">Create Comment</option>
                <option value="list_teams">List Teams</option>
                <option value="list_projects">List Projects</option>
                <option value="create_project">Create Project</option>
              </select>
            </div>

            {/* Operation-specific Fields */}
            {['list_issues', 'create_issue'].includes(data.params?.operation || '') && (
              <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-500">Team ID</label>
                <input
                  type="text"
                  value={data.params?.teamId || ''}
                  onChange={(e) => updateNodeData(id, { params: { ...data.params, teamId: e.target.value } })}
                  placeholder="Enter team ID"
                  className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            )}

            {['create_issue', 'update_issue'].includes(data.params?.operation || '') && (
              <div className="space-y-4">
                {data.params?.operation === 'update_issue' && (
                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-gray-500">Issue ID</label>
                    <input
                      type="text"
                      value={data.params?.issueId || ''}
                      onChange={(e) => updateNodeData(id, { params: { ...data.params, issueId: e.target.value } })}
                      placeholder="Enter issue ID"
                      className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-gray-500">Title</label>
                  <input
                    type="text"
                    value={data.params?.title || ''}
                    onChange={(e) => updateNodeData(id, { params: { ...data.params, title: e.target.value } })}
                    placeholder="Enter issue title"
                    className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-gray-500">Description</label>
                  <textarea
                    value={data.params?.description || ''}
                    onChange={(e) => updateNodeData(id, { params: { ...data.params, description: e.target.value } })}
                    placeholder="Enter issue description"
                    rows={4}
                    className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-gray-500">Assignee ID</label>
                  <input
                    type="text"
                    value={data.params?.assigneeId || ''}
                    onChange={(e) => updateNodeData(id, { params: { ...data.params, assigneeId: e.target.value } })}
                    placeholder="Enter assignee ID"
                    className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-gray-500">Priority</label>
                  <select
                    value={data.params?.priority || 0}
                    onChange={(e) => updateNodeData(id, { params: { ...data.params, priority: parseInt(e.target.value) } })}
                    className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value={0}>No Priority</option>
                    <option value={1}>Urgent</option>
                    <option value={2}>High</option>
                    <option value={3}>Normal</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-gray-500">Status</label>
                  <input
                    type="text"
                    value={data.params?.status || ''}
                    onChange={(e) => updateNodeData(id, { params: { ...data.params, status: e.target.value } })}
                    placeholder="Enter status"
                    className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-gray-500">Due Date</label>
                  <input
                    type="date"
                    value={data.params?.dueDate || ''}
                    onChange={(e) => updateNodeData(id, { params: { ...data.params, dueDate: e.target.value } })}
                    className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}

            {data.params?.operation === 'create_comment' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-gray-500">Issue ID</label>
                  <input
                    type="text"
                    value={data.params?.issueId || ''}
                    onChange={(e) => updateNodeData(id, { params: { ...data.params, issueId: e.target.value } })}
                    placeholder="Enter issue ID"
                    className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-gray-500">Comment</label>
                  <textarea
                    value={data.params?.comment || ''}
                    onChange={(e) => updateNodeData(id, { params: { ...data.params, comment: e.target.value } })}
                    placeholder="Enter your comment"
                    rows={4}
                    className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}

            {data.params?.operation === 'create_project' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-gray-500">Team ID</label>
                  <input
                    type="text"
                    value={data.params?.teamId || ''}
                    onChange={(e) => updateNodeData(id, { params: { ...data.params, teamId: e.target.value } })}
                    placeholder="Enter team ID"
                    className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-gray-500">Project Name</label>
                  <input
                    type="text"
                    value={data.params?.projectName || ''}
                    onChange={(e) => updateNodeData(id, { params: { ...data.params, projectName: e.target.value } })}
                    placeholder="Enter project name"
                    className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-gray-500">Project Icon</label>
                  <input
                    type="text"
                    value={data.params?.projectIcon || ''}
                    onChange={(e) => updateNodeData(id, { params: { ...data.params, projectIcon: e.target.value } })}
                    placeholder="Enter project icon (emoji)"
                    className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-gray-500">Project Color</label>
                  <input
                    type="text"
                    value={data.params?.projectColor || ''}
                    onChange={(e) => updateNodeData(id, { params: { ...data.params, projectColor: e.target.value } })}
                    placeholder="Enter project color (hex)"
                    className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}

            {/* Test Operation Button */}
            <div className="flex items-center justify-between pt-4">
              <button
                onClick={testOperation}
                disabled={testing}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-white ${
                  testing ? 'bg-gray-400' : 'bg-purple-500 hover:bg-purple-600'
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
        className="w-3 h-3 -ml-0.5 bg-purple-500 border-2 border-white rounded-full"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 -mr-0.5 bg-purple-500 border-2 border-white rounded-full"
      />
    </div>
  );
};

export default LinearNode; 