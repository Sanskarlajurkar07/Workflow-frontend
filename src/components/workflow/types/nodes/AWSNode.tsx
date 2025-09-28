import React, { useState, useEffect } from 'react';
import { Handle, Position } from 'reactflow';
import { 
  Settings, Trash2, Copy, BookOpen, Eye, EyeOff, 
  AlertTriangle, MessageSquare, ChevronDown, ChevronUp,
  Zap, Cloud, Server, Key
} from 'lucide-react';
import { useFlowStore } from '../../../../store/flowStore';
import { VariableHighlighter } from '../../VariableHighlighter';
import { EnhancedVariableInput } from '../../EnhancedVariableInput';

// AWS Bedrock model options
const modelOptions = [
  // Claude models on AWS Bedrock
  { value: 'anthropic.claude-3-sonnet-20240229-v1:0', label: 'Claude 3 Sonnet', group: 'Anthropic' },
  { value: 'anthropic.claude-3-haiku-20240307-v1:0', label: 'Claude 3 Haiku', group: 'Anthropic' },
  { value: 'anthropic.claude-instant-v1', label: 'Claude Instant', group: 'Anthropic' },
  
  // Amazon models
  { value: 'amazon.titan-text-express-v1', label: 'Titan Text Express', group: 'Amazon' },
  { value: 'amazon.titan-text-lite-v1', label: 'Titan Text Lite', group: 'Amazon' },
  { value: 'amazon.titan-embed-text-v1', label: 'Titan Embed', group: 'Amazon' },

  // Meta models on AWS Bedrock
  { value: 'meta.llama3-8b-instruct-v1:0', label: 'Llama 3 8B', group: 'Meta' },
  { value: 'meta.llama3-70b-instruct-v1:0', label: 'Llama 3 70B', group: 'Meta' },
  { value: 'meta.llama2-13b-chat-v1', label: 'Llama 2 13B', group: 'Meta' },
  { value: 'meta.llama2-70b-chat-v1', label: 'Llama 2 70B', group: 'Meta' },

  // Cohere models on AWS Bedrock
  { value: 'cohere.command-text-v14', label: 'Command', group: 'Cohere' },
  { value: 'cohere.command-light-text-v14', label: 'Command Light', group: 'Cohere' },
  { value: 'cohere.embed-english-v3', label: 'Embed English', group: 'Cohere' },
  { value: 'cohere.embed-multilingual-v3', label: 'Embed Multilingual', group: 'Cohere' },

  // Mistral models on AWS Bedrock
  { value: 'mistral.mistral-7b-instruct-v0:2', label: 'Mistral 7B', group: 'Mistral' },
  { value: 'mistral.mixtral-8x7b-instruct-v0:1', label: 'Mixtral 8x7B', group: 'Mistral' }
];

// Group models by provider
const groupedModels = modelOptions.reduce((acc, model) => {
  if (!acc[model.group]) {
    acc[model.group] = [];
  }
  acc[model.group].push(model);
  return acc;
}, {} as Record<string, typeof modelOptions>);

interface AWSNodeProps {
  id: string;
  data: {
    params?: {
      nodeName?: string;
      system?: string;
      prompt?: string;
      model?: string;
      awsAccessKeyId?: string;
      awsSecretAccessKey?: string;
      awsRegion?: string;
      max_tokens?: number;
      temperature?: number;
      showSettings?: boolean;
    };
  };
  selected?: boolean;
}

const regionOptions = [
  'us-east-1', 'us-east-2', 'us-west-1', 'us-west-2', 
  'eu-west-1', 'eu-central-1', 'ap-northeast-1', 'ap-southeast-1'
];

