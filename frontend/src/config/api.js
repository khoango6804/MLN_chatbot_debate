/**
 * API Configuration
 * Supports both Vercel deployment and local development
 */

// Get API URL from environment variable or use default
const getApiUrl = () => {
  let apiUrl = '';
  
  // Priority 1: Use REACT_APP_API_BASE if set (for Render deployment)
  if (process.env.REACT_APP_API_BASE) {
    apiUrl = process.env.REACT_APP_API_BASE;
  }
  // Priority 2: Use REACT_APP_API_URL if set
  else if (process.env.REACT_APP_API_URL) {
    apiUrl = process.env.REACT_APP_API_URL;
  }
  // Priority 3: In production, use relative URL (for Vercel deployment)
  else if (process.env.NODE_ENV === 'production') {
    if (typeof window !== 'undefined') {
      apiUrl = window.location.origin + '/api';
    } else {
      apiUrl = '/api';
    }
  }
  // Priority 4: In development, default to localhost
  else {
    apiUrl = 'http://localhost:5000/api';
  }
  
  // Ensure /api is at the end if not already present
  if (apiUrl && !apiUrl.endsWith('/api')) {
    // Remove trailing slash if exists
    apiUrl = apiUrl.replace(/\/$/, '');
    // Add /api if not present
    if (!apiUrl.endsWith('/api')) {
      apiUrl = apiUrl + '/api';
    }
  }
  
  return apiUrl;
};

// Get WebSocket URL
const getWsUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    if (typeof window !== 'undefined') {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      return `${protocol}//${window.location.host}/ws`;
    }
    return process.env.REACT_APP_WS_URL || 'ws://localhost:5000/ws';
  }
  return process.env.REACT_APP_WS_URL || 'ws://localhost:5000/ws';
};

export const API_CONFIG = {
  baseURL: getApiUrl(),
  wsURL: getWsUrl(),
  timeout: 30000,
};

export default API_CONFIG;

