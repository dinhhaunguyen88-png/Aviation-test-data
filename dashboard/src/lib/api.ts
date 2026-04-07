import axios from "axios";
import type {
  AirportListResponse,
  AirportDetail,
  AirportMapResponse,
  RoutesResponse,
  StatsOverview,
  CountryStatsResponse,
  TypeStatsResponse,
  DataFreshnessResponse,
} from "@/types/airport";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

// ─── Airports ───────────────────────────────
export async function getAirports(params: {
  limit?: number;
  offset?: number;
  type?: string;
  country?: string;
  continent?: string;
  scheduled?: string;
}): Promise<AirportListResponse> {
  const { data } = await api.get("/api/airports", { params });
  return data;
}

export async function getAirportDetail(ident: string): Promise<AirportDetail> {
  const { data } = await api.get(`/api/airports/${ident}`);
  return data;
}

export async function getMapAirports(params: {
  north: number;
  south: number;
  east: number;
  west: number;
  types?: string;
  limit?: number;
}): Promise<AirportMapResponse> {
  const { data } = await api.get("/api/airports/map", { params });
  return data;
}

export async function searchAirports(
  q: string,
  params: {
    limit?: number;
    offset?: number;
    type?: string;
    country?: string;
  } = {}
): Promise<AirportListResponse> {
  const { limit = 20, offset = 0, type, country } = params;
  const { data } = await api.get("/api/airports/search", {
    params: {
      q,
      limit,
      offset,
      ...(type && { type }),
      ...(country && { country }),
    },
  });
  return data;
}

// ─── Routes ─────────────────────────────────
export async function getRoutes(airport: string): Promise<RoutesResponse> {
  const { data } = await api.get(`/api/routes/${airport}`);
  return data;
}

// ─── Stats ──────────────────────────────────
export async function getStatsOverview(): Promise<StatsOverview> {
  const { data } = await api.get("/api/stats");
  return data;
}

export async function getStatsByCountry(
  limit = 20
): Promise<CountryStatsResponse> {
  const { data } = await api.get("/api/stats/countries", {
    params: { limit },
  });
  return data;
}

export async function getStatsByType(): Promise<TypeStatsResponse> {
  const { data } = await api.get("/api/stats/types");
  return data;
}

// ─── Data ───────────────────────────────────
export async function getDataFreshness(): Promise<DataFreshnessResponse> {
  const { data } = await api.get("/api/data-freshness");
  return data;
}

export async function checkHealth(): Promise<{ status: string }> {
  const { data } = await api.get("/api/health");
  return data;
}

export default api;