const AWSNode: React.FC<AWSNodeProps> = ({ id, data, selected }) => {
  const [showAccessKey, setShowAccessKey] = useState(false);
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    model: true,
    system: true,
    prompt: true,
    advanced: false,
    credentials: false
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
      updateNodeData(id, { max_tokens: 2048 });
    }
    if (!data.params?.awsRegion) {
      updateNodeData(id, { awsRegion: 'us-east-1' });
    }
    if (!data.params?.nodeName) {
      updateNodeData(id, { nodeName: `aws_${id.split('-')[1] || '0'}` });
    }
  }, [id, data.params, updateNodeData]);

  const handleCopyNodeId = () => {
    navigator.clipboard.writeText(id);
  };

  const toggleSectionExpand = (section: 'prompt' | 'system' | 'model' | 'advanced' | 'credentials') => {
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

    if (!data.params?.awsAccessKeyId || !data.params?.awsSecretAccessKey) {
      issues.push({ type: 'error', message: 'AWS credentials required' });
    }

    return issues;
  };

  const nodeIssues = getNodeIssues();
  const hasErrors = nodeIssues.some(issue => issue.type === 'error');

  const getModelProvider = () => {
    const modelValue = data.params?.model || '';
    for (const group in groupedModels) {
      if (groupedModels[group].some(m => m.value === modelValue)) {
        return group;
      }
    }
    return null;
  };

  const modelProvider = getModelProvider();

  return (
    <div className={`bg-white rounded-lg shadow-lg overflow-hidden ${
      selected ? 'ring-2 ring-amber-500' : hasErrors ? 'border border-red-300' : 'border border-gray-200'
    }`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-1 bg-white/20 backdrop-blur-sm rounded-lg w-9 h-9 flex items-center justify-center">
              <img 
                src="/logos/aws-bedrock.png" 
                alt="AWS Bedrock Logo" 
                className="w-7 h-7 object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "https://a0.awsstatic.com/libra-css/images/site/fav/favicon.ico"; 
                  target.onerror = null;
                }}
              />
            </div>
            <div>
              <h3 className="font-medium text-white">{data.params?.nodeName || 'AWS Bedrock'}</h3>
              <p className="text-xs text-amber-50/80">
                {modelOptions.find(m => m.value === data.params?.model)?.label || 'Select model'}
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
                if (window.confirm('Are you sure you want to delete this AWS Bedrock node?')) {
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
            className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
        </div>

        {/* Connected Nodes */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-500 flex items-center">
            <span>Connected Inputs</span>
            <span className="ml-2 px-1.5 py-0.5 text-xs rounded-md bg-amber-100 text-amber-800">
              {getConnectedNodes().length} {getConnectedNodes().length === 1 ? 'node' : 'nodes'}
            </span>
          </label>
          {getConnectedNodes().length > 0 ? (
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
              <ul className="space-y-1">
                {getConnectedNodes().map((node: any) => (
                  <li key={node.id} className="flex items-center text-xs">
                    <span className="w-2 h-2 bg-amber-500 rounded-full mr-2"></span>
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

        {/* AWS Credentials */}
        <div className="space-y-2">
          <div
            className="flex items-center justify-between cursor-pointer"
            onClick={() => toggleSectionExpand('credentials')}
          >
            <label className="block text-sm font-medium text-gray-700 flex items-center">
              <Key className="w-4 h-4 mr-2 text-amber-500" />
              <span>AWS Credentials</span>
            </label>
            <button className="text-gray-400">
              {expandedSections.credentials ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
          
          {expandedSections.credentials && (
            <div className="pt-2 space-y-4">
              {/* AWS Access Key ID */}
              <div className="space-y-1">
                <label className="block text-xs font-medium text-gray-500">
                  AWS Access Key ID
                </label>
                <div className="relative">
                  <input
                    type={showAccessKey ? 'text' : 'password'}
                    className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    value={data.params?.awsAccessKeyId || ''}
                    onChange={(e) => updateNodeData(id, { awsAccessKeyId: e.target.value })}
                    placeholder="Enter your AWS Access Key ID"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                    onClick={() => setShowAccessKey(!showAccessKey)}
                  >
                    {showAccessKey ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                  </button>
                </div>
              </div>

              {/* AWS Secret Access Key */}
              <div className="space-y-1">
                <label className="block text-xs font-medium text-gray-500">
                  AWS Secret Access Key
                </label>
                <div className="relative">
                  <input
                    type={showSecretKey ? 'text' : 'password'}
                    className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    value={data.params?.awsSecretAccessKey || ''}
                    onChange={(e) => updateNodeData(id, { awsSecretAccessKey: e.target.value })}
                    placeholder="Enter your AWS Secret Access Key"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                    onClick={() => setShowSecretKey(!showSecretKey)}
                  >
                    {showSecretKey ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                  </button>
                </div>
              </div>

              {/* AWS Region */}
              <div className="space-y-1">
                <label className="block text-xs font-medium text-gray-500">
                  AWS Region
                </label>
                <select
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
                  value={data.params?.awsRegion || 'us-east-1'}
                  onChange={(e) => updateNodeData(id, { awsRegion: e.target.value })}
                >
                  {regionOptions.map((region) => (
                    <option key={region} value={region}>
                      {region}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500">Make sure Bedrock is available in the selected region</p>
              </div>
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
              <Server className="w-4 h-4 mr-2 text-amber-500" />
              <span>Model Selection</span>
            </label>
            <button className="text-gray-400">
              {expandedSections.model ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
          
          {expandedSections.model && (
            <div className="pt-2 space-y-3">
              <select
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
                value={data.params?.model || ''}
                onChange={(e) => updateNodeData(id, { model: e.target.value })}
              >
                <option value="">Select a model</option>
                {Object.entries(groupedModels).map(([group, models]) => (
                  <optgroup key={group} label={`${group} Models`}>
                    {models.map((model) => (
                      <option key={model.value} value={model.value}>
                        {model.label}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              
              {modelProvider && (
                <div className="p-2 bg-amber-50 border border-amber-100 rounded text-xs text-amber-700 flex items-center">
                  <img 
                    src={`/logos/${modelProvider.toLowerCase()}.png`} 
                    alt={`${modelProvider} Logo`} 
                    className="w-4 h-4 mr-2 object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const fallbackSpan = document.createElement('span');
                      fallbackSpan.className = 'w-4 h-4 mr-2 flex-shrink-0 bg-amber-200 rounded-full';
                      e.currentTarget.parentNode?.insertBefore(fallbackSpan, e.currentTarget);
                    }}
                  />
                  {modelProvider} model on AWS Bedrock
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
              <BookOpen className="w-4 h-4 mr-2 text-amber-500" />
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

              {modelProvider && modelProvider !== 'Anthropic' && (
                <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-700">
                  <AlertTriangle className="w-4 h-4 mr-1 inline-block" />
                  System instructions may not be supported by all models
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
              <Zap className="w-4 h-4 mr-2 text-amber-500" />
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
              <Settings className="w-4 h-4 mr-2 text-amber-500" />
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
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>
              
              {/* Max tokens */}
              <div className="space-y-1">
                <label className="block text-xs font-medium text-gray-500">
                  Max Tokens: {data.params?.max_tokens || 2048}
                </label>
                <input
                  type="number"
                  value={data.params?.max_tokens || 2048}
                  onChange={(e) => updateNodeData(id, { max_tokens: parseInt(e.target.value) })}
                  min="1"
                  max="8192"
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500">Maximum number of tokens to generate in the response.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Status Bar */}
      <div className="px-4 py-2 bg-amber-50 border-t border-amber-100 flex items-center justify-between text-xs text-amber-700">
        <div className="flex items-center gap-1">
          <span className={`w-2 h-2 rounded-full ${data.params?.awsAccessKeyId && data.params?.awsSecretAccessKey ? 'bg-green-500' : 'bg-red-500'}`}></span>
          <span>{data.params?.awsRegion || 'us-east-1'}</span>
        </div>
        <span className="font-medium">{modelOptions.find(m => m.value === data.params?.model)?.group || 'AWS Bedrock'}</span>
      </div>

      {/* Handles */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 -ml-0.5 bg-amber-500 border-2 border-white rounded-full"
        style={{ top: '50%' }}
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 -mr-0.5 bg-amber-500 border-2 border-white rounded-full"
        style={{ top: '50%' }}
      />
    </div>
  );
};

export default AWSNode;