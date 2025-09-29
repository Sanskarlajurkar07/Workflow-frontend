import React, { useState, useEffect, useRef } from 'react';
import { 
  Moon, 
  Sun, 
  Search, 
  History, 
  Settings,
  ChevronDown,
  Download,
  AlertCircle,
  Save,
  Edit2,
  Check
} from 'lucide-react';
import { NodeCategory } from '../../types/flow';
import { useTheme } from '../../utils/themeProvider';
import workflowService from '../../lib/workflowService';
import { useFlowStore } from '../../store/flowStore';
import { logApiError, validateWorkflow } from '../../utils/debugUtils';

interface NavigationProps {
  activeCategory: NodeCategory;
  onCategoryChange: (id: NodeCategory) => void;
  onSearch: (query: string) => void;
  workflowName?: string;
  workflowId?: string;
}

const categories: { id: NodeCategory; label: string }[] = [
  { id: 'general', label: 'Core Settings' },
  { id: 'llms', label: 'AI Models' },           // This matches the NodePanel category
  { id: 'knowledge-base', label: 'Smart Database' },
  { id: 'integrations', label: 'Connected Apps' },
  { id: 'data-loaders', label: 'Data Import' },
  { id: 'multi-modal', label: 'Mixed Modal' },
  { id: 'logic', label: 'Workflow Rules' },
  { id: 'ai-tools', label: 'AI Tools & SparkLayer' }
];

