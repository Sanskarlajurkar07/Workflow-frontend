import React, { useState, useCallback, useEffect } from 'react';
import { 
  Card, 
  Button, 
  Select, 
  Input, 
  Divider, 
  Tag, 
  Typography, 
  Space, 
  Tooltip, 
  Popover,
  Switch,
  Radio,
  Alert,
  Badge,
  Form,
  InputGroup
} from 'antd';
import { 
  PlusOutlined, 
  DeleteOutlined, 
  ApartmentOutlined,
  QuestionCircleOutlined,
  ArrowRightOutlined,
  InfoCircleOutlined,
  ForkOutlined,
  EditOutlined,
  TagOutlined
} from '@ant-design/icons';
import { Handle, Position, NodeProps } from 'reactflow';
import { v4 as uuidv4 } from 'uuid';
import './NodeStyles.css';

const { Option } = Select;
const { Text } = Typography;

// List of available operators with descriptions
const OPERATORS = [
  { value: '==', label: 'Equals', description: 'Check if values are equal' },
  { value: '!=', label: 'Not Equals', description: 'Check if values are not equal' },
  { value: '>', label: 'Greater Than', description: 'Check if left value is greater' },
  { value: '>=', label: 'Greater Than/Equal', description: 'Check if left value is greater or equal' },
  { value: '<', label: 'Less Than', description: 'Check if left value is less' },
  { value: '<=', label: 'Less Than/Equal', description: 'Check if left value is less or equal' },
  { value: 'contains', label: 'Contains', description: 'Check if string/array contains value' },
  { value: 'not_contains', label: 'Not Contains', description: 'Check if string/array does not contain value' },
  { value: 'startswith', label: 'Starts With', description: 'Check if string starts with value' },
  { value: 'endswith', label: 'Ends With', description: 'Check if string ends with value' },
  { value: 'is_empty', label: 'Is Empty', description: 'Check if value is empty/null' },
  { value: 'is_not_empty', label: 'Is Not Empty', description: 'Check if value is not empty/null' },
  { value: 'matches_regex', label: 'Matches Regex', description: 'Check if string matches regex pattern' },
  { value: 'in_list', label: 'In List', description: 'Check if value is in a list (comma-separated)' },
  { value: 'not_in_list', label: 'Not In List', description: 'Check if value is not in a list (comma-separated)' },
  { value: 'length_equals', label: 'Length Equals', description: 'Check if length equals value' },
  { value: 'length_greater_than', label: 'Length > Value', description: 'Check if length is greater than value' },
  { value: 'length_less_than', label: 'Length < Value', description: 'Check if length is less than value' },
  { value: 'date_before', label: 'Date Before', description: 'Check if date is before value' },
  { value: 'date_after', label: 'Date After', description: 'Check if date is after value' },
  { value: 'date_equals', label: 'Date Equals', description: 'Check if date is the same' },
  { value: 'date_between', label: 'Date Between', description: 'Check if date is between two dates (comma-separated)' },
  { value: 'type_equals', label: 'Type Equals', description: 'Check if type matches (string, number, boolean, array, object)' },
];

// Default path structure - Always create with 2 paths (if/else)
const DEFAULT_PATHS = [
  {
    id: uuidv4(),
    name: 'If Condition Is True',
    clauses: [
      { 
        id: uuidv4(), 
        inputField: 'input', 
        operator: '==', 
        value: '' 
      }
    ],
    logicalOperator: 'AND',
  },
  {
    id: uuidv4(),
    name: 'Else',
    clauses: [],
    logicalOperator: 'AND',
  },
];

// Placeholder for field suggestions with improved suggestions
const FIELD_SUGGESTIONS = [
  { label: 'input', value: 'input', description: 'Main input value to the node' },
  { label: 'value', value: 'value', description: 'Additional value passed to the node' },
  { label: 'data.name', value: 'data.name', description: 'Name field from data object' },
  { label: 'data.id', value: 'data.id', description: 'ID field from data object' },
  { label: 'result.status', value: 'result.status', description: 'Status field from result object' },
  { label: 'result.success', value: 'result.success', description: 'Success field from result object' },
  { label: 'previous.output', value: 'previous.output', description: 'Output from previous node' },
  { label: 'workflow.variables.userInput', value: 'workflow.variables.userInput', description: 'User input variable' },
];

