import { useState, useCallback } from 'react';
import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from './useAuth';

// Base API URL from environment
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Error response types
interface ApiError {
  status: number;
  message: string;
  details?: any;
}

// Hook result type
interface UseApiResult<T> {
  data: T | null;
  error: ApiError | null;
  loading: boolean;
  request: (config: AxiosRequestConfig) => Promise<T | null>;
}

export function useApi<T = any>(): UseApiResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const { logout } = useAuth();

  const request = useCallback(async (config: AxiosRequestConfig): Promise<T | null> => {
    try {
      setLoading(true);
      setError(null);

      // Enable credentials for all requests to allow cookies
      const updatedConfig = {
        ...config,
        withCredentials: true
      };
      
      // Make request
      const response: AxiosResponse<T> = await axios({
        baseURL: API_BASE_URL,
        ...updatedConfig
      });

      setData(response.data);
      return response.data;
    } catch (err) {
      const error = err as AxiosError;
      
      // Handle different error scenarios
      if (error.response) {
        // Server responded with error
        const status = error.response.status;
        const errorData = error.response.data as any;
        
        // Create formatted error
        const apiError: ApiError = {
          status,
          message: errorData.detail || errorData.message || 'An error occurred',
          details: errorData
        };
        
        setError(apiError);
        
        // Handle authentication errors - logout user
        if (status === 401) {
          toast.error('Your session has expired. Please log in again.');
          logout();
        } else if (status === 403) {
          toast.error('You do not have permission to perform this action.');
        } else if (status === 404) {
          toast.error('The requested resource was not found.');
        } else if (status >= 500) {
          toast.error('A server error occurred. Please try again later.');
        } else {
          // Show error message from API if available
          toast.error(apiError.message);
        }
      } else if (error.request) {
        // Request made but no response
        const networkError: ApiError = {
          status: 0,
          message: 'Network error. Please check your connection.'
        };
        setError(networkError);
        toast.error(networkError.message);
      } else {
        // Something else happened
        const unknownError: ApiError = {
          status: 0,
          message: error.message || 'An unexpected error occurred'
        };
        setError(unknownError);
        toast.error(unknownError.message);
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, [logout]);

  return { data, error, loading, request };
} 