import React, { useState, useEffect } from 'react';
import { Handle, Position } from 'reactflow';
import { 
  Settings, Trash2, Copy, BookOpen, Eye, EyeOff, 
  AlertTriangle, MessageSquare, ChevronDown, ChevronUp,
  Zap, Sparkles, HelpCircle, Wand2, Check, X, Plus
} from 'lucide-react';
import { useFlowStore } from '../../../../store/flowStore';
import { VariableHighlighter } from '../../VariableHighlighter';
import { BasicTextInput } from '../../BasicTextInput';
import { Tooltip } from '../../Tooltip';
import { AutocompleteInput } from '../../AutocompleteInput';

// Define specific types for the node data
interface NodeParams {
  nodeName?: string;
  system?: string;
  prompt?: string;
  model?: string;
  apiKey?: string;
  usePersonalKey?: boolean;
  maxTokens?: number;
  temperature?: number;
  showSettings?: boolean;
  variableName?: string;
}

interface NodeData {
  params?: NodeParams;
  provider?: 'openai';
  type?: string;
}

interface OpenAINodeProps {
  id: string;
  data: NodeData;
  selected?: boolean;
}

interface VariableError {
  error: string;
  message: string;
  variable: string;
}

const modelOptions = [
  'gpt-4o',
  'gpt-4-turbo',
  'gpt-4',
  'gpt-3.5-turbo',
  'gpt-3.5-turbo-16k'
] as const;

type ModelOption = typeof modelOptions[number];

// Prompt templates for OpenAI
const PROMPT_TEMPLATES = [
  { 
    name: 'Default Assistant', 
    system: 'You are a helpful assistant.', 
    prompt: 'Please help me with {{task}}.' 
  },
  { 
    name: 'Content Writer', 
    system: 'You are a professional content writer with expertise in creating engaging and informative articles.', 
    prompt: 'Write an article about {{topic}} with the following criteria:\n- Length: {{length}}\n- Target audience: {{audience}}\n- Tone: {{tone}}' 
  },
  { 
    name: 'Code Assistant', 
    system: 'You are an expert programming assistant. Provide clean, efficient, and well-commented code examples.', 
    prompt: 'Write code for {{language}} that accomplishes the following task:\n\n{{task}}' 
  },
  { 
    name: 'Data Analyzer', 
    system: 'You are a data analysis expert who can interpret data and provide insights.', 
    prompt: 'Analyze the following data:\n\n{{data}}\n\nProvide insights and recommendations.' 
  },
  { 
    name: 'Summarizer', 
    system: 'You are an expert at creating concise, informative summaries while preserving key information.', 
    prompt: 'Summarize the following content in {{length}} format:\n\n{{content}}' 
  },
  { 
    name: 'Q&A Assistant', 
    system: 'You are a knowledgeable assistant that provides accurate, detailed answers based on given information.', 
    prompt: 'Based on this information: {{context}}\n\nAnswer the following question: {{question}}' 
  }
];

