import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom";
import { AuthAPI, TokenManager } from "@/api/auth.api";
import type {
  AuthResponse,
  AuthState,
  AuthContextType,
  AuthError,
} from "@/types/auth";
import { toast } from "react-toastify";

const ACTIVITY_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes

export const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });
  const [initialized, setInitialized] = useState(false);
  const navigate = useNavigate();

  const handleAuthError = useCallback(
    (error: AuthError) => {
      setState((prev) => ({
        ...prev,
        error,
        isAuthenticated: false,
        user: null,
      }));
      toast.error(error.message);

      if (error.code === "INVALID_CREDENTIALS") {
        navigate("/login", { replace: true });
      }
    },
    [navigate],
  );

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  // Initialize auth state
  const initializeAuth = useCallback(async () => {
    try {
      // First initialize TokenManager
      await TokenManager.initialize();

      // Only try to get current user if we have tokens
      const tokens = TokenManager.getStoredTokens();
      if (!tokens) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          isAuthenticated: false,
          user: null,
        }));
        return;
      }

      const response = await AuthAPI.getCurrentUser();
      const userData = response.data?.user;

      if (response.success && userData) {
        setState((prev) => ({
          ...prev,
          user: userData,
          isAuthenticated: true,
          isLoading: false,
        }));
      } else {
        // Clear tokens if user fetch fails
        TokenManager.clearTokens();
        setState((prev) => ({
          ...prev,
          user: null,
          isAuthenticated: false,
          isLoading: false,
        }));
      }
    } catch (error: any) {
      console.error("Failed to initialize auth:", error);
      TokenManager.clearTokens();
      setState((prev) => ({
        ...prev,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      }));
    } finally {
      setInitialized(true);
    }
  }, []);

  // Call initializeAuth when component mounts
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Periodically check token validity
  useEffect(() => {
    const checkTokenValidity = async () => {
      const tokens = TokenManager.getStoredTokens();
      if (!tokens) return;

      if (TokenManager.isTokenExpired(tokens.refreshToken)) {
        TokenManager.clearTokens();
        setState((prev) => ({
          ...prev,
          user: null,
          isAuthenticated: false,
        }));
        navigate("/login", { replace: true });
      } else if (TokenManager.shouldRefreshToken(tokens.accessToken)) {
        try {
          const response = await AuthAPI.refreshToken();
          if (!response.success || !response.data?.tokens) {
            TokenManager.clearTokens();
            setState((prev) => ({
              ...prev,
              user: null,
              isAuthenticated: false,
            }));
            navigate("/login", { replace: true });
          }
        } catch (error) {
          TokenManager.clearTokens();
          setState((prev) => ({
            ...prev,
            user: null,
            isAuthenticated: false,
          }));
          navigate("/login", { replace: true });
        }
      }
    };

    const interval = setInterval(checkTokenValidity, ACTIVITY_CHECK_INTERVAL);
    return () => clearInterval(interval);
  }, [navigate]);

  const login = useCallback(
    async (email: string, password: string): Promise<AuthResponse> => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const response = await AuthAPI.login(email, password);
        const userData = response.data?.user;

        if (response.success && userData) {
          setState((prev) => ({
            ...prev,
            user: userData,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          }));
          navigate("/", { replace: true });
        } else if (response.error) {
          handleAuthError(response.error);
        } else {
          handleAuthError({
            code: "UNKNOWN",
            message: "Login failed. Please try again.",
          });
        }

        return response;
      } catch (error: any) {
        const authError: AuthError = {
          code: "NETWORK_ERROR",
          message: error.message || "Network error occurred during login",
        };
        handleAuthError(authError);
        return {
          success: false,
          error: authError,
        };
      } finally {
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    },
    [navigate, handleAuthError],
  );

  const signup = useCallback(
    async (
      email: string,
      password: string,
      name: string,
    ): Promise<AuthResponse> => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const response = await AuthAPI.signup(email, password, name);
        const userData = response.data?.user;

        if (response.success && userData) {
          setState((prev) => ({
            ...prev,
            user: userData,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          }));
          navigate("/", { replace: true });
        } else if (response.error) {
          handleAuthError(response.error);
        } else {
          handleAuthError({
            code: "UNKNOWN",
            message: "Signup failed. Please try again.",
          });
        }

        return response;
      } catch (error: any) {
        const authError: AuthError = {
          code: "NETWORK_ERROR",
          message: error.message || "Network error occurred during signup",
        };
        handleAuthError(authError);
        return {
          success: false,
          error: authError,
        };
      } finally {
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    },
    [navigate, handleAuthError],
  );

  const logout = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true }));
    try {
      await AuthAPI.logout();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      TokenManager.clearTokens();
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  const value = {
    ...state,
    login,
    signup,
    logout,
    clearError,
  };

  if (!initialized) {
    return <div>Loading...</div>;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
