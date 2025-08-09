import React from 'react';
import styles from '../styles/LoadingSpinner.module.css';

export default function LoadingSpinner() {
  return (
    <div className={styles.spinner}>
      <div className={styles.doubleBounce1}></div>
      <div className={styles.doubleBounce2}></div>
    </div>
  );
}
