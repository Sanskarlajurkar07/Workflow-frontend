import React, { useState } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { GitBranch, Plus, Minus, X, Settings, Trash2, ChevronDown } from 'lucide-react';
import { useFlowStore } from '../../../../store/flowStore';

type OperatorType = 'text' | 'number' | 'boolean' | 'list' | 'map' | 'expression';

interface Clause {
  id: string;
  inputField: string;
  operator: string;
  value: string;
}

interface Path {
  id: string;
  clauses: Clause[];
  logicalOperator: 'AND' | 'OR';
}

interface ConditionNodeData {
  paths: Path[];
}

const OPERATORS: Record<OperatorType, Array<{ value: string; label: string }>> = {
  text: [
    { value: 'contains', label: 'Contains' },
    { value: 'not_contains', label: 'Does not contain' },
    { value: 'begins_with', label: 'Begins with' },
    { value: 'not_begins_with', label: 'Does not begin with' },
    { value: 'ends_with', label: 'Ends with' },
    { value: 'not_ends_with', label: 'Does not end with' },
    { value: 'length_gt', label: 'Length >' },
    { value: 'length_lt', label: 'Length <' },
    { value: 'is_empty', label: 'Is empty' },
    { value: 'is_not_empty', label: 'Is not empty' },
    { value: 'equals', label: '=' },
    { value: 'not_equals', label: '!=' },
  ],
  number: [
    { value: 'equals', label: '=' },
    { value: 'not_equals', label: '!=' },
    { value: 'greater_than', label: '>' },
    { value: 'less_than', label: '<' },
    { value: 'greater_equal', label: '>=' },
    { value: 'less_equal', label: '<=' },
  ],
  boolean: [
    { value: 'is_true', label: 'Is true' },
    { value: 'is_false', label: 'Is false' },
  ],
  list: [
    { value: 'contains', label: 'Contains' },
    { value: 'not_contains', label: 'Does not contain' },
  ],
  map: [
    { value: 'has_key', label: 'Has key' },
    { value: 'not_has_key', label: 'Does not have key' },
  ],
  expression: [
    { value: 'evaluates_to', label: 'Evaluates to' },
  ],
};

