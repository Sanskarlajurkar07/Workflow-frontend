import api from './axios';

// Type definitions
export interface SmartDatabase {
  id: string;
  name: string;
  description: string;
  chunk_size: number;
  chunk_overlap: number;
  embedding_model: string;
  advanced_doc_analysis: boolean;
  created_at: string;
  updated_at: string;
  documents: Document[];
  status: string;
}

export interface SmartDatabaseCreate {
  name: string;
  description?: string;
  chunk_size: number;
  chunk_overlap: number;
  embedding_model: string;
  advanced_doc_analysis: boolean;
}

export interface Document {
  id: string;
  name: string;
  source_type: 'file' | 'url' | 'integration' | 'recursive_url';
  source_path: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  chunks?: number;
  tokens?: number;
  created_at: string;
  updated_at: string;
  metadata: Record<string, any>;
}

export interface DocumentCreate {
  name: string;
  source_type: 'file' | 'url' | 'integration' | 'recursive_url';
  source_path: string;
  metadata?: Record<string, any>;
}

export interface SearchResult {
  text: string;
  score: number;
  source: string;
  document_id: string;
  metadata: Record<string, any>;
}

export interface SearchResponse {
  query: string;
  results: SearchResult[];
  total_results: number;
  search_time: string;
}

export const smartDatabaseService = {
  // Get all smart databases
  getSmartDatabases: async (): Promise<SmartDatabase[]> => {
    try {
      const response = await api.get('/knowledge-base');
      return response.data;
    } catch (error) {
      console.error('Error fetching smart databases:', error);
      throw error;
    }
  },

  // Get a single smart database
  getSmartDatabase: async (id: string): Promise<SmartDatabase> => {
    try {
      const response = await api.get(`/knowledge-base/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching smart database ${id}:`, error);
      throw error;
    }
  },

  // Create a new smart database
  createSmartDatabase: async (db: SmartDatabaseCreate): Promise<SmartDatabase> => {
    try {
      const response = await api.post('/knowledge-base', db);
      return response.data;
    } catch (error) {
      console.error('Error creating smart database:', error);
      throw error;
    }
  },

  // Update a smart database
  updateSmartDatabase: async (id: string, db: SmartDatabaseCreate): Promise<SmartDatabase> => {
    try {
      const response = await api.put(`/knowledge-base/${id}`, db);
      return response.data;
    } catch (error) {
      console.error(`Error updating smart database ${id}:`, error);
      throw error;
    }
  },

  // Delete a smart database
  deleteSmartDatabase: async (id: string): Promise<void> => {
    try {
      await api.delete(`/knowledge-base/${id}`);
    } catch (error) {
      console.error(`Error deleting smart database ${id}:`, error);
      throw error;
    }
  },

  // Add a document to a smart database
  addDocument: async (dbId: string, document: DocumentCreate): Promise<Document> => {
    try {
      const response = await api.post(`/knowledge-base/${dbId}/documents`, document);
      return response.data;
    } catch (error) {
      console.error(`Error adding document to smart database ${dbId}:`, error);
      throw error;
    }
  },

  // Upload a file to a smart database
  uploadFile: async (dbId: string, file: File, documentName?: string): Promise<Document> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      if (documentName) {
        formData.append('document_name', documentName);
      }
      
      const response = await api.post(`/knowledge-base/${dbId}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return response.data;
    } catch (error) {
      console.error(`Error uploading file to smart database ${dbId}:`, error);
      throw error;
    }
  },

  // Delete a document from a smart database
  deleteDocument: async (dbId: string, docId: string): Promise<void> => {
    try {
      await api.delete(`/knowledge-base/${dbId}/documents/${docId}`);
    } catch (error) {
      console.error(`Error deleting document ${docId} from smart database ${dbId}:`, error);
      throw error;
    }
  },

  // Sync a smart database
  syncSmartDatabase: async (dbId: string): Promise<any> => {
    try {
      const response = await api.post(`/knowledge-base/${dbId}/sync`);
      return response.data;
    } catch (error) {
      console.error(`Error syncing smart database ${dbId}:`, error);
      throw error;
    }
  },

  // Search a smart database
  searchSmartDatabase: async (dbId: string, query: string, topK: number = 5): Promise<SearchResponse> => {
    try {
      const response = await api.post(`/knowledge-base/${dbId}/search`, {
        query,
        top_k: topK
      });
      return response.data;
    } catch (error) {
      console.error(`Error searching smart database ${dbId}:`, error);
      throw error;
    }
  },

  // Get active tasks for a smart database
  getActiveTasks: async (dbId: string): Promise<any> => {
    try {
      const response = await api.get(`/knowledge-base/${dbId}/tasks`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching tasks for smart database ${dbId}:`, error);
      throw error;
    }
  }
};

export default smartDatabaseService; 