// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || "https://tijara-backend-production.up.railway.app/api";

// Auth Configuration
export const AUTH_CONFIG = {
  tokenKey: "auth_tokens",
  refreshThreshold: 5 * 60, // Refresh token 5 minutes before expiry
  loginRedirect: "/",
  logoutRedirect: "/auth/login",
};

// App Configuration
export const APP_CONFIG = {
  name: import.meta.env.VITE_APP_NAME || "Best Website",
  environment: import.meta.env.VITE_ENV || "development",
  defaultLanguage: "en",
  supportedLanguages: ["en", "ar"],
  itemsPerPage: 10,
  maxImageSize: 5 * 1024 * 1024, // 5MB
  allowedImageTypes: ["image/jpeg", "image/png", "image/webp"],
  maxImagesPerListing: 10,
};

// Route Configuration
export const ROUTE_CONFIG = {
  auth: {
    login: "/auth/login",
    register: "/auth/register",
    forgotPassword: "/auth/forgot-password",
    resetPassword: "/auth/reset-password",
  },
  app: {
    home: "/",
    profile: "/profile",
    settings: "/settings",
    listings: "/listings",
    createListing: "/listings/create",
  },
};

// API Endpoints
export const API_ENDPOINTS = {
  auth: {
    login: "/auth/login",
    register: "/auth/register",
    logout: "/auth/logout",
    refresh: "/auth/refresh",
    me: "/auth/me",
  },
  listings: {
    base: "/listings",
    create: "/listings",
    update: (id: string) => `/listings/${id}`,
    delete: (id: string) => `/listings/${id}`,
    get: (id: string) => `/listings/${id}`,
    search: "/listings/search",
    favorite: (id: string) => `/listings/${id}/favorite`,
  },
  users: {
    profile: "/users/profile",
    update: "/users/profile",
    favorites: "/users/favorites",
    listings: "/users/listings",
  },
};
