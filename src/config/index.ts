/// <reference types="vite/client" />

// Default URLs for development
const DEFAULT_API_URL = 'http://localhost:5000';
const DEFAULT_SOCKET_URL = 'http://localhost:5000';

export const API_BASE_URL = 
  import.meta.env.VITE_API_URL || DEFAULT_API_URL;

export const SOCKET_URL = 
  import.meta.env.VITE_SOCKET_URL || DEFAULT_SOCKET_URL;

// Default settings for user preferences
export const DEFAULT_SETTINGS = {
  theme: 'light',
  language: 'en',
  notifications: true,
};
