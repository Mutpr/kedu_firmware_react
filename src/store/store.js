import { create } from 'zustand';

export const useAuthStore = create((set) => ({
    loginID: '',
    usersName: '', // 추가된 필드
    setLoginID: (param) => set({ loginID: param }),
    setUsersName: (param) => set({ usersName: param }), // 추가된 메서드
}));


// 새로운 CalendarStore 추가
export const useCalendarStore = create((set) => ({
    selectedCalendarId: '',
    setSelectedCalendarId: (calendarId) => set({ selectedCalendarId: calendarId }),
    newlyAddedCalendarId: null,
    setNewlyAddedCalendarId: (calendarId) => set({ newlyAddedCalendarId: calendarId }),
    events: [],
    setEvents: (events) => set({ events }),
    calendars: [],
    setCalendars: (calendars) => set({ calendars }),
    // 상태 변경 감지 후 UI 업데이트를 위한 추가 상태
    isCalendarUpdated: false,
    setIsCalendarUpdated: (updated) => set({ isCalendarUpdated: updated }),
  }));
