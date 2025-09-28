import React, { useState } from 'react';
import { Save, Download, AlertCircle, Play } from 'lucide-react';
import { useFlowStore } from '../../store/flowStore';
import { useNavigate } from 'react-router-dom';

interface WorkflowState {
  isDeployed: boolean;
  hasChanges: boolean;
  lastDeployedAt?: Date;
}

export const Toolbar: React.FC = () => {
  const navigate = useNavigate();
  const [workflowName, setWorkflowName] = useState('');
  const [showNamePrompt, setShowNamePrompt] = useState(true);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showDeployModal, setShowDeployModal] = useState(false);
  const { nodes, edges, saveWorkflow, setSaveStatus } = useFlowStore();
  const [saveStatus, setSaveStatusLocal] = useState<'saved' | 'saving' | 'unsaved'>('unsaved');
  const [workflowState, setWorkflowState] = useState<WorkflowState>({
    isDeployed: false,
    hasChanges: false
  });

  const handleNameSubmit = async (name: string) => {
    setWorkflowName(name);
    setShowNamePrompt(false);
    setSaveStatusLocal('saving');
    
    try {
      await saveWorkflow({
        name: name,
        nodes: nodes,
        edges: edges,
        status: 'draft'
      });
      
      setSaveStatusLocal('saved');
      setWorkflowState(prev => ({...prev, hasChanges: false}));
      navigate(`/workflow/edit/${name.toLowerCase().replace(/\s+/g, '-')}`);
    } catch (error) {
      setSaveStatusLocal('unsaved');
      console.error('Failed to save workflow:', error);
    }
  };

  const handleSave = async () => {
    if (!workflowName) {
      setShowNamePrompt(true);
      return;
    }
    
    setSaveStatusLocal('saving');
    try {
      await saveWorkflow({
        name: workflowName,
        nodes: nodes,
        edges: edges,
        status: 'draft'
      });
      setSaveStatusLocal('saved');
      setWorkflowState(prev => ({...prev, hasChanges: false}));
    } catch (error) {
      setSaveStatusLocal('unsaved');
      console.error('Failed to save workflow:', error);
    }
  };

  const handleDeploy = async () => {
    try {
      setWorkflowState(prev => ({
        ...prev,
        isDeployed: true,
        hasChanges: false,
        lastDeployedAt: new Date()
      }));
      // Implement actual deployment logic here
      console.log('Workflow deployed successfully');
    } catch (error) {
      console.error('Deployment failed:', error);
    }
  };

  const handleExport = () => {
    if (!workflowState.isDeployed || workflowState.hasChanges) {
      setShowDeployModal(true);
      return;
    }

    const workflow = {
      name: workflowName,
      nodes,
      edges,
      exportedAt: new Date().toISOString(),
      version: "1.0.0"
    };
    
    const blob = new Blob([JSON.stringify(workflow, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${workflowName.toLowerCase().replace(/\s+/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-white">
        <div className="flex items-center space-x-4">
          {workflowName ? (
            <input
              type="text"
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              className="text-lg font-semibold text-gray-900 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-2 py-1"
            />
          ) : (
            <span className="text-lg font-semibold text-gray-400">Untitled Workflow</span>
          )}
          <span className="text-sm text-gray-500">
            {saveStatus === 'saving' ? 'Saving...' : 
             saveStatus === 'saved' ? 'All changes saved' : 
             'Unsaved changes'}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Workflow</span>
          </button>

          <button
            onClick={handleExport}
            className={`p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md ${
              (!workflowState.isDeployed || workflowState.hasChanges) ? 'opacity-50' : ''
            }`}
            title={
              !workflowState.isDeployed 
                ? "Deploy required before export" 
                : workflowState.hasChanges 
                  ? "Deploy changes before export"
                  : "Export Workflow"
            }
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={handleDeploy}
            className={`px-4 py-1.5 text-sm font-medium rounded-md flex items-center space-x-1.5 ${
              workflowState.hasChanges
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            <Play className="w-4 h-4" />
            <span>{workflowState.isDeployed ? 'Update Deployment' : 'Deploy Workflow'}</span>
          </button>
        </div>
      </div>

      {/* Name Prompt Modal */}
      {showNamePrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Name Your Workflow</h3>
            <input
              type="text"
              placeholder="Enter workflow name"
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => handleNameSubmit(workflowName || 'Untitled Workflow')}
                disabled={!workflowName.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deploy Modal */}
      {showDeployModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center space-x-2 text-amber-600 mb-4">
              <AlertCircle className="w-5 h-5" />
              <h3 className="text-lg font-semibold">Deploy Required</h3>
            </div>
            <p className="text-gray-600 mb-6">
              You have pending changes that need to be deployed before exporting. Deploy your changes first to create an exportable version of this workflow.
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
                  handleDeploy();
                  setShowDeployModal(false);
                }}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Deploy Now
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};