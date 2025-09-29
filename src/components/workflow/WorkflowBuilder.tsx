import React, { useState, useEffect } from 'react';
import { Navigation } from './Navigation';
import { NodePanel } from './NodePanel';
import { FlowCanvas } from './FlowCanvas';
import ErrorBoundary from '../ErrorBoundary';
import { NodeCategory, FlowNode, FlowEdge } from '../../types/flow';
import { useParams } from 'react-router-dom';
import api from '../../lib/axios';
import workflowService from '../../lib/workflowService';
import { Workflow } from '../../types/workflow';
import { useTheme } from '../../utils/themeProvider';
import { useFlowStore } from '../../store/flowStore';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Helper function to convert backend node data to FlowNode format
const mapToFlowNode = (node: any): FlowNode => {
  return {
    id: node.id,
    type: node.type,
    position: node.position,
    data: {
      label: node.data?.label || node.type,
      type: node.data?.type || node.type,
      params: node.data?.params || {},
      ...node.data
    },
  };
};

// Helper function to convert backend edge data to FlowEdge format
const mapToFlowEdge = (edge: any): FlowEdge => {
  return {
    id: edge.id,
    source: edge.source,
    target: edge.target,
    type: edge.type || 'smoothstep',
    animated: edge.animated ?? true,
    data: edge.data || {},
    markerEnd: edge.markerEnd || { type: 'arrowclosed' },
  };
};

// Event name for sidebar toggle communication
const TOGGLE_SIDEBAR_EVENT = 'toggle-workflow-sidebar';

