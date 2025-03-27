// 📁 src/api/apiClient.ts
import type { AxiosInstance } from "axios";
import axios from "axios";
import { API_BASE_URL } from "@/config";
import type { APIResponse } from "@/types";

// Create axios instance with base configuration
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

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Get token from storage
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    // Update server status on successful response
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
  },
);

// Start periodic server status check
setInterval(() => {
  serverStatus.checkServerStatus();
}, 60000); // Check every minute

// Export API Instance
export { apiClient };
export default apiClient;
