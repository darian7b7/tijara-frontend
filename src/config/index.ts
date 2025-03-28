// src/config/index.ts

const isBrowser = typeof window !== "undefined";

const isDevelopment = isBrowser
  ? window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
  : process.env.NODE_ENV !== "production";

// Set API URL without /api suffix
export const API_BASE_URL = isDevelopment
  ? "http://localhost:5001"
  : "https://tijara-backend-production.up.railway.app";
