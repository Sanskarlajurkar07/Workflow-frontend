import api from './axios';
import { Workflow, WorkflowCreate, WorkflowUpdate } from '../types/workflow';
import axios from 'axios';

export const workflowService = {
  // Get all workflows
  getWorkflows: async (): Promise<Workflow[]> => {
    try {
      const response = await api.get('/workflows');
      return response.data;
    } catch (error: unknown) {
      console.error('Error fetching workflows:', error);
      if (axios.isAxiosError(error)) {
        throw new Error(`Failed to fetch workflows: ${error.response?.data?.detail || error.message}`);
      }
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch workflows');
    }
  },

  // Get a single workflow
  getWorkflow: async (id: string): Promise<Workflow> => {
    try {
      const response = await api.get(`/workflows/${id}`);
      
      // Validate response data
      if (!response.data || typeof response.data !== 'object') {
        throw new Error('Invalid workflow response format');
      }

      // Ensure required fields exist
      if (!response.data.name) {
        console.warn(`Workflow ${id} missing name, using default`);
        response.data.name = 'Untitled Workflow';
      }

      // Ensure nodes and edges are arrays
      if (!Array.isArray(response.data.nodes)) {
        console.warn(`Workflow ${id} nodes not an array, defaulting to empty array`);
        response.data.nodes = [];
      }

      if (!Array.isArray(response.data.edges)) {
        console.warn(`Workflow ${id} edges not an array, defaulting to empty array`);
        response.data.edges = [];
      }

      return response.data;
    } catch (error: unknown) {
      console.error(`Error fetching workflow ${id}:`, error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          throw new Error(`Workflow ${id} not found`);
        }
        throw new Error(`Failed to load workflow: ${error.response?.data?.detail || error.message}`);
      }
      throw error;
    }
  },

  // Create a new workflow
  createWorkflow: async (workflowData: WorkflowCreate): Promise<Workflow> => {
    // Validate and sanitize workflow name
    if (!workflowData.name || workflowData.name.trim() === '') {
      workflowData.name = 'Untitled Workflow';
    }
    
    // Trim and ensure name is not too long
    workflowData.name = workflowData.name.trim().slice(0, 100);
    
    try {
      const response = await api.post<Workflow>('/workflows', workflowData);
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error('Error creating workflow:', error.response?.data);
      } else {
        console.error('Unexpected error creating workflow:', error);
      }
      throw error;
    }
  },

  // Update a workflow
  updateWorkflow: async (id: string, workflowData: WorkflowUpdate): Promise<Workflow> => {
    // Validate and sanitize workflow name
    if (!workflowData.name || workflowData.name.trim() === '') {
      throw new Error('Workflow name cannot be empty');
    }
    
    // Trim and ensure name is not too long
    workflowData.name = workflowData.name.trim().slice(0, 100);
    
    try {
      const response = await api.put<Workflow>(`/workflows/${id}`, workflowData);
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error(`Error updating workflow ${id}:`, error.response?.data);
      } else {
        console.error(`Unexpected error updating workflow ${id}:`, error);
      }
      throw error;
    }
  },

  // Delete a workflow
  deleteWorkflow: async (id: string): Promise<void> => {
    try {
      await api.delete(`/workflows/${id}`);
    } catch (error: unknown) {
      console.error(`Error deleting workflow ${id}:`, error);
      if (axios.isAxiosError(error)) {
        throw new Error(`Failed to delete workflow: ${error.response?.data?.detail || error.message}`);
      }
      throw new Error(error instanceof Error ? error.message : 'Failed to delete workflow');
    }
  },

  // Clone a workflow
  cloneWorkflow: async (id: string): Promise<Workflow> => {
    try {
      const response = await api.post(`/workflows/${id}/clone`);
      return response.data;
    } catch (error: unknown) {
      console.error(`Error cloning workflow ${id}:`, error);
      if (axios.isAxiosError(error)) {
        throw new Error(`Failed to clone workflow: ${error.response?.data?.detail || error.message}`);
      }
      throw new Error(error instanceof Error ? error.message : 'Failed to clone workflow');
    }
  },

  // Export a workflow
  exportWorkflow: async (id: string): Promise<any> => {
    try {
      const response = await api.get(`/workflows/${id}/export`);
      return response.data;
    } catch (error: unknown) {
      console.error(`Error exporting workflow ${id}:`, error);
      if (axios.isAxiosError(error)) {
        throw new Error(`Failed to export workflow: ${error.response?.data?.detail || error.message}`);
      }
      throw new Error(error instanceof Error ? error.message : 'Failed to export workflow');
    }
  },
  
  // Execute a workflow
  executeWorkflow: async (id: string, inputs: Record<string, any>, mode: string = 'standard'): Promise<any> => {
    try {
      console.log('Executing workflow with inputs:', inputs);
      
      // Format inputs for API
      const formattedInputs: Record<string, any> = {};
      let hasFiles = false;
      
      for (const [key, inputValue] of Object.entries(inputs)) {
        // Check if we're dealing with a file
        if (inputValue.value instanceof File) {
          hasFiles = true;
        }
        
        // Store formatted input
        formattedInputs[key] = {
          value: inputValue.value,
          type: inputValue.type || 'Text'
        };
        
        // Debug log to help identify input value issues
        console.log(`Formatted input ${key}: type=${inputValue.type}, value=`, 
          typeof inputValue.value === 'string' && inputValue.value.length > 100 
            ? `${inputValue.value.substring(0, 100)}...` 
            : inputValue.value);
      }
      
      let response;
      
      if (hasFiles) {
        // If we have files, use FormData to handle multipart/form-data
        const formData = new FormData();
        
        // Add workflow execution parameters
        formData.append('mode', mode);
        
        // Process each input
        for (const [key, input] of Object.entries(formattedInputs)) {
          if (input.value instanceof File) {
            // Add the file to form data
            formData.append(`file_${key}`, input.value);
            // Add file metadata
            formData.append(`${key}_type`, input.type);
          } else {
            // For non-file inputs, stringify the value
            formData.append(`${key}_value`, typeof input.value === 'object' 
              ? JSON.stringify(input.value) 
              : String(input.value));
            formData.append(`${key}_type`, input.type);
          }
        }
        
        // Send the form data
        response = await api.post(`/workflows/${id}/execute`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      } else {
        // Standard JSON request for non-file inputs
        response = await api.post(`/workflows/${id}/execute`, {
          inputs: formattedInputs,
          mode: mode
        });
      }
      
      const executionResult = response.data;
      
      // Log execution details
      console.log(`Workflow execution completed in ${executionResult.execution_time.toFixed(2)}s`);
      console.log(`Execution ID: ${executionResult.execution_id || 'Not available'}`);
      
      if (executionResult.status === 'error') {
        throw new Error(executionResult.error || 'Unknown error during workflow execution');
      }
      
      return executionResult;
    } catch (error: unknown) {
      console.error(`Error executing workflow ${id}:`, error);
      if (axios.isAxiosError(error) && error.response) {
        console.error('Response data:', error.response.data);
        console.error('Status:', error.response.status);
        throw new Error(`Workflow execution failed: ${error.response.data?.detail || error.message}`);
      }
      // If it's not an Axios error, throw a generic error
      throw new Error(error instanceof Error ? error.message : 'Unknown error during workflow execution');
    }
  },

  // Add the function to fix input types
  fixInputTypes: async function(workflowId: string): Promise<any> {
    try {
      const response = await api.post(`/workflows/${workflowId}/fix_input_types`);
      return response.data;
    } catch (error: unknown) {
      console.error('Error fixing input types:', error);
      if (axios.isAxiosError(error)) {
        throw new Error(`Failed to fix input types: ${error.response?.data?.detail || error.message}`);
      }
      throw new Error(error instanceof Error ? error.message : 'Failed to fix input types');
    }
  }
};

export default workflowService; 