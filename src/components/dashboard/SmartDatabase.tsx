import React, { useState, useEffect } from 'react';
import {
  Database, Brain, Zap, BarChart3, Lightbulb,
  Search, Cpu, TrendingUp, Target, Sparkles,
  AlertCircle, CheckCircle, Clock, Users,
  FileText, Settings, Play, Pause, RefreshCw,
  Plus, Globe, Upload
} from 'lucide-react';
import { smartDatabaseService } from '../../lib/knowledgeBaseService';
import toast from 'react-hot-toast';
import DocumentUploadModal from './DocumentUploadModal';

interface SmartDatabaseProps {
  selectedKbId: string | null;
  workflowId?: string;
}

interface SmartAnalytics {
  kb_id: string;
  performance_metrics: {
    total_documents: number;
    total_chunks: number;
    avg_embedding_quality: number;
    search_performance_score: number;
    storage_efficiency: number;
    last_optimization: string;
  };
  query_patterns: Array<{
    pattern: string;
    frequency: number;
    avg_response_time: number;
    success_rate: number;
  }>;
  usage_insights: string[];
}

interface Recommendation {
  type: string;
  priority: 'high' | 'medium' | 'low';
  description: string;
  action: string;
  impact: string;
}

interface KnowledgeBase {
  id: string;
  name: string;
  description: string;
  status: string;
  documents: Array<{
    id: string;
    name: string;
    status: string;
    created_at: string;
  }>;
  created_at: string;
  updated_at: string;
}

interface PerformanceMetrics {
  document_count: number;
  embedding_quality: number;
  search_performance: number;
  storage_efficiency: number;
}

