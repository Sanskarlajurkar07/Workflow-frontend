import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  },
  withCredentials: true, // Keep this for cookies
  xsrfCookieName: 'flowmind_session', // Match the session cookie name
  xsrfHeaderName: 'X-XSRF-TOKEN' // Standard XSRF header name
});

// Track failed auth attempts to prevent logout loops
let failedAuthAttempts = 0;
const MAX_AUTH_FAILURES = 3;
const FAILURE_RESET_TIMEOUT = 10000; // 10 seconds

// Reset failed attempts after timeout
setInterval(() => {
  if (failedAuthAttempts > 0) {
    console.log('Resetting failed auth attempts');
    failedAuthAttempts = 0;
  }
}, FAILURE_RESET_TIMEOUT);

// Updated request interceptor - DON'T add Bearer token for OAuth2 users
api.interceptors.request.use(
  (config) => {
    // Check if user is using session-based authentication (OAuth2)
    const hasSession = document.cookie.includes('flowmind_session');
    
    if (!hasSession) {
      // Only add Bearer token if no session cookie exists
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor with enhanced error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      console.warn('Authentication failed:', error.response.data);
      
      // Increment failed attempts
      failedAuthAttempts++;
      
      // Only handle auth failures if not already on auth pages
      const currentPath = window.location.pathname;
      const isAuthPath = currentPath.includes('/login') || 
                        currentPath.includes('/auth/callback') ||
                        currentPath.includes('/oauth/callback');
      
      if (!isAuthPath && failedAuthAttempts >= MAX_AUTH_FAILURES) {
        console.log(`Max auth failures (${MAX_AUTH_FAILURES}) reached, handling logout...`);
        
        // For OAuth users, try to refresh the session first
        if (document.cookie.includes('flowmind_session')) {
          console.log('Attempting to refresh OAuth session...');
          try {
            // Try to refresh the session
            const refreshResponse = await fetch('http://localhost:8000/api/auth/refresh', {
              method: 'POST',
              credentials: 'include',
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              }
            });
            
            if (refreshResponse.ok) {
              const refreshData = await refreshResponse.json();
              if (refreshData.success) {
                console.log('Session refreshed successfully');
                failedAuthAttempts = 0;
                // Retry the original request
                return api(error.config);
              }
            }
          } catch (refreshError) {
            console.error('Failed to refresh session:', refreshError);
          }
        }
        
        // If refresh failed or not using OAuth, clear tokens and redirect
        localStorage.removeItem('authToken');
        localStorage.removeItem('token');
        sessionStorage.removeItem('authToken');
        
        // Clear session cookie manually as well
        document.cookie = 'flowmind_session=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=localhost';
        
        // Store the current path for redirect after login
        localStorage.setItem('preLoginPath', window.location.pathname + window.location.search);
        
        // Add a small delay before redirect to prevent rapid redirects
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Final check before redirect
        if (failedAuthAttempts >= MAX_AUTH_FAILURES) {
          toast.error('Your session has expired. Please log in again.');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;