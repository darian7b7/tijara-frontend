import axios from "axios";
import { toast } from "react-toastify";
import { API_BASE_URL } from "@/config";
import { TokenManager } from "@/utils/TokenManager";
import type { AuthTokens } from "@/types/auth";

// Add request tracking to prevent duplicate requests
const pendingRequests = new Map();

// Create API client
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // Increased timeout
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false, // Changed to false since we're using token auth
});

// Define routes
const ROUTES = {
  auth: "/auth",
  listings: "/listings",
  users: "/users",
  messages: "/messages",
  uploads: "/uploads",
  notifications: "/notifications",
};

// Helper to generate request key
const getRequestKey = (config: any) => {
  return `${config.method}:${config.url}:${JSON.stringify(config.params || {})}`;
};

// Initialize auth header from storage
const initializeAuthHeader = () => {
  const tokens = TokenManager.getStoredTokens();
  if (tokens?.accessToken) {
    apiClient.defaults.headers.common["Authorization"] = `Bearer ${tokens.accessToken}`;
    console.log("🔒 Initialized Authorization header");
  }
};

// Initialize on load
initializeAuthHeader();

// Track refresh token promise to prevent multiple refresh attempts
let refreshTokenPromise: Promise<AuthTokens | null> | null = null;

// Helper to refresh token
const refreshAuthToken = async (): Promise<AuthTokens | null> => {
  try {
    if (!refreshTokenPromise) {
      refreshTokenPromise = new Promise(async (resolve, reject) => {
        try {
          const tokens = TokenManager.getStoredTokens();
          if (!tokens?.refreshToken) {
            throw new Error("No refresh token available");
          }

          const response = await apiClient.post("/auth/refresh", {
            refreshToken: tokens.refreshToken
          });

          if (response.data?.success && response.data?.data?.tokens) {
            TokenManager.setTokens(response.data.data.tokens);
            apiClient.defaults.headers.common["Authorization"] = `Bearer ${response.data.data.tokens.accessToken}`;
            resolve(response.data.data.tokens);
          } else {
            throw new Error("Invalid refresh response");
          }
        } catch (error) {
          TokenManager.clearTokens();
          delete apiClient.defaults.headers.common["Authorization"];
          reject(error);
        } finally {
          refreshTokenPromise = null;
        }
      });
    }
    return await refreshTokenPromise;
  } catch (error) {
    console.error("Token refresh failed:", error);
    return null;
  }
};

// Simplified request interceptor
apiClient.interceptors.request.use(
  async (config) => {
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

    // Check if we need to add or refresh the token
    const tokens = TokenManager.getStoredTokens();
    if (tokens?.accessToken) {
      if (TokenManager.needsRefresh(tokens.accessToken)) {
        const newTokens = await refreshAuthToken();
        if (newTokens?.accessToken) {
          config.headers.Authorization = `Bearer ${newTokens.accessToken}`;
        }
      } else if (!config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${tokens.accessToken}`;
      }
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
    const errorData = error?.response?.data?.error || {};
    const message = errorData.message || error.message;

    // Handle rate limiting
    if (status === 429) {
      const retryAfter = error.response.headers['retry-after'] || 2;
      await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
      return apiClient(error.config);
    }

    // Handle token expiration
    if (status === 401 && errorData.code === "TOKEN_EXPIRED") {
      try {
        const newTokens = await refreshAuthToken();
        if (newTokens?.accessToken) {
          error.config.headers.Authorization = `Bearer ${newTokens.accessToken}`;
          return apiClient(error.config);
        }
      } catch (refreshError) {
        // If refresh fails, redirect to login
        window.location.href = "/login?error=session_expired";
        return Promise.reject(error);
      }
    }

    if (pendingRequests.has(requestKey)) {
      console.error('❌ Error:', { 
        status, 
        url: error?.config?.url, 
        code: errorData.code,
        message 
      });
      
      // Show error toast for important errors
      if (status !== 401 || errorData.code === "INVALID_CREDENTIALS") {
        toast.error(message || "An error occurred");
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
export { ROUTES };
