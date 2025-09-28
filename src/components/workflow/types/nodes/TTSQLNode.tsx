import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { Trash2, Settings, Database, Play, Copy, Info, ChevronDown, HelpCircle, Code, MessageSquare, Check, AlertTriangle, Tag } from 'lucide-react';
import { useFlowStore } from '../../../../store/flowStore';

// Database types with schema examples
const DATABASE_TYPES = [
  { 
    value: 'MySQL', 
    description: 'MySQL/MariaDB database engine',
    schemaExample: `CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE,
  age INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  amount DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);`
  },
  { 
    value: 'PostgreSQL', 
    description: 'PostgreSQL database engine',
    schemaExample: `CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE,
  age INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  amount DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`
  },
  { 
    value: 'SQLite', 
    description: 'SQLite database engine',
    schemaExample: `CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  age INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  amount REAL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);`
  },
  { 
    value: 'SQLServer', 
    description: 'Microsoft SQL Server database engine',
    schemaExample: `CREATE TABLE users (
  id INT PRIMARY KEY IDENTITY(1,1),
  name NVARCHAR(255) NOT NULL,
  email NVARCHAR(255) UNIQUE,
  age INT,
  created_at DATETIME DEFAULT GETDATE()
);

CREATE TABLE orders (
  id INT PRIMARY KEY IDENTITY(1,1),
  user_id INT,
  amount DECIMAL(10,2),
  created_at DATETIME DEFAULT GETDATE(),
  FOREIGN KEY (user_id) REFERENCES users(id)
);`
  }
];

// Sample query templates
const QUERY_TEMPLATES = [
  {
    title: "Find all records",
    text: "Show me all users"
  },
  {
    title: "Find with condition",
    text: "Get users who are older than 30"
  },
  {
    title: "Aggregation",
    text: "Calculate the average order amount by user"
  },
  {
    title: "Join tables",
    text: "List users with their order counts"
  },
  {
    title: "Complex query",
    text: "Find users who made orders over $100 in the last month"
  }
];

// Variable suggestions for query
const VARIABLE_SUGGESTIONS = [
  { name: '{{input.user_id}}', description: 'User ID from input' },
  { name: '{{input.search_term}}', description: 'Search term from input' },
  { name: '{{input.min_amount}}', description: 'Minimum amount from input' },
  { name: '{{workflow.variables.date_from}}', description: 'Start date from workflow variables' },
  { name: '{{workflow.variables.date_to}}', description: 'End date from workflow variables' }
];

interface TTSQLNodeProps {
  data: {
    params?: {
      nodeName?: string;
      query?: string;
      schema?: string;
      database?: string;
      showSettings?: boolean;
      showPreview?: boolean;
      generatedSQL?: string;
      variableName?: string;
    };
  };
  id: string;
  selected?: boolean;
}

