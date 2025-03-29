// API Configuration
export const API_BASE_URL = "https://tijara-backend-production.up.railway.app/api";

// Auth Configuration
export const AUTH_TOKEN_KEY = "auth_tokens";
export const AUTH_REFRESH_THRESHOLD = 5 * 60; // 5 minutes in seconds
export const AUTH_MAX_RETRIES = 3;
export const AUTH_RETRY_DELAY = 2000; // 2 seconds

// Upload Configuration
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const MAX_FILES = 10;

// Pagination Configuration
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 50;

// Toast Configuration
export const TOAST_AUTO_CLOSE = 5000;
export const TOAST_POSITION = "bottom-right";

// Cache Configuration
export const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
export const CACHE_MAX_SIZE = 100;
