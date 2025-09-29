import React, { useState } from 'react';
import { Info, X } from 'lucide-react';
import { useTheme } from '../../utils/themeProvider';

interface NodeHelperProps {
  isOpen: boolean;
  onClose: () => void;
}

const VariableFormatExample = ({ name, example, description }: { name: string, example: string, description: string }) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  
  return (
    <div className={`mb-4 ${isLight ? 'bg-gray-50' : 'bg-slate-800'} p-3 rounded-lg`}>
      <div className="font-medium mb-1">{name}</div>
      <code className={`block p-2 mb-2 rounded ${isLight ? 'bg-white border border-gray-200' : 'bg-slate-900 border border-slate-700'}`}>
        {example}
      </code>
      <p className="text-sm">{description}</p>
    </div>
  );
};

export const NodeHelper: React.FC<NodeHelperProps> = ({ isOpen, onClose }) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`w-full max-w-2xl ${isLight ? 'bg-white' : 'bg-slate-900'} rounded-lg shadow-lg p-6 max-h-[90vh] overflow-y-auto`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className={`text-xl font-semibold ${isLight ? 'text-gray-800' : 'text-white'}`}>
            How to Connect Nodes
          </h2>
          <button 
            onClick={onClose}
            className={`p-1 rounded-full ${isLight ? 'hover:bg-gray-100' : 'hover:bg-slate-800'}`}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className={`${isLight ? 'text-gray-700' : 'text-gray-200'} mb-6`}>
          <p className="mb-4">When connecting nodes in your workflow, you need to reference data from previous nodes using a special syntax. Here's how it works:</p>
        </div>
        
        <h3 className={`text-lg font-medium mb-3 ${isLight ? 'text-gray-800' : 'text-white'}`}>
          Input References
        </h3>
        
        <VariableFormatExample 
          name="Basic Input" 
          example="{{ input_0.text }}" 
          description="References the text from the first input node in your workflow"
        />
        
        <VariableFormatExample 
          name="Multiple Inputs" 
          example="{{ input_1.text }}, {{ input_2.text }}" 
          description="You can reference different input nodes by their index number"
        />
        
        <h3 className={`text-lg font-medium mb-3 mt-6 ${isLight ? 'text-gray-800' : 'text-white'}`}>
          Node Output References
        </h3>
        
        <VariableFormatExample 
          name="Basic Output" 
          example="{{ openai_0.response }}" 
          description="References the response from an OpenAI node"
        />
        
        <VariableFormatExample 
          name="Text Transformation" 
          example="{{ transform_0.output }}" 
          description="References the output from a Transform node"
        />
        
        <div className={`mt-6 p-4 rounded-lg ${isLight ? 'bg-blue-50 border border-blue-100' : 'bg-blue-900/20 border border-blue-800'}`}>
          <div className="flex items-start">
            <Info className={`h-5 w-5 mr-2 mt-0.5 ${isLight ? 'text-blue-500' : 'text-blue-400'}`} />
            <div>
              <h4 className={`font-medium mb-1 ${isLight ? 'text-blue-700' : 'text-blue-300'}`}>Pro Tip</h4>
              <p className={`text-sm ${isLight ? 'text-blue-600' : 'text-blue-200'}`}>
                When you connect nodes together, our system will suggest the correct reference format automatically.
                You can hover over a node to see what variables it provides for other nodes to use.
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end mt-6">
          <button
            onClick={() => {
              localStorage.setItem('node-helper-shown', 'true');
              onClose();
            }}
            className={`px-4 py-2 ${
              isLight 
                ? 'bg-gray-800 text-white hover:bg-gray-700' 
                : 'bg-slate-700 text-white hover:bg-slate-600'
            } rounded-lg mr-3`}
          >
            Don't show again
          </button>
          <button
            onClick={onClose}
            className={`px-4 py-2 ${
              isLight 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            } rounded-lg`}
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};

export default NodeHelper; 