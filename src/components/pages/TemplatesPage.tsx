import React, { useState, useEffect } from 'react';
import { DashboardSidebar } from '../dashboard/DashboardSidebar';
import { DashboardHeader } from '../dashboard/DashboardHeader';
import { 
  Layout, 
  Play, 
  Eye, 
  Copy, 
  Search, 
  Filter, 
  Bot,
  Mail,
  Database,
  FileText,
  Zap,
  Brain,
  MessageCircle,
  Calendar,
  BarChart3,
  Globe
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
  tags: string[];
  icon: any;
  nodeCount: number;
  usageCount: number;
  rating: number;
  isPopular?: boolean;
  isFeatured?: boolean;
}

const templateCategories = [
  { id: 'all', name: 'All Templates', icon: Layout },
  { id: 'automation', name: 'Automation', icon: Zap },
  { id: 'ai', name: 'AI & ML', icon: Brain },
  { id: 'communication', name: 'Communication', icon: MessageCircle },
  { id: 'data', name: 'Data Processing', icon: Database },
  { id: 'content', name: 'Content Creation', icon: FileText },
  { id: 'analytics', name: 'Analytics', icon: BarChart3 },
  { id: 'integration', name: 'Integration', icon: Globe },
];

// Mock template data - in real app this would come from API
const mockTemplates: WorkflowTemplate[] = [
  {
    id: '1',
    name: 'Customer Support AI Bot',
    description: 'Automated customer support bot that can handle common inquiries and escalate complex issues.',
    category: 'ai',
    difficulty: 'intermediate',
    estimatedTime: '30-45 min',
    tags: ['customer-support', 'ai', 'chatbot', 'automation'],
    icon: Bot,
    nodeCount: 12,
    usageCount: 1234,
    rating: 4.8,
    isPopular: true,
    isFeatured: true,
  },
  {
    id: '2',
    name: 'Email Campaign Automation',
    description: 'Automated email marketing campaigns with personalization and analytics tracking.',
    category: 'communication',
    difficulty: 'beginner',
    estimatedTime: '20-30 min',
    tags: ['email', 'marketing', 'automation', 'analytics'],
    icon: Mail,
    nodeCount: 8,
    usageCount: 892,
    rating: 4.6,
    isPopular: true,
  },
  {
    id: '3',
    name: 'Data Processing Pipeline',
    description: 'Process and transform large datasets with validation, cleaning, and export capabilities.',
    category: 'data',
    difficulty: 'advanced',
    estimatedTime: '60-90 min',
    tags: ['data', 'etl', 'processing', 'validation'],
    icon: Database,
    nodeCount: 15,
    usageCount: 567,
    rating: 4.7,
  },
  {
    id: '4',
    name: 'Content Generator',
    description: 'AI-powered content generation for blogs, social media, and marketing materials.',
    category: 'content',
    difficulty: 'intermediate',
    estimatedTime: '25-35 min',
    tags: ['ai', 'content', 'generation', 'marketing'],
    icon: FileText,
    nodeCount: 10,
    usageCount: 743,
    rating: 4.5,
  },
  {
    id: '5',
    name: 'Social Media Scheduler',
    description: 'Schedule and publish content across multiple social media platforms automatically.',
    category: 'automation',
    difficulty: 'beginner',
    estimatedTime: '15-25 min',
    tags: ['social-media', 'scheduling', 'automation'],
    icon: Calendar,
    nodeCount: 6,
    usageCount: 456,
    rating: 4.4,
  },
  {
    id: '6',
    name: 'Sales Analytics Dashboard',
    description: 'Comprehensive sales analytics with automated reporting and insights generation.',
    category: 'analytics',
    difficulty: 'intermediate',
    estimatedTime: '40-50 min',
    tags: ['analytics', 'sales', 'reporting', 'dashboard'],
    icon: BarChart3,
    nodeCount: 11,
    usageCount: 321,
    rating: 4.6,
  },
];

interface TemplateCardProps {
  template: WorkflowTemplate;
  onUse: (id: string) => void;
  onPreview: (id: string) => void;
}

