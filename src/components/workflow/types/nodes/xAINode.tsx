import React from 'react';
import AIProviderNode from './AIProviderNode';

interface XAINodeProps {
  id: string;
  data: any;
  selected?: boolean;
}

const XAINode: React.FC<XAINodeProps> = ({ id, data, selected }) => {
  return (
    <AIProviderNode
      id={id}
      data={{
        ...data,
        provider: 'xai'
      }}
      selected={selected}
    />
  );
};

export default XAINode;