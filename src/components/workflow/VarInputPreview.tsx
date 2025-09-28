import React, { useState, useEffect } from 'react';
import { useFlowStore } from '../../store/flowStore';
import { useTheme } from '../../utils/themeProvider';
import { Lightbulb, X } from 'lucide-react';

interface VarInputPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  workflowId?: string;
}

interface ConnectionInfo {
  sourceNodeId: string;
  sourceNodeName: string;
  sourceNodeType: string;
  targetNodeId: string;
  targetNodeName: string;
  targetNodeType: string;
  variablePath: string;
}

export const VarInputPreview: React.FC<VarInputPreviewProps> = ({
  isOpen,
  onClose,
  workflowId
}) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const [connections, setConnections] = useState<ConnectionInfo[]>([]);
  
  const { nodes, edges } = useFlowStore();
  
  // Get all connections in the workflow
  useEffect(() => {
    if (!isOpen) return;
    
    const connectionInfo: ConnectionInfo[] = [];
    
    edges.forEach(edge => {
      const sourceNode = nodes.find(n => n.id === edge.source);
      const targetNode = nodes.find(n => n.id === edge.target);
      
      if (sourceNode && targetNode) {
        // Get node names (or IDs if names are not available)
        const sourceNodeName = sourceNode.data?.params?.nodeName || sourceNode.id;
        const targetNodeName = targetNode.data?.params?.nodeName || targetNode.id;
        
        // Determine source node output fields
        let outputFields = ['output'];
        
        if (sourceNode.type === 'input') {
          outputFields = ['text'];
        } else if (sourceNode.type.includes('openai') || sourceNode.type.includes('anthropic') || sourceNode.type.includes('gemini')) {
          outputFields = ['response', 'full_response'];
        } else if (sourceNode.type === 'transform') {
          outputFields = ['output', 'transformed_text'];
        }
        
        // Override with custom output fields if provided
        if (sourceNode.data?.outputFields) {
          outputFields = sourceNode.data.outputFields;
        }
        
        // Create a connection info for each possible variable path
        outputFields.forEach(field => {
          connectionInfo.push({
            sourceNodeId: sourceNode.id,
            sourceNodeName,
            sourceNodeType: sourceNode.type,
            targetNodeId: targetNode.id,
            targetNodeName,
            targetNodeType: targetNode.type,
            variablePath: `{{ ${sourceNodeName}.${field} }}`
          });
        });
      }
    });
    
    setConnections(connectionInfo);
  }, [isOpen, nodes, edges]);
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div 
        className={`w-full max-w-4xl ${isLight ? 'bg-white' : 'bg-slate-900'} rounded-lg shadow-lg p-6 max-h-[90vh] overflow-hidden flex flex-col`}
      >
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <Lightbulb className={`h-5 w-5 mr-2 ${isLight ? 'text-amber-500' : 'text-amber-400'}`} />
            <h2 className={`text-xl font-semibold ${isLight ? 'text-gray-800' : 'text-white'}`}>
              Variable Connections
            </h2>
          </div>
          <button 
            onClick={onClose}
            className={`p-1.5 rounded-lg ${isLight ? 'hover:bg-gray-100' : 'hover:bg-slate-800'}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className={`mb-4 p-4 rounded-lg ${
          isLight ? 'bg-amber-50 border border-amber-100' : 'bg-amber-900/20 border border-amber-800/30'
        }`}>
          <p className={`text-sm ${isLight ? 'text-amber-800' : 'text-amber-300'}`}>
            This preview shows all possible variables you can use in your workflow. 
            When connecting nodes, you can reference the output of one node in another node using these variables.
          </p>
        </div>
        
        <div className="overflow-y-auto flex-1">
          {connections.length > 0 ? (
            <table className={`w-full ${isLight ? 'text-gray-800' : 'text-gray-200'}`}>
              <thead className={`${isLight ? 'bg-gray-100' : 'bg-slate-800'}`}>
                <tr>
                  <th className="py-2 px-4 text-left text-sm font-medium">From</th>
                  <th className="py-2 px-4 text-left text-sm font-medium">To</th>
                  <th className="py-2 px-4 text-left text-sm font-medium">Variable to Use</th>
                  <th className="py-2 px-4 text-left text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {connections.map((connection, index) => (
                  <tr 
                    key={`${connection.sourceNodeId}-${connection.targetNodeId}-${index}`}
                    className={`border-t ${isLight ? 'border-gray-200' : 'border-slate-700'} ${
                      index % 2 === 0 
                        ? (isLight ? 'bg-white' : 'bg-slate-900') 
                        : (isLight ? 'bg-gray-50' : 'bg-slate-800/30')
                    }`}
                  >
                    <td className="py-3 px-4">
                      <div className="font-medium">{connection.sourceNodeName}</div>
                      <div className={`text-xs ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
                        {connection.sourceNodeType}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium">{connection.targetNodeName}</div>
                      <div className={`text-xs ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
                        {connection.targetNodeType}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <code className={`px-2 py-1 rounded ${
                        isLight 
                          ? 'bg-blue-50 text-blue-800 border border-blue-100' 
                          : 'bg-blue-900/20 text-blue-300 border border-blue-800/30'
                      }`}>
                        {connection.variablePath}
                      </code>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => navigator.clipboard.writeText(connection.variablePath)}
                        className={`text-xs px-2 py-1 rounded ${
                          isLight 
                            ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                            : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                        }`}
                      >
                        Copy
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className={`text-center py-8 ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
              <div className="text-lg mb-2">No connections found</div>
              <p>Connect nodes in your workflow to see available variables</p>
            </div>
          )}
        </div>
        
        <div className="flex justify-end mt-4 pt-3 border-t border-gray-200">
          <button
            onClick={onClose}
            className={`px-4 py-2 ${
              isLight 
                ? 'bg-gray-100 text-gray-800 hover:bg-gray-200' 
                : 'bg-slate-800 text-white hover:bg-slate-700'
            } rounded-lg`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default VarInputPreview; 