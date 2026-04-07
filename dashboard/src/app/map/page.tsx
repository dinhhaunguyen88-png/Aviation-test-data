"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { getMapAirports } from "@/lib/api";
import { getAirportTypeColor, getAirportTypeLabel } from "@/lib/utils";
import type { MapAirport } from "@/types/airport";
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
const Rectangle = dynamic(
  () => import("react-leaflet").then((m) => m.Rectangle),
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

const MAP_TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';
const MAP_TILE_URL =
  "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";
const SOUTH_CHINA_SEA_MASK_BOUNDS: [[number, number], [number, number]] = [
  [8.5, 109.5],
  [17.5, 119.5],
];
const SOUTH_CHINA_SEA_MASK_COLOR = "#c7d8e5";
const SOUTH_CHINA_SEA_MASK_MAX_ZOOM = 5;

export default function MapPage() {
  const [airports, setAirports] = useState<MapAirport[]>([]);
  const [loading, setLoading] = useState(false);
  const [zoom, setZoom] = useState(3);
  const [selectedTypes, setSelectedTypes] = useState<string[]>(["large_airport", "medium_airport"]);
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

  const getMarkerRadius = (type: string) => {
    switch (type) {
      case "large_airport": return 6;
      case "medium_airport": return 4;
      default: return 3;
    }
  };

  return (
    <div className="h-screen flex flex-col" style={{ height: "100vh" }}>
      {/* Toolbar */}
      <div
        className="flex items-center gap-3 px-4 py-3 border-b flex-shrink-0"
        style={{ borderColor: "var(--border)", background: "var(--bg-secondary)" }}
      >
        <h1 className="font-semibold text-sm mr-2">🗺️ World Map</h1>
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
        <div className="ml-auto flex items-center gap-3">
          {loading && (
            <span className="text-xs" style={{ color: "var(--accent-sky)" }}>
              Loading...
            </span>
          )}
          <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
            {airports.length} markers
          </span>
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
            attribution={MAP_TILE_ATTRIBUTION}
            url={MAP_TILE_URL}
          />
          {zoom <= SOUTH_CHINA_SEA_MASK_MAX_ZOOM && (
            <Rectangle
              bounds={SOUTH_CHINA_SEA_MASK_BOUNDS}
              pathOptions={{
                stroke: false,
                fillColor: SOUTH_CHINA_SEA_MASK_COLOR,
                fillOpacity: 1,
              }}
              interactive={false}
            />
          )}
          <MapEventsHandler onBoundsChange={handleBoundsChange} onZoomChange={setZoom} />
          {airports.map((airport) => (
            <CircleMarker
              key={airport.id}
              center={[airport.latitude_deg, airport.longitude_deg]}
              radius={getMarkerRadius(airport.type)}
              pathOptions={{
                fillColor: getAirportTypeColor(airport.type),
                fillOpacity: 0.8,
                color: getAirportTypeColor(airport.type),
                weight: 1,
                opacity: 0.6,
              }}
            >
              <Popup>
                <div style={{ minWidth: 180 }}>
                  <div className="font-semibold text-sm mb-1">{airport.name}</div>
                  <div className="text-xs space-y-0.5" style={{ color: "var(--text-secondary)" }}>
                    <div>
                      <span className="font-mono font-medium" style={{ color: "var(--accent-sky)" }}>
                        {airport.ident}
                      </span>
                      {airport.iata_code && (
                        <span className="ml-2 font-mono">({airport.iata_code})</span>
                      )}
                    </div>
                    <div>Type: {getAirportTypeLabel(airport.type)}</div>
                    {airport.iso_country && <div>Country: {airport.iso_country}</div>}
                  </div>
                  <Link
                    href={`/airport/${airport.ident}`}
                    className="inline-block mt-2 text-xs font-medium px-3 py-1 rounded"
                    style={{ background: "var(--accent-sky)", color: "#fff" }}
                  >
                    View Details →
                  </Link>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
