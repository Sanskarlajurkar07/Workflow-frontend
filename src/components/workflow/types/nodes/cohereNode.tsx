import React from 'react';
import AIProviderNode from './AIProviderNode';

interface CohereNodeProps {
  id: string;
  data: any;
  selected?: boolean;
}

const CohereNode: React.FC<CohereNodeProps> = ({ id, data, selected }) => {
  return (
    <AIProviderNode
      id={id}
      data={{
        ...data,
        provider: 'cohere'
      }}
      selected={selected}
    />
  );
};

export default CohereNode;