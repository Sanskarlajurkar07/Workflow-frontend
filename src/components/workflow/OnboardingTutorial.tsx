import React, { useState, useEffect } from 'react';
import { ArrowRight, X, Check } from 'lucide-react';
import { useTheme } from '../../utils/themeProvider';

interface TutorialStep {
  title: string;
  description: string;
  image?: string;
  position?: 'left' | 'right' | 'top' | 'bottom' | 'center';
  elementSelector?: string;
}

export const OnboardingTutorial: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Slight delay to ensure DOM elements are ready
      setTimeout(() => setIsVisible(true), 100);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  const tutorialSteps: TutorialStep[] = [
    {
      title: 'Welcome to Workflow Builder!',
      description: 'This tutorial will guide you through creating your first workflow. Let\'s get started!',
      position: 'center'
    },
    {
      title: 'Step 1: Add Input Node',
      description: 'Drag an "Input" node from the left panel to the canvas. This is where your workflow starts.',
      elementSelector: '.node-panel .input-node', // Selector for the input node in the panel
      position: 'left'
    },
    {
      title: 'Step 2: Add AI Model',
      description: 'Now, drag an AI model like "OpenAI" to the canvas. This will process your input.',
      elementSelector: '.node-panel .openai-node', // Selector for AI model node
      position: 'left'
    },
    {
      title: 'Step 3: Connect Nodes',
      description: 'Click and drag from the output handle of the Input node to the input handle of the OpenAI node.',
      position: 'center'
    },
    {
      title: 'Step 4: Configure OpenAI Node',
      description: 'Click on the OpenAI node and set its parameters. In the "Prompt" field, type "{{ input_0.text }}" to use the input value.',
      position: 'right'
    },
    {
      title: 'Step 5: Add Output Node',
      description: 'Add an "Output" node to display the result. Connect the OpenAI node to the Output node.',
      elementSelector: '.node-panel .output-node', // Selector for output node
      position: 'left'
    },
    {
      title: 'Step 6: Save Your Workflow',
      description: 'Click the Save button in the top right to save your workflow.',
      elementSelector: '.save-button', // Selector for save button
      position: 'right'
    },
    {
      title: 'Step 7: Run Your Workflow',
      description: 'Click the Run button to test your workflow. You can enter input and see the AI response.',
      elementSelector: '.run-button', // Selector for run button
      position: 'right'
    },
    {
      title: 'Congratulations!',
      description: 'You\'ve created your first workflow! You can always click the Help button to see more tips.',
      position: 'center'
    }
  ];

  const currentTutorialStep = tutorialSteps[currentStep];

  const getPositionStyles = () => {
    switch (currentTutorialStep.position) {
      case 'left':
        return 'left-4 top-1/2 transform -translate-y-1/2';
      case 'right':
        return 'right-4 top-1/2 transform -translate-y-1/2';
      case 'top':
        return 'top-4 left-1/2 transform -translate-x-1/2';
      case 'bottom':
        return 'bottom-4 left-1/2 transform -translate-x-1/2';
      case 'center':
      default:
        return 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2';
    }
  };

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Save that user has completed tutorial
      localStorage.setItem('tutorial-completed', 'true');
      onClose();
    }
  };

  const handleSkip = () => {
    localStorage.setItem('tutorial-completed', 'true');
    onClose();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Semi-transparent overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-30 pointer-events-auto" onClick={handleSkip} />
      
      {/* Tutorial card */}
      <div 
        className={`absolute ${getPositionStyles()} w-80 ${
          isLight ? 'bg-white' : 'bg-slate-800'
        } rounded-lg shadow-xl border ${
          isLight ? 'border-blue-200' : 'border-blue-800'
        } p-4 pointer-events-auto`}
      >
        <div className="flex justify-between items-center mb-2">
          <h3 className={`font-medium ${isLight ? 'text-blue-700' : 'text-blue-300'}`}>
            {currentTutorialStep.title}
          </h3>
          <button 
            onClick={handleSkip}
            className={`p-1 rounded-full ${
              isLight ? 'hover:bg-gray-100' : 'hover:bg-slate-700'
            }`}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        
        <p className={`text-sm mb-4 ${isLight ? 'text-gray-600' : 'text-gray-300'}`}>
          {currentTutorialStep.description}
        </p>
        
        {currentTutorialStep.image && (
          <div className="mb-4 rounded overflow-hidden border border-gray-200">
            <img src={currentTutorialStep.image} alt="Tutorial step" className="w-full" />
          </div>
        )}
        
        <div className="flex justify-between items-center mt-2">
          <div className="flex space-x-1">
            {tutorialSteps.map((_, index) => (
              <div 
                key={index}
                className={`h-1.5 w-1.5 rounded-full ${
                  index === currentStep
                    ? (isLight ? 'bg-blue-600' : 'bg-blue-500')
                    : (isLight ? 'bg-gray-300' : 'bg-gray-600')
                }`}
              />
            ))}
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={handleSkip}
              className={`px-3 py-1 text-xs rounded ${
                isLight
                  ? 'text-gray-600 hover:bg-gray-100'
                  : 'text-gray-300 hover:bg-slate-700'
              }`}
            >
              Skip
            </button>
            
            <button
              onClick={handleNext}
              className={`px-3 py-1 text-xs rounded flex items-center ${
                isLight
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {currentStep === tutorialSteps.length - 1 ? (
                <>
                  <Check className="h-3 w-3 mr-1" />
                  Finish
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="h-3 w-3 ml-1" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingTutorial; 