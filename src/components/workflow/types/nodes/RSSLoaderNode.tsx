import React from 'react';
import { Handle, Position } from 'reactflow';
import { Trash2, Settings, Rss, Globe, ExternalLink } from 'lucide-react';
import { useFlowStore } from '../../../../store/flowStore';

interface RSSLoaderNodeProps {
  id: string;
  data: {
    params?: {
      nodeName?: string;
      showSettings?: boolean;
      url?: string;
      maxItems?: number;
      sortBy?: 'date' | 'title';
      filterKeywords?: string[];
      includeContent?: boolean;
      feedType?: 'standard' | 'google-alerts';
      alertQuery?: string;
      alertFrequency?: 'realtime' | 'daily' | 'weekly';
      alertLanguage?: string;
      alertRegion?: string;
    };
  };
  selected?: boolean;
}

const RSSLoaderNode: React.FC<RSSLoaderNodeProps> = ({ id, data, selected }) => {
  const removeNode = useFlowStore((state) => state.removeNode);
  const updateNodeData = useFlowStore((state) => state.updateNodeData);

  const handleDelete = () => {
    removeNode(id);
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm overflow-hidden ${
      selected ? 'ring-2 ring-orange-500' : 'ring-1 ring-gray-200'
    }`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-50 to-amber-50 px-4 py-2 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white rounded-md shadow-sm">
              <Rss className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">RSS Feed Loader</h3>
              <p className="text-xs text-gray-500">{data.params?.nodeName || 'rss_loader_0'}</p>
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
        {/* URL Input */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">RSS Feed URL *</label>
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <input
                type="url"
                placeholder="https://example.com/feed.xml"
                value={data.params?.url || ''}
                onChange={(e) => updateNodeData(id, { url: e.target.value })}
                className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              <Globe className="w-4 h-4 text-gray-400 absolute left-2 top-1/2 transform -translate-y-1/2" />
            </div>
            {data.params?.url && (
              <a
                href={data.params.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 text-gray-400 hover:text-gray-600"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>

        {/* Feed Type Selection */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-gray-500 mb-1">Feed Type</label>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => updateNodeData(id, { feedType: 'standard' })}
              className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                data.params?.feedType !== 'google-alerts'
                  ? 'bg-orange-100 text-orange-700'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              Standard RSS
            </button>
            <button
              onClick={() => updateNodeData(id, { feedType: 'google-alerts' })}
              className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                data.params?.feedType === 'google-alerts'
                  ? 'bg-orange-100 text-orange-700'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              Google Alerts
            </button>
          </div>
        </div>

        {/* Google Alerts Settings */}
        {data.params?.feedType === 'google-alerts' && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Alert Query *</label>
              <input
                type="text"
                placeholder="Enter search terms for Google Alert"
                value={data.params?.alertQuery || ''}
                onChange={(e) => updateNodeData(id, { alertQuery: e.target.value })}
                className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Update Frequency</label>
                <select
                  value={data.params?.alertFrequency || 'daily'}
                  onChange={(e) => updateNodeData(id, { alertFrequency: e.target.value })}
                  className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="realtime">As-it-happens</option>
                  <option value="daily">Once a day</option>
                  <option value="weekly">Once a week</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Language</label>
                <select
                  value={data.params?.alertLanguage || 'en'}
                  onChange={(e) => updateNodeData(id, { alertLanguage: e.target.value })}
                  className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                  <option value="it">Italian</option>
                  <option value="pt">Portuguese</option>
                  <option value="nl">Dutch</option>
                  <option value="ru">Russian</option>
                  <option value="ja">Japanese</option>
                  <option value="zh">Chinese</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Region</label>
              <select
                value={data.params?.alertRegion || 'any'}
                onChange={(e) => updateNodeData(id, { alertRegion: e.target.value })}
                className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="any">Any Region</option>
                <option value="us">United States</option>
                <option value="uk">United Kingdom</option>
                <option value="eu">European Union</option>
                <option value="asia">Asia</option>
                <option value="global">Global</option>
              </select>
            </div>

            <div className="pt-2">
              <button
                onClick={() => {
                  const baseUrl = 'https://www.google.com/alerts/feeds/';
                  const params = new URLSearchParams({
                    q: data.params?.alertQuery || '',
                    hl: data.params?.alertLanguage || 'en',
                    gl: data.params?.alertRegion || 'any',
                    freq: data.params?.alertFrequency || 'daily'
                  });
                  const alertUrl = `${baseUrl}?${params.toString()}`;
                  updateNodeData(id, { url: alertUrl });
                }}
                className="w-full px-4 py-2 bg-orange-50 text-orange-700 rounded-md hover:bg-orange-100 transition-colors text-sm font-medium"
              >
                Generate Alert RSS Feed
              </button>
            </div>
          </div>
        )}

        {/* Settings Panel */}
        {data.params?.showSettings && (
          <div className="space-y-3 pt-2 border-t border-gray-100">
            {/* Add the Feed Type and Google Alerts code here */}
            
            {/* Only show standard RSS settings if feedType is not google-alerts */}
            {data.params?.feedType !== 'google-alerts' && (
              <>
                {/* Existing Feed Settings */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Max Items</label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={data.params?.maxItems || 10}
                      onChange={(e) => updateNodeData(id, { maxItems: parseInt(e.target.value) })}
                      className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Sort By</label>
                    <select
                      value={data.params?.sortBy || 'date'}
                      onChange={(e) => updateNodeData(id, { sortBy: e.target.value })}
                      className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="date">Date</option>
                      <option value="title">Title</option>
                    </select>
                  </div>
                </div>

                {/* Filter Keywords */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Filter Keywords</label>
                  <input
                    type="text"
                    placeholder="Enter keywords separated by commas"
                    value={data.params?.filterKeywords?.join(', ') || ''}
                    onChange={(e) => updateNodeData(id, { 
                      filterKeywords: e.target.value.split(',').map(k => k.trim()).filter(Boolean)
                    })}
                    className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                {/* Include Content Toggle */}
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="includeContent"
                    checked={data.params?.includeContent || false}
                    onChange={(e) => updateNodeData(id, { includeContent: e.target.checked })}
                    className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                  />
                  <label htmlFor="includeContent" className="text-sm text-gray-600">
                    Include full content
                  </label>
                </div>

                {/* Test Feed Button */}
                <button
                  onClick={() => console.log('Testing RSS feed...')}
                  className="w-full px-4 py-2 bg-orange-50 text-orange-700 rounded-md hover:bg-orange-100 transition-colors text-sm font-medium"
                >
                  Test Feed
                </button>
              </>
            )}
          </div>
        )}

        {/* Status */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Status: {data.params?.url ? 'Ready' : 'Waiting for URL'}</span>
          <span>Items: {data.params?.maxItems || 10}</span>
        </div>
      </div>

      {/* Handles */}
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 -mr-0.5 bg-orange-500 border-2 border-white rounded-full"
      />
    </div>
  );
};

export default RSSLoaderNode;