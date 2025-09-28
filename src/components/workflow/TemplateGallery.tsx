import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Search, Star, ArrowRight, Copy } from 'lucide-react';
import { useTheme } from '../../utils/themeProvider';
import workflowService from '../../lib/workflowService';

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: React.ReactNode;
  complexity: 'beginner' | 'intermediate' | 'advanced';
  nodes: number;
}

export const TemplateGallery: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ 
  isOpen, 
  onClose 
}) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Template examples (in a real app, these would come from an API)
  const templates: WorkflowTemplate[] = [
    {
      id: 'simple-chat',
      name: 'Simple Chat AI Assistant',
      description: 'Basic chat bot that responds to user input using an AI model',
      category: 'AI',
      icon: <Star className="h-6 w-6" />,
      complexity: 'beginner',
      nodes: 3
    },
    {
      id: 'document-summarizer',
      name: 'Document Summarizer',
      description: 'Upload a document and get an AI-generated summary',
      category: 'AI',
      icon: <Star className="h-6 w-6" />,
      complexity: 'beginner',
      nodes: 4
    },
    {
      id: 'data-extraction',
      name: 'Data Extraction Pipeline',
      description: 'Extract structured data from text inputs using AI',
      category: 'Data',
      icon: <Star className="h-6 w-6" />,
      complexity: 'intermediate',
      nodes: 5
    },
    {
      id: 'multi-step-approval',
      name: 'Multi-step Approval Process',
      description: 'Create a workflow with conditional approval steps',
      category: 'Business',
      icon: <Star className="h-6 w-6" />,
      complexity: 'intermediate',
      nodes: 7
    },
    {
      id: 'image-processing',
      name: 'Image Analysis & Processing',
      description: 'Analyze images and extract information using AI',
      category: 'Multi-modal',
      icon: <Star className="h-6 w-6" />,
      complexity: 'advanced',
      nodes: 6
    }
  ];

  const categories = Array.from(new Set(templates.map(t => t.category)));

  // Filter templates based on search and category
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = searchQuery === '' || 
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === null || template.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleUseTemplate = async (template: WorkflowTemplate) => {
    try {
      setIsCreating(true);
      
      // In a real implementation, this would call your API to create a new workflow from the template
      // For now, we'll just create an empty workflow with the template name
      const newWorkflow = await workflowService.createWorkflow({
        name: template.name,
        description: template.description,
        nodes: [],
        edges: []
      });
      
      // Navigate to the new workflow
      navigate(`/workflows/${newWorkflow.id}`);
      onClose();
    } catch (error) {
      console.error('Error creating workflow from template:', error);
    } finally {
      setIsCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div 
        className={`w-full max-w-5xl ${isLight ? 'bg-white' : 'bg-slate-900'} rounded-lg shadow-lg p-6 max-h-[90vh] overflow-hidden flex flex-col`}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className={`text-xl font-semibold ${isLight ? 'text-gray-800' : 'text-white'}`}>
            Workflow Templates
          </h2>
          <button 
            onClick={onClose}
            className={`p-1 rounded-full ${isLight ? 'hover:bg-gray-100' : 'hover:bg-slate-800'}`}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="flex items-center gap-4 mb-6">
          <div className={`flex-1 relative ${isLight ? 'bg-gray-50' : 'bg-slate-800'} rounded-lg`}>
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full py-2 pl-10 pr-4 rounded-lg ${
                isLight 
                  ? 'bg-gray-50 text-gray-800 placeholder-gray-400' 
                  : 'bg-slate-800 text-white placeholder-gray-400'
              } border ${isLight ? 'border-gray-200' : 'border-slate-700'}`}
            />
          </div>
        </div>
        
        <div className="flex gap-4 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${
              selectedCategory === null
                ? (isLight ? 'bg-blue-100 text-blue-800' : 'bg-blue-800 text-blue-100')
                : (isLight ? 'bg-gray-100 text-gray-800 hover:bg-gray-200' : 'bg-slate-800 text-white hover:bg-slate-700')
            }`}
          >
            All Categories
          </button>
          
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${
                selectedCategory === category
                  ? (isLight ? 'bg-blue-100 text-blue-800' : 'bg-blue-800 text-blue-100')
                  : (isLight ? 'bg-gray-100 text-gray-800 hover:bg-gray-200' : 'bg-slate-800 text-white hover:bg-slate-700')
              }`}
            >
              {category}
            </button>
          ))}
        </div>
        
        <div className="overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map(template => (
            <div 
              key={template.id}
              className={`p-4 rounded-lg border ${
                isLight ? 'border-gray-200 hover:border-blue-300' : 'border-slate-700 hover:border-blue-600'
              } transition-colors cursor-pointer`}
              onClick={() => handleUseTemplate(template)}
            >
              <div className="flex items-start">
                <div className={`p-2 rounded ${
                  isLight ? 'bg-blue-50 text-blue-600' : 'bg-blue-900/30 text-blue-400'
                } mr-3`}>
                  {template.icon}
                </div>
                <div className="flex-1">
                  <h3 className={`font-medium ${isLight ? 'text-gray-800' : 'text-white'}`}>
                    {template.name}
                  </h3>
                  <p className={`text-sm mt-1 ${isLight ? 'text-gray-600' : 'text-gray-300'}`}>
                    {template.description}
                  </p>
                  <div className="flex items-center mt-3">
                    <span className={`text-xs px-2 py-1 rounded ${
                      template.complexity === 'beginner'
                        ? (isLight ? 'bg-green-50 text-green-700' : 'bg-green-900/30 text-green-400')
                        : template.complexity === 'intermediate'
                          ? (isLight ? 'bg-yellow-50 text-yellow-700' : 'bg-yellow-900/30 text-yellow-400')
                          : (isLight ? 'bg-red-50 text-red-700' : 'bg-red-900/30 text-red-400')
                    }`}>
                      {template.complexity}
                    </span>
                    <span className={`text-xs ml-2 ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
                      {template.nodes} nodes
                    </span>
                    <span className="flex-1"></span>
                    <button className={`text-xs flex items-center ${
                      isLight ? 'text-blue-600 hover:text-blue-800' : 'text-blue-400 hover:text-blue-200'
                    }`}>
                      Use template <ArrowRight className="ml-1 h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {isCreating && (
          <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
            <div className={`${isLight ? 'bg-white' : 'bg-slate-800'} p-4 rounded-lg shadow-lg`}>
              <div className="w-8 h-8 border-4 border-t-blue-500 border-blue-200 rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-center text-sm">Creating workflow...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TemplateGallery; 