import { useState, useEffect } from 'react';
import axios from 'axios';

interface NotionConnectionStatus {
  connected: boolean;
  expires_at?: string;
  is_expired?: boolean;
  scope?: string;
  token_valid?: boolean;
  error?: string;
}

interface UseNotionOAuthReturn {
  isConnected: boolean;
  isLoading: boolean;
  connectionStatus: NotionConnectionStatus | null;
  connectToNotion: () => void;
  storeNotionToken: (token: string) => Promise<boolean>;
  checkConnectionStatus: () => Promise<void>;
  error: string | null;
}

const API_BASE_URL = '/api/auth';

export const useNotionOAuth = (): UseNotionOAuthReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<NotionConnectionStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkConnectionStatus = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await axios.get(`${API_BASE_URL}/notion/status`, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      const status = response.data as NotionConnectionStatus;
      setConnectionStatus(status);
      setIsConnected(status.connected && !status.is_expired);
    } catch (err: any) {
      console.error('Error checking Notion connection status:', err);
      setError(err.response?.data?.detail || 'Failed to check connection status');
      setIsConnected(false);
      setConnectionStatus(null);
    } finally {
      setIsLoading(false);
    }
  };

  const storeNotionToken = async (token: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await axios.post(`${API_BASE_URL}/notion/store-token`, {
        access_token: token
      }, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (response.data.success) {
        // Refresh connection status after storing token
        await checkConnectionStatus();
        return true;
      }
      return false;
    } catch (err: any) {
      console.error('Error storing Notion token:', err);
      setError(err.response?.data?.detail || 'Failed to store Notion token');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const connectToNotion = () => {
    setError(null);
    
    // For Notion, we don't redirect to OAuth but instead show a token input
    // This will be handled by the NotionNode component
    console.log('Notion uses token-based authentication. Please provide your integration token.');
  };

  // Check connection status on mount
  useEffect(() => {
    checkConnectionStatus();
  }, []);

  // Listen for OAuth completion messages if using popup flow
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      
      if (event.data.type === 'oauth_success' && event.data.provider === 'notion') {
        // OAuth completed successfully, refresh connection status
        checkConnectionStatus();
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return {
    isConnected,
    isLoading,
    connectionStatus,
    connectToNotion,
    storeNotionToken,
    checkConnectionStatus,
    error
  };
}; 