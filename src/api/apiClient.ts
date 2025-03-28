import axios from "axios";
import { toast } from "react-toastify";
import { API_BASE_URL } from "@/config";

// Add request tracking to prevent duplicate requests
const pendingRequests = new Map();

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Define routes WITH /api prefix
const ROUTES = {
  auth: "/api/auth",
  listings: "/api/listings",
  users: "/api/users",
  messages: "/api/messages",
  uploads: "/api/uploads",
  notifications: "/api/notifications",
};

// Helper to generate request key
const getRequestKey = (config: any) => {
  return `${config.method}:${config.url}:${JSON.stringify(config.params || {})}`;
};

// Simplified request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const requestKey = getRequestKey(config);
    
    // Only log if it's not a duplicate request within 1 second
    if (!pendingRequests.has(requestKey)) {
      console.log('🚀 Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        params: config.params,
      });
      
      // Track this request
      pendingRequests.set(requestKey, Date.now());
      
      // Clean up old requests after 1 second
      setTimeout(() => {
        pendingRequests.delete(requestKey);
      }, 1000);
    }

    // Handle auth routes
    if (config.url === "/login") {
      config.url = "/api/auth/login";
    } else if (config.url === "/register") {
      config.url = "/api/auth/register";
    } else if (config.url === "/listings") {
      config.url = "/api/listings";
    }

    // Add token to request
    const tokens = JSON.parse(localStorage.getItem("auth_tokens") || "null");
    if (tokens?.accessToken) {
      config.headers.Authorization = `Bearer ${tokens.accessToken}`;
    } else {
      delete config.headers.Authorization;
    }
    
    return config;
  },
  (error) => {
    console.error("❌ Request error:", error);
    return Promise.reject(error);
  }
);

// Add response logging
apiClient.interceptors.response.use(
  (response) => {
    const requestKey = getRequestKey(response.config);
    
    // Only log if it's not a duplicate response
    if (pendingRequests.has(requestKey)) {
      console.log('✅ Response:', {
        status: response.status,
        url: response.config.url,
        // Only log length of data arrays to prevent console spam
        data: Array.isArray(response.data) 
          ? `Array(${response.data.length} items)` 
          : response.data,
      });
    }
    return response;
  },
  (error) => {
    // Only log unique errors
    const requestKey = getRequestKey(error.config);
    if (pendingRequests.has(requestKey)) {
      console.error('❌ Error:', {
        status: error?.response?.status,
        url: error?.config?.url,
        message: error?.message,
      });
    }

    if (!error.response) {
      toast.error("Cannot connect to server. Please check your internet connection.");
      return Promise.reject({
        code: "NETWORK_ERROR",
        message: "Network error occurred. Please check your connection.",
      });
    }

    // Handle specific error cases
    switch (error.response.status) {
      case 401:
        localStorage.removeItem("auth_tokens");
        window.location.href = "/login";
        break;
      case 403:
        toast.error("Access denied. Please check your permissions.");
        break;
      case 429:
        toast.error("Too many requests. Please try again later.");
        break;
      case 500:
        toast.error("Server error. Please try again later.");
        break;
    }

    return Promise.reject({
      code: error.response.data?.code || String(error.response.status),
      message: error.response.data?.message || "An error occurred",
      errors: error.response.data?.errors || [],
      status: error.response.status,
    });
  }
);

export default apiClient;
