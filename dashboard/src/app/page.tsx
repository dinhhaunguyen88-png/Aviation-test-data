"use client";

import Link from "next/link";
import {
  BarChart, Bar, PieChart, Pie, Cell,
  ResponsiveContainer, XAxis, YAxis, Tooltip,
} from "recharts";
import KPICard from "@/components/KPICard";
import ErrorBoundary from "@/components/ErrorBoundary";
import { KPISkeletons, ChartSkeleton } from "@/components/LoadingSkeleton";
import { useStats, useCountryStats, useTypeStats } from "@/hooks/useStats";
import { formatNumber, getAirportTypeColor, getAirportTypeLabel } from "@/lib/utils";
import type { CountryStat } from "@/types/airport";

export default function DashboardPage() {
  const { stats, loading: sLoading } = useStats();
  const { countries, loading: cLoading } = useCountryStats(10);
  const { types, loading: tLoading } = useTypeStats();

  const kpis = stats
    ? [
        { label: "Airports", value: formatNumber(stats.total_airports), icon: "✈️", accent: "sky" as const, subtitle: `Top: ${stats.top_country}` },
        { label: "Runways", value: formatNumber(stats.total_runways), icon: "🛬", accent: "emerald" as const },
        { label: "Airlines", value: formatNumber(stats.total_airlines), icon: "🏢", accent: "amber" as const },
        { label: "Routes", value: formatNumber(stats.total_routes), icon: "🛫", accent: "violet" as const },
      ]
    : [];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            Global aviation data at a glance
          </p>
        </div>
        <Link
          href="/map"
          className="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:brightness-110"
          style={{
            background: "linear-gradient(135deg, var(--accent-sky), var(--accent-sky-dark))",
            color: "#fff",
          }}
        >
          🗺️ Open Map
        </Link>
      </div>

      {/* KPI Cards */}
      {sLoading ? (
        <KPISkeletons count={4} />
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi, i) => (
            <KPICard key={kpi.label} {...kpi} index={i} />
          ))}
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Countries Bar Chart */}
        <ErrorBoundary>
          {cLoading ? (
            <ChartSkeleton height={250} />
          ) : (
            <div className="dashboard-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-sm">Top Countries by Airports</h2>
                <Link href="/stats" className="text-xs hover:underline" style={{ color: "var(--accent-sky)" }}>
                  View all →
                </Link>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={countries} layout="vertical" margin={{ left: 20 }}>
                  <XAxis type="number" hide />
                  <YAxis
                    type="category"
                    dataKey="country_code"
                    width={30}
                    tick={{ fill: "var(--text-secondary)", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
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
                      return [formatNumber(v), e.payload.country_name || e.payload.country_code];
                    }}
                  />
                  <Bar dataKey="airport_count" radius={[0, 4, 4, 0]} fill="var(--accent-sky)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </ErrorBoundary>

        {/* Airport Types Pie Chart */}
        <ErrorBoundary>
          {tLoading ? (
            <ChartSkeleton height={250} />
          ) : (
            <div className="dashboard-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-sm">Airport Types Distribution</h2>
                <Link href="/stats" className="text-xs hover:underline" style={{ color: "var(--accent-sky)" }}>
                  View all →
                </Link>
              </div>
              <div className="flex items-center">
                <ResponsiveContainer width="50%" height={250}>
                  <PieChart>
                    <Pie
                      data={types}
                      dataKey="count"
                      nameKey="type"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={90}
                      strokeWidth={0}
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
                {/* Legend */}
                <div className="flex-1 space-y-2 pl-2">
                  {types.map((t) => (
                    <div key={t.type} className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                        style={{ background: getAirportTypeColor(t.type) }}
                      />
                      <span className="text-xs truncate" style={{ color: "var(--text-secondary)" }}>
                        {getAirportTypeLabel(t.type)}
                      </span>
                      <span className="text-xs ml-auto font-mono" style={{ color: "var(--text-muted)" }}>
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

      {/* Quick Links */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Search Airports", href: "/search", icon: "🔍", desc: "Find by ICAO, IATA, name" },
          { label: "World Map", href: "/map", icon: "🗺️", desc: "85K+ interactive markers" },
          { label: "Route Explorer", href: "/routes", icon: "✈️", desc: "Discover flight routes" },
          { label: "Data Sources", href: "/data", icon: "📡", desc: "Freshness & integrity" },
        ].map((link) => (
          <Link key={link.href} href={link.href} className="dashboard-card p-4 group">
            <div className="text-xl mb-2">{link.icon}</div>
            <div className="font-medium text-sm group-hover:text-[var(--accent-sky)] transition-colors">
              {link.label}
            </div>
            <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
              {link.desc}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