// Add state for workflow and deploy modal
export const Navigation: React.FC<NavigationProps> = ({
  activeCategory,
  onCategoryChange,
  onSearch,
  workflowName = 'New Workflow',
  workflowId
}) => {
  const { theme, toggleTheme } = useTheme();
  const [showDeployMenu, setShowDeployMenu] = useState(false);
  const [showDeployModal, setShowDeployModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [workflowState, setWorkflowState] = useState({
    isDeployed: false,
    hasChanges: true
  });
  const [isEditingName, setIsEditingName] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const isLight = theme === 'light';

  const setWorkflowName = useFlowStore(state => state.setWorkflowName);
  
  // Use the store's workflow name directly instead of the prop - this ensures it's always up to date
  const currentWorkflowName = useFlowStore(state => state.workflowName);
  const [editedName, setEditedName] = useState(currentWorkflowName || workflowName || 'New Workflow');
  const [isLoadingWorkflow, setIsLoadingWorkflow] = useState(false);

  // Update edited name when store workflow name changes
  useEffect(() => {
    console.log('🔄 Navigation useEffect - currentWorkflowName:', currentWorkflowName);
    
    if (currentWorkflowName) {
      // Only update if we have a valid name that's not the default
      if (currentWorkflowName !== 'New Workflow' && currentWorkflowName !== 'Untitled Workflow') {
        console.log('✅ Setting workflow name from store:', currentWorkflowName);
    setEditedName(currentWorkflowName);
        setIsLoadingWorkflow(false);
      }
    }
  }, [currentWorkflowName]);

  // Set loading state when switching to existing workflow
  useEffect(() => {
    console.log('🔄 Navigation useEffect - workflowId:', workflowId, 'currentWorkflowName:', currentWorkflowName, 'workflowName:', workflowName);
    
    if (workflowId && workflowId !== 'new') {
      // Only set loading if we don't already have a valid name
      if (!currentWorkflowName || currentWorkflowName === 'New Workflow') {
        console.log('⏳ Setting loading state to true');
        setIsLoadingWorkflow(true);
        
        // First try to use the name from props if available
        if (workflowName && workflowName !== 'New Workflow') {
          console.log('✅ Using workflow name from props:', workflowName);
          setEditedName(workflowName);
          setWorkflowName(workflowName); // Update store with prop name
          setIsLoadingWorkflow(false);
          return;
        }
        
        // Add timeout as fallback
        const timeoutId = setTimeout(() => {
          console.warn('⏰ Workflow loading timeout');
          setIsLoadingWorkflow(false);
          
          // Keep existing name if we have one, otherwise use a temporary name
          if (!editedName || editedName === 'New Workflow') {
            console.log('⚠️ No name available, using temporary name');
            setEditedName('Workflow ' + workflowId);
            setWorkflowName('Workflow ' + workflowId);
          }
        }, 10000); // 10 second timeout
        
        return () => {
          console.log('🧹 Cleaning up timeout');
          clearTimeout(timeoutId);
        };
      }
    } else {
      console.log('✅ Setting loading state to false - new workflow');
      setIsLoadingWorkflow(false);
    }
  }, [workflowId, currentWorkflowName, workflowName, editedName]);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditingName && nameInputRef.current) {
      nameInputRef.current.focus();
      nameInputRef.current.select();
    }
  }, [isEditingName]);

  // Handle click outside to cancel editing
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isEditingName && nameInputRef.current && !nameInputRef.current.contains(event.target as Node)) {
        setIsEditingName(false);
        setEditedName(currentWorkflowName); // Reset to current store name
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isEditingName, currentWorkflowName]);

  // Handle name edit submission
  const handleNameSubmit = async () => {
    if (!workflowId || editedName === workflowName || editedName.trim() === '') {
      setIsEditingName(false);
      setEditedName(workflowName); // Reset if empty
      return;
    }

    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError(null);

    try {
      // Get current workflow data
      const { nodes, edges } = useFlowStore.getState();
      
      // Prepare workflow update with new name
      const workflowUpdate = {
        name: editedName.trim(),
        nodes,
        edges,
        status: 'draft' as const
      };
      
      // Update the workflow
      await workflowService.updateWorkflow(workflowId, workflowUpdate);
      
      // Update name in store and document title
      setWorkflowName(editedName.trim());
      document.title = editedName.trim();
      
      // Show success message
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      
      // Exit editing mode
      setIsEditingName(false);
    } catch (error) {
      logApiError('Error updating workflow name', error);
      setSaveError('Failed to update workflow name');
      setTimeout(() => setSaveError(null), 3000);
      
      // Stay in editing mode if there's an error
    } finally {
      setIsSaving(false);
    }
  };

  // Add these functions
  const handleExport = () => {
    if (!workflowState.isDeployed || workflowState.hasChanges) {
      setShowDeployModal(true);
      return;
    }
    // Add export logic here
  };

  const handleDeploy = (type: 'core' | 'feature' | 'quick') => {
    setShowDeployMenu(false);
    // Handle deployment logic
    console.log(`Deploying with update type: ${type}`);
  };

  const handleSave = async () => {
    console.log('Save triggered with workflowId:', workflowId);
    
    // If we don't have a real workflow ID, we need to create a new workflow first
    if (!workflowId || workflowId === 'new') {
      console.log('No valid workflow ID - creating new workflow first');
      
      // Get current workflow name from store
      const currentWorkflowName = useFlowStore.getState().workflowName || workflowName || 'Untitled Workflow';
      
      // Import workflowService and create new workflow
      const { nodes, edges } = useFlowStore.getState();
      
      try {
        setIsSaving(true);
        setSaveSuccess(false);
        setSaveError(null);
        
        // Create new workflow
        const newWorkflowData = {
          name: currentWorkflowName.trim(),
          description: '',
          status: 'draft' as const,
          nodes,
          edges
        };
        
        console.log('Creating new workflow with data:', newWorkflowData);
        const newWorkflow = await workflowService.createWorkflow(newWorkflowData);
        console.log('New workflow created with ID:', newWorkflow.id);
        
        // Update the store with the new workflow ID
        useFlowStore.getState().setWorkflowId(newWorkflow.id);
        
        // Update URL to reflect the new workflow ID without triggering a reload
        window.history.replaceState(null, '', `/workflow/edit/${newWorkflow.id}`);
        
        // Show success message
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
        
        return; // Exit early since we've created a new workflow
      } catch (error) {
        console.error('Error creating new workflow:', error);
        setSaveError('Failed to create workflow');
        setTimeout(() => setSaveError(null), 3000);
        setIsSaving(false);
        return;
      }
    }
    
    // For existing workflows, proceed with update
    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError(null);
    
    try {
      // Get current nodes and edges from the store
      const { nodes, edges } = useFlowStore.getState();
      
      // Get the current workflow name from store, fallback to displayed name, then to default
      let currentWorkflowName = useFlowStore.getState().workflowName || workflowName || 'Untitled Workflow';
      
      // Ensure the workflow name is not empty or just whitespace
      if (!currentWorkflowName || currentWorkflowName.trim() === '') {
        currentWorkflowName = 'Untitled Workflow';
      }
      
      // Update the store with the final name to ensure consistency
      setWorkflowName(currentWorkflowName);
      
      // Prepare workflow data
      const workflowUpdate = {
        name: currentWorkflowName.trim(),
        description: '', // Add empty description
        nodes,
        edges,
        status: 'draft' as const // Set default status
      };
      
      console.log('Updating workflow', workflowId, 'with data:', workflowUpdate);
      
      // Validate the workflow data before sending
      const validationErrors = validateWorkflow(workflowUpdate);
      if (validationErrors.length > 0) {
        console.error('Workflow validation errors:', validationErrors);
        setSaveError(`Invalid workflow: ${validationErrors[0]}`);
        setIsSaving(false);
        return;
      }
      
      // Make API call to save the workflow
      await workflowService.updateWorkflow(workflowId, workflowUpdate);
      
      // Update save status in the flow store
      useFlowStore.getState().setSaveStatus('saved');
      
      // Update document title
      document.title = currentWorkflowName;
      
      // Show success message
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      
    } catch (error) {
      logApiError('Error saving workflow', error);
      setSaveError('Failed to save workflow');
      setTimeout(() => setSaveError(null), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle name display in the UI
  const displayName = isLoadingWorkflow ? 'Loading...' : editedName;

  // Update the buttons section in the existing JSX
  return (
    <div className={`border-b ${isLight ? 'border-theme-light bg-theme-white backdrop-filter backdrop-blur-lg bg-opacity-90' : 'border-theme-medium-dark/50 bg-theme-dark backdrop-filter backdrop-blur-lg bg-opacity-90'} z-10 sticky top-0`}>
      <div className="max-w-full px-4 py-2.5">
        {/* Top Navigation Bar */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <div className="flex items-center">
              <div className={`flex h-8 w-8 items-center justify-center rounded-md ${isLight ? 'bg-theme-medium' : 'bg-theme-medium'} mr-2.5`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.66 0H14a2 2 0 0 1 2 2v3.34l1 1L23 7v10" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              </div>
              <h1 className={`text-lg font-semibold ${isLight ? 'text-theme-dark' : 'text-theme-white'}`}>
                FlowMind AI
              </h1>
            </div>

            <div className={`px-3 mx-3 h-6 ${isLight ? 'border-l border-theme-light' : 'border-l border-theme-medium-dark/50'}`}></div>

            {/* Editable Workflow Name */}
            {isEditingName ? (
              <div className={`flex items-center ${isLight ? 'bg-theme-light/60 text-theme-dark rounded-md px-3 py-1 border border-theme-medium/40' : 'bg-theme-medium-dark/20 text-theme-white rounded-md px-3 py-1 border border-theme-medium/40'}`}>
                <span className={`text-xs ${isLight ? 'text-theme-medium-dark' : 'text-theme-light'} mr-2`}>Workflow:</span>
                <input 
                  ref={nameInputRef}
                  type="text" 
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleNameSubmit();
                    } else if (e.key === 'Escape') {
                      setIsEditingName(false);
                      setEditedName(currentWorkflowName);
                    }
                  }}
                  className={`text-sm font-medium ${isLight ? 'text-theme-dark bg-transparent' : 'text-theme-white bg-transparent'} focus:outline-none w-full max-w-xs`}
                />
                <button 
                  onClick={handleNameSubmit}
                  className={`ml-2 p-1 ${isLight ? 'text-theme-medium hover:text-theme-medium-dark' : 'text-theme-medium hover:text-theme-light'} rounded-md transition-colors`}
                  title="Save Name"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div 
                onClick={() => setIsEditingName(true)} 
                className={`flex items-center cursor-pointer group ${isLight ? 'bg-theme-light/60 hover:bg-theme-light text-theme-dark rounded-md px-3 py-1.5 border border-theme-light/70 hover:border-theme-medium/30' : 'bg-theme-medium-dark/20 hover:bg-theme-medium-dark/30 text-theme-white rounded-md px-3 py-1.5 border border-theme-medium-dark/40 hover:border-theme-medium/30'} transition-colors`}
                title="Click to edit workflow name"
              >
                <span className={`text-xs ${isLight ? 'text-theme-medium-dark' : 'text-theme-light'} mr-2`}>Workflow:</span>
                {isLoadingWorkflow ? (
                  <div className="flex items-center">
                    <div className={`w-3 h-3 mr-2 rounded-full border-2 ${isLight ? 'border-theme-medium border-t-transparent' : 'border-theme-medium border-t-transparent'} animate-spin`}></div>
                    <span className={`text-sm font-medium ${isLight ? 'text-theme-medium-dark' : 'text-theme-light'}`}>Loading...</span>
                  </div>
                ) : (
                  <>
                    <span className={`text-sm font-medium ${isLight ? 'text-theme-dark group-hover:text-theme-medium' : 'text-theme-white group-hover:text-theme-medium'} transition-colors mr-2`}>{displayName}</span>
                <Edit2 className={`w-3 h-3 ${isLight ? 'text-theme-medium-dark opacity-40 group-hover:opacity-100' : 'text-theme-light opacity-40 group-hover:opacity-100'} transition-opacity`} />
                  </>
                )}
              </div>
            )}
            
            {/* Save status indicators */}
            {isSaving && (
              <div className={`flex items-center ml-3 px-2.5 py-1 ${isLight ? 'bg-theme-light/60 border border-theme-light/70' : 'bg-theme-medium-dark/20 border border-theme-medium-dark/40'} rounded-md`}>
                <div className={`w-3 h-3 mr-2 rounded-full border-2 ${isLight ? 'border-theme-medium border-t-transparent' : 'border-theme-medium border-t-transparent'} animate-spin`}></div>
                <span className={`text-xs ${isLight ? 'text-theme-medium-dark' : 'text-theme-light'}`}>Saving...</span>
              </div>
            )}
            {saveSuccess && (
              <div className="flex items-center ml-3 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-2 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span className="text-xs text-emerald-400">Saved!</span>
              </div>
            )}
            {saveError && (
              <div className="flex items-center ml-3 px-2.5 py-1 bg-rose-500/10 border border-rose-500/30 rounded-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-2 text-rose-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
                <span className="text-xs text-rose-400">{saveError}</span>
              </div>
            )}
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-2.5">
            {/* Search Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className={`h-3.5 w-3.5 ${isLight ? 'text-theme-medium-dark/70' : 'text-theme-light/70'}`} />
              </div>
              <input
                type="text"
                placeholder="Search components..."
                onChange={(e) => onSearch(e.target.value)}
                className={`py-1.5 pl-9 pr-3 w-48 ${
                  isLight 
                    ? 'bg-theme-light/60 border border-theme-light/70 text-theme-dark placeholder-theme-medium-dark/60' 
                    : 'bg-theme-medium-dark/20 border border-theme-medium-dark/40 text-theme-white placeholder-theme-light/60'
                } rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-theme-medium focus:border-theme-medium`}
              />
            </div>
            
            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                isSaving 
                  ? isLight 
                    ? 'bg-theme-light/60 text-theme-medium-dark/60 cursor-not-allowed border border-theme-light/70' 
                    : 'bg-theme-medium-dark/20 text-theme-light/60 cursor-not-allowed border border-theme-medium-dark/40'
                  : isLight
                    ? 'bg-theme-medium text-white hover:bg-theme-medium-dark border border-theme-medium/50' 
                    : 'bg-theme-medium text-white hover:bg-theme-medium-dark border border-theme-medium/50'
              }`}
              title="Save Workflow"
            >
              <Save className="w-3.5 h-3.5" />
              Save
            </button>
            
            {/* Export Button */}
            <button
              onClick={handleExport}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                (!workflowState.isDeployed || workflowState.hasChanges)
                  ? 'bg-amber-600/20 text-amber-300 hover:bg-amber-600/30 border border-amber-500/30'
                  : isLight
                    ? 'bg-theme-light/60 text-theme-medium-dark hover:bg-theme-light/80 border border-theme-light/70'
                    : 'bg-theme-medium-dark/20 text-theme-light hover:bg-theme-medium-dark/30 border border-theme-medium-dark/40'
              }`}
              title={
                !workflowState.isDeployed 
                  ? "Deploy required before export" 
                  : workflowState.hasChanges 
                    ? "Deploy changes before export"
                    : "Export Workflow"
              }
            >
              <Download className="w-3.5 h-3.5" />
              Export
            </button>

            {/* Version History Button */}
            <button
              className={`p-1.5 ${
                isLight 
                  ? 'text-theme-medium-dark hover:text-theme-medium hover:bg-theme-light/70' 
                  : 'text-theme-light hover:text-theme-white hover:bg-theme-medium-dark/30'
              } rounded-md`}
              title="Version History"
            >
              <History className="w-4 h-4" />
            </button>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className={`p-1.5 ${
                isLight 
                  ? 'text-theme-medium-dark hover:text-theme-medium hover:bg-theme-light/70' 
                  : 'text-theme-light hover:text-theme-white hover:bg-theme-medium-dark/30'
              } rounded-md`}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>

            {/* Settings Button */}
            <button
              className={`p-1.5 ${
                isLight 
                  ? 'text-theme-medium-dark hover:text-theme-medium hover:bg-theme-light/70' 
                  : 'text-theme-light hover:text-theme-white hover:bg-theme-medium-dark/30'
              } rounded-md`}
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Category Tabs */}
        <div className="flex overflow-x-auto space-x-1 pb-2 hide-scrollbar">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md whitespace-nowrap transition-colors ${
                activeCategory === category.id
                  ? isLight
                    ? 'bg-theme-medium text-white'
                    : 'bg-theme-medium text-white'
                  : isLight
                    ? 'text-theme-medium-dark hover:bg-theme-light hover:text-theme-dark'
                    : 'text-theme-light hover:bg-theme-medium-dark/20 hover:text-theme-white'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      {/* Add Deploy Modal */}
      {showDeployModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center space-x-2 text-amber-600 mb-4">
              <AlertCircle className="w-5 h-5" />
              <h3 className="text-lg font-semibold">Export</h3>
            </div>
            <p className="text-gray-600 mb-6">
            Please deploy your latest changes before exporting. An exportable version of this Workflow is only available after deployment.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeployModal(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowDeployModal(false);
                  setShowDeployMenu(true);
                }}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Deploy Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};