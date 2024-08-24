import { create } from 'zustand';
import axios from 'axios';

const serverUrl = process.env.REACT_APP_SERVER_URL;

export const useAttendanceStore = create((set, get) => ({
    attendance: {
        checkIn: null,
        checkOut: null,
    },
    events: [],  // 이벤트 데이터를 관리
    departmentEvents: [],  // 부서 이벤트 데이터를 관리
    departmentMembers: [],  // 부서원 정보를 관리

    attendanceData: {  // 출석 요약 데이터를 관리
        daysPresent: 0,
        daysLate: 0,
        daysAbsent: 0,
        earlyLeave: 0
    },

    setAttendance: (attendance) => set({ attendance }),
    setEvents: (events) => set({ events }),  // 이벤트 데이터를 설정
    setAttendanceData: (data) => set({ attendanceData: data }),

    dates: [],
    setDates: (dates) => set({ dates }),

     // 부서원 데이터 초기화 (상태 초기화)
    clearDepartmentMembers: () => set({ departmentMembers: [] }),

     // 부서 일정 가져오기 - usersSeq와 날짜를 기반으로
     fetchDepartmentEvents: async (usersSeq, date) => {
        try {
            const response = await axios.get(`${serverUrl}/attendance/departmentEvents`, {
                params: { users_seq: usersSeq, date: date }
            });
            // console.log(date);
            // console.log('Department events response:', response.data);  // 응답 데이터 구조 확인
    
            if (response.data && Array.isArray(response.data)) {
                const events = response.data.map(event => {
                    // 퇴근 시간이 18시 이전이면 조퇴로 처리
                    const isEarlyLeave = event.check_out_time && new Date(event.check_out_time).getHours() < 18;
    
                    return {
                        ...event,
                        title: event.status === '출근' 
                            ? '출근' 
                            : isEarlyLeave 
                            ? '조퇴' 
                            : event.status === '지각' 
                            ? '지각' 
                            : event.status === '퇴근' 
                            ? '퇴근' 
                            : event.status === '연차' 
                            ? '연차'
                            : '기타',
                        startTime: new Date(event.check_in_time).getHours(),
                        endTime: event.check_out_time ? new Date(event.check_out_time).getHours() : 18,
                        date: event.attendance_date.split('T')[0],
                        memberId: event.users_seq  // 이벤트와 부서원 연결
                    };
                });
    
                set({ departmentEvents: events });
            } else {
                // console.error('Department events 데이터가 배열이 아닙니다:', response.data);
                set({ departmentEvents: [] });
            }
        } catch (error) {
            console.error('Error fetching department events:', error);
        }
    },
    
    
    

    // 부서원 정보 가져오기 - loginID를 이용
    fetchDepartmentMembers: async () => {
        const loginID = sessionStorage.getItem("loginID"); // loginID를 가져옴
        if (loginID) {
            try {
                const response = await axios.get(`${serverUrl}/users/${loginID}/deptprofile`);
                if (Array.isArray(response.data)) {
                    set({ departmentMembers: response.data });
                    // console.log(response.data);
                } else {
                    // console.error("departmentMembers 데이터가 배열이 아닙니다:", response.data);
                    set({ departmentMembers: [] });  // 배열이 아닌 경우 빈 배열로 설정
                }
            } catch (error) {
                console.error('Error fetching department members:', error);
                set({ departmentMembers: [] });  // 에러 발생 시 빈 배열로 설정
            }
        } else {
            console.error('loginID가 세션 스토리지에 없습니다.');
            set({ departmentMembers: [] });
        }
    },

    fetchAttendanceStatus: async (usersSeq) => {
        try {
            const response = await axios.get(`${serverUrl}/attendance/check`, {
                params: { users_seq: usersSeq }
            });

            const { checkIn, checkOut } = response.data;

            set({
                attendance: {
                    checkIn: checkIn,  // 서버에서 받아온 값을 그대로 설정
                    checkOut: checkOut,  
                },
                hasCheckedIn: !!checkIn,  // checkIn 값이 있으면 true로 설정
            });

            return { checkIn, checkOut };

        } catch (error) {
            console.error('Error fetching attendance status:', error);
            return { checkIn: null, checkOut: null };
        }
    },

    fetchAttendanceSummary: async (usersSeq, month) => {
        try {
            const response = await axios.get(`${serverUrl}/attendance/checkAttendanceSummary`, {
                params: { usersSeq, month }
            });

            // 서버로부터 받은 데이터를 상태에 저장
            set({
                attendanceData: {
                    daysPresent: response.data.daysPresent || 0,
                    daysLate: response.data.daysLate || 0,
                    daysAbsent: response.data.daysAbsent || 0,
                    earlyLeave: response.data.earlyLeave || 0
                }
            });

        } catch (error) {
            console.error('Error fetching attendance summary:', error);
        }
    },

    fetchEvents: async (usersSeq, startDate, endDate) => {
        try {
            const response = await axios.get(`${serverUrl}/attendance/events`, {
                params: { users_seq: usersSeq, start_date: startDate, end_date: endDate }
            });
            
            console.log('Fetched events:', response.data); // 서버에서 받은 데이터 확인
        
            const events = response.data.map(event => {
                // 지각 여부 확인: 출근 시간이 9시 이후면 지각으로 처리
            const isLate = event.check_in_time && new Date(event.check_in_time).getHours() >= 9;
                // 퇴근 시간이 18시 이전이면 조퇴로 처리
                const isEarlyLeave = event.check_out_time && new Date(event.check_out_time).getHours() < 18;
    
                return {
                    ...event,
                    title: event.status === '출근' 
                        ? '출근' 
                        : isLate && isEarlyLeave
                        ? '지각 및 조퇴' // 지각과 조퇴 모두 발생한 경우
                        : isEarlyLeave 
                        ? '조퇴' 
                        : event.status === '지각' 
                        ? '지각' 
                        : event.status === '퇴근' 
                        ? '퇴근' 
                        : event.status === '연차' 
                        ? '연차'
                        : '기타',
                    startTime: new Date(event.check_in_time).getHours(),
                    endTime: event.check_out_time ? new Date(event.check_out_time).getHours() : 18,
                    date: event.attendance_date.split('T')[0],
                    vacation_application_status: event.vacation_application_status,
                    isLate, // 지각 여부 저장
                    isEarlyLeave // 조퇴 여부 저장
                };
            });
        
            set({ events }); // 기존 이벤트 덮어쓰기
            console.log('Processed events:', events); // 상태에 저장된 이벤트 확인
        } catch (error) {
            console.error('Error fetching events:', error);
        }
    },
    
    

    handleCheckIn: async () => {
        const now = new Date();
        const usersSeq = sessionStorage.getItem("usersSeq");

        if (window.confirm(`현재 시간 ${now.toLocaleTimeString()}입니다. 출석하시겠습니까?`)) {
            set((state) => ({
                attendance: {
                    ...state.attendance,
                    checkIn: now.toISOString(),  // ISO 8601 형식으로 전송
                },
                hasCheckedIn: true,
            }));

            try {
                await axios.post(`${serverUrl}/attendance`, {
                    users_seq: usersSeq,
                    check_in_time: now.toISOString()  // ISO 8601 형식으로 전송
                });
                console.log('Check-in recorded.');

                // 출석 체크 후 이벤트 다시 불러오기
                const { dates } = get();
                await get().fetchEvents(usersSeq, dates[0], dates[dates.length - 1]);

            } catch (error) {
                console.error('Error recording check-in:', error);
            }
        }
    },

    handleCheckOut: async () => {
        const now = new Date();
        const usersSeq = sessionStorage.getItem("usersSeq");

        if (window.confirm(`현재 시간 ${now.toLocaleTimeString()}입니다. 퇴근하시겠습니까?`)) {
            set((state) => ({
                attendance: {
                    ...state.attendance,
                    checkOut: now.toISOString(),  // ISO 8601 형식으로 전송
                }
            }));

            try {
                await axios.post(`${serverUrl}/attendance`, {
                    users_seq: usersSeq,
                    check_out_time: now.toISOString()  // ISO 8601 형식으로 전송
                });
                console.log('Check-out recorded.');

                // 퇴근 후 이벤트 다시 불러오기
                const { dates } = get();
                await get().fetchEvents(usersSeq, dates[0], dates[dates.length - 1]);

            } catch (error) {
                console.error('Error recording check-out:', error);
            }
        }
    }
}));
