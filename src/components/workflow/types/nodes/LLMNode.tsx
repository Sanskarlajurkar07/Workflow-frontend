import React from 'react';
import { Handle, Position } from 'reactflow';
import { Trash2, Settings, Zap, Brain, Lock } from 'lucide-react';
import { useFlowStore } from '../../../../store/flowStore';

interface LLMNodeProps {
  id: string;
  data: {
    type: string;
    params?: {
      nodeName?: string;
      system?: string;
      prompt?: string;
      model?: string;
      apiKey?: string;
      finetunedModel?: string;
      showSettings?: boolean;
    };
  };
  selected?: boolean;
}

const modelOptions = {
  openai: ['gpt-4-turbo-2024-04-09', 'gpt-4', 'gpt-3.5-turbo'],
  anthropic: ['claude-3-opus', 'claude-3-sonnet', 'claude-2.1'],
  gemini: ['gemini-pro', 'gemini-pro-vision'],
  cohere: ['command', 'command-light', 'command-nightly'],
  perplexity: ['pplx-7b-online', 'pplx-70b-online', 'pplx-7b-chat'],
  xai: ['grok-1', 'grok-0'],
};

// Example node creation
const newNode = {
  id: 'node-1',
  type: 'llm',
  data: {
    type: 'openai', // Ensure this matches one of the keys in `modelOptions`
    params: {
      nodeName: 'OpenAI Node',
      model: 'gpt-4',
      apiKey: '',
    },
  },
  position: { x: 100, y: 100 },
};

const handleAddNode = (type: string) => {
  addNode({
    id: `node-${Date.now()}`,
    type: 'llm',
    data: {
      type, // Pass the correct type here (e.g., 'openai', 'anthropic')
      params: {},
    },
    position: { x: 100, y: 100 },
  });
};

const LLMNode: React.FC<LLMNodeProps> = ({ id, data, selected }) => {
  const removeNode = useFlowStore((state) => state.removeNode);
  const updateNodeData = useFlowStore((state) => state.updateNodeData);

  const providerType = data.type?.toLowerCase() || 'unknown';
  const models = modelOptions[providerType as keyof typeof modelOptions] || [];

  const getProviderColor = () => {
    switch (providerType) {
      case 'openai': return 'from-emerald-500 to-green-600';
      case 'anthropic': return 'from-purple-500 to-indigo-600';
      case 'gemini': return 'from-blue-500 to-cyan-600';
      case 'cohere': return 'from-yellow-500 to-orange-600';
      case 'perplexity': return 'from-rose-500 to-pink-600';
      case 'xai': return 'from-gray-700 to-gray-900';
      default: return 'from-blue-500 to-indigo-600';
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden ${
      selected ? 'ring-2 ring-blue-500' : 'border border-gray-200'
    }`}>
      <div className={`bg-gradient-to-r ${getProviderColor()} px-4 py-3`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
              {providerType === 'openai' || providerType === 'gemini' ? (
                <Zap className="w-5 h-5 text-white" />
              ) : (
                <Brain className="w-5 h-5 text-white" />
              )}
            </div>
            <div>
              <h3 className="font-medium text-white capitalize">
                {providerType === 'unknown' ? 'Unknown LLM' : `${providerType.charAt(0).toUpperCase() + providerType.slice(1)} LLM`}
              </h3>
              <p className="text-xs text-white/80">
                {data.params?.model || 'Select model'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => updateNodeData(id, { showSettings: !data.params?.showSettings })}
              className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/20 transition-colors"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={() => removeNode(id)}
              className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-red-400/20 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      {/* Main Content */}
      {/* ... */}
    </div>
  );
};

export default LLMNode;