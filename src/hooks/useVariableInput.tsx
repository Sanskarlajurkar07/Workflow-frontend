import { useState, useEffect, useRef, useCallback } from 'react';
import { useFlowStore } from '../store/flowStore';

interface VariableInputProps {
  value: string;
  onChange: (value: string) => void;
}

export const useVariableInput = ({ value, onChange }: VariableInputProps) => {
  const [showVarBuilder, setShowVarBuilder] = useState(false);
  const [cursorPosition, setCursorPosition] = useState<number | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { nodes, edges } = useFlowStore();
  
  // Check if the user typed '{{' to trigger the variable builder
  const handleKeyUp = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const input = e.currentTarget;
    const curPos = input.selectionStart;
    const text = input.value;
    
    // Check if the last two characters are '{{'
    if (curPos >= 2 && text.substring(curPos - 2, curPos) === '{{') {
      setCursorPosition(curPos);
      setShowVarBuilder(true);
    }
  }, []);
  
  // Function to insert the variable at cursor position
  const insertVariable = useCallback((variable: string) => {
    if (cursorPosition === null || !inputRef.current) return;
    
    // Check if the variable already contains a dot (field specifier)
    let formattedVariable = variable;
    if (!variable.includes('.')) {
      // Look for the node to determine if it's an AI node
      const nodeName = variable;
      const node = nodes.find(n => 
        (n.data.params?.nodeName === nodeName) || (n.id === nodeName)
      );
      
      // If it's an AI-type node, use .response, otherwise use .output
      if (node && ['openai', 'anthropic', 'gemini', 'cohere', 'ai'].some(type => 
          node.type.toLowerCase().includes(type))) {
        formattedVariable = `${variable}.response`;
      } else {
        formattedVariable = `${variable}.output`;
      }
    }
    
    // Format the variable with {{ }}
    const fullVariable = `{{${formattedVariable}}}`;
    
    // Remove the {{ that triggered the variable builder and insert the properly formatted variable
    const newValue = value.substring(0, cursorPosition - 2) + fullVariable + value.substring(cursorPosition);
    onChange(newValue);
    setShowVarBuilder(false);
    
    // Set focus back to the input after inserting the variable
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.selectionStart = cursorPosition - 2 + fullVariable.length;
        inputRef.current.selectionEnd = cursorPosition - 2 + fullVariable.length;
      }
    }, 0);
  }, [cursorPosition, value, onChange, nodes]);
  
  // Function to get connected nodes
  const getConnectedNodes = useCallback((nodeId: string) => {
    // Find incoming edges to this node
    return edges
      .filter(edge => edge.target === nodeId)
      .map(edge => edge.source)
      .map(sourceId => nodes.find(node => node.id === sourceId))
      .filter(node => node !== undefined);
  }, [nodes, edges]);
  
  // Close variable builder when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (showVarBuilder && inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setShowVarBuilder(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showVarBuilder]);
  
  return {
    inputRef,
    showVarBuilder,
    setShowVarBuilder,
    handleKeyUp,
    insertVariable,
    getConnectedNodes
  };
}; 