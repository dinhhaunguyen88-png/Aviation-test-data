"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { searchAirports, getAirports } from "@/lib/api";
import { getAirportTypeColor, getAirportTypeLabel, debounce } from "@/lib/utils";
import type { Airport, AirportListResponse } from "@/types/airport";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Airport[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [typeFilter, setTypeFilter] = useState("");
  const [countryFilter, setCountryFilter] = useState("");

  const doSearch = useCallback(
    debounce(async (q: string, type: string, country: string) => {
      setLoading(true);
      try {
        let response: AirportListResponse;
        if (q.trim().length >= 2) {
          response = await searchAirports(q, 50, 0);
        } else {
          response = await getAirports({
            limit: 50,
            offset: 0,
            ...(type && { type }),
            ...(country && { country }),
          });
        }
        setResults(response.data);
        setTotal(response.pagination.total);
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setLoading(false);
      }
    }, 300),
    []
  );

  const handleQueryChange = (value: string) => {
    setQuery(value);
    doSearch(value, typeFilter, countryFilter);
  };

  const handleFilterChange = (type: string, country: string) => {
    setTypeFilter(type);
    setCountryFilter(country);
    doSearch(query, type, country);
  };

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-2xl font-bold">🔍 Search Airports</h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
          Find airports by ICAO, IATA code, name, or city
        </p>
      </div>

      {/* Search Bar */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search by ICAO, IATA, airport name, or city..."
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all"
            style={{
              background: "var(--bg-secondary)",
              border: "1px solid var(--border)",
              color: "var(--text-primary)",
            }}
            onFocus={(e) => (e.target.style.borderColor = "var(--accent-sky)")}
            onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
          />
          {loading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: "var(--accent-sky)" }}>
              ⏳
            </div>
          )}
        </div>
        <select
          value={typeFilter}
          onChange={(e) => handleFilterChange(e.target.value, countryFilter)}
          className="px-3 py-2 rounded-lg text-sm outline-none"
          style={{
            background: "var(--bg-secondary)",
            border: "1px solid var(--border)",
            color: "var(--text-primary)",
          }}
        >
          <option value="">All types</option>
          <option value="large_airport">Large</option>
          <option value="medium_airport">Medium</option>
          <option value="small_airport">Small</option>
          <option value="heliport">Heliport</option>
          <option value="seaplane_base">Seaplane</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      {/* Results count */}
      {total > 0 && (
        <div className="text-xs" style={{ color: "var(--text-muted)" }}>
          Showing {results.length} of {total.toLocaleString()} results
        </div>
      )}

      {/* Results Table */}
      <div className="dashboard-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: "var(--bg-tertiary)" }}>
              <th className="text-left px-4 py-3 font-medium text-xs uppercase" style={{ color: "var(--text-muted)" }}>ICAO</th>
              <th className="text-left px-4 py-3 font-medium text-xs uppercase" style={{ color: "var(--text-muted)" }}>IATA</th>
              <th className="text-left px-4 py-3 font-medium text-xs uppercase" style={{ color: "var(--text-muted)" }}>Name</th>
              <th className="text-left px-4 py-3 font-medium text-xs uppercase" style={{ color: "var(--text-muted)" }}>Type</th>
              <th className="text-left px-4 py-3 font-medium text-xs uppercase" style={{ color: "var(--text-muted)" }}>City</th>
              <th className="text-left px-4 py-3 font-medium text-xs uppercase" style={{ color: "var(--text-muted)" }}>Country</th>
            </tr>
          </thead>
          <tbody>
            {results.map((a) => (
              <tr
                key={a.id}
                className="border-t transition-colors hover:bg-[var(--bg-tertiary)]"
                style={{ borderColor: "var(--border)" }}
              >
                <td className="px-4 py-3">
                  <Link
                    href={`/airport/${a.ident}`}
                    className="font-mono font-medium hover:underline"
                    style={{ color: "var(--accent-sky)" }}
                  >
                    {a.ident}
                  </Link>
                </td>
                <td className="px-4 py-3 font-mono" style={{ color: a.iata_code ? "var(--text-primary)" : "var(--text-muted)" }}>
                  {a.iata_code || "—"}
                </td>
                <td className="px-4 py-3">
                  <Link href={`/airport/${a.ident}`} className="hover:text-[var(--accent-sky)] transition-colors">
                    {a.name}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <span
                    className="inline-block px-2 py-0.5 rounded text-xs font-medium"
                    style={{
                      background: `${getAirportTypeColor(a.type)}20`,
                      color: getAirportTypeColor(a.type),
                    }}
                  >
                    {getAirportTypeLabel(a.type)}
                  </span>
                </td>
                <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>
                  {a.municipality || "—"}
                </td>
                <td className="px-4 py-3 font-mono" style={{ color: "var(--text-secondary)" }}>
                  {a.iso_country || "—"}
                </td>
              </tr>
            ))}
            {results.length === 0 && !loading && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center" style={{ color: "var(--text-muted)" }}>
                  {query ? "No airports found. Try a different search term." : "Type to search, or browse airports using filters."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
