import React, { useEffect, useRef } from "react";
import maplibregl, { GeoJSONSource } from "maplibre-gl";
import type { FeatureCollection, Geometry, GeoJsonProperties } from "geojson";

const MAP_STYLE = "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";

const REGION_COLORS: Record<string, string> = {
  north: "#ff0000",
  south: "#0000ff",
  east: "#00ff00",
  west: "#ff00ff",
};

interface RegionMapProps {
  regionFC: FeatureCollection<Geometry, GeoJsonProperties>;
  viewMode: string;
}

const RegionMap: React.FC<RegionMapProps> = ({ regionFC, viewMode }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current!,
      style: MAP_STYLE,
      center: [-98, 38],
      zoom: 3,
    });

    map.current.on("load", () => {
      if (!map.current) return;

      map.current.addSource("region", {
        type: "geojson",
        data: regionFC,
      });

      map.current.addLayer({
        id: "region-fill",
        type: "fill",
        source: "region",
        paint: {
          "fill-color": [
            "match",
            ["get", "region_name"],
            ...Object.entries(REGION_COLORS).reduce<(string | string)[]>((acc, [key, color]) => {
              acc.push(key, color);
              return acc;
            }, []),
            "#888888", // fallback color
          ],
          "fill-opacity": viewMode === "detailed" ? 0.7 : 0.3,
        },
      });
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!map.current) return;

    const regionSource = map.current.getSource("region") as GeoJSONSource | undefined;
    if (regionSource) {
      regionSource.setData(regionFC);
    }

    if (map.current.getLayer("region-fill")) {
      map.current.setPaintProperty(
        "region-fill",
        "fill-opacity",
        viewMode === "detailed" ? 0.7 : 0.3
      );
    }
  }, [regionFC, viewMode]);

  return <div ref={mapContainer} style={{ width: "100%", height: "100%" }} />;
};

export default RegionMap;
