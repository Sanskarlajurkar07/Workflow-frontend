import React, { useState } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Settings, Trash2, Copy, FileText, ChevronRight, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { useFlowStore } from '../../../../store/flowStore';
import { useNotionOAuth } from '../../../../hooks/useNotionOAuth';

interface NotionNodeData {
  params?: {
    nodeName?: string;
    action?: 'create-page' | 'update-page' | 'query-database';
    databaseId?: string;
    pageId?: string;
    properties?: string;
    oauthToken?: string;
    showSettings?: boolean;
  };
}

const NotionNode: React.FC<NodeProps<NotionNodeData>> = ({ id, data, selected }) => {
  const [currentStep, setCurrentStep] = useState(1); // Step tracker for configuration
  const [notionToken, setNotionToken] = useState('');
  const [isStoringToken, setIsStoringToken] = useState(false);
  const removeNode = useFlowStore((state) => state.removeNode);
  const updateNodeData = useFlowStore((state) => state.updateNodeData);
  
  // Use the Notion OAuth hook
  const {
    isConnected,
    isLoading,
    connectionStatus,
    storeNotionToken,
    error: oauthError
  } = useNotionOAuth();

  const handleActionChange = (action: 'create-page' | 'update-page' | 'query-database') => {
    updateNodeData(id, { action });
    setCurrentStep(2); // Move to the next step
  };

  const handleTokenSubmit = async () => {
    if (!notionToken.trim()) {
      return;
    }
    
    setIsStoringToken(true);
    const success = await storeNotionToken(notionToken.trim());
    setIsStoringToken(false);
    
    if (success) {
      setNotionToken(''); // Clear the input
      // The connection status will be updated automatically by the hook
    }
  };

  // Determine the current step based on OAuth status and data
  const getCurrentStep = () => {
    if (!data.params?.action) return 1;
    if (!isConnected) return 2;
    return 3;
  };

  const actualCurrentStep = getCurrentStep();

  const renderConnectionStatus = () => {
    if (isLoading) {
      return (
        <div className="flex items-center space-x-2 text-blue-600">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">Checking connection...</span>
        </div>
      );
    }

    if (oauthError) {
      return (
        <div className="flex items-center space-x-2 text-red-600">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">Connection error: {oauthError}</span>
        </div>
      );
    }

    if (isConnected) {
      return (
        <div className="flex items-center space-x-2 text-green-600">
          <CheckCircle className="w-4 h-4" />
          <span className="text-sm">Connected to Notion</span>
        </div>
      );
    }

    return null;
  };

  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden ${
      selected ? 'ring-2 ring-purple-500' : 'border border-gray-200'
    }`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-medium text-white">Notion</h3>
              <p className="text-xs text-purple-50/80">{data.params?.nodeName || 'notion_1'}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigator.clipboard.writeText(id)}
              className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/20 transition-colors"
              title="Copy Node ID"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              onClick={() => updateNodeData(id, { showSettings: !data.params?.showSettings })}
              className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/20 transition-colors"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={() => removeNode(id)}
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
        {/* Connection Status */}
        {renderConnectionStatus()}

        {actualCurrentStep === 1 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Select an action</h4>
            <div className="space-y-2">
              <button
                onClick={() => handleActionChange('create-page')}
                className="w-full flex items-center justify-between px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <span className="text-sm font-medium text-gray-700">Create Page</span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
              <button
                onClick={() => handleActionChange('update-page')}
                className="w-full flex items-center justify-between px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <span className="text-sm font-medium text-gray-700">Update Page</span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
              <button
                onClick={() => handleActionChange('query-database')}
                className="w-full flex items-center justify-between px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <span className="text-sm font-medium text-gray-700">Query Database</span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>
        )}

        {actualCurrentStep === 2 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Connect your Notion account</h4>
            <p className="text-xs text-gray-500 mb-3">
              Enter your Notion integration token. You can create one at{' '}
              <a 
                href="https://www.notion.so/my-integrations" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-purple-600 hover:text-purple-800 underline"
              >
                notion.so/my-integrations
              </a>
            </p>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notion Integration Token
                </label>
                <input
                  type="password"
                  value={notionToken}
                  onChange={(e) => setNotionToken(e.target.value)}
                  placeholder="ntn_..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                />
              </div>
              
              <button
                onClick={handleTokenSubmit}
                disabled={isStoringToken || !notionToken.trim()}
                className="w-full px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:bg-purple-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isStoringToken ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Connecting...</span>
                  </>
                ) : (
                  <span>Connect with Notion</span>
                )}
              </button>
            </div>
            
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mt-3">
              <h5 className="text-sm font-medium text-purple-800 mb-1">How to get your Notion token:</h5>
              <ol className="text-xs text-purple-600 space-y-1">
                <li>1. Go to <a href="https://www.notion.so/my-integrations" target="_blank" rel="noopener noreferrer" className="underline">notion.so/my-integrations</a></li>
                <li>2. Click "New integration"</li>
                <li>3. Give it a name and select your workspace</li>
                <li>4. Copy the "Internal Integration Token"</li>
                <li>5. Share your databases with the integration</li>
              </ol>
            </div>
          </div>
        )}

        {actualCurrentStep === 3 && (
          <div className="space-y-4">
            {data.params?.action === 'create-page' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Database ID</label>
                  <input
                    type="text"
                    value={data.params?.databaseId || ''}
                    onChange={(e) => updateNodeData(id, { databaseId: e.target.value })}
                    placeholder="Enter Database ID"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Properties</label>
                  <textarea
                    value={data.params?.properties || ''}
                    onChange={(e) => updateNodeData(id, { properties: e.target.value })}
                    placeholder="Enter properties as JSON"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                    rows={4}
                  />
                </div>
              </>
            )}

            {data.params?.action === 'update-page' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Page ID</label>
                  <input
                    type="text"
                    value={data.params?.pageId || ''}
                    onChange={(e) => updateNodeData(id, { pageId: e.target.value })}
                    placeholder="Enter Page ID"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Properties</label>
                  <textarea
                    value={data.params?.properties || ''}
                    onChange={(e) => updateNodeData(id, { properties: e.target.value })}
                    placeholder="Enter properties as JSON"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                    rows={4}
                  />
                </div>
              </>
            )}

            {data.params?.action === 'query-database' && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Database ID</label>
                <input
                  type="text"
                  value={data.params?.databaseId || ''}
                  onChange={(e) => updateNodeData(id, { databaseId: e.target.value })}
                  placeholder="Enter Database ID"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                />
              </div>
            )}
            
            {/* Action-specific configuration help */}
            {data.params?.action && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                <h5 className="text-sm font-medium text-purple-800 mb-1">
                  Configuration for: {data.params.action.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </h5>
                <p className="text-xs text-purple-600">
                  {data.params.action === 'create-page' && 'This will create a new page in the specified database with the provided properties.'}
                  {data.params.action === 'update-page' && 'Use Properties to specify the updated data for the page in JSON format.'}
                  {data.params.action === 'query-database' && 'This will query the specified database and return matching results.'}
                </p>
              </div>
            )}
          </div>
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

export default NotionNode;