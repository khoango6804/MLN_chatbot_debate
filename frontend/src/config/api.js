/**
 * API Configuration
 * Supports both Vercel deployment and local development
 */

// Get API URL from environment variable or use default
const getApiUrl = () => {
  // In production on Vercel, use relative URL
  if (process.env.NODE_ENV === 'production') {
    // Use window.location.origin for Vercel deployment
    if (typeof window !== 'undefined') {
      return window.location.origin + '/api';
    }
    // Fallback for SSR
    return process.env.REACT_APP_API_URL || '/api';
  }
  
  // In development, use environment variable or default to localhost
  return process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
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

