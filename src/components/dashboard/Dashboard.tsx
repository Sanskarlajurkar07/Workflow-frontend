import React, { useState, useEffect, useRef } from 'react';
import { DashboardHeader } from './DashboardHeader';
import { DashboardSidebar } from './DashboardSidebar';
import { Brain, Workflow, Plus, Clock, ArrowRight, Trash2, Copy, Download, X, Sparkles, AlertCircle, Sun, Moon, Check, Edit2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import workflowService from '../../lib/workflowService';
import { Workflow as WorkflowType } from '../../types/workflow';
import { useTheme } from '../../utils/themeProvider';
import { useFlowStore } from '../../store/flowStore';

// Create Workflow Modal Component
const CreateWorkflowModal = ({ isOpen, onClose, onSubmit, existingWorkflows }: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSubmit: (name: string) => void;
  existingWorkflows: WorkflowType[];
}) => {
  const [workflowName, setWorkflowName] = useState('');
  const { theme } = useTheme();
  const isLight = theme === 'light';

  // Generate a default unique name when modal opens
  useEffect(() => {
    if (isOpen && !workflowName) {
      const existingNames = existingWorkflows.map(w => w.name.toLowerCase());
      let counter = 1;
      let defaultName = 'My Workflow';
      
      while (existingNames.includes(defaultName.toLowerCase())) {
        defaultName = `My Workflow ${counter}`;
        counter++;
      }
      
      setWorkflowName(defaultName);
    }
  }, [isOpen, existingWorkflows, workflowName]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setWorkflowName('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-lg flex items-center justify-center z-50">
      <div className={`${isLight ? 'bg-theme-white border-theme-light' : 'bg-theme-dark border-theme-medium-dark'} rounded-xl p-6 w-full max-w-md shadow-2xl border`}>
        <div className="flex justify-between items-center mb-5">
          <h3 className={`text-xl font-semibold ${isLight ? 'text-theme-dark' : 'text-theme-white'} flex items-center`}>
            <Sparkles className={`w-5 h-5 mr-2 ${isLight ? 'text-theme-medium' : 'text-theme-medium'}`} />
            Create New Workflow
          </h3>
          <button 
            onClick={onClose} 
            className={`${isLight ? 'text-theme-medium-dark hover:text-theme-dark hover:bg-theme-light' : 'text-theme-light hover:text-theme-white hover:bg-theme-medium-dark'} transition-colors p-1 rounded-full`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={(e) => {
          e.preventDefault();
          if (workflowName.trim()) {
            onSubmit(workflowName);
            setWorkflowName('');
          }
        }}>
          <div className="mb-5">
            <label className={`block text-sm font-medium ${isLight ? 'text-theme-medium-dark' : 'text-theme-light'} mb-2`}>
              Workflow Name
            </label>
            <input
              type="text"
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              placeholder="e.g., Customer Support Bot"
              className={`w-full px-4 py-3 ${
                isLight 
                  ? 'bg-theme-white border-theme-light text-theme-dark placeholder-theme-medium-dark/50 focus:ring-theme-medium' 
                  : 'bg-theme-dark/80 border-theme-medium-dark text-theme-white placeholder-theme-light/50 focus:ring-theme-medium'
              } rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all border`}
              autoFocus
            />
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 ${
                isLight 
                  ? 'bg-theme-light hover:bg-theme-light/80 text-theme-medium-dark border-theme-light' 
                  : 'bg-theme-dark hover:bg-theme-dark/80 text-theme-light border-theme-medium-dark'
              } rounded-lg transition-colors border`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!workflowName.trim()}
              className={`px-5 py-2 ${
                isLight 
                  ? 'bg-theme-medium text-theme-white hover:bg-theme-medium-dark' 
                  : 'bg-theme-medium text-theme-white hover:bg-theme-medium-dark'
              } rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex items-center`}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Extracted WorkflowCard component to fix hooks error
interface WorkflowCardProps {
  workflow: WorkflowType;
  onDelete: (id: string) => Promise<void>;
  onClone: (id: string) => Promise<void>;
  onExport: (id: string) => Promise<void>;
  onRename: (id: string, newName: string) => Promise<void>;
}

const WorkflowCard: React.FC<WorkflowCardProps> = ({ 
  workflow, 
  onDelete, 
  onClone, 
  onExport, 
  onRename 
}) => {
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(workflow.name);
  const [isRenameSaving, setIsRenameSaving] = useState(false);
  const renameInputRef = useRef<HTMLInputElement>(null);
  const { theme } = useTheme();
  const isLight = theme === 'light';

  useEffect(() => {
    if (isRenaming && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [isRenaming]);

  const handleRename = async () => {
    if (newName.trim() === '' || newName === workflow.name) {
      setIsRenaming(false);
      setNewName(workflow.name);
      return;
    }

    setIsRenameSaving(true);
    try {
      await onRename(workflow.id, newName.trim());
      setIsRenaming(false);
    } catch (err) {
      console.error('Error in rename handler:', err);
    } finally {
      setIsRenameSaving(false);
    }
  };

  return (
    <div 
      className={`group ${
        isLight 
          ? 'bg-theme-white backdrop-blur-lg border-theme-light hover:shadow-lg hover:shadow-theme-light/50 hover:border-theme-medium/40' 
          : 'bg-theme-dark/60 backdrop-blur-lg border-theme-medium-dark hover:shadow-lg hover:shadow-theme-medium/10 hover:border-theme-medium/40'
      } rounded-xl overflow-hidden transition-all duration-300 hover:translate-y-[-2px] border`}
    >
      {/* Card Header */}
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex-grow">
            {isRenaming ? (
              <div className="flex items-center">
                <input 
                  ref={renameInputRef}
                  type="text" 
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleRename();
                    } else if (e.key === 'Escape') {
                      setIsRenaming(false);
                      setNewName(workflow.name);
                    }
                  }}
                  className={`flex-grow text-lg font-medium ${
                    isLight 
                      ? 'bg-theme-light/30 text-theme-dark border-theme-light focus:border-theme-medium' 
                      : 'bg-theme-medium-dark/20 text-theme-white border-theme-medium-dark/50 focus:border-theme-medium'
                  } rounded-md px-3 py-1 border focus:outline-none focus:ring-1 focus:ring-theme-medium`}
                  placeholder="Workflow name"
                  disabled={isRenameSaving}
                />
                <div className="flex ml-2">
                  <button
                    onClick={handleRename}
                    disabled={isRenameSaving}
                    className={`p-1.5 ${
                      isLight 
                        ? 'bg-theme-medium text-white hover:bg-theme-medium-dark' 
                        : 'bg-theme-medium text-white hover:bg-theme-medium-dark'
                    } rounded-md transition-colors mr-1`}
                    title="Save"
                  >
                    {isRenameSaving ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Check className="w-5 h-5" />
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setIsRenaming(false);
                      setNewName(workflow.name);
                    }}
                    disabled={isRenameSaving}
                    className={`p-1.5 ${
                      isLight 
                        ? 'bg-theme-light hover:bg-theme-light/80 text-theme-medium-dark' 
                        : 'bg-theme-dark/80 hover:bg-theme-medium-dark/30 text-theme-light'
                    } rounded-md transition-colors`}
                    title="Cancel"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ) : (
              <h3 className={`text-lg font-medium ${
                isLight 
                  ? 'text-theme-dark group-hover:text-theme-medium' 
                  : 'text-theme-white group-hover:text-theme-medium'
              } transition-colors`}>{workflow.name}</h3>
            )}
            <p className={`text-xs ${isLight ? 'text-theme-medium-dark' : 'text-theme-light'} mt-1 flex items-center`}>
              <Clock className={`w-3 h-3 mr-1 ${isLight ? 'text-theme-medium-dark' : 'text-theme-light'}`} />
              Modified {new Date(workflow.lastModified).toLocaleDateString()}
            </p>
          </div>
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center ${
            workflow.status === 'active' 
              ? isLight ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              : isLight ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
          } border`}>
            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
              workflow.status === 'active' 
                ? isLight ? 'bg-emerald-500' : 'bg-emerald-400' 
                : isLight ? 'bg-amber-500' : 'bg-amber-400'
            }`}></span>
            {workflow.status === 'active' ? 'Active' : 'Draft'}
          </span>
        </div>
      </div>
      
      {/* Card Body */}
      <div className="px-5 pb-3">
        {/* Progress bar for active workflows */}
        {workflow.status === 'active' && (
          <div className={`w-full h-1 ${isLight ? 'bg-theme-light' : 'bg-theme-dark'} rounded-full mb-4 overflow-hidden`}>
            <div 
              className={`h-full ${
                isLight 
                  ? 'bg-gradient-to-r from-theme-medium to-theme-medium-dark' 
                  : 'bg-gradient-to-r from-theme-medium to-theme-medium-dark'
              } rounded-full`}
              style={{ width: '70%' }}
            ></div>
          </div>
        )}
      </div>
      
      {/* Card Footer */}
      <div className={`flex items-center justify-between px-5 py-4 border-t ${isLight ? 'border-theme-light' : 'border-theme-medium-dark/50'}`}>
        <div className="flex items-center space-x-2.5">
          <Link
            to={`/workflow/edit/${workflow.id}`}
            className={`flex items-center px-3 py-1.5 ${
              isLight 
                ? 'bg-theme-medium text-white hover:bg-theme-medium-dark' 
                : 'bg-theme-medium text-white hover:bg-theme-medium-dark'
            } rounded-md text-xs font-medium transition-colors`}
          >
            <ArrowRight className="w-3.5 h-3.5 mr-1.5" />
            Open
          </Link>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setIsRenaming(true)}
            className={`p-1.5 ${
              isLight 
                ? 'text-theme-medium-dark hover:text-theme-medium hover:bg-theme-light/70' 
                : 'text-theme-light hover:text-theme-white hover:bg-theme-medium-dark/30'
            } rounded-md transition-colors`}
            title="Rename"
          >
            <Edit2 className="w-4 h-4" />
          </button>

          <button
            onClick={() => onClone(workflow.id)}
            className={`p-1.5 ${
              isLight 
                ? 'text-theme-medium-dark hover:text-theme-medium hover:bg-theme-light/70' 
                : 'text-theme-light hover:text-theme-white hover:bg-theme-medium-dark/30'
            } rounded-md transition-colors`}
            title="Clone Workflow"
          >
            <Copy className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => onExport(workflow.id)}
            className={`p-1.5 ${
              isLight 
                ? 'text-theme-medium-dark hover:text-theme-medium hover:bg-theme-light/70' 
                : 'text-theme-light hover:text-theme-white hover:bg-theme-medium-dark/30'
            } rounded-md transition-colors`}
            title="Export Workflow"
          >
            <Download className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => onDelete(workflow.id)}
            className={`p-1.5 ${
              isLight 
                ? 'text-red-400 hover:text-red-500 hover:bg-red-50' 
                : 'text-rose-400 hover:text-rose-300 hover:bg-rose-500/10'
            } rounded-md transition-colors`}
            title="Delete Workflow"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export const Dashboard = () => {
  const navigate = useNavigate();
  const [savedWorkflows, setSavedWorkflows] = useState<WorkflowType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const isLight = theme === 'light';

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const fetchWorkflows = async () => {
    try {
      setIsLoading(true);
      const workflows = await workflowService.getWorkflows();
      setSavedWorkflows(workflows);
    } catch (err) {
      setError('Failed to fetch workflows');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteWorkflow = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this workflow?')) {
      try {
        await workflowService.deleteWorkflow(id);
        setSavedWorkflows(workflows => workflows.filter(w => w.id !== id));
      } catch (err) {
        setError('Failed to delete workflow');
        console.error(err);
      }
    }
  };

  const cloneWorkflow = async (id: string) => {
    try {
      const clonedWorkflow = await workflowService.cloneWorkflow(id);
      setSavedWorkflows(workflows => [...workflows, clonedWorkflow]);
    } catch (err) {
      setError('Failed to clone workflow');
      console.error(err);
    }
  };

  const exportWorkflow = async (id: string) => {
    try {
      const workflowData = await workflowService.exportWorkflow(id);
      const blob = new Blob([JSON.stringify(workflowData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `workflow-${id}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to export workflow');
      console.error(err);
    }
  };

  const handleRenameWorkflow = async (id: string, newName: string) => {
    try {
      // Fetch the current workflow to get its nodes and edges
      const currentWorkflow = await workflowService.getWorkflow(id);
      
      // Prepare the update with just the name change
      const updateData = {
        name: newName,
        nodes: currentWorkflow.nodes || [],
        edges: currentWorkflow.edges || [],
        status: currentWorkflow.status || 'draft'
      };
      
      // Update the workflow
      await workflowService.updateWorkflow(id, updateData);
      
      // Update the local state
      setSavedWorkflows(workflows => 
        workflows.map(w => w.id === id ? { ...w, name: newName } : w)
      );
    } catch (err) {
      console.error('Error renaming workflow:', err);
      setError('Failed to rename workflow');
      throw err; // Rethrow to let the component handle the error
    }
  };

  const handleCreateWorkflow = async (name: string) => {
    try {
      console.log('Creating new workflow with name:', name);
      
      // Ensure the name is unique by checking existing workflows
      let uniqueName = name.trim();
      if (!uniqueName) {
        uniqueName = 'Untitled Workflow';
      }
      
      // Check if name already exists and append number if needed
      const existingNames = savedWorkflows.map(w => w.name.toLowerCase());
      let counter = 1;
      let finalName = uniqueName;
      
      while (existingNames.includes(finalName.toLowerCase())) {
        finalName = `${uniqueName} (${counter})`;
        counter++;
      }
      
      console.log('Final unique workflow name:', finalName);
      
      // Make sure we're creating a completely empty workflow
      const newWorkflowData = {
        name: finalName,
        description: '', // Add a default empty description
        status: 'draft' as 'draft' | 'active', // Fix type to match WorkflowCreate
        nodes: [], // Explicitly empty nodes array
        edges: []  // Explicitly empty edges array
      };
      
      // Create the workflow
      const newWorkflow = await workflowService.createWorkflow(newWorkflowData);
      console.log('New workflow created:', newWorkflow.id, 'with name:', newWorkflow.name);
      
      // Add to local state immediately for better UX
      setSavedWorkflows(workflows => [...workflows, newWorkflow]);
      
      // Close the modal
      setIsModalOpen(false);
      
      // Clear any existing workflow state before navigating
      useFlowStore.getState().clearWorkflow(false); // Reset for completely new workflow
      
      // Set the new workflow name in the store immediately
      useFlowStore.getState().setWorkflowName(newWorkflow.name);
      useFlowStore.getState().setWorkflowId(newWorkflow.id);
      
      // Navigate to the workflow editor with the new workflow ID
      navigate(`/workflow/edit/${newWorkflow.id}`);
    } catch (err) {
      setError('Failed to create workflow');
      console.error('Error creating workflow:', err);
    }
  };

  return (
    <div className={`flex h-screen ${
      isLight 
        ? 'bg-theme-white text-theme-dark' 
        : 'bg-theme-dark text-theme-white'
    } overflow-hidden`}>
      <DashboardSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto">
          <div className="p-8 max-w-7xl mx-auto">
            {/* Dashboard Header Section */}
            <div className="mb-10 flex items-center justify-between">
              <div>
                <h1 className={`text-3xl font-bold ${
                  isLight 
                    ? 'text-theme-dark' 
                    : 'text-theme-white'
                }`}>
                  Welcome back, Sanskar
                </h1>
                <p className={`${isLight ? 'text-theme-medium-dark' : 'text-theme-light'} mt-2`}>Manage and monitor your AI workflows</p>
              </div>
              <div className="flex space-x-4">
                <button 
                  onClick={toggleTheme}
                  className={`p-2.5 rounded-lg ${
                    isLight 
                      ? 'bg-theme-light text-theme-medium-dark hover:text-theme-medium' 
                      : 'bg-theme-medium-dark/30 text-theme-light hover:text-theme-white'
                  } transition-colors`}
                  title={isLight ? "Switch to Dark Mode" : "Switch to Light Mode"}
                >
                  {isLight ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                </button>
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className={`px-4 py-2.5 ${
                    isLight 
                      ? 'bg-theme-medium hover:bg-theme-medium-dark text-theme-white' 
                      : 'bg-theme-medium hover:bg-theme-medium-dark text-theme-white'
                  } rounded-lg shadow-md transition-colors flex items-center`}
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  New Workflow
                </button>
              </div>
            </div>
            
            {/* Workflow Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedWorkflows.map(workflow => (
                <WorkflowCard 
                  key={workflow.id}
                  workflow={workflow}
                  onDelete={deleteWorkflow}
                  onClone={cloneWorkflow}
                  onExport={exportWorkflow}
                  onRename={handleRenameWorkflow}
                />
              ))}
            </div>
            
            {/* Empty State */}
            {!isLoading && savedWorkflows.length === 0 && (
              <div className={`mt-12 text-center p-10 ${
                isLight 
                  ? 'bg-theme-light border-theme-light' 
                  : 'bg-theme-dark/60 border-theme-medium-dark/50'
              } rounded-xl border border-dashed`}>
                <div className={`w-16 h-16 mx-auto rounded-full ${
                  isLight 
                    ? 'bg-theme-light' 
                    : 'bg-theme-medium-dark/30'
                } flex items-center justify-center mb-4`}>
                  <Workflow className={`w-8 h-8 ${isLight ? 'text-theme-medium' : 'text-theme-medium'}`} />
                </div>
                <h2 className={`text-xl font-semibold ${isLight ? 'text-theme-dark' : 'text-theme-white'} mb-2`}>
                  No workflows yet
                </h2>
                <p className={`${isLight ? 'text-theme-medium-dark' : 'text-theme-light'} mb-6 max-w-md mx-auto`}>
                  Create your first workflow to start automating your tasks and processes.
                </p>
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className={`px-5 py-2.5 ${
                    isLight 
                      ? 'bg-theme-medium hover:bg-theme-medium-dark text-theme-white' 
                      : 'bg-theme-medium hover:bg-theme-medium-dark text-theme-white'
                  } rounded-lg shadow-md transition-colors flex items-center mx-auto`}
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  Create Workflow
                </button>
              </div>
            )}
            
            {/* Loading state */}
            {isLoading && (
              <div className="flex justify-center items-center mt-12">
                <div className={`w-12 h-12 rounded-full border-2 ${
                  isLight 
                    ? 'border-t-theme-medium border-theme-light' 
                    : 'border-t-theme-medium border-theme-medium-dark/30'
                } animate-spin`}></div>
              </div>
            )}
            
            {/* Error state */}
            {error && (
              <div className={`mt-8 p-4 ${
                isLight 
                  ? 'bg-rose-50 border-rose-200 text-rose-700' 
                  : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
              } rounded-lg border flex items-center`}>
                <AlertCircle className="w-5 h-5 mr-2" />
                {error}
              </div>
            )}
            
            {/* Create workflow modal */}
            <CreateWorkflowModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              onSubmit={handleCreateWorkflow}
              existingWorkflows={savedWorkflows}
            />
          </div>
        </main>
      </div>
    </div>
  );
};