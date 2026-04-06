import { type ClassValue, clsx } from "clsx";

/**
 * Merge class names conditionally
 */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}

/**
 * Format large numbers with commas: 85061 → "85,061"
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-US").format(num);
}

/**
 * Format elevation: 33 → "33 ft"
 */
export function formatElevation(ft: number | null): string {
  if (ft === null || ft === undefined) return "N/A";
  return `${formatNumber(ft)} ft`;
}

/**
 * Format runway length: 12467 → "12,467 ft (3,800 m)"
 */
export function formatRunwayLength(ft: number | null): string {
  if (!ft) return "N/A";
  const meters = Math.round(ft * 0.3048);
  return `${formatNumber(ft)} ft (${formatNumber(meters)} m)`;
}

/**
 * Get color for airport type (matches design-specs.md)
 */
export function getAirportTypeColor(type: string): string {
  const colors: Record<string, string> = {
    large_airport: "#38bdf8",
    medium_airport: "#10b981",
    small_airport: "#f59e0b",
    heliport: "#8b5cf6",
    seaplane_base: "#06b6d4",
    closed: "#64748b",
    balloonport: "#f43f5e",
  };
  return colors[type] || "#64748b";
}

/**
 * Get readable label for airport type
 */
export function getAirportTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    large_airport: "Large Airport",
    medium_airport: "Medium Airport",
    small_airport: "Small Airport",
    heliport: "Heliport",
    seaplane_base: "Seaplane Base",
    closed: "Closed",
    balloonport: "Balloonport",
  };
  return labels[type] || type;
}

/**
 * Debounce function for search inputs
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  ms: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}
