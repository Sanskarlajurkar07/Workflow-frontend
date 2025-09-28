import { FlowNode, FlowEdge } from './flow';

export interface Node {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: Record<string, any>;
}

export interface Connection {
  id: string;
  source: string;
  target: string;
}

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  nodes: FlowNode[];
  edges: FlowEdge[];
  createdAt: string;
  lastModified: string;
  status: 'active' | 'draft';
  userId?: string;
}

export interface WorkflowCreate {
  name: string;
  description?: string;
  nodes: FlowNode[];
  edges: FlowEdge[];
  status: 'active' | 'draft';
}

export interface WorkflowUpdate {
  name: string;
  description?: string;
  nodes: FlowNode[];
  edges: FlowEdge[];
  status?: 'active' | 'draft';
}