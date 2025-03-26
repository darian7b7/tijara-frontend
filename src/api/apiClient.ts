// 📁 src/api/apiClient.ts
import type { AxiosInstance } from "axios";
import axios from "axios";
import { API_BASE_URL } from "@/config";
import type { APIResponse } from "@/types";
import { AuthAPI } from "./auth.api";
import { jwtDecode } from "jwt-decode";
import { serverStatus } from "@/utils/serverStatus";
import { toast } from "react-toastify";

// Token Storage
const TOKEN_STORAGE_KEY = "auth_tokens";

// Create axios instance with proper configuration
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Request Interceptor (Handles Token Authentication)
apiClient.interceptors.request.use(
  async (config) => {
    // Skip token check for auth endpoints to prevent infinite loops
    if (config.url?.startsWith("/auth")) {
      return config;
    }

    // Check server status before making request
    if (!serverStatus.getStatus() && config.url !== "/health") {
      const isOnline = await serverStatus.checkServerStatus();
      if (!isOnline) {
        return Promise.reject(new Error("Server is offline"));
      }
    }

    const tokens = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!tokens) {
      // No tokens found, clear auth header
      delete config.headers.Authorization;
      return config;
    }

    try {
      const { accessToken, refreshToken } = JSON.parse(tokens);
      if (!accessToken || !refreshToken) {
        // Invalid tokens, clear storage and header
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        delete config.headers.Authorization;
        return config;
      }

      // Check if Token is Expired
      const decoded = jwtDecode<{ exp?: number }>(accessToken);
      const currentTime = Math.floor(Date.now() / 1000);

      if ((decoded.exp || 0) <= currentTime + 300) {
        // Token expiring in 5 mins, try to refresh
        try {
          const response = await AuthAPI.refreshToken();
          if (response.success && response.data?.tokens?.accessToken) {
            const newToken = response.data.tokens.accessToken;
            config.headers.Authorization = `Bearer ${newToken}`;

            // Update stored tokens
            const currentTokens = JSON.parse(tokens);
            localStorage.setItem(
              TOKEN_STORAGE_KEY,
              JSON.stringify({
                ...currentTokens,
                accessToken: newToken,
              }),
            );
            return config;
          } else {
            // Refresh failed, clear tokens and trigger auth error
            localStorage.removeItem(TOKEN_STORAGE_KEY);
            delete config.headers.Authorization;
            window.dispatchEvent(
              new CustomEvent("auth-error", {
                detail: { message: "Session expired. Please log in again." },
              }),
            );
            return Promise.reject(new Error("Session expired"));
          }
        } catch (error) {
          console.error("🔴 Token refresh failed:", error);
          localStorage.removeItem(TOKEN_STORAGE_KEY);
          delete config.headers.Authorization;
          window.dispatchEvent(
            new CustomEvent("auth-error", {
              detail: {
                message: "Failed to refresh session. Please log in again.",
              },
            }),
          );
          return Promise.reject(error);
        }
      } else {
        // Token still valid, use it
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
    } catch (error) {
      console.error("🔴 Token parsing failed:", error);
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      delete config.headers.Authorization;
    }

    return config;
  },
  (error) => {
    console.error("🔴 Request preparation failed:", error);
    return Promise.reject(error);
  },
);

// Add response interceptor for consistent error handling
apiClient.interceptors.response.use(
  (response) => {
    // Update server status on successful response
    if (!serverStatus.getStatus()) {
      serverStatus.checkServerStatus();
    }
    return response;
  },
  async (error) => {
    // Handle CORS errors
    if (error.message === "Network Error") {
      const response: APIResponse<null> = {
        success: false,
        error: "Unable to connect to the server. Please check your connection.",
        data: null,
        status: 0,
      };
      toast.error(response.error);
      return Promise.reject(response);
    }

    // Check if error is due to server being offline
    if (error.code === "ERR_CONNECTION_REFUSED") {
      serverStatus.checkServerStatus();
      const response: APIResponse<null> = {
        success: false,
        error: "Server is currently offline. Please try again later.",
        data: null,
        status: 503,
      };
      toast.error(response.error);
      return Promise.reject(response);
    }

    // Handle authentication errors
    if (error.response?.status === 401) {
      // Clear tokens and trigger auth error
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      delete apiClient.defaults.headers.common["Authorization"];
      window.dispatchEvent(
        new CustomEvent("auth-error", {
          detail: { message: "Authentication required" },
        }),
      );
    }

    const response: APIResponse<null> = {
      success: false,
      error: error.response?.data?.message || "An unexpected error occurred",
      data: null,
      status: error.response?.status || 500,
    };

    return Promise.reject(response);
  },
);

// Retry logic for failed requests
const retryRequest = async (fn: () => Promise<any>, retries: number = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries - 1) throw error;
    }
  }
};

// Start periodic server status check
setInterval(() => {
  serverStatus.checkServerStatus();
}, 30000); // Check every 30 seconds

// Export API Instance
export default apiClient;
