import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './MainAttendance.module.css';
import { useAttendanceStore } from '../../../store/attendance_store';

const serverUrl = process.env.REACT_APP_SERVER_URL;

const MainAttendance = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [attendanceData, setAttendanceData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [forceUpdate, setForceUpdate] = useState(false);  // 강제 리렌더링을 위한 상태

  const {
    fetchDepartmentMembers,
    departmentMembers,
    clearDepartmentMembers
  } = useAttendanceStore();

  const usersSeq = sessionStorage.getItem("usersSeq");

  // 출근 데이터를 불러오는 함수
  const loadAttendanceData = async () => {
    try {
      if (usersSeq && departmentMembers.length > 0) {
        const formattedDate = currentDate.toLocaleDateString('en-CA');
        const response = await axios.get(`${serverUrl}/attendance/departmentEvents`, {
          params: { users_seq: usersSeq, date: formattedDate },
          headers: {
            'Cache-Control': 'no-cache', // 캐시 무효화 헤더 추가
          }
        });

        const attendanceEvents = Array.isArray(response.data) ? response.data : [];
        const updatedAttendanceData = departmentMembers.map((member) => {
          const attendanceRecord = attendanceEvents.find(event => String(event.users_seq) === String(member.USERSSEQ));
          let status = '미출석';
          if (attendanceRecord) {
            if (attendanceRecord.status === '연차') {
              status = '휴가';
            } else if (attendanceRecord.check_in_time) {
              status = '출근 완료';
            }
          }
          return { ...member, status: status, check_in_time: attendanceRecord ? attendanceRecord.check_in_time : null };
        });
        setAttendanceData(updatedAttendanceData);
      }
    } catch (error) {
      console.error('Error fetching department events:', error);
    }
  };

  // 초기 데이터 로드
  useEffect(() => {
    const initializeData = async () => {
      setIsLoading(true);
      try {
        clearDepartmentMembers();  // 부서원 정보 초기화
        await fetchDepartmentMembers();  // 부서원 정보 불러오기
        setForceUpdate(prev => !prev);  // 강제 리렌더링을 트리거
      } catch (error) {
        console.error('Error loading initial data:', error);
      } finally {
        setIsLoading(false);  // 로딩 상태 해제
      }
    };

    if (usersSeq) {
      initializeData();  // usersSeq가 있을 때만 초기화
    }
  }, [usersSeq, currentDate]);  // usersSeq, currentDate 변경 시 실행

  // 강제 리렌더링이 발생할 때 출근 현황 데이터를 새로 불러오기
  useEffect(() => {
    if (departmentMembers.length > 0) {
      loadAttendanceData();
    }
  }, [departmentMembers, forceUpdate]);  // departmentMembers 또는 forceUpdate 변경 시 실행

  // 시간을 포맷하는 함수
  const formatTime = (dateTime) => {
    if (!dateTime) return '-';
    const date = new Date(dateTime);
    const hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  return (
    <div className={styles.container}>
      <div className={styles.attendanceContainer}>
        <h2>출근 현황</h2>
        {isLoading ? (
          <p>출근 기록을 불러오는 중입니다...</p>
        ) : attendanceData.length > 0 ? (
          attendanceData.map((employee, index) => (
            <div key={index} className={styles.attendance_item}>
              <div className={styles.attendance_label}>{employee.USERSNAME}</div>
              <div className={styles.attendance_status}>{employee.status}</div>
              <div className={styles.attendance_time}>{employee.check_in_time ? formatTime(employee.check_in_time) : '-'}</div>
            </div>
          ))
        ) : (
          <p>같은 부서 인원 없음</p>
        )}
      </div>

      <div className={styles.profileContainer}>
        <h2>부서 프로필</h2>
        {departmentMembers.length > 0 ? (
          departmentMembers.map((member, index) => (
            <div key={index} className={styles.profile_item}>
              <div className={styles.profile_name}>{member.USERSNAME}</div>
              <div className={styles.profile_email}>{member.USERSEMAIL}</div>
              <div className={styles.profile_phone}>{member.PHONENUMBER}</div>
            </div>
          ))
        ) : (
          <p>부서원 정보가 없습니다</p>
        )}
      </div>
    </div>
  );
};

export default MainAttendance;
