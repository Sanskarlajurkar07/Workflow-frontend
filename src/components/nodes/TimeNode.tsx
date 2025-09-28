import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Select, 
  Input,
  DatePicker,
  TimePicker,
  InputNumber,
  Tabs, 
  Space, 
  Tooltip, 
  Divider,
  Typography,
  Alert,
  Tag,
  Popover,
  Button
} from 'antd';
import moment from 'moment-timezone';
import { Handle, Position, NodeProps } from 'reactflow';
import { 
  ClockCircleOutlined, 
  GlobalOutlined,
  PlusOutlined,
  MinusOutlined,
  CalendarOutlined,
  InfoCircleOutlined,
  FieldTimeOutlined,
  QuestionCircleOutlined,
  CheckCircleOutlined,
  TagOutlined,
  SettingsOutlined,
  DeleteOutlined,
  RefreshOutlined
} from '@ant-design/icons';
import './NodeStyles.css';
import { useFlowStore } from '../../store/flowStore';

const { Option, OptGroup } = Select;
const { Text } = Typography;
const { TabPane } = Tabs;

// List of common time zones
const COMMON_TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Los_Angeles',
  'America/Chicago',
  'Europe/London',
  'Europe/Paris',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Australia/Sydney',
  'Pacific/Auckland'
];

// All time zones from moment-timezone
const ALL_TIMEZONES = moment.tz.names();

// Time operations
const TIME_OPERATIONS = [
  { value: 'current_time', label: 'Current Time', description: 'Get the current time' },
  { value: 'parse_input', label: 'Parse Input', description: 'Parse a date/time from input' },
  { value: 'add_time', label: 'Add Time', description: 'Add a time period to a date' },
  { value: 'subtract_time', label: 'Subtract Time', description: 'Subtract a time period from a date' },
  { value: 'start_of', label: 'Start Of Period', description: 'Get the start of a time period' },
  { value: 'end_of', label: 'End Of Period', description: 'Get the end of a time period' },
  { value: 'next_weekday', label: 'Next Weekday', description: 'Get the next occurrence of a weekday' },
  { value: 'previous_weekday', label: 'Previous Weekday', description: 'Get the previous occurrence of a weekday' }
];

// Time units
const TIME_UNITS = [
  { value: 'seconds', label: 'Seconds' },
  { value: 'minutes', label: 'Minutes' },
  { value: 'hours', label: 'Hours' },
  { value: 'days', label: 'Days' },
  { value: 'weeks', label: 'Weeks' },
  { value: 'months', label: 'Months' },
  { value: 'years', label: 'Years' },
  { value: 'business_days', label: 'Business Days (Skip Weekends)' }
];

// Period types for start_of and end_of operations
const PERIOD_TYPES = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
  { value: 'quarter', label: 'Quarter' },
  { value: 'year', label: 'Year' }
];

// Weekdays for next_weekday and previous_weekday operations
const WEEKDAYS = [
  { value: '0', label: 'Monday' },
  { value: '1', label: 'Tuesday' },
  { value: '2', label: 'Wednesday' },
  { value: '3', label: 'Thursday' },
  { value: '4', label: 'Friday' },
  { value: '5', label: 'Saturday' },
  { value: '6', label: 'Sunday' }
];

// Default format suggestions
const FORMAT_SUGGESTIONS = [
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (ISO Date)' },
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (US Date)' },
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (EU Date)' },
  { value: 'YYYY-MM-DD HH:mm:ss', label: 'YYYY-MM-DD HH:mm:ss (ISO Datetime)' },
  { value: 'HH:mm:ss', label: 'HH:mm:ss (24h Time)' },
  { value: 'hh:mm A', label: 'hh:mm A (12h Time)' },
  { value: 'dddd, MMMM Do YYYY', label: 'dddd, MMMM Do YYYY (Full Date)' }
];

// Available variables for use in expressions
const AVAILABLE_VARIABLES = [
  { name: '{{input}}', description: 'Main input value' },
  { name: '{{workflow.variables.startDate}}', description: 'Start date from workflow variables' },
  { name: '{{workflow.variables.endDate}}', description: 'End date from workflow variables' },
  { name: '{{workflow.variables.dueDate}}', description: 'Due date from workflow variables' },
  { name: '{{previous.date}}', description: 'Date from previous node' },
  { name: '{{now}}', description: 'Current date/time' }
];

