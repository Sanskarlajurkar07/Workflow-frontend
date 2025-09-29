import React, { useState } from 'react';
import { DashboardSidebar } from '../dashboard/DashboardSidebar';
import { DashboardHeader } from '../dashboard/DashboardHeader';
import { 
  Brain, 
  Image, 
  FileText, 
  MessageCircle, 
  Mic, 
  Video, 
  Search, 
  Zap, 
  Play, 
  Settings,
  Copy,
  Download
} from 'lucide-react';
import toast from 'react-hot-toast';

interface AITool {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: any;
  color: string;
  inputs: ToolInput[];
  isPopular?: boolean;
  usageCount: number;
}

interface ToolInput {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'number' | 'file';
  placeholder?: string;
  options?: string[];
  required?: boolean;
  defaultValue?: string;
}

const aiTools: AITool[] = [
  {
    id: 'gpt-image-generation',
    name: 'GPT Image Generation',
    description: 'Create images based on text prompts with gpt-image-1 model.',
    category: 'image',
    icon: Image,
    color: 'from-purple-500 to-pink-500',
    usageCount: 15420,
    isPopular: true,
    inputs: [
      {
        id: 'prompt',
        label: 'Prompt',
        type: 'textarea',
        placeholder: 'Enter your text here',
        required: true,
      },
      {
        id: 'size',
        label: 'Size',
        type: 'select',
        options: ['auto', '1024x1024', '512x512', '256x256'],
        defaultValue: 'auto',
      },
      {
        id: 'quality',
        label: 'Quality',
        type: 'select',
        options: ['auto', 'standard', 'hd'],
        defaultValue: 'auto',
      },
      {
        id: 'background',
        label: 'Background',
        type: 'select',
        options: ['opaque', 'transparent'],
        defaultValue: 'opaque',
      },
    ],
  },
  {
    id: 'text-summarizer',
    name: 'Text Summarizer',
    description: 'Summarize long text content into concise key points.',
    category: 'text',
    icon: FileText,
    color: 'from-blue-500 to-cyan-500',
    usageCount: 12350,
    isPopular: true,
    inputs: [
      {
        id: 'text',
        label: 'Text to Summarize',
        type: 'textarea',
        placeholder: 'Paste your text here...',
        required: true,
      },
      {
        id: 'length',
        label: 'Summary Length',
        type: 'select',
        options: ['short', 'medium', 'detailed'],
        defaultValue: 'medium',
      },
      {
        id: 'format',
        label: 'Output Format',
        type: 'select',
        options: ['bullet-points', 'paragraph', 'key-insights'],
        defaultValue: 'bullet-points',
      },
    ],
  },
  {
    id: 'chatbot-assistant',
    name: 'AI Chat Assistant',
    description: 'Intelligent conversational AI for customer support and general queries.',
    category: 'chat',
    icon: MessageCircle,
    color: 'from-green-500 to-emerald-500',
    usageCount: 9876,
    inputs: [
      {
        id: 'message',
        label: 'Message',
        type: 'textarea',
        placeholder: 'Type your message...',
        required: true,
      },
      {
        id: 'context',
        label: 'Context',
        type: 'select',
        options: ['general', 'customer-support', 'technical', 'creative'],
        defaultValue: 'general',
      },
      {
        id: 'tone',
        label: 'Response Tone',
        type: 'select',
        options: ['professional', 'friendly', 'formal', 'casual'],
        defaultValue: 'professional',
      },
    ],
  },
  {
    id: 'voice-to-text',
    name: 'Voice to Text',
    description: 'Convert audio recordings to accurate text transcriptions.',
    category: 'audio',
    icon: Mic,
    color: 'from-orange-500 to-red-500',
    usageCount: 7654,
    inputs: [
      {
        id: 'audio',
        label: 'Audio File',
        type: 'file',
        required: true,
      },
      {
        id: 'language',
        label: 'Language',
        type: 'select',
        options: ['auto-detect', 'english', 'spanish', 'french', 'german', 'chinese'],
        defaultValue: 'auto-detect',
      },
      {
        id: 'format',
        label: 'Output Format',
        type: 'select',
        options: ['plain-text', 'formatted', 'timestamps'],
        defaultValue: 'plain-text',
      },
    ],
  },
  {
    id: 'content-generator',
    name: 'Content Generator',
    description: 'Generate blog posts, articles, and marketing content.',
    category: 'text',
    icon: FileText,
    color: 'from-indigo-500 to-purple-500',
    usageCount: 6543,
    inputs: [
      {
        id: 'topic',
        label: 'Topic',
        type: 'text',
        placeholder: 'e.g., AI in Healthcare',
        required: true,
      },
      {
        id: 'type',
        label: 'Content Type',
        type: 'select',
        options: ['blog-post', 'article', 'social-media', 'email', 'product-description'],
        defaultValue: 'blog-post',
      },
      {
        id: 'length',
        label: 'Length',
        type: 'select',
        options: ['short', 'medium', 'long'],
        defaultValue: 'medium',
      },
      {
        id: 'style',
        label: 'Writing Style',
        type: 'select',
        options: ['professional', 'casual', 'technical', 'creative', 'persuasive'],
        defaultValue: 'professional',
      },
    ],
  },
  {
    id: 'video-analyzer',
    name: 'Video Content Analyzer',
    description: 'Analyze video content and extract key insights and summaries.',
    category: 'video',
    icon: Video,
    color: 'from-pink-500 to-rose-500',
    usageCount: 4321,
    inputs: [
      {
        id: 'video',
        label: 'Video File',
        type: 'file',
        required: true,
      },
      {
        id: 'analysis-type',
        label: 'Analysis Type',
        type: 'select',
        options: ['summary', 'sentiment', 'topics', 'transcription', 'objects'],
        defaultValue: 'summary',
      },
      {
        id: 'detail-level',
        label: 'Detail Level',
        type: 'select',
        options: ['basic', 'detailed', 'comprehensive'],
        defaultValue: 'detailed',
      },
    ],
  },
];

