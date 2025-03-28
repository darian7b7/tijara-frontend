// src/config/index.ts

const isBrowser = typeof window !== "undefined";

const isDevelopment = isBrowser
  ? window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
  : process.env.NODE_ENV !== "production";

// Set API URL based on environment
export const API_BASE_URL = isDevelopment
  ? "http://localhost:5001" // Your local backend port
  : import.meta.env.VITE_API_URL || "https://tijara-backend-production.up.railway.app";
