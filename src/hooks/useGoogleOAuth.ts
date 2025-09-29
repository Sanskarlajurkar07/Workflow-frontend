import { useState, useCallback, useEffect } from 'react';

interface UseGoogleOAuthReturn {
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  connectToGoogle: (service: string, scopes: string[]) => void;
  checkConnectionStatus: () => void;
}

export const useGoogleOAuth = (nodeId: string, updateNodeData: Function): UseGoogleOAuthReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkConnectionStatus = useCallback(async () => {
    try {
      const response = await fetch('https://workflow-backend-2-1ki9.onrender.com/api/auth/verify', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Connection status:', data);
        setIsConnected(true);
      } else {
        setIsConnected(false);
      }
    } catch (err) {
      console.error('Failed to check connection status:', err);
      setIsConnected(false);
    }
  }, []);

  // Check connection status periodically
  useEffect(() => {
    checkConnectionStatus();
    const interval = setInterval(checkConnectionStatus, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, [checkConnectionStatus]);

  const connectToGoogle = useCallback((service: string, scopes: string[]) => {
    setError(null);
    setIsLoading(true);
    
    const scope = scopes.join(' ');
    const state = Math.random().toString(36).substring(7);
    localStorage.setItem('googleOAuthState', state);
    localStorage.setItem('preOAuthPath', window.location.pathname + window.location.search);
    
    // Get the current port from window.location
    const currentPort = window.location.port || '5174'; // Default to 5174 if not available
    console.log('Current port:', currentPort);
    
  // Fix the redirect URI to match the backend routes
  const redirectUri = `https://workflow-backend-2-1ki9.onrender.com/api/auth/${service}/callback`;
  // Read client id from environment
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
    
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${clientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=code&` +
      `scope=${encodeURIComponent(scope)}&` +
      `access_type=offline&` +
      `state=${state}&` +
      `include_granted_scopes=true&` +
      `prompt=consent`;
    
    console.log(`Initiating Google ${service} OAuth:`, authUrl);
    
    // Open popup window with proper features
    const popup = window.open(
      authUrl,
      `google-${service}-oauth`,
      'width=600,height=700,scrollbars=yes,resizable=yes,status=yes,location=yes,toolbar=no,menubar=no,left=' + 
      (window.screen.width / 2 - 300) + ',top=' + (window.screen.height / 2 - 350)
    );
    
    if (!popup) {
      setError('Popup blocked. Please allow popups for this site and try again.');
      setIsLoading(false);
      return;
    }

    let messageReceived = false;
    
    // Listen for popup messages
    const handleMessage = async (event: MessageEvent) => {
      // Verify origin for security
      if (event.origin !== window.location.origin) {
        console.warn('Received message from unexpected origin:', event.origin);
        return;
      }
      
      console.log(`Google ${service} OAuth message:`, event.data);
      
      if (event.data.type === 'oauth_success' && event.data.provider === service) {
        messageReceived = true;
        const urlParams = new URLSearchParams(event.data.url || '');
        const accessToken = urlParams.get('access_token');
        const refreshToken = urlParams.get('refresh_token');
        
        console.log(`Google ${service} OAuth success:`, { accessToken: !!accessToken, refreshToken: !!refreshToken });
        
        if (accessToken) {
          // Verify session is established
          try {
            const verifyResponse = await fetch('https://workflow-backend-2-1ki9.onrender.com/api/auth/verify', {
              credentials: 'include'
            });
            
            if (!verifyResponse.ok) {
              throw new Error('Failed to verify session');
            }
            
            // Update node data properly, preserving existing params
            updateNodeData(nodeId, (prevData: any) => ({
              ...prevData,
              params: {
                ...(prevData.params || {}),
                authToken: accessToken,
                refreshToken: refreshToken,
                isAuthenticated: true
              }
            }));
            setIsConnected(true);
          } catch (error) {
            console.error('Session verification failed:', error);
            setError('Failed to verify session. Please try again.');
          }
        }
        setIsLoading(false);
        cleanup();
      } else if (event.data.type === 'oauth_error') {
        messageReceived = true;
        console.error(`Google ${service} OAuth error:`, event.data.error);
        let errorMessage = event.data.error || 'Authentication failed';
        
        // Handle specific Google OAuth errors
        if (errorMessage.includes('access_denied')) {
          errorMessage = 'Access denied. This app may be in testing mode - please ensure your Google account is added as a test user.';
        } else if (errorMessage.includes('invalid_client')) {
          errorMessage = 'Invalid client configuration. Please check the Google Cloud Console settings.';
        }
        
        setError(errorMessage);
        setIsLoading(false);
        cleanup();
      }
    };

    const cleanup = () => {
      window.removeEventListener('message', handleMessage);
      if (checkClosed) {
        clearInterval(checkClosed);
      }
    };
    
    window.addEventListener('message', handleMessage);
    
    // Monitor popup closure
    let checkAttempts = 0;
    const maxCheckAttempts = 300; // 5 minutes
    
    const checkClosed = setInterval(() => {
      checkAttempts++;
      
      try {
        if (popup.closed) {
          cleanup();
          if (!messageReceived) {
            setIsLoading(false);
            console.log(`Google ${service} OAuth popup closed by user`);
            setError('Authentication was cancelled');
          }
          return;
        }
      } catch (e) {
        // COOP error - assume popup is still open but we can't check
        console.warn('Cannot check popup status due to COOP policy, continuing to wait for message...');
        
        // If we've been trying for too long and got no message, assume failure
        if (checkAttempts > maxCheckAttempts && !messageReceived) {
          cleanup();
          setIsLoading(false);
          setError('Authentication timed out. Please try again.');
          return;
        }
      }
      
      // Safety timeout
      if (checkAttempts > maxCheckAttempts) {
        cleanup();
        if (!messageReceived) {
          setIsLoading(false);
          setError('Authentication timed out. Please try again.');
        }
      }
    }, 1000);
    
  }, [nodeId, updateNodeData]);

  return {
    isConnected,
    isLoading,
    error,
    connectToGoogle,
    checkConnectionStatus
  };
}; 