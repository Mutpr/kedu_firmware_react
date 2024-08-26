import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './MainVacation.module.css';


const serverUrl = process.env.REACT_APP_SERVER_URL;

const MainVacation = () => {

    

    return (
        <div className={styles.VacationContainer}>
            <h2>휴가 현황</h2>
            <div className={styles.vacation_item}>
              <div className={styles.vacation_label}>홍길동</div>
              <div className={styles.vacation_days}>잔여 휴가: 10일</div>
            </div>
            <div className={styles.vacation_item}>
              <div className={styles.vacation_label}>이영희</div>
              <div className={styles.vacation_days}>잔여 휴가: 5일</div>
            </div>
            <div className={styles.vacation_item}>
              <div className={styles.vacation_label}>김철수</div>
              <div className={styles.vacation_days}>잔여 휴가: 7일</div>
            </div>
        </div>

    );
}
export default MainVacation;