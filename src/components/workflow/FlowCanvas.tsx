import React, { useCallback, useRef, useLayoutEffect, useState, useEffect } from 'react';
import ReactFlow,
{
  Background,
  Controls,
  Panel,
  Connection,
  Edge,
  ReactFlowProvider,
  Node,
  MarkerType,
  useReactFlow,
  addEdge,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useFlowStore } from '../../store/flowStore';
import { useTheme } from '../../utils/themeProvider';
import { Save, Download, Play, X, Info, HelpCircle, BookOpen, Layers, Clipboard, Link, Variable } from 'lucide-react';
import { NodeType, FlowNode, FlowEdge } from '../../types/flow';
import CustomEdge from '../CustomEdge';
import InputNode from './types/nodes/InputNode';
import OutputNode from './types/nodes/OutputNode';
import OpenAINode from './types/nodes/openaiNode';
import AnthropicNode from './types/nodes/AnthropicNode';
import Claude35Node from './types/nodes/Claude35Node';
import GeminiNode from './types/nodes/geminiNode';
import CohereNode from './types/nodes/cohereNode';
import PerplexityNode from './types/nodes/perplexityNode';
import XAINode from './types/nodes/xAINode';
import AWSNode from './types/nodes/AWSNode';
import AzureNode from './types/nodes/AzureNode';
import DocumentToTextNode from './types/nodes/DocumentToTextNode';
import TransformNode from './types/nodes/ScriptsNode';
import PipelineNode from './types/nodes/PipelineNode';
import FileTransformerNode from './types/nodes/FileTransformerNode';
import ShareNode from './types/nodes/Share';
import TextNode from './types/nodes/TextNode';
import KBReaderNode from './types/nodes/KBReaderNode';
import KBLoaderNode from './types/nodes/KBLoaderNode';
import KBSearchNode from './types/nodes/KBSearchNode';
import KBSyncNode from './types/nodes/KBSyncNode';
import AITaskExecutorNode from './types/nodes/AITaskExecutorNode';
import ArxivLoaderNode from './types/nodes/ArxivLoaderNode';
import AudioProcessorNode from './types/nodes/AudioProcessorNode';
import ChatFileReaderNode from './types/nodes/ChatFileReaderNode';
import ChatMemoryNode from './types/nodes/ChatMemoryNode';
import CRMEnricherNode from './types/nodes/CRMEnricherNode';
import CSVLoaderNode from './types/nodes/CSVLoaderNode';
import DataCollectorNode from './types/nodes/DataCollectorNode';
import FileLoaderNode from './types/nodes/FileLoaderNode';
import GitHubNode from './types/nodes/GitHubNode';
import ImageProcessorNode from './types/nodes/ImageProcessorNode';
import JSONHandlerNode from './types/nodes/JSONHandlerNode';
import MergeNode from './types/nodes/MergeNode';
import MongoDBNode from './types/nodes/MongoDBNode';
import MySQLNode from './types/nodes/MySQLNode';
import NotificationNode from './types/nodes/NotificationNode';
import RSSLoaderNode from './types/nodes/RSSLoaderNode';
import TextProcessorNode from './types/nodes/TextProcessorNode';
import TimeAndTTSQLNode from './types/nodes/TimeAndTTSQLNode';
import URLLoaderNode from './types/nodes/URLLoaderNode';
import YouTubeLoaderNode from './types/nodes/YouTubeLoaderNode';
import ConditionNode from './types/nodes/ConditionNode';
import TimeNode from './types/nodes/TimeNode';
import TTSQLNode from './types/nodes/TTSQLNode';
import FileSaveNode from './types/nodes/FileSaveNode';
import NoteNode from './types/nodes/NoteNode';
import ScriptsNode from './types/nodes/ScriptsNode';
import ApiLoaderNode from './types/nodes/ApiLoaderNode';
import MakeWebhookNode from './types/nodes/MakeWebhookNode';
import ZapierWebhookNode from './types/nodes/ZapierWebhookNode';
import TeamsNode from './types/nodes/TeamsNode';
import SlackNode from './types/nodes/SlackNode';
import GoogleDriveNode from './types/nodes/GoogleDriveNode';
import DiscordNode from './types/nodes/DiscordNode';
import OutlookNode from './types/nodes/OutlookNode';
import GmailNode from './types/nodes/GmailNode';
import AirTableNode from './types/nodes/AirTableNode';  
import NotionNode from './types/nodes/NotionNode';
import HubSpotNode from './types/nodes/HubSpotNode';
import GmailTriggerNode from './types/nodes/GmailTriggerNode';
import OutlookTriggerNode from './types/nodes/OutlookTriggerNode';
import WikiLoaderNode from './types/nodes/WikiLoaderNode';
import ExecuteWorkflow from './executeWorkflow'; // Import ExecuteWorkflow component
import workflowService from '../../lib/workflowService';
import { logApiError, validateWorkflow } from '../../utils/debugUtils';
import NodeHelper from './NodeHelper';
import NodeInputPreviewTip from './NodeInputPreviewTip';
import TemplateGallery from './TemplateGallery';
import OnboardingTutorial from './OnboardingTutorial';
import VariableManager from './VariableManager';
import VarInputPreview from './VarInputPreview';
import VariableTutorial from './VariableTutorial';
import GoogleDocsNode from './types/nodes/GoogleDocsNode';
import OneDriveNode from './types/nodes/OneDriveNode';
import ActiveCampaignNode from './types/nodes/ActiveCampaignNode';
import CalendlyNode from './types/nodes/CalendlyNode';
import DropboxNode from './types/nodes/DropboxNode';
import GoogleCalendarNode from './types/nodes/GoogleCalendarNode';
import JiraNode from './types/nodes/JiraNode';
import LinearNode from './types/nodes/LinearNode';
import MailChimpNode from './types/nodes/MailChimpNode';
import PostmanNode from './types/nodes/PostmanNode';
// import SalesforceNode from './types/nodes/SalesforceNode'; // File not found in current location
import SuperboxNode from './types/nodes/SuperboxNode';
import TelegramNode from './types/nodes/TelegramNode';
import TrelloNode from './types/nodes/TrelloNode';
import WhatsAppBusinessAPINode from './types/nodes/WhatsAppBusinessAPI';
import ZoomNode from './types/nodes/ZoomNode';
import GoogleSheetNode from './types/nodes/GoogleSheetNode';


