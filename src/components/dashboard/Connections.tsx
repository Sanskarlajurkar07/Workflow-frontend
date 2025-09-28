import React, { useState, useEffect } from 'react';
import { PlusCircle, Database, Trash2, RefreshCw, ExternalLink } from 'lucide-react';
import databaseService, { SavedConnection } from '../../lib/databaseService';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import DatabaseConnectModal from '../database/DatabaseConnectModal';

const Connections: React.FC = () => {
  const [connections, setConnections] = useState<SavedConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'mysql' | 'mongodb'>('mysql');
  const { isAuthenticated } = useAuth();

  // Fetch connections on mount and when authenticated status changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchConnections();
    }
  }, [isAuthenticated]);

  const fetchConnections = async () => {
    try {
      setLoading(true);
      const data = await databaseService.getConnections();
      setConnections(data);
    } catch (error) {
      console.error('Error fetching connections:', error);
      toast.error('Failed to load database connections');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await databaseService.deleteConnection(id);
      toast.success('Connection deleted successfully');
      // Refresh the list
      fetchConnections();
    } catch (error) {
      console.error('Error deleting connection:', error);
      toast.error('Failed to delete connection');
    }
  };

  const handleConnectionSuccess = () => {
    // Refresh the list after a new connection is added
    fetchConnections();
    setShowModal(false);
  };

  // Render authentication warning if not logged in
  if (!isAuthenticated) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                You need to be logged in to view and manage database connections.
                <a href="/login" className="font-medium underline text-yellow-700 hover:text-yellow-600 ml-2">
                  Log in
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Database Connections</h1>
          <p className="text-gray-600">Manage your MySQL and MongoDB connections</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => {
              setModalType('mysql');
              setShowModal(true);
            }}
            className="flex items-center px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            Add MySQL
          </button>
          <button
            onClick={() => {
              setModalType('mongodb');
              setShowModal(true);
            }}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            Add MongoDB
          </button>
          <button
            onClick={fetchConnections}
            className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      ) : connections.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No database connections</h3>
          <p className="mt-2 text-sm text-gray-500">
            Get started by adding a MySQL or MongoDB connection using the buttons above.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {connections.map((connection) => (
            <div
              key={connection.id}
              className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200"
            >
              <div className={`px-4 py-3 flex justify-between items-center ${
                connection.type === 'mysql' 
                  ? 'bg-gradient-to-r from-yellow-500 to-orange-600' 
                  : 'bg-gradient-to-r from-blue-500 to-gray-900'
              }`}>
                <div className="flex items-center space-x-2">
                  <Database className="w-4 h-4 text-white" />
                  <span className="font-medium text-white capitalize">
                    {connection.type} Connection
                  </span>
                </div>
                <button
                  onClick={() => handleDelete(connection.id)}
                  className="text-gray-200 hover:text-red-400"
                  title="Delete connection"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-800">{connection.name}</h3>
                
                <div className="mt-3 text-sm text-gray-600">
                  {connection.type === 'mysql' ? (
                    <>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="font-medium">Database:</span>{' '}
                          {(connection.credentials as any).database}
                        </div>
                        <div>
                          <span className="font-medium">Host:</span>{' '}
                          {(connection.credentials as any).host}
                        </div>
                        <div>
                          <span className="font-medium">Username:</span>{' '}
                          {(connection.credentials as any).username}
                        </div>
                        <div>
                          <span className="font-medium">Port:</span>{' '}
                          {(connection.credentials as any).port}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div>
                      <div>
                        <span className="font-medium">Database:</span>{' '}
                        {(connection.credentials as any).database}
                      </div>
                      <div className="mt-1">
                        <span className="font-medium">Connection URI:</span>{' '}
                        <span className="opacity-50">●●●●●●●●●●●●●●●●</span>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="mt-4 pt-3 border-t border-gray-100 text-sm flex justify-end">
                  <span className="text-gray-500">
                    Created: {new Date(connection.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Connection Modal */}
      <DatabaseConnectModal
        type={modalType}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={handleConnectionSuccess}
      />
    </div>
  );
};

export default Connections; 