// src/App.jsx
import React, { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";

const App = () => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    mapRef.current = new maplibregl.Map({
      container: mapContainerRef.current,
      style: "https://demotiles.maplibre.org/style.json",
      center: [0, 0],
      zoom: 1.5,
      pitch: 45,
      bearing: 0,
      projection: "globe",
    });

    mapRef.current.on("load", async () => {
      mapRef.current.setFog({});

      const response = await fetch("/migration_data.geojson");
      const geojson = await response.json();

      mapRef.current.addSource("migration-points", {
        type: "geojson",
        data: geojson,
      });

      // Gray markers visible at low zoom
      mapRef.current.addLayer({
        id: "gray-cluster-layer",
        type: "circle",
        source: "migration-points",
        minzoom: 0,
        maxzoom: 4,
        paint: {
          "circle-radius": 4,
          "circle-color": "#888",
          "circle-opacity": 0.6,
        },
      });

      // Color markers appear when zoomed in
      mapRef.current.addLayer({
        id: "migration-colored-layer",
        type: "circle",
        source: "migration-points",
        minzoom: 4,
        paint: {
          "circle-radius": 6,
          "circle-color": [
            "match",
            ["get", "Zone_Class"],
            "Red", "#e53935",
            "Warning", "#fb8c00",
            "Green", "#43a047",
            "#9e9e9e", // fallback
          ],
          "circle-stroke-width": 1,
          "circle-stroke-color": "#fff",
        },
      });
    });

    return () => {
      mapRef.current?.remove();
    };
  }, []);

  return (
    <div className="app-container">
      <h1 className="sr-only">Bird Migration Globe</h1>
      <div className="map-container" ref={mapContainerRef}></div>
    </div>
  );
};

export default App;
