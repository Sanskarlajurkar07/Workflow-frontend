import React, { useState, useEffect } from 'react';
import { DashboardSidebar } from '../dashboard/DashboardSidebar';
import { DashboardHeader } from '../dashboard/DashboardHeader';
import { Workflow, Play, Edit2, Copy, Trash2, Clock, Activity, Plus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import workflowService from '../../lib/workflowService';
import { Workflow as WorkflowType } from '../../types/workflow';
import toast from 'react-hot-toast';

interface WorkflowCardProps {
  workflow: WorkflowType;
  onExecute: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onClone: (id: string) => void;
}

const WorkflowCard: React.FC<WorkflowCardProps> = ({ 
  workflow, 
  onExecute, 
  onEdit, 
  onDelete, 
  onClone 
}) => {
  const [isExecuting, setIsExecuting] = useState(false);

  const handleExecute = async () => {
    setIsExecuting(true);
    try {
      await onExecute(workflow.id);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg mr-3">
            <Workflow className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {workflow.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Last modified: {new Date(workflow.lastModified).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 text-xs rounded-full ${
            workflow.status === 'active' 
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
          }`}>
            {workflow.status === 'active' ? 'Ready' : 'Draft'}
          </span>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-gray-600 dark:text-gray-300 text-sm">
          {workflow.description || 'No description provided'}
        </p>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center">
            <Activity className="w-4 h-4 mr-1" />
            {workflow.nodes?.length || 0} nodes
          </div>
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            Recent
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleExecute}
            disabled={isExecuting || workflow.status !== 'active'}
            className="flex items-center px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition-colors text-sm"
          >
            <Play className="w-4 h-4 mr-1" />
            {isExecuting ? 'Running...' : 'Execute'}
          </button>
          
          <button
            onClick={() => onEdit(workflow.id)}
            className="p-2 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => onClone(workflow.id)}
            className="p-2 text-gray-600 hover:text-orange-600 dark:text-gray-400 dark:hover:text-orange-400 transition-colors"
          >
            <Copy className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => onDelete(workflow.id)}
            className="p-2 text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export const WorkflowsPage: React.FC = () => {
  const [workflows, setWorkflows] = useState<WorkflowType[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'draft'>('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const fetchWorkflows = async () => {
    try {
      setLoading(true);
      const data = await workflowService.getWorkflows();
      setWorkflows(data);
    } catch (error) {
      console.error('Failed to fetch workflows:', error);
      toast.error('Failed to fetch workflows');
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteWorkflow = async (id: string) => {
    try {
      await workflowService.executeWorkflow(id, {}, 'standard');
      toast.success('Workflow executed successfully');
      fetchWorkflows(); // Refresh to update execution count
    } catch (error) {
      console.error('Failed to execute workflow:', error);
      toast.error('Failed to execute workflow');
    }
  };

  const handleEditWorkflow = (id: string) => {
    navigate(`/workflow/edit/${id}`);
  };

  const handleDeleteWorkflow = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this workflow?')) {
      try {
        await workflowService.deleteWorkflow(id);
        toast.success('Workflow deleted successfully');
        fetchWorkflows();
      } catch (error) {
        console.error('Failed to delete workflow:', error);
        toast.error('Failed to delete workflow');
      }
    }
  };

  const handleCloneWorkflow = async (id: string) => {
    try {
      await workflowService.cloneWorkflow(id);
      toast.success('Workflow cloned successfully');
      fetchWorkflows();
    } catch (error) {
      console.error('Failed to clone workflow:', error);
      toast.error('Failed to clone workflow');
    }
  };

  const filteredWorkflows = workflows.filter(workflow => {
    if (filter === 'all') return true;
    return workflow.status === filter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading workflows...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      <DashboardSidebar />
      
      <div className="flex-1 flex flex-col">
        <DashboardHeader />
        
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Workflows
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Manage and execute your saved workflows
                </p>
              </div>
              
              <Link
                to="/workflow/create"
                className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Workflow
              </Link>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center space-x-4 mb-6">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                All ({workflows.length})
              </button>
              <button
                onClick={() => setFilter('active')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filter === 'active'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                Active ({workflows.filter(w => w.status === 'active').length})
              </button>
              <button
                onClick={() => setFilter('draft')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filter === 'draft'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                Draft ({workflows.filter(w => w.status === 'draft').length})
              </button>
            </div>

            {/* Workflows Grid */}
            {filteredWorkflows.length === 0 ? (
              <div className="text-center py-12">
                <Workflow className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No workflows found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {filter === 'all' 
                    ? "You haven't created any workflows yet."
                    : `No ${filter} workflows found.`}
                </p>
                <Link
                  to="/workflow/create"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Workflow
                </Link>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredWorkflows.map((workflow) => (
                  <WorkflowCard
                    key={workflow.id}
                    workflow={workflow}
                    onExecute={handleExecuteWorkflow}
                    onEdit={handleEditWorkflow}
                    onDelete={handleDeleteWorkflow}
                    onClone={handleCloneWorkflow}
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