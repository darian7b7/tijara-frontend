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
      localStorage.setItem(this.TOKEN_STORAGE_KEY, JSON.stringify(tokens));
      apiClient.defaults.headers.common["Authorization"] = `Bearer ${tokens.accessToken}`;
    } catch (error) {
      console.error("Error setting tokens:", error);
    }
  }

  static clearTokens(): void {
    try {
      localStorage.removeItem(this.TOKEN_STORAGE_KEY);
      delete apiClient.defaults.headers.common["Authorization"];
    } catch (error) {
      console.error("Error clearing tokens:", error);
    }
  }

  static isTokenExpired(token: string): boolean {
    try {
      const decoded = jwtDecode<TokenPayload>(token);
      const currentTime = Math.floor(Date.now() / 1000);
      return decoded.exp < currentTime;
    } catch (error) {
      console.error("Error checking token expiration:", error);
      return true;
    }
  }

  static shouldRefreshToken(token: string): boolean {
    try {
      const decoded = jwtDecode<TokenPayload>(token);
      const currentTime = Math.floor(Date.now() / 1000);
      return decoded.exp - currentTime < this.TOKEN_REFRESH_THRESHOLD;
    } catch (error) {
      console.error("Error checking token refresh:", error);
      return true;
    }
  }

  static async initialize(): Promise<void> {
    const tokens = this.getStoredTokens();
    if (!tokens) return;

    const { accessToken, refreshToken } = tokens;

    if (this.isTokenExpired(accessToken)) {
      if (this.isTokenExpired(refreshToken)) {
        this.clearTokens();
      } else {
        try {
          await AuthAPI.refreshToken();
        } catch (error) {
          this.clearTokens();
        }
      }
    } else if (this.shouldRefreshToken(accessToken)) {
      try {
        await AuthAPI.refreshToken();
      } catch (error) {
        console.error("Token refresh failed during initialization:", error);
      }
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
      const message = error?.response?.data?.message || error?.response?.data?.error?.message || "Unknown error";
      
      console.error("❌ Login failed:", { status, message });

      // Handle specific error cases
      if (status === 401) {
        throw {
          success: false,
          error: {
            code: "INVALID_CREDENTIALS",
            message: "Invalid email or password"
          }
        };
      }

      if (status === 429) {
        throw {
          success: false,
          error: {
            code: "RATE_LIMITED",
            message: message
          }
        };
      }

      throw {
        success: false,
        error: {
          code: status?.toString() || "UNKNOWN",
          message: message
        }
      };
    }
  }

  static async logout(): Promise<void> {
    try {
      await apiClient.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      TokenManager.clearTokens();
    }
  }

  static async refreshToken(): Promise<AuthResponse> {
    try {
      const tokens = TokenManager.getStoredTokens();
      if (!tokens?.refreshToken) {
        throw new Error("No refresh token available");
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
      throw {
        success: false,
        error: {
          code: "REFRESH_FAILED",
          message: "Failed to refresh token"
        }
      };
    }
  }

  static async getCurrentUser(): Promise<AuthResponse> {
    try {
      const response = await apiClient.get<AuthResponse>("/auth/me");
      return response.data;
    } catch (error: any) {
      console.error("Get current user failed:", error);
      throw {
        success: false,
        error: {
          code: error?.response?.status?.toString() || "UNKNOWN",
          message: error?.response?.data?.message || "Failed to get user info"
        }
      };
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
