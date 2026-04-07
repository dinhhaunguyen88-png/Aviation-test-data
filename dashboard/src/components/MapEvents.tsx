"use client";

import { useMapEvents } from "react-leaflet";
import { useCallback, useRef } from "react";

interface MapEventsProps {
  onBoundsChange: (bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  }) => void;
}

export default function MapEvents({ onBoundsChange }: MapEventsProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const emitBounds = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      const map = mapRef;
      if (!map) return;
      const b = map.getBounds();
      onBoundsChange({
        north: Math.min(b.getNorth(), 90),
        south: Math.max(b.getSouth(), -90),
        east: Math.min(b.getEast(), 180),
        west: Math.max(b.getWest(), -180),
      });
    }, 300);
  }, [onBoundsChange]);

  const mapRef = useMapEvents({
    moveend: emitBounds,
    zoomend: emitBounds,
  });

  return null;
}
