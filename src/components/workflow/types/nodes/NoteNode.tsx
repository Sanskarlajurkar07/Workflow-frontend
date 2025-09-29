import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { Bold, Italic, Underline, List, ListOrdered, MoreHorizontal, Type, Trash2, Palette, Lock, Unlock } from 'lucide-react';
import { useFlowStore } from '../../../../store/flowStore';

interface NoteNodeProps {
  id: string;
  data: {
    params?: {
      text?: string;
      color?: string;
      locked?: boolean;
      style?: {
        bold?: boolean;
        italic?: boolean;
        underline?: boolean;
        listType?: 'bullet' | 'ordered' | 'none';
        headingLevel?: 1 | 2 | 3 | null;
      };
    };
  };
  selected?: boolean;
}

const colors = [
  { name: 'yellow', bg: 'bg-yellow-100', hover: 'hover:bg-yellow-200', border: 'border-yellow-200' },
  { name: 'blue', bg: 'bg-blue-100', hover: 'hover:bg-blue-200', border: 'border-blue-200' },
  { name: 'green', bg: 'bg-green-100', hover: 'hover:bg-green-200', border: 'border-green-200' },
  { name: 'pink', bg: 'bg-pink-100', hover: 'hover:bg-pink-200', border: 'border-pink-200' },
  { name: 'purple', bg: 'bg-purple-100', hover: 'hover:bg-purple-200', border: 'border-purple-200' },
];

