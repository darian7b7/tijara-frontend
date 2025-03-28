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
  private static readonly TOKEN_CHECK_INTERVAL = 60 * 1000; // Check every minute
  private static tokenCheckInterval: NodeJS.Timeout | null = null;

  static getStoredTokens(): AuthTokens | null {
    try {
      const tokens = localStorage.getItem(this.TOKEN_STORAGE_KEY);
      if (!tokens) return null;
      
      const parsedTokens = JSON.parse(tokens);
      if (!parsedTokens?.accessToken || !parsedTokens?.refreshToken) {
        this.clearTokens();
        return null;
      }
      
      return parsedTokens;
    } catch (error) {
      console.error("Error getting stored tokens:", error);
      this.clearTokens();
      return null;
    }
  }

  static setTokens(tokens: AuthTokens): void {
    try {
      localStorage.setItem(this.TOKEN_STORAGE_KEY, JSON.stringify(tokens));
      this.startTokenCheck();
    } catch (error) {
      console.error("Error setting tokens:", error);
      this.clearTokens();
    }
  }

  static clearTokens(): void {
    localStorage.removeItem(this.TOKEN_STORAGE_KEY);
    if (this.tokenCheckInterval) {
      clearInterval(this.tokenCheckInterval);
      this.tokenCheckInterval = null;
    }
  }

  static isTokenExpired(token: string): boolean {
    try {
      const decoded = jwtDecode<TokenPayload>(token);
      if (!decoded.exp) return true;
      
      const now = Math.floor(Date.now() / 1000);
      return now >= decoded.exp;
    } catch {
      return true;
    }
  }

  static needsRefresh(token: string): boolean {
    try {
      const decoded = jwtDecode<TokenPayload>(token);
      if (!decoded.exp) return true;
      
      const now = Math.floor(Date.now() / 1000);
      return now >= decoded.exp - this.TOKEN_REFRESH_THRESHOLD;
    } catch {
      return true;
    }
  }

  private static startTokenCheck(): void {
    if (this.tokenCheckInterval) {
      clearInterval(this.tokenCheckInterval);
    }

    this.tokenCheckInterval = setInterval(async () => {
      const tokens = this.getStoredTokens();
      if (!tokens?.accessToken) {
        this.clearTokens();
        return;
      }

      if (this.needsRefresh(tokens.accessToken)) {
        try {
          const response = await AuthAPI.refreshToken();
          if (response.success && response.data?.tokens) {
            this.setTokens(response.data.tokens);
          } else {
            this.clearTokens();
          }
        } catch (error) {
          console.error("Token refresh failed:", error);
          this.clearTokens();
        }
      }
    }, this.TOKEN_CHECK_INTERVAL);
  }
}

export class AuthAPI {
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

      const response = await apiClient.post<AuthResponse>("/auth/register", {
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
          code: error?.response?.data?.error?.code || "UNKNOWN_ERROR",
          message: error?.response?.data?.error?.message || "Registration failed. Please try again."
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
            data: {
              success: false,
              error: {
                code: "RATE_LIMIT",
                message: "Too many attempts. Please wait a moment before trying again."
              }
            }
          }
        };
      }

      // Update attempt tracking
      this.loginAttempts++;
      this.lastLoginAttempt = now;

      console.log("🔑 Login attempt:", { email: data.email });
      
      const response = await apiClient.post<AuthResponse>("/auth/login", {
        email: data.email,
        password: data.password
      });
      
      // Reset attempts on success
      this.loginAttempts = 0;
      
      if (response.data.success && response.data.data?.tokens) {
        TokenManager.setTokens(response.data.data.tokens);
        console.log("✅ Login successful");
      } else {
        console.error("❌ Login failed: No tokens in response");
        throw {
          response: {
            data: {
              success: false,
              error: {
                code: "INVALID_RESPONSE",
                message: "Invalid server response"
              }
            }
          }
        };
      }

      return response.data;
    } catch (error: any) {
      console.error("Login failed:", {
        status: error?.response?.status,
        data: error?.response?.data,
      });

      // Don't reset attempts on failure
      const errorResponse: AuthResponse = {
        success: false,
        error: {
          code: error?.response?.data?.error?.code || "AUTH_ERROR",
          message: error?.response?.data?.error?.message || "Login failed. Please check your credentials."
        }
      };
      throw errorResponse;
    }
  }

  static async refreshToken(): Promise<AuthResponse> {
    try {
      const tokens = TokenManager.getStoredTokens();
      if (!tokens?.refreshToken) {
        throw {
          response: {
            data: {
              success: false,
              error: {
                code: "NO_REFRESH_TOKEN",
                message: "No refresh token available"
              }
            }
          }
        };
      }

      const response = await apiClient.post<AuthResponse>("/auth/refresh", {
        refreshToken: tokens.refreshToken
      });

      if (response.data.success && response.data.data?.tokens) {
        TokenManager.setTokens(response.data.data.tokens);
      }

      return response.data;
    } catch (error: any) {
      console.error("Token refresh failed:", error);
      TokenManager.clearTokens();
      
      const errorResponse: AuthResponse = {
        success: false,
        error: {
          code: error?.response?.data?.error?.code || "REFRESH_ERROR",
          message: error?.response?.data?.error?.message || "Session expired. Please log in again."
        }
      };
      throw errorResponse;
    }
  }

  static async logout(): Promise<void> {
    try {
      await apiClient.post("/auth/logout");
    } finally {
      TokenManager.clearTokens();
    }
  }

  static async getCurrentUser(): Promise<AuthResponse> {
    try {
      const response = await apiClient.get<AuthResponse>("/auth/me");
      return response.data;
    } catch (error: any) {
      console.error("Get current user failed:", error);
      const errorResponse: AuthResponse = {
        success: false,
        error: {
          code: error?.response?.data?.error?.code || "AUTH_ERROR",
          message: error?.response?.data?.error?.message || "Failed to get user information"
        }
      };
      throw errorResponse;
    }
  }
}

export class UserAPI {
  static async getSettings(): Promise<APIResponse<UserSettings>> {
    try {
      const response = await apiClient.get<APIResponse<UserSettings>>("/users/settings");
      return response.data;
    } catch (error: any) {
      throw {
        success: false,
        error: {
          code: error?.response?.status?.toString() || "UNKNOWN",
          message: error?.response?.data?.message || "Failed to get user settings"
        }
      };
    }
  }

  static async updateSettings(
    settings: UserSettings,
  ): Promise<APIResponse<User>> {
    try {
      const response = await apiClient.put<APIResponse<User>>("/users/settings", settings);
      return response.data;
    } catch (error: any) {
      throw {
        success: false,
        error: {
          code: error?.response?.status?.toString() || "UNKNOWN",
          message: error?.response?.data?.message || "Failed to update user settings"
        }
      };
    }
  }

  static async updateProfile(
    data: FormData,
  ): Promise<APIResponse<User>> {
    try {
      const response = await apiClient.put<APIResponse<User>>("/users/profile", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error: any) {
      throw {
        success: false,
        error: {
          code: error?.response?.status?.toString() || "UNKNOWN",
          message: error?.response?.data?.message || "Failed to update profile"
        }
      };
    }
  }
}
