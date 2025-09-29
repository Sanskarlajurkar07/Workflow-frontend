import React, { useState, useEffect } from 'react';
import { Handle, Position } from 'reactflow';
import { 
  Settings, 
  Trash2, 
  Table, 
  RefreshCw, 
  LogIn, 
  AlertCircle, 
  Check, 
  ChevronDown,
  FileSpreadsheet,
  Plus,
  Edit,
  Trash,
  Share,
  Database
} from 'lucide-react';
import { useFlowStore } from '../../../../store/flowStore';
import { useGoogleOAuth } from '../../../../hooks/useGoogleOAuth';

interface GoogleSheetNodeData {
  params?: {
    nodeName?: string;
    operation?: 'read_sheet' | 'write_sheet' | 'append_row' | 'clear_range' | 'create_sheet' | 'share_sheet';
    spreadsheetId?: string;
    sheetName?: string;
    range?: string;
    values?: string[][];
    permissions?: {
      role: 'owner' | 'writer' | 'reader';
      type: 'user' | 'group' | 'domain' | 'anyone';
      emailAddress?: string;
    };
    showSettings?: boolean;
    authToken?: string;
    refreshToken?: string;
    isAuthenticated?: boolean;
    testResponse?: {
      status?: number;
      content?: any;
      success?: boolean;
      execution_time_ms?: number;
    };
  };
}

interface GoogleSheetNodeProps {
  id: string;
  data: GoogleSheetNodeData;
  selected?: boolean;
}

