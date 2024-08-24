import React, { useState, useEffect } from 'react';
import { Card, Modal, Button } from 'react-bootstrap';
import styles from './AttendanceCardBox.module.css';
import axios from 'axios';
import { useAttendanceStore } from '../../../store/attendance_store';

const serverUrl = process.env.REACT_APP_SERVER_URL;

const AttendanceCardBox = () => {

    // Bootstrap 스타일을 컴포넌트에서만 적용
    useEffect(() => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css';
        document.head.appendChild(link);

        return () => {
            document.head.removeChild(link);
        };
    }, []);
    
    // 현재 선택된 월을 관리하는 state, 초기값은 현재 년-월로 설정
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

    const { fetchEvents, dates } = useAttendanceStore();

    // 출석 데이터 상태를 관리
    // 기존 zustand의 상태 대신 컴포넌트 자체에서 상태 관리로 변경
    const [attendanceData, setAttendanceData] = useState({ daysPresent: 0, daysLate: 0, daysAbsent: 0, earlyLeave: 0 });
    const [vacationList, setVacationList] = useState([]); // 휴가 기록을 저장할 상태
    const [showModal, setShowModal] = useState(false); // 모달 상태 관리
    const [events, setEvents] = useState([]); // 이벤트 상태 관리

    // 입사월보다 이전의 데이터는 '없음'으로 처리하기위해 입사일을 가져옴
    const joinDate = new Date(sessionStorage.getItem('joinDate'));

    // 휴가 승인을 위한 isAdmin
    const [isAdmin, setIsAdmin] = useState(() => sessionStorage.getItem('isAdmin') === 'true'); 

    

    // 선택된 월이 변경될 때마다 출석 데이터를 서버에서 가져옴
    useEffect(() => {
        const fetchAttendanceData = async () => {
            try {
                const usersSeq = sessionStorage.getItem("usersSeq"); // 사용자 ID를 세션에서 가져옴
                // 기존 fetchAttendanceSummary 대신 axios로 직접 데이터 가져오기**
                const response = await axios.get(`${serverUrl}/attendance/checkAttendanceSummary`, {
                    params: { usersSeq, month: selectedMonth }
                });
                setAttendanceData(response.data); // 상태 업데이트 호출
            } catch (error) {
                console.error('Error fetching attendance data:', error); // 에러 발생 시 콘솔에 출력
            }
        };

        fetchAttendanceData(); // 데이터 가져오는 함수 호출
    }, [selectedMonth]); // 선택된 월이 변경될 때마다 useEffect 재실행

    // 휴가 기록을 가져오는 함수
