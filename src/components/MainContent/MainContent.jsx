import styles from './MainContent.module.css';

const MainContent = () => {
  return (
    <main className={styles.main_content}>
      <section className={styles.content}>
        <div className={styles.left_column}>
          <div className={styles.calendar}>
            <h2>내 캘린더 일정</h2>
            <div className={styles.calendar_item}>
              <div className={styles.date}>2024-08-23</div>
              <div className={styles.event}>팀 회의</div>
              <div className={styles.time}>14:00 - 16:00</div>
            </div>
            <div className={styles.calendar_item}>
              <div className={styles.date}>2024-08-24</div>
              <div className={styles.event}>클라이언트 미팅</div>
              <div className={styles.time}>11:00 - 12:00</div>
            </div>
            <div className={styles.calendar_item}>
              <div className={styles.date}>2024-08-25</div>
              <div className={styles.event}>연차 휴가</div>
              <div className={styles.time}>종일</div>
            </div>
          </div>
          <div className={styles.notice}>
            <h2>공지사항</h2>
            <div className={styles.notice_item}>
              <div className={styles.category}>[공지]</div>
              <div className={styles.title}>사내 교육 일정 안내</div>
              <div className={styles.notice_date}>2024-08-22</div>
            </div>
            <div className={styles.notice_item}>
              <div className={styles.category}>[공지]</div>
              <div className={styles.title}>연말 행사 안내</div>
              <div className={styles.notice_date}>2024-08-20</div>
            </div>
            <div className={styles.notice_item}>
              <div className={styles.category}>[공지]</div>
              <div className={styles.title}>휴가 계획 제출 요청</div>
              <div className={styles.notice_date}>2024-08-18</div>
            </div>
          </div>
        </div>
        <div className={styles.right_column}>
          <div className={styles.attendance}>
            <h2>출근 현황</h2>
            <div className={styles.attendance_item}>
              <div className={styles.attendance_label}>홍길동</div>
              <div className={styles.attendance_status}>출근 완료</div>
              <div className={styles.attendance_time}>08:30</div>
            </div>
            <div className={styles.attendance_item}>
              <div className={styles.attendance_label}>이영희</div>
              <div className={styles.attendance_status}>출근 완료</div>
              <div className={styles.attendance_time}>09:00</div>
            </div>
            <div className={styles.attendance_item}>
              <div className={styles.attendance_label}>김철수</div>
              <div className={styles.attendance_status}>지각</div>
              <div className={styles.attendance_time}>09:20</div>
            </div>
          </div>
          <div className={styles.vacation}>
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
        </div>
      </section>
    </main>
  );
};

export default MainContent;
