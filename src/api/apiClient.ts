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
    
    if (pendingRequests.has(requestKey)) {
      console.log('✅ Response:', {
        status: response.status,
        url: response.config.url,
        data: Array.isArray(response.data) 
          ? `Array(${response.data.length} items)` 
          : response.data,
      });
    }
    return response;
  },
  (error) => {
    const requestKey = getRequestKey(error.config);
    if (pendingRequests.has(requestKey)) {
      const status = error?.response?.status;
      const message = error?.response?.data?.message || error.message;
      
      console.error('❌ Error:', { status, url: error?.config?.url, message });

      // Show user-friendly error messages
      switch (status) {
        case 429:
          toast.error("Too many attempts. Please wait a moment before trying again.");
          break;
        case 401:
          toast.error("Invalid credentials. Please check your email and password.");
          break;
        case 404:
          toast.error("User not found. Please check your email address.");
          break;
        case 500:
          toast.error("Server error. Please try again later.");
          break;
        default:
          toast.error(message || "An error occurred. Please try again.");
      }
    }

    return Promise.reject({
      code: error?.response?.data?.code || String(error?.response?.status),
      message: error?.response?.data?.message || "An error occurred",
      errors: error?.response?.data?.errors || [],
      status: error?.response?.status
    });
  }
);

export default apiClient;
