import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";

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
  const mapRef = useRef<maplibregl.Map | null>(null);

  const buildMap = async () => {
    if (!mapContainer.current) return;

    const cleanup = () => {
      const map = mapRef.current;
      if (!map) return;

      // Remove all layers and sources
      for (const layer of map.getStyle().layers ?? []) {
        if (map.getLayer(layer.id)) {
          try {
            map.removeLayer(layer.id);
          } catch {}
        }
      }
      for (const id in map.getStyle().sources) {
        if (map.getSource(id)) {
          try {
            map.removeSource(id);
          } catch {}
        }
      }

      try {
        map.remove();
      } catch {}
      mapRef.current = null;

      // Remove all child DOM nodes (tooltips, buttons)
      if (mapContainer.current) {
        while (mapContainer.current.firstChild) {
          mapContainer.current.removeChild(mapContainer.current.firstChild);
        }
      }
    };

    cleanup(); // In case of re-initialization

    const fetchJson = async (url: string, label: string) => {
      const res = await fetch(url);
      const txt = await res.text();
      if (!res.ok) throw new Error(`${label} HTTP ${res.status}: ${txt.slice(0, 160)}`);
      return JSON.parse(txt);
    };

    try {
      const [regionsGeo, countriesGeo] = await Promise.all([
        fetchJson("/data/regions.geojson", "regions"),
        fetchJson("/data/countries.geojson", "countries")
      ]);

      const regionFeature = regionsGeo?.features?.find(
        (f: any) => f?.properties?.NAME === selectedRegion
      );
      const regionRisk = (regionData[selectedRegion]?.risk_zone || "Warning") as Risk;

      const map = new maplibregl.Map({
        container: mapContainer.current,
        style: MAP_STYLE,
        center: [10, 20],
        zoom: 1.8,
        attributionControl: true,
        antialias: false,
        failIfMajorPerformanceCaveat: false,
        canvasContextAttributes: { contextType: "webgl" } // <- WebGL1 only
      });

      mapRef.current = map;

      map.setMaxBounds([[-180, -85], [180, 85]]);

      const fitToFeature = (feature: any, pad = 60) => {
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
        }
      };

      map.on("load", () => {
        // === REGIONS ===
        const regionFC = { type: "FeatureCollection", features: regionFeature ? [regionFeature] : [] };
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

        // === COUNTRIES ===
        const regionCountries = {
          type: "FeatureCollection",
          features: countriesGeo?.features?.filter(
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

        // === TOOLTIPS + INTERACTION ===
        const tooltip = document.createElement("div");
        Object.assign(tooltip.style, {
          position: "absolute",
          pointerEvents: "none",
          padding: "6px 10px",
          background: "#111827",
          color: "white",
          borderRadius: "8px",
          fontSize: "12px",
          display: "none"
        });
        mapContainer.current?.appendChild(tooltip);

        map.on("mousemove", "countries-hit", (e: any) => {
          const f = e.features?.[0];
          if (!f) return;
          tooltip.innerHTML = `<strong>${f.properties?.NAME}</strong>`;
          tooltip.style.left = `${e.point.x + 10}px`;
          tooltip.style.top = `${e.point.y + 10}px`;
          tooltip.style.display = "block";
        });

        map.on("mouseleave", "countries-hit", () => {
          tooltip.style.display = "none";
        });

        map.on("click", "countries-hit", (e: any) => {
          const f = e.features?.[0];
          if (!f) return;
          const name = f.properties?.NAME;
          onCountrySelect(name);
          map.setFilter("country-highlight", ["==", ["get", "NAME"], name]);
          fitToFeature(f);
        });

        // Initial fit
        if (viewMode === "country" && selectedCountry) {
          const cf = regionCountries.features.find((f: any) => f?.properties?.NAME === selectedCountry);
          if (cf) {
            map.setFilter("country-highlight", ["==", ["get", "NAME"], selectedCountry]);
            fitToFeature(cf);
          }
        } else if (regionFeature) {
          fitToFeature(regionFeature);
        }
      });

      // === Context loss handling ===
      map.getCanvas().addEventListener("webglcontextlost", (e: any) => {
        e.preventDefault();
        console.warn("WebGL context lost, will attempt to rebuild...");
      });

      map.getCanvas().addEventListener("webglcontextrestored", () => {
        console.warn("WebGL context restored, rebuilding map...");
        buildMap(); // Rebuild everything
      });

    } catch (err) {
      console.error("Map init error:", err);
    }
  };

  useEffect(() => {
    buildMap();
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
  }, [selectedRegion, viewMode, selectedCountry, regionData]);

  return (
    <div
      className="rounded-2xl overflow-hidden bg-white shadow"
      style={{
        height: "min(65vh, 760px)",
        minHeight: "560px",
        width: "100%",
        position: "relative"
      }}
    >
      <div ref={mapContainer} style={{ width: "100%", height: "100%" }} />
    </div>
  );
}
