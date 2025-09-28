import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { useFlowStore } from '../../../../store/flowStore';
import { Terminal, Code, Trash2, Sparkles, Settings } from 'lucide-react';
import NodeSettingsField from '../../NodeSettingsField';

interface ScriptsNodeProps {
  id: string;
  data: {
    params?: {
      name?: string;
      script?: string;
      language?: string;
      showSettings?: boolean;
      description?: string;
    };
  };
  selected?: boolean;
}

const ScriptsNode: React.FC<ScriptsNodeProps> = ({ id, data, selected }) => {
  const removeNode = useFlowStore((state) => state.removeNode);
  const updateNodeData = useFlowStore((state) => state.updateNodeData);
  const [isEditing, setIsEditing] = useState(false);

  const handleDeleteNode = () => {
    removeNode(id);
  };

  const handleScriptChange = (value: string) => {
    updateNodeData(id, { script: value });
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateNodeData(id, { language: e.target.value });
  };

  const handleToggleEdit = () => {
    setIsEditing(!isEditing);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateNodeData(id, { name: e.target.value });
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateNodeData(id, { description: e.target.value });
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-md overflow-hidden border ${
        selected ? 'border-blue-500' : 'border-gray-200'
      }`}
    >
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 flex justify-between items-center">
        <div className="flex items-center">
          <Code className="h-5 w-5 text-white mr-2" />
          <h3 className="text-white font-medium">{data.params?.name || 'Transform'}</h3>
        </div>
        <div className="flex items-center">
          <button
            onClick={handleToggleEdit}
            className="text-white/80 hover:text-white mr-1"
            title={isEditing ? "View Code" : "Edit Properties"}
          >
            {isEditing ? <Terminal size={16} /> : <Settings size={16} />}
          </button>
          <button
            onClick={handleDeleteNode}
            className="text-white/80 hover:text-white"
            title="Delete Node"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="p-4">
        {isEditing ? (
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Node Name</label>
              <input
                type="text"
                value={data.params?.name || ''}
                onChange={handleNameChange}
                className="w-full px-3 py-2 border border-gray-200 rounded text-sm"
                placeholder="Transform Node"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Description</label>
              <input
                type="text"
                value={data.params?.description || ''}
                onChange={handleDescriptionChange}
                className="w-full px-3 py-2 border border-gray-200 rounded text-sm"
                placeholder="Describe what this transform does"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Language</label>
              <select
                value={data.params?.language || 'javascript'}
                onChange={handleLanguageChange}
                className="w-full px-3 py-2 border border-gray-200 rounded text-sm"
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python (Transpiled)</option>
              </select>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="mb-2 text-xs text-gray-500 flex items-center">
              <div className="bg-gray-100 text-gray-600 px-2 py-1 rounded mr-2">
                {data.params?.language || 'javascript'}
              </div>
              {data.params?.description && (
                <span className="italic">{data.params.description}</span>
              )}
            </div>
            
            <NodeSettingsField
              label="Transform Script"
              value={data.params?.script || '// Access input variables and transform them\nfunction transform(input) {\n  // Example: return input.text.toUpperCase();\n  return input;\n}'}
              onChange={handleScriptChange}
              multiline={true}
              rows={8}
              variableSupport={true}
              description="Write a script to transform the input data. Access input variables with {{ input_node.field }}"
              placeholder="Enter your transformation script here..."
            />
            
            <div className="text-xs bg-blue-50 p-3 rounded border border-blue-100">
              <div className="font-medium text-blue-700 mb-1">Available Functions:</div>
              <ul className="list-disc pl-4 text-blue-700">
                <li>transform(input): Apply your transformation to the input data</li>
                <li>parseJSON(text): Parse JSON string to object</li>
                <li>formatJSON(obj): Format object to JSON string</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-indigo-500 border-2 border-white rounded-full"
        style={{ left: -6 }}
      />
      
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-indigo-500 border-2 border-white rounded-full"
        style={{ right: -6 }}
      />
    </div>
  );
};

export default ScriptsNode;