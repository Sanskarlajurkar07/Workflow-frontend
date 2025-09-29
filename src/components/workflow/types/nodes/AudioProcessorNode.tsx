import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { Trash2, Settings, Volume2, Mic, ChevronDown, Key, Play, Music } from 'lucide-react';
import { useFlowStore } from '../../../../store/flowStore';
import { VariableInputField } from '../../VariableInputField';

interface AudioProcessorNodeProps {
  data: {
    params?: {
      nodeName?: string;
      showSettings?: boolean;
      provider?: string;
      model?: string;
      voice?: string;
      text?: string;
      textMode?: string;
      apiKey?: string;
      usePersonalKey?: boolean;
      operation?: string;
      language?: string;
      temperature?: number;
      variableName?: string;
    };
  };
  id: string;
  selected?: boolean;
}

const AudioProcessorNode: React.FC<AudioProcessorNodeProps> = ({ data, id, selected }) => {
  // Use flowStore for state management
  const removeNode = useFlowStore((state) => state.removeNode);
  const updateNodeData = useFlowStore((state) => state.updateNodeData);

  // Default parameters
  const params = data.params || {};
  const operation = params.operation || 'transcribe';
  const model = params.model || 'whisper-1';
  const language = params.language || '';
  const temperature = params.temperature !== undefined ? params.temperature : 0;
  const nodeName = params.nodeName || id;
  const variableName = params.variableName || 'audio_processor';
  
  // UI state
  const [showSettings, setShowSettings] = useState(false);

  const handleDelete = () => {
    removeNode(id);
  };

  const handleToggleSettings = () => {
    updateNodeData(id, { showSettings: !params.showSettings });
  };

  const handlePreview = () => {
    if (!params.text || !params.voice) {
      console.error('Text and Voice are required for preview');
      return;
    }
    console.log('Previewing audio with settings:', params);
  };

  // Update node data
  const handleUpdateNodeData = (field: string, value: any) => {
    updateNodeData(id, { [field]: value });
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg overflow-hidden ${
      selected ? 'ring-2 ring-teal-500' : 'ring-1 ring-gray-200'
    }`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-500 to-cyan-500 px-4 py-3 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
              <Music className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-medium">Audio Processor</h3>
              <p className="text-xs text-teal-50/80">{operation}</p>
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
        <div className="mb-4">
          <VariableInputField
            name="nodeName"
            label="Node Name"
            value={nodeName}
            onChange={(value) => handleUpdateNodeData('nodeName', value)}
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Operation</label>
          <select
            value={operation}
            onChange={(e) => handleUpdateNodeData('operation', e.target.value)}
            className="block w-full bg-white border border-gray-300 rounded-md py-2 px-3 text-sm"
          >
            <option value="transcribe">Transcribe Audio</option>
            <option value="analyze">Analyze Audio</option>
            <option value="detect_language">Detect Language</option>
          </select>
        </div>
        
        {showSettings && (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
              <select
                value={model}
                onChange={(e) => handleUpdateNodeData('model', e.target.value)}
                className="block w-full bg-white border border-gray-300 rounded-md py-2 px-3 text-sm"
              >
                <option value="whisper-1">Whisper-1</option>
                <option value="base">Base</option>
                <option value="small">Small</option>
              </select>
            </div>
            
            <div className="mb-4">
              <VariableInputField
                name="language"
                label="Language Code (optional)"
                value={language}
                onChange={(value) => handleUpdateNodeData('language', value)}
                placeholder="en, fr, es, etc."
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Temperature: {temperature}</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={temperature}
                onChange={(e) => handleUpdateNodeData('temperature', parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
            
            <div className="mb-4">
              <VariableInputField
                name="variableName"
                label="Variable Name"
                value={variableName}
                onChange={(value) => handleUpdateNodeData('variableName', value)}
              />
            </div>
          </>
        )}
        
        <div className="mt-4 p-3 bg-gray-50 rounded-md border border-gray-100 flex items-center">
          <Mic size={16} className="text-gray-500 mr-2" />
          <div className="text-sm text-gray-600">
            Upload or record audio to process
          </div>
        </div>
      </div>

      {/* Handles */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 -ml-0.5 bg-teal-500 border-2 border-white rounded-full"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 -mr-0.5 bg-teal-500 border-2 border-white rounded-full"
      />
    </div>
  );
};

export default AudioProcessorNode;