import React from 'react';
import styles from '../styles/BirdCard.module.css';

export default function BirdCard({ species, migration_reason, habitat, weather_condition }) {
  return (
    <div className={styles.birdCard}>
      <h3 className={styles.birdName}>{species}</h3>
      <p className={styles.birdDetails}><strong>Migration Reason:</strong> {migration_reason}</p>
      <p className={styles.birdDetails}><strong>Habitat:</strong> {habitat}</p>
      <p className={styles.birdDetails}><strong>Weather Condition:</strong> {weather_condition}</p>
    </div>
  );
}
