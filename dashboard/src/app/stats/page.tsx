"use client";

import {
  BarChart, Bar, PieChart, Pie, Cell,
  ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";
import { formatNumber, getAirportTypeColor, getAirportTypeLabel } from "@/lib/utils";
import KPICard from "@/components/KPICard";
import ErrorBoundary from "@/components/ErrorBoundary";
import { KPISkeletons, ChartSkeleton } from "@/components/LoadingSkeleton";
import { useStats, useCountryStats, useTypeStats } from "@/hooks/useStats";
import type { CountryStat } from "@/types/airport";

export default function StatsPage() {
  const { stats, loading: sLoading } = useStats();
  const { countries, loading: cLoading } = useCountryStats(20);
  const { types, loading: tLoading } = useTypeStats();

  const kpis = stats ? [
    { label: "Countries", value: formatNumber(stats.total_countries), icon: "🌍", accent: "emerald" as const },
    { label: "Navaids", value: formatNumber(stats.total_navaids), icon: "📡", accent: "cyan" as const },
    { label: "Scheduled Service", value: formatNumber(stats.airports_with_scheduled_service), icon: "🗓️", accent: "amber" as const },
  ] : [];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">📈 Statistics</h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
          Aviation data analytics and insights
        </p>
      </div>

      {sLoading ? (
        <KPISkeletons count={3} />
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {kpis.map((k, i) => <KPICard key={k.label} {...k} index={i} />)}
        </div>
      )}

      {/* Top 20 Countries */}
      <ErrorBoundary>
        {cLoading ? (
          <ChartSkeleton height={400} />
        ) : (
          <div className="dashboard-card p-5">
            <h2 className="font-semibold mb-4">Top 20 Countries by Airport Count</h2>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={countries} margin={{ bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  dataKey="country_code"
                  tick={{ fill: "var(--text-secondary)", fontSize: 11 }}
                  axisLine={{ stroke: "var(--border)" }}
                  angle={-45}
                  textAnchor="end"
                />
                <YAxis
                  tick={{ fill: "var(--text-secondary)", fontSize: 11 }}
                  axisLine={{ stroke: "var(--border)" }}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--bg-secondary)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    color: "var(--text-primary)",
                    fontSize: 12,
                  }}
                  formatter={(value: unknown, _: unknown, entry: unknown) => {
                    const v = value as number;
                    const e = entry as { payload: CountryStat };
                    return [formatNumber(v), e.payload.country_name || "Unknown"];
                  }}
                />
                <Bar dataKey="airport_count" radius={[4, 4, 0, 0]} fill="var(--accent-sky)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </ErrorBoundary>

      {/* Airport Types */}
      <ErrorBoundary>
        {tLoading ? (
          <ChartSkeleton height={300} />
        ) : (
          <div className="dashboard-card p-5">
            <h2 className="font-semibold mb-4">Airport Types Distribution</h2>
            <div className="flex items-center gap-8">
              <ResponsiveContainer width="40%" height={300}>
                <PieChart>
                  <Pie
                    data={types}
                    dataKey="count"
                    nameKey="type"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    strokeWidth={0}
                    label={(props: unknown) => {
                      const p = props as { percentage: number };
                      return `${p.percentage}%`;
                    }}
                  >
                    {types.map((t) => (
                      <Cell key={t.type} fill={getAirportTypeColor(t.type)} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "var(--bg-secondary)",
                      border: "1px solid var(--border)",
                      borderRadius: 8,
                      color: "var(--text-primary)",
                      fontSize: 12,
                    }}
                    formatter={(value: unknown) => formatNumber(value as number)}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-3">
                {types.map((t) => (
                  <div key={t.type} className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-sm flex-shrink-0"
                      style={{ background: getAirportTypeColor(t.type) }}
                    />
                    <span className="text-sm flex-1">{getAirportTypeLabel(t.type)}</span>
                    <span className="text-sm font-mono font-medium">{formatNumber(t.count)}</span>
                    <span className="text-xs font-mono w-14 text-right" style={{ color: "var(--text-muted)" }}>
                      {t.percentage}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </ErrorBoundary>
    </div>
  );
}