const fetchVacationList = async () => {
    const usersSeq = sessionStorage.getItem("usersSeq");
    try {
        let response;
        if (isAdmin) {
            // 관리자인 경우 모든 유저의 휴가 기록을 가져옴
            response = await axios.get(`/vacation/applications`);
            console.log(response.data);
        } else {
            // 일반 유저의 경우 자신의 휴가 기록만 가져옴
            response = await axios.get(`/vacation/applications/${usersSeq}`);
        }
        setVacationList(response.data);
    } catch (error) {
        console.error('Error fetching vacation list:', error);
    }
};


    // 월 선택을 변경하는 함수
    const handleMonthChange = (e) => {
        const selectedMonthDate = new Date(e.target.value);
        const currentMonthDate = new Date(); // 현재 날짜
    
        // 선택한 월이 입사월 이전이거나 현재 월 이후인 경우
        if ((joinDate && selectedMonthDate < new Date(joinDate.getFullYear(), joinDate.getMonth(), 1)) ||
            (selectedMonthDate > new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth(), 1))) {
            setAttendanceData({ daysPresent: 0, daysLate: 0, daysAbsent: 0, earlyLeave: 0 });
            setSelectedMonth(e.target.value);  // input에 선택한 월 표시
        } else {
            // 정상적으로 데이터를 불러옴
            setSelectedMonth(e.target.value);
        }
    };
    
    
    

    // 모달 열기
    const handleShowModal = () => {
        fetchVacationList(); // 모달을 열기 전에 휴가 기록을 가져옴
        setShowModal(true);
    };

    // 모달 닫기
    const handleCloseModal = () => {
        setShowModal(false);
    };

    const handleDeleteVacation = async (vacationId) => {
        if (window.confirm("정말 해당 휴가 일정을 삭제 하시겠습니까?")) {
            try {
                await axios.delete(`/vacation/delete/${vacationId}`);
                setVacationList(vacationList.filter(vacation => vacation.vacation_application_seq !== vacationId));
                alert('휴가 일정이 삭제되었습니다.');
    
                // 삭제 후 출석 이벤트 데이터를 zustand store에서 다시 불러옴
                const usersSeq = sessionStorage.getItem("usersSeq");
                await fetchEvents(usersSeq, dates[0], dates[dates.length - 1]);
            } catch (error) {
                console.error("휴가 삭제 중 오류 발생:", error);
                alert('휴가 삭제에 실패했습니다.');
            }
        }
    };

    // 휴가 승인 (어드민만)
    const handleApproveVacation = async (vacationId) => {
        if (window.confirm("정말 해당 휴가 일정을 승인하시겠습니까?")) {
            try {
                await axios.post(`/vacation/approve/${vacationId}`);
                alert('휴가가 승인되었습니다.');
                
                // 승인 후 휴가 리스트를 갱신합니다.
                await fetchVacationList();
                
                // 승인 후 출석 데이터를 갱신합니다.
                const usersSeq = sessionStorage.getItem("usersSeq");
                await fetchEvents(usersSeq, dates[0], dates[dates.length - 1]);
            } catch (error) {
                console.error("휴가 승인 중 오류 발생:", error);
                alert('휴가 승인이 실패했습니다.');
            }
        }
    };

    

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
    };

    const getTotalDaysInMonthUntilToday = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth() + 1;
        const lastDay = new Date(year, month, 0).getDate();
        return today.getDate() < lastDay ? today.getDate() : lastDay;
    };

    // 이번달 현재시간까지의 총 결근일 계산 알고리즘
    const calculateAbsenceDays = () => {
        const totalDaysUntilToday = getTotalDaysInMonthUntilToday();
        const absentDays = [];

        for (let day = 1; day <= totalDaysUntilToday; day++) {
            const dateStr = `${selectedMonth}-${String(day).padStart(2, '0')}`;
            const hasEvent = events.some(event => 
                event.attendance_date === dateStr && 
                (event.status === '출근' || event.status === '퇴근' || event.status === '조퇴' || event.status === '지각' || event.status === '연차')
            );

            if (!hasEvent) {
                const dayOfWeek = new Date(dateStr).getDay();
                if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                    absentDays.push(day);
                }
            }
        }
        return absentDays.length;
    };

    const totalDaysPresent = attendanceData.daysPresent + attendanceData.daysLate + attendanceData.earlyLeave;
    const daysAbsent = calculateAbsenceDays();
    const currentMonth = new Date().toISOString().slice(0, 7); // 현재 월
    
    return (
        <div className={styles.Container}>
            
            <div className={styles.Header}>
                {/* 월 선택 input */}
                <input
                    type="month"
                    value={selectedMonth}
                    onChange={handleMonthChange}
                    className={styles.MonthInput}
                />
                {/* 휴가 기록 버튼 */}
                <Button onClick={handleShowModal} className={styles.VacationButton}>휴가 기록</Button>
            </div>

            {/* 출석 정보 카드들 */}
            <div className={styles.CardDiv}>
                <Card className={styles.Card}>
                    <Card.Body>
                        <h6>출석 일수</h6>
                        <h3>{(joinDate && new Date(selectedMonth) < new Date(joinDate.getFullYear(), joinDate.getMonth(), 1)) || (selectedMonth > currentMonth) ? '없음' : `${totalDaysPresent}일`}</h3>
                    </Card.Body>
                </Card>
                <Card className={styles.Card}>
                    <Card.Body>
                        <h6>지각</h6>
                        <h3>{(joinDate && new Date(selectedMonth) < new Date(joinDate.getFullYear(), joinDate.getMonth(), 1)) || (selectedMonth > currentMonth) ? '없음' : `${attendanceData.daysLate}회`}</h3>
                    </Card.Body>
                </Card>
                <Card className={styles.Card}>
                    <Card.Body>
                        <h6>결근</h6>
                        <h3>{(joinDate && new Date(selectedMonth) < new Date(joinDate.getFullYear(), joinDate.getMonth(), 1)) || (selectedMonth > currentMonth) ? '없음' : `${daysAbsent}일`}</h3>
                    </Card.Body>
                </Card>
                <Card className={styles.Card}>
                    <Card.Body>
                        <h6>조퇴</h6>
                        <h3>{(joinDate && new Date(selectedMonth) < new Date(joinDate.getFullYear(), joinDate.getMonth(), 1)) || (selectedMonth > currentMonth) ? '없음' : (attendanceData.earlyLeave > 0 ? `${attendanceData.earlyLeave}회` : '없음')}</h3>
                    </Card.Body>
                </Card>
            </div>

            {/* 휴가 기록 모달 */}
            <Modal show={showModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>휴가 기록</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                <div className={styles.TableContainer}>
                    <div className={styles.TableHeader}>
                        <div className={styles.TableCell}>번호</div>
                        <div className={styles.TableCell}>휴가 시작일</div>
                        <div className={styles.TableCell}>휴가 종료일</div>
                        <div className={styles.TableCell}>휴가 사유</div>
                        <div className={styles.TableCell}>승인 상태</div>
                        <div className={styles.TableCell}>승인자</div>
                        <div className={styles.TableCell}>삭제</div>
                        {isAdmin && <div className={styles.TableCell}>승인</div>} {/* 관리자인 경우 승인 열 추가 */}
                    </div>
                    {vacationList.map((vacation, index) => (
                        <div className={styles.TableRow} key={vacation.vacation_application_seq}>
                            <div className={styles.TableCell}>{index + 1}</div>
                            <div className={styles.TableCell}>{formatDate(vacation.vacation_start_date)}</div>
                            <div className={styles.TableCell}>{formatDate(vacation.vacation_end_date)}</div>
                            <div className={styles.TableCell}>{vacation.vacation_application_reason}</div>
                            <div className={styles.TableCell}>{vacation.vacation_application_status}</div>
                            <div className={styles.TableCell}>
                                {vacation.vacation_permission_user_seq 
                                    ? (vacation.vacation_permission_user_seq === 1 ? 'admin' : vacation.vacation_permission_user_seq)
                                    : '미확인'}
                            </div>
                            <div className={styles.TableCell}>
                                <Button variant="danger" size="sm" onClick={() => handleDeleteVacation(vacation.vacation_application_seq)}>삭제</Button>
                            </div>
                            {isAdmin && vacation.vacation_application_status !== 'A' && (  // 승인 상태가 "A"이 아닌 경우에만 버튼 표시
                                <div className={styles.TableCell}>
                                    <Button variant="success" size="sm" onClick={() => handleApproveVacation(vacation.vacation_application_seq)}>승인</Button>
                                </div>
                            )}
                        </div>
                    ))}

                </div>

                </Modal.Body>

                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>닫기</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default AttendanceCardBox;
