import { useCallback, useContext } from "react";
import { AuthContext } from "@/context/AuthContext";

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function useAuthForm() {
  const { login, signup } = useAuth();

  const handleLogin = useCallback(
    async (email: string, password: string) => {
      try {
        await login(email, password);
      } catch (error) {
        console.error("Login failed:", error);
        throw error;
      }
    },
    [login]
  );

  const handleSignup = useCallback(
    async (email: string, password: string, username: string) => {
      try {
        await signup(email, password, username);
      } catch (error) {
        console.error("Signup failed:", error);
        throw error;
      }
    },
    [signup]
  );

  return {
    handleLogin,
    handleSignup,
  };
}
