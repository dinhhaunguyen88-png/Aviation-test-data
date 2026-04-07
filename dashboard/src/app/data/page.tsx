"use client";

import { formatNumber } from "@/lib/utils";
import ErrorBoundary from "@/components/ErrorBoundary";
import { KPISkeletons, TableSkeleton } from "@/components/LoadingSkeleton";
import { useDataFreshness, useHealth } from "@/hooks/useStats";

export default function DataPage() {
  const { data, loading: dLoading } = useDataFreshness();
  const { status: health } = useHealth();

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">📡 Data Sources</h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
          Database status and data source information
        </p>
      </div>

      {/* Health + DB Info */}
      {dLoading ? (
        <KPISkeletons count={3} />
      ) : (
        <div className="grid grid-cols-3 gap-4">
          <div className="glass-card p-5">
            <div className="text-xs mb-2" style={{ color: "var(--text-muted)" }}>API Status</div>
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{
                  background: health === "ok" ? "var(--accent-emerald)" : "var(--accent-rose)",
                  boxShadow: health === "ok"
                    ? "0 0 8px var(--accent-emerald)"
                    : "0 0 8px var(--accent-rose)",
                }}
              />
              <span className="font-semibold">
                {health === "ok" ? "Healthy" : health === "checking" ? "Checking..." : "Error"}
              </span>
            </div>
          </div>
          <div className="glass-card p-5">
            <div className="text-xs mb-2" style={{ color: "var(--text-muted)" }}>Database Size</div>
            <div className="font-semibold text-xl">{data?.database_size_mb.toFixed(1)} MB</div>
          </div>
          <div className="glass-card p-5">
            <div className="text-xs mb-2" style={{ color: "var(--text-muted)" }}>Total Records</div>
            <div className="font-semibold text-xl">{data ? formatNumber(data.total_records) : "—"}</div>
          </div>
        </div>
      )}

      {/* Data Sources Table */}
      <ErrorBoundary>
        {dLoading ? (
          <TableSkeleton rows={8} />
        ) : (
          <div className="dashboard-card overflow-hidden">
            <div className="px-5 py-3 border-b" style={{ borderColor: "var(--border)" }}>
              <h2 className="font-semibold text-sm">Data Sources</h2>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: "var(--bg-tertiary)" }}>
                  <th className="text-left px-4 py-3 text-xs font-medium" style={{ color: "var(--text-muted)" }}>Source</th>
                  <th className="text-left px-4 py-3 text-xs font-medium" style={{ color: "var(--text-muted)" }}>Table</th>
                  <th className="text-left px-4 py-3 text-xs font-medium" style={{ color: "var(--text-muted)" }}>Records</th>
                  <th className="text-left px-4 py-3 text-xs font-medium" style={{ color: "var(--text-muted)" }}>Origin</th>
                </tr>
              </thead>
              <tbody>
                {data?.sources.map((s, i) => (
                  <tr key={i} className="border-t" style={{ borderColor: "var(--border)" }}>
                    <td className="px-4 py-3 font-medium">{s.name}</td>
                    <td className="px-4 py-3 font-mono text-xs" style={{ color: "var(--accent-sky)" }}>
                      {s.table}
                    </td>
                    <td className="px-4 py-3 font-mono">{formatNumber(s.row_count)}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: "var(--text-secondary)" }}>
                      {s.source}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </ErrorBoundary>

      {/* Credits */}
      <div className="dashboard-card p-5">
        <h2 className="font-semibold text-sm mb-3">📄 Attribution</h2>
        <div className="space-y-2 text-sm" style={{ color: "var(--text-secondary)" }}>
          <p>
            <strong style={{ color: "var(--text-primary)" }}>OurAirports</strong> — Airport, runway, navaid, frequency, country, and region data.
            <a href="https://ourairports.com" target="_blank" className="ml-1 hover:underline" style={{ color: "var(--accent-sky)" }}>ourairports.com</a>
          </p>
          <p>
            <strong style={{ color: "var(--text-primary)" }}>OpenFlights</strong> — Airline and route data.
            <a href="https://openflights.org" target="_blank" className="ml-1 hover:underline" style={{ color: "var(--accent-sky)" }}>openflights.org</a>
          </p>
        </div>
      </div>
    </div>
  );
}
