import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { Settings, Trash2, Box, RefreshCw, LogIn, AlertCircle } from 'lucide-react';
import { useFlowStore } from '../../../../store/flowStore';

// Superbox API credentials (to be replaced with user's credentials)
const SUPERBOX_API_KEY = 'your-superbox-api-key';

interface SuperboxNodeProps {
  id: string;
  data: {
    params?: {
      nodeName?: string;
      operation?: 'create_box' | 'list_boxes' | 'get_box' | 'update_box' | 'delete_box' | 'add_items' | 'remove_items' | 'list_items';
      boxId?: string;
      name?: string;
      description?: string;
      type?: 'personal' | 'shared' | 'team';
      capacity?: number;
      items?: Array<{
        id: string;
        name: string;
        quantity: number;
        category?: string;
        location?: string;
      }>;
      showSettings?: boolean;
      apiKey?: string;
      isAuthenticated?: boolean;
      testResponse?: {
        status?: number;
        content?: any;
        success?: boolean;
        execution_time_ms?: number;
      };
    };
  };
  selected?: boolean;
}

const SuperboxNode: React.FC<SuperboxNodeProps> = ({ id, data, selected }) => {
  const [connecting, setConnecting] = useState<boolean>(false);
  const [testing, setTesting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const removeNode = useFlowStore((state) => state.removeNode);
  const updateNodeData = useFlowStore((state) => state.updateNodeData);

  const connectToSuperbox = async () => {
    setConnecting(true);
    setError(null);
    
    try {
      // Simulate API validation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      updateNodeData(id, { 
        params: { 
          ...data.params, 
          apiKey: SUPERBOX_API_KEY,
          isAuthenticated: true
        } 
      });
      
    } catch (err: any) {
      setError(err.message || 'Failed to authenticate with Superbox');
    } finally {
      setConnecting(false);
    }
  };

  const testOperation = async () => {
    setTesting(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      let mockResponse;
      switch (data.params?.operation) {
        case 'list_boxes':
          mockResponse = {
            status: 200,
            content: {
              boxes: [
                {
                  id: 'box_123',
                  name: 'Office Supplies',
                  description: 'General office supplies and stationery',
                  type: 'shared',
                  capacity: 100,
                  item_count: 45,
                  created_at: '2024-03-19T08:00:00Z'
                },
                {
                  id: 'box_456',
                  name: 'Personal Items',
                  description: 'Personal storage items',
                  type: 'personal',
                  capacity: 50,
                  item_count: 12,
                  created_at: '2024-03-19T09:00:00Z'
                }
              ],
              total_count: 2
            },
            success: true,
            execution_time_ms: 450
          };
          break;
        case 'create_box':
          mockResponse = {
            status: 201,
            content: {
              id: `box_${Date.now()}`,
              name: data.params?.name,
              description: data.params?.description,
              type: data.params?.type,
              capacity: data.params?.capacity,
              item_count: 0,
              created_at: new Date().toISOString()
            },
            success: true,
            execution_time_ms: 850
          };
          break;
        case 'list_items':
          mockResponse = {
            status: 200,
            content: {
              items: [
                {
                  id: 'item_123',
                  name: 'Notebooks',
                  quantity: 25,
                  category: 'Stationery',
                  location: 'Shelf A1'
                },
                {
                  id: 'item_456',
                  name: 'Pens',
                  quantity: 100,
                  category: 'Writing Tools',
                  location: 'Drawer B2'
                }
              ],
              total_count: 2
            },
            success: true,
            execution_time_ms: 380
          };
          break;
        default:
          mockResponse = {
            status: 200,
            content: { message: "Operation completed successfully" },
            success: true,
            execution_time_ms: 380
          };
      }
      
      updateNodeData(id, { 
        params: { 
          ...data.params, 
          testResponse: mockResponse
        } 
      });
      
    } catch (err: any) {
      setError(err.message || 'An error occurred while testing the operation');
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden ${
      selected ? 'ring-2 ring-purple-500' : 'ring-1 ring-gray-200'
    }`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
              <Box className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-medium text-white">Superbox</h3>
              <p className="text-xs text-purple-50/80">{data.params?.nodeName || 'superbox_0'}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => updateNodeData(id, { params: { ...data.params, showSettings: !data.params?.showSettings } })}
              className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/20 transition-colors"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={() => removeNode(id)}
              className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/20 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 space-y-4">
        {!data.params?.isAuthenticated ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Superbox Authentication</span>
              {error && (
                <span className="text-xs text-red-500 flex items-center">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {error}
                </span>
              )}
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-medium text-gray-500">API Key</label>
              <input
                type="password"
                value={SUPERBOX_API_KEY}
                placeholder="Enter your Superbox API key"
                className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                readOnly
              />
            </div>
            <button
              onClick={connectToSuperbox}
              disabled={connecting}
              className={`w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg text-white ${
                connecting ? 'bg-purple-400' : 'bg-purple-500 hover:bg-purple-600'
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
                  <span>Connect with Superbox</span>
                </>
              )}
            </button>
          </div>
        ) : (
          <>
            {/* Operation Selection */}
            <div className="space-y-2">
              <label className="block text-xs font-medium text-gray-500">Operation</label>
              <select
                value={data.params?.operation || 'list_boxes'}
                onChange={(e) => updateNodeData(id, { params: { ...data.params, operation: e.target.value } })}
                className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="list_boxes">List Boxes</option>
                <option value="create_box">Create Box</option>
                <option value="get_box">Get Box</option>
                <option value="update_box">Update Box</option>
                <option value="delete_box">Delete Box</option>
                <option value="add_items">Add Items</option>
                <option value="remove_items">Remove Items</option>
                <option value="list_items">List Items</option>
              </select>
            </div>

            {/* Box ID Selection */}
            {['get_box', 'update_box', 'delete_box', 'add_items', 'remove_items', 'list_items'].includes(data.params?.operation || '') && (
              <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-500">Box ID</label>
                <input
                  type="text"
                  value={data.params?.boxId || ''}
                  onChange={(e) => updateNodeData(id, { params: { ...data.params, boxId: e.target.value } })}
                  placeholder="Enter box ID"
                  className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            )}

            {/* Box Details */}
            {['create_box', 'update_box'].includes(data.params?.operation || '') && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-gray-500">Name</label>
                  <input
                    type="text"
                    value={data.params?.name || ''}
                    onChange={(e) => updateNodeData(id, { params: { ...data.params, name: e.target.value } })}
                    placeholder="Enter box name"
                    className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-gray-500">Description</label>
                  <textarea
                    value={data.params?.description || ''}
                    onChange={(e) => updateNodeData(id, { params: { ...data.params, description: e.target.value } })}
                    placeholder="Enter box description"
                    rows={3}
                    className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-gray-500">Type</label>
                    <select
                      value={data.params?.type || 'personal'}
                      onChange={(e) => updateNodeData(id, { params: { ...data.params, type: e.target.value } })}
                      className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="personal">Personal</option>
                      <option value="shared">Shared</option>
                      <option value="team">Team</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-gray-500">Capacity</label>
                    <input
                      type="number"
                      value={data.params?.capacity || 100}
                      onChange={(e) => updateNodeData(id, { params: { ...data.params, capacity: parseInt(e.target.value) } })}
                      min={1}
                      className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Item Management */}
            {['add_items', 'remove_items'].includes(data.params?.operation || '') && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-gray-500">Items (JSON format)</label>
                  <textarea
                    value={data.params?.items ? JSON.stringify(data.params.items, null, 2) : ''}
                    onChange={(e) => {
                      try {
                        const items = JSON.parse(e.target.value);
                        updateNodeData(id, { params: { ...data.params, items } });
                      } catch (err) {
                        // Invalid JSON, don't update
                      }
                    }}
                    placeholder={`[
  {
    "id": "item_123",
    "name": "Example Item",
    "quantity": 1,
    "category": "General",
    "location": "Shelf A1"
  }
]`}
                    rows={8}
                    className="w-full px-3 py-1.5 text-sm font-mono bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}

            {/* Test Operation Button */}
            <div className="flex items-center justify-between pt-4">
              <button
                onClick={testOperation}
                disabled={testing}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-white ${
                  testing ? 'bg-gray-400' : 'bg-purple-500 hover:bg-purple-600'
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
                    <span>Test Operation</span>
                  </>
                )}
              </button>

              {data.params?.testResponse?.status && (
                <div className="flex items-center space-x-2">
                  <div className={`h-2 w-2 rounded-full ${data.params.testResponse.success ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span className="text-sm text-gray-600">
                    Status: {data.params.testResponse.status}
                  </span>
                </div>
              )}
            </div>

            {/* Response Display */}
            {data.params?.testResponse && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <pre className="text-xs font-mono overflow-auto">
                  {JSON.stringify(data.params.testResponse.content, null, 2)}
                </pre>
              </div>
            )}
          </>
        )}
      </div>

      {/* Handles */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 -ml-0.5 bg-purple-500 border-2 border-white rounded-full"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 -mr-0.5 bg-purple-500 border-2 border-white rounded-full"
      />
    </div>
  );
};

export default SuperboxNode; 