const categories = [
  { id: 'all', name: 'All Tools', icon: Brain },
  { id: 'image', name: 'Image', icon: Image },
  { id: 'text', name: 'Text', icon: FileText },
  { id: 'chat', name: 'Chat', icon: MessageCircle },
  { id: 'audio', name: 'Audio', icon: Mic },
  { id: 'video', name: 'Video', icon: Video },
];

interface ToolCardProps {
  tool: AITool;
  onUse: (toolId: string) => void;
}

const ToolCard: React.FC<ToolCardProps> = ({ tool, onUse }) => {
  const IconComponent = tool.icon;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 relative">
      {tool.isPopular && (
        <div className="absolute top-4 right-4">
          <span className="px-2 py-1 text-xs bg-gradient-to-r from-orange-400 to-pink-400 text-white rounded-full">
            Popular
          </span>
        </div>
      )}

      <div className="flex items-start mb-4">
        <div className={`p-3 bg-gradient-to-br ${tool.color} rounded-lg mr-4`}>
          <IconComponent className="w-6 h-6 text-white" />
        </div>
        <div className="flex-grow">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            {tool.name}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
            {tool.description}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {tool.usageCount.toLocaleString()} uses
        </div>
        <button
          onClick={() => onUse(tool.id)}
          className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
        >
          <Play className="w-4 h-4 mr-1" />
          Use Tool
        </button>
      </div>
    </div>
  );
};

interface ToolModalProps {
  tool: AITool | null;
  isOpen: boolean;
  onClose: () => void;
  onRun: (toolId: string, inputs: Record<string, any>) => void;
}

