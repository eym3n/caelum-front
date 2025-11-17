"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { API_BASE_URL } from "@/lib/config";
import { useAuth } from "@/contexts/AuthContext";
import type { LandingPagesResponse, LandingPageRecord, LandingPageStatus } from "@/lib/types/landing-page";

interface UseLandingPagesOptions {
  page?: number;
  pageSize?: number;
  statusFilter?: LandingPageStatus;
}

interface UseLandingPagesReturn {
  data: LandingPagesResponse | null;
  items: LandingPageRecord[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

function buildQuery({ page, pageSize, statusFilter }: UseLandingPagesOptions = {}) {
  const params = new URLSearchParams();
  if (page && page > 0) params.set("page", page.toString());
  if (pageSize && pageSize > 0) params.set("page_size", pageSize.toString());
  if (statusFilter) params.set("status_filter", statusFilter);
  return params.toString();
}

export function useLandingPages(options?: UseLandingPagesOptions): UseLandingPagesReturn {
  const { authorizedFetch, initialized } = useAuth();
  const queryString = React.useMemo(
    () => buildQuery(options),
    [options?.page, options?.pageSize, options?.statusFilter]
  );

  const query = useQuery({
    queryKey: ["landing-pages", queryString],
    enabled: initialized,
    queryFn: async (): Promise<LandingPagesResponse> => {
      const url = `${API_BASE_URL}/v1/landing-pages/${queryString ? `?${queryString}` : ""}`;
      const res = await authorizedFetch(url, { method: "GET" });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Request failed with status ${res.status}`);
      }
      return (await res.json()) as LandingPagesResponse;
    },
  });

  return {
    data: (query.data as LandingPagesResponse) ?? null,
    items: (query.data?.items as LandingPageRecord[]) ?? [],
    loading: query.isLoading,
    error: query.error ? (query.error as Error).message : null,
    refresh: async () => {
      await query.refetch();
    },
  };
}

