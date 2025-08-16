import React, { useEffect, useRef } from "react";
import maplibregl, { GeoJSONSource } from "maplibre-gl";
import type { FeatureCollection, Feature, Geometry, GeoJsonProperties } from "geojson";

const MAP_STYLE = "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"; // reliable basemap

const REGION_COLORS: Record<string, string> = {
  north: "#ff0000",
  south: "#0000ff",
  east: "#00ff00",
  west: "#ff00ff",
  // add your region colors here
};

interface RegionMapProps {
  regionFC: FeatureCollection<Geometry, GeoJsonProperties>;
  viewMode: string;
}

const RegionMap: React.FC<RegionMapProps> = ({ regionFC, viewMode }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (map.current) return; // initialize map only once

    map.current = new maplibregl.Map({
      container: mapContainer.current!,
      style: MAP_STYLE,
      center: [-98, 38], // USA center
      zoom: 3,
    });

    map.current.on("load", () => {
      if (!map.current) return;

      // Add the region source with the passed FeatureCollection
      map.current.addSource("region", {
        type: "geojson",
        data: regionFC,
      });

      // Add a fill layer using the region source
      map.current.addLayer({
        id: "region-fill",
        type: "fill",
        source: "region",
        paint: {
          "fill-color": [
            "match",
            ["get", "region_name"], // or appropriate property key in your features
            ...Object.entries(REGION_COLORS).flat(),
            "#888888", // fallback color
          ],
          "fill-opacity": viewMode === "detailed" ? 0.7 : 0.3,
        },
      });

      // Optionally add outline or other layers here
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
      // Update source data dynamically
      regionSource.setData(regionFC);
    }

    // Update layer paint properties dynamically
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
