"use client";

import Link from "next/link";

const stats = [
  { label: "Airports", value: "85,061", icon: "✈️", accent: "sky" },
  { label: "Countries", value: "249", icon: "🌍", accent: "emerald" },
  { label: "Runways", value: "47,756", icon: "🛬", accent: "amber" },
  { label: "Routes", value: "67,662", icon: "🛫", accent: "violet" },
];

const features = [
  {
    title: "Interactive World Map",
    description: "Explore 85K+ airports on a global map with clustering, filters, and real-time search.",
    icon: "🗺️",
    href: "/map",
  },
  {
    title: "Airport Database",
    description: "Browse, search, and filter the complete airport database with detailed information.",
    icon: "📋",
    href: "/airports",
  },
  {
    title: "Statistics & Charts",
    description: "Analyze airport distribution by type, continent, and country with interactive charts.",
    icon: "📊",
    href: "/",
  },
  {
    title: "Route Explorer",
    description: "Discover flight routes connecting airports worldwide with airline details.",
    icon: "✈️",
    href: "/routes",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-in-up stagger-1">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
          style={{
            background: "var(--accent-sky-glow)",
            border: "1px solid rgba(56,189,248,0.2)",
          }}
        >
          <span className="text-sm font-medium" style={{ color: "var(--accent-sky)" }}>
            ✈️ Open Source Aviation Data
          </span>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight"
          style={{ color: "var(--text-primary)" }}
        >
          Aviation{" "}
          <span style={{ color: "var(--accent-sky)" }}>Dashboard</span>
        </h1>

        <p className="text-lg mb-8" style={{ color: "var(--text-secondary)" }}>
          Interactive dashboard for exploring airports, routes, runways, and
          aviation data worldwide. Powered by OurAirports & OpenFlights.
        </p>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl w-full mb-12">
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            className={`glass-card p-5 text-center animate-fade-in-up stagger-${i + 1} stat-accent-${stat.accent}`}
          >
            <div className="stat-icon-bg w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-3 text-lg">
              {stat.icon}
            </div>
            <div className="stat-number text-2xl md:text-3xl font-bold mb-1">
              {stat.value}
            </div>
            <div className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl w-full mb-12">
        {features.map((feature, i) => (
          <Link
            key={feature.title}
            href={feature.href}
            className={`dashboard-card p-6 group animate-fade-in-up stagger-${i + 1}`}
          >
            <div className="flex items-start gap-4">
              <div className="text-2xl">{feature.icon}</div>
              <div>
                <h3 className="font-semibold mb-1 group-hover:text-[var(--accent-sky)] transition-colors">
                  {feature.title}
                </h3>
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  {feature.description}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Setup Status */}
      <div className="dashboard-card p-6 max-w-4xl w-full animate-fade-in-up stagger-5">
        <h2 className="font-semibold mb-4 flex items-center gap-2">
          <span>⚙️</span> Setup Status
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { name: "Frontend (Next.js)", status: "✅ Running", ok: true },
            { name: "Backend (FastAPI)", status: "⏳ Not started", ok: false },
            { name: "Database (SQLite)", status: "⏳ Not started", ok: false },
            { name: "Data Import", status: "⏳ Not started", ok: false },
          ].map((item) => (
            <div
              key={item.name}
              className="flex items-center justify-between px-4 py-2.5 rounded-lg"
              style={{ background: "var(--bg-tertiary)" }}
            >
              <span className="text-sm">{item.name}</span>
              <span className={`text-xs font-medium ${item.ok ? "text-[var(--accent-emerald)]" : "text-[var(--text-muted)]"}`}>
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <p className="mt-8 text-xs" style={{ color: "var(--text-muted)" }}>
        Data from OurAirports.com & OpenFlights.org · Built with Next.js + FastAPI
      </p>
    </div>
  );
}
