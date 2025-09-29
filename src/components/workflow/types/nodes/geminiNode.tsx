import React from 'react';
import AIProviderNode from './AIProviderNode';

interface GeminiNodeProps {
  id: string;
  data: any;
  selected?: boolean;
}

const GeminiNode: React.FC<GeminiNodeProps> = ({ id, data, selected }) => {
  return (
    <AIProviderNode
      id={id}
      data={{
        ...data,
        provider: 'gemini'
      }}
      selected={selected}
    />
  );
};

export default GeminiNode;