const nodeTypes = {
  input: InputNode,
  output: OutputNode,
  openai: OpenAINode,
  anthropic: AnthropicNode,
  claude35: Claude35Node,
  gemini: GeminiNode,
  cohere: CohereNode,
  perplexity: PerplexityNode,
  xai: XAINode,
  aws: AWSNode,
  azure: AzureNode,
  'document-to-text': DocumentToTextNode,
  transform: TransformNode,
  pipeline: PipelineNode,
  'file-transformer': FileTransformerNode,
  share: ShareNode,
  text: TextNode,
  condition: ConditionNode,
  'kb-reader': KBReaderNode,
  'kb-loader': KBLoaderNode,
  'kb-search': KBSearchNode,
  'kb-sync': KBSyncNode,
  'ai-task-executor': AITaskExecutorNode,
  'arxiv-loader': ArxivLoaderNode,
  'audio-processor': AudioProcessorNode,
  'chat-file-reader': ChatFileReaderNode,
  'chat-memory': ChatMemoryNode,
  'crm-enricher': CRMEnricherNode,
  'csv-loader': CSVLoaderNode,
  'data-collector': DataCollectorNode,
  'file-loader': FileLoaderNode,
  'github': GitHubNode,
  'image-processor': ImageProcessorNode,
  'json-handler': JSONHandlerNode,
  'merge': MergeNode,
  'mongodb': MongoDBNode,
  'mysql': MySQLNode,
  'notification-node': NotificationNode,
  'rss-loader': RSSLoaderNode,
  'text-processor': TextProcessorNode,
  'time-ttsql': TimeAndTTSQLNode,
  'url-loader': URLLoaderNode,
  'youtube-loader': YouTubeLoaderNode,
  time: TimeNode,
  ttsql: TTSQLNode,
  'file-save': FileSaveNode,
  note: NoteNode,
  scripts: ScriptsNode,
  'api-loader': ApiLoaderNode,
  'make-webhook': MakeWebhookNode,
  'zapier-webhook': ZapierWebhookNode,
  'teams': TeamsNode,
  'slack': SlackNode,
  'google-drive': GoogleDriveNode,
  'discord': DiscordNode,
  'outlook': OutlookNode,
  'gmail': GmailNode,
  'airtable': AirTableNode,
  'notion': NotionNode,
  'hubspot': HubSpotNode,
  'gmail-trigger': GmailTriggerNode,
  'outlook-trigger': OutlookTriggerNode,
  'wiki-loader': WikiLoaderNode,
  'google-docs': GoogleDocsNode,
  'onedrive': OneDriveNode,
  'google-sheets': GoogleSheetNode,
  'activecampaign': ActiveCampaignNode,
  'calendly': CalendlyNode,
  'dropbox': DropboxNode,
  'google-calendar': GoogleCalendarNode,
  'jira': JiraNode,
  'linear': LinearNode,
  'mailchimp': MailChimpNode,
  'postman': PostmanNode,
  'superbox': SuperboxNode,
  'telegram': TelegramNode,
  'trello': TrelloNode,
  'whatsapp-business': WhatsAppBusinessAPINode,
  'zoom': ZoomNode,
} as const;

