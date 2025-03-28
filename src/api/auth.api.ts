import apiClient from "./apiClient";
import { jwtDecode } from "jwt-decode";
import { AUTH_TOKEN_KEY } from "@/config";
import type {
  UserSettings,
  User,
  AuthTokens,
  AuthResponse,
  AuthError,
  SignupRequest,
  LoginRequest,
  TokenPayload,
  APIResponse,
} from "@/types/auth";

// Add debounce helper at the top of the file
const debounce = (func: Function, wait: number) => {
  let timeout: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeout);
    return new Promise((resolve) => {
      timeout = setTimeout(() => resolve(func(...args)), wait);
    });
  };
};

export class TokenManager {
  private static readonly TOKEN_STORAGE_KEY = AUTH_TOKEN_KEY;
  private static readonly TOKEN_REFRESH_THRESHOLD = 5 * 60; // 5 minutes in seconds

  static getStoredTokens(): AuthTokens | null {
    const tokens = localStorage.getItem(this.TOKEN_STORAGE_KEY);
    return tokens ? JSON.parse(tokens) : null;
  }

  static setTokens(tokens: AuthTokens): void {
    // Add debug logging
    console.log("🔑 Setting tokens:", {
      hasAccessToken: !!tokens.accessToken,
      hasRefreshToken: !!tokens.refreshToken
    });
    
    localStorage.setItem(this.TOKEN_STORAGE_KEY, JSON.stringify(tokens));
    
    // Ensure Authorization header is set
    if (tokens.accessToken) {
      apiClient.defaults.headers.common["Authorization"] = `Bearer ${tokens.accessToken}`;
      console.log("🔒 Set Authorization header");
    }
  }

  static clearTokens(): void {
    console.log("🗑️ Clearing tokens from storage");
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
      apiClient.defaults.headers.common["Authorization"] =
        `Bearer ${tokens.accessToken}`;
    }
  }
}

export class AuthAPI {
  // Add login attempt tracking
  private static loginAttempts = 0;
  private static lastLoginAttempt = 0;
  private static readonly LOGIN_COOLDOWN = 2000; // 2 seconds
  private static readonly MAX_LOGIN_ATTEMPTS = 3;

  static async signup(data: SignupRequest): Promise<AuthResponse> {
    try {
      console.log("Sending signup request:", {
        email: data.email,
        username: data.username,
      });

      const response = await apiClient.post<AuthResponse>("/api/auth/register", {
        email: data.email,
        username: data.username,
        password: data.password,
        name: data.username,
      });

      console.log("Signup response:", {
        success: response.data.success,
        hasUser: !!response.data.data?.user,
        hasTokens: !!response.data.data?.tokens,
      });

      if (response.data.success && response.data.data?.tokens) {
        TokenManager.setTokens(response.data.data.tokens);
      }
      return response.data;
    } catch (error: any) {
      console.error("Signup request failed:", {
        status: error?.response?.status,
        data: error?.response?.data,
      });
      const errorResponse: AuthResponse = {
        success: false,
        error: {
          code: error?.response?.status?.toString() || "UNKNOWN",
          message: error?.response?.data?.message || "Registration failed"
        }
      };
      throw errorResponse;
    }
  }

  static async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      // Check if we're within cooldown period
      const now = Date.now();
      if (this.loginAttempts >= this.MAX_LOGIN_ATTEMPTS && 
          now - this.lastLoginAttempt < this.LOGIN_COOLDOWN) {
        throw {
          response: {
            status: 429,
            data: {
              message: "Please wait a moment before trying again"
            }
          }
        };
      }

      // Update attempt tracking
      this.loginAttempts++;
      this.lastLoginAttempt = now;

      console.log("🔑 Login attempt:", { email: data.email });
      
      const response = await apiClient.post<AuthResponse>("/api/auth/login", {
        email: data.email,
        password: data.password
      });
      
      // Reset attempts on success
      this.loginAttempts = 0;
      
      if (response.data.success && response.data.data?.tokens) {
        TokenManager.setTokens(response.data.data.tokens);
        console.log("✅ Login successful");
      }
      
      return response.data;
    } catch (error: any) {
      const status = error?.response?.status;
      const message = error?.response?.data?.message || "Unknown error";
      
      console.error("❌ Login failed:", { status, message });

      // Handle specific error cases
      let errorMessage = "Invalid email or password";
      if (status === 429) {
        errorMessage = "Too many attempts. Please wait a moment before trying again.";
        // Reset attempts after cooldown
        setTimeout(() => {
          this.loginAttempts = 0;
        }, this.LOGIN_COOLDOWN);
      } else if (status === 404) {
        errorMessage = "User not found";
      } else if (status === 401) {
        errorMessage = "Invalid credentials";
      }

      throw {
        success: false,
        error: {
          code: status?.toString() || "LOGIN_FAILED",
          message: errorMessage
        }
      };
    }
  }

  static async logout(): Promise<void> {
    try {
      await apiClient.post("/api/auth/logout");
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
        },
      } as AuthResponse;
    }

    try {
      const response = await apiClient.post<AuthResponse>("/api/auth/refresh", {
        refreshToken: tokens.refreshToken,
      });
      return response.data;
    } catch (error: any) {
      throw {
        success: false,
        error: {
          code: "REFRESH_FAILED",
          message: error?.response?.data?.message || "Failed to refresh token",
        },
      } as AuthResponse;
    }
  }

  static async getCurrentUser(): Promise<AuthResponse> {
    try {
      const response = await apiClient.get<AuthResponse>("/api/auth/me");
      return response.data;
    } catch (error: any) {
      throw {
        success: false,
        error: {
          code: error?.response?.status?.toString() || "UNKNOWN",
          message: error?.response?.data?.message || "Failed to get current user",
        },
      } as AuthResponse;
    }
  }
}

export class UserAPI {
  static async getSettings(): Promise<APIResponse<UserSettings>> {
    try {
      const response = await apiClient.get<APIResponse<UserSettings>>("/api/user/settings");
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        data: null,
        error: {
          code: error?.response?.status?.toString() || "UNKNOWN",
          message: error?.response?.data?.message || "Failed to fetch settings"
        },
        status: error?.response?.status || 500
      };
    }
  }

  static async updateSettings(
    settings: UserSettings,
  ): Promise<APIResponse<User>> {
    try {
      const response = await apiClient.post<APIResponse<User>>(
        "/api/user/settings",
        settings,
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        data: null,
        error: {
          code: error?.response?.status?.toString() || "UNKNOWN",
          message: error?.response?.data?.message || "Failed to update settings"
        },
        status: error?.response?.status || 500
      };
    }
  }

  static async updateProfile(
    data: FormData,
  ): Promise<APIResponse<User>> {
    try {
      const response = await apiClient.put<APIResponse<User>>(
        "/api/user/profile",
        data,
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        data: null,
        error: {
          code: error?.response?.status?.toString() || "UNKNOWN",
          message: error?.response?.data?.message || "Failed to update profile"
        },
        status: error?.response?.status || 500
      };
    }
  }
}
