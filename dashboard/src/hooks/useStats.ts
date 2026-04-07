"use client";

import useSWR from "swr";
import {
  getStatsOverview,
  getStatsByCountry,
  getStatsByType,
  getDataFreshness,
  checkHealth,
} from "@/lib/api";

const SWR_OPTIONS = {
  revalidateOnFocus: false,
  dedupingInterval: 300000, // 5 min dedup
};

export function useStats() {
  const { data, error, isLoading } = useSWR(
    "stats-overview",
    getStatsOverview,
    { ...SWR_OPTIONS, revalidateIfStale: false }
  );
  return { stats: data ?? null, error, loading: isLoading };
}

export function useCountryStats(limit = 20) {
  const { data, error, isLoading } = useSWR(
    `stats-countries-${limit}`,
    () => getStatsByCountry(limit),
    SWR_OPTIONS
  );
  return { countries: data?.data ?? [], total: data?.total_countries ?? 0, error, loading: isLoading };
}

export function useTypeStats() {
  const { data, error, isLoading } = useSWR(
    "stats-types",
    getStatsByType,
    SWR_OPTIONS
  );
  return { types: data?.data ?? [], error, loading: isLoading };
}

export function useDataFreshness() {
  const { data, error, isLoading } = useSWR(
    "data-freshness",
    getDataFreshness,
    SWR_OPTIONS
  );
  return { data: data ?? null, error, loading: isLoading };
}

export function useHealth() {
  const { data, error, isLoading } = useSWR(
    "health",
    checkHealth,
    { revalidateOnFocus: false, refreshInterval: 30000 }
  );
  return { status: data?.status ?? "checking", error, loading: isLoading };
}
