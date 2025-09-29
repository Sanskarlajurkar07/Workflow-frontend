import React from 'react';
import { Trash2, Settings, Sparkles } from 'lucide-react';
import { Handle, Position } from 'reactflow';
import { useFlowStore } from '../../../../store/flowStore';

interface AITaskExecutorNodeProps {
  data: {
    params?: {
      nodeName?: string;
      showSettings?: boolean;
      operation?: string;
      text?: string;
      context?: string;
      item?: string;
      criteria?: string;
      sourceLanguage?: string;
      targetLanguage?: string;
      list?: string;
      filterBy?: string;
      pdfFile?: File;
      csvFile?: File;
    };
  };
  id: string;
  selected?: boolean;
}

const AITaskExecutorNode: React.FC<AITaskExecutorNodeProps> = ({ data, id, selected }) => {
  // Get store functions
  const removeNode = useFlowStore((state) => state.removeNode);
  const updateNodeData = useFlowStore((state) => state.updateNodeData);

  // Handle functions
  const handleDelete = () => {
    removeNode(id);
  };

  const toggleSettings = () => {
    updateNodeData(id, { showSettings: !data.params?.showSettings });
  };

  const handleOperationChange = (operation: string) => {
    updateNodeData(id, { operation: operation.toLowerCase().replace(/\s+/g, '-') });
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-medium text-white">AI Operation</h3>
              <p className="text-xs text-purple-50/80">
                {data.params?.operation 
                  ? data.params.operation.split('-').map(word => 
                      word.charAt(0).toUpperCase() + word.slice(1)
                    ).join(' ')
                  : 'Select operation'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleSettings}
              className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/20 transition-colors"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={handleDelete}
              className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-red-400/20 transition-colors"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="p-4 space-y-4">
        {/* Settings Panel */}
        {data.params?.showSettings && (
          <div className="bg-gray-50 rounded-lg p-3 space-y-3 border border-gray-100">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Node Name</label>
              <input
                type="text"
                value={data.params?.nodeName || 'ai_operations_0'}
                onChange={(e) => updateNodeData(id, { nodeName: e.target.value })}
                className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
        )}

        {/* Operation Selection */}
        <div className="space-y-3">
          <label className="block text-xs font-medium text-gray-500">Select Operation</label>
          <div className="grid grid-cols-2 gap-2">
            {[
              'Extract Data',
              'Summarizer',
              'Categorizer',
              'Scorer',
              'Translator',
              'AI Filter List',
              'AI Fill PDF',
              'Extract to CSV',
            ].map((operation) => (
              <button
                key={operation}
                onClick={() => handleOperationChange(operation)}
                className={`px-3 py-2 rounded-md text-sm transition-colors ${
                  data.params?.operation === operation.toLowerCase().replace(/\s+/g, '-')
                    ? 'bg-purple-100 text-purple-700 font-medium'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {operation}
              </button>
            ))}
          </div>
        </div>

        {/* Operation Content Container */}
        {data.params?.operation && (
          <div className="bg-gray-50 rounded-lg p-4 space-y-3 border border-gray-100">
            {/* Dynamic Content Based on Operation */}
            {data.params?.operation === 'extract-data' && (
              <div>
                <label className="block text-xs text-gray-500 mb-1">Text for Extraction *</label>
                <textarea
                  placeholder="Enter text to extract data from"
                  value={data.params?.text || ''}
                  onChange={(e) => updateNodeData(id, { text: e.target.value })}
                  className="w-full text-sm border border-gray-200 rounded px-2 py-1"
                />
                <label className="block text-xs text-gray-500 mb-1">Additional Context</label>
                <textarea
                  placeholder="Optional: Provide additional context"
                  value={data.params?.context || ''}
                  onChange={(e) => updateNodeData(id, { context: e.target.value })}
                  className="w-full text-sm border border-gray-200 rounded px-2 py-1"
                />
              </div>
            )}

            {data.params?.operation === 'summarizer' && (
              <div>
                <label className="block text-xs text-gray-500 mb-1">Text for Summarization *</label>
                <textarea
                  placeholder="Enter text to summarize"
                  value={data.params?.text || ''}
                  onChange={(e) => updateNodeData(id, { text: e.target.value })}
                  className="w-full text-sm border border-gray-200 rounded px-2 py-1"
                />
              </div>
            )}

            {data.params?.operation === 'categorizer' && (
              <div>
                <label className="block text-xs text-gray-500 mb-1">Text for Categorization *</label>
                <textarea
                  placeholder="Enter text to categorize"
                  value={data.params?.text || ''}
                  onChange={(e) => updateNodeData(id, { text: e.target.value })}
                  className="w-full text-sm border border-gray-200 rounded px-2 py-1"
                />
                <label className="block text-xs text-gray-500 mb-1">Additional Context</label>
                <textarea
                  placeholder="Optional: Provide additional context"
                  value={data.params?.context || ''}
                  onChange={(e) => updateNodeData(id, { context: e.target.value })}
                  className="w-full text-sm border border-gray-200 rounded px-2 py-1"
                />
              </div>
            )}

            {data.params?.operation === 'scorer' && (
              <div>
                <label className="block text-xs text-gray-500 mb-1">Item for Scoring *</label>
                <textarea
                  placeholder="Enter text to score"
                  value={data.params?.item || ''}
                  onChange={(e) => updateNodeData(id, { item: e.target.value })}
                  className="w-full text-sm border border-gray-200 rounded px-2 py-1"
                />
                <label className="block text-xs text-gray-500 mb-1">Scoring Criteria *</label>
                <textarea
                  placeholder="Enter scoring criteria"
                  value={data.params?.criteria || ''}
                  onChange={(e) => updateNodeData(id, { criteria: e.target.value })}
                  className="w-full text-sm border border-gray-200 rounded px-2 py-1"
                />
              </div>
            )}

            {data.params?.operation === 'translator' && (
              <div>
                <label className="block text-xs text-gray-500 mb-1">Text for Translation *</label>
                <textarea
                  placeholder="Enter text to translate"
                  value={data.params?.text || ''}
                  onChange={(e) => updateNodeData(id, { text: e.target.value })}
                  className="w-full text-sm border border-gray-200 rounded px-2 py-1"
                />
                <label className="block text-xs text-gray-500 mb-1">Source Language</label>
                <select
                  value={data.params?.sourceLanguage || 'Detect Language'}
                  onChange={(e) => updateNodeData(id, { sourceLanguage: e.target.value })}
                  className="w-full text-sm border border-gray-200 rounded px-2 py-1"
                >
                  <option value="Detect Language">Detect Language</option>
                  <option value="English">English</option>
                  <option value="Spanish">Spanish</option>
                  <option value="French">French</option>
                </select>
                <label className="block text-xs text-gray-500 mb-1">Target Language</label>
                <select
                  value={data.params?.targetLanguage || 'English'}
                  onChange={(e) => updateNodeData(id, { targetLanguage: e.target.value })}
                  className="w-full text-sm border border-gray-200 rounded px-2 py-1"
                >
                  <option value="English">English</option>
                  <option value="Spanish">Spanish</option>
                  <option value="French">French</option>
                </select>
              </div>
            )}

            {data.params?.operation === 'ai-filter-list' && (
              <div>
                <label className="block text-xs text-gray-500 mb-1">List to Filter *</label>
                <textarea
                  placeholder="Enter list items"
                  value={data.params?.list || ''}
                  onChange={(e) => updateNodeData(id, { list: e.target.value })}
                  className="w-full text-sm border border-gray-200 rounded px-2 py-1"
                />
                <label className="block text-xs text-gray-500 mb-1">Filter By *</label>
                <textarea
                  placeholder="Enter filter criteria"
                  value={data.params?.filterBy || ''}
                  onChange={(e) => updateNodeData(id, { filterBy: e.target.value })}
                  className="w-full text-sm border border-gray-200 rounded px-2 py-1"
                />
              </div>
            )}

            {data.params?.operation === 'ai-fill-pdf' && (
              <div>
                <label className="block text-xs text-gray-500 mb-1">PDF to Fill *</label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => updateNodeData(id, { pdfFile: e.target.files?.[0] })}
                  className="w-full text-sm border border-gray-200 rounded px-2 py-1"
                />
                <label className="block text-xs text-gray-500 mb-1">Context to Fill PDF *</label>
                <textarea
                  placeholder="Enter context for filling PDF"
                  value={data.params?.context || ''}
                  onChange={(e) => updateNodeData(id, { context: e.target.value })}
                  className="w-full text-sm border border-gray-200 rounded px-2 py-1"
                />
              </div>
            )}

            {data.params?.operation === 'extract-to-csv' && (
              <div>
                <label className="block text-xs text-gray-500 mb-1">Text for Extraction *</label>
                <textarea
                  placeholder="Enter text to extract data"
                  value={data.params?.text || ''}
                  onChange={(e) => updateNodeData(id, { text: e.target.value })}
                  className="w-full text-sm border border-gray-200 rounded px-2 py-1"
                />
                <label className="block text-xs text-gray-500 mb-1">Select CSV *</label>
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => updateNodeData(id, { csvFile: e.target.files?.[0] })}
                  className="w-full text-sm border border-gray-200 rounded px-2 py-1"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <span className={`w-2 h-2 rounded-full ${data.params?.operation ? 'bg-green-500' : 'bg-gray-300'}`} />
          <span>{data.params?.operation ? 'Operation selected' : 'Select operation'}</span>
        </div>
        {data.params?.operation && (
          <span className="text-purple-600 font-medium">
            {data.params.operation.split('-').map(word => 
              word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ')}
          </span>
        )}
      </div>
    </div>
  );
};

export default AITaskExecutorNode;