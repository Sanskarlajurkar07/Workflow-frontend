import React from 'react';
import AIProviderNode from './AIProviderNode';

interface AnthropicNodeProps {
  id: string;
  data: any;
  selected?: boolean;
}

const AnthropicNode: React.FC<AnthropicNodeProps> = ({ id, data, selected }) => {
  return (
    <AIProviderNode
      id={id}
      data={{
        ...data,
        provider: 'anthropic'
      }}
      selected={selected}
    />
  );
};

export default AnthropicNode;