import { FlowNode, FlowEdge } from '../types/flow';

interface NodeInput {
  [key: string]: any;
}

interface NodeOutput {
  [key: string]: any;
}

interface ExecutionContext {
  nodes: FlowNode[];
  edges: FlowEdge[];
  nodeOutputs: Map<string, NodeOutput>;
}

async function processMultiInput(input: string, resume: string, yy: string): Promise<string> {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return `Processed inputs:
- Input: ${input}
- Resume: ${resume}
- YY: ${yy}`;
}

export async function executeNode(
  node: FlowNode,
  inputs: NodeInput,
  context: ExecutionContext
): Promise<NodeOutput> {
  switch (node.type) {
    case 'input':
      return { 
        input_1: inputs.input || '',
        resume: inputs.resume || '',
        yy: inputs.yy || ''
      };

    case 'output':
      return { 
        output: inputs.input || 'No output',
        type: node.data.params?.type || 'Text'
      };

    case 'text':
      if (inputs.input) {
        return { output: inputs.input };
      }
      return { output: node.data.params?.text || 'Sample text' };

    case 'transform':
      return {
        output: transformData(inputs.input || inputs.output, node.data.params?.transformation)
      };

    case 'pipeline':
      const pipelineResult = await processPipelineInputs(inputs, node.data.params?.batchMode);
      return { output: pipelineResult };

    case 'file-save':
      return {
        name: node.data.params?.fileName || 'output.txt',
        files: inputs.files || inputs.input || 'No content'
      };

    case 'note':
      return { note: node.data.params?.note || '' };

    // LLM Nodes
    case 'openai':
    case 'google':
    case 'anthropic':
    case 'azure':
    case 'aws':
    case 'perplexity':
      return {
        response: await simulateLLMResponse(
          node.type,
          inputs.system || '',
          inputs.prompt || ''
        )
      };

    default:
      throw new Error(`Unsupported node type: ${node.type}`);
  }
}

async function simulateLLMResponse(provider: string, system: string, prompt: string): Promise<string> {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return `${provider.toUpperCase()} response to:
System: ${system}
Prompt: ${prompt}`;
}

async function processPipelineInputs(inputs: NodeInput, batchMode?: boolean): Promise<string> {
  await new Promise(resolve => setTimeout(resolve, 500));
  return `Pipeline processed${batchMode ? ' (Batch Mode)' : ''}: ${JSON.stringify(inputs)}`;
}

function transformData(data: any, transformation?: string): any {
  if (!data) return data;
  if (!transformation) return data;
  
  try {
    // Simple transformation examples
    switch (transformation) {
      case 'uppercase':
        return typeof data === 'string' ? data.toUpperCase() : data;
      case 'lowercase':
        return typeof data === 'string' ? data.toLowerCase() : data;
      case 'number':
        return Number(data);
      case 'string':
        return String(data);
      case 'json':
        return typeof data === 'string' ? JSON.parse(data) : JSON.stringify(data);
      default:
        return data;
    }
  } catch (error) {
    console.error('Transformation error:', error);
    return data;
  }
}