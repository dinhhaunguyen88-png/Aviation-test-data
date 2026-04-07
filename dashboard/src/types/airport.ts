/* ============================================
   Aviation Dashboard - TypeScript Types
   Aligned with Backend API response schemas
   ============================================ */

// ─── Airport ────────────────────────────────
export interface Airport {
  id: number;
  ident: string;
  type: AirportType;
  name: string;
  latitude_deg: number | null;
  longitude_deg: number | null;
  elevation_ft: number | null;
  continent: string | null;
  iso_country: string | null;
  iso_region: string | null;
  municipality: string | null;
  scheduled_service: string | null;
  iata_code: string | null;
}

export type AirportType =
  | "large_airport"
  | "medium_airport"
  | "small_airport"
  | "heliport"
  | "seaplane_base"
  | "closed"
  | "balloonport";

// ─── Airport Detail (includes runways + frequencies) ──
export interface AirportDetail extends Airport {
  gps_code: string | null;
  local_code: string | null;
  home_link: string | null;
  wikipedia_link: string | null;
  keywords: string | null;
  runways: Runway[];
  frequencies: Frequency[];
}

// ─── Runway ─────────────────────────────────
export interface Runway {
  id: number;
  length_ft: number | null;
  width_ft: number | null;
  surface: string | null;
  lighted: number | null;
  closed: number | null;
  le_ident: string | null;
  he_ident: string | null;
  le_heading_degT: number | null;
  he_heading_degT: number | null;
}

// ─── Frequency ──────────────────────────────
export interface Frequency {
  id: number;
  type: string | null;
  description: string | null;
  frequency_mhz: number | null;
}

// ─── Map Marker ─────────────────────────────
export interface MapAirport {
  id: number;
  ident: string;
  type: AirportType;
  name: string;
  latitude_deg: number;
  longitude_deg: number;
  iata_code: string | null;
  iso_country: string | null;
}

// ─── Route ──────────────────────────────────
export interface RouteDetail {
  id: number;
  airline_code: string | null;
  airline_name: string | null;
  source_airport: string | null;
  source_airport_name: string | null;
  dest_airport: string | null;
  dest_airport_name: string | null;
  stops: number | null;
  equipment: string | null;
}

export interface RoutesResponse {
  outbound: RouteDetail[];
  inbound: RouteDetail[];
  total_outbound: number;
  total_inbound: number;
}

// ─── API Response Wrappers ──────────────────
export interface PaginationMeta {
  total: number;
  limit: number;
  offset: number;
  has_more: boolean;
}

export interface AirportListResponse {
  data: Airport[];
  pagination: PaginationMeta;
}

export interface AirportMapResponse {
  data: MapAirport[];
  count: number;
}

// ─── Stats ──────────────────────────────────
export interface StatsOverview {
  total_airports: number;
  total_runways: number;
  total_airlines: number;
  total_routes: number;
  total_countries: number;
  total_navaids: number;
  airports_with_scheduled_service: number;
  top_country: string | null;
  top_country_count: number;
}

export interface CountryStat {
  country_code: string;
  country_name: string | null;
  airport_count: number;
}

export interface CountryStatsResponse {
  data: CountryStat[];
  total_countries: number;
}

export interface TypeStat {
  type: string;
  count: number;
  percentage: number;
}

export interface TypeStatsResponse {
  data: TypeStat[];
}

// ─── Data Freshness ─────────────────────────
export interface DataSourceInfo {
  name: string;
  table: string;
  row_count: number;
  source: string;
}

export interface DataFreshnessResponse {
  database_path: string;
  database_size_mb: number;
  total_records: number;
  sources: DataSourceInfo[];
}
