import React, { useEffect, useState } from 'react';
import { useCalendarStore, useAuthStore } from '../../../store/store';
import axios from 'axios';
import DatePicker, { registerLocale } from 'react-datepicker';
import ko from 'date-fns/locale/ko'; // 한국어 로케일 임포트
import 'react-datepicker/dist/react-datepicker.css';
import styles from './MainCalendar.module.css';
import Pagination from '../../Pagination/Pagination';

const serverUrl = process.env.REACT_APP_SERVER_URL;

axios.defaults.withCredentials = true;

// 한국어 로케일 등록
registerLocale('ko', ko);

const MainCalendar = () => {
  const events = useCalendarStore((state) => state.events);
  const setEvents = useCalendarStore((state) => state.setEvents);
  const usersName = useAuthStore((state) => state.usersName);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // 페이지 당 항목 수
  const [selectedDate, setSelectedDate] = useState(new Date()); // 선택된 날짜

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const response = await axios.get(`${serverUrl}/events`);
        const sortedEvents = response.data.sort((a, b) => new Date(a.eventsStartDate) - new Date(b.eventsStartDate));
        setEvents(sortedEvents);
      } catch (error) {
        console.error('Error loading events:', error);
      }
    };

    loadEvents();
  }, [setEvents]);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleMonthChange = (date) => {
    setSelectedDate(date);
    setCurrentPage(1); // 페이지를 1로 리셋
  };

  const filteredEvents = events.filter(event => {
    const eventDate = new Date(event.eventsStartDate);
    return (
      eventDate.getMonth() === selectedDate.getMonth() &&
      eventDate.getFullYear() === selectedDate.getFullYear()
    );
  });

  // 페이지별로 항목을 나누는 로직
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentEvents = filteredEvents.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);

  return (
    <div className={styles.calendar}>
      <div className={styles.header}>
        <h2>{selectedDate.getFullYear()}년 {selectedDate.getMonth() + 1}월 일정</h2>
        <div className={styles.actions}>
          <DatePicker
            selected={selectedDate}
            onChange={handleMonthChange}
            dateFormat="yyyy년 MM월"
            showMonthYearPicker
            showFullMonthYearPicker
            className={styles.datePicker} // 스타일을 추가하려면 클래스 지정
            locale="ko" // 한국어 로케일 설정
          />
        </div>
      </div>
      <div className={styles.eventsList}>
        {currentEvents.length === 0 ? (
          <p>일정이 없습니다.</p>
        ) : (
          currentEvents.map((event) => (
            <div key={event.eventsSeq} className={styles.calendar_item}>
              <div className={styles.date}>{formatDate(event.eventsStartDate)}</div>
              <div className={styles.event}>{event.eventsTitle}</div>
              <div className={styles.location}>{usersName}</div>
              <div className={styles.time}>
                {formatTime(event.eventsStartDate)} - {formatTime(event.eventsEndDate)}
              </div>
            </div>
          ))
        )}
      </div>
      <Pagination 
        currentPage={currentPage} 
        totalPages={totalPages} 
        handlePageChange={(page) => setCurrentPage(page)} 
      />
    </div>
  );
};

export default MainCalendar;