// Variable pattern for syntax highlighting
const VARIABLE_PATTERN = /\{\{(.*?)\}\}/g;

interface TimeNodeProps {
  data: {
    params?: {
      nodeName?: string;
      showSettings?: boolean;
      timezone?: string;
      operation?: string;
      inputDate?: string;
      modifyValue?: number;
      modifyUnit?: string;
      customFormat?: string;
      variableName?: string;
    };
  };
  id: string;
  selected?: boolean;
}

const TimeNode: React.FC<TimeNodeProps> = ({ data, id, selected }) => {
  const removeNode = useFlowStore((state) => state.removeNode);
  const updateNodeData = useFlowStore((state) => state.updateNodeParams);
  
  const [showHelp, setShowHelp] = useState(false);
  const [activeTab, setActiveTab] = useState('operation');
  const [showVariables, setShowVariables] = useState(false);
  const [currentField, setCurrentField] = useState<string | null>(null);
  const [variableName, setVariableName] = useState(data.params?.variableName || `time_${id.substring(0, 4)}`);

  // Get timezone from data or default to user's timezone
  const timezone = data.params?.timezone || moment.tz.guess();
  const operation = data.params?.operation || 'current_time';
  const inputDate = data.params?.inputDate || '';
  const modifyValue = data.params?.modifyValue || 0;
  const modifyUnit = data.params?.modifyUnit || 'days';
  const customFormat = data.params?.customFormat || '';

  const handleDelete = () => {
    removeNode(id);
  };

  const toggleSettings = () => {
    updateNodeData(id, { showSettings: !data.params?.showSettings });
  };

  // Handle variable insertion
  const insertVariable = (fieldName: string, variable: string) => {
    let currentValue = data.params?.[fieldName] || '';
    if (typeof currentValue === 'number') {
      currentValue = currentValue.toString();
    }
    updateNodeData(id, { [fieldName]: currentValue + variable });
  };

  // Toggle variable panel and set current field
  const toggleVariables = (fieldName: string) => {
    if (currentField === fieldName && showVariables) {
      setShowVariables(false);
      setCurrentField(null);
    } else {
      setShowVariables(true);
      setCurrentField(fieldName);
    }
  };

  // Update variable name
  const handleVariableNameChange = (newName: string) => {
    setVariableName(newName);
    updateNodeData(id, { variableName: newName });
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg overflow-hidden ${
      selected ? 'ring-2 ring-blue-500' : 'border border-gray-200'
    }`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-teal-500 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
              <ClockCircleOutlined style={{ color: '#fff' }} />
            </div>
            <div>
              <h3 className="font-medium text-white">Time Node</h3>
              <p className="text-xs text-blue-50/80">
                {TIME_OPERATIONS.find(op => op.value === operation)?.label || 'Date & Time Operations'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowHelp(!showHelp)}
              className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/20 transition-colors"
              title="Help"
            >
              <QuestionCircleOutlined style={{ color: '#fff' }} />
            </button>
            <button
              onClick={toggleSettings}
              className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/20 transition-colors"
              title="Settings"
            >
              <SettingsOutlined style={{ color: '#fff' }} />
            </button>
            <button
              onClick={handleDelete}
              className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-red-400/20 transition-colors"
              title="Delete"
            >
              <DeleteOutlined style={{ color: '#fff' }} />
            </button>
          </div>
        </div>
      </div>

      {/* Help Panel */}
      {showHelp && (
        <div className="p-4 bg-blue-50 border-b border-blue-100">
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <InfoCircleOutlined style={{ color: '#1890ff', marginTop: 2 }} />
              <div>
                <h4 className="font-medium text-blue-700 text-sm">About Time Nodes</h4>
                <p className="text-xs text-blue-600">
                  Time nodes allow you to perform date and time operations like getting the current time,
                  parsing dates, adding or subtracting time intervals, and formatting dates.
                </p>
              </div>
            </div>
            
            <div className="bg-white rounded-md p-3 text-xs space-y-2 border border-blue-100">
              <h5 className="font-medium text-blue-700">Output Format</h5>
              <p className="text-gray-600">
                The node outputs a comprehensive time object with multiple formats and components:
              </p>
              <ul className="space-y-1 text-gray-600 list-disc pl-4">
                <li><code>iso</code> - ISO 8601 format</li>
                <li><code>timestamp</code> - Unix timestamp (seconds)</li>
                <li><code>formatted</code> - Human-readable format</li>
                <li><code>year, month, day, hour, minute</code> - Individual components</li>
                <li><code>custom_formatted</code> - Custom format if provided</li>
              </ul>
              <p className="mt-2 text-blue-600">Access results with: <code>{`{{${variableName}}}`}</code></p>
            </div>
            
            <button
              onClick={() => setShowHelp(false)}
              className="w-full text-blue-600 text-xs text-center hover:text-blue-700"
            >
              Close Help
            </button>
          </div>
        </div>
      )}

      {/* Settings Panel */}
      {data.params?.showSettings && (
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Node Name</label>
              <input
                type="text"
                value={data.params?.nodeName || 'time_0'}
                onChange={(e) => updateNodeData(id, { nodeName: e.target.value })}
                className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="p-4 space-y-4">
        {/* Enhanced Variable Name Field */}
        <div className="mb-4" style={{ padding: '12px', borderRadius: '6px', background: '#f9f7ff', border: '1px solid #e6e0ff' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
            <TagOutlined style={{ color: '#8a6bfc', marginRight: 8, fontSize: '16px' }} />
            <Text strong style={{ color: '#444', fontSize: '14px' }}>Variable Name</Text>
          </div>
          <Input
            size="large"
            prefix={<span style={{ color: '#8a6bfc', fontWeight: 'bold' }}>{'{{'}}</span>}
            suffix={<span style={{ color: '#8a6bfc', fontWeight: 'bold' }}>{'}}'}</span>}
            value={variableName}
            onChange={(e) => handleVariableNameChange(e.target.value)}
            placeholder="time_result"
            style={{ borderColor: '#e6e0ff', fontSize: '14px' }}
          />
          <div style={{ display: 'flex', alignItems: 'center', marginTop: 8, fontSize: '13px', color: '#666' }}>
            <InfoCircleOutlined style={{ marginRight: 6, color: '#8a6bfc' }} />
            Reference as: <Tag color="purple" style={{ marginLeft: 6, fontSize: '13px' }}>{`{{${variableName}}}`}</Tag>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b">
          <button
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'operation' 
                ? 'text-blue-600 border-b-2 border-blue-500' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('operation')}
          >
            <CalendarOutlined className="w-4 h-4 inline-block mr-1" />
            Operation
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'timezone' 
                ? 'text-blue-600 border-b-2 border-blue-500' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('timezone')}
          >
            <GlobalOutlined className="w-4 h-4 inline-block mr-1" />
            Timezone
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'format' 
                ? 'text-blue-600 border-b-2 border-blue-500' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('format')}
          >
            <CalendarOutlined className="w-4 h-4 inline-block mr-1" />
            Format
          </button>
        </div>

        {/* Tab Content */}
        <div className="mt-3">
          {/* Operation Tab */}
          {activeTab === 'operation' && (
            <div className="space-y-4">
              {/* Operation Type */}
              <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-500">Time Operation</label>
                <div className="relative">
                  <select
                    value={data.params?.operation || 'current_time'}
                    onChange={(e) => updateNodeData(id, { operation: e.target.value })}
                    className="w-full appearance-none px-3 py-2 bg-white text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                  >
                    {TIME_OPERATIONS.map(op => (
                      <option key={op.value} value={op.value} title={op.description}>
                        {op.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                </div>
                <p className="text-xs text-gray-400">
                  {TIME_OPERATIONS.find(op => op.value === (data.params?.operation || 'current_time'))?.description}
                </p>
              </div>

              {/* Operation-specific inputs */}
              {operation === 'parse_input' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-medium text-gray-500">Input Date/Time</label>
                    <button
                      onClick={() => toggleVariables('inputDate')}
                      className={`p-1 rounded text-xs ${showVariables && currentField === 'inputDate' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      Variables
                    </button>
                  </div>
                  <input
                    type="text"
                    value={data.params?.inputDate || ''}
                    onChange={(e) => updateNodeData(id, { inputDate: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="2023-01-01 or variable"
                  />
                  <p className="text-xs text-gray-400">
                    Enter a date/time string to parse or use a variable
                  </p>
                  
                  {/* Variables panel */}
                  {showVariables && currentField === 'inputDate' && (
                    <div className="p-2 bg-blue-50 rounded-md border border-blue-100 mt-1">
                      <div className="text-xs text-blue-700 mb-1">Click to insert a variable:</div>
                      <div className="flex flex-wrap gap-1">
                        {AVAILABLE_VARIABLES.map(variable => (
                          <button
                            key={variable.name}
                            onClick={() => insertVariable('inputDate', variable.name)}
                            className="px-2 py-1 text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 rounded font-mono"
                          >
                            {variable.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {(operation === 'add_time' || operation === 'subtract_time') && (
                <div className="space-y-4">
                  {/* Time Value */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-medium text-gray-500">
                        {operation === 'add_time' ? 'Amount to Add' : 'Amount to Subtract'}
                      </label>
                      <button
                        onClick={() => toggleVariables('modifyValue')}
                        className={`p-1 rounded text-xs ${showVariables && currentField === 'modifyValue' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:text-gray-700'}`}
                      >
                        Variables
                      </button>
                    </div>
                    <input
                      type="number"
                      value={data.params?.modifyValue || 0}
                      onChange={(e) => updateNodeData(id, { modifyValue: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Amount"
                      min="0"
                    />
                    
                    {/* Variables panel */}
                    {showVariables && currentField === 'modifyValue' && (
                      <div className="p-2 bg-blue-50 rounded-md border border-blue-100 mt-1">
                        <div className="text-xs text-blue-700 mb-1">Click to insert a variable:</div>
                        <div className="flex flex-wrap gap-1">
                          {AVAILABLE_VARIABLES.map(variable => (
                            <button
                              key={variable.name}
                              onClick={() => insertVariable('modifyValue', variable.name)}
                              className="px-2 py-1 text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 rounded font-mono"
                            >
                              {variable.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Time Unit */}
                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-gray-500">Time Unit</label>
                    <div className="relative">
                      <select
                        value={data.params?.modifyUnit || 'days'}
                        onChange={(e) => updateNodeData(id, { modifyUnit: e.target.value })}
                        className="w-full appearance-none px-3 py-2 bg-white text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                      >
                        {TIME_UNITS.map(unit => (
                          <option key={unit.value} value={unit.value}>
                            {unit.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                </div>
              )}

              {(operation === 'start_of' || operation === 'end_of') && (
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-gray-500">Period Type</label>
                  <div className="relative">
                    <select
                      value={data.params?.modifyUnit || 'day'}
                      onChange={(e) => updateNodeData(id, { modifyUnit: e.target.value })}
                      className="w-full appearance-none px-3 py-2 bg-white text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                    >
                      {PERIOD_TYPES.map(period => (
                        <option key={period.value} value={period.value}>
                          {period.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                  </div>
                  <p className="text-xs text-gray-400">
                    {operation === 'start_of' 
                      ? 'Gets the beginning of the specified period (e.g., start of month is the 1st day at 00:00:00)'
                      : 'Gets the end of the specified period (e.g., end of month is the last day at 23:59:59)'}
                  </p>
                </div>
              )}

              {(operation === 'next_weekday' || operation === 'previous_weekday') && (
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-gray-500">Weekday</label>
                  <div className="relative">
                    <select
                      value={data.params?.modifyUnit || '0'}
                      onChange={(e) => updateNodeData(id, { modifyUnit: e.target.value })}
                      className="w-full appearance-none px-3 py-2 bg-white text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                    >
                      {WEEKDAYS.map(day => (
                        <option key={day.value} value={day.value}>
                          {day.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                  </div>
                  <p className="text-xs text-gray-400">
                    {operation === 'next_weekday' 
                      ? 'Finds the next occurrence of the selected weekday'
                      : 'Finds the previous occurrence of the selected weekday'}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Timezone Tab */}
          {activeTab === 'timezone' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-500">Timezone</label>
                <div className="relative">
                  <select
                    value={data.params?.timezone || 'UTC'}
                    onChange={(e) => updateNodeData(id, { timezone: e.target.value })}
                    className="w-full appearance-none px-3 py-2 bg-white text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                  >
                    {COMMON_TIMEZONES.map(tz => (
                      <option key={tz} value={tz}>
                        {tz}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
              
              {/* Timezone Preview Card */}
              <div className="p-3 bg-gray-50 rounded-md border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-500">Current Time Preview</span>
                  <RefreshOutlined className="w-3 h-3 text-gray-400" />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-500">Selected Timezone:</span>
                    <span className="text-xs font-medium">{data.params?.timezone || 'UTC'}</span>
                  </div>
                  <div className="text-sm font-medium mt-2 text-center">
                    {new Date().toLocaleTimeString('en-US', { 
                      timeZone: data.params?.timezone || 'UTC',
                      hour12: true,
                      hour: 'numeric',
                      minute: 'numeric'
                    })}
                  </div>
                </div>
              </div>
              
              <div className="text-xs text-gray-500">
                Note: The node supports additional timezones beyond this list. You can manually enter any valid IANA timezone name.
              </div>
            </div>
          )}

          {/* Format Tab */}
          {activeTab === 'format' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-medium text-gray-500">Custom Format</label>
                  <button
                    onClick={() => toggleVariables('customFormat')}
                    className={`p-1 rounded text-xs ${showVariables && currentField === 'customFormat' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    Variables
                  </button>
                </div>
                <input
                  type="text"
                  value={data.params?.customFormat || ''}
                  onChange={(e) => updateNodeData(id, { customFormat: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Format pattern (e.g., %Y-%m-%d)"
                />
                
                {/* Format templates */}
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {FORMAT_SUGGESTIONS.slice(0, FORMAT_SUGGESTIONS.length-1).map(format => (
                    <button
                      key={format.value}
                      onClick={() => updateNodeData(id, { customFormat: format.value })}
                      className={`px-3 py-1.5 text-xs rounded-md border transition-colors text-left ${
                        data.params?.customFormat === format.value
                          ? 'bg-blue-50 border-blue-200 text-blue-700'
                          : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                      }`}
                      title={format.label}
                    >
                      {format.label}
                    </button>
                  ))}
                </div>
                
                {/* Variables panel */}
                {showVariables && currentField === 'customFormat' && (
                  <div className="p-2 bg-blue-50 rounded-md border border-blue-100 mt-1">
                    <div className="text-xs text-blue-700 mb-1">Click to insert a variable:</div>
                    <div className="flex flex-wrap gap-1">
                      {AVAILABLE_VARIABLES.map(variable => (
                        <button
                          key={variable.name}
                          onClick={() => insertVariable('customFormat', variable.name)}
                          className="px-2 py-1 text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 rounded font-mono"
                        >
                          {variable.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="text-xs text-gray-500 mt-2">
                  <p className="font-medium">Format codes:</p>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-1">
                    <div>%Y - Year (4 digits)</div>
                    <div>%m - Month (01-12)</div>
                    <div>%d - Day (01-31)</div>
                    <div>%H - Hour, 24h (00-23)</div>
                    <div>%I - Hour, 12h (01-12)</div>
                    <div>%M - Minute (00-59)</div>
                    <div>%S - Second (00-59)</div>
                    <div>%p - AM/PM</div>
                    <div>%A - Weekday name</div>
                    <div>%B - Month name</div>
                  </div>
                </div>
              </div>
              
              {/* Format Preview Card */}
              <div className="p-3 bg-gray-50 rounded-md border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-500">Format Preview</span>
                </div>
                <div className="font-mono text-sm p-2 bg-white border border-gray-200 rounded">
                  {data.params?.customFormat ? (
                    <span>{new Date().toLocaleString()}</span>
                  ) : (
                    <span className="text-gray-400">Set a custom format to see preview</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Status Bar */}
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-green-500" />
          <span>Ready</span>
        </span>
        <span>Timezone: {data.params?.timezone || 'UTC'}</span>
      </div>

      {/* Handles */}
      <Handle 
        type="target" 
        position={Position.Left} 
        style={{ background: '#3b82f6' }} 
      />
      <Handle 
        type="source" 
        position={Position.Right} 
        style={{ background: '#10b981' }} 
      />
    </div>
  );
};

export default TimeNode; 