export const ConditionNode: React.FC<NodeProps> = ({ id, data, selected }) => {
  const removeNode = useFlowStore((state) => state.removeNode);
  const updateNodeData = useFlowStore((state) => state.updateNodeParams);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedType, setSelectedType] = useState<OperatorType>('text'); // or whatever default value

  const [paths, setPaths] = useState<Path[]>(data.paths || [
    {
      id: 'path_0',
      clauses: [{ id: 'clause_0', inputField: '', operator: '', value: '' }],
      logicalOperator: 'AND',
    },
  ]);

  const handleDelete = () => {
    removeNode(id);
  };

  const toggleSettings = () => {
    setShowSettings(!showSettings);
    updateNodeData(id, { showSettings: !showSettings });
  };

  const addClause = (pathId: string) => {
    const newPaths = paths.map(path => {
      if (path.id === pathId) {
        return {
          ...path,
          clauses: [
            ...path.clauses,
            {
              id: `clause_${path.clauses.length}`,
              inputField: '',
              operator: '',
              value: '',
            },
          ],
        };
      }
      return path;
    });
    setPaths(newPaths);
    updateNodeData(id, { paths: newPaths });
  };

  const removeClause = (pathId: string, clauseId: string) => {
    const newPaths = paths.map(path => {
      if (path.id === pathId) {
        return {
          ...path,
          clauses: path.clauses.filter(clause => clause.id !== clauseId),
        };
      }
      return path;
    });
    setPaths(newPaths);
    updateNodeData(id, { paths: newPaths });
  };

  const addPath = () => {
    const newPathId = `path_${paths.length}`;
    let newPaths = [...paths];

    if (paths.length === 0) {
      newPaths = [{
        id: newPathId,
        clauses: [{ id: 'clause_0', inputField: '', operator: '', value: '' }],
        logicalOperator: 'AND',
      }];
    } else if (paths.length === 1) {
      newPaths = [
        ...paths,
        {
          id: newPathId,
          clauses: [],
          logicalOperator: 'AND',
        }
      ];
    } else {
      const elsePath = newPaths.pop();
      newPaths.push({
        id: newPathId,
        clauses: [{ id: 'clause_0', inputField: '', operator: '', value: '' }],
        logicalOperator: 'AND',
      });
      if (elsePath) {
        newPaths.push(elsePath);
      }
    }
    
    setPaths(newPaths);
    updateNodeData(id, { paths: newPaths });
  };

  const removePath = (pathId: string) => {
    const newPaths = paths.filter(path => path.id !== pathId);
    setPaths(newPaths);
    updateNodeData(id, { paths: newPaths });
  };

  const updateClause = (pathId: string, clauseId: string, field: keyof Clause, value: string) => {
    const newPaths = paths.map(path => {
      if (path.id === pathId) {
        return {
          ...path,
          clauses: path.clauses.map(clause => {
            if (clause.id === clauseId) {
              return { ...clause, [field]: value };
            }
            return clause;
          }),
        };
      }
      return path;
    });
    setPaths(newPaths);
    updateNodeData(id, { paths: newPaths });
  };

  const toggleLogicalOperator = (pathId: string) => {
    const newPaths = paths.map(path => {
      if (path.id === pathId) {
        return {
          ...path,
          logicalOperator: path.logicalOperator === 'AND' ? ('OR' as 'OR') : ('AND' as 'AND'),
        };
      }
      return path;
    });
    setPaths(newPaths);
    updateNodeData(id, { paths: newPaths });
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg overflow-hidden ${
      selected ? 'ring-2 ring-blue-500' : 'border border-gray-200'
    }`}>
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-500 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
              <GitBranch className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-medium text-white">Condition Node</h3>
              <p className="text-xs text-blue-50/80">Flow Control</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleSettings}
              className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/20 transition-colors"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={handleDelete}
              className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-red-400/20 transition-colors"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Operator Type
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as OperatorType)}
                className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {Object.keys(OPERATORS).map((type) => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="p-4 space-y-4">
        {paths.map((path, pathIndex) => (
          <div
            key={path.id}
            className="bg-gray-50 rounded-lg p-3 border border-gray-200 hover:border-blue-200 transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="px-2.5 py-1 text-sm font-medium text-white bg-blue-500 rounded-full">
                {pathIndex === 0 ? 'IF' : pathIndex === paths.length - 1 ? 'ELSE' : 'ELSE IF'}
              </span>
              {pathIndex !== paths.length - 1 && pathIndex !== 0 && (
                <button
                  onClick={() => removePath(path.id)}
                  className="p-1 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {pathIndex !== paths.length - 1 && (
              <div className="space-y-3">
                {path.clauses.map((clause, clauseIndex) => (
                  <div key={clause.id} className="group">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Input field"
                        className="flex-1 px-3 py-1.5 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={clause.inputField}
                        onChange={(e) => updateClause(path.id, clause.id, 'inputField', e.target.value)}
                      />
                      <select
                        className="px-3 py-1.5 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={clause.operator}
                        onChange={(e) => updateClause(path.id, clause.id, 'operator', e.target.value)}
                      >
                        <option value="">Select operator</option>
                        {OPERATORS[selectedType].map(op => (
                          <option key={op.value} value={op.value}>
                            {op.label}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        placeholder="Value"
                        className="flex-1 px-3 py-1.5 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={clause.value}
                        onChange={(e) => updateClause(path.id, clause.id, 'value', e.target.value)}
                      />
                      <button
                        onClick={() => removeClause(path.id, clause.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                    </div>
                    {clauseIndex < path.clauses.length - 1 && (
                      <div className="flex justify-center my-2">
                        <button
                          onClick={() => toggleLogicalOperator(path.id)}
                          className="px-3 py-1 text-sm font-medium text-gray-600 bg-gray-100 rounded-full hover:bg-gray-200 flex items-center gap-1"
                        >
                          {path.logicalOperator}
                          <ChevronDown className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                <button
                  onClick={() => addClause(path.id)}
                  className="mt-3 flex items-center gap-1 text-sm text-blue-500 hover:text-blue-600"
                >
                  <Plus className="w-4 h-4" /> Add Clause
                </button>
              </div>
            )}
          </div>
        ))}

        <button
          onClick={addPath}
          className="w-full px-4 py-2 text-sm text-blue-500 hover:text-blue-600 border border-blue-200 hover:border-blue-300 rounded-lg flex items-center justify-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Path
        </button>
      </div>

      {/* Status Bar */}
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <span className={`w-2 h-2 rounded-full ${
            paths[0]?.clauses[0]?.inputField ? 'bg-green-500' : 'bg-gray-400'
          }`} />
          <span>{paths[0]?.clauses[0]?.inputField ? 'Configured' : 'Not configured'}</span>
        </span>
        <span>{paths.length} path{paths.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Handles */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 -ml-0.5 bg-blue-500 border-2 border-white rounded-full"
      />
      {paths.map((path, index) => (
        <Handle
          key={path.id}
          type="source"
          position={Position.Right}
          id={`path_${index}`}
          className="w-3 h-3 -mr-0.5 bg-green-500 border-2 border-white rounded-full"
          style={{ top: `${(index + 1) * (100 / (paths.length + 1))}%` }}
        />
      ))}
    </div>
  );
};

export default ConditionNode;