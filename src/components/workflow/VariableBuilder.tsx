import React, { useState } from 'react';
import { useFlowStore } from '../../store/flowStore';
import { AlertCircle, ArrowRight, Type, Image as ImageIcon, FileAudio, Upload, FileJson } from 'lucide-react';

interface VariableBuilderProps {
  onSelect: (variable: string) => void;
  nodeId: string;
  position: { x: number, y: number };
  inputType?: string;
}

export const VariableBuilder: React.FC<VariableBuilderProps> = ({ 
  onSelect, 
  nodeId,
  position,
  inputType = 'Text'
}) => {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const { nodes, edges } = useFlowStore();

  // Get connected input nodes
  const inputNodes = React.useMemo(() => {
    return nodes.filter(node => 
      node.type === 'input' && 
      node.id !== nodeId
    );
  }, [nodes, nodeId]);

  // Get output field based on input type
  const getOutputField = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'text':
        return 'text';
      case 'image':
        return 'image';
      case 'audio':
        return 'audio';
      case 'file':
        return 'file';
      case 'json':
        return 'json';
      default:
        return 'text';
    }
  };

  // Get icon based on type
  const getTypeIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'text':
        return <Type className="w-4 h-4 text-blue-500" />;
      case 'image':
        return <ImageIcon className="w-4 h-4 text-purple-500" />;
      case 'audio':
        return <FileAudio className="w-4 h-4 text-green-500" />;
      case 'file':
        return <Upload className="w-4 h-4 text-yellow-500" />;
      case 'json':
        return <FileJson className="w-4 h-4 text-orange-500" />;
      default:
        return <Type className="w-4 h-4 text-gray-500" />;
    }
  };

  const handleSelectNode = (node: any) => {
    const nodeName = node.data.params?.nodeName || node.id;
    const nodeType = node.data.params?.type || 'Text';
    const outputField = getOutputField(nodeType);
    onSelect(`${nodeName}.${outputField}`);
  };

  return (
    <div 
      className="absolute z-50 bg-white border border-gray-200 rounded-md shadow-lg p-4 w-72"
      style={{ left: position.x, top: position.y }}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-900">Select Input Node</h3>
      </div>

      {inputNodes.length > 0 ? (
        <div className="space-y-2">
          {inputNodes.map((node) => {
            const nodeType = node.data.params?.type || 'Text';
            const outputField = getOutputField(nodeType);
            return (
              <button
                key={node.id}
                onClick={() => handleSelectNode(node)}
                className="w-full text-left p-3 rounded hover:bg-gray-50 border border-gray-100"
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center space-x-2">
                    {getTypeIcon(nodeType)}
                    <span className="text-sm font-medium text-gray-700">
                      {node.data.params?.nodeName || node.id}
                    </span>
                  </div>
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">
                    {nodeType}
                  </span>
                </div>
                <code className="text-xs text-blue-600 block mt-1">
                  {`{{${node.data.params?.nodeName || node.id}.${outputField}}}`}
                </code>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="p-3 bg-yellow-50 rounded-md">
          <div className="flex items-start">
            <AlertCircle className="w-4 h-4 text-yellow-500 mt-0.5 mr-2" />
            <p className="text-sm text-yellow-700">
              No input nodes available. Add input nodes to use their outputs.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};