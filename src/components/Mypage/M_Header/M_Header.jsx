import React from 'react';
import styles from './M_Header.module.css';

const M_Header = () => {
  return (
    <header className={styles.headerContainer}>
      <div className={styles.logo}>Firmware</div>
    </header>
  );
};

export default M_Header;
