"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { STORAGE_KEYS, ROUTES, MESSAGES } from "@/lib/constants";
import { authService } from "@/services/auth.service";
import { safeJsonParse } from "@/lib/utils";
import { setCookie, removeCookie } from "@/lib/cookie";
import type { User, SignupPayload } from "@/types";
import { useToast } from "@/store/toast-context";
import type { AxiosError } from "axios";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: { email: string; password: string }) => Promise<void>;
  signup: (payload: { email: string; password: string; name?: string }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { showToast } = useToast();

  // Hydrate from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem(STORAGE_KEYS.TOKEN);
    const savedUser = localStorage.getItem(STORAGE_KEYS.USER);
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(safeJsonParse<User | null>(savedUser, null));
      // Re-sync cookie in case it was cleared (e.g. browser restart)
      setCookie(STORAGE_KEYS.TOKEN, savedToken);
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(
    async (payload: { email: string; password: string }) => {
      try {
        const res = await authService.login(payload);
        // Backend: { status_code, error, message, result: { jwtToken, user } }
        const { jwtToken: newToken, user: newUser } = res.result!;

        // Persist token in BOTH localStorage (client reads) and cookie (middleware reads)
        localStorage.setItem(STORAGE_KEYS.TOKEN, newToken);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser));
        setCookie(STORAGE_KEYS.TOKEN, newToken); // <-- lets middleware see it

        setToken(newToken);
        setUser(newUser);
        showToast(MESSAGES.AUTH.LOGIN_SUCCESS, "success");
        router.push(ROUTES.HOME);
      } catch (err) {
        const axiosErr = err as AxiosError<{ message?: string }>;
        const message =
          axiosErr.response?.data?.message || MESSAGES.ERROR.GENERIC;
        showToast(message, "error");
        throw err;
      }
    },
    [router, showToast],
  );

  const signup = useCallback(
    async (payload: { email: string; password: string; name?: string }) => {
      try {
        await authService.signup(payload as SignupPayload);
        showToast(MESSAGES.AUTH.SIGNUP_SUCCESS, "success");
        router.push(ROUTES.LOGIN);
      } catch (err) {
        const axiosErr = err as AxiosError<{ message?: string }>;
        const message =
          axiosErr.response?.data?.message || MESSAGES.ERROR.GENERIC;
        showToast(message, "error");
        throw err;
      }
    },
    [router, showToast],
  );

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    removeCookie(STORAGE_KEYS.TOKEN); // <-- clears cookie so middleware blocks again
    setToken(null);
    setUser(null);
    showToast(MESSAGES.AUTH.LOGOUT_SUCCESS, "info");
    router.push(ROUTES.LOGIN);
  }, [router, showToast]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isLoading,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
