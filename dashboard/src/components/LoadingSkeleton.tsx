"use client";

import React from "react";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "rect" | "circle";
  width?: string | number;
  height?: string | number;
  count?: number;
}

export default function LoadingSkeleton({
  className = "",
  variant = "rect",
  width,
  height,
  count = 1,
}: SkeletonProps) {
  const baseStyle: React.CSSProperties = {
    background: "linear-gradient(90deg, var(--bg-tertiary) 25%, rgba(56,189,248,0.06) 50%, var(--bg-tertiary) 75%)",
    backgroundSize: "200% 100%",
    animation: "shimmer 1.5s ease-in-out infinite",
    width: width ?? "100%",
    height: height ?? (variant === "text" ? "1em" : "100%"),
    borderRadius: variant === "circle" ? "50%" : variant === "text" ? 4 : 12,
  };

  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={className} style={baseStyle} />
      ))}
      <style jsx>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </>
  );
}

/* Pre-built skeleton layouts */
export function KPISkeletons({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${count}, 1fr)` }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="glass-card p-5 space-y-3">
          <LoadingSkeleton variant="circle" width={40} height={40} />
          <LoadingSkeleton variant="text" width="60%" height={32} />
          <LoadingSkeleton variant="text" width="40%" height={14} />
        </div>
      ))}
    </div>
  );
}

export function ChartSkeleton({ height = 300 }: { height?: number }) {
  return (
    <div className="dashboard-card p-5 space-y-3">
      <LoadingSkeleton variant="text" width="40%" height={20} />
      <LoadingSkeleton height={height} />
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="dashboard-card overflow-hidden">
      <div className="px-4 py-3" style={{ background: "var(--bg-tertiary)" }}>
        <LoadingSkeleton variant="text" width="30%" height={14} />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 px-4 py-3 border-t" style={{ borderColor: "var(--border)" }}>
          <LoadingSkeleton variant="text" width="20%" height={16} />
          <LoadingSkeleton variant="text" width="30%" height={16} />
          <LoadingSkeleton variant="text" width="25%" height={16} />
          <LoadingSkeleton variant="text" width="15%" height={16} />
        </div>
      ))}
    </div>
  );
}