const TTSQLNode: React.FC<TTSQLNodeProps> = ({ data, id, selected }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showVariables, setShowVariables] = useState(false);
  const [varField, setVarField] = useState<'query' | 'schema' | null>(null);
  const [copiedSuccess, setCopiedSuccess] = useState(false);
  const [variableName, setVariableName] = useState(data.params?.variableName || `sql_${id.substring(0, 4)}`);
  
  const isQueryValid = !!data.params?.query;
  const isSchemaValid = !!data.params?.schema;
  
  // Get functions from useFlowStore
  const removeNode = useFlowStore((state) => state.removeNode);
  const updateNodeData = useFlowStore((state) => state.updateNodeParams);

  const handleDelete = () => {
    removeNode(id);
  };

  const toggleSettings = () => {
    updateNodeData(id, { showSettings: !data.params?.showSettings });
  };

  const handleGenerateSQL = async () => {
    if (!isQueryValid || !isSchemaValid) return;
    
    setIsGenerating(true);
    try {
      // For demo purposes - in a real app, this would call an API
      setTimeout(() => {
        // Generate SQL based on the schema and query
        const dbType = data.params?.database || 'MySQL';
        const userQuery = data.params?.query || '';
        
        // Simple emulation of SQL generation
        let generatedSQL = '';
        if (userQuery.toLowerCase().includes('all users')) {
          generatedSQL = 'SELECT * FROM users;';
        } else if (userQuery.toLowerCase().includes('older than 30')) {
          generatedSQL = 'SELECT * FROM users WHERE age > 30;';
        } else if (userQuery.toLowerCase().includes('average order')) {
          generatedSQL = 'SELECT user_id, AVG(amount) as avg_amount FROM orders GROUP BY user_id;';
        } else if (userQuery.toLowerCase().includes('order counts')) {
          generatedSQL = `SELECT u.name, u.email, COUNT(o.id) as order_count
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
GROUP BY u.id, u.name, u.email;`;
        } else if (userQuery.toLowerCase().includes('over $100')) {
          generatedSQL = `SELECT u.name, u.email, o.amount
FROM users u
JOIN orders o ON u.id = o.user_id
WHERE o.amount > 100
AND o.created_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH);`;
        } else {
          generatedSQL = 'SELECT * FROM users WHERE 1=1;';
        }
        
        updateNodeData(id, { generatedSQL });
        setIsGenerating(false);
      }, 1500);
    } catch (error) {
      console.error('Error generating SQL:', error);
      setIsGenerating(false);
    }
  };

  const handleCopySQL = () => {
    if (data.params?.generatedSQL) {
      navigator.clipboard.writeText(data.params.generatedSQL);
      setCopiedSuccess(true);
      setTimeout(() => setCopiedSuccess(false), 2000);
    }
  };

  const insertVariable = (field: 'query' | 'schema', variable: string) => {
    if (field === 'query') {
      updateNodeData(id, { query: (data.params?.query || '') + ` ${variable}` });
    } else if (field === 'schema') {
      updateNodeData(id, { schema: (data.params?.schema || '') + ` ${variable}` });
    }
  };

  const useTemplate = (template: string) => {
    updateNodeData(id, { query: template });
    setShowTemplates(false);
  };

  const useSchemaExample = () => {
    const selectedDB = DATABASE_TYPES.find(db => db.value === (data.params?.database || 'MySQL'));
    if (selectedDB) {
      updateNodeData(id, { schema: selectedDB.schemaExample });
    }
  };

  // Handle variable name change
  const handleVariableNameChange = (newName: string) => {
    setVariableName(newName);
    updateNodeData(id, { variableName: newName });
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg overflow-hidden ${
      selected ? 'ring-2 ring-blue-500' : 'border border-gray-200'
    }`}>
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-500 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
              <Database className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-medium text-white">Text to SQL</h3>
              <p className="text-xs text-purple-50/80">Convert natural language to SQL</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowHelp(!showHelp)}
              className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/20 transition-colors"
              title="Help"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
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

      {/* Help Panel */}
      {showHelp && (
        <div className="p-4 bg-blue-50 border-b border-blue-100">
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-700 text-sm">About Text to SQL</h4>
                <p className="text-xs text-blue-600">
                  This node converts natural language queries into SQL code. Provide your database schema
                  and describe what you want to find in plain language.
                </p>
              </div>
            </div>
            
            <div className="bg-white rounded-md p-3 text-xs space-y-2 border border-blue-100">
              <h5 className="font-medium text-blue-700">How to use:</h5>
              <ol className="space-y-1 text-gray-600 list-decimal pl-4">
                <li>Select your database type</li>
                <li>Define your database schema (table structures)</li>
                <li>Write your query in natural language</li>
                <li>Click "Generate SQL" to convert to SQL code</li>
              </ol>
              <p className="mt-2 text-blue-600">The generated SQL will be stored in: <code>{`{{${variableName}}}`}</code></p>
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
                value={data.params?.nodeName || 'nl_to_sql_0'}
                onChange={(e) => updateNodeData(id, { nodeName: e.target.value })}
                className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="p-4 space-y-4">
        {/* Enhanced Variable Name Field */}
        <div className="p-3 border border-indigo-200 bg-indigo-50/50 rounded-lg mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Tag className="w-4 h-4 text-indigo-600" />
            <span className="text-sm font-medium text-gray-700">Variable Name</span>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3">
              <span className="text-indigo-600 font-bold">&#123;&#123;</span>
            </div>
            <input
              type="text"
              value={variableName}
              onChange={(e) => handleVariableNameChange(e.target.value)}
              className="w-full pl-10 pr-10 py-2 text-sm border border-indigo-200 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="sql_result"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <span className="text-indigo-600 font-bold">&#125;&#125;</span>
            </div>
          </div>
          <div className="flex items-center mt-2">
            <Info className="w-4 h-4 text-indigo-500 mr-1" />
            <span className="text-xs text-gray-600">Reference as: </span>
            <span className="ml-1 px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded font-mono text-xs">{`{{${variableName}}}`}</span>
          </div>
        </div>

        {/* Database Selection */}
        <div className="space-y-2">
          <label className="block text-xs font-medium text-gray-500">SQL Database</label>
          <div className="relative">
            <select
              value={data.params?.database || 'MySQL'}
              onChange={(e) => updateNodeData(id, { database: e.target.value })}
              className="w-full appearance-none px-3 py-2 bg-white text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent pr-10"
            >
              {DATABASE_TYPES.map(db => (
                <option key={db.value} value={db.value} title={db.description}>
                  {db.value}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
          </div>
          <p className="text-xs text-gray-400">
            {DATABASE_TYPES.find(db => db.value === (data.params?.database || 'MySQL'))?.description}
          </p>
        </div>

        {/* Schema Input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-medium text-gray-500">Schema Definition *</label>
            <div className="flex gap-2">
              <button 
                onClick={useSchemaExample}
                className="text-xs text-blue-600 hover:text-blue-700"
              >
                Use Example
              </button>
              <button
                onClick={() => {
                  setVarField('schema');
                  setShowVariables(!showVariables && varField === 'schema');
                }}
                className={`p-1 rounded text-xs ${
                  showVariables && varField === 'schema'
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:text-gray-700'
                }`}
              >
                <Code className="w-3 h-3" />
              </button>
            </div>
          </div>
          
          <div className="relative">
            <textarea
              placeholder="Enter table schema details..."
              value={data.params?.schema || ''}
              onChange={(e) => updateNodeData(id, { schema: e.target.value })}
              className={`w-full px-3 py-2 text-sm border rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent min-h-[80px] font-mono ${
                isSchemaValid ? 'border-gray-200' : 'border-red-300 bg-red-50'
              }`}
            />
            {!isSchemaValid && (
              <div className="flex items-center text-xs text-red-500 mt-1">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Schema definition is required
              </div>
            )}
          </div>
          
          {/* Variables Panel for Schema */}
          {showVariables && varField === 'schema' && (
            <div className="bg-blue-50 p-2 rounded-md mt-1">
              <div className="text-xs text-blue-700 mb-1 flex items-center">
                <Code className="w-3 h-3 mr-1" />
                Insert Variables:
              </div>
              <div className="flex flex-wrap gap-1">
                {VARIABLE_SUGGESTIONS.map(variable => (
                  <button
                    key={variable.name}
                    onClick={() => insertVariable('schema', variable.name)}
                    className="px-1.5 py-0.5 text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 rounded font-mono"
                    title={variable.description}
                  >
                    {variable.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Query Input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-medium text-gray-500">Natural Language Query *</label>
            <div className="flex gap-2">
              <button
                onClick={() => setShowTemplates(!showTemplates)}
                className={`p-1 rounded text-xs ${
                  showTemplates 
                    ? 'bg-purple-100 text-purple-700' 
                    : 'text-gray-600 hover:text-gray-700'
                }`}
              >
                <MessageSquare className="w-3 h-3" />
              </button>
              <button
                onClick={() => {
                  setVarField('query');
                  setShowVariables(!showVariables && varField === 'query');
                }}
                className={`p-1 rounded text-xs ${
                  showVariables && varField === 'query'
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:text-gray-700'
                }`}
              >
                <Code className="w-3 h-3" />
              </button>
            </div>
          </div>
          
          <div className="relative">
            <textarea
              placeholder="Describe your query in natural language..."
              value={data.params?.query || ''}
              onChange={(e) => updateNodeData(id, { query: e.target.value })}
              className={`w-full px-3 py-2 text-sm border rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent min-h-[80px] ${
                isQueryValid ? 'border-gray-200' : 'border-red-300 bg-red-50'
              }`}
            />
            {!isQueryValid && (
              <div className="flex items-center text-xs text-red-500 mt-1">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Query is required
              </div>
            )}
          </div>
          
          {/* Query Templates */}
          {showTemplates && (
            <div className="bg-purple-50 p-2 rounded-md mt-1 border border-purple-100">
              <div className="text-xs text-purple-700 mb-1">Query Templates:</div>
              <div className="space-y-1">
                {QUERY_TEMPLATES.map((template, index) => (
                  <button
                    key={index}
                    onClick={() => useTemplate(template.text)}
                    className="w-full text-left px-2 py-1 text-xs bg-white hover:bg-purple-100 text-purple-800 rounded-sm flex justify-between items-center"
                  >
                    <span className="font-medium">{template.title}</span>
                    <span className="text-purple-500 text-xs italic">{template.text}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Variables Panel for Query */}
          {showVariables && varField === 'query' && (
            <div className="bg-blue-50 p-2 rounded-md mt-1">
              <div className="text-xs text-blue-700 mb-1 flex items-center">
                <Code className="w-3 h-3 mr-1" />
                Insert Variables:
              </div>
              <div className="flex flex-wrap gap-1">
                {VARIABLE_SUGGESTIONS.map(variable => (
                  <button
                    key={variable.name}
                    onClick={() => insertVariable('query', variable.name)}
                    className="px-1.5 py-0.5 text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 rounded font-mono"
                    title={variable.description}
                  >
                    {variable.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Generate SQL Button */}
        <button
          onClick={handleGenerateSQL}
          disabled={!isQueryValid || !isSchemaValid || isGenerating}
          className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            !isQueryValid || !isSchemaValid || isGenerating
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-purple-100 text-purple-700 hover:bg-purple-200 border border-purple-200'
          }`}
        >
          {isGenerating ? (
            <>
              <div className="w-4 h-4 border-2 border-purple-300 border-t-purple-700 rounded-full animate-spin"></div>
              Generating...
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              Generate SQL
            </>
          )}
        </button>

        {/* Generated SQL Preview */}
        {data.params?.generatedSQL && (
          <div className="space-y-2 border border-green-100 rounded-md p-2 bg-green-50">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-medium text-green-700 flex items-center">
                <Check className="w-3 h-3 mr-1" />
                Generated SQL
              </label>
              <button
                onClick={handleCopySQL}
                className={`p-1.5 rounded-md text-xs flex items-center gap-1 ${
                  copiedSuccess 
                    ? 'bg-green-200 text-green-700' 
                    : 'bg-white text-gray-600 hover:text-gray-800 hover:bg-white/80'
                }`}
                title="Copy SQL"
              >
                {copiedSuccess ? (
                  <>
                    <Check className="w-3 h-3" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    Copy
                  </>
                )}
              </button>
            </div>
            <div className="bg-white rounded-md p-3 overflow-auto max-h-[150px]">
              <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">{data.params.generatedSQL}</pre>
            </div>
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <span className={`w-2 h-2 rounded-full ${
            isQueryValid && isSchemaValid ? 'bg-green-500' : 'bg-amber-500'
          }`} />
          <span>{isQueryValid && isSchemaValid ? 'Ready' : 'Incomplete'}</span>
        </span>
        <span className="flex items-center gap-1">
          <span>Variable:</span>
          <span className="text-indigo-700 font-medium">{variableName}</span>
        </span>
      </div>

      {/* Handles */}
      <Handle 
        type="target" 
        position={Position.Left} 
        style={{ background: '#6366f1' }} 
      />
      <Handle 
        type="source" 
        position={Position.Right} 
        style={{ background: '#8b5cf6' }} 
      />
    </div>
  );
};

export default TTSQLNode;