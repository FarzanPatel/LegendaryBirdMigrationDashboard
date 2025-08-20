"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";

// Map style from Carto
const MAP_STYLE = "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json";

// Risk zone colors
const REGION_COLORS: Record<string, string> = {
  Green: "#22c55e",
  Warning: "#fbbf24",
  Red: "#ef4444"
};

type Risk = "Green" | "Warning" | "Red";

export default function RegionMap({
  selectedRegion,
  regionData,
  viewMode,
  selectedCountry,
  onCountrySelect
}: {
  selectedRegion: string;
  regionData: Record<string, { risk_zone: Risk }>;
  viewMode: "region" | "country";
  selectedCountry: string | null;
  onCountrySelect: (neCountryName: string) => void;
}) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    const fetchJson = async (url: string, label: string) => {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`${label} HTTP ${res.status}`);
      return await res.json();
    };

    const fitToFeature = (map: maplibregl.Map, feature: any, pad = 60) => {
      try {
        const coords: number[][] = [];
        const push = (g: any) => {
          if (g.type === "Polygon") g.coordinates.flat(1).forEach((c: number[]) => coords.push(c));
          else if (g.type === "MultiPolygon") g.coordinates.flat(2).forEach((c: number[]) => coords.push(c));
        };
        if (feature?.geometry) push(feature.geometry);
        if (coords.length) {
          const lngs = coords.map(c => c[0]);
          const lats = coords.map(c => c[1]);
          const sw: [number, number] = [Math.min(...lngs), Math.min(...lats)];
          const ne: [number, number] = [Math.max(...lngs), Math.max(...lats)];
          map.fitBounds([sw, ne], { padding: pad, duration: 650, maxZoom: 5.5 });
        } else {
          map.easeTo({ center: [10, 20], zoom: 1.8, duration: 600 });
        }
      } catch {
        map.easeTo({ center: [10, 20], zoom: 1.8, duration: 600 });
      }
    };

    (async () => {
      try {
        const [regionsGeo, countriesGeo] = await Promise.all([
          fetchJson("/data/regions.geojson", "regions.geojson"),
          fetchJson("/data/countries.geojson", "countries.geojson")
        ]);

        const regionFeature = regionsGeo.features.find(
          (f: any) => f?.properties?.NAME === selectedRegion
        );

        // Custom canvas to force WebGL1 context
        const canvas = document.createElement("canvas");
        const gl = canvas.getContext("webgl", {
          antialias: false,
          failIfMajorPerformanceCaveat: false
        });

        if (!gl) {
          console.warn("WebGL1 not supported. Map not initialized.");
          return;
        }

        const map = new maplibregl.Map({
          container: mapContainer.current!,
          style: MAP_STYLE,
          center: [10, 20],
          zoom: 1.8,
          attributionControl: true,
          canvas
        });

        mapRef.current = map;

        map.setMaxBounds([[-180, -85], [180, 85]]);

        map.getCanvas().addEventListener("webglcontextlost", (e) => {
          e.preventDefault();
          console.warn("WebGL context lost");
        });

        map.getCanvas().addEventListener("webglcontextrestored", () => {
          console.warn("WebGL context restored");
          try {
            map.resize();
          } catch {}
        });

        map.on("load", () => {
          // Background
          map.addLayer({ id: "bg", type: "background", paint: { "background-color": "#eef4f8" } });

          const regionRisk = (regionData[selectedRegion]?.risk_zone || "Warning") as Risk;
          const regionFC = { type: "FeatureCollection", features: regionFeature ? [regionFeature] : [] };

          // Region Layers
          map.addSource("region", { type: "geojson", data: regionFC });
          map.addLayer({
            id: "region-fill",
            type: "fill",
            source: "region",
            paint: {
              "fill-color": REGION_COLORS[regionRisk],
              "fill-opacity": viewMode === "region" ? 0.35 : 0.18,
              "fill-outline-color": REGION_COLORS[regionRisk]
            }
          });
          map.addLayer({
            id: "region-outline",
            type: "line",
            source: "region",
            paint: { "line-color": "#1f2937", "line-width": 2.2, "line-dasharray": [4, 3] }
          });

          // Countries in region
          const regionCountries = {
            type: "FeatureCollection",
            features: (countriesGeo.features || []).filter(
              (f: any) => f?.properties?.CONTINENT === selectedRegion
            )
          };

          map.addSource("countries", { type: "geojson", data: regionCountries });
          map.addLayer({
            id: "countries-hit",
            type: "fill",
            source: "countries",
            paint: { "fill-color": "#000", "fill-opacity": 0 }
          });
          map.addLayer({
            id: "country-highlight",
            type: "fill",
            source: "countries",
            filter: ["==", ["get", "NAME"], ""],
            paint: { "fill-color": REGION_COLORS[regionRisk], "fill-opacity": 0.55 }
          });
          map.addLayer({
            id: "country-outline",
            type: "line",
            source: "countries",
            filter: ["==", ["get", "NAME"], ""],
            paint: { "line-color": "#111827", "line-width": 2 }
          });

          // Tooltip
          const tooltip = document.createElement("div");
          Object.assign(tooltip.style, {
            position: "absolute",
            pointerEvents: "none",
            padding: "6px 10px",
            borderRadius: "8px",
            background: "rgba(17,24,39,0.92)",
            color: "white",
            fontSize: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
            transform: "translate(8px,8px)",
            display: "none",
            zIndex: "3"
          } as CSSStyleDeclaration);
          mapContainer.current!.appendChild(tooltip);

          // Reset Button
          const resetBtn = document.createElement("button");
          resetBtn.textContent = "Reset view";
          Object.assign(resetBtn.style, {
            position: "absolute",
            right: "12px",
            top: "12px",
            zIndex: "4",
            padding: "8px 12px",
            borderRadius: "10px",
            border: "1px solid #e5e7eb",
            background: "#ffffff",
            fontSize: "12px",
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
          } as CSSStyleDeclaration);
          mapContainer.current!.appendChild(resetBtn);

          // Interactions
          map.on("mouseenter", "countries-hit", () => (map.getCanvas().style.cursor = "pointer"));
          map.on("mouseleave", "countries-hit", () => {
            map.getCanvas().style.cursor = "";
            tooltip.style.display = "none";
          });
          map.on("mousemove", "countries-hit", (e: any) => {
            const f = e.features?.[0];
            if (!f) return;
            const name = f.properties?.NAME ?? "";
            const pt = e.point;
            tooltip.style.left = `${pt.x}px`;
            tooltip.style.top = `${pt.y}px`;
            tooltip.style.display = "block";
            tooltip.innerHTML = `<div style="font-weight:600">${name}</div>`;
          });
          map.on("click", "countries-hit", (e: any) => {
            const f = e.features?.[0];
            if (!f) return;
            const neName = f.properties?.NAME;
            if (!neName) return;
            onCountrySelect(neName);
            map.setFilter("country-highlight", ["==", ["get", "NAME"], neName]);
            map.setFilter("country-outline", ["==", ["get", "NAME"], neName]);
          });

          // Reset view button click
          resetBtn.addEventListener("click", () => {
            onCountrySelect(null);
            map.setFilter("country-highlight", ["==", ["get", "NAME"], ""]);
            map.setFilter("country-outline", ["==", ["get", "NAME"], ""]);
            fitToFeature(map, regionFeature);
          });

          // Initial view fit
          fitToFeature(map, regionFeature);
        });

        // Clean up on unmount
        return () => {
          map.remove();
          if (tooltip.parentNode) tooltip.parentNode.removeChild(tooltip);
          if (resetBtn.parentNode) resetBtn.parentNode.removeChild(resetBtn);
          mapRef.current = null;
        };
      } catch (err) {
        console.error("Error loading map data:", err);
      }
    })();

  }, [selectedRegion, regionData, viewMode, onCountrySelect]);

  return (
    <div
      ref={mapContainer}
      style={{ height: "100%", width: "100%", position: "relative" }}
      aria-label="Region map"
      role="region"
    />
  );
}
