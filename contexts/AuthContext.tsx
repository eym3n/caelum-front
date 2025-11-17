"use client";

import React from "react";
import {
  getCurrentUser,
  login as loginRequest,
  refresh as refreshRequest,
  register as registerRequest,
  type AuthTokens,
  type AuthUser,
} from "@/lib/api/auth";
import { useAppDispatch } from "@/store/hooks";
import { clearUser as clearUserAction, setUser as setUserAction } from "@/store/user/userSlice";

const ACCESS_TOKEN_KEY = "caelum.auth.accessToken";
const REFRESH_TOKEN_KEY = "caelum.auth.refreshToken";
const USER_KEY = "caelum.auth.user";

type LoginArgs = {
  email: string;
  password: string;
};

type RegisterArgs = {
  email: string;
  password: string;
  fullName?: string;
};

export interface AuthContextValue {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  initialized: boolean;
  loading: boolean;
  login: (args: LoginArgs) => Promise<void>;
  register: (args: RegisterArgs) => Promise<void>;
  logout: () => void;
  refreshAccessToken: () => Promise<string | null>;
  authorizedFetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
}

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined);

function persistTokens(access: string | null, refresh: string | null) {
  if (typeof window === "undefined") return;
  if (access) {
    window.localStorage.setItem(ACCESS_TOKEN_KEY, access);
  } else {
    window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  }
  if (refresh) {
    window.localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
  } else {
    window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  }
}

function persistUser(user: AuthUser | null) {
  if (typeof window === "undefined") return;
  if (user) {
    window.localStorage.setItem(USER_KEY, JSON.stringify(user));
  } else {
    window.localStorage.removeItem(USER_KEY);
  }
}

function readStoredTokens() {
  if (typeof window === "undefined") return { access: null as string | null, refresh: null as string | null };
  return {
    access: window.localStorage.getItem(ACCESS_TOKEN_KEY),
    refresh: window.localStorage.getItem(REFRESH_TOKEN_KEY),
  };
}

function readStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    window.localStorage.removeItem(USER_KEY);
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const [accessToken, setAccessToken] = React.useState<string | null>(null);
  const [refreshToken, setRefreshToken] = React.useState<string | null>(null);
  const [user, setUser] = React.useState<AuthUser | null>(null);
  const [initialized, setInitialized] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const logout = React.useCallback(() => {
    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
    dispatch(clearUserAction());
    persistTokens(null, null);
    persistUser(null);
  }, [dispatch]);

  const applyTokens = React.useCallback((tokens: AuthTokens) => {
    setAccessToken(tokens.accessToken);
    setRefreshToken(tokens.refreshToken);
    persistTokens(tokens.accessToken, tokens.refreshToken);
  }, []);

  const fetchProfileWith = React.useCallback(
    async (token: string): Promise<AuthUser> => {
      const profile = await getCurrentUser(token);
      setUser(profile);
      dispatch(setUserAction(profile));
      persistUser(profile);
      return profile;
    },
    [dispatch]
  );

  const refreshAccessToken = React.useCallback(async (tokenOverride?: string) => {
    const tokenToUse = tokenOverride ?? refreshToken;
    if (!tokenToUse) return null;
    try {
      const tokens = await refreshRequest(tokenToUse);
      applyTokens(tokens);
      return tokens.accessToken;
    } catch (error) {
      logout();
      throw error;
    }
  }, [applyTokens, logout, refreshToken]);

  const login = React.useCallback(
    async ({ email, password }: LoginArgs) => {
      setLoading(true);
      try {
        const tokens = await loginRequest(email, password);
        applyTokens(tokens);
        await fetchProfileWith(tokens.accessToken);
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    },
    [applyTokens, fetchProfileWith]
  );

  const register = React.useCallback(
    async ({ email, password, fullName }: RegisterArgs) => {
      setLoading(true);
      try {
        const tokens = await registerRequest({
          email,
          password,
          full_name: fullName,
        });
        applyTokens(tokens);
        await fetchProfileWith(tokens.accessToken);
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    },
    [applyTokens, fetchProfileWith]
  );

  const authorizedFetch = React.useCallback(
    async (input: RequestInfo | URL, init?: RequestInit) => {
      const makeRequest = async (token?: string | null) => {
        const headers = new Headers(init?.headers || undefined);
        if (token) {
          headers.set("Authorization", `Bearer ${token}`);
        }
        return fetch(input, { ...(init || {}), headers });
      };

      let tokenToUse = accessToken;
      let response = await makeRequest(tokenToUse);
      if (response.status === 401) {
        const nextToken = await refreshAccessToken();
        if (!nextToken) {
          logout();
          return response;
        }
        response = await makeRequest(nextToken);
        if (response.status === 401) {
          logout();
        }
      }
      return response;
    },
    [accessToken, logout, refreshAccessToken]
  );

  React.useEffect(() => {
    let cancelled = false;
    const initAuth = async () => {
      const { access, refresh } = readStoredTokens();
      const storedUser = readStoredUser();

      if (!access || !refresh) {
        setInitialized(true);
        return;
      }

      setAccessToken(access);
      setRefreshToken(refresh);
      if (storedUser) {
        setUser(storedUser);
      }
      setLoading(true);

      try {
        await fetchProfileWith(access);
      } catch (error) {
        try {
          const newAccess = await refreshAccessToken(refresh);
          if (newAccess) {
            await fetchProfileWith(newAccess);
          }
        } catch (err) {
          if (!cancelled) {
            logout();
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
          setInitialized(true);
        }
      }
    };

    initAuth();
    return () => {
      cancelled = true;
    };
  }, [fetchProfileWith, logout, refreshAccessToken]);

  const value = React.useMemo<AuthContextValue>(
    () => ({
      user,
      accessToken,
      refreshToken,
      initialized,
      loading,
      login,
      register,
      logout,
      refreshAccessToken,
      authorizedFetch,
    }),
    [
      accessToken,
      authorizedFetch,
      initialized,
      loading,
      login,
      logout,
      refreshAccessToken,
      refreshToken,
      register,
      user,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}

