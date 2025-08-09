import React from 'react';
import styles from '../styles/BirdList.module.css';

export default function BirdList({ birds }) {
  if (!birds || birds.length === 0) {
    return <p>No bird migration data available.</p>;
  }

  return (
    <aside className={styles.birdList}>
      {birds.map(({ id, species, migration_reason, habitat, weather_condition }) => (
        <div key={id} className={styles.birdListItem}>
          <h3>{species}</h3>
          <p><strong>Reason:</strong> {migration_reason}</p>
          <p><strong>Habitat:</strong> {habitat}</p>
          <p><strong>Weather:</strong> {weather_condition}</p>
        </div>
      ))}
    </aside>
  );
}
