import { API_BASE_URL } from "@/lib/config";

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  tokenType?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  full_name?: string;
  is_active: boolean;
  is_superuser: boolean;
  created_at?: string;
  updated_at?: string;
}

type LoginResponse = {
  access_token: string;
  refresh_token: string;
  token_type?: string;
};

type RefreshResponse = {
  access_token: string;
  refresh_token?: string;
  token_type?: string;
};

type RegisterBody = {
  email: string;
  password: string;
  full_name?: string;
};

function buildUrl(path: string) {
  return `${API_BASE_URL}${path}`;
}

function normalizeTokens(data: LoginResponse | RefreshResponse): AuthTokens {
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token ?? "",
    tokenType: data.token_type,
  };
}

export async function login(email: string, password: string): Promise<AuthTokens> {
  const query = new URLSearchParams();
  query.set("email", email);
  query.set("password", password);

  const res = await fetch(buildUrl(`/v1/auth/login?${query.toString()}`), {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: query.toString(),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Login failed with status ${res.status}`);
  }

  const data = (await res.json()) as LoginResponse;
  return normalizeTokens(data);
}

export async function register(body: RegisterBody): Promise<AuthTokens> {
  const res = await fetch(buildUrl("/v1/auth/register"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Registration failed with status ${res.status}`);
  }

  const data = (await res.json()) as LoginResponse;
  return normalizeTokens(data);
}

export async function getCurrentUser(accessToken: string): Promise<AuthUser> {
  const res = await fetch(buildUrl("/v1/auth/me"), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Fetching profile failed with status ${res.status}`);
  }

  return (await res.json()) as AuthUser;
}

export async function refresh(refreshToken: string): Promise<AuthTokens> {
  const res = await fetch(buildUrl("/v1/auth/refresh"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Refresh failed with status ${res.status}`);
  }

  const data = (await res.json()) as RefreshResponse;
  const normalized = normalizeTokens(data);
  if (!normalized.refreshToken) {
    normalized.refreshToken = refreshToken;
  }
  return normalized;
}