const GoogleSheetNode: React.FC<GoogleSheetNodeProps> = ({ id, data, selected }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [testing, setTesting] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const removeNode = useFlowStore((state) => state.removeNode);
  const updateNodeData = useFlowStore((state) => state.updateNodeData);

  // Use the Google OAuth hook
  const { isLoading: connecting, error, connectToGoogle } = useGoogleOAuth(id, updateNodeData);

  // Update step based on authentication status
  useEffect(() => {
    if (data.params?.operation && !data.params?.isAuthenticated && currentStep === 1) {
      setCurrentStep(2);
    } else if (data.params?.isAuthenticated && currentStep === 2) {
      setCurrentStep(3);
    }
  }, [data.params?.operation, data.params?.isAuthenticated, currentStep]);

  const operations = [
    { 
      key: 'read_sheet', 
      label: 'Read Sheet Data', 
      icon: Database, 
      description: 'Read data from a specific range' 
    },
    { 
      key: 'write_sheet', 
      label: 'Write to Sheet', 
      icon: Edit, 
      description: 'Write data to specific cells' 
    },
    { 
      key: 'append_row', 
      label: 'Append Row', 
      icon: Plus, 
      description: 'Add new row to the end' 
    },
    { 
      key: 'clear_range', 
      label: 'Clear Range', 
      icon: Trash, 
      description: 'Clear data from range' 
    },
    { 
      key: 'create_sheet', 
      label: 'Create Sheet', 
      icon: FileSpreadsheet, 
      description: 'Create new spreadsheet' 
    },
    { 
      key: 'share_sheet', 
      label: 'Share Sheet', 
      icon: Share, 
      description: 'Share with users/groups' 
    }
  ];

  const handleOperationChange = (operation: string) => {
    updateNodeData(id, { params: { ...data.params, operation } });
  };

  const handleConnect = async () => {
    const scopes = [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/drive.file'
    ];
    try {
      await connectToGoogle('sheets', scopes);
    } catch (err) {
      console.error('Failed to connect to Google Sheets:', err);
    }
  };

  const testOperation = async () => {
    setTesting(true);
    
    try {
      // Simulate API call with realistic delay
      await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400));
      
      let mockResponse;
      const operation = data.params?.operation;
      
      switch (operation) {
        case 'read_sheet':
          mockResponse = {
            status: 200,
            content: {
              range: data.params?.range || 'A1:C10',
              majorDimension: 'ROWS',
              values: [
                ['Name', 'Email', 'Department'],
                ['John Doe', 'john@company.com', 'Engineering'],
                ['Jane Smith', 'jane@company.com', 'Marketing'],
                ['Bob Johnson', 'bob@company.com', 'Sales']
              ]
            },
            success: true,
            execution_time_ms: Math.floor(400 + Math.random() * 300)
          };
          break;
          
        case 'write_sheet':
          mockResponse = {
            status: 200,
            content: {
              spreadsheetId: data.params?.spreadsheetId,
              updatedRange: data.params?.range || 'A1:C3',
              updatedRows: 3,
              updatedColumns: 3,
              updatedCells: 9
            },
            success: true,
            execution_time_ms: Math.floor(500 + Math.random() * 200)
          };
          break;
          
        case 'append_row':
          mockResponse = {
            status: 200,
            content: {
              spreadsheetId: data.params?.spreadsheetId,
              tableRange: `${data.params?.sheetName || 'Sheet1'}!A1:Z1000`,
              updates: {
                updatedRange: `${data.params?.sheetName || 'Sheet1'}!A5:C5`,
                updatedRows: 1,
                updatedColumns: 3,
                updatedCells: 3
              }
            },
            success: true,
            execution_time_ms: Math.floor(350 + Math.random() * 250)
          };
          break;
          
        case 'clear_range':
          mockResponse = {
            status: 200,
            content: {
              spreadsheetId: data.params?.spreadsheetId,
              clearedRange: data.params?.range || 'A1:C10'
            },
            success: true,
            execution_time_ms: Math.floor(300 + Math.random() * 200)
          };
          break;
          
        case 'create_sheet':
          mockResponse = {
            status: 200,
            content: {
              spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
              spreadsheetUrl: 'https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit',
              sheets: [{
                properties: {
                  sheetId: 0,
                  title: data.params?.sheetName || 'Sheet1',
                  sheetType: 'GRID',
                  gridProperties: {
                    rowCount: 1000,
                    columnCount: 26
                  }
                }
              }]
            },
            success: true,
            execution_time_ms: Math.floor(600 + Math.random() * 400)
          };
          break;
          
        case 'share_sheet':
          mockResponse = {
            status: 200,
            content: {
              kind: 'drive#permission',
              id: Math.random().toString(36).substr(2, 9),
              type: data.params?.permissions?.type || 'user',
              emailAddress: data.params?.permissions?.emailAddress,
              role: data.params?.permissions?.role || 'reader'
            },
            success: true,
            execution_time_ms: Math.floor(450 + Math.random() * 300)
          };
          break;
          
        default:
          mockResponse = {
            status: 200,
            content: { message: "Operation completed successfully" },
            success: true,
            execution_time_ms: Math.floor(400 + Math.random() * 200)
          };
      }
      
      updateNodeData(id, { 
        params: { 
          ...data.params, 
          testResponse: mockResponse
        } 
      });
      
    } catch (err: any) {
      updateNodeData(id, { 
        params: { 
          ...data.params, 
          testResponse: {
            status: 500,
            content: { error: err.message || 'An error occurred' },
            success: false,
            execution_time_ms: 0
          }
        } 
      });
    } finally {
      setTesting(false);
    }
  };

  const getOperationInfo = (key: string) => operations.find(op => op.key === key);
  const currentOperation = getOperationInfo(data.params?.operation || '');
  const requiresRange = ['read_sheet', 'write_sheet', 'clear_range'].includes(data.params?.operation || '');
  const requiresSpreadsheetId = !['create_sheet'].includes(data.params?.operation || '');

  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden w-80 ${
      selected ? 'ring-2 ring-green-500' : 'border border-gray-200'
    }`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
              <Table className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-medium text-white">Google Sheets</h3>
              <p className="text-xs text-green-50/80">{data.params?.nodeName || 'sheets_1'}</p>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            {data.params?.isAuthenticated && (
              <div className="p-1.5 rounded-lg bg-green-500/20">
                <Check className="w-4 h-4 text-green-300" />
              </div>
            )}
            <button
              onClick={() => updateNodeData(id, { params: { ...data.params, showSettings: !data.params?.showSettings } })}
              className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/20 transition-colors"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={() => removeNode(id)}
              className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/20 transition-colors"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Step 1: Operation Selection */}
        {currentStep === 1 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Select Operation</h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {operations.map(({ key, label, icon: Icon, description }) => (
                <button
                  key={key}
                  onClick={() => handleOperationChange(key)}
                  className="w-full flex items-start space-x-3 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors text-left group"
                >
                  <Icon className="w-4 h-4 text-gray-400 group-hover:text-gray-600 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-gray-700">{label}</div>
                    <div className="text-xs text-gray-500 mt-1">{description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Authentication */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div className="text-center">
              <h4 className="text-sm font-medium text-gray-700 mb-1">Google Sheets Authentication</h4>
              <p className="text-xs text-gray-500">Operation: {currentOperation?.label}</p>
            </div>
            
            {error && (
              <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <span className="text-xs text-red-600">{error}</span>
              </div>
            )}

            <button
              onClick={handleConnect}
              disabled={connecting}
              className={`w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg text-white font-medium ${
                connecting 
                  ? 'bg-green-400 cursor-not-allowed' 
                  : 'bg-green-500 hover:bg-green-600 active:bg-green-700'
              } transition-colors`}
            >
              {connecting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Connect Google Sheets</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Step 3: Configuration */}
        {currentStep === 3 && data.params?.isAuthenticated && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-700">
                Configure {currentOperation?.label}
              </h4>
              <div className="flex items-center space-x-1 text-xs text-green-600">
                <Check className="w-3 h-3" />
                <span>Connected</span>
              </div>
            </div>

            {/* Spreadsheet ID (required for most operations) */}
            {requiresSpreadsheetId && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Spreadsheet ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={data.params?.spreadsheetId || ''}
                  onChange={(e) => updateNodeData(id, { params: { ...data.params, spreadsheetId: e.target.value } })}
                  placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-green-500 focus:ring-green-500 text-sm font-mono"
                />
              </div>
            )}

            {/* Sheet Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sheet Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={data.params?.sheetName || ''}
                onChange={(e) => updateNodeData(id, { params: { ...data.params, sheetName: e.target.value } })}
                placeholder="Sheet1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-green-500 focus:ring-green-500 text-sm"
              />
            </div>

            {/* Range (for specific operations) */}
            {requiresRange && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cell Range <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={data.params?.range || ''}
                  onChange={(e) => updateNodeData(id, { params: { ...data.params, range: e.target.value } })}
                  placeholder="A1:C10"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-green-500 focus:ring-green-500 text-sm font-mono"
                />
              </div>
            )}

            {/* Share Sheet Specific Fields */}
            {data.params?.operation === 'share_sheet' && (
              <div className="space-y-3 p-3 bg-green-50 rounded-lg border border-green-200">
                <h5 className="text-sm font-medium text-green-800">Sharing Configuration</h5>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={data.params?.permissions?.emailAddress || ''}
                    onChange={(e) => updateNodeData(id, { 
                      params: { 
                        ...data.params, 
                        permissions: { 
                          ...(data.params?.permissions || {}),
                          emailAddress: e.target.value 
                        } 
                      } 
                    })}
                    placeholder="user@example.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-green-500 focus:ring-green-500 text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Permission Role</label>
                    <select
                      value={data.params?.permissions?.role || 'reader'}
                      onChange={(e) => updateNodeData(id, { 
                        params: { 
                          ...data.params, 
                          permissions: { 
                            ...(data.params?.permissions || {}),
                            role: e.target.value as any
                          } 
                        } 
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-green-500 focus:ring-green-500 text-sm"
                    >
                      <option value="reader">Reader</option>
                      <option value="writer">Writer</option>
                      <option value="owner">Owner</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Permission Type</label>
                    <select
                      value={data.params?.permissions?.type || 'user'}
                      onChange={(e) => updateNodeData(id, { 
                        params: { 
                          ...data.params, 
                          permissions: { 
                            ...(data.params?.permissions || {}),
                            type: e.target.value as any
                          } 
                        } 
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-green-500 focus:ring-green-500 text-sm"
                    >
                      <option value="user">User</option>
                      <option value="group">Group</option>
                      <option value="domain">Domain</option>
                      <option value="anyone">Anyone</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Test Operation */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <button
                onClick={testOperation}
                disabled={testing}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-white font-medium ${
                  testing 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-green-500 hover:bg-green-600'
                } transition-colors`}
              >
                {testing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Testing...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    <span>Test</span>
                  </>
                )}
              </button>

              {data.params?.testResponse && (
                <div className="flex items-center space-x-2">
                  <div className={`h-2 w-2 rounded-full ${
                    data.params.testResponse.success ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                  <span className="text-xs text-gray-600">
                    {data.params.testResponse.success ? 'Success' : 'Failed'} 
                    ({data.params.testResponse.execution_time_ms}ms)
                  </span>
                </div>
              )}
            </div>

            {/* Test Response */}
            {data.params?.testResponse && (
              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800 mb-2"
                >
                  <ChevronDown className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
                  <span>Response Details</span>
                </button>
                
                {showAdvanced && (
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <pre className="text-xs font-mono text-gray-600 overflow-auto max-h-40">
                      {JSON.stringify(data.params.testResponse.content, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Handles */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 -ml-0.5 bg-green-500 border-2 border-white rounded-full"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 -mr-0.5 bg-green-500 border-2 border-white rounded-full"
      />
    </div>
  );
};

export default GoogleSheetNode;