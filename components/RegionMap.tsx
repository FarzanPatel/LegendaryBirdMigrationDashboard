import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";

const MAP_STYLE = "https://demotiles.maplibre.org/style.json";
const REGION_COLORS: Record<string, string> = {
  Green: "#22c55e",
  Warning: "#fbbf24",
  Red: "#ef4444"
};

export default function RegionMap({
  selectedRegion,
  regionData,
  viewMode,
  selectedCountry,
  onCountrySelect
}: {
  selectedRegion: string;
  regionData: Record<string, { risk_zone: "Green" | "Warning" | "Red" }>;
  viewMode: "region" | "country";
  selectedCountry: string | null;
  onCountrySelect: (neCountryName: string) => void;
}) {
  const mapContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    let map: maplibregl.Map;

    Promise.all([
      fetch("/data/regions.geojson").then(r => r.json()),
      fetch("/data/countries.geojson").then(r => r.json())
    ]).then(([regionsGeo, countriesGeo]) => {
      const regionFeature = regionsGeo.features.find((f: any) => f.properties?.NAME === selectedRegion);
      const regionFC = { type: "FeatureCollection", features: regionFeature ? [regionFeature] : [] };

      map = new maplibregl.Map({
        container: mapContainer.current!,
        style: MAP_STYLE,
        center: [0, 20],
        zoom: 2,
        attributionControl: true,
        antialias: true,
        dragRotate: false,
        pitchWithRotate: false,
        pitch: 0,
        bearing: 0
      });

      map.setMaxBounds([[-180, -85], [180, 85]]);

      const fitToFeature = (feature: any, pad = 40) => {
        try {
          const coords: number[][] = [];
          const pushCoords = (geom: any) => {
            if (geom.type === "Polygon") geom.coordinates.flat(1).forEach((c: number[]) => coords.push(c));
            else if (geom.type === "MultiPolygon") geom.coordinates.flat(2).forEach((c: number[]) => coords.push(c));
          };
          if (feature?.geometry) pushCoords(feature.geometry);
          if (coords.length) {
            const lngs = coords.map(c => c[0]);
            const lats = coords.map(c => c[1]);
            const sw: [number, number] = [Math.min(...lngs), Math.min(...lats)];
            const ne: [number, number] = [Math.max(...lngs), Math.max(...lats)];
            map.fitBounds([sw, ne], { padding: pad, duration: 600, maxZoom: 6.5 });
          } else {
            map.easeTo({ center: [0, 20], zoom: 1.8, duration: 600 });
          }
        } catch {
          map.easeTo({ center: [0, 20], zoom: 1.8, duration: 600 });
        }
      };

      map.on("load", () => {
        // Region source/layers
        map.addSource("region", { type: "geojson", data: regionFC });
        const regionRisk = regionData[selectedRegion]?.risk_zone || "Warning";

        map.addLayer({
          id: "region-fill",
          type: "fill",
          source: "region",
          paint: {
            "fill-color": REGION_COLORS[regionRisk],
            "fill-opacity": viewMode === "region" ? 0.68 : 0.25,
            "fill-outline-color": REGION_COLORS[regionRisk]
          }
        });
        map.addLayer({
          id: "region-glow",
          type: "line",
          source: "region",
          paint: { "line-color": REGION_COLORS[regionRisk], "line-width": 10, "line-opacity": 0.14 }
        });
        map.addLayer({
          id: "region-outline",
          type: "line",
          source: "region",
          paint: { "line-color": "#222", "line-width": 2, "line-dasharray": [4, 3] }
        });

        // Countries source filtered to selected region by CONTINENT
        const regionCountries = {
          type: "FeatureCollection",
          features: countriesGeo.features.filter((f: any) => f.properties?.CONTINENT === selectedRegion)
        };

        map.addSource("countries", { type: "geojson", data: regionCountries });

        // Invisible fill for hit-testing
        map.addLayer({
          id: "countries-fill",
          type: "fill",
          source: "countries",
          paint: { "fill-color": "#000000", "fill-opacity": 0 }
        });

        // Highlighted country (dynamic filter)
        map.addLayer({
          id: "country-highlight",
          type: "fill",
          source: "countries",
          filter: ["==", ["get", "NAME"], ""],
          paint: {
            "fill-color": REGION_COLORS[regionRisk],
            "fill-opacity": 0.68
          }
        });
        map.addLayer({
          id: "country-outline",
          type: "line",
          source: "countries",
          filter: ["==", ["get", "NAME"], ""],
          paint: { "line-color": "#111", "line-width": 2 }
        });

        // Tooltip and Reset UI
        const tooltip = document.createElement("div");
        tooltip.style.position = "absolute";
        tooltip.style.pointerEvents = "none";
        tooltip.style.padding = "6px 10px";
        tooltip.style.borderRadius = "8px";
        tooltip.style.background = "rgba(17,24,39,0.9)";
        tooltip.style.color = "white";
        tooltip.style.fontSize = "12px";
        tooltip.style.boxShadow = "0 2px 8px rgba(0,0,0,0.2)";
        tooltip.style.transform = "translate(8px, 8px)";
        tooltip.style.display = "none";
        mapContainer.current!.appendChild(tooltip);

        const resetBtn = document.createElement("button");
        resetBtn.textContent = "Reset view";
        Object.assign(resetBtn.style, {
          position: "absolute",
          right: "12px",
          top: "12px",
          zIndex: "1",
          padding: "6px 10px",
          borderRadius: "10px",
          border: "1px solid #e5e7eb",
          background: "#ffffff",
          fontSize: "12px",
          cursor: "pointer",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
        } as CSSStyleDeclaration);
        mapContainer.current!.appendChild(resetBtn);

        const fitRegion = () => fitToFeature(regionFeature, 40);

        map.on("mouseenter", "countries-fill", () => (map.getCanvas().style.cursor = "pointer"));
        map.on("mouseleave", "countries-fill", () => {
          map.getCanvas().style.cursor = "";
          tooltip.style.display = "none";
        });
        map.on("mousemove", "countries-fill", (e: any) => {
          const f = e.features?.[0];
          if (!f) return;
          const neName = f.properties?.NAME ?? "";
          const pt = e.point;
          tooltip.style.left = `${pt.x}px`;
          tooltip.style.top = `${pt.y}px`;
          tooltip.style.display = "block";
          tooltip.innerHTML = `
            <div style="display:flex;align-items:center;gap:8px;">
              <span style="display:inline-block;width:10px;height:10px;border-radius:9999px;background:${REGION_COLORS[regionRisk]};"></span>
              <span style="font-weight:600;">${neName}</span>
            </div>
          `;
        });

        map.on("click", "countries-fill", (e: any) => {
          const f = e.features?.[0];
          if (!f) return;
          const neName = f.properties?.NAME;
          if (!neName) return;

          onCountrySelect(neName);
          map.setFilter("country-highlight", ["==", ["get", "NAME"], neName]);
          map.setFilter("country-outline", ["==", ["get", "NAME"], neName]);
          fitToFeature(f, 48);
        });

        resetBtn.onclick = () => {
          map.setFilter("country-highlight", ["==", ["get", "NAME"], ""]);
          map.setFilter("country-outline", ["==", ["get", "NAME"], ""]);
          fitRegion();
        };

        // Initial fit
        if (viewMode === "country" && selectedCountry) {
          const cf = regionCountries.features.find((f: any) => f.properties?.NAME === selectedCountry);
          if (cf) {
            map.setFilter("country-highlight", ["==", ["get", "NAME"], selectedCountry]);
            map.setFilter("country-outline", ["==", ["get", "NAME"], selectedCountry]);
            fitToFeature(cf, 48);
          } else {
            fitRegion();
          }
        } else {
          fitRegion();
        }

        // Animate region fill on first load
        map.setPaintProperty("region-fill", "fill-opacity", viewMode === "region" ? 0.0 : 0.15);
        let t = 0;
        const target = viewMode === "region" ? 0.68 : 0.25;
        const step = () => {
          t = Math.min(target, t + 0.06);
          map.setPaintProperty("region-fill", "fill-opacity", t);
          if (t < target) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);

        // Cleanup DOM helpers on map remove
        map.on("remove", () => {
          tooltip.remove();
          resetBtn.remove();
        });
      });
    });

    // Cleanup when props change
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
    <div className="rounded-2xl overflow-hidden bg-white shadow" style={{ height: "400px", width: "100%", position: "relative" }}>
      <div ref={mapContainer} style={{ width: "100%", height: "100%" }} />
    </div>
  );
}
