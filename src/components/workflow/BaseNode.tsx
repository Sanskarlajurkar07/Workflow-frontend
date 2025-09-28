import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Trash2, Maximize2, Settings } from 'lucide-react';
import { useFlowStore } from '../../store/flowStore';
import RenderNodeContent from './types/RenderNodeContent';

interface BaseNodeProps extends NodeProps {
  icon?: React.ReactNode;
  inputs?: string[];
  outputs?: string[];
}

const handleStyle = {
  width: '15px',
  height: '15px',
  backgroundColor: '#3B82F6',
  border: '3px solid white',
  boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.5)',
  zIndex: 100,
};

export default memo(({ id, data, selected, icon, inputs = [], outputs = [] }: BaseNodeProps) => {
  const removeNode = useFlowStore((state) => state.removeNode);
  const updateNodeData = useFlowStore((state) => state.updateNodeData);

  const renderInputHandles = () => {
    if (inputs.length === 0) {
      return (
        <Handle
          type="target"
          position={Position.Left}
          style={handleStyle}
        />
      );
    }

    return inputs.map((input, index) => (
      <Handle
        key={`${id}-input-${index}`}
        type="target"
        position={Position.Left}
        id={input}
        style={{
          ...handleStyle,
          top: `${(index + 1) * (100 / (inputs.length + 1))}%`,
        }}
      />
    ));
  };

  const renderOutputHandles = () => {
    if (outputs.length === 0) {
      return (
        <Handle
          type="source"
          position={Position.Right}
          style={handleStyle}
        />
      );
    }

    return outputs.map((output, index) => (
      <Handle
        key={`${id}-output-${index}`}
        type="source"
        position={Position.Right}
        id={output}
        style={{
          ...handleStyle,
          top: `${(index + 1) * (100 / (outputs.length + 1))}%`,
        }}
      />
    ));
  };

  return (
    <div className={`relative bg-white rounded-xl shadow-xl overflow-hidden ${selected ? 'ring-2 ring-blue-500' : ''}`}>
      {/* Header */}
      <div className="relative flex items-center justify-between px-4 py-3 bg-gradient-to-r from-slate-700 to-slate-600 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_107%,rgba(255,255,255,0.2)_0%,rgba(255,255,255,0.1)_5%,rgba(255,255,255,0)_45%)]"></div>
        <div className="flex items-center space-x-3 relative z-10">
          <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-inner">
            {icon}
          </div>
          <div className="text-sm font-medium text-white">{data.label}</div>
        </div>
        <div className="flex items-center space-x-1 relative z-10">
          <button
            onClick={() => updateNodeData(id, { showSettings: !data.params?.showSettings })}
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/20 transition-colors"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button
            onClick={() => removeNode(id)}
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-red-400/30 transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 bg-gradient-to-b from-white to-slate-50/50">
        <div className={`rounded-lg p-3 ${selected ? 'bg-slate-700/70' : 'bg-slate-700/50'}`}>
          <RenderNodeContent
            type={data.type}
            data={data}
            id={id}
            updateNodeData={updateNodeData}
            removeNode={removeNode}
          />
        </div>
      </div>

      {renderInputHandles()}
      {renderOutputHandles()}
    </div>
  );
});