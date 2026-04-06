/* ============================================
   Aviation Dashboard - TypeScript Types
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
  gps_code: string | null;
  iata_code: string | null;
  local_code: string | null;
  home_link: string | null;
  wikipedia_link: string | null;
  keywords: string | null;
}

export type AirportType =
  | "large_airport"
  | "medium_airport"
  | "small_airport"
  | "heliport"
  | "seaplane_base"
  | "closed"
  | "balloonport";

// ─── Runway ─────────────────────────────────
export interface Runway {
  id: number;
  airport_ref: number;
  airport_ident: string;
  length_ft: number | null;
  width_ft: number | null;
  surface: string | null;
  lighted: number;
  closed: number;
  le_ident: string | null;
  he_ident: string | null;
  le_latitude_deg: number | null;
  le_longitude_deg: number | null;
  le_elevation_ft: number | null;
  le_heading_degT: number | null;
  he_latitude_deg: number | null;
  he_longitude_deg: number | null;
  he_elevation_ft: number | null;
  he_heading_degT: number | null;
}

// ─── Frequency ──────────────────────────────
export interface Frequency {
  id: number;
  airport_ref: number;
  airport_ident: string;
  type: string;
  description: string | null;
  frequency_mhz: number;
}

// ─── Country ────────────────────────────────
export interface Country {
  id: number;
  code: string;
  name: string;
  continent: string | null;
  wikipedia_link: string | null;
}

// ─── Route ──────────────────────────────────
export interface Route {
  id: number;
  airline: string | null;
  airline_id: number | null;
  source_airport: string;
  source_airport_id: number | null;
  dest_airport: string;
  dest_airport_id: number | null;
  codeshare: string | null;
  stops: number;
  equipment: string | null;
}

// ─── Airline ────────────────────────────────
export interface Airline {
  airline_id: number;
  name: string | null;
  alias: string | null;
  iata: string | null;
  icao: string | null;
  callsign: string | null;
  country: string | null;
  active: string | null;
}

// ─── API Response Types ─────────────────────
export interface PaginatedResponse<T> {
  total: number;
  page: number;
  limit: number;
  data: T[];
}

export interface AirportDetail {
  airport: Airport;
  runways: Runway[];
  frequencies: Frequency[];
  country: Country | null;
}

export interface MapAirport {
  id: number;
  ident: string;
  name: string;
  type: AirportType;
  lat: number;
  lng: number;
  iata: string | null;
}

export interface SearchResult {
  ident: string;
  name: string;
  iata_code: string | null;
  municipality: string | null;
  iso_country: string | null;
  type: AirportType;
}

export interface StatsOverview {
  total_airports: number;
  total_countries: number;
  total_runways: number;
  total_routes: number;
  total_airlines: number;
  airports_by_type: Record<string, number>;
  top_countries: { code: string; name: string; count: number }[];
}

export interface CountryStat {
  code: string;
  name: string;
  count: number;
}

export interface DataFreshness {
  source: string;
  last_modified: string;
  row_count: number;
}
