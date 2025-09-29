import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { Settings, Share2, Trash2, Users, Building, Link, Check, X } from 'lucide-react';
import { useFlowStore } from '../../../../store/flowStore';

interface ShareNodeProps {
  id: string;
  data: {
    params?: {
      nodeName?: string;
      objectType?: string;
      objectToShare?: string;
      objectMode?: 'select' | 'variable';
      userIdentifier?: string;
      organizationName?: string;
      showSettings?: boolean;
      isShared?: boolean;
    };
  };
  selected?: boolean;
}

const ShareNode: React.FC<ShareNodeProps> = ({ id, data, selected }) => {
  const [isSharing, setIsSharing] = useState(false);
  // Fix: Get updateNodeData from useFlowStore with correct state selector
  const { removeNode, updateNodeData } = useFlowStore((state) => ({
    removeNode: state.removeNode,
    updateNodeData: state.updateNodeData || state.updateNodeParams // Fallback to updateNodeParams if updateNodeData doesn't exist
  }));

  const handleShare = async () => {
    setIsSharing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      // Update sharing status
      updateNodeData(id, { 
        params: { 
          ...data.params, 
          isShared: true 
        } 
      });
    } catch (error) {
      console.error('Sharing failed:', error);
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div
      className={`bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-200 w-[380px] ${
        selected ? 'ring-2 ring-blue-500 shadow-blue-100' : 'shadow-gray-200/50'
      }`}
    >
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-500 px-4 py-3 relative">
        <div className="absolute inset-0 bg-grid-pattern opacity-10" />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/10 backdrop-blur-sm rounded-lg">
              <Share2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-medium text-white">Share Object</h3>
              <p className="text-xs text-blue-50/80">
                {data.params?.objectType || 'Select type to share'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => updateNodeData(id, { params: { ...data.params, showSettings: !data.params?.showSettings } })}
              className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
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

      {/* Main Content */}
      <div className="p-4 space-y-4">
        {/* Node Name */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Node Name</label>
          <div className="relative">
            <input
              type="text"
              value={data.params?.nodeName || 'share_object_0'}
              onChange={(e) => updateNodeData(id, { params: { ...data.params, nodeName: e.target.value } })}
              className="w-full pl-8 pr-3 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <Link className="w-4 h-4 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Object Type Selection */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Object Type</label>
          <select
            value={data.params?.objectType || ''}
            onChange={(e) => updateNodeData(id, { params: { ...data.params, objectType: e.target.value } })}
            className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select type</option>
            <option value="Knowledge Base">Knowledge Base</option>
            <option value="Pipeline">Pipeline</option>
            <option value="Workflow">Workflow</option>
          </select>
        </div>

        {/* Object Selection with Mode Toggle */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-medium text-gray-500">Object to Share</label>
            <button
              onClick={() => updateNodeData(id, { params: { 
                ...data.params, 
                objectMode: data.params?.objectMode === 'variable' ? 'select' : 'variable' 
              }})}
              className={`px-2 py-1 text-xs rounded-md transition-colors ${
                data.params?.objectMode === 'variable' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {data.params?.objectMode === 'variable' ? 'Variable Mode' : 'Select Mode'}
            </button>
          </div>
          <select
            value={data.params?.objectToShare || ''}
            onChange={(e) => updateNodeData(id, { params: { ...data.params, objectToShare: e.target.value } })}
            className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select object</option>
            <option value="Object 1">Object 1</option>
            <option value="Object 2">Object 2</option>
          </select>
        </div>

        {/* User and Organization Info */}
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">User Identifier *</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Enter user identifier"
                value={data.params?.userIdentifier || ''}
                onChange={(e) => updateNodeData(id, { params: { ...data.params, userIdentifier: e.target.value } })}
                className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Users className="w-4 h-4 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>
            {!data.params?.userIdentifier && (
              <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-red-500" />
                User Identifier is required
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Organization Name</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Enter organization name"
                value={data.params?.organizationName || ''}
                onChange={(e) => updateNodeData(id, { params: { ...data.params, organizationName: e.target.value } })}
                className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Building className="w-4 h-4 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>
        </div>

        {/* Share Button */}
        <button
          onClick={handleShare}
          disabled={isSharing || !data.params?.userIdentifier || !data.params?.objectToShare}
          className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg transition-colors ${
            isSharing || !data.params?.userIdentifier || !data.params?.objectToShare
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
          }`}
        >
          {isSharing ? (
            <>Processing...</>
          ) : data.params?.isShared ? (
            <>
              <Check className="w-4 h-4" />
              Shared Successfully
            </>
          ) : (
            <>
              <Share2 className="w-4 h-4" />
              Share Object
            </>
          )}
        </button>
      </div>

      {/* Status Bar */}
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <span className={`w-2 h-2 rounded-full ${
            data.params?.isShared ? 'bg-green-500' : 
            data.params?.userIdentifier && data.params?.objectToShare ? 'bg-blue-500' : 'bg-gray-300'
          }`} />
          <span>
            {data.params?.isShared ? 'Shared' : 
             data.params?.userIdentifier && data.params?.objectToShare ? 'Ready to share' : 'Configure sharing'}
          </span>
        </div>
      </div>

      {/* Handles */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 -ml-0.5 bg-blue-500 border-2 border-white rounded-full shadow-md transition-transform hover:scale-110"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 -mr-0.5 bg-green-500 border-2 border-white rounded-full shadow-md transition-transform hover:scale-110"
      />
    </div>
  );
};

export default ShareNode;