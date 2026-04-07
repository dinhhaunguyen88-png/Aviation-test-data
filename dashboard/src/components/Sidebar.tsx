"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Dashboard", href: "/", icon: "📊" },
  { label: "Map", href: "/map", icon: "🗺️" },
  { label: "Airports", href: "/search", icon: "🔍" },
  { label: "Routes", href: "/routes", icon: "✈️" },
  { label: "Statistics", href: "/stats", icon: "📈" },
  { label: "Data", href: "/data", icon: "📡" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="fixed left-0 top-0 bottom-0 flex flex-col z-40"
      style={{
        width: "var(--sidebar-width)",
        background: "var(--bg-secondary)",
        borderRight: "1px solid var(--border)",
      }}
    >
      {/* Logo */}
      <div className="px-5 py-5 flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center text-lg font-bold"
          style={{
            background: "linear-gradient(135deg, var(--accent-sky), var(--accent-sky-dark))",
            color: "#fff",
          }}
        >
          ✈
        </div>
        <div>
          <div className="font-semibold text-sm leading-tight" style={{ color: "var(--text-primary)" }}>
            Aviation
          </div>
          <div className="text-[11px] font-medium" style={{ color: "var(--accent-sky)" }}>
            Dashboard
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 mt-2">
        <div className="space-y-1">
          {navItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar-item ${isActive ? "active" : ""}`}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t" style={{ borderColor: "var(--border)" }}>
        <div className="text-[11px]" style={{ color: "var(--text-muted)" }}>
          OurAirports · OpenFlights
        </div>
        <div className="text-[10px] mt-1" style={{ color: "var(--text-muted)" }}>
          85K+ airports · 67K+ routes
        </div>
      </div>
    </aside>
  );
}