const ToolModal: React.FC<ToolModalProps> = ({ tool, isOpen, onClose, onRun }) => {
  const [inputs, setInputs] = useState<Record<string, any>>({});
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  React.useEffect(() => {
    if (tool && isOpen) {
      // Initialize inputs with default values
      const defaultInputs: Record<string, any> = {};
      tool.inputs.forEach(input => {
        if (input.defaultValue) {
          defaultInputs[input.id] = input.defaultValue;
        }
      });
      setInputs(defaultInputs);
      setResult(null);
    }
  }, [tool, isOpen]);

  const handleInputChange = (inputId: string, value: any) => {
    setInputs(prev => ({ ...prev, [inputId]: value }));
  };

  const handleRun = async () => {
    if (!tool) return;
    
    setIsRunning(true);
    try {
      await onRun(tool.id, inputs);
      // Simulate AI processing
      setTimeout(() => {
        setResult('Tool executed successfully! This is a mock result for demonstration purposes.');
        setIsRunning(false);
      }, 2000);
    } catch (error) {
      setIsRunning(false);
      toast.error('Failed to run tool');
    }
  };

  if (!isOpen || !tool) return null;

  const IconComponent = tool.icon;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-lg flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className={`p-2 bg-gradient-to-br ${tool.color} rounded-lg mr-3`}>
              <IconComponent className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {tool.name}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {tool.description}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            ×
          </button>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* Left Panel - Inputs */}
          <div className="w-1/2 p-6 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Configuration
            </h3>
            
            <div className="space-y-4">
              {tool.inputs.map((input) => (
                <div key={input.id}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {input.label}
                    {input.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  
                  {input.type === 'text' && (
                    <input
                      type="text"
                      value={inputs[input.id] || ''}
                      onChange={(e) => handleInputChange(input.id, e.target.value)}
                      placeholder={input.placeholder}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  )}
                  
                  {input.type === 'textarea' && (
                    <textarea
                      value={inputs[input.id] || ''}
                      onChange={(e) => handleInputChange(input.id, e.target.value)}
                      placeholder={input.placeholder}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  )}
                  
                  {input.type === 'select' && (
                    <select
                      value={inputs[input.id] || input.defaultValue || ''}
                      onChange={(e) => handleInputChange(input.id, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      {input.options?.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  )}
                  
                  {input.type === 'file' && (
                    <input
                      type="file"
                      onChange={(e) => handleInputChange(input.id, e.target.files?.[0])}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={handleRun}
              disabled={isRunning}
              className="w-full mt-6 flex items-center justify-center px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
            >
              {isRunning ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Running...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Run Tool
                </>
              )}
            </button>
          </div>

          {/* Right Panel - Output */}
          <div className="w-1/2 p-6 bg-gray-50 dark:bg-gray-900 overflow-y-auto">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Output
            </h3>
            
            {result ? (
              <div className="space-y-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <p className="text-gray-900 dark:text-white">{result}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => navigator.clipboard.writeText(result)}
                    className="flex items-center px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm"
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    Copy
                  </button>
                  <button
                    onClick={() => toast.success('Download feature coming soon')}
                    className="flex items-center px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                {isRunning ? (
                  <div className="text-center">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p>Processing...</p>
                  </div>
                ) : (
                  <p>Run the tool to see results here</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const AIToolsPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTool, setSelectedTool] = useState<AITool | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredTools = aiTools.filter(tool => {
    const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory;
    const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tool.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleUseTool = (toolId: string) => {
    const tool = aiTools.find(t => t.id === toolId);
    if (tool) {
      setSelectedTool(tool);
      setIsModalOpen(true);
    }
  };

  const handleRunTool = async (toolId: string, inputs: Record<string, any>) => {
    console.log('Running tool:', toolId, 'with inputs:', inputs);
    // In a real app, this would call the actual AI service
    toast.success('Tool execution started');
  };

  const popularTools = aiTools.filter(tool => tool.isPopular);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      <DashboardSidebar />
      
      <div className="flex-1 flex flex-col">
        <DashboardHeader />
        
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                AI Tools
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Ready-to-use AI tools for various tasks and workflows
              </p>
            </div>

            {/* Popular Tools */}
            {popularTools.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Popular Tools
                </h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {popularTools.map((tool) => (
                    <ToolCard
                      key={tool.id}
                      tool={tool}
                      onUse={handleUseTool}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Search */}
            <div className="mb-6">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search AI tools..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            {/* Category Tabs */}
            <div className="flex flex-wrap gap-2 mb-6">
              {categories.map((category) => {
                const IconComponent = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <IconComponent className="w-4 h-4 mr-2" />
                    {category.name}
                  </button>
                );
              })}
            </div>

            {/* Tools Grid */}
            {filteredTools.length === 0 ? (
              <div className="text-center py-12">
                <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No tools found
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Try adjusting your search or filter criteria
                </p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredTools.map((tool) => (
                  <ToolCard
                    key={tool.id}
                    tool={tool}
                    onUse={handleUseTool}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Tool Modal */}
      <ToolModal
        tool={selectedTool}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTool(null);
        }}
        onRun={handleRunTool}
      />
    </div>
  );
}; 