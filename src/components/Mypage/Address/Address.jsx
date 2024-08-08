import React from 'react';
import DaumPostcode from 'react-daum-postcode';
import styles from './Address.module.css';

const AddressModal = ({ onClose, onComplete }) => {
  return (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <DaumPostcode onComplete={onComplete} />
        <button className={styles.button} onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default AddressModal;
