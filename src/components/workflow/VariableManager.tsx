import React, { useState, useMemo } from 'react';
import { Clipboard, Copy, Search, ChevronDown, ChevronUp, RefreshCw, Check } from 'lucide-react';
import { useTheme } from '../../utils/themeProvider';
import { useFlowStore } from '../../store/flowStore';

interface Variable {
  id: string;
  name: string;
  nodeType: string;
  fields: string[];
  description: string;
}

interface VariableManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VariableManager: React.FC<VariableManagerProps> = ({ isOpen, onClose }) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedVar, setCopiedVar] = useState<string | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    'Inputs': true,
    'AI Models': true,
  });
  
  // Get nodes from flow store
  const nodes = useFlowStore(state => state.nodes);
  
  // Generate variables from nodes
  const variables = useMemo(() => {
    const vars: Variable[] = [];
    
    nodes.forEach(node => {
      // Default fields based on node type
      let fields: string[] = ['output'];
      let description = 'Node output';
      
      // Customize based on node type
      if (node.type === 'input') {
        fields = ['text'];
        description = 'Text input from this node';
      } else if (node.type.includes('openai') || node.type.includes('anthropic') || node.type.includes('gemini')) {
        fields = ['response', 'full_response'];
        description = 'AI model response';
      } else if (node.type === 'transform') {
        fields = ['output', 'transformed_text'];
        description = 'Transformed text output';
      } else if (node.type === 'kb-search') {
        fields = ['results', 'metadata'];
        description = 'Knowledge base search results';
      }
      
      // Use node data for fields if available
      if (node.data?.outputFields) {
        fields = node.data.outputFields;
      }
      
      const nodeId = node.id.includes('_') ? node.id : `${node.type}_${node.id.replace(`${node.type}-`, '')}`;
      
      vars.push({
        id: nodeId,
        name: node.data?.label || nodeId,
        nodeType: node.type,
        fields,
        description: node.data?.description || description
      });
    });
    
    return vars;
  }, [nodes]);
  
  // Group variables by type
  const groupedVariables = useMemo(() => {
    const groups: Record<string, Variable[]> = {};
    
    variables.forEach(variable => {
      let groupName = 'Other';
      
      if (variable.nodeType === 'input') {
        groupName = 'Inputs';
      } else if (['openai', 'anthropic', 'gemini', 'perplexity', 'cohere'].some(type => variable.nodeType.includes(type))) {
        groupName = 'AI Models';
      } else if (['kb-search', 'kb-reader', 'kb-loader'].some(type => variable.nodeType.includes(type))) {
        groupName = 'Knowledge Base';
      } else if (['transform', 'text-processor', 'json-handler'].some(type => variable.nodeType.includes(type))) {
        groupName = 'Text Processing';
      } else if (['file-loader', 'document-to-text', 'csv-loader', 'url-loader'].some(type => variable.nodeType.includes(type))) {
        groupName = 'Data Import';
      }
      
      if (!groups[groupName]) {
        groups[groupName] = [];
      }
      
      groups[groupName].push(variable);
    });
    
    return groups;
  }, [variables]);
  
  // Filter variables based on search
  const filteredGroups = useMemo(() => {
    if (!searchQuery) return groupedVariables;
    
    const filtered: Record<string, Variable[]> = {};
    
    Object.entries(groupedVariables).forEach(([groupName, groupVars]) => {
      const matchedVars = groupVars.filter(variable => 
        variable.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        variable.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        variable.fields.some(field => field.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      
      if (matchedVars.length > 0) {
        filtered[groupName] = matchedVars;
      }
    });
    
    return filtered;
  }, [groupedVariables, searchQuery]);
  
  const toggleGroup = (groupName: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }));
  };
  
  const copyVariableToClipboard = (variableId: string, field: string) => {
    const varText = `{{ ${variableId}.${field} }}`;
    navigator.clipboard.writeText(varText);
    setCopiedVar(`${variableId}.${field}`);
    
    // Clear the copied indicator after 2 seconds
    setTimeout(() => setCopiedVar(null), 2000);
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div 
        className={`w-full max-w-3xl ${isLight ? 'bg-white' : 'bg-slate-900'} rounded-lg shadow-lg p-6 max-h-[90vh] overflow-hidden flex flex-col`}
      >
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <Clipboard className={`h-5 w-5 mr-2 ${isLight ? 'text-blue-600' : 'text-blue-400'}`} />
            <h2 className={`text-xl font-semibold ${isLight ? 'text-gray-800' : 'text-white'}`}>
              Workflow Variables
            </h2>
          </div>
          <button 
            onClick={onClose}
            className={`p-1.5 rounded-lg ${isLight ? 'hover:bg-gray-100' : 'hover:bg-slate-800'}`}
          >
            <span className="sr-only">Close</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="mb-4">
          <div className={`relative ${isLight ? 'bg-gray-50' : 'bg-slate-800'} rounded-lg`}>
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search variables..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full py-2 pl-10 pr-4 rounded-lg ${
                isLight 
                  ? 'bg-gray-50 text-gray-800 placeholder-gray-400' 
                  : 'bg-slate-800 text-white placeholder-gray-400'
              } border ${isLight ? 'border-gray-200' : 'border-slate-700'}`}
            />
          </div>
        </div>
        
        <div className="overflow-y-auto flex-1">
          {Object.keys(filteredGroups).length > 0 ? (
            Object.entries(filteredGroups).map(([groupName, groupVars]) => (
              <div key={groupName} className={`mb-4 rounded-lg border ${
                isLight ? 'border-gray-200' : 'border-slate-700'
              }`}>
                <button
                  onClick={() => toggleGroup(groupName)}
                  className={`w-full px-4 py-2 flex justify-between items-center ${
                    isLight 
                      ? 'bg-gray-50 hover:bg-gray-100'
                      : 'bg-slate-800 hover:bg-slate-700'
                  } rounded-t-lg`}
                >
                  <span className="font-medium">{groupName} ({groupVars.length})</span>
                  {expandedGroups[groupName] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                
                {expandedGroups[groupName] && (
                  <div className={`p-3 ${isLight ? 'bg-white' : 'bg-slate-900'} rounded-b-lg`}>
                    {groupVars.map(variable => (
                      <div 
                        key={variable.id} 
                        className={`mb-3 p-3 rounded-lg ${
                          isLight ? 'bg-gray-50' : 'bg-slate-800'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="font-medium">{variable.name}</div>
                            <div className={`text-xs ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
                              {variable.description}
                            </div>
                          </div>
                          <div className={`text-xs px-2 py-1 rounded ${
                            isLight ? 'bg-blue-50 text-blue-600' : 'bg-blue-900/20 text-blue-400'
                          }`}>
                            {variable.nodeType}
                          </div>
                        </div>
                        
                        <div className="border-t border-b my-2 py-2">
                          {variable.fields.map(field => (
                            <div 
                              key={field} 
                              className={`flex justify-between items-center p-1.5 rounded hover:${
                                isLight ? 'bg-gray-100' : 'bg-slate-700'
                              }`}
                            >
                              <code className="text-sm font-mono">
                                {'{{ '}<span className="font-semibold">{variable.id}</span>{'.'}
                                <span className="font-semibold">{field}</span>{' }}'}
                              </code>
                              <button
                                onClick={() => copyVariableToClipboard(variable.id, field)}
                                className={`p-1 rounded ${
                                  copiedVar === `${variable.id}.${field}`
                                    ? (isLight ? 'text-green-600' : 'text-green-400')
                                    : (isLight ? 'text-gray-400 hover:text-gray-600' : 'text-gray-500 hover:text-gray-300')
                                }`}
                                title="Copy to clipboard"
                              >
                                {copiedVar === `${variable.id}.${field}` ? (
                                  <Check className="h-4 w-4" />
                                ) : (
                                  <Copy className="h-4 w-4" />
                                )}
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className={`text-center py-8 ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
              {searchQuery ? (
                <>
                  <div className="text-lg mb-2">No variables found</div>
                  <p>Try a different search term or clear your search</p>
                </>
              ) : (
                <>
                  <div className="text-lg mb-2">No variables available</div>
                  <p>Add nodes to your workflow to create variables</p>
                </>
              )}
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
            } rounded-lg mr-2`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default VariableManager; 