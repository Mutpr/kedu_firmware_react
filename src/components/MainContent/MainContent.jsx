import MainAttendance from './MainAttendance/MainAttendance';
import styles from './MainContent.module.css';
import MainVacation from './MainVacation/MainVacation';
import MainCalendar from './MainCalendar/MainCalendar';  // 새로 추가된 컴포넌트 임포트
import React, { useEffect, useState } from 'react';
import MainBoard from '../MainContent/MainBoard/MainBoard';


const MainContent = (category) => {
  return (
    <main className={styles.main_content}>
      <section className={styles.content}>
        <div className={styles.left_column}>
          <MainCalendar />  {/* 기존 캘린더 코드를 이 컴포넌트로 대체 */}
          <div className={styles.notice}>
            <MainBoard  category={category} />
        
          </div>
        </div>
        <div className={styles.right_column}>
          <div className={styles.attendance}>
            {/* 출근 현황 및 부서 */}
            <MainAttendance/>
            {/*  */}
          </div>
        </div>
      </section>
    </main>
  );
};

export default MainContent;