const OpenAINode: React.FC<OpenAINodeProps> = ({ id, data, selected }) => {
  const [showApiKey, setShowApiKey] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    model: true,
    templates: false,
    system: true,
    prompt: true,
    advanced: false
  });
  const [showTemplates, setShowTemplates] = useState(false);
  
  const removeNode = useFlowStore((state) => state.removeNode);
  const updateNodeData = useFlowStore((state) => state.updateNodeData);
  const { nodes, edges } = useFlowStore();

  // Set default values for new parameters
  useEffect(() => {
    if (!data.params?.temperature && data.params?.temperature !== 0) {
      updateNodeData(id, { temperature: 0.7 });
    }
    if (!data.params?.maxTokens) {
      updateNodeData(id, { maxTokens: 1000 });
    }
    if (!data.params?.nodeName) {
      updateNodeData(id, { nodeName: `openai_${id.split('-')[1] || '0'}` });
    }
    if (!data.params?.variableName) {
      updateNodeData(id, { variableName: 'openai_result' });
    }
  }, [id, data.params, updateNodeData]);

  const handleToggleSettings = () => {
    updateNodeData(id, { showSettings: !data.params?.showSettings });
  };

  const handleCopyNodeId = () => {
    navigator.clipboard.writeText(id);
  };

  const handleDelete = () => {
    removeNode(id);
  };

  const toggleSectionExpand = (section: 'prompt' | 'system' | 'model' | 'advanced' | 'templates') => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const applyTemplate = (template: any) => {
    updateNodeData(id, { 
      system: template.system,
      prompt: template.prompt
    });
    setShowTemplates(false);
  };

  // Get connected nodes for variable context
  const getConnectedNodes = () => {
    return edges
      .filter(edge => edge.target === id)
      .map(edge => edge.source)
      .map(sourceId => nodes.find(node => node.id === sourceId))
      .filter(Boolean);
  };

  // Helper to check for variable errors
  const checkVariableErrors = () => {
    if (!data.params?.prompt) return null;
    
    const nodeNames = nodes.map(node => node.data.params?.nodeName || node.id);
    const regex = /{{([^}]+)}}/g;
    const matches = [...(data.params.prompt.matchAll(regex) || [])];
    
    for (const match of matches) {
      const variable = match[1];
      
      if (!variable.includes('.')) continue;
      
      const [nodeName] = variable.split('.');
      
      if (!nodeNames.includes(nodeName)) {
        return {
          error: 'Invalid variable',
          message: `Node "${nodeName}" doesn't exist in the workflow.`,
          variable
        };
      }
      
      const sourceNode = nodes.find(n => n.data.params?.nodeName === nodeName || n.id === nodeName);
      if (sourceNode) {
        const isConnected = edges.some(edge => 
          edge.source === sourceNode.id && edge.target === id
        );
        
        if (!isConnected) {
          return {
            error: 'Node not connected',
            message: `Node "${nodeName}" is not connected to this node.`,
            variable
          };
        }
      }
    }
    
    return null;
  };

  const variableError = checkVariableErrors();

  // Check for issues with the node configuration
  const getNodeIssues = () => {
    const issues = [];
    
    if (!data.params?.model) {
      issues.push({ type: 'error', message: 'No model selected' });
    }
    
    if (!data.params?.prompt || data.params.prompt.trim() === '') {
      issues.push({ type: 'error', message: 'Prompt is empty' });
    } else if (variableError) {
      issues.push({ type: 'error', message: variableError.message });
    }

    if (data.params?.maxTokens && (data.params.maxTokens < 1 || data.params.maxTokens > 8192)) {
      issues.push({ type: 'warning', message: 'Max tokens should be between 1 and 8192' });
    }

    return issues;
  };

  const nodeIssues = getNodeIssues();
  const hasErrors = nodeIssues.some(issue => issue.type === 'error');

  return (
    <div 
      className={`bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-200 ${
        selected ? 'ring-2 ring-emerald-500' : hasErrors ? 'border-2 border-red-300' : 'border border-gray-200'
      }`}
      data-no-drag="true"
    >
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 !bg-gray-200 border-2 border-white"
      />

      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-4 py-3 transition-colors duration-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-1.5 bg-white/20 backdrop-blur-sm rounded-lg w-10 h-10 flex items-center justify-center transition-transform hover:scale-105">
              <img 
                src="/logos/openai.png"
                alt="OpenAI Logo" 
                className="w-7 h-7 object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "https://openai.com/favicon.ico";
                  target.onerror = () => {
                    target.style.display = 'none';
                    target.nextElementSibling?.classList.remove('hidden');
                  };
                }}
              />
              <Zap className="w-5 h-5 text-white hidden" />
            </div>
            <div>
              <h3 className="font-medium text-white text-base">{data.params?.nodeName || 'OpenAI'}</h3>
              <p className="text-xs text-white/90 font-medium">
                {data.params?.model || 'Select a model to get started'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-1.5">
            <Tooltip content="Configure node settings">
              <button
                onClick={handleToggleSettings}
                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition-all"
              >
                <Settings className="w-4 h-4" />
              </button>
            </Tooltip>
            <Tooltip content="Copy node ID">
              <button
                onClick={handleCopyNodeId}
                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition-all"
              >
                <Copy className="w-4 h-4" />
              </button>
            </Tooltip>
            <Tooltip content="Delete node">
              <button
                onClick={handleDelete}
                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-red-400/30 transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </Tooltip>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 space-y-4">
        {/* Node Issues */}
        {nodeIssues.length > 0 && (
          <div className={`rounded-md p-3 ${hasErrors ? 'bg-red-50/80 border border-red-200' : 'bg-yellow-50/80 border border-yellow-200'} transition-colors duration-200`}>
            <div className="flex items-start">
              <AlertTriangle className={`w-5 h-5 ${hasErrors ? 'text-red-500' : 'text-yellow-500'} mt-0.5 mr-2 flex-shrink-0`} />
              <div>
                <p className={`text-sm font-medium ${hasErrors ? 'text-red-800' : 'text-yellow-800'}`}>
                  {hasErrors ? 'Required Configuration Missing' : 'Configuration Warnings'}
                </p>
                <ul className="mt-1.5 text-xs space-y-1">
                  {nodeIssues.map((issue, index) => (
                    <li key={index} className={`flex items-center ${issue.type === 'error' ? 'text-red-700' : 'text-yellow-700'}`}>
                      <span className="mr-1">•</span> {issue.message}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Tooltip content="Use AI templates">
              <button
                onClick={() => setShowTemplates(true)}
                className={`px-3 py-1.5 text-sm rounded-md flex items-center space-x-1.5 transition-colors
                  ${showTemplates ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                <Wand2 className="w-4 h-4" />
                <span>Templates</span>
              </button>
            </Tooltip>
          </div>
        </div>

        {/* Node Name */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700 flex items-center">
              Node Name
              <Tooltip content="A unique name to identify this node">
                <HelpCircle className="w-4 h-4 ml-1 text-gray-400" />
              </Tooltip>
            </label>
          </div>
          <BasicTextInput
            value={data.params?.nodeName || ''}
            onChange={(value) => updateNodeData(id, { nodeName: value })}
            placeholder="Enter a unique name..."
            className="bg-gray-50 focus:bg-white"
          />
        </div>

        {/* Connected Nodes */}
        {getConnectedNodes().length > 0 && (
          <div className="bg-gray-50/70 border border-gray-200 rounded-md p-3 transition-colors hover:bg-gray-50">
            <h4 className="text-xs font-medium text-gray-700 mb-2 flex items-center">
              <Check className="w-4 h-4 mr-1.5 text-green-500" />
              Connected Input Nodes
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {getConnectedNodes().map((node, index) => (
                <span key={index} className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-md font-medium">
                  {node?.data?.params?.nodeName || node?.id}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Model Selection */}
        <div className="space-y-2">
          <div
            className="flex items-center justify-between cursor-pointer group"
            onClick={() => toggleSectionExpand('model')}
          >
            <label className="block text-sm font-medium text-gray-700 flex items-center">
              <MessageSquare className="w-4 h-4 mr-2 text-emerald-500" />
              <span>Model Selection</span>
            </label>
            <button className="text-gray-400 group-hover:text-gray-600 transition-colors">
              {expandedSections.model ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
          {expandedSections.model && (
            <div className="space-y-3 pt-2">
              <div className="grid grid-cols-2 gap-2">
                {modelOptions.map((model) => (
                  <button
                    key={model}
                    onClick={() => updateNodeData(id, { model })}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-all
                      ${data.params?.model === model 
                        ? 'bg-emerald-100 text-emerald-700 ring-2 ring-emerald-500/20'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                  >
                    {model}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* System Prompt */}
        <div className="space-y-2">
          <div
            className="flex items-center justify-between cursor-pointer group"
            onClick={() => toggleSectionExpand('system')}
          >
            <div className="flex items-center space-x-2">
              <label className="block text-sm font-medium text-gray-700 flex items-center">
                <BookOpen className="w-4 h-4 mr-2 text-emerald-500" />
                <span>System Prompt</span>
                <Tooltip content="Instructions that define how the AI should behave. Type {{ to insert variables.">
                  <HelpCircle className="w-4 h-4 ml-1 text-gray-400" />
                </Tooltip>
              </label>
            </div>
            <button className="text-gray-400 group-hover:text-gray-600 transition-colors">
              {expandedSections.system ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
          {expandedSections.system && (
            <div className="space-y-2 pt-1">
              <AutocompleteInput
                value={data.params?.system || ''}
                onChange={(value) => updateNodeData(id, { system: value })}
                placeholder="Enter system instructions..."
                multiline
                rows={4}
                className="bg-gray-50 focus:bg-white text-sm"
              />
            </div>
          )}
        </div>

        {/* User Prompt */}
        <div className="space-y-2">
          <div
            className="flex items-center justify-between cursor-pointer group"
            onClick={() => toggleSectionExpand('prompt')}
          >
            <div className="flex items-center space-x-2">
              <label className="block text-sm font-medium text-gray-700 flex items-center">
                <MessageSquare className="w-4 h-4 mr-2 text-emerald-500" />
                <span>User Prompt</span>
                <Tooltip content="The main prompt that will be sent to the AI. Type {{ to insert variables from connected nodes.">
                  <HelpCircle className="w-4 h-4 ml-1 text-gray-400" />
                </Tooltip>
              </label>
            </div>
            <button className="text-gray-400 group-hover:text-gray-600 transition-colors">
              {expandedSections.prompt ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
          {expandedSections.prompt && (
            <div className="space-y-2 pt-1">
              <AutocompleteInput
                value={data.params?.prompt || ''}
                onChange={(value) => updateNodeData(id, { prompt: value })}
                placeholder="Enter your prompt here..."
                multiline
                rows={6}
                className="bg-gray-50 focus:bg-white font-mono text-sm"
              />
              {data.params?.prompt && (
                <VariableHighlighter
                  text={data.params.prompt}
                  className="mt-2"
                />
              )}
              {variableError && (
                <p className="text-xs text-red-600 flex items-center mt-1">
                  <AlertTriangle className="w-3.5 h-3.5 mr-1" />
                  {variableError.message}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Advanced Settings */}
        <div className="space-y-2">
          <div
            className="flex items-center justify-between cursor-pointer group"
            onClick={() => toggleSectionExpand('advanced')}
          >
            <label className="block text-sm font-medium text-gray-700 flex items-center">
              <Settings className="w-4 h-4 mr-2 text-emerald-500" />
              <span>Advanced Settings</span>
            </label>
            <button className="text-gray-400 group-hover:text-gray-600 transition-colors">
              {expandedSections.advanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
          {expandedSections.advanced && (
            <div className="space-y-4 pt-2">
              {/* Temperature */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700 flex items-center">
                    Temperature
                    <Tooltip content="Controls randomness in the output (0 = deterministic, 1 = creative)">
                      <HelpCircle className="w-4 h-4 ml-1 text-gray-400" />
                    </Tooltip>
                  </label>
                  <span className="text-xs text-gray-500">{data.params?.temperature || 0}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={data.params?.temperature || 0}
                  onChange={(e) => updateNodeData(id, { temperature: parseFloat(e.target.value) })}
                  className="w-full"
                />
              </div>

              {/* Max Tokens */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700 flex items-center">
                    Max Tokens
                    <Tooltip content="Maximum number of tokens in the response">
                      <HelpCircle className="w-4 h-4 ml-1 text-gray-400" />
                    </Tooltip>
                  </label>
                </div>
                <BasicTextInput
                  value={String(data.params?.maxTokens || '')}
                  onChange={(value) => updateNodeData(id, { maxTokens: parseInt(value) || 0 })}
                  placeholder="Enter max tokens..."
                  className="bg-gray-50 focus:bg-white"
                />
              </div>

              {/* API Key */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700 flex items-center">
                    API Key
                    <Tooltip content="Your OpenAI API key for authentication">
                      <HelpCircle className="w-4 h-4 ml-1 text-gray-400" />
                    </Tooltip>
                  </label>
                  <button
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {showApiKey ? (
                  <BasicTextInput
                    value={data.params?.apiKey || ''}
                    onChange={(value) => updateNodeData(id, { apiKey: value })}
                    placeholder="Enter your API key..."
                    className="bg-gray-50 focus:bg-white font-mono"
                  />
                ) : (
                  <input
                    type="password"
                    value={data.params?.apiKey || ''}
                    onChange={(e) => updateNodeData(id, { apiKey: e.target.value })}
                    placeholder="Enter your API key..."
                    className="w-full px-3 py-2 text-sm bg-gray-50 focus:bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-mono"
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 !bg-gray-200 border-2 border-white"
      />

      {/* Templates Modal */}
      {showTemplates && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-[500px] max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Choose a Template</h3>
                <button
                  onClick={() => setShowTemplates(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              <div className="space-y-3">
                {PROMPT_TEMPLATES.map((template, index) => (
                  <button
                    key={index}
                    onClick={() => applyTemplate(template)}
                    className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-emerald-500 hover:bg-emerald-50 transition-all"
                  >
                    <h4 className="font-medium text-gray-900">{template.name}</h4>
                    <p className="text-sm text-gray-500 mt-1">{template.system}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OpenAINode;