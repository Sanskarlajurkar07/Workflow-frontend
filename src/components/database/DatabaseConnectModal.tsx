import React, { useState } from 'react';
import { X } from 'lucide-react';
import MySQLLoginForm, { MySQLConnection } from './MySQLLoginForm';
import MongoDBLoginForm, { MongoDBConnection } from './MongoDBLoginForm';
import databaseService from '../../lib/databaseService';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

interface DatabaseConnectModalProps {
  type: 'mysql' | 'mongodb';
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (connectionId: string) => void;
  nodeId?: string;  // Optional ID of the node to update after successful connection
}

const DatabaseConnectModal: React.FC<DatabaseConnectModalProps> = ({
  type,
  isOpen,
  onClose,
  onSuccess,
  nodeId
}) => {
  const [loading, setLoading] = useState(false);
  const [connectionName, setConnectionName] = useState('');
  const { isAuthenticated } = useAuth();

  if (!isOpen) return null;

  const handleMySQLSuccess = async (connection: MySQLConnection) => {
    if (!connectionName.trim()) {
      toast.error('Please provide a name for this connection');
      return;
    }

    try {
      setLoading(true);
      
      // Test the connection first
      await databaseService.testMySQLConnection(connection);
      
      // Save the connection
      const savedConnection = await databaseService.createMySQLConnection(
        connection,
        connectionName
      );
      
      toast.success('MySQL connection saved successfully');
      
      if (onSuccess) {
        onSuccess(savedConnection.id);
      }
      
      onClose();
    } catch (error) {
      console.error('Error saving MySQL connection:', error);
      toast.error('Failed to save MySQL connection');
    } finally {
      setLoading(false);
    }
  };

  const handleMongoDBSuccess = async (connection: MongoDBConnection) => {
    if (!connectionName.trim()) {
      toast.error('Please provide a name for this connection');
      return;
    }

    try {
      setLoading(true);
      
      // Test the connection first
      await databaseService.testMongoDBConnection(connection);
      
      // Save the connection
      const savedConnection = await databaseService.createMongoDBConnection(
        connection,
        connectionName
      );
      
      toast.success('MongoDB connection saved successfully');
      
      if (onSuccess) {
        onSuccess(savedConnection.id);
      }
      
      onClose();
    } catch (error) {
      console.error('Error saving MongoDB connection:', error);
      toast.error('Failed to save MongoDB connection');
    } finally {
      setLoading(false);
    }
  };

  // Display login with OAuth message if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Authentication Required</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X size={20} />
            </button>
          </div>
          <p className="mb-4">
            You need to be logged in to connect to a database.
          </p>
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 mr-2"
            >
              Cancel
            </button>
            <a
              href="/login"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Login
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            Connect to {type === 'mysql' ? 'MySQL' : 'MongoDB'} Database
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>
        
        <div className="mb-4">
          <label htmlFor="connectionName" className="block text-sm font-medium text-gray-700 mb-1">
            Connection Name
          </label>
          <input
            type="text"
            id="connectionName"
            value={connectionName}
            onChange={(e) => setConnectionName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="My Database Connection"
          />
        </div>
        
        {type === 'mysql' ? (
          <MySQLLoginForm 
            onSuccess={handleMySQLSuccess} 
            onCancel={onClose} 
          />
        ) : (
          <MongoDBLoginForm 
            onSuccess={handleMongoDBSuccess} 
            onCancel={onClose} 
          />
        )}
      </div>
    </div>
  );
};

export default DatabaseConnectModal; 