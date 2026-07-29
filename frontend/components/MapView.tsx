"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";

interface Location {
  lat: number;
  lng: number;
  name?: string;
  evidenceId?: string;
  elaResult?: string;
  city?: string;
}

interface MapViewProps {
  locations: Location[];
  center?: [number, number];
  zoom?: number;
  height?: string;
  className?: string;
  single?: boolean;
}

const ICON_URLS = {
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
};

export default function MapView({
  locations,
  center = [-17.3817, -66.1500], // Cochabamba default
  zoom = 6,
  height = "300px",
  className = "",
  single = false,
}: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    let map: any;
    let leafletModule: any;

    const initMap = async () => {
      // @ts-ignore - leaflet types not available
      leafletModule = await import("leaflet");

      // Fix Leaflet default icon issue
      // @ts-ignore
      delete leafletModule.Icon.Default.prototype._getIconUrl;
      leafletModule.Icon.Default.mergeOptions(ICON_URLS);

      if (!mapRef.current || mapInstanceRef.current) return;

      map = leafletModule.map(mapRef.current, {
        center: center,
        zoom: zoom,
        zoomControl: true,
        scrollWheelZoom: true,
        attributionControl: false,
      });

      leafletModule
        .tileLayer(
          "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
          {
            maxZoom: 19,
            attribution:
              '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>',
          }
        )
        .addTo(map);

      mapInstanceRef.current = map;

      // Add markers
      locations.forEach((loc) => {
        if (!loc.lat || !loc.lng) return;

        const isManipulated =
          loc.elaResult === "POSIBLE_MANIPULACION";
        const color = isManipulated ? "#ef4444" : "#10b981";
        const icon = leafletModule.divIcon({
          className: "custom-marker",
          html: `<div style="
            width: 24px; height: 24px;
            background: ${color};
            border: 2px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          ">📍</div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
          popupAnchor: [0, -20],
        });

        const marker = leafletModule
          .marker([loc.lat, loc.lng], { icon })
          .addTo(map);

        const popupContent = `
          <div style="min-width: 180px; font-family: system-ui, sans-serif;">
            <p style="font-weight: 600; margin: 0 0 4px; font-size: 13px;">
              ${loc.name || "Evidencia"}
            </p>
            ${
              loc.city
                ? `<p style="margin: 0 0 2px; font-size: 11px; color: #666;">📍 ${loc.city}</p>`
                : ""
            }
            ${
              loc.elaResult
                ? `<p style="margin: 0; font-size: 11px;">
                Estado:
                <span style="color: ${color}; font-weight: 600;">
                  ${
                    isManipulated
                      ? "⚠ Posible manipulación"
                      : "✅ Auténtica"
                  }
                </span>
              </p>`
                : ""
            }
            ${
              loc.evidenceId
                ? `<p style="margin: 6px 0 0;">
                <a href="/dashboard/evidencias/${loc.evidenceId}" style="font-size: 11px; color: #3b82f6; text-decoration: underline;">
                  Ver detalle →
                </a>
              </p>`
                : ""
            }
          </div>
        `;

        marker.bindPopup(popupContent);
        markersRef.current.push(marker);
      });

      // Fit map to markers
      if (locations.length === 1) {
        map.setView([locations[0].lat, locations[0].lng], 15);
      } else if (locations.length > 1) {
        const bounds = leafletModule.latLngBounds(
          locations.map((loc) => [loc.lat, loc.lng])
        );
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    };

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [locations, center, zoom]);

  return (
    <div
      ref={mapRef}
      className={`rounded-xl overflow-hidden border border-border ${className}`}
      style={{ height, zIndex: 1 }}
    />
  );
}