// Variable pattern for syntax highlighting
const VARIABLE_PATTERN = /\{\{(.*?)\}\}/g;

const ConditionNode: React.FC<NodeProps> = ({ data, id }) => {
  // Initialize with either existing data or defaults - Always ensure there are at least 2 paths
  const [paths, setPaths] = useState(data.params?.paths || DEFAULT_PATHS);
  const [isHelpVisible, setIsHelpVisible] = useState(false);
  const [isAdvancedMode, setIsAdvancedMode] = useState(false);
  const [suggestedVariables, setSuggestedVariables] = useState<string[]>([]);
  const [variableName, setVariableName] = useState(data.params?.variableName || `condition_${id.substring(0, 4)}`);
  
  // Initialize with at least 2 paths if there are less
  useEffect(() => {
    if (paths.length < 2) {
      const newPaths = [...paths];
      if (paths.length === 0) {
        newPaths.push(DEFAULT_PATHS[0]);
        newPaths.push(DEFAULT_PATHS[1]);
      } else if (paths.length === 1) {
        newPaths.push(DEFAULT_PATHS[1]);
      }
      setPaths(newPaths);
    }
  }, []);
  
  // Update parent data when paths change
  useEffect(() => {
    if (data.updateNodeData) {
      data.updateNodeData({
        ...data,
        params: {
          ...data.params,
          paths,
          variableName
        }
      });
    }
  }, [paths, variableName, data]);

  // Add a new path
  const addPath = useCallback(() => {
    // Insert new path before the Else path
    const elsePath = paths[paths.length - 1];
    const newPaths = paths.slice(0, -1);
    
    newPaths.push({
      id: uuidv4(),
      name: `Condition ${newPaths.length + 1}`,
      clauses: [{ 
        id: uuidv4(), 
        inputField: 'input', 
        operator: '==', 
        value: '' 
      }],
      logicalOperator: 'AND',
    });
    
    // Add the else path back at the end
    newPaths.push(elsePath);
    
    setPaths(newPaths);
  }, [paths]);

  // Delete a path
  const deletePath = useCallback((pathId: string) => {
    // Don't delete if only two paths remain (If/Else)
    if (paths.length <= 2) {
      return;
    }
    
    // Never delete the last path (Else path)
    if (pathId === paths[paths.length - 1].id) {
      return;
    }
    
    setPaths(paths.filter(path => path.id !== pathId));
  }, [paths]);

  // Add a clause to a path
  const addClause = useCallback((pathId: string) => {
    setPaths(paths.map(path => {
      if (path.id === pathId) {
        return {
          ...path,
          clauses: [
            ...path.clauses,
            { 
              id: uuidv4(), 
              inputField: 'input', 
              operator: '==', 
              value: '' 
            }
          ]
        };
      }
      return path;
    }));
  }, [paths]);

  // Delete a clause from a path
  const deleteClause = useCallback((pathId: string, clauseId: string) => {
    setPaths(paths.map(path => {
      if (path.id === pathId) {
        return {
          ...path,
          clauses: path.clauses.filter(clause => clause.id !== clauseId)
        };
      }
      return path;
    }));
  }, [paths]);

  // Update a path's properties
  const updatePath = useCallback((pathId: string, field: string, value: string) => {
    setPaths(paths.map(path => {
      if (path.id === pathId) {
        return {
          ...path,
          [field]: value
        };
      }
      return path;
    }));
  }, [paths]);

  // Update a clause's properties
  const updateClause = useCallback((pathId: string, clauseId: string, field: string, value: string) => {
    setPaths(paths.map(path => {
      if (path.id === pathId) {
        return {
          ...path,
          clauses: path.clauses.map(clause => {
            if (clause.id === clauseId) {
              return {
                ...clause,
                [field]: value
              };
            }
            return clause;
          })
        };
      }
      return path;
    }));
  }, [paths]);

  // Helper function to check if an operator needs a value
  const shouldShowValueField = (operator: string) => {
    return !['is_empty', 'is_not_empty'].includes(operator);
  };

  // Check if this is the else path (last path)
  const isElsePath = (index: number) => {
    return index === paths.length - 1;
  };

  // Highlight variables in a text string
  const highlightVariables = (text: string) => {
    if (!text) return text;
    
    const parts = text.split(VARIABLE_PATTERN);
    if (parts.length <= 1) return text;
    
    return parts.map((part, i) => {
      if (i % 2 === 1) {
        return <Tag color="blue" key={i}>{`{{${part}}}`}</Tag>;
      }
      return part;
    });
  };

  // Get variable suggestions
  const handleFocus = () => {
    // Here you could dynamically fetch variables from your workflow context
    setSuggestedVariables([
      '{{workflow.variables.userInput}}',
      '{{previous.output}}',
      '{{data.result}}',
      '{{currentDate}}',
    ]);
  };

  // Insert variable at cursor position
  const insertVariable = (input: HTMLInputElement, variable: string) => {
    const start = input.selectionStart || 0;
    const end = input.selectionEnd || 0;
    const currentValue = input.value;
    
    const newValue = currentValue.substring(0, start) + variable + currentValue.substring(end);
    
    // Return the new value and the new cursor position
    return {
      value: newValue,
      position: start + variable.length
    };
  };

  // Render help information for operators
  const renderOperatorHelp = () => (
    <div className="p-4 max-w-md">
      <h3 className="text-lg font-medium mb-3">Available Operators</h3>
      <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
        {OPERATORS.map(op => (
          <div key={op.value} className="mb-2 pb-2 border-b border-gray-100">
            <div className="font-semibold">{op.label} <code className="text-xs bg-gray-100 p-1 rounded">{op.value}</code></div>
            <div className="text-sm text-gray-600">{op.description}</div>
          </div>
        ))}
      </div>
      <Divider />
      <Alert 
        type="info" 
        message="Variables"
        description={
          <div>
            <p>You can use variables in any field by typing <code>{'{{variableName}}'}</code></p>
            <p>Examples: <code>{'{{input}}'}</code>, <code>{'{{workflow.variables.userValue}}'}</code></p>
          </div>
        }
      />
    </div>
  );

  return (
    <Card
      title={
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <ForkOutlined style={{ marginRight: 8 }} />
          <span>Condition</span>
          <Button 
            type="text" 
            size="small" 
            icon={<QuestionCircleOutlined />} 
            onClick={() => setIsHelpVisible(!isHelpVisible)}
            style={{ marginLeft: 'auto' }}
          />
        </div>
      }
      size="small"
      className="condition-node"
      extra={
        <Space>
          <Switch 
            size="small" 
            checked={isAdvancedMode} 
            onChange={checked => setIsAdvancedMode(checked)} 
            checkedChildren="Advanced" 
            unCheckedChildren="Simple" 
          />
        </Space>
      }
    >
      {/* Enhanced Variable Name Field */}
      <div className="mb-4" style={{ padding: '12px', borderRadius: '6px', background: '#f9f9ff', border: '1px solid #e6e6ff' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
          <TagOutlined style={{ color: '#5c5cd6', marginRight: 8, fontSize: '16px' }} />
          <Text strong style={{ color: '#444', fontSize: '14px' }}>Variable Name</Text>
        </div>
        <Input
          size="large"
          prefix={<span style={{ color: '#7676f4', fontWeight: 'bold' }}>{'{{'}}</span>}
          suffix={<span style={{ color: '#7676f4', fontWeight: 'bold' }}>{'}}'}</span>}
          value={variableName}
          onChange={(e) => setVariableName(e.target.value)}
          placeholder="condition_result"
          style={{ borderColor: '#d9d9ff', fontSize: '14px' }}
        />
        <div style={{ display: 'flex', alignItems: 'center', marginTop: 8, fontSize: '13px', color: '#666' }}>
          <InfoCircleOutlined style={{ marginRight: 6, color: '#7676f4' }} />
          Reference as: <Tag color="purple" style={{ marginLeft: 6, fontSize: '13px' }}>{`{{${variableName}}}`}</Tag>
        </div>
      </div>

      {isHelpVisible && (
        <Alert
          message="Condition Node Help"
          description={
            <div>
              <p>This node routes flow based on conditions you define.</p>
              <p>1. Add paths for different conditions</p>
              <p>2. Add clauses within each path</p>
              <p>3. The first path where all conditions match will be followed</p>
              <p>4. The last path (Else) is taken if no other conditions match</p>
              <p>5. The condition result is stored in <Tag color="purple">{`{{${variableName}}}`}</Tag> variable</p>
            </div>
          }
          type="info"
          showIcon
          closable
          onClose={() => setIsHelpVisible(false)}
          style={{ marginBottom: 16 }}
        />
      )}
      
      <div className="paths-container">
        {paths.map((path, pathIndex) => (
          <div 
            key={path.id} 
            className={`path-item ${isElsePath(pathIndex) ? 'else-path' : ''}`}
            style={{ 
              border: '1px solid #f0f0f0', 
              borderRadius: '4px', 
              marginBottom: '8px',
              backgroundColor: isElsePath(pathIndex) ? '#fafafa' : '#fff'
            }}
          >
            <div className="path-header" style={{ padding: '8px', backgroundColor: isElsePath(pathIndex) ? '#f5f5f5' : '#e6f7ff', display: 'flex', alignItems: 'center', borderBottom: '1px solid #f0f0f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                {isElsePath(pathIndex) ? (
                  <Badge color="orange" text={<span style={{ fontWeight: 'bold' }}>ELSE</span>} />
                ) : (
                  <>
                    <Badge color="blue" text={<span style={{ fontWeight: 'bold' }}>IF</span>} />
                    <Input
                      value={path.name}
                      onChange={e => updatePath(path.id, 'name', e.target.value)}
                      size="small"
                      placeholder="Path name"
                      style={{ marginLeft: 8, width: '150px' }}
                      prefix={<EditOutlined style={{ color: '#bfbfbf' }} />}
                    />
                  </>
                )}
              </div>
              {!isElsePath(pathIndex) && (
                <Space>
                  {path.clauses.length > 1 && (
                    <Radio.Group 
                      value={path.logicalOperator}
                      size="small"
                      onChange={e => updatePath(path.id, 'logicalOperator', e.target.value)}
                      buttonStyle="solid"
                    >
                      <Radio.Button value="AND">AND</Radio.Button>
                      <Radio.Button value="OR">OR</Radio.Button>
                    </Radio.Group>
                  )}
                  <Button 
                    type="text" 
                    size="small" 
                    icon={<DeleteOutlined />} 
                    onClick={() => deletePath(path.id)}
                    disabled={paths.length <= 2}
                    danger
                  />
                </Space>
              )}
            </div>

            {/* Path content with clauses */}
            {!isElsePath(pathIndex) && (
              <div className="path-content" style={{ padding: '8px' }}>
                {path.clauses.length === 0 ? (
                  <Alert
                    message="No conditions defined"
                    description="This path will always match. Add conditions to make it conditional."
                    type="warning"
                    showIcon
                  />
                ) : (
                  path.clauses.map((clause, clauseIndex) => (
                    <div key={clause.id} className="clause-item" style={{ marginBottom: '8px', padding: '8px', backgroundColor: '#fafafa', borderRadius: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                        {/* Input field */}
                        <Popover
                          title="Select Input Field"
                          content={
                            <div style={{ maxWidth: '250px' }}>
                              {FIELD_SUGGESTIONS.map(field => (
                                <div
                                  key={field.value}
                                  onClick={() => updateClause(path.id, clause.id, 'inputField', field.value)}
                                  style={{ padding: '4px 8px', cursor: 'pointer', borderRadius: '4px', marginBottom: '4px' }}
                                  className="hover:bg-blue-50"
                                >
                                  <div className="font-semibold">{field.label}</div>
                                  <div className="text-xs text-gray-500">{field.description}</div>
                                </div>
                              ))}
                            </div>
                          }
                          trigger="click"
                        >
                          <Input 
                            value={clause.inputField}
                            onChange={e => updateClause(path.id, clause.id, 'inputField', e.target.value)}
                            placeholder="Field name"
                            size="small"
                            style={{ width: '120px' }}
                            onFocus={handleFocus}
                          />
                        </Popover>

                        {/* Operator */}
                        <Tooltip title="Select comparison operator">
                          <Select
                            value={clause.operator}
                            onChange={value => updateClause(path.id, clause.id, 'operator', value)}
                            style={{ width: '120px' }}
                            size="small"
                            placeholder="Operator"
                          >
                            {OPERATORS.map(op => (
                              <Option key={op.value} value={op.value} title={op.description}>
                                {op.label}
                              </Option>
                            ))}
                          </Select>
                        </Tooltip>

                        {/* Value field */}
                        {shouldShowValueField(clause.operator) && (
                          <Popover
                            title="Insert Variable"
                            content={
                              <div>
                                <div style={{ marginBottom: '8px' }}>Click to insert a variable:</div>
                                {suggestedVariables.map(variable => (
                                  <Tag
                                    key={variable}
                                    color="blue"
                                    style={{ cursor: 'pointer', margin: '4px' }}
                                    onClick={() => {
                                      const inputEl = document.getElementById(`value-${path.id}-${clause.id}`) as HTMLInputElement;
                                      if (inputEl) {
                                        const result = insertVariable(inputEl, variable);
                                        updateClause(path.id, clause.id, 'value', result.value);
                                        // Set cursor position after updating
                                        setTimeout(() => {
                                          inputEl.focus();
                                          inputEl.setSelectionRange(result.position, result.position);
                                        }, 0);
                                      }
                                    }}
                                  >
                                    {variable}
                                  </Tag>
                                ))}
                              </div>
                            }
                            trigger="click"
                          >
                            <Input
                              id={`value-${path.id}-${clause.id}`}
                              value={clause.value}
                              onChange={e => updateClause(path.id, clause.id, 'value', e.target.value)}
                              placeholder="Value"
                              size="small"
                              style={{ width: '120px' }}
                              onFocus={handleFocus}
                              suffix={<InfoCircleOutlined style={{ color: '#1890ff' }} />}
                            />
                          </Popover>
                        )}

                        {/* Delete button */}
                        <Button
                          type="text"
                          size="small"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => deleteClause(path.id, clause.id)}
                          disabled={path.clauses.length <= 1}
                        />
                      </div>

                      {/* Logical operator indicator between clauses */}
                      {clauseIndex < path.clauses.length - 1 && (
                        <div style={{ 
                          margin: '8px 0', 
                          padding: '2px 8px', 
                          backgroundColor: path.logicalOperator === 'AND' ? '#e6f7ff' : '#fff7e6',
                          color: path.logicalOperator === 'AND' ? '#1890ff' : '#fa8c16',
                          borderRadius: '4px',
                          display: 'inline-block',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}>
                          {path.logicalOperator}
                        </div>
                      )}
                    </div>
                  ))
                )}

                {/* Add clause button */}
                <Button
                  type="dashed"
                  size="small"
                  icon={<PlusOutlined />}
                  onClick={() => addClause(path.id)}
                  style={{ width: '100%' }}
                >
                  Add Condition
                </Button>
              </div>
            )}

            {/* Handle for each path */}
            <Handle
              type="source"
              position={Position.Right}
              id={`handle-${path.id}`}
              style={{ top: isElsePath(pathIndex) ? '50%' : `${30 + (pathIndex * 20)}%`, background: isElsePath(pathIndex) ? '#fa8c16' : '#1890ff' }}
            />
          </div>
        ))}

        {/* Add new path button */}
        <Button
          type="dashed"
          block
          icon={<PlusOutlined />}
          onClick={addPath}
          style={{ marginTop: '8px' }}
        >
          Add Path
        </Button>
      </div>

      {/* Main input and output handles */}
      <Handle type="target" position={Position.Left} style={{ background: '#722ed1' }} />

      {/* Operator help popover */}
      <Popover
        content={renderOperatorHelp()}
        title="Operators Reference"
        trigger="click"
        visible={isHelpVisible}
        onVisibleChange={setIsHelpVisible}
        placement="rightTop"
      />
    </Card>
  );
};

export default ConditionNode; 