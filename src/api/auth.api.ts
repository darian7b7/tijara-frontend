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
      if (!tokens?.accessToken || !tokens?.refreshToken) {
        console.error("Invalid tokens:", tokens);
        return;
      }

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
    } catch (error) {
      console.error("Error setting tokens:", error);
      this.clearTokens();
    }
  }

  static clearTokens(): void {
    console.log("🗑️ Clearing tokens from storage");
    try {
      localStorage.removeItem(this.TOKEN_STORAGE_KEY);
      delete apiClient.defaults.headers.common["Authorization"];
      console.log("🔓 Cleared Authorization header");
    } catch (error) {
      console.error("Error clearing tokens:", error);
    }
  }

  static isTokenExpired(token: string): boolean {
    try {
      const decoded = jwtDecode<TokenPayload>(token);
      const currentTime = Math.floor(Date.now() / 1000);
      const isExpired = decoded.exp < currentTime;
      console.log("🕒 Token expiration check:", {
        expiresAt: new Date(decoded.exp * 1000).toISOString(),
        isExpired
      });
      return isExpired;
    } catch {
      console.error("Error checking token expiration");
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
    console.log("🔄 Initializing TokenManager");
    const tokens = this.getStoredTokens();
    if (!tokens) {
      console.log("❌ No stored tokens found");
      return;
    }

    if (this.isTokenExpired(tokens.accessToken)) {
      console.log("⚠️ Access token expired");
      if (this.isTokenExpired(tokens.refreshToken)) {
        console.log("⚠️ Refresh token expired, clearing tokens");
        this.clearTokens();
      } else {
        console.log("🔄 Attempting to refresh token");
        try {
          const response = await AuthAPI.refreshToken();
          if (response.data?.tokens) {
            console.log("✅ Token refresh successful");
            this.setTokens(response.data.tokens);
          } else {
            console.error("❌ Token refresh failed: No tokens in response");
            this.clearTokens();
          }
        } catch (error) {
          console.error("❌ Token refresh failed:", error);
          this.clearTokens();
        }
      }
    } else {
      console.log("✅ Access token valid, setting Authorization header");
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

      // Clear any existing tokens before login
      TokenManager.clearTokens();

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
      } else {
        console.error("❌ Login failed: No tokens in response");
        throw {
          success: false,
          error: {
            code: "NO_TOKENS",
            message: "Invalid response from server"
          }
        };
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
      const tokens = TokenManager.getStoredTokens();
      if (tokens?.accessToken) {
        await apiClient.post("/api/auth/logout");
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      TokenManager.clearTokens();
      // Clear any cached user data or state
      console.log("🚪 Logged out successfully");
    }
  }

  static async refreshToken(): Promise<AuthResponse> {
    const tokens = TokenManager.getStoredTokens();
    if (!tokens?.refreshToken) {
      console.error("❌ No refresh token available");
      throw {
        success: false,
        error: {
          code: "INVALID_TOKEN",
          message: "No refresh token available",
        },
      } as AuthResponse;
    }

    try {
      console.log("🔄 Attempting to refresh token");
      const response = await apiClient.post<AuthResponse>("/api/auth/refresh", {
        refreshToken: tokens.refreshToken,
      });

      if (response.data.success && response.data.data?.tokens) {
        console.log("✅ Token refresh successful");
        TokenManager.setTokens(response.data.data.tokens);
      } else {
        console.error("❌ Token refresh failed: Invalid response");
        TokenManager.clearTokens();
      }

      return response.data;
    } catch (error: any) {
      console.error("❌ Token refresh failed:", error);
      TokenManager.clearTokens();
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
      const tokens = TokenManager.getStoredTokens();
      if (!tokens?.accessToken) {
        throw {
          success: false,
          error: {
            code: "NO_TOKEN",
            message: "Not authenticated"
          }
        } as AuthResponse;
      }

      const response = await apiClient.get<AuthResponse>("/api/auth/me");
      return response.data;
    } catch (error: any) {
      console.error("❌ Get current user failed:", error);
      if (error?.response?.status === 401) {
        TokenManager.clearTokens();
      }
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
