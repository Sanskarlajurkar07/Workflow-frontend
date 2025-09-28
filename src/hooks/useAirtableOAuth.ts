import { useState, useEffect } from 'react';
import axios from 'axios';

interface AirtableConnectionStatus {
  connected: boolean;
  expires_at?: string;
  is_expired?: boolean;
  scope?: string;
}

interface UseAirtableOAuthReturn {
  isConnected: boolean;
  isLoading: boolean;
  connectionStatus: AirtableConnectionStatus | null;
  connectToAirtable: () => void;
  checkConnectionStatus: () => Promise<void>;
  error: string | null;
}

const API_BASE_URL = '';

export const useAirtableOAuth = (): UseAirtableOAuthReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<AirtableConnectionStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkConnectionStatus = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await axios.get(`${API_BASE_URL}/airtable/status`, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      const status = response.data as AirtableConnectionStatus;
      setConnectionStatus(status);
      setIsConnected(status.connected && !status.is_expired);
    } catch (err: any) {
      console.error('Error checking Airtable connection status:', err);
      setError(err.response?.data?.detail || 'Failed to check connection status');
      setIsConnected(false);
      setConnectionStatus(null);
    } finally {
      setIsLoading(false);
    }
  };

  const connectToAirtable = () => {
    setError(null);
    
    // Open OAuth flow in the same window
    window.location.href = `${API_BASE_URL}/airtable/login`;
  };

  // Check connection status on mount
  useEffect(() => {
    checkConnectionStatus();
  }, []);

  // Listen for OAuth completion messages if using popup flow
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      
      if (event.data.type === 'oauth_success' && event.data.provider === 'airtable') {
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
    connectToAirtable,
    checkConnectionStatus,
    error
  };
}; 