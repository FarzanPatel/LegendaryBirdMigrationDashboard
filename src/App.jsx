import React, { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";

const App = () => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    mapRef.current = new maplibregl.Map({
      container: mapContainerRef.current,
      style: "https://demotiles.maplibre.org/style.json", // MapLibre basemap
      center: [0, 0],
      zoom: 1.5,
      pitch: 45,
      bearing: 0,
      projection: "globe",
    });

    mapRef.current.on("load", () => {
      mapRef.current.setFog({}); // Enable atmospheric fog

      // Example layer for debugging
      mapRef.current.addSource("random-points", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [
            {
              type: "Feature",
              geometry: { type: "Point", coordinates: [78.9629, 20.5937] },
              properties: { label: "Example Bird" },
            },
          ],
        },
      });

      mapRef.current.addLayer({
        id: "points-layer",
        type: "circle",
        source: "random-points",
        paint: {
          "circle-radius": 6,
          "circle-color": "#ff5722",
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
