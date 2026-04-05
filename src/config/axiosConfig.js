import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

/**
 * Setup Axios with CSRF token support
 * Injects CSRF token into request headers for non-GET requests
 */
export const setupAxiosInterceptors = (getCsrfToken) => {
  // Request interceptor: Add CSRF token to non-GET requests
  axios.interceptors.request.use(
    (config) => {
      // Get CSRF token from context
      const token = getCsrfToken?.();

      // Add CSRF token to non-GET requests
      if (token && config.method !== 'get') {
        config.headers['X-CSRF-Token'] = token;
      }

      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor: Handle CSRF token expiration
  axios.interceptors.response.use(
    (response) => {
      // Check if response contains new CSRF token
      const newToken = response.headers['x-csrf-token'];
      if (newToken) {
        // Store new token if provided by backend
        console.debug('CSRF token refreshed from server');
      }
      return response;
    },
    (error) => {
      // Handle 403 Forbidden (potential CSRF token expiration)
      if (error.response?.status === 403) {
        const errorMsg = error.response?.data?.message || '';
        if (errorMsg.includes('CSRF') || errorMsg.includes('token')) {
          console.warn('CSRF token validation failed');
          // Could trigger token refresh here if needed
        }
      }
      return Promise.reject(error);
    }
  );
};

/**
 * Create configured axios instance
 */
export const createAxiosInstance = () => {
  return axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

export default axios;
