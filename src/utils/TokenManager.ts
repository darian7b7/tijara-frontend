import { jwtDecode } from "jwt-decode";
import type { AuthTokens, TokenPayload } from "@/types/auth";

const AUTH_TOKEN_KEY = "auth_tokens";
const TOKEN_CHECK_INTERVAL = 60000; // 1 minute
const TOKEN_REFRESH_THRESHOLD = 300; // 5 minutes in seconds

export class TokenManager {
  private static initialized = false;
  private static checkInterval: NodeJS.Timeout | null = null;

  static getStoredTokens(): AuthTokens | null {
    try {
      const tokens = localStorage.getItem(AUTH_TOKEN_KEY);
      return tokens ? JSON.parse(tokens) : null;
    } catch (error) {
      console.error("Failed to parse stored tokens:", error);
      return null;
    }
  }

  static setTokens(tokens: AuthTokens): void {
    localStorage.setItem(AUTH_TOKEN_KEY, JSON.stringify(tokens));
  }

  static clearTokens(): void {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  }

  static decodeToken(token: string): TokenPayload | null {
    try {
      return jwtDecode<TokenPayload>(token);
    } catch (error) {
      console.error("Failed to decode token:", error);
      return null;
    }
  }

  static isTokenExpired(token: string): boolean {
    const decoded = this.decodeToken(token);
    if (!decoded?.exp) return true;
    
    const now = Math.floor(Date.now() / 1000);
    return decoded.exp <= now;
  }

  static needsRefresh(token: string): boolean {
    const decoded = this.decodeToken(token);
    if (!decoded?.exp) return true;
    
    const now = Math.floor(Date.now() / 1000);
    return decoded.exp - now <= TOKEN_REFRESH_THRESHOLD;
  }

  static initialize(): void {
    if (this.initialized) return;
    
    this.initialized = true;
    
    // Clear any existing interval
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }

    // Start periodic token check
    const interval = setInterval(() => {
      const tokens = this.getStoredTokens();
      if (tokens?.accessToken && this.isTokenExpired(tokens.accessToken)) {
        this.clearTokens();
      }
    }, TOKEN_CHECK_INTERVAL);

    this.checkInterval = interval;
  }

  static cleanup(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    this.initialized = false;
  }
}
