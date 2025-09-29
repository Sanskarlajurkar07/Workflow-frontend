import React, { useState, useEffect } from 'react';
import { Handle, Position } from 'reactflow';
import { 
  Settings, Trash2, Copy, BookOpen, Eye, EyeOff, 
  AlertTriangle, MessageSquare, ChevronDown, ChevronUp,
  Zap, Sparkles, Lightbulb, Music
} from 'lucide-react';
import { useFlowStore } from '../../../../store/flowStore';
import { VariableHighlighter } from '../../VariableHighlighter';
import { EnhancedVariableInput } from '../../EnhancedVariableInput';

// Latest Claude models
const modelOptions = [
  'claude-3-5-sonnet',
  'claude-3-opus',
  'claude-3-sonnet',
  'claude-3-haiku',
  'claude-instant'
];

interface Claude35NodeProps {
  id: string;
  data: {
    params?: {
      nodeName?: string;
      system?: string;
      prompt?: string;
      model?: string;
      apiKey?: string;
      max_tokens?: number;
      temperature?: number;
      topP?: number;
      showSettings?: boolean;
    };
  };
  selected?: boolean;
}

const Claude35Node: React.FC<Claude35NodeProps> = ({ id, data, selected }) => {
  const [showApiKey, setShowApiKey] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    model: true,
    system: true,
    prompt: true,
    advanced: false
  });
  
  const removeNode = useFlowStore((state) => state.removeNode);
  const updateNodeData = useFlowStore((state) => state.updateNodeData);
  const { nodes, edges } = useFlowStore();

  // Set default values for new nodes
  useEffect(() => {
    if (!data.params?.temperature) {
      updateNodeData(id, { temperature: 0.7 });
    }
    if (!data.params?.max_tokens) {
      updateNodeData(id, { max_tokens: 4096 });
    }
    if (!data.params?.topP) {
      updateNodeData(id, { topP: 0.9 });
    }
    if (!data.params?.model) {
      updateNodeData(id, { model: 'claude-3-5-sonnet' });
    }
    if (!data.params?.nodeName) {
      updateNodeData(id, { nodeName: `claude35_${id.split('-')[1] || '0'}` });
    }
  }, [id, data.params, updateNodeData]);

  const handleCopyNodeId = () => {
    navigator.clipboard.writeText(id);
  };

  const toggleSectionExpand = (section: 'prompt' | 'system' | 'model' | 'advanced') => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getConnectedNodes = () => {
    return edges
      .filter(edge => edge.target === id)
      .map(edge => edge.source)
      .map(sourceId => nodes.find(node => node.id === sourceId))
      .filter(Boolean);
  };

  // Check for issues with the node configuration
  const getNodeIssues = () => {
    const issues = [];
    
    if (!data.params?.model) {
      issues.push({ type: 'error', message: 'No model selected' });
    }
    
    if (!data.params?.prompt || data.params.prompt.trim() === '') {
      issues.push({ type: 'error', message: 'Prompt is empty' });
    }

    return issues;
  };

  const nodeIssues = getNodeIssues();
  const hasErrors = nodeIssues.some(issue => issue.type === 'error');

  return (
    <div className={`bg-white rounded-lg shadow-lg overflow-hidden ${
      selected ? 'ring-2 ring-purple-500' : hasErrors ? 'border border-red-300' : 'border border-gray-200'
    }`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-1 bg-white/20 backdrop-blur-sm rounded-lg w-9 h-9 flex items-center justify-center">
              <img 
                src="/logos/claude35.png" 
                alt="Claude 3.5 Logo" 
                className="w-7 h-7 object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "https://www.anthropic.com/images/favicon.svg"; 
                  target.onerror = null;
                }}
              />
            </div>
            <div>
              <h3 className="font-medium text-white">{data.params?.nodeName || 'Claude 3.5'}</h3>
              <p className="text-xs text-indigo-50/80">
                {data.params?.model || 'claude-3-5-sonnet'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopyNodeId}
              className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/20 transition-colors"
              title="Copy Node ID"
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
              onClick={() => {
                if (window.confirm('Are you sure you want to delete this Claude 3.5 node?')) {
                  removeNode(id);
                }
              }}
              className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-red-400/20 transition-colors"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-5">
        {/* Node Issues */}
        {nodeIssues.length > 0 && (
          <div className={`rounded-md p-3 ${hasErrors ? 'bg-red-50 border border-red-200' : 'bg-yellow-50 border border-yellow-200'}`}>
            <div className="flex items-start">
              <AlertTriangle className={`w-5 h-5 ${hasErrors ? 'text-red-500' : 'text-yellow-500'} mt-0.5 mr-2 flex-shrink-0`} />
              <div>
                <p className={`text-sm font-medium ${hasErrors ? 'text-red-800' : 'text-yellow-800'}`}>
                  {hasErrors ? 'Required fields missing' : 'Configuration warnings'}
                </p>
                <ul className="mt-1 text-xs space-y-1">
                  {nodeIssues.map((issue, index) => (
                    <li key={index} className={issue.type === 'error' ? 'text-red-700' : 'text-yellow-700'}>
                      • {issue.message}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Node Name */}
        <div className="space-y-2">
          <label className="block text-xs font-medium text-gray-500">Node Name</label>
          <input
            type="text"
            value={data.params?.nodeName || ''}
            onChange={(e) => updateNodeData(id, { nodeName: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        {/* Connected Nodes */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-500 flex items-center">
            <span>Connected Inputs</span>
            <span className="ml-2 px-1.5 py-0.5 text-xs rounded-md bg-indigo-100 text-indigo-800">
              {getConnectedNodes().length} {getConnectedNodes().length === 1 ? 'node' : 'nodes'}
            </span>
          </label>
          {getConnectedNodes().length > 0 ? (
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
              <ul className="space-y-1">
                {getConnectedNodes().map((node: any) => (
                  <li key={node.id} className="flex items-center text-xs">
                    <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></span>
                    <span className="font-medium">{node.data.params?.nodeName || node.id}</span>
                    <span className="text-gray-500 ml-1">({node.type})</span>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-gray-500 mt-2 border-t border-gray-200 pt-1">
                Type <code className="px-1.5 py-0.5 bg-gray-200 rounded">&#123;&#123;</code> to use variables from these nodes
              </p>
            </div>
          ) : (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md text-xs text-yellow-700 flex items-center">
              <AlertTriangle className="w-4 h-4 mr-2 flex-shrink-0" />
              <span>No connected nodes. Connect inputs to use their data as variables.</span>
            </div>
          )}
        </div>

        {/* Model Section */}
        <div className="space-y-2">
          <div
            className="flex items-center justify-between cursor-pointer"
            onClick={() => toggleSectionExpand('model')}
          >
            <label className="block text-sm font-medium text-gray-700 flex items-center">
              <MessageSquare className="w-4 h-4 mr-2 text-indigo-500" />
              <span>Model Selection</span>
            </label>
            <button className="text-gray-400">
              {expandedSections.model ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
          
          {expandedSections.model && (
            <div className="pt-2 space-y-3">
              <select
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                value={data.params?.model || ''}
                onChange={(e) => updateNodeData(id, { model: e.target.value })}
              >
                <option value="">Select a model</option>
                {modelOptions.map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
              </select>
              
              {data.params?.model?.includes('claude-3-5') && (
                <div className="p-2 bg-purple-50 border border-purple-100 rounded text-xs text-purple-700 flex items-center">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Claude 3.5 Sonnet: Anthropic's latest model with enhanced reasoning capabilities
                </div>
              )}
            </div>
          )}
        </div>

        {/* System Instructions */}
        <div className="space-y-2">
          <div
            className="flex items-center justify-between cursor-pointer"
            onClick={() => toggleSectionExpand('system')}
          >
            <label className="block text-sm font-medium text-gray-700 flex items-center">
              <BookOpen className="w-4 h-4 mr-2 text-indigo-500" />
              <span>System Instructions</span>
            </label>
            <button className="text-gray-400">
              {expandedSections.system ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
          
          {expandedSections.system && (
            <div className="pt-2 space-y-2">
              <div className="relative">
                <EnhancedVariableInput
                  name="system"
                  value={data.params?.system || ''}
                  onChange={(value) => updateNodeData(id, { system: value })}
                  placeholder="Define the AI's behavior and knowledge context..."
                  multiline={true}
                  rows={4}
                />
              </div>
              
              {data.params?.system && data.params.system.includes('{{') && (
                <div className="mt-2 p-2 bg-gray-50 border border-gray-200 rounded-md">
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Preview with variables:</label>
                  <VariableHighlighter 
                    text={data.params.system} 
                    className="text-sm text-gray-700"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Main Prompt */}
        <div className="space-y-2">
          <div
            className="flex items-center justify-between cursor-pointer"
            onClick={() => toggleSectionExpand('prompt')}
          >
            <label className="block text-sm font-medium text-gray-700 flex items-center">
              <Zap className="w-4 h-4 mr-2 text-indigo-500" />
              <span>Prompt</span>
            </label>
            <button className="text-gray-400">
              {expandedSections.prompt ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
          
          {expandedSections.prompt && (
            <div className="pt-2 space-y-2">
              <div className="relative">
                <EnhancedVariableInput
                  name="prompt"
                  value={data.params?.prompt || ''}
                  onChange={(value) => updateNodeData(id, { prompt: value })}
                  placeholder="Enter your prompt here... Use variables from other nodes"
                  multiline={true}
                  rows={5}
                />
              </div>
              
              {data.params?.prompt && data.params.prompt.includes('{{') && (
                <div className="mt-2 p-2 bg-gray-50 border border-gray-200 rounded-md">
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Preview with variables:</label>
                  <VariableHighlighter 
                    text={data.params.prompt} 
                    className="text-sm text-gray-700"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Advanced Settings */}
        <div className="space-y-2">
          <div
            className="flex items-center justify-between cursor-pointer"
            onClick={() => toggleSectionExpand('advanced')}
          >
            <label className="block text-sm font-medium text-gray-700 flex items-center">
              <Settings className="w-4 h-4 mr-2 text-indigo-500" />
              <span>Advanced Settings</span>
            </label>
            <button className="text-gray-400">
              {expandedSections.advanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
          
          {expandedSections.advanced && (
            <div className="pt-2 space-y-4">
              {/* Temperature slider */}
              <div className="space-y-1">
                <div className="flex justify-between">
                  <label className="block text-xs font-medium text-gray-500">Temperature: {data.params?.temperature}</label>
                  <span className="text-xs text-gray-400">
                    {data.params?.temperature === 0 
                      ? 'Deterministic' 
                      : data.params?.temperature && data.params.temperature > 0.7 
                        ? 'More creative' 
                        : 'More focused'}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={data.params?.temperature || 0.7}
                  onChange={(e) => updateNodeData(id, { temperature: parseFloat(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>
              
              {/* Top P slider */}
              <div className="space-y-1">
                <div className="flex justify-between">
                  <label className="block text-xs font-medium text-gray-500">Top P: {data.params?.topP}</label>
                  <span className="text-xs text-gray-400">
                    Nuclear sampling parameter
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={data.params?.topP || 0.9}
                  onChange={(e) => updateNodeData(id, { topP: parseFloat(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>
              
              {/* Max tokens */}
              <div className="space-y-1">
                <label className="block text-xs font-medium text-gray-500">
                  Max Tokens: {data.params?.max_tokens || 4096}
                </label>
                <input
                  type="number"
                  value={data.params?.max_tokens || 4096}
                  onChange={(e) => updateNodeData(id, { max_tokens: parseInt(e.target.value) })}
                  min="1"
                  max="200000"
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500">Maximum number of tokens to generate in the response.</p>
              </div>
              
              {/* API Key */}
              <div className="space-y-1">
                <label className="block text-xs font-medium text-gray-500">
                  API Key <span className="text-xs text-gray-400">(Required)</span>
                </label>
                <div className="relative">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    value={data.params?.apiKey || ''}
                    onChange={(e) => updateNodeData(id, { apiKey: e.target.value })}
                    placeholder="Enter your Anthropic API Key"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                    onClick={() => setShowApiKey(!showApiKey)}
                  >
                    {showApiKey ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500">
                  Get your API key from <a href="https://console.anthropic.com/" target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:underline">console.anthropic.com</a>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Version tag */}
      <div className="px-4 py-2 bg-indigo-50 border-t border-indigo-100 flex items-center justify-between text-xs text-indigo-500">
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
          <span>Claude 3.5</span>
        </div>
        <span className="font-mono">200K context</span>
      </div>

      {/* Handles */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 -ml-0.5 bg-indigo-500 border-2 border-white rounded-full"
        style={{ top: '50%' }}
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 -mr-0.5 bg-indigo-500 border-2 border-white rounded-full"
        style={{ top: '50%' }}
      />
    </div>
  );
};

export default Claude35Node; 