import React from 'react';
import AIProviderNode from './AIProviderNode';

interface PerplexityNodeProps {
  id: string;
  data: any;
  selected?: boolean;
}

const PerplexityNode: React.FC<PerplexityNodeProps> = ({ id, data, selected }) => {
  return (
    <AIProviderNode
      id={id}
      data={{
        ...data,
        provider: 'perplexity'
      }}
      selected={selected}
    />
  );
};

export default PerplexityNode;