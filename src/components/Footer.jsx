import React from 'react';
import styles from '../styles/Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      &copy; {new Date().getFullYear()} Bird Migration Dashboard. All rights reserved.
    </footer>
  );
}
