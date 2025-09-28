import { useState, useEffect } from 'react';
import axios from 'axios';

interface HubSpotConnectionStatus {
  connected: boolean;
  expires_at?: string;
  is_expired?: boolean;
  scope?: string;
  error?: string;
}

interface UseHubSpotOAuthReturn {
  isConnected: boolean;
  isLoading: boolean;
  connectionStatus: HubSpotConnectionStatus | null;
  connectToHubSpot: () => void;
  checkConnectionStatus: () => Promise<void>;
  error: string | null;
}

const API_BASE_URL = '/api/auth';

export const useHubSpotOAuth = (): UseHubSpotOAuthReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<HubSpotConnectionStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkConnectionStatus = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await axios.get(`${API_BASE_URL}/hubspot/status`, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      const status = response.data as HubSpotConnectionStatus;
      setConnectionStatus(status);
      setIsConnected(status.connected && !status.is_expired);
    } catch (err: any) {
      console.error('Error checking HubSpot connection status:', err);
      setError(err.response?.data?.detail || 'Failed to check connection status');
      setIsConnected(false);
      setConnectionStatus(null);
    } finally {
      setIsLoading(false);
    }
  };

  const connectToHubSpot = () => {
    setError(null);
    setIsLoading(true);
    
    // Open popup window for OAuth
    const popup = window.open(
      `${API_BASE_URL}/hubspot/login`,
      'hubspot-oauth',
      'width=600,height=700,scrollbars=yes,resizable=yes'
    );
    
    if (!popup) {
      setError('Popup blocked. Please allow popups for this site.');
      setIsLoading(false);
      return;
    }
    
    // Listen for messages from the popup
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      
      if (event.data.type === 'oauth_success' && event.data.provider === 'hubspot') {
        // OAuth completed successfully
        popup.close();
        checkConnectionStatus();
        window.removeEventListener('message', handleMessage);
      } else if (event.data.type === 'oauth_error' && event.data.provider === 'hubspot') {
        // OAuth failed
        popup.close();
        setError(event.data.error || 'Authentication failed');
        setIsLoading(false);
        window.removeEventListener('message', handleMessage);
      }
    };
    
    window.addEventListener('message', handleMessage);
    
    // Check if popup was closed manually
    const checkClosed = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkClosed);
        setIsLoading(false);
        window.removeEventListener('message', handleMessage);
      }
    }, 1000);
  };

  // Check connection status on mount
  useEffect(() => {
    checkConnectionStatus();
  }, []);

  // Listen for OAuth completion messages
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      
      if (event.data.type === 'oauth_success' && event.data.provider === 'hubspot') {
        // OAuth completed successfully, refresh connection status
        checkConnectionStatus();
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Listen for URL changes to detect OAuth callback
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const provider = urlParams.get('provider');
    
    if (success === 'true' && provider === 'hubspot') {
      // OAuth completed successfully, refresh connection status
      checkConnectionStatus();
      
      // Clean up URL
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, []);

  return {
    isConnected,
    isLoading,
    connectionStatus,
    connectToHubSpot,
    checkConnectionStatus,
    error
  };
}; 