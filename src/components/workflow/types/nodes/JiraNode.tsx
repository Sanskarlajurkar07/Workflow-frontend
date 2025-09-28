import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { Settings, Trash2, CheckSquare, RefreshCw, LogIn, AlertCircle } from 'lucide-react';
import { useFlowStore } from '../../../../store/flowStore';

// Jira API credentials (to be replaced with user's credentials)
const JIRA_DOMAIN = 'your-domain.atlassian.net';
const JIRA_EMAIL = 'your-email@example.com';
const JIRA_API_TOKEN = 'your-jira-api-token';

interface JiraNodeProps {
  id: string;
  data: {
    params?: {
      nodeName?: string;
      operation?: 'list_issues' | 'create_issue' | 'update_issue' | 'add_comment' | 'transition_issue' | 'create_sprint' | 'search_issues';
      projectKey?: string;
      issueKey?: string;
      issueType?: string;
      summary?: string;
      description?: string;
      assignee?: string;
      priority?: string;
      labels?: string[];
      components?: string[];
      comment?: string;
      transitionId?: string;
      sprintName?: string;
      sprintGoal?: string;
      startDate?: string;
      endDate?: string;
      searchQuery?: string;
      showSettings?: boolean;
      domain?: string;
      email?: string;
      apiToken?: string;
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

const JiraNode: React.FC<JiraNodeProps> = ({ id, data, selected }) => {
  const [connecting, setConnecting] = useState<boolean>(false);
  const [testing, setTesting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const removeNode = useFlowStore((state) => state.removeNode);
  const updateNodeData = useFlowStore((state) => state.updateNodeData);

  const connectToJira = async () => {
    setConnecting(true);
    setError(null);
    
    try {
      // Simulate API validation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      updateNodeData(id, { 
        params: { 
          ...data.params, 
          domain: JIRA_DOMAIN,
          email: JIRA_EMAIL,
          apiToken: JIRA_API_TOKEN,
          isAuthenticated: true
        } 
      });
      
    } catch (err: any) {
      setError(err.message || 'Failed to authenticate with Jira');
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
              issues: [
                {
                  key: 'PROJ-1',
                  fields: {
                    summary: 'Implement authentication',
                    description: 'Add OAuth2 flow',
                    status: { name: 'In Progress' },
                    assignee: { displayName: 'John Doe' },
                    priority: { name: 'High' },
                    created: new Date().toISOString()
                  }
                },
                {
                  key: 'PROJ-2',
                  fields: {
                    summary: 'Fix API bug',
                    description: 'Handle edge cases',
                    status: { name: 'To Do' },
                    assignee: { displayName: 'Jane Smith' },
                    priority: { name: 'Medium' },
                    created: new Date().toISOString()
                  }
                }
              ],
              total: 2
            },
            success: true,
            execution_time_ms: 450
          };
          break;
        case 'create_issue':
          mockResponse = {
            status: 200,
            content: {
              id: Date.now().toString(),
              key: `${data.params.projectKey}-${Math.floor(Math.random() * 1000)}`,
              self: `https://${JIRA_DOMAIN}/rest/api/3/issue/${Date.now()}`,
              fields: {
                summary: data.params.summary,
                description: data.params.description,
                assignee: data.params.assignee ? { name: data.params.assignee } : null,
                priority: { name: data.params.priority },
                labels: data.params.labels,
                components: data.params.components?.map(name => ({ name }))
              }
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
              <CheckSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-medium text-white">Jira</h3>
              <p className="text-xs text-blue-50/80">{data.params?.nodeName || 'jira_0'}</p>
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
              <span className="text-sm text-gray-600">Jira Authentication</span>
              {error && (
                <span className="text-xs text-red-500 flex items-center">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {error}
                </span>
              )}
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-medium text-gray-500">Domain</label>
              <input
                type="text"
                value={JIRA_DOMAIN}
                placeholder="your-domain.atlassian.net"
                className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                readOnly
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-medium text-gray-500">Email</label>
              <input
                type="email"
                value={JIRA_EMAIL}
                placeholder="Enter your Jira email"
                className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                readOnly
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-medium text-gray-500">API Token</label>
              <input
                type="password"
                value={JIRA_API_TOKEN}
                placeholder="Enter your Jira API token"
                className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                readOnly
              />
            </div>
            <button
              onClick={connectToJira}
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
                  <span>Connect with Jira</span>
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
                className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="list_issues">List Issues</option>
                <option value="create_issue">Create Issue</option>
                <option value="update_issue">Update Issue</option>
                <option value="add_comment">Add Comment</option>
                <option value="transition_issue">Transition Issue</option>
                <option value="create_sprint">Create Sprint</option>
                <option value="search_issues">Search Issues</option>
              </select>
            </div>

            {/* Common Fields */}
            {['list_issues', 'create_issue'].includes(data.params?.operation || '') && (
              <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-500">Project Key</label>
                <input
                  type="text"
                  value={data.params?.projectKey || ''}
                  onChange={(e) => updateNodeData(id, { params: { ...data.params, projectKey: e.target.value } })}
                  placeholder="Enter project key (e.g., PROJ)"
                  className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}

            {/* Operation-specific Fields */}
            {['create_issue', 'update_issue'].includes(data.params?.operation || '') && (
              <div className="space-y-4">
                {data.params?.operation === 'update_issue' && (
                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-gray-500">Issue Key</label>
                    <input
                      type="text"
                      value={data.params?.issueKey || ''}
                      onChange={(e) => updateNodeData(id, { params: { ...data.params, issueKey: e.target.value } })}
                      placeholder="Enter issue key"
                      className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-gray-500">Issue Type</label>
                  <select
                    value={data.params?.issueType || 'Task'}
                    onChange={(e) => updateNodeData(id, { params: { ...data.params, issueType: e.target.value } })}
                    className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Task">Task</option>
                    <option value="Bug">Bug</option>
                    <option value="Story">Story</option>
                    <option value="Epic">Epic</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-gray-500">Summary</label>
                  <input
                    type="text"
                    value={data.params?.summary || ''}
                    onChange={(e) => updateNodeData(id, { params: { ...data.params, summary: e.target.value } })}
                    placeholder="Enter issue summary"
                    className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-gray-500">Description</label>
                  <textarea
                    value={data.params?.description || ''}
                    onChange={(e) => updateNodeData(id, { params: { ...data.params, description: e.target.value } })}
                    placeholder="Enter issue description"
                    rows={4}
                    className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-gray-500">Assignee</label>
                  <input
                    type="text"
                    value={data.params?.assignee || ''}
                    onChange={(e) => updateNodeData(id, { params: { ...data.params, assignee: e.target.value } })}
                    placeholder="Enter assignee username"
                    className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-gray-500">Priority</label>
                  <select
                    value={data.params?.priority || 'Medium'}
                    onChange={(e) => updateNodeData(id, { params: { ...data.params, priority: e.target.value } })}
                    className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Highest">Highest</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                    <option value="Lowest">Lowest</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-gray-500">Labels (comma-separated)</label>
                  <input
                    type="text"
                    value={data.params?.labels?.join(',') || ''}
                    onChange={(e) => updateNodeData(id, { 
                      params: { 
                        ...data.params, 
                        labels: e.target.value.split(',').map(label => label.trim()).filter(Boolean)
                      } 
                    })}
                    placeholder="Enter labels"
                    className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}

            {data.params?.operation === 'add_comment' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-gray-500">Issue Key</label>
                  <input
                    type="text"
                    value={data.params?.issueKey || ''}
                    onChange={(e) => updateNodeData(id, { params: { ...data.params, issueKey: e.target.value } })}
                    placeholder="Enter issue key"
                    className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-gray-500">Comment</label>
                  <textarea
                    value={data.params?.comment || ''}
                    onChange={(e) => updateNodeData(id, { params: { ...data.params, comment: e.target.value } })}
                    placeholder="Enter your comment"
                    rows={4}
                    className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}

            {data.params?.operation === 'transition_issue' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-gray-500">Issue Key</label>
                  <input
                    type="text"
                    value={data.params?.issueKey || ''}
                    onChange={(e) => updateNodeData(id, { params: { ...data.params, issueKey: e.target.value } })}
                    placeholder="Enter issue key"
                    className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-gray-500">Transition ID</label>
                  <input
                    type="text"
                    value={data.params?.transitionId || ''}
                    onChange={(e) => updateNodeData(id, { params: { ...data.params, transitionId: e.target.value } })}
                    placeholder="Enter transition ID"
                    className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}

            {data.params?.operation === 'create_sprint' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-gray-500">Sprint Name</label>
                  <input
                    type="text"
                    value={data.params?.sprintName || ''}
                    onChange={(e) => updateNodeData(id, { params: { ...data.params, sprintName: e.target.value } })}
                    placeholder="Enter sprint name"
                    className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-gray-500">Sprint Goal</label>
                  <textarea
                    value={data.params?.sprintGoal || ''}
                    onChange={(e) => updateNodeData(id, { params: { ...data.params, sprintGoal: e.target.value } })}
                    placeholder="Enter sprint goal"
                    rows={3}
                    className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-gray-500">Start Date</label>
                    <input
                      type="date"
                      value={data.params?.startDate || ''}
                      onChange={(e) => updateNodeData(id, { params: { ...data.params, startDate: e.target.value } })}
                      className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-gray-500">End Date</label>
                    <input
                      type="date"
                      value={data.params?.endDate || ''}
                      onChange={(e) => updateNodeData(id, { params: { ...data.params, endDate: e.target.value } })}
                      className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            )}

            {data.params?.operation === 'search_issues' && (
              <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-500">JQL Query</label>
                <textarea
                  value={data.params?.searchQuery || ''}
                  onChange={(e) => updateNodeData(id, { params: { ...data.params, searchQuery: e.target.value } })}
                  placeholder="Enter JQL query"
                  rows={3}
                  className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
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

export default JiraNode; 