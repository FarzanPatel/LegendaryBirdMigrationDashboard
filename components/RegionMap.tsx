import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";

// Stable, lightweight basemap. You can switch to Positron if preferred:
// const MAP_STYLE = "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";
const MAP_STYLE = "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json";

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

  useEffect(() => {
    if (!mapContainer.current) return;

    let map: maplibregl.Map | null = null;

    const fetchJson = async (url: string, label: string) => {
      const res = await fetch(url);
      const txt = await res.text();
      if (!res.ok) throw new Error(`${label} HTTP ${res.status}: ${txt.slice(0, 160)}`);
      try {
        return JSON.parse(txt);
      } catch (e) {
        throw new Error(`${label} JSON parse error: ${String(e)} | ${txt.slice(0, 160)}`);
      }
    };

    const fitToFeature = (m: maplibregl.Map, feature: any, pad = 60) => {
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
          m.fitBounds([sw, ne], { padding: pad, duration: 650, maxZoom: 5.5 });
        } else {
          m.easeTo({ center: [10, 20], zoom: 1.8, duration: 600 });
        }
      } catch {
        m.easeTo({ center: [10, 20], zoom: 1.8, duration: 600 });
      }
    };

    (async () => {
      try {
        const [regionsGeo, countriesGeo] = await Promise.all([
          fetchJson("/data/regions.geojson", "regions.geojson"),
          fetchJson("/data/countries.geojson", "countries.geojson")
        ]);

        const regionFeature = regionsGeo?.features?.find(
          (f: any) => f?.properties?.NAME === selectedRegion
        );

        // Map constructor WITHOUT contextCreationOptions (fixes TS error)
        map = new maplibregl.Map({
          container: mapContainer.current!,
          style: MAP_STYLE,
          center: [10, 20],
          zoom: 1.8,
          attributionControl: true,
          antialias: false,
          failIfMajorPerformanceCaveat: false
        });

        map.setMaxBounds([[-180, -85], [180, 85]]);
        try {
          (map as any).style?.setTransition?.({ duration: 0, delay: 0 });
        } catch {}

        // WebGL context loss/restore handlers
        map.getCanvas().addEventListener("webglcontextlost", (e: any) => {
          e.preventDefault();
          // eslint-disable-next-line no-console
          console.warn("WebGL context lost");
        });
        map.getCanvas().addEventListener("webglcontextrestored", () => {
          // eslint-disable-next-line no-console
          console.warn("WebGL context restored");
          try { map!.resize(); } catch {}
        });

        map.on("load", () => {
          // Guard internal toggles safely
          try {
            const painter = (map as any).painter;
            if (painter && "terrain" in painter) {
              painter.terrain = null as any;
            }
          } catch {}
          try {
            const setCollisionBehavior = (map as any).setCollisionBehavior;
            if (typeof setCollisionBehavior === "function") {
              setCollisionBehavior({ split: false });
            }
          } catch {}

          // Background fallback
          try {
            map!.addLayer({ id: "bg", type: "background", paint: { "background-color": "#eef4f8" } });
          } catch {}

          const regionRisk = (regionData[selectedRegion]?.risk_zone || "Warning") as Risk;
          const regionFC = { type: "FeatureCollection", features: regionFeature ? [regionFeature] : [] };

          // Region layers
          map!.addSource("region", { type: "geojson", data: regionFC });
          map!.addLayer({
            id: "region-fill",
            type: "fill",
            source: "region",
            paint: {
              "fill-color": REGION_COLORS[regionRisk],
              "fill-opacity": viewMode === "region" ? 0.35 : 0.18,
              "fill-outline-color": REGION_COLORS[regionRisk]
            }
          });
          map!.addLayer({
            id: "region-outline",
            type: "line",
            source: "region",
            paint: { "line-color": "#1f2937", "line-width": 2.2, "line-dasharray": [4, 3] }
          });

          // Countries limited to selected region
          const regionCountries = {
            type: "FeatureCollection",
            features: (countriesGeo?.features || []).filter(
              (f: any) => f?.properties?.CONTINENT === selectedRegion
            )
          };

          map!.addSource("countries", { type: "geojson", data: regionCountries });
          map!.addLayer({
            id: "countries-hit",
            type: "fill",
            source: "countries",
            paint: { "fill-color": "#000", "fill-opacity": 0 }
          });
          map!.addLayer({
            id: "country-highlight",
            type: "fill",
            source: "countries",
            filter: ["==", ["get", "NAME"], ""],
            paint: { "fill-color": REGION_COLORS[regionRisk], "fill-opacity": 0.55 }
          });
          map!.addLayer({
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

          // Reset button
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
          map!.on("mouseenter", "countries-hit", () => (map!.getCanvas().style.cursor = "pointer"));
          map!.on("mouseleave", "countries-hit", () => {
            map!.getCanvas().style.cursor = "";
            tooltip.style.display = "none";
          });
          map!.on("mousemove", "countries-hit", (e: any) => {
            const f = e.features?.[0];
            if (!f) return;
            const name = f.properties?.NAME ?? "";
            const pt = e.point;
            tooltip.style.left = `${pt.x}px`;
            tooltip.style.top = `${pt.y}px`;
            tooltip.style.display = "block";
            tooltip.innerHTML = `<div style="font-weight:600">${name}</div>`;
          });
          map!.on("click", "countries-hit", (e: any) => {
            const f = e.features?.[0];
            if (!f) return;
            const neName = f.properties?.NAME;
            if (!neName) return;
            onCountrySelect(neName);
            map!.setFilter("country-highlight", ["==", ["get", "NAME"], neName]);
            map!.setFilter("country-outline", ["==", ["get", "NAME"], neName]);
            fitToFeature(map!, f, 68);
          });

          resetBtn.onclick = () => {
            map!.setFilter("country-highlight", ["==", ["get", "NAME"], ""]);
            map!.setFilter("country-outline", ["==", ["get", "NAME"], ""]);
            if (regionFeature) fitToFeature(map!, regionFeature, 60);
            else map!.easeTo({ center: [10, 20], zoom: 1.8, duration: 600 });
          };

          // Initial fit
          if (viewMode === "country" && selectedCountry) {
            const cf = regionCountries.features.find((f: any) => f?.properties?.NAME === selectedCountry);
            if (cf) {
              map!.setFilter("country-highlight", ["==", ["get", "NAME"], selectedCountry]);
              map!.setFilter("country-outline", ["==", ["get", "NAME"], selectedCountry]);
              fitToFeature(map!, cf, 68);
            } else if (regionFeature) {
              fitToFeature(map!, regionFeature, 60);
            }
          } else if (regionFeature) {
            fitToFeature(map!, regionFeature, 60);
          }

          map!.on("remove", () => {
            tooltip.remove();
            resetBtn.remove();
          });
        });

        map.on("error", (e) => {
          // eslint-disable-next-line no-console
          console.error("Map error:", (e as any)?.error || e);
        });
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Data load error:", err);
      }
    })();

    return () => {
      if (map) map.remove();
      if (mapContainer.current) {
        while (mapContainer.current.firstChild) {
          mapContainer.current.removeChild(mapContainer.current.firstChild);
        }
      }
    };
  }, [selectedRegion, viewMode, selectedCountry, regionData, onCountrySelect]);

  return (
    <div
      className="rounded-2xl overflow-hidden bg-white shadow"
      style={{
        height: "min(65vh, 760px)",
        minHeight: "560px",
        width: "100%",
        position: "relative",
        isolation: "isolate",
        willChange: "auto",
        contain: "layout paint size"
      }}
    >
      <div ref={mapContainer} style={{ width: "100%", height: "100%" }} />
    </div>
  );
}