const SmartDatabase: React.FC<SmartDatabaseProps> = ({ selectedKbId, workflowId }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [analytics, setAnalytics] = useState<SmartAnalytics | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([]);
  const [selectedKB, setSelectedKB] = useState<string | null>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null);
  const [insights, setInsights] = useState<any[]>([]);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  // Fetch analytics when KB is selected
  useEffect(() => {
    if (selectedKbId) {
      fetchAnalytics();
      fetchRecommendations();
    }
  }, [selectedKbId]);

  const fetchAnalytics = async () => {
    if (!selectedKbId) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/knowledge-base/${selectedKbId}/analytics`);
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      } else {
        toast.error('Failed to fetch analytics');
      }
    } catch (error) {
      console.error('Analytics fetch error:', error);
      toast.error('Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendations = async () => {
    if (!selectedKbId) return;
    
    try {
      const response = await fetch(`/api/knowledge-base/${selectedKbId}/smart-recommendations`);
      if (response.ok) {
        const data = await response.json();
        setRecommendations(data);
      }
    } catch (error) {
      console.error('Recommendations fetch error:', error);
    }
  };

  const handleOptimize = async () => {
    if (!selectedKbId) return;
    
    setOptimizing(true);
    try {
      const response = await fetch(`/api/knowledge-base/${selectedKbId}/optimize`, {
        method: 'POST'
      });
      
      if (response.ok) {
        const result = await response.json();
        toast.success('Knowledge base optimized successfully!');
        
        // Refresh analytics after optimization
        fetchAnalytics();
        fetchRecommendations();
      } else {
        toast.error('Optimization failed');
      }
    } catch (error) {
      console.error('Optimization error:', error);
      toast.error('Optimization failed');
    } finally {
      setOptimizing(false);
    }
  };

  const handleIntelligentSearch = async () => {
    if (!selectedKbId || !searchQuery.trim()) return;
    
    setSearchLoading(true);
    try {
      const response = await fetch(`/api/knowledge-base/${selectedKbId}/smart-search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query: searchQuery,
          options: { top_k: 5 }
        })
      });
      
      if (response.ok) {
        const results = await response.json();
        setSearchResults(results);
        setActiveTab('search');
      } else {
        toast.error('Smart search failed');
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Smart search failed');
    } finally {
      setSearchLoading(false);
    }
  };

  const formatLastOptimization = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (!selectedKbId) {
    return (
      <div className="p-6 bg-gray-50 rounded-lg text-center">
        <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Knowledge Base Selected</h3>
        <p className="text-gray-600">Select a knowledge base to view its smart database features.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* VectorShift-style Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-3">
            <Database className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Smart Knowledge Base</h2>
              <p className="text-gray-600">AI-powered document management and intelligent search</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setUploadModalOpen(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Document
            </button>
            <button
              onClick={() => setActiveTab('configuration')}
              className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Settings className="h-4 w-4 mr-2" />
              Configure
            </button>
          </div>
        </div>

        {/* Document Upload Modal */}
        <DocumentUploadModal
          isOpen={uploadModalOpen}
          onClose={() => setUploadModalOpen(false)}
          knowledgeBaseId={selectedKbId}
          onDocumentAdded={() => {
            fetchAnalytics();
            setUploadModalOpen(false);
          }}
        />

        {/* Quick Stats */}
        {analytics && (
          <div className="grid grid-cols-4 gap-4 mt-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center">
                <FileText className="h-5 w-5 text-blue-600 mr-2" />
                <div>
                  <p className="text-sm text-blue-600">Documents</p>
                  <p className="text-2xl font-bold text-blue-900">{analytics.performance_metrics.total_documents}</p>
                </div>
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center">
                <Target className="h-5 w-5 text-green-600 mr-2" />
                <div>
                  <p className="text-sm text-green-600">Quality Score</p>
                  <p className="text-2xl font-bold text-green-900">{Math.round(analytics.performance_metrics.avg_embedding_quality * 100)}%</p>
                </div>
              </div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center">
                <Zap className="h-5 w-5 text-purple-600 mr-2" />
                <div>
                  <p className="text-sm text-purple-600">Performance</p>
                  <p className="text-2xl font-bold text-purple-900">{Math.round(analytics.performance_metrics.search_performance_score * 100)}%</p>
                </div>
              </div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="flex items-center">
                <Database className="h-5 w-5 text-orange-600 mr-2" />
                <div>
                  <p className="text-sm text-orange-600">Efficiency</p>
                  <p className="text-2xl font-bold text-orange-900">{Math.round(analytics.performance_metrics.storage_efficiency * 100)}%</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex space-x-6 px-6">
          {[
            { id: 'overview', name: 'Overview', icon: BarChart3 },
            { id: 'search', name: 'Smart Search', icon: Search },
            { id: 'insights', name: 'Insights', icon: Lightbulb },
            { id: 'recommendations', name: 'Recommendations', icon: Target }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center py-4 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="h-4 w-4 mr-2" />
              {tab.name}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
                <span className="ml-3 text-gray-600">Loading analytics...</span>
              </div>
            ) : analytics ? (
              <>
                {/* Performance Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-blue-700">Documents</p>
                        <p className="text-2xl font-bold text-blue-900">{analytics.performance_metrics.total_documents}</p>
                      </div>
                      <FileText className="h-8 w-8 text-blue-600" />
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-green-700">Embedding Quality</p>
                        <p className="text-2xl font-bold text-green-900">
                          {Math.round(analytics.performance_metrics.avg_embedding_quality * 100)}%
                        </p>
                      </div>
                      <Sparkles className="h-8 w-8 text-green-600" />
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-purple-700">Search Performance</p>
                        <p className="text-2xl font-bold text-purple-900">
                          {Math.round(analytics.performance_metrics.search_performance_score * 100)}%
                        </p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-purple-600" />
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-orange-700">Storage Efficiency</p>
                        <p className="text-2xl font-bold text-orange-900">
                          {Math.round(analytics.performance_metrics.storage_efficiency * 100)}%
                        </p>
                      </div>
                      <Cpu className="h-8 w-8 text-orange-600" />
                    </div>
                  </div>
                </div>

                {/* Query Patterns */}
                {analytics.query_patterns.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Users className="h-5 w-5 mr-2" />
                      Common Query Patterns
                    </h3>
                    <div className="space-y-3">
                      {analytics.query_patterns.slice(0, 5).map((pattern, index) => (
                        <div key={index} className="flex items-center justify-between py-2 px-3 bg-white rounded border">
                          <div>
                            <span className="font-medium text-gray-900">"{pattern.pattern}"</span>
                            <span className="text-sm text-gray-500 ml-2">({pattern.frequency} times)</span>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-600">{(pattern.avg_response_time * 1000).toFixed(0)}ms avg</div>
                            <div className="text-xs text-green-600">{Math.round(pattern.success_rate * 100)}% success</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Last Optimization */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-yellow-600 mr-2" />
                    <span className="text-sm text-yellow-800">
                      Last optimized: {formatLastOptimization(analytics.performance_metrics.last_optimization)}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <AlertCircle className="h-12 w-12 mx-auto mb-4" />
                <p>No analytics data available</p>
              </div>
            )}
          </div>
        )}

        {/* Smart Search Tab */}
        {activeTab === 'search' && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Intelligent Search Query
              </label>
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Ask anything about your documents..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  onKeyPress={(e) => e.key === 'Enter' && handleIntelligentSearch()}
                />
                <button
                  onClick={handleIntelligentSearch}
                  disabled={searchLoading || !searchQuery.trim()}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center"
                >
                  {searchLoading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {searchResults && (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">AI Summary</h4>
                  <p className="text-blue-800">{searchResults.summary}</p>
                  <div className="mt-2 text-sm text-blue-600">
                    Relevance Score: {Math.round((searchResults.relevance_score || 0) * 100)}%
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Search Results ({searchResults.total_results})</h4>
                  {searchResults.results.map((result: any, index: number) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-sm font-medium text-gray-600">Score: {result.score.toFixed(3)}</span>
                        <span className="text-xs text-gray-500">Quality: {Math.round((result.embedding_quality || 0) * 100)}%</span>
                      </div>
                      <p className="text-gray-900 mb-2">{result.text}</p>
                      <div className="text-xs text-gray-500">
                        Source: {result.metadata?.document_name || 'Unknown'}
                      </div>
                    </div>
                  ))}
                </div>

                {searchResults.suggestions && searchResults.suggestions.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Suggestions for Better Results</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {searchResults.suggestions.map((suggestion: string, index: number) => (
                        <li key={index} className="flex items-start">
                          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Insights Tab */}
        {activeTab === 'insights' && (
          <div className="space-y-4">
            {analytics?.usage_insights && analytics.usage_insights.length > 0 ? (
              analytics.usage_insights.map((insight, index) => (
                <div key={index} className="flex items-start p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <Lightbulb className="h-5 w-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                  <p className="text-blue-900">{insight}</p>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Lightbulb className="h-12 w-12 mx-auto mb-4" />
                <p>No insights available yet</p>
                <p className="text-sm">Use your knowledge base more to generate insights</p>
              </div>
            )}
          </div>
        )}

        {/* Recommendations Tab */}
        {activeTab === 'recommendations' && (
          <div className="space-y-4">
            {recommendations.length > 0 ? (
              recommendations.map((rec, index) => (
                <div key={index} className={`p-4 rounded-lg border ${getPriorityColor(rec.priority)}`}>
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium">{rec.description}</h4>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(rec.priority)}`}>
                      {rec.priority.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm mb-2">{rec.action}</p>
                  <div className="text-xs opacity-75">Impact: {rec.impact}</div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-gray-500">
                <CheckCircle className="h-12 w-12 mx-auto mb-4" />
                <p>No recommendations at this time</p>
                <p className="text-sm">Your knowledge base is performing well!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SmartDatabase; 