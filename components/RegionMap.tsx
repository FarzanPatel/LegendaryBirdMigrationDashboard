import React, { useEffect, useRef, useState, useMemo } from "react";
import maplibregl from "maplibre-gl";
import type { Feature, FeatureCollection, GeoJsonProperties, Geometry } from "geojson";

const MAP_STYLE = "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"; // reliable basemap
const REGION_COLORS: Record<string, string> = {
  Green: "#22c55e",
  Warning: "#fbbf24",
  Red: "#ef4444"
};
type Risk = "Green" | "Warning" | "Red";

type RegionData = Record<string, { risk_zone: Risk }>;

interface RegionMapProps {
  selectedRegion: string;
  regionData: RegionData;
  viewMode: "region" | "country";
  selectedCountry: string | null;
  onCountrySelect: (neCountryName: string) => void;
}

export default function RegionMap({
  selectedRegion,
  regionData,
  viewMode,
  selectedCountry,
  onCountrySelect
}: RegionMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Loaded GeoJSON data refs
  const regionsGeoRef = useRef<FeatureCollection<Geometry, GeoJsonProperties> | null>(null);
  const countriesGeoRef = useRef<FeatureCollection<Geometry, GeoJsonProperties> | null>(null);

  // Memoize regionFeature based on selectedRegion and loaded regionsGeo
  const regionFeature = useMemo<Feature<Geometry, GeoJsonProperties> | undefined>(() => {
    if (!regionsGeoRef.current) return undefined;
    return regionsGeoRef.current.features.find(
      (f) => f?.properties?.NAME === selectedRegion
    );
  }, [selectedRegion, regionsGeoRef.current]);

  // Memoize filtered countries in the region
  const regionCountries = useMemo<FeatureCollection<Geometry, GeoJsonProperties> | null>(() => {
    if (!countriesGeoRef.current) return null;
    return {
      type: "FeatureCollection",
      features: countriesGeoRef.current.features.filter(
        (f) => f?.properties?.CONTINENT === selectedRegion
      )
    };
  }, [selectedRegion, countriesGeoRef.current]);

  // Helper: Fit map to feature bounds
  const fitToFeature = (map: maplibregl.Map, feature: Feature<Geometry>, pad = 56) => {
    try {
      const coords: number[][] = [];
      const push = (geom: Geometry) => {
        if (geom.type === "Polygon") geom.coordinates.flat(1).forEach(c => coords.push(c));
        else if (geom.type === "MultiPolygon") geom.coordinates.flat(2).forEach(c => coords.push(c));
      };
      if (feature?.geometry) push(feature.geometry);
      if (coords.length) {
        const lngs = coords.map(c => c[0]);
        const lats = coords.map(c => c[1]);
        const sw: [number, number] = [Math.min(...lngs), Math.min(...lats)];
        const ne: [number, number] = [Math.max(...lngs), Math.max(...lats)];
        map.fitBounds([sw, ne], { padding: pad, duration: 700, maxZoom: 5.5 });
      } else {
        map.easeTo({ center: [15, 15], zoom: 1.8, duration: 600 });
      }
    } catch {
      map.easeTo({ center: [15, 15], zoom: 1.8, duration: 600 });
    }
  };

  // Load GeoJSON once on mount
  useEffect(() => {
    const loadJson = async (url: string) => {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`${url} HTTP ${res.status}`);
      return res.json();
    };

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [regionsGeo, countriesGeo] = await Promise.all([
          loadJson("/data/regions.geojson"),
          loadJson("/data/countries.geojson")
        ]);
        regionsGeoRef.current = regionsGeo;
        countriesGeoRef.current = countriesGeo;

        // Initialize map only once
        if (mapContainer.current && !mapRef.current) {
          const map = new maplibregl.Map({
            container: mapContainer.current,
            style: MAP_STYLE,
            center: [15, 15],
            zoom: 1.8,
            attributionControl: true,
            antialias: true,
            dragRotate: false,
            pitchWithRotate: false,
            pitch: 0,
            bearing: 0
          });

          map.setMaxBounds([[-180, -85], [180, 85]]);

          // Background layer
          map.on("load", () => {
            try {
              map.addLayer({ id: "bg", type: "background", paint: { "background-color": "#eef4f8" } });
            } catch {}

            // Add empty sources for region and countries
            map.addSource("region", { type: "geojson", data: { type: "FeatureCollection", features: [] } });
            map.addSource("countries", { type: "geojson", data: { type: "FeatureCollection", features: [] } });

            // Region layers
            map.addLayer({
              id: "region-fill",
              type: "fill",
              source: "region",
              paint: {
                "fill-color": REGION_COLORS["Warning"], // default, updated later
                "fill-opacity": 0.35,
                "fill-outline-color": REGION_COLORS["Warning"]
              }
            });
            map.addLayer({
              id: "region-outline",
              type: "line",
              source: "region",
              paint: { "line-color": "#1f2937", "line-width": 2.2, "line-dasharray": [4, 3] }
            });

            // Countries layers
            // Hit test invisible fill
            map.addLayer({
              id: "countries-hit",
              type: "fill",
              source: "countries",
              paint: { "fill-color": "#000", "fill-opacity": 0 }
            });

            // Highlight fill + outline with empty filters (no highlight)
            map.addLayer({
              id: "country-highlight",
              type: "fill",
              source: "countries",
              filter: ["==", ["get", "NAME"], ""],
              paint: {
                "fill-color": REGION_COLORS["Warning"], // default, updated later
                "fill-opacity": 0.55
              }
            });
            map.addLayer({
              id: "country-outline",
              type: "line",
              source: "countries",
              filter: ["==", ["get", "NAME"], ""],
              paint: { "line-color": "#111827", "line-width": 2 }
            });

            // Tooltip element
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
            tooltip.setAttribute("role", "tooltip");
            tooltip.setAttribute("aria-hidden", "true");
            mapContainer.current!.appendChild(tooltip);

            // Reset button
            const resetBtn = document.createElement("button");
            resetBtn.textContent = "Reset view";
            resetBtn.setAttribute("aria-label", "Reset map view");
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

            // Hover interactions with throttling
            let throttleTimeout: number | null = null;
            map.on("mouseenter", "countries-hit", () => {
              map.getCanvas().style.cursor = "pointer";
            });
            map.on("mouseleave", "countries-hit", () => {
              map.getCanvas().style.cursor = "";
              tooltip.style.display = "none";
              tooltip.setAttribute("aria-hidden", "true");
            });
            map.on("mousemove", "countries-hit", (e) => {
              if (throttleTimeout) return;
              throttleTimeout = window.setTimeout(() => {
                throttleTimeout = null;
                const f = e.features?.[0];
                if (!f) return;
                const name = f.properties?.NAME ?? "";
                const pt = e.point;
                tooltip.style.left = `${pt.x}px`;
                tooltip.style.top = `${pt.y}px`;
                tooltip.style.display = "block";
                tooltip.setAttribute("aria-hidden", "false");
                tooltip.innerHTML = `<div style="font-weight:600">${name}</div>`;
              }, 50);
            });

            // Click to drill down
            map.on("click", "countries-hit", (e) => {
              const f = e.features?.[0];
              if (!f) return;
              const neName = f.properties?.NAME;
              if (!neName) return;

              onCountrySelect(neName);
            });

            // Reset view button click
            resetBtn.onclick = () => {
              map.setFilter("country-highlight", ["==", ["get", "NAME"], ""]);
              map.setFilter("country-outline", ["==", ["get", "NAME"], ""]);
              if (regionFeature) fitToFeature(map, regionFeature, 56);
              else map.easeTo({ center: [15, 15], zoom: 1.8, duration: 600 });
            };

            mapRef.current = map;
            setLoading(false);
          });
        }
      } catch (e: any) {
        setError(e.message || "Failed to load GeoJSON");
        setLoading(false);
        console.error("GeoJSON load error:", e);
      }
    })();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      if (mapContainer.current) {
        while (mapContainer.current.firstChild) {
          mapContainer.current.removeChild(mapContainer.current.firstChild);
        }
      }
    };
  }, []);

  // Update sources, layers, and filters when props or loaded GeoJSON change
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !regionsGeoRef.current || !countriesGeoRef.current) return;

    // Update region source data & paint colors
    const regionRisk = (regionData[selectedRegion]?.risk_zone || "Warning") as Risk;

    const regionFC = regionFeature
      ? { type: "FeatureCollection", features: [regionFeature] }
      : { type: "FeatureCollection", features: [] };

    const countriesFC = regionCountries || { type: "FeatureCollection", features: [] };

    // Update region source and paint
    const regionSource = map.getSource("region") as maplibregl.GeoJSONSource;
    if (regionSource) {
      regionSource.setData(regionFC);
    }

    // Update region fill color and opacity based on viewMode
    if (map.getLayer("region-fill")) {
      map.setPaintProperty("region-fill", "fill-color", REGION_COLORS[regionRisk]);
      map.setPaintProperty("region-fill", "fill-opacity", viewMode === "region" ? 0.35 : 0.18);
      map.setPaintProperty("region-fill", "fill-outline-color", REGION_COLORS[regionRisk]);
    }

    // Update countries source
    const countriesSource = map.getSource("countries") as maplibregl.GeoJSONSource;
    if (countriesSource) {
      countriesSource.setData(countriesFC);
    }

    // Update country highlight colors
    if (map.getLayer("country-highlight")) {
      map.setPaintProperty("country-highlight", "fill-color", REGION_COLORS[regionRisk]);
    }

    // Update filters based on selectedCountry and viewMode
    if (viewMode === "country" && selectedCountry) {
      map.setFilter("country-highlight", ["==", ["get", "NAME"], selectedCountry]);
      map.setFilter("country-outline", ["==", ["get", "NAME"], selectedCountry]);
      const cf = countriesFC.features.find(f => f?.properties?.NAME === selectedCountry);
      if (cf) {
        fitToFeature(map, cf, 64);
      } else if (regionFeature) {
        fitToFeature(map, regionFeature, 56);
      } else {
        map.easeTo({ center: [15, 15], zoom: 1.8, duration: 600 });
      }
    } else {
      // Clear highlight filters
      map.setFilter("country-highlight", ["==", ["get", "NAME"], ""]);
      map.setFilter("country-outline", ["==", ["get", "NAME"], ""]);
      if (regionFeature) {
        fitToFeature(map, regionFeature, 56);
      } else {
        map.easeTo({ center: [15, 15], zoom: 1.8, duration: 600 });
      }
    }
  }, [selectedRegion, selectedCountry, viewMode, regionData, regionFeature, regionCountries]);

  if (loading) {
    return (
      <div
        className="rounded-2xl overflow-hidden bg-white shadow flex items-center justify-center"
        style={{ height: "min(60vh, 720px)", minHeight: "520px", width: "100%" }}
        aria-live="polite"
      >
        Loading map…
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="rounded-2xl overflow-hidden bg-white shadow flex items-center justify-center text-red-600"
        style={{ height: "min(60vh, 720px)", minHeight: "520px", width: "100%" }}
        role="alert"
      >
        {`Error loading map: ${error}`}
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl overflow-hidden bg-white shadow"
      style={{ height: "min(60vh, 720px)", minHeight: "520px", width: "100%", position: "relative" }}
    >
      <div ref={mapContainer} style={{ width: "100%", height: "100%" }} />
    </div>
  );
}
