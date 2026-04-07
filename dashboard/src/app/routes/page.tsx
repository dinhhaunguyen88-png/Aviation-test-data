"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { getRoutes } from "@/lib/api";
import type { RoutesResponse } from "@/types/airport";

function RoutesContent() {
  const searchParams = useSearchParams();
  const initialAirport = searchParams.get("airport") || "";
  const [airportCode, setAirportCode] = useState(initialAirport);
  const [inputValue, setInputValue] = useState(initialAirport);
  const [routes, setRoutes] = useState<RoutesResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"outbound" | "inbound">("outbound");

  const search = async () => {
    if (!inputValue.trim()) return;
    setLoading(true);
    setError("");
    try {
      const data = await getRoutes(inputValue.trim().toUpperCase());
      setRoutes(data);
      setAirportCode(inputValue.trim().toUpperCase());
    } catch {
      setError("Airport not found or no routes available");
      setRoutes(null);
    } finally {
      setLoading(false);
    }
  };

  // Auto-search if URL has airport param
  if (initialAirport && !routes && !loading && !error) {
    search();
  }

  const currentList = tab === "outbound" ? routes?.outbound : routes?.inbound;

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-2xl font-bold">✈️ Route Explorer</h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
          Discover flight routes from any airport
        </p>
      </div>

      {/* Search */}
      <div className="flex gap-3">
        <input
          type="text"
          placeholder="Enter ICAO or IATA code (e.g. HAN, VVNB, LAX)"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && search()}
          className="flex-1 px-4 py-3 rounded-lg text-sm outline-none"
          style={{
            background: "var(--bg-secondary)",
            border: "1px solid var(--border)",
            color: "var(--text-primary)",
          }}
        />
        <button
          onClick={search}
          disabled={loading}
          className="px-6 py-3 rounded-lg text-sm font-medium transition-all"
          style={{
            background: "linear-gradient(135deg, var(--accent-sky), var(--accent-sky-dark))",
            color: "#fff",
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? "⏳" : "Search Routes"}
        </button>
      </div>

      {error && (
        <div className="text-sm py-3 px-4 rounded-lg" style={{ background: "rgba(244,63,94,.1)", color: "var(--accent-rose)" }}>
          {error}
        </div>
      )}

      {routes && (
        <>
          {/* Tabs */}
          <div className="flex items-center gap-1 p-1 rounded-lg" style={{ background: "var(--bg-secondary)" }}>
            <button
              onClick={() => setTab("outbound")}
              className="flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all"
              style={{
                background: tab === "outbound" ? "var(--accent-sky)" : "transparent",
                color: tab === "outbound" ? "#fff" : "var(--text-muted)",
              }}
            >
              🛫 Outbound ({routes.total_outbound})
            </button>
            <button
              onClick={() => setTab("inbound")}
              className="flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all"
              style={{
                background: tab === "inbound" ? "var(--accent-sky)" : "transparent",
                color: tab === "inbound" ? "#fff" : "var(--text-muted)",
              }}
            >
              🛬 Inbound ({routes.total_inbound})
            </button>
          </div>

          {/* Routes Table */}
          <div className="dashboard-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: "var(--bg-tertiary)" }}>
                  <th className="text-left px-4 py-3 text-xs font-medium" style={{ color: "var(--text-muted)" }}>Airline</th>
                  <th className="text-left px-4 py-3 text-xs font-medium" style={{ color: "var(--text-muted)" }}>From</th>
                  <th className="text-left px-4 py-3 text-xs font-medium" style={{ color: "var(--text-muted)" }}>To</th>
                  <th className="text-left px-4 py-3 text-xs font-medium" style={{ color: "var(--text-muted)" }}>Stops</th>
                  <th className="text-left px-4 py-3 text-xs font-medium" style={{ color: "var(--text-muted)" }}>Equipment</th>
                </tr>
              </thead>
              <tbody>
                {currentList?.map((r, i) => (
                  <tr key={`${r.id}-${i}`} className="border-t hover:bg-[var(--bg-tertiary)] transition-colors" style={{ borderColor: "var(--border)" }}>
                    <td className="px-4 py-2.5">
                      <div className="font-medium text-sm">{r.airline_name || "—"}</div>
                      {r.airline_code && (
                        <div className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>{r.airline_code}</div>
                      )}
                    </td>
                    <td className="px-4 py-2.5">
                      <Link
                        href={`/airport/${r.source_airport}`}
                        className="font-mono font-medium hover:underline"
                        style={{ color: "var(--accent-sky)" }}
                      >
                        {r.source_airport}
                      </Link>
                      {r.source_airport_name && (
                        <div className="text-xs truncate max-w-48" style={{ color: "var(--text-muted)" }}>
                          {r.source_airport_name}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-2.5">
                      <Link
                        href={`/airport/${r.dest_airport}`}
                        className="font-mono font-medium hover:underline"
                        style={{ color: "var(--accent-emerald)" }}
                      >
                        {r.dest_airport}
                      </Link>
                      {r.dest_airport_name && (
                        <div className="text-xs truncate max-w-48" style={{ color: "var(--text-muted)" }}>
                          {r.dest_airport_name}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-2.5">
                      <span style={{ color: r.stops === 0 ? "var(--accent-emerald)" : "var(--accent-amber)" }}>
                        {r.stops === 0 ? "Direct" : `${r.stops} stop`}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 font-mono text-xs" style={{ color: "var(--text-secondary)" }}>
                      {r.equipment || "—"}
                    </td>
                  </tr>
                ))}
                {(!currentList || currentList.length === 0) && (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center" style={{ color: "var(--text-muted)" }}>
                      No routes found for {airportCode}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

export default function RoutesPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <RoutesContent />
    </Suspense>
  );
}