export const WorkflowBuilder = () => {
  const { id } = useParams(); // Get workflow ID from URL param
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<NodeCategory>('general');
  const [workflowData, setWorkflowData] = useState<Workflow | null>(null);
  const [flowNodes, setFlowNodes] = useState<FlowNode[]>([]);
  const [flowEdges, setFlowEdges] = useState<FlowEdge[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const clearWorkflow = useFlowStore(state => state.clearWorkflow);
  const setWorkflowId = useFlowStore(state => state.setWorkflowId);
  const setWorkflowName = useFlowStore(state => state.setWorkflowName);
  const workflowNameFromStore = useFlowStore(state => state.workflowName);

  const isCreateMode = window.location.pathname === '/workflow/create' || window.location.pathname === '/workflow-builder';
  const currentUrlWorkflowId = id; // Renamed for clarity

  const categoryMap: Record<string, NodeCategory> = {
    'Core Settings': 'general',
    'AI Models': 'llms',
    'Smart Database': 'knowledge-base',
    'Connected Apps': 'integrations',
    'Data Import': 'data-loaders',
    'Mixed Modal': 'multi-modal',
    'Workflow Rules': 'logic',
    'AI Tools & SparkLayer': 'ai-tools'
  };

  // Toggle sidebar visibility
  const toggleSidebar = () => {
    const newState = !sidebarVisible;
    setSidebarVisible(newState);
    // Dispatch event to notify FlowCanvas component
    document.dispatchEvent(new CustomEvent(TOGGLE_SIDEBAR_EVENT, { detail: { visible: newState } }));
  };

  // Listen for sidebar toggle events from FlowCanvas
  useEffect(() => {
    const handleSidebarToggle = (event: any) => {
      setSidebarVisible(event.detail.visible);
    };
    
    document.addEventListener(TOGGLE_SIDEBAR_EVENT, handleSidebarToggle);
    return () => {
      document.removeEventListener(TOGGLE_SIDEBAR_EVENT, handleSidebarToggle);
    };
  }, []);

  // Load workflow data when component mounts or ID changes
  useEffect(() => {
    console.log('🚀 WorkflowBuilder useEffect triggered - URL ID:', currentUrlWorkflowId, 'isCreateMode:', isCreateMode);
    console.log('📊 Current store name:', useFlowStore.getState().workflowName);

    if (currentUrlWorkflowId && currentUrlWorkflowId !== 'new') {
      // Loading an existing workflow - preserve the name
      console.log('📋 Loading existing workflow, preserving name');
      clearWorkflow(true); // Preserve name when loading existing workflow
      setWorkflowId(currentUrlWorkflowId);
      fetchWorkflowData(currentUrlWorkflowId);
    } else if (isCreateMode) {
      // Creating a new workflow - reset name to default
      console.log('🆕 Creating new workflow, resetting name');
      clearWorkflow(false); // Reset name for new workflow
        setWorkflowId('new');
    }
  }, [currentUrlWorkflowId, isCreateMode, clearWorkflow, setWorkflowId]);

  const fetchWorkflowData = async (workflowIdToFetch: string) => {
    if (!workflowIdToFetch || workflowIdToFetch === 'new') {
        console.warn('fetchWorkflowData called with invalid ID:', workflowIdToFetch);
        return;
    }
    try {
      setIsLoading(true);
      setError(null); // Clear any previous errors
      console.log('🔄 Fetching workflow data for ID:', workflowIdToFetch);
      
      // Add logging to see the API response
      const response = await workflowService.getWorkflow(workflowIdToFetch);
      console.log('✅ API Response received:', response);

      // Defensive check for response
      if (!response || typeof response !== 'object') {
        throw new Error(`Invalid workflow response: ${JSON.stringify(response)}`);
      }

      // Defensive check for workflow name
      if (!response.name) {
        console.warn('⚠️ Workflow response missing name, using default');
        response.name = 'Untitled Workflow';
      }

      // Set workflow name first to ensure it's available immediately
      console.log('📝 Setting workflow name to:', response.name);
      setWorkflowName(response.name);
      
      // Then load the rest of the workflow data with defensive checks
      if (response.nodes && Array.isArray(response.nodes)) {
        const mappedNodes = response.nodes.map(mapToFlowNode);
        console.log(`📊 Setting ${mappedNodes.length} nodes for workflow ${workflowIdToFetch}`);
        useFlowStore.getState().setNodes(mappedNodes);
        setFlowNodes(mappedNodes);
      } else {
        console.log('📊 No valid nodes found, setting empty array');
        useFlowStore.getState().setNodes([]);
        setFlowNodes([]);
      }
      
      if (response.edges && Array.isArray(response.edges)) {
        const mappedEdges = response.edges.map(mapToFlowEdge);
        console.log(`🔗 Setting ${mappedEdges.length} edges for workflow ${workflowIdToFetch}`);
        useFlowStore.getState().setEdges(() => mappedEdges);
        setFlowEdges(mappedEdges);
      } else {
        console.log('🔗 No valid edges found, setting empty array');
        useFlowStore.getState().setEdges(() => []);
        setFlowEdges([]);
      }
      
      console.log('✅ Successfully loaded workflow:', response.name);
    } catch (error) {
      console.error('❌ Error fetching workflow:', error);
      // Set a user-friendly error message
      const errorMessage = error instanceof Error ? error.message : 'Failed to load workflow';
      setError(errorMessage);
      
      // Don't immediately reset the workflow name - let Navigation component handle it
      // Only set fallback name if there's absolutely no name in the store
      const currentStoreName = useFlowStore.getState().workflowName;
      if (!currentStoreName || currentStoreName === 'New Workflow') {
        console.log('🔄 Setting fallback name due to error and no existing name');
        setWorkflowName('Untitled Workflow');
      } else {
        console.log('🔄 Keeping existing name in store:', currentStoreName);
      }
    } finally {
      setIsLoading(false);
      console.log('🏁 Workflow fetch completed');
    }
  };

  if (isLoading) {
    return (
      <div className={`flex h-screen items-center justify-center ${
        isLight 
          ? 'bg-theme-white'
          : 'bg-theme-dark'
      }`}>
        <div className="text-center p-8">
          <div className={`w-16 h-16 border-4 ${
            isLight
              ? 'border-t-theme-medium border-theme-light'
              : 'border-t-theme-medium border-theme-medium-dark/30'
          } rounded-full animate-spin mx-auto mb-6`}></div>
          <h2 className={`text-xl font-semibold ${isLight ? 'text-theme-dark' : 'text-theme-white'} mb-2`}>Loading Workflow</h2>
          <p className={`${isLight ? 'text-theme-medium-dark' : 'text-theme-light'}`}>Preparing your canvas and components...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex h-screen items-center justify-center ${
        isLight 
          ? 'bg-theme-white'
          : 'bg-theme-dark'
      }`}>
        <div className={`text-center p-8 max-w-md ${
          isLight 
            ? 'bg-theme-white border-red-100'
            : 'bg-theme-dark/80 border-rose-500/30'
        } rounded-xl border`}>
          <div className={`w-16 h-16 mx-auto mb-6 rounded-full ${
            isLight 
              ? 'bg-red-50 flex items-center justify-center'
              : 'bg-rose-500/10 flex items-center justify-center'
          }`}>
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-8 w-8 ${isLight ? 'text-red-500' : 'text-rose-400'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h2 className={`text-xl font-semibold ${isLight ? 'text-theme-dark' : 'text-theme-white'} mb-4`}>Error Loading Workflow</h2>
          <p className={`${
            isLight 
              ? 'text-red-600 mb-6 bg-red-50 p-3 rounded-lg border border-red-100'
              : 'text-rose-400 mb-6 bg-rose-500/10 p-3 rounded-lg border border-rose-500/20'
          }`}>{error}</p>
          <button
            onClick={() => window.history.back()}
            className={`px-5 py-2.5 ${
              isLight 
                ? 'bg-theme-medium text-theme-white hover:bg-theme-medium-dark'
                : 'bg-theme-medium text-theme-white hover:bg-theme-medium-dark'
            } rounded-lg transition-colors`}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${
      isLight 
        ? 'bg-theme-white'
        : 'bg-theme-dark'
    }`}>
      <Navigation
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        onSearch={setSearchQuery}
        workflowName={workflowNameFromStore}
        workflowId={currentUrlWorkflowId}
      />
      <div className="flex h-[calc(100vh-132px)] relative">
        {/* Sidebar */}
        <div 
          className={`${sidebarVisible ? 'w-64' : 'w-0'} border-r overflow-hidden transition-all duration-300 ${
            isLight 
              ? 'border-theme-light bg-theme-light/70 backdrop-blur-sm'
              : 'border-theme-medium-dark/30 bg-theme-dark/80 backdrop-blur-sm'
          } h-full flex flex-col`}
        >
          <ErrorBoundary>
            <NodePanel
              category={activeCategory}
              searchQuery={searchQuery}
              onDragStart={(event, nodeType) => {
                event.dataTransfer.setData('application/reactflow', nodeType);
                event.dataTransfer.effectAllowed = 'move';
              }}
            />
          </ErrorBoundary>
        </div>
        
        {/* Sidebar toggle button */}
        <button 
          onClick={toggleSidebar}
          className={`absolute left-0 top-1/2 transform -translate-y-1/2 z-10 ${
            sidebarVisible ? 'ml-64' : 'ml-0'
          } transition-all duration-300 ${
            isLight 
              ? 'bg-theme-light hover:bg-theme-medium/20 text-theme-medium-dark'
              : 'bg-theme-medium-dark/30 hover:bg-theme-medium-dark/50 text-theme-light'
          } p-1.5 rounded-r-md border border-l-0 ${
            isLight ? 'border-theme-light' : 'border-theme-medium-dark/30'
          } flex items-center justify-center shadow-md`}
          title={sidebarVisible ? "Hide Components Panel" : "Show Components Panel"}
        >
          {sidebarVisible ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>
        
        {/* Canvas */}
        <div className="flex-1">
          <FlowCanvas 
            workflowId={currentUrlWorkflowId} 
            initialNodes={flowNodes} 
            initialEdges={flowEdges} 
          />
        </div>
      </div>
    </div>
  );
};