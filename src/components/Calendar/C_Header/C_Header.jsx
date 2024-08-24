import React from 'react';
import styles from './C_Header.module.css';

const C_Header = () => {
  return (
    <header className={styles.headerContainer}>
      <div className={styles.logo}>Firmware</div>
    </header>
  );
};

export default C_Header;
