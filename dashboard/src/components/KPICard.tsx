"use client";

interface KPICardProps {
  label: string;
  value: string | number;
  icon: string;
  accent: "sky" | "emerald" | "amber" | "violet" | "rose" | "cyan";
  subtitle?: string;
  index?: number;
}

export default function KPICard({ label, value, icon, accent, subtitle, index = 0 }: KPICardProps) {
  return (
    <div
      className={`glass-card p-5 animate-fade-in-up stagger-${index + 1} stat-accent-${accent}`}
    >
      <div className="flex items-center justify-between mb-3">
        <div
          className="stat-icon-bg w-10 h-10 rounded-lg flex items-center justify-center text-lg"
        >
          {icon}
        </div>
        {subtitle && (
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full"
            style={{ background: "var(--bg-tertiary)", color: "var(--text-muted)" }}
          >
            {subtitle}
          </span>
        )}
      </div>
      <div className="stat-number text-2xl font-bold mb-0.5">{value}</div>
      <div className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
        {label}
      </div>
    </div>
  );
}
