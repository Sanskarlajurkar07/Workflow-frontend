import api from './axios';
import { MySQLConnection } from '../components/database/MySQLLoginForm';
import { MongoDBConnection } from '../components/database/MongoDBLoginForm';

// Types for stored connections
export interface SavedConnection {
  id: string;
  name: string;
  type: 'mysql' | 'mongodb';
  userId: string;
  credentials: MySQLConnection | MongoDBConnection;
  createdAt: string;
  updatedAt: string;
}

export const databaseService = {
  // Get all database connections for the current user
  getConnections: async (): Promise<SavedConnection[]> => {
    try {
      const response = await api.get('/database/connections');
      return response.data;
    } catch (error) {
      console.error('Error fetching database connections:', error);
      throw error;
    }
  },

  // Get a specific database connection
  getConnection: async (id: string): Promise<SavedConnection> => {
    try {
      const response = await api.get(`/database/connections/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching database connection ${id}:`, error);
      throw error;
    }
  },

  // Create a new MySQL connection
  createMySQLConnection: async (connection: MySQLConnection, name: string): Promise<SavedConnection> => {
    try {
      const response = await api.post('/database/mysql/connect', {
        name,
        credentials: connection
      });
      return response.data;
    } catch (error) {
      console.error('Error creating MySQL connection:', error);
      throw error;
    }
  },

  // Create a new MongoDB connection
  createMongoDBConnection: async (connection: MongoDBConnection, name: string): Promise<SavedConnection> => {
    try {
      const response = await api.post('/database/mongodb/connect', {
        name,
        credentials: connection
      });
      return response.data;
    } catch (error) {
      console.error('Error creating MongoDB connection:', error);
      throw error;
    }
  },

  // Test a MySQL connection
  testMySQLConnection: async (connection: MySQLConnection): Promise<boolean> => {
    try {
      const response = await api.post('/database/mysql/test', connection);
      return response.data.success;
    } catch (error) {
      console.error('Error testing MySQL connection:', error);
      throw error;
    }
  },

  // Test a MongoDB connection
  testMongoDBConnection: async (connection: MongoDBConnection): Promise<boolean> => {
    try {
      const response = await api.post('/database/mongodb/test', connection);
      return response.data.success;
    } catch (error) {
      console.error('Error testing MongoDB connection:', error);
      throw error;
    }
  },

  // Delete a database connection
  deleteConnection: async (id: string): Promise<void> => {
    try {
      await api.delete(`/database/connections/${id}`);
    } catch (error) {
      console.error(`Error deleting database connection ${id}:`, error);
      throw error;
    }
  },
};

export default databaseService; 