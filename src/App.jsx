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
      zoom: 2.5, // Zoomed in slightly more
      pitch: 45,
      bearing: 0,
      projection: "globe",
    });

    mapRef.current.on("load", async () => {
      mapRef.current.setFog({});

      try {
        const response = await fetch("/migration_data.geojson");
        const geojson = await response.json();
        console.log("GeoJSON data loaded:", geojson); // ✅ Debug log

        mapRef.current.addSource("migration-points", {
          type: "geojson",
          data: geojson,
        });

        mapRef.current.addLayer({
          id: "migration-points-layer",
          type: "circle",
          source: "migration-points",
          paint: {
            "circle-radius": 10, // ✅ Easier to see
            "circle-color": [
              "match",
              ["get", "Zone_Class"],
              "Red", "#e53935",
              "Warning", "#fb8c00",
              "Green", "#43a047",
              "#9e9e9e"
            ],
            "circle-stroke-width": 1,
            "circle-stroke-color": "#fff",
          },
        });
      } catch (error) {
        console.error("Error loading GeoJSON:", error);
      }
    });

    return () => {
      mapRef.current?.remove();
    };
  }, []);

  return (
    <div className="app-container">
      <h1 className="sr-only" aria-hidden="true">Bird Migration Globe</h1>
      <div className="map-container" ref={mapContainerRef}></div>
    </div>
  );
};

export default App;
