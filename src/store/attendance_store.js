import { create } from 'zustand';
import axios from 'axios';

const serverUrl = process.env.REACT_APP_SERVER_URL;

export const useAttendanceStore = create((set, get) => ({
    attendance: {
        checkIn: null,
        checkOut: null,
    },
    events: [],  // 이벤트 데이터를 관리
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

    fetchEvents: async (usersSeq, startDate, endDate) => {  // 이벤트 가져오는 함수
        try {
            const response = await axios.get(`${serverUrl}/attendance/events`, {
                params: { users_seq: usersSeq, start_date: startDate, end_date: endDate }
            });

            // 서버에서 받아온 이벤트 데이터를 상태에 저장
            const events = response.data.map(event => ({
                ...event,
                title: event.status === '출근' ? '출근' : '퇴근',
                startTime: new Date(event.check_in_time).getHours(),
                endTime: event.check_out_time ? new Date(event.check_out_time).getHours() : 18,
                date: event.attendance_date.split('T')[0]
            }));

            set({ events });
            console.log(events);
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
