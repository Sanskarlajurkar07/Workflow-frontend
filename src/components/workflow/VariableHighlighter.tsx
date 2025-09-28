import React from 'react';

interface VariableHighlighterProps {
  text: string;
  className?: string;
}

/**
 * Component that renders text with highlighted variables
 * Variables are wrapped in {{ }} and highlighted with a blue background
 */
export const VariableHighlighter: React.FC<VariableHighlighterProps> = ({ text, className = '' }) => {
  if (!text) return null;

  // Split the text by variable pattern {{...}}
  const parts = text.split(/(\{\{[^}]+\}\})/g);

  return (
    <div className={`whitespace-pre-wrap ${className}`}>
      {parts.map((part, index) => {
        const isVariable = part.match(/^\{\{[^}]+\}\}$/);
        
        if (isVariable) {
          // Extract variable info for better display
          const variable = part.substring(2, part.length - 2);
          const [nodeName, field] = variable.split('.');
          
          return (
            <span 
              key={index} 
              className="inline-flex items-center px-1.5 py-0.5 rounded-md text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200"
              title={`Variable from node: ${nodeName}`}
            >
              {nodeName}
              <span className="mx-0.5 text-blue-500">.</span>
              <span className="font-semibold">{field}</span>
            </span>
          );
        }
        
        return <span key={index}>{part}</span>;
      })}
    </div>
  );
}; 