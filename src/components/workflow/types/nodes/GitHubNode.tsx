import React from 'react';
import { Handle, Position } from 'reactflow';
import { Settings, Trash2, Github, CheckCircle, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { useFlowStore } from '../../../../store/flowStore';
import { useGitHubOAuth } from '../../../../hooks/useGitHubOAuth';

interface GitHubNodeProps {
  id: string;
  data: {
    params?: {
      nodeName?: string;
      account?: boolean;
      showSettings?: boolean;
      showConfig?: boolean;
      action?: string;
      ownerName?: string;
      repoName?: string;
      branchName?: string;
      fileName?: string;
      base?: string;
      head?: string;
      title?: string;
      body?: string;
      pullNumber?: string;
    };
  };
  selected?: boolean;
}

const GitHubNode: React.FC<GitHubNodeProps> = ({ id, data, selected }) => {
  const removeNode = useFlowStore((state) => state.removeNode);
  const updateNodeData = useFlowStore((state) => state.updateNodeData);

  // Use the GitHub OAuth hook
  const {
    isConnected,
    isLoading,
    connectionStatus,
    connectToGitHub,
    checkConnectionStatus,
    error: oauthError
  } = useGitHubOAuth();

  // Listen for OAuth completion and refresh status
  React.useEffect(() => {
    const handleFocus = () => {
      // When the window regains focus (user returns from OAuth), check connection status
      if (!isConnected) {
        checkConnectionStatus();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [isConnected, checkConnectionStatus]);

  const handleDelete = () => {
    removeNode(id);
  };

  const handleConnectAccount = () => {
    connectToGitHub();
  };

  const renderConnectionStatus = () => {
    if (isLoading) {
      return (
        <div className="flex items-center space-x-2 text-blue-600 mb-3">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">Checking connection...</span>
        </div>
      );
    }

    if (oauthError) {
      return (
        <div className="flex items-center space-x-2 text-red-600 mb-3">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">Connection error: {oauthError}</span>
        </div>
      );
    }

    if (isConnected && connectionStatus) {
      return (
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2 text-green-600">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm">
              Connected as @{connectionStatus.github_username}
            </span>
          </div>
          <button
            onClick={checkConnectionStatus}
            className="p-1 rounded hover:bg-gray-100 transition-colors"
            title="Refresh connection status"
          >
            <RefreshCw className="w-3 h-3 text-gray-500" />
          </button>
        </div>
      );
    }

    return null;
  };

  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden ${
      selected ? 'ring-2 ring-gray-800' : 'border border-gray-200'
    }`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-600 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
              <Github className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-medium text-white">GitHub</h3>
              <p className="text-xs text-gray-300">{data.params?.nodeName || 'github_0'}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => updateNodeData(id, { showSettings: !data.params?.showSettings })}
              className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/20 transition-colors"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={handleDelete}
              className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-red-400/20 transition-colors"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Node Name */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Node Name</label>
          <input
            type="text"
            value={data.params?.nodeName || 'github_0'}
            onChange={(e) => updateNodeData(id, { nodeName: e.target.value })}
            className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-gray-800 focus:border-transparent"
          />
        </div>

        {/* Connection Status */}
        {renderConnectionStatus()}

        {/* Connection Config */}
        {!isConnected && (
          <div className="space-y-2">
            <button
              onClick={handleConnectAccount}
              disabled={isLoading}
              className="w-full px-3 py-1.5 text-sm text-gray-800 border border-gray-300 rounded hover:bg-gray-100 disabled:bg-gray-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Connecting...</span>
                </>
              ) : (
                <span>+ Connect GitHub Account</span>
              )}
            </button>
            <p className="text-xs text-gray-500">
              Connect your GitHub account to access repositories and perform actions.
            </p>
          </div>
        )}

        {isConnected && (
          <div className="space-y-3">
            {/* Action Selection */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Action *</label>
              <select
                value={data.params?.action || 'read-file'}
                onChange={(e) => updateNodeData(id, { action: e.target.value })}
                className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-gray-800 focus:border-transparent"
              >
                <option value="read-file">Read a file</option>
                <option value="create-pull-request">Create a pull request</option>
                <option value="update-pull-request">Update a Pull Request</option>
                <option value="list-repositories">List repositories</option>
                <option value="create-issue">Create an issue</option>
              </select>
            </div>

            {/* Repository Details */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Owner Name *</label>
              <input
                type="text"
                placeholder="Enter repository owner name..."
                value={data.params?.ownerName || ''}
                onChange={(e) => updateNodeData(id, { ownerName: e.target.value })}
                className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-gray-800 focus:border-transparent"
              />
              {!data.params?.ownerName && (
                <p className="text-xs text-red-500 mt-1">Owner name is required</p>
              )}
            </div>

            {data.params?.action !== 'list-repositories' && (
              <>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Repository Name *</label>
                  <input
                    type="text"
                    placeholder="Enter repository name..."
                    value={data.params?.repoName || ''}
                    onChange={(e) => updateNodeData(id, { repoName: e.target.value })}
                    className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-gray-800 focus:border-transparent"
                  />
                  {!data.params?.repoName && (
                    <p className="text-xs text-red-500 mt-1">Repository name is required</p>
                  )}
                </div>

                {(data.params?.action === 'read-file' || data.params?.action === 'create-pull-request') && (
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Branch Name *</label>
                    <input
                      type="text"
                      placeholder="Enter branch name (e.g., main, master)..."
                      value={data.params?.branchName || ''}
                      onChange={(e) => updateNodeData(id, { branchName: e.target.value })}
                      className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-gray-800 focus:border-transparent"
                    />
                    {!data.params?.branchName && (
                      <p className="text-xs text-red-500 mt-1">Branch name is required</p>
                    )}
                  </div>
                )}

                {data.params?.action === 'read-file' && (
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">File Path *</label>
                    <input
                      type="text"
                      placeholder="Enter file path (e.g., README.md, src/index.js)..."
                      value={data.params?.fileName || ''}
                      onChange={(e) => updateNodeData(id, { fileName: e.target.value })}
                      className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-gray-800 focus:border-transparent"
                    />
                    {!data.params?.fileName && (
                      <p className="text-xs text-red-500 mt-1">File path is required</p>
                    )}
                  </div>
                )}

                {(data.params?.action === 'create-pull-request' || data.params?.action === 'create-issue') && (
                  <>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Title *</label>
                      <input
                        type="text"
                        placeholder="Enter title..."
                        value={data.params?.title || ''}
                        onChange={(e) => updateNodeData(id, { title: e.target.value })}
                        className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-gray-800 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Body</label>
                      <textarea
                        placeholder="Enter description..."
                        value={data.params?.body || ''}
                        onChange={(e) => updateNodeData(id, { body: e.target.value })}
                        className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-gray-800 focus:border-transparent"
                        rows={3}
                      />
                    </div>
                  </>
                )}

                {data.params?.action === 'update-pull-request' && (
                  <>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Pull Request Number *</label>
                      <input
                        type="number"
                        placeholder="Enter PR number..."
                        value={data.params?.pullNumber || ''}
                        onChange={(e) => updateNodeData(id, { pullNumber: e.target.value })}
                        className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-gray-800 focus:border-transparent"
                      />
                      {!data.params?.pullNumber && (
                        <p className="text-xs text-red-500 mt-1">Pull request number is required</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Title</label>
                      <input
                        type="text"
                        placeholder="Enter new title (optional)..."
                        value={data.params?.title || ''}
                        onChange={(e) => updateNodeData(id, { title: e.target.value })}
                        className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-gray-800 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Body</label>
                      <textarea
                        placeholder="Enter new description (optional)..."
                        value={data.params?.body || ''}
                        onChange={(e) => updateNodeData(id, { body: e.target.value })}
                        className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-gray-800 focus:border-transparent"
                        rows={3}
                      />
                    </div>
                  </>
                )}
              </>
            )}

            {/* Action-specific help */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <h5 className="text-sm font-medium text-gray-800 mb-1">
                Action: {data.params?.action?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </h5>
              <p className="text-xs text-gray-600">
                {data.params?.action === 'read-file' && 'Read the contents of a file from the specified repository and branch.'}
                {data.params?.action === 'create-pull-request' && 'Create a new pull request in the repository.'}
                {data.params?.action === 'update-pull-request' && 'Update an existing pull request.'}
                {data.params?.action === 'list-repositories' && 'List all repositories for the specified owner.'}
                {data.params?.action === 'create-issue' && 'Create a new issue in the repository.'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Handles */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 -ml-0.5 bg-gray-800 border-2 border-white rounded-full"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 -mr-0.5 bg-gray-800 border-2 border-white rounded-full"
      />
    </div>
  );
};

export default GitHubNode;