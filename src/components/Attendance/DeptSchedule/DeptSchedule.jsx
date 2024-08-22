import React, { useState, useEffect } from 'react';
import styles from './DeptSchedule.module.css'; 
import { useAttendanceStore } from '../../../store/attendance_store';

const DeptSchedule = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const { fetchDepartmentEvents, departmentEvents, fetchDepartmentMembers, departmentMembers } = useAttendanceStore();

    useEffect(() => {
        fetchDepartmentMembers();  // 부서원 정보 조회

        const usersSeq = sessionStorage.getItem("usersSeq"); // usersSeq를 세션에서 가져옴
        if (usersSeq) {
            // 선택한 날짜를 로컬 시간 기준으로 `YYYY-MM-DD` 형식으로 포맷팅
            const formattedDate = currentDate.toLocaleDateString('en-CA');  // `en-CA`는 'YYYY-MM-DD' 형식
            fetchDepartmentEvents(usersSeq, formattedDate);  // 이벤트 조회
        }
    }, [currentDate]);

    const handlePrevDay = () => {
        const prevDay = new Date(currentDate);
        prevDay.setDate(prevDay.getDate() - 1);  // 이전 날짜로 설정
        setCurrentDate(prevDay);
    };

    const handleNextDay = () => {
        const nextDay = new Date(currentDate);
        nextDay.setDate(nextDay.getDate() + 1);  // 다음 날짜로 설정
        setCurrentDate(nextDay);
    };

    const handleToday = () => {
        setCurrentDate(new Date());  // 오늘 날짜로 설정
    };

    const formatDayAndDate = (dateStr) => {
        const date = new Date(dateStr);
        const year = date.getFullYear();  // 년도
        const month = String(date.getMonth() + 1).padStart(2, '0');  // 월 (1월은 0이므로 1을 더함)
        const day = String(date.getDate()).padStart(2, '0');  // 날짜
        return `${year}.${month}.${day}`;  // "년.월.일" 형식으로 반환
    };
    

    const workHours = Array.from({ length: 24 }, (_, i) => i);

    const isEventInTimeRange = (event, time) => {
        return event.startTime <= time && event.endTime > time || event.startTime === event.endTime && event.startTime === time;
    };

    const formatTime = (dateTime) => {
        const date = new Date(dateTime);
        return `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;  // 시간을 'HH:MM' 형식으로 포맷팅
    };

    const getColSpan = (event) => {
        const span = event.endTime - event.startTime;
        return span >= 1 ? span : 1;
    };

    return (
        <div className={styles.container}>
            <div className={styles.app}>
                <div className={styles.header}>
                    <button onClick={handlePrevDay}>{"<"}</button>
                    <span>{formatDayAndDate(currentDate.toISOString())}</span>
                    <button onClick={handleNextDay}>{">"}</button>
                    <button onClick={handleToday}>오늘</button>
                </div>
                <div className={styles.calendar}>
                    <div className={styles.timeRow}>
                        <div className={styles.memberCell}></div> {/* 부서원 이름 열 */}
                        {workHours.map(time => (
                            <div key={time} className={`${styles.timeCell} ${time >= 9 && time <= 18 ? styles.workHour : ''}`}>
                                {time}
                            </div>
                        ))}
                    </div>
                    {Array.isArray(departmentMembers) && departmentMembers.map((member, index) => (
                    <div className={styles.dateRow} key={`member-${member.USERSSEQ || index}`}>
                        <div className={styles.memberCell}>{member.USERSNAME || member.name}</div> 
                        {workHours.map((time) => {
                            const event = departmentEvents.find(
                                (event) => event.memberId === member.USERSSEQ && isEventInTimeRange(event, time)
                            );
                            if (event && event.startTime === time) {
                                return (
                                    <div key={`event-${member.USERSSEQ || index}-${time}`} className={styles.selected} style={{ gridColumnEnd: `span ${getColSpan(event)}` }}>
                                        <div className={styles.event}>
                                            {event.title} <br />
                                            {formatTime(event.check_in_time)} - {formatTime(event.check_out_time)}
                                        </div>
                                    </div>
                                );
                            }
                            if (event && event.startTime < time && event.endTime > time) {
                                return null;
                            }
                            return <div key={`cell-${member.USERSSEQ || index}-${time}`} className={styles.cell}></div>;
                        })}
                    </div>
                ))}
                </div>
            </div>
        </div>
    );
};

export default DeptSchedule;
