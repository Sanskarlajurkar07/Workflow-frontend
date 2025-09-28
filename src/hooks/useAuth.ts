import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string) => void;
  logout: () => void;
}

export function useAuth(): AuthState {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        console.log("Checking auth status...");
        // Instead of checking localStorage, make a request to verify session
        const response = await axios.get('http://localhost:8000/api/auth/verify', {
          withCredentials: true  // Important: needed for cookies to be sent
        });
        
        if (response.status === 200) {
          console.log("Auth status: authenticated");
          setIsAuthenticated(true);
        } else {
          console.log("Auth status: not authenticated");
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.log("Auth check failed:", error);
      setIsAuthenticated(false);
      } finally {
      setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Login: store user info and set authenticated
  const login = useCallback(async (temporaryToken: string) => {
    try {
      setIsLoading(true);
      console.log("Starting login with token:", temporaryToken.substring(0, 10) + "...");
      
      // Exchange the temporary token for an HTTP-only cookie session
      const response = await axios.post(
        'http://localhost:8000/api/auth/session', 
        { token: temporaryToken },
        { 
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log("Login successful");
      setIsAuthenticated(true);
      toast.success('Login successful!');
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Logout: clear session
  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Call logout endpoint to clear the HTTP-only cookie
      await axios.post('http://localhost:8000/api/auth/logout', {}, { 
        withCredentials: true 
      });
      
      setIsAuthenticated(false);
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
    setIsAuthenticated(false);
      toast.error('Error during logout');
    } finally {
    setIsLoading(false);
    }
  }, []);

  return { isAuthenticated, isLoading, login, logout };
}