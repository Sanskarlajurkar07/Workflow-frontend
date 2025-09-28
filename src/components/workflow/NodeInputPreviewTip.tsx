import React from 'react';
import { useTheme } from '../../utils/themeProvider';

interface NodeInputPreviewTipProps {
  sourceNode: {
    id: string;
    type: string;
    data?: {
      label?: string;
      outputFields?: string[];
    };
  } | null;
  isVisible: boolean;
  position: { x: number; y: number } | null;
}

export const NodeInputPreviewTip: React.FC<NodeInputPreviewTipProps> = ({
  sourceNode,
  isVisible,
  position,
}) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  if (!isVisible || !position || !sourceNode) return null;

  const nodeType = sourceNode.type;
  const nodeId = sourceNode.id.includes('_') 
    ? sourceNode.id 
    : `${nodeType}_${sourceNode.id.replace(`${nodeType}-`, '')}`;
  
  // Default output fields based on node type
  let outputFields = ['output'];
  if (nodeType === 'input') outputFields = ['text'];
  if (nodeType.includes('openai') || nodeType.includes('anthropic') || nodeType.includes('gemini')) {
    outputFields = ['response', 'full_response'];
  }
  
  // Use custom output fields if provided in node data
  if (sourceNode.data?.outputFields) {
    outputFields = sourceNode.data.outputFields;
  }

  const variableExamples = outputFields.map(field => (
    <div 
      key={field}
      className={`mb-2 last:mb-0 ${isLight ? 'border border-blue-100' : 'border border-blue-800'} rounded px-2 py-1`}
      onClick={() => {
        // Copy to clipboard when clicked
        navigator.clipboard.writeText(`{{ ${nodeId}.${field} }}`);
      }}
    >
      <code className="text-sm">
        {'{{ '}<span className="font-semibold">{nodeId}</span>{'.'}
        <span className="font-semibold">{field}</span>{' }}'}
      </code>
    </div>
  ));

  return (
    <div
      className={`absolute z-50 ${isLight ? 'bg-white' : 'bg-slate-800'} p-3 rounded-lg shadow-lg border ${
        isLight ? 'border-blue-200' : 'border-blue-700'
      }`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        maxWidth: '280px',
      }}
    >
      <div className={`text-sm font-medium mb-2 ${isLight ? 'text-blue-600' : 'text-blue-400'}`}>
        Reference this node's output:
      </div>
      <div className="mb-2">
        {variableExamples}
      </div>
      <div className={`text-xs ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
        Click to copy to clipboard
      </div>
    </div>
  );
};

export default NodeInputPreviewTip; 