const TemplateCard: React.FC<TemplateCardProps> = ({ template, onUse, onPreview }) => {
  const IconComponent = template.icon;
  
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'advanced':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 relative">
      {/* Badges */}
      <div className="absolute top-4 right-4 flex space-x-2">
        {template.isFeatured && (
          <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 rounded-full">
            Featured
          </span>
        )}
        {template.isPopular && (
          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 rounded-full">
            Popular
          </span>
        )}
      </div>

      <div className="flex items-start mb-4">
        <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg mr-4">
          <IconComponent className="w-6 h-6 text-white" />
        </div>
        <div className="flex-grow">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            {template.name}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
            {template.description}
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-4 mb-4 text-sm text-gray-500 dark:text-gray-400">
        <span className={`px-2 py-1 rounded-full text-xs ${getDifficultyColor(template.difficulty)}`}>
          {template.difficulty}
        </span>
        <span>{template.nodeCount} nodes</span>
        <span>{template.estimatedTime}</span>
        <div className="flex items-center">
          <span className="text-yellow-400 mr-1">★</span>
          <span>{template.rating}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {template.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full"
          >
            {tag}
          </span>
        ))}
        {template.tags.length > 3 && (
          <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full">
            +{template.tags.length - 3} more
          </span>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {template.usageCount.toLocaleString()} uses
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onPreview(template.id)}
            className="flex items-center px-3 py-2 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors text-sm"
          >
            <Eye className="w-4 h-4 mr-1" />
            Preview
          </button>
          <button
            onClick={() => onUse(template.id)}
            className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
          >
            <Copy className="w-4 h-4 mr-1" />
            Use Template
          </button>
        </div>
      </div>
    </div>
  );
};

export const TemplatesPage: React.FC = () => {
  const [templates] = useState<WorkflowTemplate[]>(mockTemplates);
  const [filteredTemplates, setFilteredTemplates] = useState<WorkflowTemplate[]>(mockTemplates);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'popular' | 'rating' | 'recent'>('popular');
  const navigate = useNavigate();

  useEffect(() => {
    let filtered = templates;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(template => template.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(template =>
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Sort templates
    switch (sortBy) {
      case 'popular':
        filtered.sort((a, b) => b.usageCount - a.usageCount);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'recent':
        // For now, we'll just reverse the order as a placeholder
        filtered.reverse();
        break;
    }

    setFilteredTemplates(filtered);
  }, [templates, selectedCategory, searchQuery, sortBy]);

  const handleUseTemplate = async (templateId: string) => {
    try {
      toast.success('Template copied to your workflows');
      // In a real app, you would call an API to copy the template
      // For now, just navigate to workflow builder
      navigate('/workflow/create');
    } catch (error) {
      console.error('Failed to use template:', error);
      toast.error('Failed to use template');
    }
  };

  const handlePreviewTemplate = (templateId: string) => {
    // In a real app, this would open a preview modal or navigate to a preview page
    toast.success('Preview functionality coming soon');
  };

  const featuredTemplates = templates.filter(t => t.isFeatured);

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
                Workflow Templates
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Start with pre-built templates and customize them for your needs
              </p>
            </div>

            {/* Featured Templates */}
            {featuredTemplates.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Featured Templates
                </h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {featuredTemplates.map((template) => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      onUse={handleUseTemplate}
                      onPreview={handlePreviewTemplate}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Search and Filters */}
            <div className="flex flex-col lg:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search templates..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Filter className="w-5 h-5 text-gray-400" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'popular' | 'rating' | 'recent')}
                    className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="popular">Most Popular</option>
                    <option value="rating">Highest Rated</option>
                    <option value="recent">Most Recent</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Category Tabs */}
            <div className="flex flex-wrap gap-2 mb-6">
              {templateCategories.map((category) => {
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

            {/* Templates Grid */}
            {filteredTemplates.length === 0 ? (
              <div className="text-center py-12">
                <Layout className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No templates found
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Try adjusting your search or filter criteria
                </p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredTemplates.map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    onUse={handleUseTemplate}
                    onPreview={handlePreviewTemplate}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}; 