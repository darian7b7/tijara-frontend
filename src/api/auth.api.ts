import apiClient from "./apiClient";
import { jwtDecode } from "jwt-decode";
import type { 
  UserProfile, 
  UserSettings, 
  User, 
  AuthTokens, 
  AuthResponse, 
  AuthError,
  SignupRequest,
  LoginRequest,
  TokenPayload
} from "@/types/auth";

// Define types
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
  role: string;
  profilePicture?: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    tokens: AuthTokens;
  } | null;
  error?: string | AuthError;
}

export interface AuthError {
  code: string;
  message: string;
}

export interface APIResponse<T> {
  success: boolean;
  data: T | null;
  error?: string | AuthError;
  status: number;
}

export class TokenManager {
  private static readonly TOKEN_STORAGE_KEY = "auth_tokens";
  private static readonly TOKEN_REFRESH_THRESHOLD = 5 * 60; // 5 minutes in seconds

  static getStoredTokens(): AuthTokens | null {
    const tokens = localStorage.getItem(this.TOKEN_STORAGE_KEY);
    return tokens ? JSON.parse(tokens) : null;
  }

  static setTokens(tokens: AuthTokens): void {
    localStorage.setItem(this.TOKEN_STORAGE_KEY, JSON.stringify(tokens));
    apiClient.defaults.headers.common["Authorization"] = `Bearer ${tokens.accessToken}`;
  }

  static clearTokens(): void {
    localStorage.removeItem(this.TOKEN_STORAGE_KEY);
    delete apiClient.defaults.headers.common["Authorization"];
  }

  static isTokenExpired(token: string): boolean {
    try {
      const decoded = jwtDecode<TokenPayload>(token);
      const currentTime = Math.floor(Date.now() / 1000);
      return decoded.exp < currentTime;
    } catch {
      return true;
    }
  }

  static shouldRefreshToken(token: string): boolean {
    try {
      const decoded = jwtDecode<TokenPayload>(token);
      const currentTime = Math.floor(Date.now() / 1000);
      return decoded.exp - currentTime < this.TOKEN_REFRESH_THRESHOLD;
    } catch {
      return true;
    }
  }

  static async initialize(): Promise<void> {
    const tokens = this.getStoredTokens();
    if (!tokens) return;

    if (this.isTokenExpired(tokens.accessToken)) {
      if (this.isTokenExpired(tokens.refreshToken)) {
        this.clearTokens();
      } else {
        try {
          const response = await AuthAPI.refreshToken();
          if (response.data?.tokens) {
            this.setTokens(response.data.tokens);
          } else {
            this.clearTokens();
          }
        } catch {
          this.clearTokens();
        }
      }
    } else {
      apiClient.defaults.headers.common["Authorization"] = `Bearer ${tokens.accessToken}`;
    }
  }
}

export class AuthAPI {
  static async signup(data: SignupRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>("/auth/register", data);
      
      if (response.data.success && response.data.data?.tokens) {
        TokenManager.setTokens(response.data.data.tokens);
      }
      
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw error.response.data;
      }

      throw {
        success: false,
        error: {
          code: "NETWORK_ERROR",
          message: error.message || "Network error occurred",
        }
      };
    }
  }

  static async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>("/auth/login", data);
      
      if (response.data.success && response.data.data?.tokens) {
        TokenManager.setTokens(response.data.data.tokens);
      }
      
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw error.response.data;
      }

      throw {
        success: false,
        error: {
          code: "NETWORK_ERROR",
          message: error.message || "Network error occurred",
        }
      };
    }
  }

  static async logout(): Promise<void> {
    try {
      await apiClient.post("/auth/logout");
    } finally {
      TokenManager.clearTokens();
    }
  }

  static async refreshToken(): Promise<AuthResponse> {
    const tokens = TokenManager.getStoredTokens();
    if (!tokens) {
      throw {
        success: false,
        error: {
          code: "INVALID_TOKEN",
          message: "No refresh token available",
        }
      };
    }

    try {
      const response = await apiClient.post<AuthResponse>("/auth/refresh", {
        refreshToken: tokens.refreshToken
      });

      if (response.data.success && response.data.data?.tokens) {
        TokenManager.setTokens(response.data.data.tokens);
      }

      return response.data;
    } catch (error: any) {
      TokenManager.clearTokens();
      throw error.response?.data || {
        success: false,
        error: {
          code: "NETWORK_ERROR",
          message: error.message || "Network error occurred",
        }
      };
    }
  }

  static async getCurrentUser(): Promise<AuthResponse> {
    try {
      const response = await apiClient.get<AuthResponse>("/auth/me");
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        TokenManager.clearTokens();
      }
      throw error.response?.data || {
        success: false,
        error: {
          code: "NETWORK_ERROR",
          message: error.message || "Network error occurred",
        }
      };
    }
  }
}

export class UserAPI {
  static async getSettings(): Promise<APIResponse<UserSettings>> {
    try {
      const response = await apiClient.get<APIResponse<UserSettings>>('/user/settings');
      return response.data;
    } catch (error: any) {
      console.error("Get settings Error:", {
        status: error?.response?.status,
        data: error?.response?.data,
        message: error?.message
      });
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch settings',
        status: error.response?.status || 500,
        data: null
      };
    }
  }

  static async updateSettings(settings: UserSettings): Promise<APIResponse<UserProfile>> {
    try {
      const response = await apiClient.post<APIResponse<UserProfile>>('/user/settings', settings);
      return response.data;
    } catch (error: any) {
      console.error("Update settings Error:", {
        status: error?.response?.status,
        data: error?.response?.data,
        message: error?.message
      });
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update settings',
        status: error.response?.status || 500,
        data: null
      };
    }
  }

  static async updateProfile(data: FormData): Promise<APIResponse<UserProfile>> {
    try {
      const response = await apiClient.put<APIResponse<UserProfile>>('/user/profile', data);
      return response.data;
    } catch (error: any) {
      console.error("Update profile Error:", {
        status: error?.response?.status,
        data: error?.response?.data,
        message: error?.message
      });
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update profile',
        status: error.response?.status || 500,
        data: null
      };
    }
  }

  static async getProfile(userId: string): Promise<APIResponse<UserProfile>> {
    try {
      const response = await apiClient.get<APIResponse<UserProfile>>(`/user/profile/${userId}`);
      return response.data;
    } catch (error: any) {
      console.error("Get profile Error:", {
        status: error?.response?.status,
        data: error?.response?.data,
        message: error?.message
      });
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch profile',
        status: error.response?.status || 500,
        data: null
      };
    }
  }
}
