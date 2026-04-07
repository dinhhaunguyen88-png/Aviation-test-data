"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { getMapAirports, getAirportDetail } from "@/lib/api";
import { getAirportTypeColor, getAirportTypeLabel } from "@/lib/utils";
import type { MapAirport, AirportDetail } from "@/types/airport";
import Link from "next/link";

// Dynamically import Leaflet components (no SSR)
import dynamic from "next/dynamic";

const MapContainer = dynamic(
  () => import("react-leaflet").then((m) => m.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((m) => m.TileLayer),
  { ssr: false }
);
const CircleMarker = dynamic(
  () => import("react-leaflet").then((m) => m.CircleMarker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((m) => m.Popup),
  { ssr: false }
);
const Polygon = dynamic(
  () => import("react-leaflet").then((m) => m.Polygon),
  { ssr: false }
);
const Tooltip = dynamic(
  () => import("react-leaflet").then((m) => m.Tooltip),
  { ssr: false }
);
const MapEventsHandler = dynamic(
  () => import("@/components/MapEvents").then((m) => m.default),
  { ssr: false }
);

const TYPE_FILTERS = [
  { value: "large_airport", label: "Large" },
  { value: "medium_airport", label: "Medium" },
  { value: "small_airport", label: "Small" },
  { value: "heliport", label: "Heliport" },
  { value: "seaplane_base", label: "Seaplane" },
];

// Satellite tile layer for better runway visibility
const SATELLITE_TILE_URL =
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
const SATELLITE_TILE_ATTRIBUTION =
  "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community";

const STREET_TILE_URL =
  "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";
const STREET_TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

// ── Runway geometry helpers ──────────────────────────────────────────────────

function toRad(deg: number) {
  return (deg * Math.PI) / 180;
}

function destinationPoint(
  lat: number,
  lng: number,
  bearing: number,
  distanceM: number
): [number, number] {
  const R = 6371000;
  const delta = distanceM / R;
  const theta = toRad(bearing);
  const phi1 = toRad(lat);
  const lambda1 = toRad(lng);

  const phi2 = Math.asin(
    Math.sin(phi1) * Math.cos(delta) +
      Math.cos(phi1) * Math.sin(delta) * Math.cos(theta)
  );
  const lambda2 =
    lambda1 +
    Math.atan2(
      Math.sin(theta) * Math.sin(delta) * Math.cos(phi1),
      Math.cos(delta) - Math.sin(phi1) * Math.sin(phi2)
    );

  return [(phi2 * 180) / Math.PI, ((lambda2 * 180) / Math.PI + 540) % 360 - 180];
}

function buildRunwayPolygon(
  lat: number,
  lng: number,
  heading: number,
  lengthM: number,
  widthM: number
): [number, number][] {
  const perp = (heading + 90) % 360;
  const perpNeg = (heading + 270) % 360;

  const leEnd = destinationPoint(lat, lng, (heading + 180) % 360, lengthM / 2);
  const heEnd = destinationPoint(lat, lng, heading, lengthM / 2);

  const hw = widthM / 2;

  const c1 = destinationPoint(leEnd[0], leEnd[1], perp, hw);
  const c2 = destinationPoint(leEnd[0], leEnd[1], perpNeg, hw);
  const c3 = destinationPoint(heEnd[0], heEnd[1], perpNeg, hw);
  const c4 = destinationPoint(heEnd[0], heEnd[1], perp, hw);

  return [c1, c2, c3, c4];
}

function ftToM(ft: number) {
  return ft * 0.3048;
}

function getSurfaceColor(surface: string | null): string {
  const s = (surface || "").toLowerCase();
  if (s.includes("asph") || s.includes("bit") || s.includes("tarmac")) return "#94a3b8";
  if (s.includes("conc")) return "#cbd5e1";
  if (s.includes("grass") || s.includes("turf") || s.includes("grs")) return "#4ade80";
  if (s.includes("gravel") || s.includes("grvl")) return "#a8a29e";
  if (s.includes("dirt") || s.includes("clay") || s.includes("soil")) return "#c2a06a";
  if (s.includes("sand")) return "#fbbf24";
  if (s.includes("water")) return "#38bdf8";
  return "#e2e8f0";
}

// ── Runway side panel ────────────────────────────────────────────────────────

interface RunwayPanelProps {
  airport: AirportDetail | null;
  loading: boolean;
  onClose: () => void;
}

function RunwayPanel({ airport, loading, onClose }: RunwayPanelProps) {
  if (!airport && !loading) return null;

  return (
    <div
      style={{
        position: "absolute",
        top: 12,
        right: 12,
        zIndex: 1000,
        width: 300,
        background: "var(--bg-secondary)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 14px",
          borderBottom: "1px solid var(--border)",
          background: "var(--bg-tertiary)",
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
          🛬 Runways
        </span>
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            color: "var(--text-muted)",
            cursor: "pointer",
            fontSize: 18,
            lineHeight: 1,
            padding: "0 2px",
          }}
        >
          ×
        </button>
      </div>

      {loading ? (
        <div
          style={{
            padding: 20,
            textAlign: "center",
            color: "var(--text-muted)",
            fontSize: 13,
          }}
        >
          Loading runway data…
        </div>
      ) : airport ? (
        <div style={{ maxHeight: 440, overflowY: "auto" }}>
          <div
            style={{
              padding: "10px 14px 6px",
              borderBottom: "1px solid var(--border)",
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--accent-sky)" }}>
              {airport.ident}
              {airport.iata_code && (
                <span style={{ color: "var(--accent-emerald)", marginLeft: 8 }}>
                  ({airport.iata_code})
                </span>
              )}
            </div>
            <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 2 }}>
              {airport.name}
            </div>
          </div>

          {airport.runways.length === 0 ? (
            <div style={{ padding: "16px 14px", fontSize: 12, color: "var(--text-muted)" }}>
              No runway data available.
            </div>
          ) : (
            <div>
              {airport.runways.map((rwy) => (
                <div
                  key={rwy.id}
                  style={{
                    padding: "10px 14px",
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <span
                      style={{
                        fontFamily: "monospace",
                        fontWeight: 700,
                        fontSize: 13,
                        color: "#fff",
                        background: rwy.closed ? "#f43f5e22" : "#38bdf822",
                        border: `1px solid ${rwy.closed ? "#f43f5e" : "#38bdf8"}`,
                        borderRadius: 6,
                        padding: "1px 8px",
                      }}
                    >
                      {rwy.le_ident || "?"}/{rwy.he_ident || "?"}
                    </span>
                    {rwy.closed ? (
                      <span style={{ fontSize: 10, color: "#f43f5e" }}>CLOSED</span>
                    ) : (
                      <span style={{ fontSize: 10, color: "#10b981" }}>OPEN</span>
                    )}
                    {rwy.lighted ? <span style={{ fontSize: 10 }}>💡</span> : null}
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                    <div
                      style={{
                        width: 14,
                        height: 8,
                        borderRadius: 3,
                        background: getSurfaceColor(rwy.surface),
                        border: "1px solid rgba(255,255,255,0.15)",
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>
                      {rwy.surface || "Unknown surface"}
                    </span>
                  </div>

                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--text-muted)",
                      display: "flex",
                      gap: 12,
                    }}
                  >
                    <span>
                      📏{" "}
                      {rwy.length_ft
                        ? `${rwy.length_ft.toLocaleString()} ft`
                        : "N/A"}
                    </span>
                    <span>↔ {rwy.width_ft ? `${rwy.width_ft} ft` : "N/A"}</span>
                  </div>

                  {(rwy.le_heading_degT !== null || rwy.he_heading_degT !== null) && (
                    <div
                      style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 3 }}
                    >
                      🧭{" "}
                      {rwy.le_heading_degT !== null
                        ? `${rwy.le_heading_degT.toFixed(0)}°`
                        : "—"}
                      {" / "}
                      {rwy.he_heading_degT !== null
                        ? `${rwy.he_heading_degT.toFixed(0)}°`
                        : "—"}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div style={{ padding: "8px 14px" }}>
            <Link
              href={`/airport/${airport.ident}`}
              style={{
                display: "block",
                textAlign: "center",
                fontSize: 12,
                fontWeight: 600,
                padding: "6px",
                borderRadius: 8,
                background: "var(--accent-sky)",
                color: "#fff",
                textDecoration: "none",
              }}
            >
              View Full Details →
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}

// ── Runway polygon overlay (inside MapContainer) ─────────────────────────────

interface RunwayOverlayProps {
  airport: AirportDetail;
  zoom: number;
}

function RunwayOverlayInner({ airport, zoom }: RunwayOverlayProps) {
  if (zoom < 12) return null;
  if (!airport.latitude_deg || !airport.longitude_deg) return null;

  const lat = airport.latitude_deg;
  const lng = airport.longitude_deg;

  return (
    <>
      {airport.runways.map((rwy) => {
        if (!rwy.length_ft) return null;

        const heading = rwy.le_heading_degT ?? rwy.he_heading_degT ?? 0;
        const lengthM = ftToM(rwy.length_ft);
        const widthM = rwy.width_ft
          ? ftToM(rwy.width_ft)
          : Math.max(lengthM * 0.02, 20);

        const corners = buildRunwayPolygon(lat, lng, heading, lengthM, widthM);
        const surfaceColor = getSurfaceColor(rwy.surface);
        const isClosed = !!rwy.closed;

        return (
          <Polygon
            key={rwy.id}
            positions={corners}
            pathOptions={{
              fillColor: isClosed ? "#f43f5e" : surfaceColor,
              fillOpacity: isClosed ? 0.4 : 0.75,
              color: isClosed ? "#f43f5e" : "#ffffff",
              weight: zoom >= 15 ? 1.5 : 0.8,
              opacity: 0.9,
              dashArray: isClosed ? "4 4" : undefined,
            }}
          >
            <Tooltip sticky>
              <div style={{ fontSize: 11, fontFamily: "monospace", lineHeight: 1.6 }}>
                <strong>
                  {rwy.le_ident}/{rwy.he_ident}
                </strong>
                <br />
                {rwy.length_ft?.toLocaleString()} ft × {rwy.width_ft} ft
                <br />
                {rwy.surface || "Unknown surface"}
                {isClosed ? " — CLOSED" : ""}
              </div>
            </Tooltip>
          </Polygon>
        );
      })}
    </>
  );
}

const RunwayOverlay = dynamic(() => Promise.resolve(RunwayOverlayInner), {
  ssr: false,
});

// ── Main page component ───────────────────────────────────────────────────────

export default function MapPage() {
  const [airports, setAirports] = useState<MapAirport[]>([]);
  const [loading, setLoading] = useState(false);
  const [zoom, setZoom] = useState(3);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([
    "large_airport",
    "medium_airport",
  ]);
  const [selectedAirport, setSelectedAirport] = useState<AirportDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [tileMode, setTileMode] = useState<"street" | "satellite">("street");
  const boundsRef = useRef({ north: 85, south: -85, east: 180, west: -180 });

  const loadMarkers = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getMapAirports({
        ...boundsRef.current,
        types: selectedTypes.join(","),
        limit: 1000,
      });
      setAirports(result.data);
    } catch (err) {
      console.error("Failed to load map airports:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedTypes]);

  useEffect(() => {
    loadMarkers();
  }, [loadMarkers]);

  const handleBoundsChange = useCallback(
    (bounds: { north: number; south: number; east: number; west: number }) => {
      boundsRef.current = bounds;
      loadMarkers();
    },
    [loadMarkers]
  );

  const toggleType = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleAirportClick = useCallback(async (airport: MapAirport) => {
    setDetailLoading(true);
    setSelectedAirport(null);
    try {
      const detail = await getAirportDetail(airport.ident);
      setSelectedAirport(detail);
    } catch (err) {
      console.error("Failed to load airport detail:", err);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const getMarkerRadius = (type: string) => {
    switch (type) {
      case "large_airport":
        return 6;
      case "medium_airport":
        return 4;
      default:
        return 3;
    }
  };

  const showRunways = zoom >= 12 && selectedAirport !== null;
  const tileUrl = tileMode === "satellite" ? SATELLITE_TILE_URL : STREET_TILE_URL;
  const tileAttribution =
    tileMode === "satellite" ? SATELLITE_TILE_ATTRIBUTION : STREET_TILE_ATTRIBUTION;

  return (
    <div className="h-screen flex flex-col" style={{ height: "100vh" }}>
      {/* Toolbar */}
      <div
        className="flex items-center gap-3 px-4 py-3 border-b flex-shrink-0 flex-wrap"
        style={{ borderColor: "var(--border)", background: "var(--bg-secondary)" }}
      >
        <h1 className="font-semibold text-sm mr-2">🗺️ World Map</h1>

        {/* Type filters */}
        <div className="flex items-center gap-1.5">
          {TYPE_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => toggleType(f.value)}
              className="px-2.5 py-1 rounded-md text-xs font-medium transition-all"
              style={{
                background: selectedTypes.includes(f.value)
                  ? getAirportTypeColor(f.value)
                  : "var(--bg-tertiary)",
                color: selectedTypes.includes(f.value) ? "#fff" : "var(--text-muted)",
                opacity: selectedTypes.includes(f.value) ? 1 : 0.6,
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Tile mode toggle */}
        <div
          style={{
            marginLeft: "auto",
            display: "flex",
            alignItems: "center",
            gap: 4,
            background: "var(--bg-tertiary)",
            borderRadius: 8,
            padding: "2px",
          }}
        >
          {(["street", "satellite"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setTileMode(mode)}
              style={{
                padding: "3px 10px",
                borderRadius: 6,
                fontSize: 11,
                fontWeight: 600,
                border: "none",
                cursor: "pointer",
                background: tileMode === mode ? "var(--accent-sky)" : "transparent",
                color: tileMode === mode ? "#fff" : "var(--text-muted)",
                transition: "all 0.15s",
              }}
            >
              {mode === "street" ? "🗺 Street" : "🛰 Satellite"}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {loading && (
            <span className="text-xs" style={{ color: "var(--accent-sky)" }}>
              Loading…
            </span>
          )}
          <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
            {airports.length} markers
          </span>
          {showRunways && (
            <span
              className="text-xs font-mono"
              style={{ color: "var(--accent-amber)" }}
            >
              🛬 {selectedAirport!.runways.length} runways shown
            </span>
          )}
          {zoom < 12 && selectedAirport && (
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
              Zoom in to see runway shapes
            </span>
          )}
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <MapContainer
          center={[20, 0]}
          zoom={3}
          className="w-full h-full"
          style={{ background: "var(--bg-primary)" }}
          zoomControl={true}
          minZoom={2}
          maxZoom={18}
        >
          <TileLayer
            key={tileMode}
            attribution={tileAttribution}
            url={tileUrl}
          />

          <MapEventsHandler
            onBoundsChange={handleBoundsChange}
            onZoomChange={setZoom}
          />

          {/* Runway shapes for selected airport */}
          {selectedAirport && (
            <RunwayOverlay airport={selectedAirport} zoom={zoom} />
          )}

          {/* Airport markers */}
          {airports.map((airport) => {
            const isSelected = selectedAirport?.ident === airport.ident;
            return (
              <CircleMarker
                key={airport.id}
                center={[airport.latitude_deg, airport.longitude_deg]}
                radius={
                  isSelected
                    ? getMarkerRadius(airport.type) + 3
                    : getMarkerRadius(airport.type)
                }
                pathOptions={{
                  fillColor: getAirportTypeColor(airport.type),
                  fillOpacity: isSelected ? 1 : 0.8,
                  color: isSelected ? "#ffffff" : getAirportTypeColor(airport.type),
                  weight: isSelected ? 2 : 1,
                  opacity: isSelected ? 1 : 0.6,
                }}
                eventHandlers={{
                  click: () => handleAirportClick(airport),
                }}
              >
                <Popup>
                  <div style={{ minWidth: 180 }}>
                    <div className="font-semibold text-sm mb-1">{airport.name}</div>
                    <div
                      className="text-xs space-y-0.5"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      <div>
                        <span
                          className="font-mono font-medium"
                          style={{ color: "var(--accent-sky)" }}
                        >
                          {airport.ident}
                        </span>
                        {airport.iata_code && (
                          <span className="ml-2 font-mono">
                            ({airport.iata_code})
                          </span>
                        )}
                      </div>
                      <div>Type: {getAirportTypeLabel(airport.type)}</div>
                      {airport.iso_country && (
                        <div>Country: {airport.iso_country}</div>
                      )}
                    </div>
                    <button
                      onClick={() => handleAirportClick(airport)}
                      style={{
                        marginTop: 8,
                        display: "block",
                        width: "100%",
                        padding: "5px 0",
                        background: "#38bdf8",
                        color: "#fff",
                        border: "none",
                        borderRadius: 6,
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      🛬 Show Runways
                    </button>
                    <Link
                      href={`/airport/${airport.ident}`}
                      className="inline-block mt-1 text-xs font-medium px-3 py-1 rounded w-full text-center"
                      style={{
                        background: "var(--bg-tertiary)",
                        color: "var(--accent-sky)",
                        display: "block",
                      }}
                    >
                      View Details →
                    </Link>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>

        {/* Floating runway panel */}
        {(detailLoading || selectedAirport) && (
          <RunwayPanel
            airport={selectedAirport}
            loading={detailLoading}
            onClose={() => setSelectedAirport(null)}
          />
        )}

        {/* Surface legend */}
        <div
          style={{
            position: "absolute",
            bottom: 28,
            left: 12,
            zIndex: 1000,
            background: "var(--bg-secondary)",
            border: "1px solid var(--border)",
            borderRadius: 10,
            padding: "8px 12px",
            fontSize: 11,
            color: "var(--text-muted)",
          }}
        >
          <div
            style={{
              fontWeight: 700,
              marginBottom: 6,
              color: "var(--text-secondary)",
            }}
          >
            🛬 Runway surfaces
          </div>
          {[
            { color: "#94a3b8", label: "Asphalt / Bitumen" },
            { color: "#cbd5e1", label: "Concrete" },
            { color: "#4ade80", label: "Grass / Turf" },
            { color: "#a8a29e", label: "Gravel" },
            { color: "#c2a06a", label: "Dirt / Clay" },
            { color: "#fbbf24", label: "Sand" },
            { color: "#38bdf8", label: "Water" },
            { color: "#f43f5e", label: "Closed runway" },
          ].map(({ color, label }) => (
            <div
              key={label}
              style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 3 }}
            >
              <div
                style={{
                  width: 16,
                  height: 8,
                  borderRadius: 2,
                  background: color,
                  border: "1px solid rgba(255,255,255,0.1)",
                  flexShrink: 0,
                }}
              />
              <span>{label}</span>
            </div>
          ))}
          <div
            style={{
              marginTop: 6,
              color: "var(--text-muted)",
              fontStyle: "italic",
              fontSize: 10,
            }}
          >
            Zoom ≥ 12 to render runway shapes
          </div>
        </div>
      </div>
    </div>
  );
}
