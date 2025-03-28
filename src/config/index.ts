// src/config/index.ts

const isBrowser = typeof window !== "undefined";

const isDevelopment = process.env.NODE_ENV === "development";

// Use the API URL directly since it already includes /api
export const API_BASE_URL = isDevelopment
  ? "http://localhost:5001/api"
  : import.meta.env.VITE_API_URL;

console.log('📍 API Base URL:', API_BASE_URL);
