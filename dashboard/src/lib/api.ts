import axios from "axios";
import type {
  PaginatedResponse,
  Airport,
  AirportDetail,
  MapAirport,
  SearchResult,
  StatsOverview,
  DataFreshness,
  CountryStat,
} from "@/types/airport";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

// ─── Airports ───────────────────────────────
export async function getAirports(params: {
  page?: number;
  limit?: number;
  type?: string;
  country?: string;
  continent?: string;
  scheduled?: string;
  sort?: string;
  order?: string;
}): Promise<PaginatedResponse<Airport>> {
  const { data } = await api.get("/api/airports", { params });
  return data;
}

export async function getAirportDetail(ident: string): Promise<AirportDetail> {
  const { data } = await api.get(`/api/airports/${ident}`);
  return data;
}

export async function getMapAirports(params: {
  bounds: string;
  zoom?: number;
  type?: string;
}): Promise<{ count: number; data: MapAirport[] }> {
  const { data } = await api.get("/api/airports/map", { params });
  return data;
}

export async function searchAirports(
  q: string,
  limit = 10
): Promise<{ results: SearchResult[] }> {
  const { data } = await api.get("/api/airports/search", {
    params: { q, limit },
  });
  return data;
}

// ─── Routes ─────────────────────────────────
export async function getRoutes(airport: string) {
  const { data } = await api.get(`/api/routes/${airport}`);
  return data;
}

// ─── Stats ──────────────────────────────────
export async function getStatsOverview(): Promise<StatsOverview> {
  const { data } = await api.get("/api/stats/overview");
  return data;
}

export async function getStatsByCountry(): Promise<CountryStat[]> {
  const { data } = await api.get("/api/stats/countries");
  return data;
}

export async function getStatsByType(): Promise<Record<string, number>> {
  const { data } = await api.get("/api/stats/types");
  return data;
}

// ─── Health ─────────────────────────────────
export async function getDataFreshness(): Promise<DataFreshness[]> {
  const { data } = await api.get("/api/data-freshness");
  return data;
}

export async function checkHealth(): Promise<{ status: string }> {
  const { data } = await api.get("/api/health");
  return data;
}

export default api;
