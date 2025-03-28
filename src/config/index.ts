// src/config/index.ts

const isBrowser = typeof window !== "undefined";

const isDevelopment = process.env.NODE_ENV === "development";

// Remove /api from the end since it's already in VITE_API_URL
export const API_BASE_URL = isDevelopment
  ? "http://localhost:5001"
  : import.meta.env.VITE_API_URL.replace(/\/api$/, '');

console.log('📍 API Base URL:', API_BASE_URL);
