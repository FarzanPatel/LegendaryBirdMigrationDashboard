import React from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import styles from '../styles/MigrationMap.module.css';

const MigrationMap = ({ birds }) => {
  if (!birds || birds.length === 0) {
    return <p>No migration routes to display.</p>;
  }

  const position = [20, 0]; // Center of the map (roughly)

  return (
    <MapContainer center={position} zoom={2} scrollWheelZoom={true} className={styles.map}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      {birds.map((bird, idx) => {
        const start = [bird.Start_Latitude, bird.Start_Longitude];
        const end = [bird.End_Latitude, bird.End_Longitude];

        return (
          <React.Fragment key={idx}>
            <Marker position={start}>
              <Popup>
                <b>Start:</b> {bird.Species} at [{bird.Start_Latitude}, {bird.Start_Longitude}]
              </Popup>
            </Marker>
            <Marker position={end}>
              <Popup>
                <b>End:</b> {bird.Species} at [{bird.End_Latitude}, {bird.End_Longitude}]
              </Popup>
            </Marker>
            <Polyline positions={[start, end]} color="blue" />
          </React.Fragment>
        );
      })}
    </MapContainer>
  );
};

export default MigrationMap;
