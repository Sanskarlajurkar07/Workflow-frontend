import React from 'react';
import { NodeType } from '../../../types/flow';

interface RenderNodeContentProps {
  type: NodeType;
  data: any;
  id: string;
  updateNodeData: (id: string, params: any) => void;
  removeNode: (id: string) => void;
}

const RenderNodeContent: React.FC<RenderNodeContentProps> = ({ type, data, id, updateNodeData, removeNode }) => {
  const commonStyles = {
    input: "w-full px-3 py-2 bg-white/10 rounded-md border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50",
    label: "block text-sm font-medium text-white/80 mb-1",
    select: "w-full px-3 py-2 bg-white/10 rounded-md border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50",
    button: "px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-md transition-colors",
    container: "space-y-4",
  };

  const renderContent = () => {
    switch (type) {
      case 'input':
        return (
          <div className={commonStyles.container}>
            <div>
              <label className={commonStyles.label}>Input Name</label>
              <input
                type="text"
                value={data.params?.name || ''}
                onChange={(e) => updateNodeData(id, { name: e.target.value })}
                placeholder="Enter input name"
                className={commonStyles.input}
              />
            </div>
            <div>
              <label className={commonStyles.label}>Description</label>
              <input
                type="text"
                value={data.params?.description || ''}
                onChange={(e) => updateNodeData(id, { description: e.target.value })}
                placeholder="Describe this input"
                className={commonStyles.input}
              />
            </div>
          </div>
        );

      case 'output':
        return (
          <div className={commonStyles.container}>
            <div>
              <label className={commonStyles.label}>Output Name</label>
              <input
                type="text"
                value={data.params?.name || ''}
                onChange={(e) => updateNodeData(id, { name: e.target.value })}
                placeholder="Enter output name"
                className={commonStyles.input}
              />
            </div>
            <div>
              <label className={commonStyles.label}>Description</label>
              <input
                type="text"
                value={data.params?.description || ''}
                onChange={(e) => updateNodeData(id, { description: e.target.value })}
                placeholder="Describe this output"
                className={commonStyles.input}
              />
            </div>
          </div>
        );

      // Add more cases for other node types
      default:
        return (
          <div className="text-white/70 text-sm">
            Configure {type} node settings
          </div>
        );
    }
  };

  return (
    <div className="min-w-[200px]">
      {renderContent()}
    </div>
  );
};

export default RenderNodeContent;