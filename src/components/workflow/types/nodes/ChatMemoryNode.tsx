import React, { useEffect, useState } from 'react';
import { Handle, Position } from 'reactflow';
import { Trash2, Settings, MessageCircle, ChevronDown, Brain, Copy, Plus } from 'lucide-react';
import { useFlowStore } from '../../../../store/flowStore'; // Add this import
import { VariableBuilder } from '../../VariableBuilder';

interface ChatMemoryNodeProps {
  data: {
    params?: {
      nodeName?: string;
      showSettings?: boolean;
      memoryType?: string;
      memorySize?: number;
    };
  };
  id: string;
  selected?: boolean;
  updateNodeData: (id: string, params: any) => void;
}

const ChatMemoryNode: React.FC<ChatMemoryNodeProps> = ({ 
  data, 
  id, 
  selected,
  updateNodeData 
}) => {
  // State for variable builder
  const [showVariableBuilder, setShowVariableBuilder] = useState(false);
  const [variableBuilderPosition, setVariableBuilderPosition] = useState({ x: 0, y: 0 });
  const [activeField, setActiveField] = useState<string | null>(null);

  // Get removeNode from useFlowStore
  const removeNode = useFlowStore((state) => state.removeNode);

  // Set default node name on first render
  useEffect(() => {
    if (!data.params?.nodeName) {
      const defaultName = `chat_memory_${id.split('-')[1] || '0'}`;
      updateNodeData(id, { nodeName: defaultName });
    }
  }, [id, data.params?.nodeName, updateNodeData]);

  // Add handleDelete function
  const handleDelete = () => {
    removeNode(id);
  };

  // Copy node name to clipboard for variable use
  const handleCopyNodeName = () => {
    if (data.params?.nodeName) {
      navigator.clipboard.writeText(data.params.nodeName);
    }
  };

  // Show variable builder
  const handleVariableButtonClick = (field: string, e: React.MouseEvent) => {
    setActiveField(field);
    const buttonRect = (e.target as HTMLElement).getBoundingClientRect();
    setVariableBuilderPosition({
      x: buttonRect.left + window.scrollX,
      y: buttonRect.bottom + window.scrollY
    });
    setShowVariableBuilder(true);
  };

  // Insert variable into field
  const handleVariableSelect = (variablePath: string) => {
    setShowVariableBuilder(false);
    if (!activeField) return;
    
    // Get current field value
    const currentValue = data.params?.[activeField as keyof typeof data.params] || '';
    // Add the variable with the double braces syntax
    const newValue = `${currentValue}{{${variablePath}}}`;
    updateNodeData(id, { [activeField]: newValue });
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg overflow-hidden ${
      selected ? 'ring-2 ring-blue-500' : 'border border-gray-200'
    }`}>
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-500 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-medium text-white">Chat Memory</h3>
              <p className="text-xs text-blue-50/80">{data.params?.memoryType || 'Token Buffer'}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopyNodeName}
              className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/20 transition-colors"
              title="Copy Node ID for Variable"
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
              onClick={handleDelete}
              className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-red-400/20 transition-colors"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Settings Panel */}
      {data.params?.showSettings && (
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Node Name</label>
              <input
                type="text"
                value={data.params?.nodeName || `chat_memory_${id.split('-')[1] || '0'}`}
                onChange={(e) => updateNodeData(id, { nodeName: e.target.value })}
                className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="p-4 space-y-4">
        {/* Info Box */}
        <div className="bg-blue-50 rounded-md p-3">
          <p className="text-xs text-blue-600">
            Stores and manages conversation history for contextual chat responses.
          </p>
        </div>

        {/* Memory Type Selection */}
        <div className="space-y-2">
          <label className="block text-xs font-medium text-gray-500">Memory Type</label>
          <div className="relative">
            <select
              value={data.params?.memoryType || 'Token Buffer'}
              onChange={(e) => updateNodeData(id, { memoryType: e.target.value })}
              className="w-full appearance-none px-3 py-2 bg-white text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
            >
              <option value="Token Buffer">Token Buffer</option>
              <option value="Full">Full</option>
              <option value="Formatted-Full-Raw">Formatted-Full-Raw</option>
              <option value="Message Buffer">Message Buffer</option>
              <option value="Vector Database">Vector Database</option>
            </select>
            <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Memory Size Slider */}
        <div className="space-y-2">
          <label className="block text-xs font-medium text-gray-500">Memory Size</label>
          <input
            type="range"
            min="1"
            max="100"
            value={data.params?.memorySize || 50}
            onChange={(e) => updateNodeData(id, { memorySize: parseInt(e.target.value) })}
            className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>Small</span>
            <span>{data.params?.memorySize || 50}%</span>
            <span>Large</span>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-green-500" />
          <span>Active</span>
        </span>
        <span>{data.params?.nodeName || `chat_memory_${id.split('-')[1] || '0'}`}</span>
      </div>

      {/* Variable Builder */}
      {showVariableBuilder && (
        <VariableBuilder
          onSelect={handleVariableSelect}
          nodeId={id}
          position={variableBuilderPosition}
        />
      )}

      {/* Handles */}
      
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 -mr-0.5 bg-green-500 border-2 border-white rounded-full"
      />
    </div>
  );
};

export default ChatMemoryNode;