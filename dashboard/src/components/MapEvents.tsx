"use client";

import { useMap, useMapEvents } from "react-leaflet";
import { useCallback, useEffect, useRef } from "react";

interface MapEventsProps {
  onBoundsChange: (bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  }) => void;
  onZoomChange?: (zoom: number) => void;
}

export default function MapEvents({ onBoundsChange, onZoomChange }: MapEventsProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const map = useMap();

  const emitBounds = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      const b = map.getBounds();
      onBoundsChange({
        north: Math.min(b.getNorth(), 90),
        south: Math.max(b.getSouth(), -90),
        east: Math.min(b.getEast(), 180),
        west: Math.max(b.getWest(), -180),
      });
      onZoomChange?.(map.getZoom());
    }, 300);
  }, [map, onBoundsChange, onZoomChange]);

  useEffect(() => {
    onZoomChange?.(map.getZoom());
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [map, onZoomChange]);

  useMapEvents({
    moveend: emitBounds,
    zoomend: emitBounds,
  });

  return null;
}
