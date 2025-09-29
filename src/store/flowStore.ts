import { create } from 'zustand';
import { 
  Connection, 
  addEdge, 
  applyNodeChanges, 
  applyEdgeChanges,
  MarkerType,
} from 'reactflow';
import { FlowNode, FlowEdge, NodeType } from '../types/flow';

interface FlowState {
  nodes: FlowNode[];
  edges: FlowEdge[];
  nodeCounters: Record<string, number>;
  selectedNode: FlowNode | null;
  workflowName: string;
  workflowId: string | null;
  saveStatus: 'unsaved' | 'saving' | 'saved';
  onNodesChange: (changes: any) => void;
  onEdgesChange: (changes: any) => void;
  onConnect: (connection: Connection) => void;
  updateNodeParams: (nodeId: string, params: any) => void;
  updateNodeResults: (nodeId: string, results: any) => void;
  getNextNodeId: (type: NodeType) => string;
  removeNode: (nodeId: string) => void;
  setSelectedNode: (node: FlowNode | null) => void;
  clearWorkflow: (preserveName?: boolean) => void;
  setEdges: (updater: (edges: FlowEdge[]) => FlowEdge[]) => void;
  setNodes: (nodes: FlowNode[]) => void;
  updateNodeData: (id: string, data: Partial<FlowNode['data']['params']>) => void;
  addNode: (type: NodeType, position: { x: number; y: number }) => FlowNode;
  setWorkflowName: (name: string) => void;
  setWorkflowId: (id: string | null) => void;
  setSaveStatus: (status: 'unsaved' | 'saving' | 'saved') => void;
  setWorkflow: (workflow: { id: string; name: string; nodes: any[]; edges: any[] }) => void;
}

export const useFlowStore = create<FlowState>((set, get) => ({
  nodes: [],
  edges: [],
  nodeCounters: {},
  selectedNode: null,
  workflowName: 'New Workflow',
  workflowId: null,
  saveStatus: 'unsaved',

  getNextNodeId: (type: NodeType) => {
    const state = get();
    const counter = state.nodeCounters[type] || 0;
    set({ nodeCounters: { ...state.nodeCounters, [type]: counter + 1 } });
    return `${type}_${counter}`;
  },

  addNode: (type: NodeType, position: { x: number; y: number }) => {
    const nodeId = get().getNextNodeId(type);
    const newNode: FlowNode = {
      id: nodeId,
      type,
      position,
      data: {
        label: type,
        type,
        params: {
          nodeName: nodeId
        }
      }
    };

    set((state) => ({
      nodes: [...state.nodes, newNode]
    }));
    
    return newNode;
  },

  onNodesChange: (changes) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },

  onEdgesChange: (changes) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },

  onConnect: (connection) => {
    const newEdge = {
      ...connection,
      type: 'smoothstep',
      markerEnd: { type: MarkerType.ArrowClosed },
      animated: true,
    };
    set({
      edges: addEdge(newEdge, get().edges),
    });
  },

  updateNodeParams: (nodeId, params) => {
    set({
      nodes: get().nodes.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              params: {
                ...node.data.params,
                ...params,
              },
            },
          };
        }
        return node;
      }),
    });
  },

  updateNodeResults: (nodeId, results) => {
    set({
      nodes: get().nodes.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              results,
            },
          };
        }
        return node;
      }),
    });
  },

  removeNode: (nodeId: string) => {
    set((state) => ({
      nodes: state.nodes.filter((node) => node.id !== nodeId),
    }));
  },

  setSelectedNode: (node: FlowNode | null) => {
    set({ selectedNode: node });
  },

  clearWorkflow: (preserveName = false) => {
    const current = get();
      set({
        nodes: [],
        edges: [],
      workflowId: current.workflowId,
      workflowName: preserveName ? current.workflowName : 'New Workflow',
        selectedNode: null,
      nodeCounters: {}
    });
  },

  setEdges: (updater) => {
    set({
      edges: updater(get().edges),
    });
  },

  setNodes: (nodes) => {
    set({ nodes });
  },

  updateNodeData: (id, data) => {
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === id
          ? {
              ...node,
              data: {
                ...node.data,
                params: {
                  ...node.data.params,
                  ...data,
                },
              },
            }
          : node
      ),
    }));
  },

  setWorkflowName: (name: string) => set({ workflowName: name }),
  setWorkflowId: (id: string | null) => set({ workflowId: id }),
  setSaveStatus: (status: 'unsaved' | 'saving' | 'saved') => set({ saveStatus: status }),

  setWorkflow: (workflow: { id: string; name: string; nodes: any[]; edges: any[] }) => {
    set({
      workflowId: workflow.id,
      workflowName: workflow.name || 'Untitled Workflow',
      nodes: workflow.nodes,
      edges: workflow.edges,
      selectedNode: null,
      nodeCounters: {}
    });
  },
}));