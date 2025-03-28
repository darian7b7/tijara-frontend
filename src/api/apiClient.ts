import axios from "axios";
import { toast } from "react-toastify";
import { API_BASE_URL } from "@/config";

// Add request tracking to prevent duplicate requests
const pendingRequests = new Map();

// Token storage key
const AUTH_TOKEN_KEY = "auth_tokens";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // Increased timeout
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

// Initialize auth header from storage
const initializeAuthHeader = () => {
  const tokens = JSON.parse(localStorage.getItem(AUTH_TOKEN_KEY) || "null");
  if (tokens?.accessToken) {
    apiClient.defaults.headers.common["Authorization"] = `Bearer ${tokens.accessToken}`;
    console.log("🔒 Initialized Authorization header");
  }
};

// Initialize on load
initializeAuthHeader();

// Simplified request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const requestKey = getRequestKey(config);
    
    // Only log if it's not a duplicate request within 2 seconds
    if (!pendingRequests.has(requestKey)) {
      console.log('🚀 Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        params: config.params,
      });
      
      // Track this request
      pendingRequests.set(requestKey, Date.now());
      
      // Clean up old requests after 2 seconds
      setTimeout(() => {
        pendingRequests.delete(requestKey);
      }, 2000);
    }

    // Handle auth routes
    if (config.url?.startsWith("/api/auth")) {
      // Already has /api prefix
      return config;
    }

    if (config.url === "/login") {
      config.url = "/api/auth/login";
    } else if (config.url === "/register") {
      config.url = "/api/auth/register";
    } else if (config.url === "/listings") {
      config.url = "/api/listings";
    }

    // Add token to request if not already set
    const tokens = JSON.parse(localStorage.getItem(AUTH_TOKEN_KEY) || "null");
    if (tokens?.accessToken && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${tokens.accessToken}`;
    }
    
    return config;
  },
  (error) => {
    console.error("❌ Request error:", error);
    return Promise.reject(error);
  }
);

// Add response logging and error handling
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
  async (error) => {
    const requestKey = getRequestKey(error.config);
    const status = error?.response?.status;
    const message = error?.response?.data?.message || error.message;

    // Handle rate limiting
    if (status === 429) {
      const retryAfter = error.response.headers['retry-after'] || 1;
      await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
      return apiClient(error.config);
    }

    // Handle token expiration
    if (status === 401) {
      const tokens = JSON.parse(localStorage.getItem(AUTH_TOKEN_KEY) || "null");
      if (tokens?.refreshToken) {
        try {
          const response = await apiClient.post("/api/auth/refresh", {
            refreshToken: tokens.refreshToken
          });
          if (response.data?.data?.tokens) {
            localStorage.setItem(AUTH_TOKEN_KEY, JSON.stringify(response.data.data.tokens));
            apiClient.defaults.headers.common["Authorization"] = `Bearer ${response.data.data.tokens.accessToken}`;
            error.config.headers.Authorization = `Bearer ${response.data.data.tokens.accessToken}`;
            return apiClient(error.config);
          }
        } catch (refreshError) {
          localStorage.removeItem(AUTH_TOKEN_KEY);
          delete apiClient.defaults.headers.common["Authorization"];
          window.location.href = "/login";
        }
      }
    }

    if (pendingRequests.has(requestKey)) {
      console.error('❌ Error:', { status, url: error?.config?.url, message });
      
      // Show error toast for important errors
      if (status !== 401) {
        toast.error(message || "An error occurred");
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
export { ROUTES };
