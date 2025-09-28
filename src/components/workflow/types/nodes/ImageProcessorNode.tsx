import React from 'react';
import { Handle, Position } from 'reactflow';
import { Trash2, Settings, Image, Camera, Upload, Key, ChevronDown } from 'lucide-react';
import { useFlowStore } from '../../../../store/flowStore';

interface ImageProcessorNodeProps {
  data: {
    params?: {
      mode?: string;
      provider?: string;
      model?: string;
      prompt?: string;
      aspectRatio?: string;
      usePersonalKey?: boolean;
      apiKey?: string;
      system?: string;
      knowledgeBase?: string;
      showSettings?: boolean;
    };
  };
  id: string;
  selected?: boolean;
}

const ImageProcessorNode: React.FC<ImageProcessorNodeProps> = ({ data, id, selected }) => {
  const removeNode = useFlowStore((state) => state.removeNode);
  const updateNodeData = useFlowStore((state) => state.updateNodeData);

  const handleDelete = () => {
    removeNode(id);
  };

  const handleToggleSettings = () => {
    updateNodeData(id, { showSettings: !data.params?.showSettings });
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg overflow-hidden ${
      selected ? 'ring-2 ring-indigo-500' : 'ring-1 ring-gray-200'
    }`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-500 px-4 py-3 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
              <Image className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-medium">Image Processor</h3>
              <p className="text-xs text-indigo-50/80">AI Image Operations</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleToggleSettings}
              className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/20 transition-colors"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={handleDelete}
              className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/20 transition-colors"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 space-y-4">
        {/* Mode Selection */}
        <div className="bg-slate-50 rounded-lg p-3">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => updateNodeData(id, { mode: 'text-to-image' })}
              className={`flex items-center justify-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                data.params?.mode === 'text-to-image'
                  ? 'bg-indigo-500 text-white'
                  : 'bg-white text-slate-700 hover:bg-indigo-50'
              }`}
            >
              <Image className="w-4 h-4" />
              <span>Text to Image</span>
            </button>
            <button
              onClick={() => updateNodeData(id, { mode: 'image-to-text' })}
              className={`flex items-center justify-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                data.params?.mode === 'image-to-text'
                  ? 'bg-indigo-500 text-white'
                  : 'bg-white text-slate-700 hover:bg-indigo-50'
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>Image to Text</span>
            </button>
          </div>
        </div>

        {/* Text to Image Content */}
        {data.params?.mode === 'text-to-image' && (
          <div className="space-y-4">
            {/* Provider and Model Card */}
            <div className="bg-slate-50 rounded-lg p-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-500">Provider</label>
                  <select
                    value={data.params?.provider || 'OpenAI'}
                    onChange={(e) => updateNodeData(id, { provider: e.target.value })}
                    className="w-full text-sm bg-white border border-slate-200 rounded-md px-2 py-1.5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="OpenAI">OpenAI</option>
                    <option value="Stability AI">Stability AI</option>
                    <option value="Flux">Flux</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-500">Model</label>
                  <select
                    value={data.params?.model || ''}
                    onChange={(e) => updateNodeData(id, { model: e.target.value })}
                    className="w-full text-sm bg-white border border-slate-200 rounded-md px-2 py-1.5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="dall-e-3">DALL-E 3</option>
                    <option value="stability-v2">Stability v2</option>
                    <option value="flux-gen">Flux Gen</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Prompt Card */}
            <div className="bg-slate-50 rounded-lg p-3">
              <label className="block text-xs font-medium text-slate-500 mb-1">Prompt</label>
              <textarea
                placeholder="Describe the image you want to generate..."
                value={data.params?.prompt || ''}
                onChange={(e) => updateNodeData(id, { prompt: e.target.value })}
                className="w-full text-sm bg-white border border-slate-200 rounded-md px-3 py-2 min-h-[80px] focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Settings Card */}
            <div className="bg-slate-50 rounded-lg p-3">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Aspect Ratio</label>
                  <select
                    value={data.params?.aspectRatio || '1:1'}
                    onChange={(e) => updateNodeData(id, { aspectRatio: e.target.value })}
                    className="w-full text-sm bg-white border border-slate-200 rounded-md px-2 py-1.5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="1:1">Square (1:1)</option>
                    <option value="16:9">Landscape (16:9)</option>
                    <option value="9:16">Portrait (9:16)</option>
                    <option value="4:3">Classic (4:3)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Image to Text Content */}
        {data.params?.mode === 'image-to-text' && (
          <div className="space-y-4">
            {/* Image Upload Card */}
            <div className="bg-slate-50 rounded-lg p-3">
              <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-300 rounded-lg hover:border-indigo-500 transition-colors">
                <Upload className="w-8 h-8 text-slate-400 mb-2" />
                <button className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition-colors">
                  Select Image
                </button>
                <p className="text-xs text-slate-500 mt-2">Supports JPG, PNG up to 10MB</p>
              </div>
            </div>

            {/* Analysis Settings Card */}
            <div className="bg-slate-50 rounded-lg p-3">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Analysis Type</label>
                  <select
                    value={data.params?.knowledgeBase || ''}
                    onChange={(e) => updateNodeData(id, { knowledgeBase: e.target.value })}
                    className="w-full text-sm bg-white border border-slate-200 rounded-md px-2 py-1.5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">Basic Description</option>
                    <option value="kb1">Detailed Analysis</option>
                    <option value="kb2">Technical Details</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Custom Instructions</label>
                  <textarea
                    placeholder="Add specific instructions for image analysis..."
                    value={data.params?.system || ''}
                    onChange={(e) => updateNodeData(id, { system: e.target.value })}
                    className="w-full text-sm bg-white border border-slate-200 rounded-md px-3 py-2 min-h-[60px] focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* API Key Section */}
        <div className="bg-slate-50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Key className="w-4 h-4 text-indigo-500" />
              <span className="text-sm font-medium text-slate-700">API Configuration</span>
            </div>
            <button
              onClick={() => updateNodeData(id, { usePersonalKey: !data.params?.usePersonalKey })}
              className={`px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                data.params?.usePersonalKey
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              {data.params?.usePersonalKey ? 'Using Personal Key' : 'Use System Key'}
            </button>
          </div>
          
          {data.params?.usePersonalKey && (
            <input
              type="password"
              placeholder="Enter your API key"
              value={data.params?.apiKey || ''}
              onChange={(e) => updateNodeData(id, { apiKey: e.target.value })}
              className="w-full text-sm bg-white border border-slate-200 rounded-md px-3 py-1.5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          )}
        </div>

        {/* Status Bar */}
        <div className="flex items-center justify-between py-2 px-3 bg-slate-100 rounded-md text-xs text-slate-500">
          <span className="flex items-center space-x-1">
            <span className={`w-2 h-2 rounded-full ${
              data.params?.prompt ? 'bg-indigo-500' : 'bg-slate-400'
            }`} />
            <span>{data.params?.prompt ? 'Ready' : 'Waiting for input'}</span>
          </span>
          <span>{data.params?.provider || 'No provider selected'}</span>
        </div>
      </div>

      {/* Handles */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 -ml-0.5 bg-indigo-500 border-2 border-white rounded-full"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 -mr-0.5 bg-indigo-500 border-2 border-white rounded-full"
      />
    </div>
  );
};

export default ImageProcessorNode;