const edgeTypes = {
  custom: CustomEdge,
} as const;

interface FlowCanvasProps {
  workflowId?: string;
  initialNodes?: FlowNode[];
  initialEdges?: FlowEdge[];
}

export const FlowCanvasContent = ({ workflowId, initialNodes = [], initialEdges = [] }: FlowCanvasProps) => {
  const [showExecutionWindow, setShowExecutionWindow] = useState(false);
  const [showMiniMap, setShowMiniMap] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; id: string } | null>(null);
  const [showNodeHelper, setShowNodeHelper] = useState(false);
  const [showTemplateGallery, setShowTemplateGallery] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showVariableManager, setShowVariableManager] = useState(false);
  const [showVarPreview, setShowVarPreview] = useState(false);
  const [showVarTutorial, setShowVarTutorial] = useState(false);
  const [hoverNode, setHoverNode] = useState<FlowNode | null>(null);
  const [hoverPosition, setHoverPosition] = useState<{ x: number; y: number } | null>(null);
  
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    setSelectedNode,
    setEdges,
    addNode,
    clearWorkflow,
    setNodes,
    setWorkflowId,
    workflowName
  } = useFlowStore();

  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const reactFlowInstance = useReactFlow();
  const prevWorkflowIdRef = useRef<string | undefined>(workflowId);

  // Reset flow state when workflow ID changes
  useEffect(() => {
    if (prevWorkflowIdRef.current !== workflowId) {
      clearWorkflow(true); // Always preserve name when switching workflows
      setWorkflowId(workflowId || null);
      prevWorkflowIdRef.current = workflowId;
    }
  }, [workflowId, clearWorkflow, setWorkflowId]);

  // Update document title when workflow name changes
  useEffect(() => {
    if (workflowName && workflowName !== 'New Workflow') {
      document.title = workflowName;
    }
  }, [workflowName]);

  // Initialize with initial nodes and edges when component mounts or they change
  useLayoutEffect(() => {
    const initializeWorkflow = () => {
      try {
        // Clear existing flow state first to avoid state persistence between workflows
        console.log('------ WORKFLOW INITIALIZATION START ------');
        console.log('WorkflowID:', workflowId);
        console.log('Received initialNodes:', initialNodes.length, 'initialEdges:', initialEdges.length);
        console.log('Current Flow State before clearing:', { 
          nodes: useFlowStore.getState().nodes.length, 
          edges: useFlowStore.getState().edges.length,
          counters: useFlowStore.getState().nodeCounters 
        });
        
        // Critical: Clear everything first but preserve workflow name if we have a workflowId
        // This prevents losing the workflow name when initializing an existing workflow
        clearWorkflow(!!workflowId); // Preserve name if we have a workflowId, reset if no workflowId
        
        console.log('Flow State after clearing:', { 
          nodes: useFlowStore.getState().nodes.length, 
          edges: useFlowStore.getState().edges.length,
          counters: useFlowStore.getState().nodeCounters 
        });
        
        // Store the new workflow ID first
        setWorkflowId(workflowId || null);
        
        // Only initialize if there are actual nodes/edges
        if (initialNodes && initialNodes.length > 0) {
          console.log('Initializing nodes - count:', initialNodes.length);
          console.log('Node Types:', initialNodes.map(n => n.type).join(', '));
          console.log('Node IDs:', initialNodes.map(n => n.id).join(', '));
          
          // Ensure nodes have the correct format before setting
          const formattedNodes = initialNodes.map(node => ({
            ...node,
            // Ensure node has a data property with at least these fields
            data: {
              label: node.data?.label || node.type,
              type: node.data?.type || node.type,
              params: node.data?.params || {},
              ...node.data
            },
          }));
          
          // Set nodes using the store's setNodes function
          setNodes(formattedNodes);
          console.log('Nodes set successfully, now in store:', useFlowStore.getState().nodes.length);
        } else {
          console.log('No initial nodes to set, setting empty array');
          setNodes([]);
        }
        
        if (initialEdges && initialEdges.length > 0) {
          console.log('Initializing edges - count:', initialEdges.length);
          console.log('Edge IDs:', initialEdges.map(e => e.id).join(', '));
          
          // Ensure edges have the correct format
          const formattedEdges = initialEdges.map(edge => ({
            ...edge,
            type: edge.type || 'smoothstep',
            animated: edge.animated !== undefined ? edge.animated : true,
          }));
          
          // Set edges using the store's setEdges function
          setEdges(() => formattedEdges);
          console.log('Edges set successfully, now in store:', useFlowStore.getState().edges.length);
        } else {
          console.log('No initial edges to set, setting empty array');
          setEdges(() => []);
        }
        
        console.log('------ WORKFLOW INITIALIZATION COMPLETE ------');
      } catch (error) {
        console.error("Error initializing workflow:", error);
      }
    };
    
    // Call the initialization function
    initializeWorkflow();
  }, [initialNodes, initialEdges, clearWorkflow, setNodes, setEdges, workflowId, setWorkflowId]);

  // Clean up when component unmounts - only reset to "New Workflow" if no specific workflow
  useEffect(() => {
    return () => {
      console.log('FlowCanvas component unmounting, clearing workflow state');
      clearWorkflow(false); // Reset name on unmount since we're leaving the workflow entirely
      setWorkflowId(null);
    };
  }, [clearWorkflow, setWorkflowId]);

  useLayoutEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      window.dispatchEvent(new Event('resize'));
    });

    if (reactFlowWrapper.current) {
      resizeObserver.observe(reactFlowWrapper.current);
    }

    return () => {
      if (reactFlowWrapper.current) {
        resizeObserver.unobserve(reactFlowWrapper.current);
      }
    };
  }, []);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    setIsDraggingOver(true);
  }, []);

  const onDragLeave = useCallback(() => {
    setIsDraggingOver(false);
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      setIsDraggingOver(false);

      const type = event.dataTransfer.getData('application/reactflow');
      if (!type) return;

      // Make sure we have a workflow ID before adding nodes
      if (!workflowId) {
        console.error('Cannot add node: No workflowId available');
        return;
      }

      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowWrapper.current?.getBoundingClientRect().left!,
        y: event.clientY - reactFlowWrapper.current?.getBoundingClientRect().top!,
      });

      // Create a new node with the current workflow context
      const newNode = addNode(type as NodeType, position);
      console.log(`Added new node ${newNode.id} to workflow ${workflowId}`);

      // Auto-connection logic is optional and can be enabled if needed
      /*
      // Find nearest compatible node
      const compatibleNodes = nodes.filter(node => {
        // Define compatibility rules here
        return true; // Simplified for example
      });

      if (compatibleNodes.length > 0) {
        // Sort by distance and get nearest
        const nearestNode = compatibleNodes.reduce((nearest, node) => {
          const distance = Math.hypot(
            node.position.x - position.x,
            node.position.y - position.y
          );
          return distance < nearest.distance ? { node, distance } : nearest;
        }, { node: compatibleNodes[0], distance: Infinity });

        // Create connection
        const newEdge = {
          id: `e${nearestNode.node.id}-${newNode.id}`,
          source: nearestNode.node.id,
          target: newNode.id,
          type: 'smoothstep',
          markerEnd: { type: MarkerType.ArrowClosed },
        };

        setEdges((eds) => addEdge(newEdge, eds));
      }
      */
    },
    [reactFlowInstance, addNode, reactFlowWrapper, workflowId]
  );

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, [setSelectedNode]);

  const handleEdgeDelete = useCallback((edgeId: string) => {
    setEdges((eds) => eds.filter((edge) => edge.id !== edgeId));
  }, [setEdges]);

  const handleEdgeUpdate = useCallback((oldEdge: Edge, newConnection: Connection) => {
    // Delete the old edge and create a new one
    setEdges((eds) => {
      const filteredEdges = eds.filter(e => e.id !== oldEdge.id);
      return addEdge(newConnection, filteredEdges);
    });
  }, [setEdges]);

  // Listen for key presses to handle edge deletion with keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.key === 'Delete' || event.key === 'Backspace') && edges.length) {
        // Get selected edges and delete them
        const selectedEdges = edges.filter(edge => edge.selected);
        if (selectedEdges.length > 0) {
          selectedEdges.forEach(edge => {
            handleEdgeDelete(edge.id);
          });
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [edges, handleEdgeDelete]);

  // Example of adding a ConditionNode dynamically
  const addConditionNode = () => {
    const newNode: Node = {
      id: `condition-${nodes.length}`,
      type: 'condition',
      position: { x: 250, y: 150 },
      data: {
        label: 'Condition Node',
        paths: [
          {
            id: 'path_0',
            clauses: [{ id: 'clause_0', inputField: '', operator: '', value: '' }],
            logicalOperator: 'AND',
          },
        ],
      },
    };
    addNode(newNode, { x: 250, y: 150 });
  };

  // Add download function
  const handleDownloadFlow = () => {
    const flow = {
      nodes,
      edges,
      timestamp: new Date().toISOString(),
      version: "1.0.0"
    };

    // Create blob and download
    const json = JSON.stringify(flow, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `workflow-${new Date().getTime()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleRunWorkflow = () => {
    setShowExecutionWindow(true);
  };

  const handleSaveWorkflow = async () => {
    if (!workflowId) return;
    
    try {
      // Get current nodes, edges, and workflow name from the store
      const { nodes: currentNodes, edges: currentEdges, workflowName } = useFlowStore.getState();
      
      // Check if workflow name exists - prevent saving with empty/undefined name
      if (!workflowName) {
        alert('Workflow name is not set. Please name the workflow before saving.');
        return;
      }
      
      // Prepare workflow data
      const workflowData = {
        name: workflowName, // Use the workflow name from store
        nodes: currentNodes,
        edges: currentEdges,
        status: 'draft' as const // Set default status with proper typing
      };
      
      // Validate the workflow data before sending
      const validationErrors = validateWorkflow(workflowData);
      if (validationErrors.length > 0) {
        console.error('Workflow validation errors:', validationErrors);
        alert(`Cannot save workflow: ${validationErrors[0]}`);
        return;
      }
      
      // Make API call to save the workflow
      await workflowService.updateWorkflow(workflowId, workflowData);
      
      // Update save status in the flow store
      useFlowStore.getState().setSaveStatus('saved');
      
      // Show success message
      console.log('Workflow saved successfully');
    } catch (error) {
      logApiError('Error saving workflow', error);
      alert('Failed to save workflow. Check console for details.');
    }
  };

  const onEdgeContextMenu = useCallback(
    (event: React.MouseEvent, edge: Edge) => {
      // Prevent default browser context menu
      event.preventDefault();
      
      // Calculate position for custom context menu
      const pane = document.querySelector('.react-flow__pane');
      if (pane) {
        const rect = pane.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        // Store edge id and position in state
        setContextMenu({ id: edge.id, x, y });
      }
    },
    []
  );

  // Close context menu when clicking elsewhere
  const onPaneClick = useCallback(() => {
    setContextMenu(null);
  }, []);

  // Check if tutorials should be shown on new workflow creation
  useEffect(() => {
    // Check if the user has completed the tutorial before
    const hasCompletedTutorial = localStorage.getItem('tutorial-completed');
    const hasShownHelper = localStorage.getItem('node-helper-shown');
    
    // For brand new workflows without nodes and edges, show tutorial if not completed
    if (workflowId && !hasCompletedTutorial && initialNodes.length === 0 && initialEdges.length === 0) {
      setShowTutorial(true);
    } else if (workflowId && !hasShownHelper) {
      // For existing workflows or if tutorial completed, just show the helper
      setShowNodeHelper(true);
    }
  }, [workflowId, initialNodes.length, initialEdges.length]);

  // Handle node hover for showing input preview tip
  const onNodeMouseEnter = useCallback((event: React.MouseEvent, node: FlowNode) => {
    setHoverNode(node);
    setHoverPosition({
      x: event.clientX,
      y: event.clientY - 120, // Position above the cursor
    });
  }, []);

  const onNodeMouseLeave = useCallback(() => {
    setHoverNode(null);
    setHoverPosition(null);
  }, []);

  const onNodeMouseMove = useCallback((event: React.MouseEvent) => {
    if (hoverNode) {
      setHoverPosition({
        x: event.clientX,
        y: event.clientY - 120, // Position above the cursor
      });
    }
  }, [hoverNode]);

  // Check if user has seen the variable tutorial
  useEffect(() => {
    const hasSeenVarTutorial = localStorage.getItem('variable-tutorial-seen');
    if (!hasSeenVarTutorial && nodes.length > 0) {
      setShowVarTutorial(true);
    }
  }, [nodes.length]);

  return (
    <div 
      ref={reactFlowWrapper} 
      className={`w-full h-full relative ${isDraggingOver ? 'drop-target' : ''}`}
    >
      <style>
        {`
          .drop-target::after {
            content: "";
            position: absolute;
            inset: 0;
            background: rgba(59, 130, 246, 0.1);
            border: 2px dashed rgba(59, 130, 246, 0.5);
            pointer-events: none;
            z-index: 9;
          }
          
          .react-flow__edge {
            z-index: 1;
          }

          .react-flow__edge.selected {
            z-index: 2;
          }

          .react-flow__edge-path {
            stroke-width: 3;
            stroke: #3B82F6;
          }

          .react-flow__edge.selected .react-flow__edge-path {
            stroke: #2563EB;
            stroke-width: 4;
            filter: drop-shadow(0 0 8px rgba(37, 99, 235, 0.3));
          }

          .react-flow__edge-path:hover {
            stroke: #2563EB;
            stroke-width: 4;
            filter: drop-shadow(0 0 8px rgba(37, 99, 235, 0.3));
          }

          .react-flow__handle {
            width: 10px;
            height: 10px;
            background: #3B82F6;
            border: 2px solid white;
            box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
          }

          .react-flow__handle:hover {
            background: #2563EB;
            box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.4);
          }

          .react-flow__connection-path {
            stroke: #3B82F6;
            stroke-width: 3;
            stroke-dasharray: 5,5;
          }

          @keyframes modalAppear {
            from {
              opacity: 0;
              transform: translate(-50%, -48%) scale(0.96);
            }
            to {
              opacity: 1;
              transform: translate(-50%, -50%) scale(1);
            }
          }
          
          .animate-modal-appear {
            animation: modalAppear 0.3s ease-out forwards;
          }
          
          @keyframes pulse-glow {
            0%, 100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); }
            50% { box-shadow: 0 0 0 8px rgba(59, 130, 246, 0); }
          }
          
          .pulse-glow {
            animation: pulse-glow 2s infinite;
          }
        `}
      </style>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodeClick={(_, node) => setSelectedNode(node)}
        fitView
        onEdgeUpdate={(oldEdge, newConnection) => {
          handleEdgeUpdate(oldEdge, newConnection);
        }}
        onEdgeUpdateEnd={(_, edge) => { console.log('edge update end', edge) }}
        onViewportChange={(viewport) => setZoomLevel(viewport.zoom)}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onDragLeave={onDragLeave}
        onDragEnd={() => setIsDraggingOver(false)}
        onEdgeContextMenu={onEdgeContextMenu}
        onPaneClick={onPaneClick}
        style={{ background: '#FEFFFF' }}
        connectionLineStyle={{
          stroke: '#3B82F6',
          strokeWidth: 3,
          strokeDasharray: '5,5',
        }}
        defaultEdgeOptions={{
          style: { 
            stroke: '#3B82F6', 
            strokeWidth: 3,
            cursor: 'pointer',
          },
          animated: true,
          markerEnd: { 
            type: MarkerType.ArrowClosed, 
            color: '#3B82F6',
            width: 20,
            height: 20,
          },
        }}
        proOptions={{ hideAttribution: true }}
        onNodeMouseEnter={onNodeMouseEnter}
        onNodeMouseLeave={onNodeMouseLeave}
        onNodeMouseMove={onNodeMouseMove}
      >
        <Background
          gap={24}
          size={1.5}
          color="#E5E7EB"
          variant="dots"
          className="bg-white"
        />
        
        <Controls
          className="bg-theme-medium/70 backdrop-blur-md rounded-lg border border-theme-medium-dark shadow-xl p-1"
          style={{ 
            left: 16, 
            bottom: 16, 
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            padding: '10px'
          }}
          showInteractive={false}
          position="bottom-left"
        />
        
        {/* Enhanced Panel UI */}
        <Panel position="top-right" className="p-0 flex gap-2">
          <div className="flex bg-theme-medium-dark/70 backdrop-blur-md rounded-lg border border-theme-medium-dark shadow-xl p-1.5 flex-row gap-2">
            <button
              onClick={() => setShowNodeHelper(true)}
              className="flex items-center justify-center w-10 h-10 rounded-md bg-theme-medium/30 text-theme-medium-dark hover:bg-theme-medium/40 hover:text-theme-medium transition-all"
              title="Help with node connections"
            >
              <HelpCircle size={18} />
            </button>
            
            <button
              onClick={() => setShowVarTutorial(true)}
              className="flex items-center justify-center w-10 h-10 rounded-md bg-blue-500/80 text-white hover:bg-blue-600 transition-all pulse-glow"
              title="Learn about variables"
            >
              <Variable size={18} />
            </button>
            
            <button
              onClick={() => setShowTemplateGallery(true)}
              className="flex items-center justify-center w-10 h-10 rounded-md bg-theme-medium-dark/30 text-theme-light hover:bg-theme-medium-dark/50 hover:text-theme-white transition-all"
              title="Workflow templates"
            >
              <BookOpen size={18} />
            </button>
            
            <button
              onClick={() => setShowVariableManager(true)}
              className="flex items-center justify-center w-10 h-10 rounded-md bg-theme-medium/30 text-theme-medium-dark hover:bg-theme-medium/40 hover:text-theme-medium transition-all"
              title="Manage workflow variables"
            >
              <Clipboard size={18} />
            </button>
            
            <button
              onClick={() => setShowVarPreview(true)}
              className="flex items-center justify-center w-10 h-10 rounded-md bg-theme-medium/30 text-theme-medium-dark hover:bg-theme-medium/40 hover:text-theme-medium transition-all"
              title="View variable connections"
            >
              <Link size={18} />
            </button>
            
            <button
              onClick={handleSaveWorkflow}
              className="flex items-center justify-center w-10 h-10 rounded-md bg-theme-medium/30 text-theme-medium-dark hover:bg-theme-medium/40 hover:text-theme-medium transition-all"
              title="Save Workflow"
            >
              <Save size={18} />
            </button>
            
            <button
              onClick={handleDownloadFlow}
              className="flex items-center justify-center w-10 h-10 rounded-md bg-theme-medium-dark/30 text-theme-light hover:bg-theme-medium-dark/50 hover:text-theme-white transition-all"
              title="Download Workflow"
            >
              <Download size={18} />
            </button>
            
            <button
              onClick={handleRunWorkflow}
              className="flex items-center justify-center w-10 h-10 rounded-md bg-emerald-500 text-white hover:bg-emerald-600 hover:shadow-lg transition-all relative group"
              title="Run Workflow"
            >
              <Play size={18} className="group-hover:scale-110 transition-transform" />
              <span className="absolute inset-0 rounded-md bg-emerald-400/40 group-hover:animate-ping opacity-75"></span>
            </button>
            
            <button
              onClick={() => setShowMiniMap(!showMiniMap)}
              className={`flex items-center justify-center w-10 h-10 rounded-md transition-all ${
                showMiniMap 
                  ? 'bg-theme-medium/50 text-theme-light'
                  : 'bg-theme-medium-dark/30 text-theme-light hover:bg-theme-medium-dark/50 hover:text-theme-white'
              }`}
              title="Toggle Mini Map"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <rect x="7" y="7" width="6" height="6"></rect>
                <rect x="11" y="11" width="6" height="6"></rect>
              </svg>
            </button>
          </div>
        </Panel>
        
        {/* Conditionally render minimap */}
        {showMiniMap && (
          <Panel position="bottom-right" className="p-0">
            <div className="bg-theme-medium-dark/70 backdrop-blur-md rounded-lg border border-theme-medium-dark shadow-xl overflow-hidden">
              {/* Minimap would go here if React Flow provides one */}
            </div>
          </Panel>
        )}
        
        {/* Canvas Info Panel */}
        <Panel position="bottom-center" className="p-0 mb-4">
          <div className="flex bg-theme-medium-dark/70 backdrop-blur-md rounded-lg border border-theme-medium-dark shadow-xl px-3 py-1.5 text-xs text-theme-white">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-theme-medium"></div>
                <span>Nodes: {nodes.length}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-theme-medium-dark"></div>
                <span>Connections: {edges.length}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-theme-light"></div>
                <span>Zoom: {Math.round(zoomLevel * 100)}%</span>
              </div>
            </div>
          </div>
        </Panel>

        {/* Edge Context Menu */}
        {contextMenu && (
          <div 
            className="absolute z-10 bg-white rounded-md shadow-lg border border-gray-200"
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            <button
              className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-red-500 flex items-center"
              onClick={() => {
                handleEdgeDelete(contextMenu.id);
                setContextMenu(null);
              }}
            >
              <X size={14} className="mr-2" />
              Delete Connection
            </button>
          </div>
        )}
      </ReactFlow>
      
      {showExecutionWindow && (
        <>
          {/* Backdrop overlay */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm z-10 transition-opacity duration-300" 
            onClick={() => setShowExecutionWindow(false)}
          ></div>
          
          {/* Centered execution modal */}
          <div 
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] max-w-[90vw] max-h-[80vh] bg-white rounded-xl shadow-2xl z-20 overflow-hidden animate-modal-appear"
          >
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center mr-3">
                  <Play size={16} className="text-emerald-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800">Execute Workflow</h3>
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => document.dispatchEvent(new CustomEvent('toggle-execution-help'))}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded"
                  title="Help"
                >
                  <Info size={18} />
                </button>
                <button 
                  onClick={() => setShowExecutionWindow(false)}
                  className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-all"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="p-0 overflow-auto max-h-[calc(80vh-4rem)]">
              <ExecuteWorkflow 
                onClose={() => setShowExecutionWindow(false)}
                workflowId={workflowId}
              />
            </div>
          </div>
        </>
      )}
      
      {/* Node helper dialog */}
      <NodeHelper 
        isOpen={showNodeHelper} 
        onClose={() => setShowNodeHelper(false)} 
      />
      
      {/* Template gallery */}
      <TemplateGallery 
        isOpen={showTemplateGallery} 
        onClose={() => setShowTemplateGallery(false)} 
      />
      
      {/* Node input preview tip */}
      <NodeInputPreviewTip
        sourceNode={hoverNode}
        isVisible={!!hoverNode}
        position={hoverPosition}
      />
      
      {/* Onboarding tutorial */}
      <OnboardingTutorial
        isOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
      />
      
      {/* Variable manager */}
      <VariableManager
        isOpen={showVariableManager}
        onClose={() => setShowVariableManager(false)}
      />
      
      {/* Variable connections preview */}
      <VarInputPreview
        isOpen={showVarPreview}
        onClose={() => setShowVarPreview(false)}
        workflowId={workflowId}
      />
      
      {/* Variable tutorial */}
      <VariableTutorial
        isOpen={showVarTutorial}
        onClose={() => {
          localStorage.setItem('variable-tutorial-seen', 'true');
          setShowVarTutorial(false);
        }}
      />
    </div>
  );
};

export const FlowCanvas = ({ workflowId, initialNodes = [], initialEdges = [] }: FlowCanvasProps) => {
  return (
    <ReactFlowProvider>
      <FlowCanvasContent workflowId={workflowId} initialNodes={initialNodes} initialEdges={initialEdges} />
    </ReactFlowProvider>
  );
};

export default FlowCanvas;