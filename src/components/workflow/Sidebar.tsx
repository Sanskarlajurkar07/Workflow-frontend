import React, { useState } from 'react';
import { Brain, FileInput, FileOutput, GitFork, Search, MessageSquare, Mail, Slack, FileText } from 'lucide-react';

const nodeTypes = [
  { type: 'input', label: 'Input Node', icon: FileInput },
  { type: 'ai-model', label: 'AI Model', icon: Brain },
  { type: 'output', label: 'Output Node', icon: FileOutput },
  { type: 'condition', label: 'Condition', icon: GitFork }
];

const templates = [
  {
    id: 'search-assistant',
    name: 'AI Search Assistant',
    description: 'Create an AI-powered search assistant that combines multiple data sources',
    icon: Search,
    nodes: [
      { type: 'input', label: 'Query Input' },
      { type: 'ai-model', label: 'Search Processing' },
      { type: 'output', label: 'Search Results' }
    ]
  },
  {
    id: 'chatbot',
    name: 'Custom Chatbot',
    description: 'Build an interactive chatbot with customizable responses',
    icon: MessageSquare,
    nodes: [
      { type: 'input', label: 'User Message' },
      { type: 'ai-model', label: 'Chat Processing' },
      { type: 'output', label: 'Bot Response' }
    ]
  },
  {
    id: 'email-assistant',
    name: 'Email Assistant',
    description: 'Create an AI email assistant for drafting and analyzing emails',
    icon: Mail,
    nodes: [
      { type: 'input', label: 'Email Content' },
      { type: 'ai-model', label: 'Email Analysis' },
      { type: 'output', label: 'Suggestions' }
    ]
  }
];

export const Sidebar: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'nodes' | 'templates'>('templates');

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200">
      <div className="border-b border-gray-200">
        <nav className="flex -mb-px" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('templates')}
            className={`w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm ${
              activeTab === 'templates'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Templates
          </button>
          <button
            onClick={() => setActiveTab('nodes')}
            className={`w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm ${
              activeTab === 'nodes'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Nodes
          </button>
        </nav>
      </div>

      <div className="p-4">
        {activeTab === 'templates' ? (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Templates</h2>
            <div className="space-y-3">
              {templates.map((template) => {
                const Icon = template.icon;
                return (
                  <div
                    key={template.id}
                    className="p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-500 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <Icon className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">{template.name}</h3>
                        <p className="text-xs text-gray-500 mt-1">{template.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Node Types</h2>
            <div className="space-y-2">
              {nodeTypes.map(({ type, label, icon: Icon }) => (
                <div
                  key={type}
                  className="flex items-center p-3 bg-gray-50 rounded-lg cursor-move hover:bg-gray-100 transition-colors"
                  onDragStart={(e) => onDragStart(e, type)}
                  draggable
                >
                  <Icon className="w-5 h-5 mr-2 text-blue-600" />
                  <span className="text-sm text-gray-700">{label}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};