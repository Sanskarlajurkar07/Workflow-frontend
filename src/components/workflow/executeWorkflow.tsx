import React, { useEffect, useState, useCallback, ReactNode } from 'react';
import { useFlowStore } from '../../store/flowStore';
import { Loader2, X, Maximize2, Download, Play, FileAudio, ImageIcon, Upload, Info, AlertTriangle, CheckCircle, ChevronRight, Settings, Pencil } from 'lucide-react';
import workflowService from '../../lib/workflowService';
import { toast } from 'react-hot-toast';

interface ExecuteWorkflowProps {
  onClose: () => void;
  workflowId?: string;
}

interface InputValue {
  value: any;
  type: string;
  nodeId?: string;
  nodeIndex?: string;
  isRequired?: boolean;
}

interface ExecutionStats {
  nodeId: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  executionTime?: number;
  startTime?: number;
}

const ExecuteWorkflow: React.FC<ExecuteWorkflowProps> = ({ onClose, workflowId: propWorkflowId }) => {
  const { nodes, edges, workflowId: storeWorkflowId } = useFlowStore();
  // Use the prop workflowId if provided, otherwise fall back to the one from the store
  const workflowId = propWorkflowId || storeWorkflowId;
  const [results, setResults] = useState<Record<string, any>>({});
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inputs, setInputs] = useState<Record<string, InputValue>>({});
  const [activeTab, setActiveTab] = useState<'standard' | 'chatbot' | 'voice'>('standard');
  const [isReadyToRun, setIsReadyToRun] = useState(false);
  const [executionStats, setExecutionStats] = useState<ExecutionStats[]>([]);
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [showHelp, setShowHelp] = useState(false);
  const [fixingTypes, setFixingTypes] = useState(false);
  const [showWorkflowOverview, setShowWorkflowOverview] = useState(false);
  const [editingInputName, setEditingInputName] = useState<string | null>(null);
  const [pendingNames, setPendingNames] = useState<Record<string, string>>({});

  // Listen for help toggle event from parent component
  useEffect(() => {
    const toggleHelp = () => setShowHelp(prev => !prev);
    document.addEventListener('toggle-execution-help', toggleHelp);
    
    return () => {
      document.removeEventListener('toggle-execution-help', toggleHelp);
    };
  }, []);

  // Create a map of nodes for quick lookup
  const nodesMap = React.useMemo(() => {
    return nodes.reduce((map, node) => {
      map[node.id] = node;
      return map;
    }, {} as Record<string, any>);
  }, [nodes]);

  // Get input and output nodes 
  const inputNodes = React.useMemo(() => {
    const allInputNodes = nodes.filter(node => node.type === 'input');
    
    // Check for duplicate node IDs and log them - helps with debugging
    const nodeIds = allInputNodes.map(node => node.id);
    const hasDuplicates = nodeIds.length !== new Set(nodeIds).size;
    
    if (hasDuplicates) {
      console.warn('Duplicate input node IDs detected:', 
        nodeIds.filter((id, index) => nodeIds.indexOf(id) !== index));
        
      // Filter to keep only the first occurrence of each node ID
      const uniqueNodes = [];
      const seenIds = new Set();
      
      for (const node of allInputNodes) {
        if (!seenIds.has(node.id)) {
          seenIds.add(node.id);
          uniqueNodes.push(node);
        } else {
          console.warn('Filtering out duplicate node with ID:', node.id);
        }
      }
      
      return uniqueNodes;
    }
    
    return allInputNodes;
  }, [nodes]);

  const outputNodes = React.useMemo(() => nodes.filter(node => node.type === 'output'), [nodes]);
  
  // Initialize inputs based on input nodes
  useEffect(() => {
    if (!inputNodes.length) return;
    
    console.log('Initializing inputs from nodes:', inputNodes);
    
    // Track existing inputs to preserve values when possible
    const existingInputs = { ...inputs };
    const initialInputs: Record<string, InputValue> = {};
    
    inputNodes.forEach((node, index) => {
      // Extract node index more safely
      const nodeIndex = node.id.split('-').length > 1 ? node.id.split('-')[1] : node.id;
      const inputId = `input_${nodeIndex}`;
      
      // Auto-detect type from node data, defaulting to Text
      let inputType = node.data?.params?.type || 'Text';
      
      // Validate input type - ensure it's one of the supported types
      const validTypes = ['Text', 'Image', 'Formatted Text', 'Audio', 'JSON', 'File'];
      if (!validTypes.includes(inputType)) {
        console.warn(`Invalid input type "${inputType}" for ${inputId}, defaulting to Text`);
        inputType = 'Text';
      }
      
      // Preserve existing value if the type hasn't changed
      const preserveValue = existingInputs[inputId] && 
        existingInputs[inputId].type === inputType ? 
        existingInputs[inputId].value : '';
      
      console.log(`Setting up input ${inputId} with type: ${inputType}, preserving value:`, 
        typeof preserveValue === 'string' && preserveValue.length > 50 ? 
        `${preserveValue.substring(0, 50)}...` : preserveValue);
      
      initialInputs[inputId] = {
        value: preserveValue,
        type: inputType,
        nodeId: node.id,
        nodeIndex: nodeIndex,
        isRequired: node.data?.params?.required === true
      };
    });
    
    // Important: completely replace inputs instead of merging
    setInputs(initialInputs);
    
    // Also initialize execution stats
    const initialStats = nodes.map(node => ({
      nodeId: node.id,
      status: 'pending' as const
    }));
    setExecutionStats(initialStats);
    
    // Check if ready to run based on workflow structure
    validateWorkflow();
  }, [inputNodes, nodes]);
  
  // Validate if the workflow is ready to run
  const validateWorkflow = useCallback(() => {
    // Basic validation - we need at least one input and one output node
    const hasInputs = inputNodes.length > 0;
    const hasOutputs = outputNodes.length > 0;
    const hasWorkflowId = !!workflowId;
    
    setIsReadyToRun(hasInputs && hasOutputs && hasWorkflowId);
  }, [inputNodes.length, outputNodes.length, workflowId]);

  // Validate input fields
  useEffect(() => {
    // Check if all required inputs have values
    const allInputsValid = inputNodes.every(node => {
      const inputId = `input_${node.id.split('-')[1]}`;
      const input = inputs[inputId];
      const isRequired = node.data?.params?.required === true;
      
      return !isRequired || (input && input.value !== undefined && input.value !== '');
    });
    
    // Update ready state
    setIsReadyToRun(previousState => previousState && allInputsValid);
  }, [inputs, inputNodes]);

  // Memoize handlers to prevent recreation on each render
  const handleInputChange = useCallback((inputId: string, value: any) => {
    console.log(`Changing input value for ${inputId} to:`, 
      typeof value === 'string' && value.length > 30 ? `${value.substring(0, 30)}...` : value);
    
    setInputs(prev => {
      if (!prev[inputId]) {
        console.warn(`Attempted to update non-existent input: ${inputId}`);
        return prev;
      }
      
      // Make sure we're only updating this specific input
      const inputNode = inputNodes.find(node => {
        const nodeIndex = node.id.split('-').length > 1 ? node.id.split('-')[1] : node.id;
        return `input_${nodeIndex}` === inputId;
      });
      
      if (!inputNode) {
        console.warn(`No corresponding input node found for ${inputId}`);
        return prev;
      }
      
      // Type-specific validation
      let validatedValue = value;
      const inputType = prev[inputId].type;
      
      // Validate based on input type
      if (inputType === 'JSON' && typeof value === 'string') {
        try {
          // Check if valid JSON if it's a string
          if (value.trim()) {
            JSON.parse(value);
          }
        } catch (e) {
          console.warn(`Invalid JSON entered for ${inputId}:`, e);
          // We still store the invalid JSON but could add an error state
        }
      }
      
      // Create a new object instead of mutating the previous state
      return {
        ...prev,
        [inputId]: {
          ...prev[inputId],
          value: validatedValue
        }
      };
    });
  }, [inputNodes]);

  const handleFileInput = useCallback(async (inputId: string, file: File) => {
    if (!inputs[inputId]) {
      console.warn(`Attempted to update non-existent input: ${inputId}`);
      return;
    }

    try {
      const inputType = inputs[inputId].type;
      let value;
      
      if (inputType === 'Image') {
        // Validate image file
        if (!file.type.startsWith('image/')) {
          toast.error(`File is not a valid image. Please upload an image file.`);
          return;
        }
        value = URL.createObjectURL(file);
      } else if (inputType === 'Audio') {
        // Validate audio file
        if (!file.type.startsWith('audio/')) {
          toast.error(`File is not a valid audio. Please upload an audio file.`);
          return;
        }
        value = URL.createObjectURL(file);
      } else {
        // For other file types
        value = file;
      }
      
      handleInputChange(inputId, value);
    } catch (error) {
      console.error(`Error processing file for ${inputId}:`, error);
      toast.error('Error processing file. Please try again.');
    }
  }, [inputs, handleInputChange]);

  const renderInputField = (inputId: string, input: InputValue) => {
    if (!input) return null;

    switch (input.type) {
      case 'Image':
        return (
          <div className="space-y-2">
            <div className="flex items-center justify-center w-full">
              {input.value ? (
                <div className="relative w-full aspect-video">
                  <img
                    src={input.value}
                    alt="Preview"
                    className="w-full h-full object-cover rounded-md"
                  />
                  <button
                    onClick={() => handleInputChange(inputId, '')}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <ImageIcon className="w-8 h-8 text-gray-400" />
                    <p className="text-sm text-gray-500">Click to upload image</p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => e.target.files && handleFileInput(inputId, e.target.files[0])}
                  />
                </label>
              )}
            </div>
          </div>
        );

      case 'Audio':
        return (
          <div className="space-y-2">
            <div className="flex items-center justify-center w-full">
              {input.value ? (
                <div className="w-full p-3 bg-gray-50 rounded-lg">
                  <audio controls className="w-full">
                    <source src={input.value} />
                  </audio>
                  <button
                    onClick={() => handleInputChange(inputId, '')}
                    className="mt-2 text-red-500 hover:text-red-600"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <FileAudio className="w-8 h-8 text-gray-400" />
                    <p className="text-sm text-gray-500">Click to upload audio</p>
                    <span className="text-xs text-gray-400 mt-1">{inputId}</span>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="audio/*"
                    onChange={(e) => e.target.files && handleFileInput(inputId, e.target.files[0])}
                  />
                </label>
              )}
            </div>
          </div>
        );

      case 'File':
        return (
          <div className="space-y-2">
            {input.value ? (
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                <span className="text-sm text-gray-600">{input.value.name}</span>
                <button
                  onClick={() => handleInputChange(inputId, '')}
                  className="text-red-500 hover:text-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                <div className="flex flex-col items-center justify-center">
                  <Upload className="w-8 h-8 text-gray-400" />
                  <p className="text-sm text-gray-500">Click to upload file</p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => e.target.files && handleFileInput(inputId, e.target.files[0])}
                />
              </label>
            )}
          </div>
        );

      default:
        return (
          <input
            type="text"
            value={input.value || ''}
            onChange={(e) => handleInputChange(inputId, e.target.value)}
            placeholder="Enter input..."
            className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm text-gray-900"
          />
        );
    }
  };

  // Helper function to validate inputs before execution
  const validateInputs = useCallback(() => {
    const errors: string[] = [];
    
    // Check all required inputs have values
    Object.entries(inputs).forEach(([inputId, input]) => {
      if (input.isRequired && (!input.value || (typeof input.value === 'string' && input.value.trim() === ''))) {
        errors.push(`${inputId} is required but has no value`);
      }
      
      // Type-specific validation
      if (input.type === 'JSON' && input.value && typeof input.value === 'string') {
        try {
          if (input.value.trim()) {
            JSON.parse(input.value);
          }
        } catch (e) {
          errors.push(`${inputId} contains invalid JSON`);
        }
      }
    });
    
    return errors;
  }, [inputs]);

  // Optimize inputs for network transmission
  const optimizeInputsForExecution = useCallback((inputData: Record<string, InputValue>) => {
    const optimized = { ...inputData };
    
    // Perform any needed transformations or optimizations on inputs
    // For example, convert large text inputs to more efficient formats
    
    return optimized;
  }, []);

  const runWorkflow = useCallback(async () => {
    if (!isReadyToRun || !workflowId) {
      console.log('Workflow not ready to run. Ready state:', isReadyToRun, 'Workflow ID:', workflowId);
      toast.error('Workflow is not ready to run. Please check inputs and save the workflow.');
      return;
    }
    
    // Validate inputs before execution
    const validationErrors = validateInputs();
    if (validationErrors.length > 0) {
      validationErrors.forEach(err => toast.error(err));
      return;
    }
    
    // Log workflow execution attempt
    console.log('Attempting to run workflow with ID:', workflowId);
    console.log('Inputs:', inputs);
    console.log('Mode:', activeTab);
    
    setIsRunning(true);
    setError(null);
    setResults({});
    setExecutionTime(null);
    setCurrentStep(0);
    
    // Reset execution stats to pending
    setExecutionStats(stats => 
      stats.map(stat => ({ ...stat, status: 'pending', startTime: undefined, executionTime: undefined }))
    );
    
    // Track execution start time for accurate timing
    const executionStartTime = performance.now();
    
    try {
      // Show loading toast with a unique ID
      const toastId = 'workflow-execution-' + Date.now();
      toast.loading('Preparing workflow execution...', { id: toastId });
      
      // Optimize inputs for network transfer
      const optimizedInputs = optimizeInputsForExecution(inputs);
      
      // Create a timeout for the workflow execution
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Workflow execution timed out after 60 seconds')), 60000);
      });
      
      // Call the workflow execution API with timeout
      const executionPromise = workflowService.executeWorkflow(
        workflowId,
        optimizedInputs,
        activeTab
      );
      
      // Race between execution and timeout
      const executionResult = await Promise.race([executionPromise, timeoutPromise]);
      
      console.log('Execution result:', executionResult);
      
      // Check for API-level errors
      if (executionResult.status === 'error') {
        throw new Error(executionResult.error || 'Unknown error during workflow execution');
      }
      
      // Update toast to show progress
      toast.loading('Processing execution results...', { id: toastId });
      
      // Process the execution path and update node stats
      if (executionResult.execution_path && executionResult.execution_path.length > 0) {
        // Mark nodes as complete in sequence with a delay to show progress
        const executionPath = executionResult.execution_path;
        for (let i = 0; i < executionPath.length; i++) {
          const nodeId = executionPath[i];
          
          // Check if this node had an error in node_results
          const nodeResult = executionResult.node_results?.[nodeId];
          const hasNodeError = nodeResult?.status === 'error';
          
          // Update current step for visualization
          setCurrentStep(i + 1);
          
          // Update the node status to running
          setExecutionStats(prev => 
            prev.map(stat => 
              stat.nodeId === nodeId 
                ? { ...stat, status: 'running', startTime: Date.now() } 
                : stat
            )
          );
          
          // Small delay to visualize progress - scale based on total nodes for better UX
          // Use a shorter delay for workflows with many nodes
          const delayMs = Math.min(300, Math.max(50, 1000 / executionPath.length));
          await new Promise(resolve => setTimeout(resolve, delayMs));
          
          // Update the node status to completed or error
          setExecutionStats(prev => 
            prev.map(stat => 
              stat.nodeId === nodeId 
                ? { 
                    ...stat, 
                    status: hasNodeError ? 'error' : 'completed', 
                    executionTime: stat.startTime ? (Date.now() - stat.startTime) / 1000 : undefined 
                  } 
                : stat
            )
          );
          
          // If there was an error in this node, show it and potentially stop visualization
          if (hasNodeError && nodeResult.error) {
            const nodeInfo = nodes.find(n => n.id === nodeId);
            const nodeName = nodeInfo?.data?.params?.nodeName || nodeId;
            
            toast.error(`Error in node "${nodeName}": ${nodeResult.error}`, { 
              id: `node-error-${nodeId}`,
              duration: 5000
            });
          }
        }
      } else {
        // No execution path, finished instantly
        console.warn('No execution path returned from backend');
        toast.success('Workflow executed with no processing steps', { id: toastId });
      }
      
      // Set results
      setResults(executionResult.outputs || {});
      
      // Calculate accurate execution time from our own measurement
      const clientExecutionTime = (performance.now() - executionStartTime) / 1000;
      // Use the server-reported time if available, otherwise use our measurement
      setExecutionTime(executionResult.execution_time || clientExecutionTime);
      
      // Success feedback
      toast.success('Workflow executed successfully', { id: toastId, duration: 3000 });
      
    } catch (e) {
      console.error('Error executing workflow:', e);
      const errorMessage = e instanceof Error ? e.message : String(e);
      
      // Set error state
      setError(errorMessage);
      
      // Mark all in-progress nodes as error
      setExecutionStats(stats => 
        stats.map(stat => 
          stat.status === 'running' 
            ? { ...stat, status: 'error' } 
            : stat
        )
      );
      
      // Error feedback
      toast.error(`Execution failed: ${errorMessage}`);
      
    } finally {
      setIsRunning(false);
    }
  }, [isReadyToRun, workflowId, validateInputs, inputs, activeTab, optimizeInputsForExecution, nodes]);

  // Function to fix input types
  const fixInputTypes = async () => {
    if (!workflowId) return;
    
    try {
      setFixingTypes(true);
      await workflowService.fixInputTypes(workflowId);
      toast.success("Input types fixed. Please refresh the workflow to see changes.");
    } catch (error) {
      console.error("Failed to fix input types:", error);
      toast.error("Failed to fix input types. Please check the console for details.");
    } finally {
      setFixingTypes(false);
    }
  };

  // Enhanced results display with better visualization and functionality
  const renderResults = () => {
    if (Object.keys(results).length === 0) return null;
    
    return (
      <div className="space-y-4 mt-6 rounded-lg border border-green-200 p-4 bg-green-50">
        <div className="flex items-center justify-between">
          <h4 className="text-md font-semibold text-green-800 flex items-center">
            <CheckCircle className="w-5 h-5 mr-2" />
            Workflow Results
            {executionTime && (
              <span className="ml-2 text-sm font-normal text-green-600">
                (completed in {executionTime.toFixed(2)}s)
              </span>
            )}
          </h4>
          
          {/* Export all results button */}
          <button
            onClick={exportAllResults}
            className="text-xs bg-green-600 hover:bg-green-700 text-white font-medium py-1.5 px-3 rounded transition-colors flex items-center"
          >
            <Download className="w-3 h-3 mr-1" />
            Export All Results
          </button>
        </div>
        
        <div className="space-y-6">
          {Object.entries(results).map(([key, result]) => {
            const output = result.output;
            const type = result.type;
            const nodeId = result.node_id || '';
            const nodeName = result.node_name || key.replace('output_', 'Output ');
            
            // Get node from the flow for additional context
            const node = nodeId ? nodesMap[nodeId] : null;
            
            // Generate a unique ID for this result
            const resultId = `result-${key}-${nodeId}`;
            
            return (
              <div key={resultId} className="bg-white rounded-lg border border-green-100 overflow-hidden shadow-sm">
                {/* Result header with metadata */}
                <div className="bg-green-50 px-4 py-3 border-b border-green-100 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <h5 className="text-sm font-medium text-green-800 flex items-center">
                      {nodeName}
                    </h5>
                    
                    {/* Output type badge */}
                    {(() => {
                      switch(type) {
                        case 'Text': 
                          return <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded">Text</span>;
                        case 'Image': 
                          return <span className="bg-purple-100 text-purple-800 text-xs px-2 py-0.5 rounded flex items-center">
                            <ImageIcon className="w-3 h-3 mr-1" />Image
                          </span>;
                        case 'Audio': 
                          return <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded flex items-center">
                            <FileAudio className="w-3 h-3 mr-1" />Audio
                          </span>;
                        case 'JSON': 
                          return <span className="bg-orange-100 text-orange-800 text-xs px-2 py-0.5 rounded">JSON</span>;
                        default: 
                          return <span className="bg-gray-100 text-gray-800 text-xs px-2 py-0.5 rounded">{type}</span>;
                      }
                    })()}
                    
                    {/* Output ID badge */}
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                      {key}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {/* Copy button */}
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(
                          typeof output === 'object' ? JSON.stringify(output) : String(output)
                        );
                        toast.success('Copied to clipboard');
                      }}
                      className="text-xs text-green-700 hover:text-green-800 bg-green-100 hover:bg-green-200 py-1 px-2.5 rounded transition-colors flex items-center"
                      title="Copy to clipboard"
                    >
                      <span>Copy</span>
                    </button>
                    
                    {/* Download button for non-visual outputs */}
                    {type !== 'Image' && type !== 'Audio' && (
                      <button
                        onClick={() => downloadOutput(key, output, type)}
                        className="text-xs text-green-700 hover:text-green-800 bg-green-100 hover:bg-green-200 py-1 px-2.5 rounded transition-colors flex items-center"
                        title="Download output"
                      >
                        <Download className="w-3 h-3 mr-1" />
                        <span>Download</span>
                      </button>
                    )}
                  </div>
                </div>
                
                {/* Result content */}
                <div className="p-4">
                  {type === 'Image' ? (
                    <div className="max-w-full aspect-video bg-gray-50 rounded border overflow-hidden">
                      <img src={output} alt="Result" className="w-full h-full object-contain" />
                    </div>
                  ) : type === 'Audio' ? (
                    <div className="bg-gray-50 p-3 rounded border">
                      <audio controls className="w-full">
                        <source src={output} />
                      </audio>
                    </div>
                  ) : type === 'JSON' ? (
                    <pre className="bg-gray-50 p-3 rounded border text-xs overflow-auto max-h-[200px] text-black font-mono">
                      {typeof output === 'object' ? JSON.stringify(output, null, 2) : output}
                    </pre>
                  ) : (
                    <div className="bg-gray-50 p-3 rounded border text-sm overflow-auto max-h-[300px] whitespace-pre-wrap text-black">
                      {output}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Helper function to export all results as a single ZIP file
  const exportAllResults = () => {
    // Create a download trigger for all results
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    // For a simple implementation, we'll create separate files
    Object.entries(results).forEach(([key, result]) => {
      const output = result.output;
      const type = result.type;
      downloadOutput(key, output, type);
    });
    
    toast.success('All results exported');
  };

  // Helper function to download a specific output
  const downloadOutput = (key: string, output: any, type: string) => {
    try {
      let content = '';
      let extension = 'txt';
      let mimeType = 'text/plain';
      
      // Format content based on type
      if (typeof output === 'object') {
        content = JSON.stringify(output, null, 2);
        extension = 'json';
        mimeType = 'application/json';
      } else {
        content = String(output);
        
        // Set appropriate extension based on content type
        if (type === 'JSON') {
          extension = 'json';
          mimeType = 'application/json';
        } else if (type === 'Formatted Text' && content.includes('<')) {
          extension = 'html';
          mimeType = 'text/html';
        }
      }
      
      // Create the download
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${key.replace('output_', 'output-')}.${extension}`;
      a.click();
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Error downloading output:', error);
      toast.error('Failed to download output');
    }
  };

  // Enhanced error display with more details and suggestions
  const renderError = () => {
    if (!error) return null;

    // Categorize errors for better user guidance
    let errorTitle = 'Error';
    let errorIcon = <AlertTriangle className="w-5 h-5 text-red-500" />;
    let errorCategory = 'generic';
    
    // Check for common error patterns
    if (error.includes('API key') || error.includes('authentication')) {
      errorTitle = 'Authentication Error';
      errorCategory = 'auth';
    } else if (error.includes('timeout') || error.includes('timed out')) {
      errorTitle = 'Timeout Error';
      errorCategory = 'timeout';
    } else if (error.includes('model') || error.includes('OpenAI') || error.includes('Anthropic')) {
      errorTitle = 'AI Model Error';
      errorCategory = 'model';
    } else if (error.includes('parameter') || error.includes('required field') || error.includes('JSON')) {
      errorTitle = 'Input Error';
      errorCategory = 'input';
    }
    
    // Get helpful hints based on error category
    const getHelpfulHint = () => {
      switch (errorCategory) {
        case 'auth':
          return 'Check that your API keys are correct and have sufficient permissions.';
        case 'timeout':
          return 'Try simplifying your workflow or breaking it into smaller parts.';
        case 'model':
          return 'The AI service may be experiencing issues. Check their status page or try a different model.';
        case 'input':
          return 'Check that all required inputs are provided and in the correct format.';
        default:
          return 'Try rerunning the workflow or check the workflow configuration.';
      }
    };

    return (
      <div className="mt-4 border border-red-200 rounded-lg p-4 bg-red-50">
        <div className="flex items-start">
          {errorIcon}
          <div className="ml-3">
            <h4 className="text-sm font-medium text-red-800">{errorTitle}</h4>
            <p className="mt-1 text-sm text-red-700 whitespace-pre-wrap">{error}</p>
            <p className="mt-2 text-xs text-red-600">{getHelpfulHint()}</p>
            <button
              onClick={runWorkflow}
              disabled={isRunning || !isReadyToRun}
              className="mt-3 text-xs text-red-700 hover:text-red-800 bg-red-100 hover:bg-red-200 py-1 px-2 rounded flex items-center"
            >
              <Play className="w-3 h-3 mr-1" /> Try Again
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Enhanced execution progress with timeline visualization
  const renderExecutionProgress = () => {
    // Get the execution path by sorting stats by their index in the flow
    const sortedStats = [...executionStats].filter(stat => 
      ['running', 'completed', 'error'].includes(stat.status)
    );
    
    if (sortedStats.length === 0) return null;
    
    return (
      <div className="space-y-3 mt-4 border border-blue-200 rounded-md p-4 bg-blue-50">
        <h4 className="text-sm font-medium text-blue-700 flex items-center">
          <Play className="w-4 h-4 mr-2" />
          Execution Progress
          {isRunning && (
            <div className="ml-2 flex items-center text-blue-600">
              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
              <span className="text-xs">Running...</span>
            </div>
          )}
        </h4>
        
        <div className="relative pl-6 space-y-0.5">
          {/* Timeline */}
          <div className="absolute top-0 bottom-0 left-2 w-0.5 bg-blue-200" />
          
          {sortedStats.map((stat, index) => {
            const node = nodesMap[stat.nodeId];
            if (!node) return null;
            
            // Determine status styles
            let statusColor = '';
            let statusIcon = null;
            
            if (stat.status === 'running') {
              statusColor = 'bg-blue-100 text-blue-700 border-blue-200';
              statusIcon = <Loader2 className="w-3.5 h-3.5 animate-spin" />;
            } else if (stat.status === 'completed') {
              statusColor = 'bg-green-100 text-green-700 border-green-200';
              statusIcon = <CheckCircle className="w-3.5 h-3.5" />;
            } else if (stat.status === 'error') {
              statusColor = 'bg-red-100 text-red-700 border-red-200';
              statusIcon = <AlertTriangle className="w-3.5 h-3.5" />;
            }
            
            return (
              <div 
                key={`execution-stat-${stat.nodeId}-${index}`}
                className={`flex items-center p-2 rounded border ${statusColor} relative`}
              >
                {/* Timeline node */}
                <div className={`absolute left-[-22px] w-4 h-4 rounded-full bg-white border-2 
                  ${stat.status === 'running' ? 'border-blue-400' : 
                    stat.status === 'completed' ? 'border-green-400' : 
                    'border-red-400'}`} 
                />
                
                <div className="flex items-center">
                  {statusIcon}
                  <span className="ml-2 font-medium">
                    {node.data?.params?.nodeName || node.type}
                  </span>
                </div>
                
                {stat.executionTime && (
                  <span className="ml-auto text-xs opacity-80">
                    {stat.executionTime.toFixed(2)}s
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Helper function to get simple workflow connection info
  const getWorkflowConnections = useCallback(() => {
    const connections: {input: string, output: string, path: string[]}[] = [];
    
    // For each input node, find its connected output nodes
    inputNodes.forEach(inputNode => {
      const inputId = inputNode.id;
      const inputName = inputNode.data?.params?.nodeName || inputId;
      
      // Check which outputs this input connects to
      outputNodes.forEach(outputNode => {
        const outputId = outputNode.id;
        const outputName = outputNode.data?.params?.nodeName || outputId;
        
        // See if there's a path from this input to this output
        const hasPath = isConnected(inputId, outputId, edges);
        if (hasPath) {
          // Find the path of node IDs between input and output
          const path = findPath(inputId, outputId, edges, nodes);
          connections.push({
            input: inputName,
            output: outputName,
            path
          });
        }
      });
    });
    
    return connections;
  }, [inputNodes, outputNodes, edges, nodes]);

  // Helper function to check if two nodes are connected
  const isConnected = (sourceId: string, targetId: string, edgeList: any[]) => {
    // Simple BFS to find a path
    const visited = new Set();
    const queue = [sourceId];
    
    while (queue.length > 0) {
      const current = queue.shift();
      if (current === targetId) return true;
      if (visited.has(current)) continue;
      
      visited.add(current);
      
      // Find all nodes connected from current
      const connections = edgeList
        .filter(edge => edge.source === current)
        .map(edge => edge.target);
      
      queue.push(...connections);
    }
    
    return false;
  };

  // Helper function to find a path between nodes
  const findPath = (sourceId: string, targetId: string, edgeList: any[], nodeList: any[]) => {
    const path: string[] = [];
    const visited = new Set();
    const queue = [[sourceId]];
    
    while (queue.length > 0) {
      const currentPath = queue.shift()!;
      const current = currentPath[currentPath.length - 1];
      
      if (current === targetId) {
        // Convert node IDs to names where possible
        return currentPath.map(id => {
          const node = nodeList.find(n => n.id === id);
          return node?.data?.params?.nodeName || id;
        });
      }
      
      if (visited.has(current)) continue;
      visited.add(current);
      
      // Find all nodes connected from current
      const connections = edgeList
        .filter(edge => edge.source === current)
        .map(edge => edge.target);
      
      for (const next of connections) {
        queue.push([...currentPath, next]);
      }
    }
    
    return [sourceId, '...', targetId];
  };

  // Function to save renamed input nodes
  const saveInputName = async (nodeId: string, newName: string) => {
    try {
      // Find the node to update
      const node = nodes.find(n => n.id === nodeId);
      if (!node) return;
      
      // Clone the workflow and update just this node
      const updatedNodes = nodes.map(n => {
        if (n.id === nodeId) {
          // Ensure data and params structures exist
          const data = n.data || {};
          const params = data.params || {};
          
          // Update the nodeName
          return {
            ...n,
            data: {
              ...data,
              params: {
                ...params,
                nodeName: newName.trim() || `Input ${node.id.split('-')[1] || '0'}`
              }
            }
          };
        }
        return n;
      });
      
      // Update local state for immediate UI update
      setEditingInputName(null);
      
      // IMPORTANT: Update the flow store directly - this was missing before
      const { setNodes } = useFlowStore.getState();
      setNodes(updatedNodes);
      
      // Update the workflow if we have a workflowId
      if (workflowId) {
        try {
          toast.loading(`Saving input name...`, { id: 'save-name' });
          
          // Get the current workflow first to preserve its name
          const currentWorkflow = await workflowService.getWorkflow(workflowId);
          
          // Create workflow update payload with required name field
          const workflowUpdate = {
            name: currentWorkflow.name,
            nodes: updatedNodes,
            edges
          };
          
          // Save to backend
          await workflowService.updateWorkflow(workflowId, workflowUpdate);
          
          // Update the save status in the flow store
          useFlowStore.getState().setSaveStatus('saved');
          
          toast.success(`Input renamed successfully`, { id: 'save-name' });
        } catch (err: any) {
          console.error('Error saving node name:', err);
          toast.error(`Error saving: ${err?.message || 'Unknown error'}`, { id: 'save-name' });
        }
      } else {
        // If no workflow ID, can't save to backend
        toast.error('Save the workflow first to make this change permanent');
      }
    } catch (err: any) {
      console.error('Error renaming input:', err);
      toast.error('Failed to rename input');
      setEditingInputName(null);
    }
  };

  // Listen for node changes to refresh input names
  useEffect(() => {
    if (editingInputName === null) {
      // Input fields need to be refreshed when a node's name changes
      const existingInputs = { ...inputs };
      const initialInputs: Record<string, InputValue> = {};
      
      inputNodes.forEach((node, index) => {
        // Extract node index
        const nodeIndex = node.id.split('-').length > 1 ? node.id.split('-')[1] : node.id;
        const inputId = `input_${nodeIndex}`;
        
        // Auto-detect type
        let inputType = node.data?.params?.type || 'Text';
        
        // Preserve existing value if the type hasn't changed
        const preserveValue = existingInputs[inputId] && 
          existingInputs[inputId].type === inputType ? 
          existingInputs[inputId].value : '';
        
        initialInputs[inputId] = {
          value: preserveValue,
          type: inputType,
          nodeId: node.id,
          nodeIndex: nodeIndex,
          isRequired: node.data?.params?.required === true
        };
      });
      
      // Only update if inputs have changed
      if (Object.keys(initialInputs).length !== Object.keys(inputs).length ||
          Object.keys(initialInputs).some(key => 
            inputs[key]?.nodeId !== initialInputs[key]?.nodeId || 
            inputs[key]?.isRequired !== initialInputs[key]?.isRequired ||
            inputs[key]?.type !== initialInputs[key]?.type)) {
        setInputs(initialInputs);
      }
    }
  }, [inputNodes, editingInputName, inputs]);

  return (
    <div className="bg-white rounded-lg shadow-xl w-[640px] max-h-[80vh] overflow-hidden">
      {/* Help Panel */}
      {showHelp && (
        <div className="p-4 bg-blue-50 border-b border-blue-100">
          <h3 className="text-sm font-medium text-blue-800 mb-2">How to run a workflow</h3>
          <ol className="text-xs text-blue-700 space-y-1 list-decimal pl-4">
            <li>Fill in all required inputs for your workflow</li>
            <li>Choose which mode you want to run (Standard, Chatbot, Voice)</li>
            <li>Click the "Run" button to execute the workflow</li>
            <li>Wait for the execution to complete - you'll see progress indicators</li>
            <li>View your results in the Outputs section below</li>
          </ol>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex">
          {['Standard', 'Chatbot', 'Voice'].map((tab) => (
            <button
              key={`tab-${tab.toLowerCase()}`}
              onClick={() => setActiveTab(tab.toLowerCase() as any)}
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === tab.toLowerCase()
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6 overflow-auto max-h-[calc(80vh-4rem)]">
        {/* Workflow Validation Warning */}
        {!isReadyToRun && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-yellow-800 text-sm flex items-start">
            <AlertTriangle className="w-5 h-5 text-yellow-500 mr-2 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">This workflow is not ready to run:</p>
              <ul className="list-disc pl-5 mt-1 space-y-1 text-xs">
                {!workflowId && <li>Workflow needs to be saved first</li>}
                {inputNodes.length === 0 && <li>Workflow needs at least one input node</li>}
                {outputNodes.length === 0 && <li>Workflow needs at least one output node</li>}
                {inputNodes.length > 0 && inputNodes.some(node => {
                  const inputId = `input_${node.id.split('-')[1]}`;
                  const input = inputs[inputId];
                  const isRequired = node.data?.params?.required === true;
                  return isRequired && (!input || input.value === undefined || input.value === '');
                }) && <li>Fill in all required input fields</li>}
              </ul>
            </div>
          </div>
        )}

        {/* Fix Input Types Button - Only shown when there's a potential issue */}
        {inputNodes.length > 0 && inputNodes.some(node => !node.data?.params?.type) && (
          <div className="flex justify-end">
            <button
              onClick={fixInputTypes}
              disabled={fixingTypes}
              className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
            >
              {fixingTypes ? (
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
              ) : (
                <Settings className="w-3 h-3 mr-1" />
              )}
              Fix input types
            </button>
          </div>
        )}

        {/* Inputs */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-700">Inputs</h3>
            
            <div className="flex items-center space-x-2">
              {inputNodes.length === 0 && (
                <span className="text-xs text-red-500">No input nodes found</span>
              )}
              
              {/* Workflow overview button */}
              {inputNodes.length > 0 && outputNodes.length > 0 && (
                <button
                  onClick={() => setShowWorkflowOverview(prev => !prev)}
                  className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
                >
                  <Info className="w-3.5 h-3.5 mr-1" />
                  {showWorkflowOverview ? 'Hide Workflow Map' : 'Show Workflow Map'}
                </button>
              )}
            </div>
          </div>
          
          {/* Workflow Overview Panel */}
          {showWorkflowOverview && (
            <div className="mb-4 p-3 border border-blue-200 rounded-md bg-blue-50">
              <h4 className="text-sm font-medium text-blue-700 mb-2">Workflow Map</h4>
              <div className="text-xs text-blue-800">
                {getWorkflowConnections().length > 0 ? (
                  <div className="space-y-3">
                    {getWorkflowConnections().map((connection, index) => (
                      <div key={`connection-${index}`} className="border border-blue-200 bg-white rounded p-2">
                        <div className="flex items-center text-blue-700 font-medium mb-1">
                          <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded">{connection.input}</span>
                          <ChevronRight className="w-3 h-3 mx-1" />
                          <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded">{connection.output}</span>
                        </div>
                        <div className="text-gray-500 flex items-center flex-wrap">
                          <span className="mr-1">Path:</span>
                          {connection.path.map((step, i) => (
                            <React.Fragment key={`path-${index}-${i}`}>
                              <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-700">{step}</span>
                              {i < connection.path.length - 1 && (
                                <ChevronRight className="w-3 h-3 mx-0.5 text-gray-400" />
                              )}
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>No connections found between inputs and outputs.</p>
                )}
              </div>
            </div>
          )}
          
          <div className="space-y-4">
            {inputNodes.map((node, index) => {
              // Extract node index more safely
              const nodeIndex = node.id.split('-').length > 1 ? node.id.split('-')[1] : node.id;
              const inputId = `input_${nodeIndex}`;
              const isRequired = node.data?.params?.required === true;
              const inputName = node.data?.params?.nodeName || `Input ${nodeIndex}`;
              const inputType = node.data?.params?.type || 'Text';
              const inputDescription = node.data?.params?.description || '';
              
              // Create a truly unique key using array index and node ID
              const uniqueKey = `input-node-${index}-${node.id}`;
              
              // Check if this input is currently being renamed
              const isEditing = editingInputName === node.id;
              
              // Get a nice display name for input type
              const getInputTypeIcon = (type: string) => {
                switch(type) {
                  case 'Text': return <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded">Text</span>;
                  case 'Image': return <span className="bg-purple-100 text-purple-800 text-xs px-2 py-0.5 rounded flex items-center"><ImageIcon className="w-3 h-3 mr-1" />Image</span>;
                  case 'Audio': return <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded flex items-center"><FileAudio className="w-3 h-3 mr-1" />Audio</span>;
                  case 'File': return <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded flex items-center"><Upload className="w-3 h-3 mr-1" />File</span>;
                  case 'JSON': return <span className="bg-orange-100 text-orange-800 text-xs px-2 py-0.5 rounded">JSON</span>;
                  default: return <span className="bg-gray-100 text-gray-800 text-xs px-2 py-0.5 rounded">{type}</span>;
                }
              };
              
              return (
                <div key={uniqueKey} className="space-y-2 border border-gray-200 rounded-md p-3 bg-white">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <div className="flex items-center">
                        {isEditing ? (
                          <div className="flex items-center">
                            <input
                              type="text"
                              autoFocus
                              value={pendingNames[node.id] || inputName}
                              onChange={(e) => setPendingNames(prev => ({ ...prev, [node.id]: e.target.value }))}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  saveInputName(node.id, pendingNames[node.id] || inputName);
                                } else if (e.key === 'Escape') {
                                  setEditingInputName(null);
                                }
                              }}
                              className="w-full px-2 py-1 text-sm border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Enter input name..."
                            />
                            <button
                              onClick={() => saveInputName(node.id, pendingNames[node.id] || inputName)}
                              className="ml-1 text-green-600 hover:text-green-800"
                              title="Save"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setEditingInputName(null)}
                              className="ml-1 text-red-600 hover:text-red-800"
                              title="Cancel"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <label className="flex items-center text-sm font-medium text-gray-700">
                              <span>{inputName}</span>
                              {isRequired && <span className="text-red-500 ml-1">*</span>}
                            </label>
                            <button
                              onClick={() => {
                                setEditingInputName(node.id);
                                setPendingNames(prev => ({ ...prev, [node.id]: inputName }));
                              }}
                              className="ml-1.5 px-1.5 py-0.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-md flex items-center text-xs transition-colors"
                              title="Rename this input"
                              aria-label="Rename input"
                            >
                              <Pencil className="w-3 h-3 mr-1" />
                              <span>Rename</span>
                            </button>
                          </div>
                        )}
                        {!isEditing && getInputTypeIcon(inputType)}
                      </div>
                      {!isEditing && inputDescription && (
                        <p className="text-xs text-gray-500 mt-1">{inputDescription}</p>
                      )}
                    </div>
                    <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-500" title="Internal ID">{inputId}</span>
                  </div>
                  {inputs[inputId] && (
                    <div className="relative">
                      {renderInputField(inputId, inputs[inputId])}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Execution Progress */}
        {isRunning && renderExecutionProgress()}

        {/* Run Button */}
        <div className="mt-6">
          <button
            onClick={runWorkflow}
            disabled={isRunning || !isReadyToRun}
            className={`w-full py-3 rounded-md flex items-center justify-center gap-2 transition-colors font-medium ${
              isReadyToRun 
                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm' 
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            } disabled:opacity-70`}
            title={!isReadyToRun ? 'Complete all required inputs first' : 'Execute the workflow'}
          >
            {isRunning ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Executing Workflow...</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                <span>Run Workflow</span>
              </>
            )}
          </button>
          
          {/* Execution status indicators */}
          {!isRunning && !isReadyToRun && (
            <div className="mt-2 flex items-center justify-center">
              <span className="text-xs text-amber-600 flex items-center">
                <AlertTriangle className="w-3 h-3 mr-1" />
                {!workflowId ? "Save workflow first" : 
                 inputNodes.length === 0 ? "Add input nodes" : 
                 outputNodes.length === 0 ? "Add output nodes" : 
                 "Fill all required inputs"}
              </span>
            </div>
          )}
          
          {executionTime !== null && !isRunning && (
            <div className="flex justify-center mt-2">
              <span className="text-xs text-green-600 flex items-center">
                <CheckCircle className="w-3 h-3 mr-1" />
                Completed in {executionTime.toFixed(2)}s
              </span>
            </div>
          )}
        </div>

        {/* Results */}
        {!isRunning && (
          <div className="space-y-4">
            {Object.keys(results).length > 0 ? (
              renderResults()
            ) : (
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Expected Outputs</h4>
                {outputNodes.length > 0 ? (
                  <div className="space-y-2">
                    {outputNodes.map((node) => {
                      // Extract node index more safely
                      const nodeIndex = node.id.split('-').length > 1 ? node.id.split('-')[1] : '0';
                      const outputId = `output_${nodeIndex}`;
                      const outputName = node.data?.params?.nodeName || `Output ${nodeIndex}`;
                      
                      return (
                        <div key={`output-node-${node.id}`} className="flex items-center justify-between text-xs text-gray-500 p-2 bg-white rounded border">
                          <span>{outputName}</span>
                          <span className="text-gray-400">{outputId}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500">No output nodes found in workflow</p>
                )}
              </div>
            )}
            {renderError()}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExecuteWorkflow;