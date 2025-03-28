// src/config/index.ts

const isBrowser = typeof window !== "undefined";

const isDevelopment = process.env.NODE_ENV === "development";

// Ensure consistent API URL formatting
export const API_BASE_URL = isDevelopment
  ? "http://localhost:5001/api"
  : `${import.meta.env.VITE_API_URL}/api`;

console.log('📍 API Base URL:', API_BASE_URL);
