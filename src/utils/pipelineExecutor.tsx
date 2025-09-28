import { FlowNode, FlowEdge } from '../types/flow';
import { executeNode } from './nodeExecutors';

interface ExecutionResult {
  nodeResults: Map<string, any>;
  error?: string;
}

export class PipelineExecutor {
  private nodes: FlowNode[];
  private edges: FlowEdge[];
  private nodeOutputs: Map<string, any>;
  private executionOrder: FlowNode[];

  constructor(nodes: FlowNode[], edges: FlowEdge[]) {
    this.nodes = nodes;
    this.edges = edges;
    this.nodeOutputs = new Map();
    this.executionOrder = this.calculateExecutionOrder();
  }

  private calculateExecutionOrder(): FlowNode[] {
    const visited = new Set<string>();
    const order: FlowNode[] = [];
    const inProgress = new Set<string>();

    const visit = (nodeId: string) => {
      if (inProgress.has(nodeId)) {
        throw new Error('Circular dependency detected in pipeline');
      }
      if (visited.has(nodeId)) return;

      inProgress.add(nodeId);

      // Get all outgoing edges from this node
      const outgoingEdges = this.edges.filter(e => e.source === nodeId);
      for (const edge of outgoingEdges) {
        visit(edge.target);
      }

      inProgress.delete(nodeId);
      visited.add(nodeId);
      const node = this.nodes.find(n => n.id === nodeId);
      if (node) order.unshift(node);
    };

    // Start with input nodes (nodes with no incoming edges)
    const inputNodes = this.nodes.filter(node => 
      !this.edges.some(edge => edge.target === node.id)
    );

    for (const node of inputNodes) {
      visit(node.id);
    }

    return order;
  }

  private getNodeInputs(nodeId: string): any {
    const inputs: any = {};
    const incomingEdges = this.edges.filter(e => e.target === nodeId);

    for (const edge of incomingEdges) {
      const sourceOutput = this.nodeOutputs.get(edge.source);
      if (sourceOutput) {
        inputs[edge.targetHandle || 'input'] = sourceOutput[edge.sourceHandle || 'output'];
      }
    }

    return inputs;
  }

  async execute(): Promise<ExecutionResult> {
    this.nodeOutputs.clear();
    const context = {
      nodes: this.nodes,
      edges: this.edges,
      nodeOutputs: this.nodeOutputs
    };

    try {
      for (const node of this.executionOrder) {
        const inputs = this.getNodeInputs(node.id);
        const output = await executeNode(node, inputs, context);
        this.nodeOutputs.set(node.id, output);
      }

      return {
        nodeResults: this.nodeOutputs
      };
    } catch (error) {
      return {
        nodeResults: this.nodeOutputs,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
}