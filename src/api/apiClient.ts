// 📁 src/api/apiClient.ts
import axios, { type AxiosInstance } from "axios";
import type { APIResponse } from "@/types";

// Use VITE_API_URL from env OR fallback to localhost
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5001/api";

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Server status tracking
const serverStatus = {
  isOnline: false,
  lastCheck: 0,
  getStatus: () => serverStatus.isOnline,
  checkServerStatus: async () => {
    try {
      const response = await apiClient.get("/health");
      serverStatus.isOnline = response.status === 200;
      serverStatus.lastCheck = Date.now();
      return serverStatus.isOnline;
    } catch {
      serverStatus.isOnline = false;
      return false;
    }
  },
};

// Attach token if available
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle errors globally
apiClient.interceptors.response.use(
  (response) => {
    if (!serverStatus.getStatus()) {
      serverStatus.checkServerStatus();
    }
    return response;
  },
  async (error) => {
    const response: APIResponse<null> = {
      success: false,
      error: error.response?.data?.message || "An error occurred",
      data: null,
      status: error.response?.status || 500,
    };
    return Promise.reject(response);
  }
);

// Auto check server health every 1 minute
setInterval(() => {
  serverStatus.checkServerStatus();
}, 60000);

export { apiClient };
export default apiClient;
