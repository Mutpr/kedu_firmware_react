import React, { useState, useEffect } from 'react';
import styles from './AttendanceManagement.module.css';
import { useAttendanceStore } from '../../../store/attendance_store';

const AttendanceManagement = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { fetchEvents, events, fetchAttendanceStatus, dates, setDates } = useAttendanceStore(); // 스토어에서 직접 events 사용

  useEffect(() => {
    updateDates(currentDate);
  }, [currentDate]);

  useEffect(() => {
    if (dates.length > 0) {
      const usersSeq = sessionStorage.getItem("usersSeq");
      if (usersSeq) {
        fetchEvents(usersSeq, dates[0], dates[dates.length - 1]); // 이벤트 데이터 갱신 되는 부분
      }
    }
  }, [dates, fetchEvents]); // fetchEvent가 일어나야 할때마다 (일정이 수정될때) 실행되도록한다.

  // 출석 확인 여부 체크
  useEffect(() => {
    const usersSeq = sessionStorage.getItem("usersSeq");
    if (usersSeq) {
      fetchAttendanceStatus(usersSeq).then((result) => {
        console.log("Check-In Time:", result.checkIn);
        console.log("Check-Out Time:", result.checkOut);
      });
    }
  }, []);

  const updateDates = (date) => {
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = day === 0 ? -6 : 1 - day; // 월요일이 주의 시작이 되도록 설정

    startOfWeek.setDate(startOfWeek.getDate() + diff);

    const datesArray = [];
    for (let i = 0; i < 7; i++) {
      const newDate = new Date(startOfWeek);
      newDate.setDate(startOfWeek.getDate() + i);
      datesArray.push(newDate.toISOString().split('T')[0]);
    }

    setDates(datesArray);
  };

  const handlePrevWeek = () => {
    const prevWeek = new Date(currentDate);
    prevWeek.setDate(prevWeek.getDate() - 7);
    setCurrentDate(prevWeek);
  };

  const handleNextWeek = () => {
    const nextWeek = new Date(currentDate);
    nextWeek.setDate(nextWeek.getDate() + 7);
    setCurrentDate(nextWeek);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.getDate();
  };

  const formatDayAndDate = (dateStr) => {
    const date = new Date(dateStr);
    const day = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()];
    const dayNum = date.getDate();
    return `${day} ${dayNum}`;
  };

  const getFormattedDateRange = () => {
    const start = new Date(dates[0]);
    const end = new Date(dates[dates.length - 1]);
    return `${start.getFullYear()}.${start.getMonth() + 1}.${start.getDate()} - ${end.getFullYear()}.${end.getMonth() + 1}.${end.getDate()}`;
  };

  const workHours = Array.from({ length: 24 }, (_, i) => i); // 0부터 23까지의 시간 배열

  const isEventInTimeRange = (event, time) => {
    return event.startTime <= time && event.endTime > time || event.startTime === event.endTime && event.startTime === time;
  };

  const formatTime = (dateTime) => {
    const date = new Date(dateTime);
    return `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
};

const getColSpan = (event) => {
  if (!event.check_out_time) return 1; // 퇴근 시간이 없으면 한 칸만 표시

  const startTime = new Date(event.check_in_time).getHours();
  const endTime = new Date(event.check_out_time).getHours();

  const span = endTime - startTime;

  return span >= 1 ? span : 1; // 1시간 이상일 경우 해당 칸 수, 그렇지 않으면 1칸만 차지
};

const getEventStyle = (event) => {
  if (event.status === '연차') {
    const styleClass = event.vacation_application_status === 'A'
      ? styles.approvedLeave
      : styles.pendingLeave;
    console.log('Event Style Class:', styleClass);  // 클래스 이름 확인 로그
    return `${styles.selected} ${styleClass}`;  // selected와 결합된 클래스 반환
  }
  return styles.selected;  // 기본 스타일 반환
};




const getEventTitle = (event) => {
  // 연차인 경우 텍스트 변경 (승인 여부에 따라 텍스트 다르게 설정)
  console.log(event.vacation_application_status);
  if (event.status === '연차') {
    return event.vacation_application_status === 'A'
      ? '연차 (승인)'  // 승인된 경우
      : '연차 (미승인)';  // 미승인된 경우
  }
  return event.title;  // 기본 텍스트
};


return (
  <div className={styles.Container}>
    <div className={styles.app}>
      <div className={styles.header}>
        <button onClick={handlePrevWeek}>{"<"}</button>
        <span>{getFormattedDateRange()}</span>
        <button onClick={handleNextWeek}>{">"}</button>
        <button onClick={handleToday}>오늘</button>
      </div>
      <div className={styles.calendar}>
        {/* 시간 열 (헤더) */}
        <div className={styles.timeRow}>
          <div className={styles.dayCell}></div> {/* 요일이 들어갈 공간 */}
          {workHours.map(time => (
            <div key={time} className={`${styles.timeCell} ${time >= 9 && time <= 18 ? styles.workHour : ''}`}>
              {time}
            </div>
          ))}
        </div>

        {/* 날짜와 이벤트 */}
        {dates.map(date => (
          <div className={styles.dateRow} key={date}>
            <div className={styles.dayCell}>{formatDayAndDate(date)}</div> {/* 요일 */}
            {workHours.map(time => {
              const event = events.find(event => event.attendance_date === date && isEventInTimeRange(event, time));
              if (event && event.startTime === time) {
                return (
                  <div key={time} className={`${styles.selected} ${getEventStyle(event)}`} style={{ gridColumnEnd: `span ${getColSpan(event)}` }}>
                    <div className={styles.event}>
                      {getEventTitle(event)} <br />
                      {formatTime(event.check_in_time)} 
                      {event.check_out_time && ` - ${formatTime(event.check_out_time)}`}
                    </div>
                  </div>
                );
              }
              if (event && event.startTime < time && event.endTime > time) {
                return null;
              }
              return <div key={time} className={styles.cell}></div>;
            })}
          </div>
        ))}
      </div>
    </div>
  </div>
);
};

export default AttendanceManagement;
