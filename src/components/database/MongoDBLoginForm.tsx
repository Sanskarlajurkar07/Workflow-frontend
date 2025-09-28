import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

interface MongoDBLoginFormProps {
  onSuccess?: (connectionData: MongoDBConnection) => void;
  onCancel?: () => void;
}

export interface MongoDBConnection {
  database: string;
  connectionUri: string;
}

const MongoDBLoginForm: React.FC<MongoDBLoginFormProps> = ({ onSuccess, onCancel }) => {
  const [connectionData, setConnectionData] = useState<MongoDBConnection>({
    database: '',
    connectionUri: '',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setConnectionData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Send connection details to your API
      const response = await fetch('/api/database/mongodb/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(connectionData),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to connect to MongoDB database');
      }

      toast.success('Successfully connected to MongoDB database');
      
      if (onSuccess) {
        onSuccess(connectionData);
      }
    } catch (error) {
      console.error('Connection error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to connect to MongoDB database');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-md shadow-md">
      <div className="flex items-center mb-6">
        <img 
          src="/mongodb-logo.svg" 
          alt="MongoDB Logo" 
          className="h-10 w-10 mr-3" 
        />
        <h2 className="text-2xl font-bold text-gray-800">MongoDB Login</h2>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="database" className="block text-sm font-medium text-gray-700">
            Database
          </label>
          <input
            type="text"
            id="database"
            name="database"
            value={connectionData.database}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            required
          />
        </div>
        
        <div>
          <label htmlFor="connectionUri" className="block text-sm font-medium text-gray-700">
            Connection URI
          </label>
          <input
            type="password"
            id="connectionUri"
            name="connectionUri"
            placeholder="mongodb://username:password@localhost:27017/database"
            value={connectionData.connectionUri}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            required
          />
        </div>
        
        <div className="pt-4">
          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            disabled={loading}
          >
            {loading ? 'Connecting...' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MongoDBLoginForm; 