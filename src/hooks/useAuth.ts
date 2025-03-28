import { useCallback } from "react";
import { useAuth } from "@/context/AuthContext";

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
