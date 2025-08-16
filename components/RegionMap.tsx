import { useRef, useEffect } from "react";
import maplibregl from "maplibre-gl";

const MAP_STYLE = "https://demotiles.maplibre.org/style.json";
const REGION_COLORS: Record<string, string> = {
  Green: "#22c55e",
  Warning: "#fbbf24",
  Red: "#ef4444"
};

export default function RegionMap({
  selectedRegion,
  regionData
}: {
  selectedRegion: string;
  regionData: Record<string, { risk_zone: "Green" | "Warning" | "Red" }>;
}) {
  const mapContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    fetch("/data/regions.geojson")
      .then(res => res.json())
      .then((allGeojson) => {
        const feature = allGeojson.features.find(
          (f: any) => f.properties?.NAME === selectedRegion
        );
        const filteredGeojson = {
          type: "FeatureCollection",
          features: feature ? [feature] : []
        };

        // Create tooltip element
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
        mapContainer.current.appendChild(tooltip);

        // Create Reset View button
        const resetBtn = document.createElement("button");
        resetBtn.textContent = "Reset view";
        resetBtn.style.position = "absolute";
        resetBtn.style.right = "12px";
        resetBtn.style.top = "12px";
        resetBtn.style.zIndex = "1";
        resetBtn.style.padding = "6px 10px";
        resetBtn.style.borderRadius = "10px";
        resetBtn.style.border = "1px solid #e5e7eb";
        resetBtn.style.background = "#ffffff";
        resetBtn.style.fontSize = "12px";
        resetBtn.style.cursor = "pointer";
        resetBtn.style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)";
        mapContainer.current.appendChild(resetBtn);

        const map = new maplibregl.Map({
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

        // Prevent world wrap and panning too far
        map.setMaxBounds([[-180, -85], [180, 85]]);

        // Helper: fit to selected feature bounds
        const fitToFeature = () => {
          try {
            const coords: number[][] = [];
            const pushCoords = (geom: any) => {
              if (geom.type === "Polygon") {
                geom.coordinates.flat(1).forEach((c: number[]) => coords.push(c));
              } else if (geom.type === "MultiPolygon") {
                geom.coordinates.flat(2).forEach((c: number[]) => coords.push(c));
              }
            };
            if (feature?.geometry) pushCoords(feature.geometry);

            if (coords.length) {
              const lngs = coords.map(c => c[0]);
              const lats = coords.map(c => c[1]);
              const sw: [number, number] = [Math.min(...lngs), Math.min(...lats)];
              const ne: [number, number] = [Math.max(...lngs), Math.max(...lats)];
              map.fitBounds([sw, ne], { padding: 40, duration: 600, maxZoom: 6 });
            } else {
              map.easeTo({ center: [0, 20], zoom: 1.8, duration: 600 });
            }
          } catch {
            map.easeTo({ center: [0, 20], zoom: 1.8, duration: 600 });
          }
        };

        resetBtn.onclick = () => fitToFeature();

        map.on("load", () => {
          map.addSource("region", {
            type: "geojson",
            data: filteredGeojson
          });

          const risk = regionData[selectedRegion]?.risk_zone || "Warning";

          // Fill
          map.addLayer({
            id: "region-fill",
            type: "fill",
            source: "region",
            paint: {
              "fill-color": REGION_COLORS[risk],
              "fill-opacity": 0.0,
              "fill-outline-color": REGION_COLORS[risk]
            }
          });

          // Glow
          map.addLayer({
            id: "region-glow",
            type: "line",
            source: "region",
            paint: {
              "line-color": REGION_COLORS[risk],
              "line-width": 10,
              "line-opacity": 0.14
            }
          });

          // Outline
          map.addLayer({
            id: "region-outline",
            type: "line",
            source: "region",
            paint: {
              "line-color": "#222",
              "line-width": 2,
              "line-dasharray": [4, 3]
            }
          });

          // Hover feedback and tooltip
          map.on("mouseenter", "region-fill", () => (map.getCanvas().style.cursor = "pointer"));
          map.on("mouseleave", "region-fill", () => {
            map.getCanvas().style.cursor = "";
            tooltip.style.display = "none";
          });
          map.on("mousemove", "region-fill", (e: any) => {
            const pt = e.point;
            tooltip.style.left = `${pt.x}px`;
            tooltip.style.top = `${pt.y}px`;
            tooltip.style.display = "block";
            tooltip.innerHTML = `
              <div style="display:flex;align-items:center;gap:8px;">
                <span style="display:inline-block;width:10px;height:10px;border-radius:9999px;background:${REGION_COLORS[risk]};"></span>
                <span style="font-weight:600;">${selectedRegion}</span>
                <span style="opacity:.8;">• ${risk}</span>
              </div>
            `;
          });

          // Animate fill opacity
          let t = 0;
          const target = 0.68;
          const step = () => {
            t = Math.min(target, t + 0.06);
            map.setPaintProperty("region-fill", "fill-opacity", t);
            if (t < target) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);

          // Initial fit
          fitToFeature();
        });

        return () => {
          map.remove();
          // Clean DOM additions on unmount/change
          tooltip.remove();
          resetBtn.remove();
        };
      });

    // Cleanup mount container children on change
    return () => {
      if (mapContainer.current) {
        while (mapContainer.current.firstChild) {
          mapContainer.current.removeChild(mapContainer.current.firstChild);
        }
      }
    };
  }, [selectedRegion, regionData]);

  return (
    <div className="rounded-2xl overflow-hidden bg-white shadow" style={{ height: "400px", width: "100%", position: "relative" }}>
      <div ref={mapContainer} style={{ width: "100%", height: "100%" }} />
    </div>
  );
}
