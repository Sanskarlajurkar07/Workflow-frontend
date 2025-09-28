// Simple debugging utilities

/**
 * Logs detailed API error information
 * @param message Custom message to prepend
 * @param error The caught error object
 */
export const logApiError = (message: string, error: any): void => {
  console.error(`${message}:`, error);
  
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    console.error('Response data:', error.response.data);
    console.error('Response status:', error.response.status);
    console.error('Response headers:', error.response.headers);
  } else if (error.request) {
    // The request was made but no response was received
    console.error('No response received:', error.request);
  } else {
    // Something happened in setting up the request that triggered an Error
    console.error('Request setup error:', error.message);
  }
  
  if (error.config) {
    console.error('Request config:', {
      url: error.config.url,
      method: error.config.method,
      headers: error.config.headers,
      data: error.config.data,
    });
  }
};

/**
 * Validates a workflow object against expected schema
 * @param workflow The workflow object to validate
 * @returns Array of validation errors, empty if valid
 */
export const validateWorkflow = (workflow: any): string[] => {
  const errors: string[] = [];
  
  if (!workflow) {
    errors.push('Workflow is undefined or null');
    return errors;
  }
  
  // Check required fields
  if (!workflow.name) errors.push('Missing required field: name');
  
  if (!Array.isArray(workflow.nodes)) {
    errors.push('Missing or invalid nodes array');
  }
  
  if (!Array.isArray(workflow.edges)) {
    errors.push('Missing or invalid edges array');
  }
  
  // Check nodes structure if present
  if (Array.isArray(workflow.nodes)) {
    workflow.nodes.forEach((node, index) => {
      if (!node.id) errors.push(`Node ${index} missing id`);
      if (!node.type) errors.push(`Node ${index} missing type`);
      if (!node.position || typeof node.position !== 'object') {
        errors.push(`Node ${index} missing or invalid position`);
      }
    });
  }
  
  // Check edges structure if present
  if (Array.isArray(workflow.edges)) {
    workflow.edges.forEach((edge, index) => {
      if (!edge.id) errors.push(`Edge ${index} missing id`);
      if (!edge.source) errors.push(`Edge ${index} missing source`);
      if (!edge.target) errors.push(`Edge ${index} missing target`);
    });
  }
  
  return errors;
};

export default {
  logApiError,
  validateWorkflow
}; 