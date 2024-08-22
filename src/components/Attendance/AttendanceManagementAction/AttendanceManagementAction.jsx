import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Modal, Form, Card, ButtonGroup } from 'react-bootstrap';
import styles from './AttendanceManagementAction.module.css';
import { useAttendanceStore } from '../../../store/attendance_store';
import axios from 'axios';

const AttendanceManagementAction = () => {

    const {fetchAttendanceSummary, fetchEvents, events, attendance, handleCheckIn, handleCheckOut, dates } = useAttendanceStore();
    const [selected, setSelected] = useState(sessionStorage.getItem('selectedOption') || '내 근무');
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [vacationModalOpen, setVacationModalOpen] = useState(false);  // 휴가 신청 모달 상태 추가
    const [vacationData, setVacationData] = useState({
        startDate: '',
        endDate: '',
        reason: ''
    });
    const [annualVacationInfo, setAnnualVacationInfo] = useState({
        total_annual_vacation_days: 0,  
        used_annual_vacation_days: 0,   
        remain_annual_vacation_days: 0  
    });  // 연차 정보 상태
    const [isAfter6PM, setIsAfter6PM] = useState(false);

    const navi = useNavigate();

    const handleAttendanceManagement = () => {
        navi('/attendance');
    };

    const handleDeptSchedule = () => {
        navi('deptschedule');
    };

    const handleToggle = (option) => {
        setSelected(option);
        sessionStorage.setItem('selectedOption', option);
    }

    const openModal = () => {
        setModalIsOpen(true);
    }

    const closeModal = () => {
        setModalIsOpen(false);
    }

    const openVacationModal = async () => {
        const usersSeq = sessionStorage.getItem('usersSeq');
        try {
            const response = await axios.get(`/vacation/annual/${usersSeq}`);
            console.log('Fetched vacation info:', response.data); 
            setAnnualVacationInfo(response.data);  // 서버에서 가져온 연차 정보를 상태에 저장
        } catch (error) {
            console.error("연차 정보 가져오기 오류:", error);
        }
    
        setVacationModalOpen(true);
    };
    

    const closeVacationModal = () => {
        setVacationModalOpen(false);
    }

    const checkIfAfter6PM = () => {
        const currentHour = new Date().getHours();
        setIsAfter6PM(currentHour >= 18);  // 오후 6시 이후인지 여부를 상태로 저장
    }

    useEffect(() => {
        checkIfAfter6PM();  // 컴포넌트가 마운트될 때 시간 확인
    }, []);

    // 퇴근 후 출석 요약 데이터를 갱신하는 함수
    const handleCheckOutAndUpdate = async () => {
        await handleCheckOut(); // 기존의 handleCheckOut 호출
        
        // 퇴근 후 출석 정보를 다시 가져와 업데이트
        const usersSeq = sessionStorage.getItem("usersSeq");
        const currentMonth = new Date().toISOString().slice(0, 7);
        fetchAttendanceSummary(usersSeq, currentMonth);
    }

    // 이벤트가 해당 날짜에 존재하는지 확인하는 함수
    const isEventExistsOnDate = (startDate, endDate) => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        return events.some(event => {
            const eventDate = new Date(event.attendance_date);
            return eventDate >= start && eventDate <= end;
        });
    };

    // 휴가 신청 API 호출 함수
    const handleApplyVacation = async () => {
        // 해당 날짜에 이미 이벤트가 있는지 확인
        if (isEventExistsOnDate(vacationData.startDate, vacationData.endDate)) {
            alert('해당 날짜에 이미 일정이 존재합니다. 휴가를 신청할 수 없습니다.');
            return;
        }
    
        // 시작일이 종료일보다 이후일 경우 경고 메시지 출력
        if (new Date(vacationData.startDate) > new Date(vacationData.endDate)) {
            alert("휴가 시작일이 종료일보다 늦을 수 없습니다.");
            return;  // 휴가 신청 중단
        }

        // 휴가 기간 계산
        const startDate = new Date(vacationData.startDate);
        const endDate = new Date(vacationData.endDate);
        const timeDiff = endDate.getTime() - startDate.getTime();
        const dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1; // 하루 포함
    
        // 남은 연차보다 휴가 기간이 길 경우 제한
        if (dayDiff > annualVacationInfo.remain_annual_vacation_days) {
            alert(`남은 연차 일수(${annualVacationInfo.remain_annual_vacation_days}일)보다 긴 휴가는 신청할 수 없습니다.`);
            return;
        }

        try {
            // 종료일에 시간을 23:59:59로 설정
            endDate.setHours(23, 59, 59, 999);
    
            const response = await axios.post('/vacation/apply', {
                vacation_drafter_user_seq: sessionStorage.getItem('usersSeq'), // 사용자 ID
                vacation_type_seq: 1, // 휴가 유형 ID (예: 1은 연차 휴가로 설정)
                vacation_start_date: startDate.toISOString(), // Timestamp 형식에 맞게 수정
                vacation_end_date: endDate.toISOString(), // 입력한 종료일에 시간 설정
                vacation_application_reason: vacationData.reason, // 휴가 사유
                vacation_application_status: 'P' // 신청 상태 ('P'는 Pending 상태로 가정)
            });
    
            alert(response.data);  // 서버 응답 메시지를 사용자에게 표시
            closeVacationModal();  // 모달 닫기
    
            // 이벤트 갱신
            const usersSeq = sessionStorage.getItem('usersSeq');
            await fetchEvents(usersSeq, dates[0], dates[dates.length - 1]); // 휴가 신청 후 이벤트 갱신
    
        } catch (error) {
            console.error("휴가 신청 중 오류 발생:", error);
            alert('휴가 신청에 실패했습니다.');
        }
    };
    

    // 휴가 사유를 30글자로 제한하는 함수
    const handleReasonChange = (e) => {
        const input = e.target.value;
        const maxLength = 30;

        if (input.length > maxLength) {
            alert(`휴가 사유는 최대 ${maxLength}글자까지 입력 가능합니다.`);
            setVacationData({ ...vacationData, reason: input.slice(0, maxLength) });
        } else {
            setVacationData({ ...vacationData, reason: input });
        }
    };
    


    return (
        <div className={styles.container}>
            <div className={styles.toggleGroup}>
                <button
                    className={`${styles.toggleButton} ${selected === '내 근무' ? styles.selected : ''}`}
                    onClick={() => {handleToggle('내 근무'); handleAttendanceManagement();}}
                >
                    근태 현황
                </button>
                <button
                    className={`${styles.toggleButton} ${selected === '구성원 근무' ? styles.selected : ''}`}
                    onClick={() => {handleToggle('구성원 근무'); handleDeptSchedule();}}
                >
                    구성원 근무
                </button>
            </div>
        
            <div className={styles.buttonContainer}>
            <Button className={styles.leftButton} onClick={openVacationModal}>휴가 신청</Button>
            <Button className={styles.rightButton} onClick={openModal}>출석체크</Button>

            </div>
        
            <Modal show={modalIsOpen} onHide={closeModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title>출석 체크</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Card>
                        <Card.Body>
                            <Card.Title>출석 확인</Card.Title>
                            <ButtonGroup className="d-flex justify-content-between">
                                {attendance.checkIn ? (
                                    !attendance.checkOut ? (
                                        <Button variant="danger" onClick={handleCheckOutAndUpdate}>퇴근</Button>
                                    ) : (
                                        <p className="text-success">이미 퇴근했습니다.</p>
                                    )
                                ) : (
                                    !isAfter6PM ? (
                                        <Button variant="success" onClick={handleCheckIn}>출석</Button>
                                    ) : (
                                        <p className="text-danger">오후 6시 이후에는 출석할 수 없습니다.</p>
                                    )
                                )}
                            </ButtonGroup>
                            <div className="mt-3">
                                <p>출근 시간: {attendance.checkIn ? new Date(attendance.checkIn).toLocaleString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '출근 한 상태가 아닙니다.'}</p>
                                <p>퇴근 시간: {attendance.checkOut ? new Date(attendance.checkOut).toLocaleString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '퇴근 하지 않았습니다.'}</p>
                            </div>
                        </Card.Body>
                    </Card>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={closeModal}>닫기</Button>
                </Modal.Footer>
            </Modal>

            <Modal show={vacationModalOpen} onHide={closeVacationModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title>휴가 신청</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Card>
                        <Card.Body>
                            <Card.Title>연차 정보</Card.Title>
                            <div className={styles.vacationInfo}>
                                <p>총 연차: {annualVacationInfo.total_annual_vacation_days}일</p>
                                <p>사용한 연차: {annualVacationInfo.used_annual_vacation_days}일</p>
                                <p>남은 연차: {annualVacationInfo.remain_annual_vacation_days}일</p>
                            </div>

                            <Form>
                                <Form.Group controlId="startDate">
                                    <Form.Label>휴가 시작일</Form.Label>
                                    <Form.Control
                                        type="date"
                                        value={vacationData.startDate}
                                        onChange={(e) => setVacationData({ ...vacationData, startDate: e.target.value })}
                                    />
                                </Form.Group>
                                <Form.Group controlId="endDate" className="mt-3">
                                    <Form.Label>휴가 종료일</Form.Label>
                                    <Form.Control
                                        type="date"
                                        value={vacationData.endDate}
                                        onChange={(e) => setVacationData({ ...vacationData, endDate: e.target.value })}
                                    />
                                </Form.Group>
                                <Form.Group controlId="reason" className="mt-3">
                                    <Form.Label>휴가 사유 (최대 30글자)</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        value={vacationData.reason}
                                        onChange={handleReasonChange}
                                        placeholder="휴가 사유를 입력하세요."
                                    />
                                </Form.Group>
                            </Form>
                        </Card.Body>
                    </Card>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={closeVacationModal}>취소</Button>
                    <Button variant="primary" onClick={handleApplyVacation}>신청</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default AttendanceManagementAction;
