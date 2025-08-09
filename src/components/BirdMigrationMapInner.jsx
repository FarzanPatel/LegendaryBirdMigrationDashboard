// BirdMigrationMapInner.jsx (regular map code, same as before)
import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import styles from '../styles/Map.module.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/icons/marker-icon-2x.png',
  iconUrl: '/icons/marker-icon.png',
  shadowUrl: '/icons/marker-shadow.png',
});

export default function BirdMigrationMapInner({ birdLocations }) {
  return (
    <div className={styles.mapContainer}>
      <MapContainer
        center={[20, 0]}
        zoom={2}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
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
