import React from 'react';
import BirdCard from './BirdCard';
import styles from '../styles/BirdList.module.css';

export default function BirdList({ birds }) {
  if (!birds || birds.length === 0) {
    return <p>No bird migration data available.</p>;
  }

  return (
    <aside className={styles.birdList}>
      {birds.map(({ id, species, migration_reason, habitat, weather_condition }) => (
        <BirdCard
          key={id}
          species={species}
          migration_reason={migration_reason}
          habitat={habitat}
          weather_condition={weather_condition}
        />
      ))}
    </aside>
  );
}
