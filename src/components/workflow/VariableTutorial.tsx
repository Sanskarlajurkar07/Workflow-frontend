import React, { useState } from 'react';
import { X, ChevronRight, ChevronLeft, Play, Variable, ArrowRight } from 'lucide-react';
import { useTheme } from '../../utils/themeProvider';

interface VariableTutorialProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VariableTutorial: React.FC<VariableTutorialProps> = ({
  isOpen,
  onClose,
}) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const [currentStep, setCurrentStep] = useState(0);

  // Create placeholder illustrations for each step
  const illustrations = {
    connect: (
      <svg width="240" height="140" viewBox="0 0 240 140" className={`mx-auto border ${isLight ? 'border-gray-200' : 'border-gray-700'} rounded-lg p-2`}>
        <rect x="20" y="40" width="80" height="60" rx="4" fill={isLight ? "#f0f9ff" : "#0c4a6e"} stroke={isLight ? "#bae6fd" : "#075985"} strokeWidth="2" />
        <rect x="140" y="40" width="80" height="60" rx="4" fill={isLight ? "#f0f9ff" : "#0c4a6e"} stroke={isLight ? "#bae6fd" : "#075985"} strokeWidth="2" />
        <circle cx="100" cy="70" r="4" fill={isLight ? "#0284c7" : "#0ea5e9"} />
        <circle cx="140" cy="70" r="4" fill={isLight ? "#0284c7" : "#0ea5e9"} />
        <path d="M104 70 L136 70" stroke={isLight ? "#0284c7" : "#0ea5e9"} strokeWidth="2" strokeDasharray="4 2" />
        <text x="35" y="75" fontSize="12" fill={isLight ? "#0c4a6e" : "#7dd3fc"}>Input</text>
        <text x="150" y="75" fontSize="12" fill={isLight ? "#0c4a6e" : "#7dd3fc"}>AI Model</text>
      </svg>
    ),
    typing: (
      <svg width="240" height="140" viewBox="0 0 240 140" className={`mx-auto border ${isLight ? 'border-gray-200' : 'border-gray-700'} rounded-lg p-2`}>
        <rect x="20" y="40" width="200" height="60" rx="4" fill={isLight ? "#f8fafc" : "#0f172a"} stroke={isLight ? "#cbd5e1" : "#334155"} strokeWidth="2" />
        <rect x="30" y="60" width="180" height="30" rx="2" fill={isLight ? "#f1f5f9" : "#1e293b"} stroke={isLight ? "#cbd5e1" : "#334155"} strokeWidth="1" />
        <text x="40" y="80" fontSize="12" fill={isLight ? "#334155" : "#cbd5e1"}>{'{{ input_0.text }}'}</text>
        <rect x="40" y="76" width="100" height="16" rx="2" fill={isLight ? "#dbeafe" : "#1e3a8a"} fillOpacity="0.5" />
      </svg>
    ),
    variableButton: (
      <svg width="240" height="140" viewBox="0 0 240 140" className={`mx-auto border ${isLight ? 'border-gray-200' : 'border-gray-700'} rounded-lg p-2`}>
        <rect x="20" y="40" width="200" height="60" rx="4" fill={isLight ? "#f8fafc" : "#0f172a"} stroke={isLight ? "#cbd5e1" : "#334155"} strokeWidth="2" />
        <rect x="30" y="60" width="150" height="30" rx="2" fill={isLight ? "#f1f5f9" : "#1e293b"} stroke={isLight ? "#cbd5e1" : "#334155"} strokeWidth="1" />
        <rect x="180" y="60" width="30" height="30" rx="2" fill={isLight ? "#dbeafe" : "#1e40af"} stroke={isLight ? "#93c5fd" : "#3b82f6"} strokeWidth="1" />
        <path d="M190 75 L200 75 M195 70 L195 80" stroke={isLight ? "#2563eb" : "#60a5fa"} strokeWidth="2" />
      </svg>
    ),
    toolbar: (
      <svg width="240" height="140" viewBox="0 0 240 140" className={`mx-auto border ${isLight ? 'border-gray-200' : 'border-gray-700'} rounded-lg p-2`}>
        <rect x="20" y="20" width="200" height="40" rx="4" fill={isLight ? "#f8fafc" : "#0f172a"} stroke={isLight ? "#cbd5e1" : "#334155"} strokeWidth="2" />
        <circle cx="50" cy="40" r="15" fill={isLight ? "#dbeafe" : "#1e40af"} />
        <circle cx="90" cy="40" r="15" fill={isLight ? "#dbeafe" : "#1e40af"} />
        <circle cx="130" cy="40" r="15" fill={isLight ? "#dbeafe" : "#1e40af"} />
        <circle cx="170" cy="40" r="15" fill={isLight ? "#dbeafe" : "#1e40af"} />
        <text x="45" y="44" fontSize="12" fill={isLight ? "#1e40af" : "#93c5fd"}>V</text>
        <text x="85" y="44" fontSize="12" fill={isLight ? "#1e40af" : "#93c5fd"}>C</text>
        <text x="125" y="44" fontSize="12" fill={isLight ? "#1e40af" : "#93c5fd"}>L</text>
        <text x="168" y="44" fontSize="12" fill={isLight ? "#1e40af" : "#93c5fd"}>R</text>
        <rect x="40" y="70" width="160" height="50" rx="4" fill={isLight ? "#f0f9ff" : "#0c4a6e"} stroke={isLight ? "#bae6fd" : "#0ea5e9"} strokeWidth="2" />
        <line x1="40" y1="85" x2="200" y2="85" stroke={isLight ? "#bae6fd" : "#0ea5e9"} strokeWidth="1" />
        <text x="60" y="80" fontSize="10" fill={isLight ? "#0c4a6e" : "#7dd3fc"}>Variables</text>
      </svg>
    ),
    execution: (
      <svg width="240" height="140" viewBox="0 0 240 140" className={`mx-auto border ${isLight ? 'border-gray-200' : 'border-gray-700'} rounded-lg p-2`}>
        <rect x="20" y="20" width="200" height="100" rx="4" fill={isLight ? "#f8fafc" : "#0f172a"} stroke={isLight ? "#cbd5e1" : "#334155"} strokeWidth="2" />
        <rect x="30" y="30" width="180" height="30" rx="2" fill={isLight ? "#f1f5f9" : "#1e293b"} stroke={isLight ? "#cbd5e1" : "#334155"} strokeWidth="1" />
        <text x="40" y="50" fontSize="12" fill={isLight ? "#334155" : "#cbd5e1"}>Input</text>
        <rect x="30" y="70" width="180" height="40" rx="2" fill={isLight ? "#ecfdf5" : "#064e3b"} stroke={isLight ? "#a7f3d0" : "#10b981"} strokeWidth="1" />
        <text x="40" y="90" fontSize="12" fill={isLight ? "#065f46" : "#6ee7b7"}>{'Result with {{ input_0.text }}'}</text>
        <path d="M120 30 L120 17 L150 17 L150 30" stroke={isLight ? "#22c55e" : "#4ade80"} strokeWidth="2" strokeDasharray="2 2" />
      </svg>
    )
  };

  const steps = [
    {
      title: "Using Variables in Workflows",
      content: (
        <div className="space-y-3">
          <p>Variables let you pass data between nodes in your workflow. You'll see them in this format:</p>
          <div className={`p-2 ${isLight ? 'bg-blue-50' : 'bg-blue-900/20'} rounded-md text-center font-mono`}>
            {'{{'} node_name.field {'}}'}
          </div>
          <p>This guide will show you how to use them effectively.</p>
        </div>
      ),
      image: null
    },
    {
      title: "Step 1: Connect Your Nodes",
      content: (
        <div className="space-y-3">
          <p>First, connect nodes by dragging from one node's output handle to another node's input handle.</p>
          <p>When nodes are connected, you can use variables from the source node in the target node.</p>
        </div>
      ),
      image: illustrations.connect
    },
    {
      title: "Step 2: Insert Variables - Method 1",
      content: (
        <div className="space-y-3">
          <p>To insert a variable, simply type <code className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-800">{'{{'}</code> and a dropdown will appear showing available variables.</p>
          <p>Select a variable from the list or continue typing to filter the options.</p>
        </div>
      ),
      image: illustrations.typing
    },
    {
      title: "Step 2: Insert Variables - Method 2",
      content: (
        <div className="space-y-3">
          <p>Alternatively, click the <span className="font-semibold">Variables</span> button on any input field to open the variable selector.</p>
          <p>This button appears on the right side of fields that support variables.</p>
        </div>
      ),
      image: illustrations.variableButton
    },
    {
      title: "Step 3: View Available Variables",
      content: (
        <div className="space-y-3">
          <p>Click the <span className="font-semibold">Variable Manager</span> icon in the toolbar to see all available variables in your workflow.</p>
          <p>You can also click the <span className="font-semibold">Connection View</span> icon to see all connections between nodes.</p>
        </div>
      ),
      image: illustrations.toolbar
    },
    {
      title: "Step 4: Testing Variables",
      content: (
        <div className="space-y-3">
          <p>When you're ready to test your workflow:</p>
          <ol className="list-decimal pl-5 space-y-1">
            <li>Click the Run button in the top toolbar</li>
            <li>Enter values for any input nodes</li>
            <li>Watch as data flows through your variables</li>
          </ol>
        </div>
      ),
      image: illustrations.execution
    }
  ];

  const handleNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className={`w-full max-w-3xl ${isLight ? 'bg-white' : 'bg-slate-900'} rounded-lg shadow-xl overflow-hidden`}>
        {/* Header */}
        <div className={`px-6 py-4 ${isLight ? 'bg-blue-50 border-b border-blue-100' : 'bg-blue-900/20 border-b border-blue-800/30'}`}>
          <div className="flex justify-between items-center">
            <h2 className={`text-xl font-semibold ${isLight ? 'text-blue-800' : 'text-blue-300'}`}>
              {steps[currentStep].title}
            </h2>
            <button 
              onClick={onClose}
              className={`p-1.5 rounded-full ${
                isLight ? 'hover:bg-blue-100 text-blue-700' : 'hover:bg-blue-800 text-blue-300'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 space-y-4">
              {steps[currentStep].content}
            </div>
            
            {steps[currentStep].image && (
              <div className="flex-1">
                <div className={`border ${isLight ? 'border-gray-200' : 'border-gray-700'} rounded-lg overflow-hidden`}>
                  {steps[currentStep].image}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className={`px-6 py-4 ${isLight ? 'bg-gray-50 border-t border-gray-100' : 'bg-slate-800 border-t border-slate-700'} flex justify-between`}>
          <div>
            <button
              onClick={handlePrevStep}
              disabled={currentStep === 0}
              className={`px-4 py-2 rounded-md flex items-center ${
                currentStep === 0
                  ? (isLight ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-slate-700 text-gray-500 cursor-not-allowed')
                  : (isLight ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-slate-700 text-gray-200 hover:bg-slate-600')
              }`}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </button>
          </div>
          
          <div className="flex items-center">
            <span className={`text-sm ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
              Step {currentStep + 1} of {steps.length}
            </span>
          </div>
          
          <div>
            <button
              onClick={handleNextStep}
              className={`px-4 py-2 rounded-md flex items-center ${
                isLight 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-blue-700 text-white hover:bg-blue-600'
              }`}
            >
              {currentStep === steps.length - 1 ? (
                <>
                  Finish
                  <Play className="w-4 h-4 ml-1" />
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VariableTutorial; 