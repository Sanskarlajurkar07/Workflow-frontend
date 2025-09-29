import { useState, useEffect } from 'react';
import api from '../lib/axios';

interface GitHubConnectionStatus {
  connected: boolean;
  expires_at?: string;
  is_expired?: boolean;
  scope?: string;
  github_username?: string;
}

interface UseGitHubOAuthReturn {
  isConnected: boolean;
  isLoading: boolean;
  connectionStatus: GitHubConnectionStatus | null;
  connectToGitHub: () => void;
  checkConnectionStatus: () => Promise<void>;
  error: string | null;
}

export const useGitHubOAuth = (): UseGitHubOAuthReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<GitHubConnectionStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkConnectionStatus = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await api.get('/auth/github/status');
      
      const status = response.data as GitHubConnectionStatus;
      setConnectionStatus(status);
      setIsConnected(status.connected && !status.is_expired);
    } catch (err: any) {
      console.error('Error checking GitHub connection status:', err);
      if (err.response?.status === 401) {
        setError('Please log in to connect GitHub');
      } else {
        setError(err.response?.data?.detail || 'Failed to check connection status');
      }
      setIsConnected(false);
      setConnectionStatus(null);
    } finally {
      setIsLoading(false);
    }
  };

  const connectToGitHub = async () => {
    setError(null);
    
    try {
      // First check if user is authenticated
      const authCheck = await api.get('/auth/verify');
      
      if (!authCheck.data.authenticated) {
        setError('Please log in to connect GitHub');
        return;
      }
    } catch (err: any) {
      console.error('Authentication check failed:', err);
      setError('Please log in to connect GitHub');
      return;
    }
    
    // Store current path before OAuth redirect
    const currentPath = window.location.pathname + window.location.search;
    localStorage.setItem('preOAuthPath', currentPath);
    console.log('Stored pre-OAuth path:', currentPath);
    
    // Use popup OAuth flow for better UX - keeps user on workflow canvas
    const oauthUrl = '/api/auth/github/workflow/login';
    
    // Open popup window with credentials
    const popup = window.open(
      oauthUrl,
      'github-oauth',
      'width=600,height=700,scrollbars=yes,resizable=yes,status=yes,location=yes,toolbar=no,menubar=no'
    );
    
    if (!popup) {
      setError('Popup blocked. Please allow popups for this site and try again.');
      return;
    }
    
    // Monitor popup for completion
    const checkClosed = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkClosed);
        // Check connection status after popup closes
        setTimeout(() => {
          checkConnectionStatus();
        }, 500);
      }
    }, 1000);
    
    // Handle popup messages
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      
      if (event.data.type === 'oauth_success' && event.data.provider === 'github') {
        clearInterval(checkClosed);
        popup.close();
        // Refresh connection status
        checkConnectionStatus();
        window.removeEventListener('message', handleMessage);
      } else if (event.data.type === 'oauth_error') {
        clearInterval(checkClosed);
        popup.close();
        setError(event.data.error || 'OAuth authentication failed');
        window.removeEventListener('message', handleMessage);
      }
    };
    
    window.addEventListener('message', handleMessage);
    
    // Cleanup if popup is manually closed
    setTimeout(() => {
      if (!popup.closed) {
        // Popup still open after 5 minutes, clean up
        clearInterval(checkClosed);
        window.removeEventListener('message', handleMessage);
      }
    }, 300000); // 5 minutes timeout
  };

  // Check connection status on mount
  useEffect(() => {
    checkConnectionStatus();
  }, []);

  // Listen for OAuth completion messages if using popup flow
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      
      if (event.data.type === 'oauth_success' && event.data.provider === 'github') {
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
    connectToGitHub,
    checkConnectionStatus,
    error
  };
}; 