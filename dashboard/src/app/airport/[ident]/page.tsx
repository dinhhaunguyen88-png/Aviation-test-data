"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import {
  getAirportTypeColor,
  getAirportTypeLabel,
  formatNumber,
  formatElevation,
  formatRunwayLength,
} from "@/lib/utils";
import { KPISkeletons, TableSkeleton } from "@/components/LoadingSkeleton";
import { useAirportDetail } from "@/hooks/useAirports";

export default function AirportDetailPage() {
  const params = useParams();
  const ident = params.ident as string;
  const { airport, error, loading } = useAirportDetail(ident);

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <KPISkeletons count={4} />
        <TableSkeleton rows={3} />
      </div>
    );
  }

  if (error || !airport) {
    return (
      <div className="p-6 text-center py-20">
        <div className="text-4xl mb-4">❌</div>
        <h2 className="text-xl font-bold mb-2">Airport Not Found</h2>
        <p style={{ color: "var(--text-muted)" }}>
          No airport found with identifier &quot;{ident}&quot;
        </p>
        <Link href="/search" className="inline-block mt-4 text-sm" style={{ color: "var(--accent-sky)" }}>
          ← Back to Search
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs" style={{ color: "var(--text-muted)" }}>
        <Link href="/search" className="hover:text-[var(--accent-sky)]">Airports</Link>
        <span>/</span>
        <span>{airport.ident}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold">{airport.name}</h1>
            <span
              className="px-2.5 py-1 rounded text-xs font-medium"
              style={{
                background: `${getAirportTypeColor(airport.type)}20`,
                color: getAirportTypeColor(airport.type),
              }}
            >
              {getAirportTypeLabel(airport.type)}
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm" style={{ color: "var(--text-secondary)" }}>
            <span className="font-mono font-medium" style={{ color: "var(--accent-sky)" }}>
              ICAO: {airport.ident}
            </span>
            {airport.iata_code && (
              <span className="font-mono font-medium" style={{ color: "var(--accent-emerald)" }}>
                IATA: {airport.iata_code}
              </span>
            )}
            {airport.municipality && <span>📍 {airport.municipality}, {airport.iso_country}</span>}
          </div>
        </div>
        <Link
          href={`/routes?airport=${airport.iata_code || airport.ident}`}
          className="px-4 py-2 rounded-lg text-sm font-medium"
          style={{ background: "var(--bg-tertiary)", color: "var(--accent-sky)" }}
        >
          ✈️ View Routes
        </Link>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Elevation", value: formatElevation(airport.elevation_ft), icon: "⛰️" },
          { label: "Latitude", value: airport.latitude_deg?.toFixed(4) || "N/A", icon: "📐" },
          { label: "Longitude", value: airport.longitude_deg?.toFixed(4) || "N/A", icon: "📐" },
          { label: "Scheduled", value: airport.scheduled_service === "yes" ? "✅ Yes" : "❌ No", icon: "🗓️" },
          { label: "Continent", value: airport.continent || "N/A", icon: "🌍" },
          { label: "Region", value: airport.iso_region || "N/A", icon: "🏙️" },
          { label: "GPS Code", value: airport.gps_code || "N/A", icon: "📡" },
          { label: "Runways", value: String(airport.runways.length), icon: "🛬" },
        ].map((info) => (
          <div key={info.label} className="dashboard-card p-3.5">
            <div className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>
              {info.icon} {info.label}
            </div>
            <div className="font-medium text-sm">{info.value}</div>
          </div>
        ))}
      </div>

      {/* Runways Table */}
      {airport.runways.length > 0 && (
        <div className="dashboard-card overflow-hidden">
          <div className="px-5 py-3 border-b" style={{ borderColor: "var(--border)" }}>
            <h2 className="font-semibold text-sm">🛬 Runways ({airport.runways.length})</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: "var(--bg-tertiary)" }}>
                <th className="text-left px-4 py-2 text-xs font-medium" style={{ color: "var(--text-muted)" }}>Designator</th>
                <th className="text-left px-4 py-2 text-xs font-medium" style={{ color: "var(--text-muted)" }}>Length</th>
                <th className="text-left px-4 py-2 text-xs font-medium" style={{ color: "var(--text-muted)" }}>Width</th>
                <th className="text-left px-4 py-2 text-xs font-medium" style={{ color: "var(--text-muted)" }}>Surface</th>
                <th className="text-left px-4 py-2 text-xs font-medium" style={{ color: "var(--text-muted)" }}>Lighted</th>
                <th className="text-left px-4 py-2 text-xs font-medium" style={{ color: "var(--text-muted)" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {airport.runways.map((rwy) => (
                <tr key={rwy.id} className="border-t" style={{ borderColor: "var(--border)" }}>
                  <td className="px-4 py-2.5 font-mono font-medium" style={{ color: "var(--accent-sky)" }}>
                    {rwy.le_ident || "?"}/{rwy.he_ident || "?"}
                  </td>
                  <td className="px-4 py-2.5">{formatRunwayLength(rwy.length_ft)}</td>
                  <td className="px-4 py-2.5">{rwy.width_ft ? `${formatNumber(rwy.width_ft)} ft` : "N/A"}</td>
                  <td className="px-4 py-2.5">{rwy.surface || "Unknown"}</td>
                  <td className="px-4 py-2.5">{rwy.lighted ? "💡 Yes" : "No"}</td>
                  <td className="px-4 py-2.5">
                    <span style={{ color: rwy.closed ? "var(--accent-rose)" : "var(--accent-emerald)" }}>
                      {rwy.closed ? "Closed" : "Open"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Frequencies Table */}
      {airport.frequencies.length > 0 && (
        <div className="dashboard-card overflow-hidden">
          <div className="px-5 py-3 border-b" style={{ borderColor: "var(--border)" }}>
            <h2 className="font-semibold text-sm">📻 Frequencies ({airport.frequencies.length})</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: "var(--bg-tertiary)" }}>
                <th className="text-left px-4 py-2 text-xs font-medium" style={{ color: "var(--text-muted)" }}>Type</th>
                <th className="text-left px-4 py-2 text-xs font-medium" style={{ color: "var(--text-muted)" }}>Description</th>
                <th className="text-left px-4 py-2 text-xs font-medium" style={{ color: "var(--text-muted)" }}>Frequency (MHz)</th>
              </tr>
            </thead>
            <tbody>
              {airport.frequencies.map((freq) => (
                <tr key={freq.id} className="border-t" style={{ borderColor: "var(--border)" }}>
                  <td className="px-4 py-2.5 font-medium" style={{ color: "var(--accent-amber)" }}>
                    {freq.type}
                  </td>
                  <td className="px-4 py-2.5" style={{ color: "var(--text-secondary)" }}>
                    {freq.description || "—"}
                  </td>
                  <td className="px-4 py-2.5 font-mono font-medium">
                    {freq.frequency_mhz}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Wikipedia link */}
      {airport.wikipedia_link && (
        <a
          href={airport.wikipedia_link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm hover:underline"
          style={{ color: "var(--accent-sky)" }}
        >
          📖 Wikipedia Article →
        </a>
      )}
    </div>
  );
}
