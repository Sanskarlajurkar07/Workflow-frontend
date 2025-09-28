import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useFlowStore } from '../../store/flowStore';
import { AlertCircle, ArrowRight, CheckCircle, Search, Type, Hash, Calendar, FileText, Brain, Database } from 'lucide-react';

interface Variable {
  nodeId: string;
  nodeName: string;
  field: string;
  type: string;
  description: string;
  category: string;
}

interface EnhancedVariableBuilderProps {
  onSelect: (variable: string) => void;
  nodeId: string;
  position: { x: number, y: number };
  inputType?: string;
  onClose: () => void;
  searchTerm?: string;
}

export const EnhancedVariableBuilder: React.FC<EnhancedVariableBuilderProps> = ({ 
  onSelect, 
  nodeId,
  position,
  inputType = 'Text',
  onClose,
  searchTerm = ''
}) => {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [step, setStep] = useState<1 | 2>(1);
  const [search, setSearch] = useState(searchTerm);
  const { nodes, edges } = useFlowStore();
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus search input when component mounts
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  // Get connected nodes (upstream nodes that feed into this node)
  const connectedNodes = React.useMemo(() => {
    const upstreamNodeIds = edges
      .filter(edge => edge.target === nodeId)
      .map(edge => edge.source);
    
    return nodes.filter(node => upstreamNodeIds.includes(node.id));
  }, [edges, nodeId, nodes]);

  // Get all available variables with enhanced metadata
  const availableVariables = React.useMemo(() => {
    const variables: Variable[] = [];
    
    // Use connected nodes if available, otherwise all nodes except current
    const sourceNodes = connectedNodes.length > 0 ? connectedNodes : nodes.filter(n => n.id !== nodeId);
    
    sourceNodes.forEach(node => {
      const nodeName = node.data?.params?.nodeName || node.id;
      const nodeType = node.type || 'unknown';
      
      // Define output fields based on node type
      let outputFields: Array<{field: string, type: string, description: string}> = [];
      
      switch (nodeType.toLowerCase()) {
        case 'input':
          outputFields = [
            { field: 'output', type: 'Text', description: 'The input value provided by the user' },
            { field: 'text', type: 'Text', description: 'Alternative access to input text' },
            { field: 'value', type: 'Text', description: 'Generic value accessor' }
          ];
          break;
          
        case 'openai':
        case 'anthropic':
        case 'gemini':
        case 'cohere':
        case 'claude':
          outputFields = [
            { field: 'response', type: 'Text', description: 'The AI model\'s response text' },
            { field: 'output', type: 'Text', description: 'Primary output from the AI model' },
            { field: 'content', type: 'Text', description: 'Response content' },
            { field: 'model', type: 'Text', description: 'The AI model used' },
            { field: 'prompt_tokens', type: 'Number', description: 'Number of tokens in the prompt' },
            { field: 'completion_tokens', type: 'Number', description: 'Number of tokens in the response' }
          ];
          break;
          
        case 'transform':
        case 'text-processor':
          outputFields = [
            { field: 'output', type: 'Text', description: 'Transformed text output' },
            { field: 'processed_text', type: 'Text', description: 'The processed text result' },
            { field: 'metadata', type: 'Object', description: 'Processing metadata' }
          ];
          break;
          
        case 'kb-search':
        case 'knowledge-base':
          outputFields = [
            { field: 'results', type: 'Array', description: 'Search results from knowledge base' },
            { field: 'documents', type: 'Array', description: 'Retrieved documents' },
            { field: 'metadata', type: 'Object', description: 'Search metadata' },
            { field: 'summary', type: 'Text', description: 'Summary of search results' }
          ];
          break;
          
        case 'api-loader':
        case 'http-request':
          outputFields = [
            { field: 'response_data', type: 'Object', description: 'API response data' },
            { field: 'status_code', type: 'Number', description: 'HTTP status code' },
            { field: 'headers', type: 'Object', description: 'Response headers' },
            { field: 'error', type: 'Text', description: 'Error message if any' }
          ];
          break;
          
        case 'json-handler':
          outputFields = [
            { field: 'json_object', type: 'Object', description: 'Parsed JSON object' },
            { field: 'output', type: 'Object', description: 'JSON data output' },
            { field: 'error', type: 'Text', description: 'Parsing error if any' }
          ];
          break;
          
        case 'condition':
          outputFields = [
            { field: 'condition_met', type: 'Boolean', description: 'Whether condition was met' },
            { field: 'output_true', type: 'Any', description: 'Output when condition is true' },
            { field: 'output_false', type: 'Any', description: 'Output when condition is false' }
          ];
          break;
          
        case 'output':
          outputFields = [
            { field: 'output', type: 'Text', description: 'Final output value' },
            { field: 'value', type: 'Text', description: 'Display value' }
          ];
          break;
          
        default:
          outputFields = [
            { field: 'output', type: 'Text', description: 'Primary output from this node' },
            { field: 'result', type: 'Any', description: 'Generic result value' },
            { field: 'data', type: 'Any', description: 'Node data output' }
          ];
      }
      
      // Determine category for grouping
      let category = 'Other';
      if (nodeType === 'input') category = 'Inputs';
      else if (['openai', 'anthropic', 'gemini', 'cohere', 'claude'].some(ai => nodeType.includes(ai))) category = 'AI Models';
      else if (nodeType.includes('kb') || nodeType.includes('knowledge')) category = 'Knowledge Base';
      else if (nodeType.includes('transform') || nodeType.includes('process')) category = 'Processing';
      else if (nodeType.includes('api') || nodeType.includes('http')) category = 'Data Sources';
      
      outputFields.forEach(({ field, type, description }) => {
        variables.push({
          nodeId: node.id,
          nodeName,
          field,
          type,
          description,
          category
        });
      });
    });
    
    return variables;
  }, [connectedNodes, nodes, nodeId]);

  // Filter variables based on search term
  const filteredVariables = React.useMemo(() => {
    if (!search.trim()) return availableVariables;
    
    const searchLower = search.toLowerCase();
    return availableVariables.filter(variable => 
      variable.nodeName.toLowerCase().includes(searchLower) ||
      variable.field.toLowerCase().includes(searchLower) ||
      variable.description.toLowerCase().includes(searchLower) ||
      variable.type.toLowerCase().includes(searchLower)
    );
  }, [availableVariables, search]);

  // Group variables by category
  const groupedVariables = React.useMemo(() => {
    const groups: Record<string, Variable[]> = {};
    filteredVariables.forEach(variable => {
      if (!groups[variable.category]) {
        groups[variable.category] = [];
      }
      groups[variable.category].push(variable);
    });
    return groups;
  }, [filteredVariables]);

  // Handle variable selection
  const handleSelectVariable = useCallback((variable: Variable) => {
    const variableString = `${variable.nodeName}.${variable.field}`;
    onSelect(variableString);
    onClose();
  }, [onSelect, onClose]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  // Get icon for variable type
  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'text': case 'string': return <Type className="w-4 h-4" />;
      case 'number': case 'integer': return <Hash className="w-4 h-4" />;
      case 'boolean': return <CheckCircle className="w-4 h-4" />;
      case 'array': return <Database className="w-4 h-4" />;
      case 'object': return <FileText className="w-4 h-4" />;
      case 'date': return <Calendar className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  // Get color for variable category
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Inputs': return 'text-green-600 bg-green-50 border-green-200';
      case 'AI Models': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'Knowledge Base': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'Processing': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'Data Sources': return 'text-cyan-600 bg-cyan-50 border-cyan-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div 
      className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-xl max-h-80 w-96 overflow-hidden"
      style={{ 
        left: Math.min(position.x, window.innerWidth - 400), 
        top: Math.min(position.y, window.innerHeight - 350),
        animation: 'fadeIn 0.15s ease-out'
      }}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>

      {/* Header */}
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-gray-900 flex items-center">
            <Brain className="w-4 h-4 mr-2 text-blue-500" />
            Insert Variable
          </h3>
          <span className="text-xs text-gray-500">
            {filteredVariables.length} available
          </span>
        </div>
        
        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            ref={searchInputRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search variables..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* No connected nodes warning */}
      {connectedNodes.length === 0 && (
        <div className="px-4 py-3 bg-yellow-50 border-b border-yellow-200">
          <div className="flex items-start">
            <AlertCircle className="w-4 h-4 text-yellow-500 mt-0.5 mr-2 flex-shrink-0" />
            <div className="text-xs text-yellow-700">
              <p className="font-medium">No connected nodes</p>
              <p>Connect input nodes to this node to access their variables</p>
            </div>
          </div>
        </div>
      )}

      {/* Variables list */}
      <div className="max-h-64 overflow-y-auto">
        {Object.keys(groupedVariables).length === 0 ? (
          <div className="px-4 py-6 text-center text-gray-500">
            <FileText className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No variables found</p>
            <p className="text-xs text-gray-400">Try connecting some nodes first</p>
          </div>
        ) : (
          Object.entries(groupedVariables).map(([category, variables]) => (
            <div key={category} className="border-b border-gray-100 last:border-b-0">
              {/* Category header */}
              <div className={`px-3 py-2 text-xs font-medium border-l-4 ${getCategoryColor(category)}`}>
                {category}
              </div>
              
              {/* Variables in category */}
              <div className="space-y-1 p-2">
                {variables.map((variable, index) => (
                  <button
                    key={`${variable.nodeId}-${variable.field}`}
                    onClick={() => handleSelectVariable(variable)}
                    className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-blue-50 focus:bg-blue-50 focus:outline-none transition-colors group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 flex-1 min-w-0">
                        <div className="flex-shrink-0 text-gray-400">
                          {getTypeIcon(variable.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-1">
                            <span className="font-mono text-xs text-blue-600 truncate">
                              {variable.nodeName}
                            </span>
                            <span className="text-gray-400">.</span>
                            <span className="font-mono text-xs text-green-600 truncate">
                              {variable.field}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 truncate">
                            {variable.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1 flex-shrink-0 ml-2">
                        <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">
                          {variable.type}
                        </span>
                        <ArrowRight className="w-3 h-3 text-gray-400 group-hover:text-blue-500 transition-colors" />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer with help */}
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          💡 Variables format: <code className="font-mono">{"{nodeName.field}"}</code>
        </p>
      </div>
    </div>
  );
}; 