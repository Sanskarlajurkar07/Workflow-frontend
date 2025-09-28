import React, { useState } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Settings, Trash2, Copy, Building2, ChevronRight, CheckCircle, Loader2, AlertCircle, Users, Briefcase, Ticket, FileText, Phone, Calendar, Mail, CheckSquare } from 'lucide-react';
import { useFlowStore } from '../../../../store/flowStore';
import { useHubSpotOAuth } from '../../../../hooks/useHubSpotOAuth';

interface HubSpotNodeData {
  params?: {
    nodeName?: string;
    action?: 'fetch-contacts' | 'create-contact' | 'fetch-companies' | 'create-company' | 'fetch-deals' | 'create-deal' | 'fetch-tickets' | 'create-ticket' | 'fetch-notes' | 'create-note' | 'fetch-calls' | 'create-call' | 'fetch-tasks' | 'create-task' | 'fetch-meetings' | 'create-meeting' | 'fetch-emails' | 'create-email';
    objectType?: 'contacts' | 'companies' | 'deals' | 'tickets' | 'notes' | 'calls' | 'tasks' | 'meetings' | 'emails';
    properties?: string;
    filters?: string;
    limit?: number;
    objectId?: string;
    showSettings?: boolean;
  };
}

const HubSpotNode: React.FC<NodeProps<HubSpotNodeData>> = ({ id, data, selected }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const removeNode = useFlowStore((state) => state.removeNode);
  const updateNodeData = useFlowStore((state) => state.updateNodeData);
  
  // Use the HubSpot OAuth hook
  const {
    isConnected,
    isLoading,
    connectionStatus,
    connectToHubSpot,
    error: oauthError
  } = useHubSpotOAuth();

  const actionCategories = [
    {
      title: 'Contacts',
      icon: Users,
      actions: [
        { id: 'fetch-contacts', label: 'Fetch Contacts', type: 'fetch' },
        { id: 'create-contact', label: 'Create Contact', type: 'create' }
      ]
    },
    {
      title: 'Companies',
      icon: Building2,
      actions: [
        { id: 'fetch-companies', label: 'Fetch Companies', type: 'fetch' },
        { id: 'create-company', label: 'Create Company', type: 'create' }
      ]
    },
    {
      title: 'Deals',
      icon: Briefcase,
      actions: [
        { id: 'fetch-deals', label: 'Fetch Deals', type: 'fetch' },
        { id: 'create-deal', label: 'Create Deal', type: 'create' }
      ]
    },
    {
      title: 'Tickets',
      icon: Ticket,
      actions: [
        { id: 'fetch-tickets', label: 'Fetch Tickets', type: 'fetch' },
        { id: 'create-ticket', label: 'Create Ticket', type: 'create' }
      ]
    },
    {
      title: 'Notes',
      icon: FileText,
      actions: [
        { id: 'fetch-notes', label: 'Fetch Notes', type: 'fetch' },
        { id: 'create-note', label: 'Create Note', type: 'create' }
      ]
    },
    {
      title: 'Calls',
      icon: Phone,
      actions: [
        { id: 'fetch-calls', label: 'Fetch Calls', type: 'fetch' },
        { id: 'create-call', label: 'Create Call', type: 'create' }
      ]
    },
    {
      title: 'Tasks',
      icon: CheckSquare,
      actions: [
        { id: 'fetch-tasks', label: 'Fetch Tasks', type: 'fetch' },
        { id: 'create-task', label: 'Create Task', type: 'create' }
      ]
    },
    {
      title: 'Meetings',
      icon: Calendar,
      actions: [
        { id: 'fetch-meetings', label: 'Fetch Meetings', type: 'fetch' },
        { id: 'create-meeting', label: 'Create Meeting', type: 'create' }
      ]
    },
    {
      title: 'Emails',
      icon: Mail,
      actions: [
        { id: 'fetch-emails', label: 'Fetch Emails', type: 'fetch' },
        { id: 'create-email', label: 'Create Email', type: 'create' }
      ]
    }
  ];

  const handleActionChange = (action: string) => {
    updateNodeData(id, { action });
    setCurrentStep(2);
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
          <span className="text-sm">Connected to HubSpot</span>
        </div>
      );
    }

    return null;
  };

  const getActionTypeColor = (type: string) => {
    return type === 'fetch' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-green-50 border-green-200 text-green-700';
  };

  const renderActionConfiguration = () => {
    const action = data.params?.action;
    if (!action) return null;

    const isFetchAction = action.startsWith('fetch-');
    const isCreateAction = action.startsWith('create-');

    return (
      <div className="space-y-4">
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
          <h5 className="text-sm font-medium text-orange-800 mb-1">
            {action.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </h5>
          <p className="text-xs text-orange-600">
            {isFetchAction && 'This will retrieve data from HubSpot based on your filters and properties.'}
            {isCreateAction && 'This will create a new record in HubSpot with the provided data.'}
          </p>
        </div>

        {isFetchAction && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Properties to Fetch
              </label>
              <input
                type="text"
                value={data.params?.properties || ''}
                onChange={(e) => updateNodeData(id, { properties: e.target.value })}
                placeholder="e.g., firstname,lastname,email,company"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">Comma-separated list of properties to retrieve</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filters (JSON)
              </label>
              <textarea
                value={data.params?.filters || ''}
                onChange={(e) => updateNodeData(id, { filters: e.target.value })}
                placeholder='{"propertyName": "email", "operator": "EQ", "value": "example@email.com"}'
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                rows={3}
              />
              <p className="text-xs text-gray-500 mt-1">HubSpot filter criteria in JSON format</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Limit
              </label>
              <input
                type="number"
                value={data.params?.limit || 100}
                onChange={(e) => updateNodeData(id, { limit: parseInt(e.target.value) || 100 })}
                min="1"
                max="1000"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">Maximum number of records to fetch (1-1000)</p>
            </div>
          </>
        )}

        {isCreateAction && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Object Data (JSON)
              </label>
              <textarea
                value={data.params?.properties || ''}
                onChange={(e) => updateNodeData(id, { properties: e.target.value })}
                placeholder='{"firstname": "John", "lastname": "Doe", "email": "john@example.com"}'
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                rows={6}
              />
              <p className="text-xs text-gray-500 mt-1">Object properties in JSON format</p>
            </div>

            {action.includes('note') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Associated Object ID
                </label>
                <input
                  type="text"
                  value={data.params?.objectId || ''}
                  onChange={(e) => updateNodeData(id, { objectId: e.target.value })}
                  placeholder="Contact, Company, or Deal ID"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">ID of the object to associate this note with</p>
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden ${
      selected ? 'ring-2 ring-orange-500' : 'border border-gray-200'
    }`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-600 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-medium text-white">HubSpot</h3>
              <p className="text-xs text-orange-50/80">{data.params?.nodeName || 'hubspot_1'}</p>
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
            <h4 className="text-sm font-medium text-gray-700 mb-3">Select an action</h4>
            <div className="max-h-80 overflow-y-auto space-y-3 pr-2">
              {actionCategories.map((category) => (
                <div key={category.title} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <category.icon className="w-4 h-4 text-gray-600" />
                    <h5 className="text-sm font-medium text-gray-700">{category.title}</h5>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {category.actions.map((action) => (
                      <button
                        key={action.id}
                        onClick={() => handleActionChange(action.id)}
                        className={`w-full flex items-center justify-between px-3 py-2 border rounded-lg hover:bg-gray-50 transition-colors ${getActionTypeColor(action.type)}`}
                      >
                        <span className="text-sm font-medium">{action.label}</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {actualCurrentStep === 2 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Connect your HubSpot account</h4>
            <p className="text-xs text-gray-500 mb-3">
              Connect your HubSpot account to access your CRM data and perform actions.
            </p>
            
            <button
              onClick={connectToHubSpot}
              disabled={isLoading}
              className="w-full px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:bg-orange-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Connecting...</span>
                </>
              ) : (
                <span>Connect with HubSpot</span>
              )}
            </button>
            
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mt-3">
              <h5 className="text-sm font-medium text-orange-800 mb-1">What you can do with HubSpot:</h5>
              <ul className="text-xs text-orange-600 space-y-1">
                <li>• Fetch and create contacts, companies, and deals</li>
                <li>• Manage tickets, notes, and tasks</li>
                <li>• Track calls, meetings, and emails</li>
                <li>• Access comprehensive CRM data</li>
              </ul>
            </div>
          </div>
        )}

        {actualCurrentStep === 3 && renderActionConfiguration()}
      </div>

      {/* Handles */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 -ml-0.5 bg-orange-500 border-2 border-white rounded-full"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 -mr-0.5 bg-orange-500 border-2 border-white rounded-full"
      />
    </div>
  );
};

export default HubSpotNode;

// Named export for compatibility
export { HubSpotNode }; 