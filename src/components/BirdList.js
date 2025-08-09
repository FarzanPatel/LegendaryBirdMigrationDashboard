import React from 'react';
import BirdCard from './BirdCard';
import styles from '../styles/BirdList.module.css';

const BirdList = ({ birds }) => {
  if (!birds || birds.length === 0) {
    return <p>No bird migration data available.</p>;
  }

  return (
    <div className={styles.list}>
      {birds.map((bird, index) => (
        <BirdCard key={index} bird={bird} />
      ))}
    </div>
  );
};

export default BirdList;
