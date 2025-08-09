import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import styles from '../styles/Map.module.css';
import L from 'leaflet';

// Fix default icon issues in Leaflet with Webpack/Next.js:
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/icons/marker-icon-2x.png',
  iconUrl: '/icons/marker-icon.png',
  shadowUrl: '/icons/marker-shadow.png',
});

export default function BirdMigrationMap({ birdLocations }) {
  // birdLocations: array of objects with { id, species, latitude, longitude, info }

  return (
    <div className={styles.mapContainer}>
      <MapContainer
        center={[20, 0]} // starting center - adjust based on your data
        zoom={2}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {birdLocations.map(({ id, species, latitude, longitude, info }) => (
          <Marker key={id} position={[latitude, longitude]}>
            <Popup>
              <strong>{species}</strong><br />
              {info}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
