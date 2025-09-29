import React from 'react';
import { Handle, Position } from 'reactflow';
import { Trash2, Settings, Youtube, Link, ExternalLink } from 'lucide-react';
import { useFlowStore } from '../../../../store/flowStore';

interface YouTubeLoaderNodeProps {
  id: string;
  data: {
    type: string;
    params?: {
      nodeName?: string;
      showSettings?: boolean;
      youtubeUrl?: string;
      urlMode?: string;
      language?: string;
      includeSubtitles?: boolean;
      autoTranslate?: boolean;
    };
  };
  selected?: boolean;
}

const YouTubeLoaderNode: React.FC<YouTubeLoaderNodeProps> = ({ id, data, selected }) => {
  const removeNode = useFlowStore((state) => state.removeNode);
  const updateNodeData = useFlowStore((state) => state.updateNodeData);

  const handleDelete = () => {
    removeNode(id);
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm overflow-hidden ${
      selected ? 'ring-2 ring-red-500' : 'ring-1 ring-gray-200'
    }`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-red-50 to-rose-50 px-4 py-2 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white rounded-md shadow-sm">
              <Youtube className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">YouTube Loader</h3>
              <p className="text-xs text-gray-500">{data.params?.nodeName || 'youtube_loader_0'}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => updateNodeData(id, { showSettings: !data.params?.showSettings })}
              className="p-1 rounded-md hover:bg-white/50 transition-colors"
            >
              <Settings className="w-4 h-4 text-gray-600" />
            </button>
            <button
              onClick={handleDelete}
              className="p-1 rounded-md hover:bg-white/50 transition-colors"
            >
              <Trash2 className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* URL Input Section */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">YouTube URL *</label>
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="https://www.youtube.com/watch?v=..."
                value={data.params?.youtubeUrl || ''}
                onChange={(e) => updateNodeData(id, { youtubeUrl: e.target.value })}
                className={`w-full pl-8 pr-3 py-1.5 text-sm border rounded-md ${
                  !data.params?.youtubeUrl ? 'border-red-300' : 'border-gray-200'
                } focus:ring-2 focus:ring-red-500 focus:border-transparent`}
              />
              <Link className="w-4 h-4 text-gray-400 absolute left-2 top-1/2 transform -translate-y-1/2" />
            </div>
            {data.params?.youtubeUrl && (
              <a
                href={data.params.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 text-gray-400 hover:text-gray-600"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
            <button
              onClick={() => updateNodeData(id, { 
                urlMode: data.params?.urlMode === 'variable' ? 'text' : 'variable' 
              })}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                data.params?.urlMode === 'variable'
                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {data.params?.urlMode === 'variable' ? 'Variable' : 'Text'}
            </button>
          </div>
          {!data.params?.youtubeUrl && (
            <p className="text-xs text-red-500 mt-1">YouTube URL is required</p>
          )}
        </div>

        {/* Settings Panel */}
        {data.params?.showSettings && (
          <div className="space-y-3 pt-2 border-t border-gray-100">
            {/* Language Selection */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Preferred Language</label>
              <select
                value={data.params?.language || 'en'}
                onChange={(e) => updateNodeData(id, { language: e.target.value })}
                className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="auto">Auto-detect</option>
              </select>
            </div>

            {/* Options */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="includeSubtitles"
                  checked={data.params?.includeSubtitles || false}
                  onChange={(e) => updateNodeData(id, { includeSubtitles: e.target.checked })}
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <label htmlFor="includeSubtitles" className="text-sm text-gray-600">
                  Include closed captions
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="autoTranslate"
                  checked={data.params?.autoTranslate || false}
                  onChange={(e) => updateNodeData(id, { autoTranslate: e.target.checked })}
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <label htmlFor="autoTranslate" className="text-sm text-gray-600">
                  Auto-translate if needed
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Status */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Status: {data.params?.youtubeUrl ? 'Ready' : 'Waiting for URL'}</span>
          <span>{data.params?.language ? `Language: ${data.params.language}` : 'Auto'}</span>
        </div>
      </div>

      {/* Handles */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 -ml-0.5 bg-red-500 border-2 border-white rounded-full"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 -mr-0.5 bg-red-500 border-2 border-white rounded-full"
      />
    </div>
  );
};

export default YouTubeLoaderNode;