const NoteNode: React.FC<NoteNodeProps> = ({ id, data, selected }) => {
  const removeNode = useFlowStore((state) => state.removeNode);
  const updateNodeData = useFlowStore((state) => state.updateNodeData);
  const [showColorPicker, setShowColorPicker] = useState(false);

  const toggleStyle = (styleKey: keyof NonNullable<typeof data.params.style>, value?: any) => {
    updateNodeData(id, {
      params: {
        ...data.params,
        style: {
          ...data.params?.style,
          [styleKey]: value !== undefined ? value : !data.params?.style?.[styleKey]
        }
      }
    });
  };

  const handleColorChange = (colorName: string) => {
    updateNodeData(id, {
      params: {
        ...data.params,
        color: colorName
      }
    });
    setShowColorPicker(false);
  };

  const toggleLock = () => {
    updateNodeData(id, {
      params: {
        ...data.params,
        locked: !data.params?.locked
      }
    });
  };

  const currentColor = data.params?.color || 'yellow';
  const colorClass = colors.find(c => c.name === currentColor)?.bg || 'bg-yellow-100';
  const borderClass = colors.find(c => c.name === currentColor)?.border || 'border-yellow-200';

  return (
    <div
      className={`${colorClass} rounded-lg min-w-[300px] min-h-[200px] shadow-md ${
        selected ? 'ring-2 ring-yellow-400' : ''
      }`}
    >
      {/* Header with Controls */}
      <div className={`flex items-center justify-between px-2 py-1 border-b ${borderClass}`}>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowColorPicker(!showColorPicker)}
            className="p-1.5 rounded hover:bg-white/30 transition-colors"
            title="Change Color"
          >
            <Palette className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={toggleLock}
            className="p-1.5 rounded hover:bg-white/30 transition-colors"
            title={data.params?.locked ? "Unlock" : "Lock"}
          >
            {data.params?.locked ? 
              <Lock className="w-4 h-4 text-gray-600" /> : 
              <Unlock className="w-4 h-4 text-gray-600" />
            }
          </button>
        </div>
        <button
          onClick={() => removeNode(id)}
          className="p-1.5 rounded hover:bg-red-100 transition-colors"
          title="Delete"
        >
          <Trash2 className="w-4 h-4 text-red-500" />
        </button>
      </div>

      {/* Color Picker Dropdown */}
      {showColorPicker && (
        <div className="absolute right-2 top-10 bg-white rounded-lg shadow-lg p-2 z-50">
          <div className="flex gap-1">
            {colors.map((color) => (
              <button
                key={color.name}
                onClick={() => handleColorChange(color.name)}
                className={`w-6 h-6 rounded-full ${color.bg} ${color.hover} 
                  ${currentColor === color.name ? 'ring-2 ring-gray-400' : ''}`}
                title={color.name.charAt(0).toUpperCase() + color.name.slice(1)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Existing Toolbar */}
      <div className={`flex items-center gap-1 p-2 border-b ${borderClass}`}>
        <button
          onClick={() => toggleStyle('bold')}
          className={`p-1.5 rounded hover:bg-yellow-200 transition-colors ${
            data.params?.style?.bold ? 'bg-yellow-200' : ''
          }`}
          title="Bold"
        >
          <Bold className="w-4 h-4 text-gray-600" />
        </button>
        <button
          onClick={() => toggleStyle('italic')}
          className={`p-1.5 rounded hover:bg-yellow-200 transition-colors ${
            data.params?.style?.italic ? 'bg-yellow-200' : ''
          }`}
          title="Italic"
        >
          <Italic className="w-4 h-4 text-gray-600" />
        </button>
        <button
          onClick={() => toggleStyle('underline')}
          className={`p-1.5 rounded hover:bg-yellow-200 transition-colors ${
            data.params?.style?.underline ? 'bg-yellow-200' : ''
          }`}
          title="Underline"
        >
          <Underline className="w-4 h-4 text-gray-600" />
        </button>

        <div className="w-px h-4 bg-yellow-200 mx-1" />

        <button
          onClick={() => toggleStyle('listType', data.params?.style?.listType === 'bullet' ? 'none' : 'bullet')}
          className={`p-1.5 rounded hover:bg-yellow-200 transition-colors ${
            data.params?.style?.listType === 'bullet' ? 'bg-yellow-200' : ''
          }`}
          title="Bullet List"
        >
          <List className="w-4 h-4 text-gray-600" />
        </button>
        <button
          onClick={() => toggleStyle('listType', data.params?.style?.listType === 'ordered' ? 'none' : 'ordered')}
          className={`p-1.5 rounded hover:bg-yellow-200 transition-colors ${
            data.params?.style?.listType === 'ordered' ? 'bg-yellow-200' : ''
          }`}
          title="Numbered List"
        >
          <ListOrdered className="w-4 h-4 text-gray-600" />
        </button>

        <div className="w-px h-4 bg-yellow-200 mx-1" />

        {[1, 2, 3].map((level) => (
          <button
            key={level}
            onClick={() => toggleStyle('headingLevel', data.params?.style?.headingLevel === level ? null : level)}
            className={`p-1.5 rounded hover:bg-yellow-200 transition-colors ${
              data.params?.style?.headingLevel === level ? 'bg-yellow-200' : ''
            }`}
            title={`Heading ${level}`}
          >
            <Type className={`w-4 h-4 text-gray-600 ${level === 1 ? 'font-bold' : ''}`} />
            <span className="sr-only">H{level}</span>
          </button>
        ))}

        <button
          className="ml-auto p-1.5 rounded hover:bg-yellow-200 transition-colors"
          title="More Options"
        >
          <MoreHorizontal className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      {/* Note Content */}
      <div className="p-4">
        <textarea
          value={data.params?.text || ''}
          onChange={(e) => updateNodeData(id, { params: { ...data.params, text: e.target.value } })}
          placeholder="Enter note text here..."
          disabled={data.params?.locked}
          className={`w-full h-[120px] bg-transparent border-none resize-none focus:ring-0 text-gray-700 placeholder-gray-400
            ${data.params?.style?.bold ? 'font-bold' : ''}
            ${data.params?.style?.italic ? 'italic' : ''}
            ${data.params?.style?.underline ? 'underline' : ''}
            ${data.params?.locked ? 'cursor-not-allowed opacity-75' : ''}
          `}
        />
      </div>

      {/* Handles for node connections */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 -ml-0.5 bg-yellow-400 border-2 border-white rounded-full"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 -mr-0.5 bg-yellow-400 border-2 border-white rounded-full"
      />
    </div>
  );
};

export default NoteNode;