import React from 'react';
import styles from '../styles/BirdCard.module.css';

const BirdCard = ({ bird }) => {
  return (
    <div className={styles.card}>
      <h3>{bird.Species}</h3>
      <p><strong>Habitat:</strong> {bird.Habitat}</p>
      <p><strong>Weather Condition:</strong> {bird.Weather_Condition}</p>
      <p><strong>Migration Reason:</strong> {bird.Migration_Reason}</p>
      <p>
        <strong>From:</strong> {bird.Start_Latitude}, {bird.Start_Longitude}
      </p>
      <p>
        <strong>To:</strong> {bird.End_Latitude}, {bird.End_Longitude}
      </p>
    </div>
  );
};

export default BirdCard;
