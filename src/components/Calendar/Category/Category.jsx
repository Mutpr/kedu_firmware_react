import React, { useState, useEffect } from 'react';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Box, Checkbox, FormControlLabel, Select, MenuItem } from '@mui/material';
import { styled } from '@mui/system';
import axios from 'axios';
import styles from './Category.module.css';
import { useCalendarStore } from '../../../store/store'; // Zustand store import

// 서버 URL을 환경 변수로 설정
const serverUrl = process.env.REACT_APP_SERVER_URL;

axios.defaults.withCredentials = true;

const apiClient = axios.create({
  baseURL: serverUrl,
  withCredentials: true,
});

const StyledDialog = styled(Dialog)({
  '& .MuiPaper-root': {
    borderRadius: '8px',
    padding: '16px',
  },
});

const StyledTextField = styled(TextField)({
  marginBottom: '8px',
  '& label.Mui-focused': {
    color: '#00a9ff',
  },
  '& .MuiInput-underline:after': {
    borderBottomColor: '#00a9ff',
  },
  '& .MuiOutlinedInput-root': {
    '&.Mui-focused fieldset': {
      borderColor: '#00a9ff',
    },
  },
});

const StyledButton = styled(Button)({
  borderRadius: '6px',
  padding: '4px 8px',
  fontSize: '14px',
  fontWeight: 'bold',
  textTransform: 'none',
});

const Category = ({ openScheduleDialog = () => {}, onSelectCalendar = () => {}, fetchCalendars }) => {
  const { setSelectedCalendarId, setNewlyAddedCalendarId, setCalendars: setGlobalCalendars } = useCalendarStore(); // Zustand 상태와 함수 사용

  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [eventsModalOpen, setEventsModalOpen] = useState(false);
  const [dragEventModalOpen, setDragEventModalOpen] = useState(false);
  const [calendars, setCalendars] = useState([]);
  const [interestCalendars, setInterestCalendars] = useState([]);
  const [newCalendarName, setNewCalendarName] = useState('');
  const [newCalendarColor, setNewCalendarColor] = useState('#000000');
  const [isAddingCalendar, setIsAddingCalendar] = useState(false);
  const [selectedCalendarIdForEvent, setSelectedCalendarIdForEvent] = useState('');

  const [eventTitle, setEventTitle] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [isAllDay, setIsAllDay] = useState(false);
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [eventColor, setEventColor] = useState('#000000');
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null); // 선택된 이벤트 상태 추가

  const [dragEventTitle, setDragEventTitle] = useState('');
  const [dragEventColor, setDragEventColor] = useState('#000000');
  const [dragEvents, setDragEvents] = useState([]);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [calendarToEdit, setCalendarToEdit] = useState(null);
  const [calendarEvents, setCalendarEvents] = useState([]);

  useEffect(() => {
    const fetchInitialCalendars = async () => {
      try {
        const response = await apiClient.get('/calendars');
        setCalendars(response.data);
        setGlobalCalendars(response.data);  // Zustand 상태 업데이트
      } catch (error) {
        console.error('Error fetching calendars:', error);
      }
    };

    fetchInitialCalendars();
  }, [setGlobalCalendars]);

  const handleAddCalendar = async () => {
    if (newCalendarName.trim() !== '') {
      const newCalendar = { 
        calendarsName: newCalendarName, 
        calendarsColor: newCalendarColor,
        usersSeq: sessionStorage.getItem('usersSeq')
      };
      try {
        const response = await apiClient.post('/calendars', newCalendar);
        const newCalendarSeq = response.data;

        // 새로 추가된 캘린더를 상태에 추가
        const updatedCalendars = [...calendars, { ...newCalendar, calendarsSeq: newCalendarSeq }];
        setCalendars(updatedCalendars);
        setGlobalCalendars(updatedCalendars); // Zustand 상태 업데이트
        setNewCalendarName('');
        setNewCalendarColor('#000000');
        setIsAddingCalendar(false);
        
        alert('캘린더가 추가되었습니다.');

        // 새로 추가된 캘린더를 선택 후 리렌더링
        setSelectedCalendarId(String(newCalendarSeq));
        setNewlyAddedCalendarId(String(newCalendarSeq));  // 추가된 캘린더 ID 저장

        // 약간의 지연을 추가하여 상태를 동기화하고 리렌더링 강제
        setTimeout(() => {
          onSelectCalendar(newCalendarSeq);
          window.location.reload(); // 페이지를 강제로 새로고침하여 상태를 동기화
        }, 500);

        // 필요한 경우 부모 컴포넌트의 fetchCalendars를 호출하여 상위 컴포넌트에서도 업데이트 반영
        if (fetchCalendars) {
          fetchCalendars();
        }

      } catch (error) {
        console.error('Error creating calendar:', error);
      }
    }
  };

  const handleAddDragEvent = () => {
    const currentDate = new Date();
    const newDragEvent = {
      title: dragEventTitle,
      color: dragEventColor,
      start: currentDate.toISOString(), // 현재 날짜로 시작
      end: currentDate.toISOString(),   // 종료 날짜를 시작 날짜와 동일하게 설정하여 1일 이벤트로 설정
      id: String(Date.now()),
    };
    setDragEvents([...dragEvents, newDragEvent]);
    setDragEventModalOpen(false);
    setDragEventTitle('');
    setDragEventColor('#000000');
  };

  const handleSaveEvent = async () => {
    if (!start || !end || !eventTitle.trim() || !selectedCalendarIdForEvent) {
      alert('이벤트 생성에 필요한 모든 필드를 입력해주세요.');
      return;
    }

    const eventData = {
      calendarsSeq: selectedCalendarIdForEvent,  
      eventsTitle: eventTitle.trim(),           
      eventsDescription: description.trim(),    
      eventsLocation: location.trim(),          
      eventsStartDate: new Date(start).toISOString(),
      eventsEndDate: new Date(end).toISOString(),
      eventsIsDraggable: isAllDay ? 'Y' : 'N',        
      eventsColor: eventColor,                   
    };

    try {
      const response = await apiClient.post('/events', eventData);
      setEvents([...events, response.data]);
      resetForm();
      setModalIsOpen(false);
      alert('이벤트가 성공적으로 등록되었습니다.');
    } catch (error) {
      console.error('Error saving event:', error.response?.data || error.message);
      alert('이벤트 저장 중 오류가 발생했습니다. 입력된 데이터를 확인해주세요.');
    }
  };

  const resetForm = () => {
    setEventTitle('');
    setStart('');
    setEnd('');
    setIsAllDay(false);
    setLocation('');
    setDescription('');
    setEventColor('#000000');
    setSelectedCalendarIdForEvent(''); 
  };

  const handleDeleteCalendar = async (index) => {
    const calendarToDelete = calendars[index];

    if (window.confirm(`캘린더 "${calendarToDelete.calendarsName}"을(를) 정말 삭제하시겠습니까?`)) {
      try {
        await apiClient.delete(`/calendars/${calendarToDelete.calendarsSeq}`);
        const updatedCalendars = calendars.filter((_, i) => i !== index);
        setCalendars(updatedCalendars);
        setGlobalCalendars(updatedCalendars); // Zustand 상태 업데이트
        setInterestCalendars(interestCalendars.filter(c => c.calendarsSeq !== calendarToDelete.calendarsSeq));

        if (updatedCalendars.length > 0) {
          onSelectCalendar(updatedCalendars[0].calendarsSeq);
        } else {
          setSelectedCalendarIdForEvent('');
        }

        if (fetchCalendars) {
          fetchCalendars();
        }

      } catch (error) {
        console.error('Error deleting calendar:', error);
        alert('캘린더 삭제 중 오류가 발생했습니다.');
      }
    }
  };

  const handleEditCalendar = (calendar) => {
    setCalendarToEdit(calendar);
    setNewCalendarName(calendar.calendarsName);
    setNewCalendarColor(calendar.calendarsColor);
    setEditModalOpen(true);
  };

  const handleSaveEditedCalendar = async () => {
    if (!calendarToEdit) return;

    const updatedCalendar = {
      ...calendarToEdit,
      calendarsName: newCalendarName,
      calendarsColor: newCalendarColor,
    };

    try {
      await apiClient.put(`/calendars/${calendarToEdit.calendarsSeq}`, updatedCalendar);
      const updatedCalendars = calendars.map(cal => cal.calendarsSeq === calendarToEdit.calendarsSeq ? updatedCalendar : cal);
      setCalendars(updatedCalendars);
      setGlobalCalendars(updatedCalendars); // Zustand 상태 업데이트
      setEditModalOpen(false);
      setCalendarToEdit(null);
      alert('캘린더가 성공적으로 수정되었습니다.');

      if (fetchCalendars) {
        fetchCalendars();
      }
      
    } catch (error) {
      console.error('Error updating calendar:', error);
    }
  };

  const handleSelectCalendar = (calendar) => {
    onSelectCalendar(calendar.calendarsSeq); 
  };

  const handleInterestCalendarClick = async (calendar) => {
    try {
      const response = await apiClient.get(`/events/calendar/${calendar.calendarsSeq}`);
      setCalendarEvents(response.data); 
      setEventsModalOpen(true); 
    } catch (error) {
      console.error('Error fetching events:', error);
      alert('일정을 가져오는 중 오류가 발생했습니다.');
    }
  };

  const handleCloseEventsModal = () => {
    setEventsModalOpen(false);
    setCalendarEvents([]);
  };

  const handleDeleteEvent = async () => {
    if (!selectedEvent) return;

    if (window.confirm(`이벤트 "${selectedEvent.eventsTitle}"을(를) 정말 삭제하시겠습니까?`)) {
      try {
        await apiClient.delete(`/events/${selectedEvent.eventsSeq}`);
        const updatedEvents = events.filter(event => event.eventsSeq !== selectedEvent.eventsSeq);
        setEvents(updatedEvents);
        setCalendarEvents(updatedEvents); // 모달 내 이벤트 상태 업데이트
        alert('이벤트가 성공적으로 삭제되었습니다.');
      } catch (error) {
        console.error('Error deleting event:', error);
        alert('이벤트 삭제 중 오류가 발생했습니다.');
      }
    }
  };

  return (
    <div className={styles['C-sidebarContainer']}>
      <h2>Category</h2>
      <button 
        className={styles['C-addButton']} 
        onClick={() => setModalIsOpen(true)}
        inert={modalIsOpen ? 'true' : undefined}
      >
        일정등록
      </button>
      <button 
        className={styles['C-addButton']} 
        onClick={() => setDragEventModalOpen(true)}
        inert={dragEventModalOpen ? 'true' : undefined}
      >
        드래그 이벤트 추가
      </button>

      <div className={styles['C-section']}>
        <h3 className={styles['C-h3']}>내 캘린더</h3>
        {calendars.map((calendar, index) => (
          <div key={calendar.calendarsSeq} className={styles['C-calendarItem']}>
            <Checkbox
              checked={interestCalendars.some((c) => c.calendarsSeq === calendar.calendarsSeq)}
              onChange={() => {
                if (interestCalendars.find((c) => c.calendarsSeq === calendar.calendarsSeq)) {
                  setInterestCalendars(interestCalendars.filter((c) => c.calendarsSeq !== calendar.calendarsSeq));
                } else {
                  setInterestCalendars([...interestCalendars, calendar]);
                }
              }}
              color="primary"
              size="small"
              sx={{ padding: '0 5px 0 0' }}
            />
            <div className={styles['C-labelContainer']} onClick={() => handleSelectCalendar(calendar)}>
              <span className={styles['C-label']}>{calendar.calendarsName}</span>
              <span className={styles['C-colorDot']} style={{ backgroundColor: calendar.calendarsColor }}></span>
            </div>
            <div className={styles['C-buttonGroup']}>
              <button 
                onClick={() => handleEditCalendar(calendar)} 
                style={{ 
                  backgroundColor: 'transparent', 
                  color: '#00a9ff', 
                  border: 'none', 
                  cursor: 'pointer',
                  transition: 'color 0.2s ease',
                }}
                onMouseEnter={(e) => e.target.style.color = '#007bbf'}
                onMouseLeave={(e) => e.target.style.color = '#00a9ff'}
              >
                수정
              </button>
              <button 
                onClick={() => handleDeleteCalendar(index)} 
                style={{ 
                  backgroundColor: 'transparent', 
                  color: '#00a9ff', 
                  border: 'none', 
                  cursor: 'pointer',
                  transition: 'color 0.2s ease',
                }}
                onMouseEnter={(e) => e.target.style.color = '#007bbf'}
                onMouseLeave={(e) => e.target.style.color = '#00a9ff'}
              >
                삭제
              </button>
            </div>
          </div>
        ))}
        {!isAddingCalendar && (
          <StyledButton
            variant="outlined"
            size="small"
            onClick={() => setIsAddingCalendar(true)}
            sx={{ 
              textTransform: 'none', 
              margin: '5px 0', 
              width: '100%',
            }}
          >
            + 내 캘린더 추가
          </StyledButton>
        )}
        {isAddingCalendar && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <StyledTextField
              margin="dense"
              label="캘린더 이름"
              type="text"
              fullWidth
              value={newCalendarName}
              onChange={(e) => setNewCalendarName(e.target.value)}
              size="small"
            />
            <StyledTextField
              margin="dense"
              label="색상"
              type="color"
              fullWidth
              value={newCalendarColor}
              onChange={(e) => setNewCalendarColor(e.target.value)}
              size="small"
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <StyledButton variant="contained" color="primary" size="small" onClick={handleAddCalendar}>
                추가
              </StyledButton>
              <StyledButton variant="outlined" color="secondary" size="small" onClick={() => setIsAddingCalendar(false)}>
                취소
              </StyledButton>
            </Box>
          </Box>
        )}
      </div>

      <div className={styles['C-section']}>
        <h3 className={styles['C-h3']}>관심 캘린더</h3>
        <ul className={styles['C-ul']}>
          {interestCalendars.map((calendar, index) => (
            <li className={styles['C-li']} key={index}>
              <Checkbox
                checked={interestCalendars.some((c) => c.calendarsSeq === calendar.calendarsSeq)}
                onChange={() => {
                  if (interestCalendars.find((c) => c.calendarsSeq === calendar.calendarsSeq)) {
                    setInterestCalendars(interestCalendars.filter((c) => c.calendarsSeq !== calendar.calendarsSeq));
                  } else {
                    setInterestCalendars([...interestCalendars, calendar]);
                  }
                }}
                color="primary"
                size="small"
                sx={{ padding: '0 5px 0 0' }}
              />
              <div 
                className={styles['C-labelContainer']} 
                onClick={() => handleInterestCalendarClick(calendar)}
              >
                <span className={styles['C-label']}>{calendar.calendarsName}</span>
                <span className={styles['C-colorDot']} style={{ backgroundColor: calendar.calendarsColor, marginLeft: 8 }}></span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className={styles['C-draggableEventsContainer']} id="external-events">
        <div className={styles['C-draggableEventTitle']}>드래그 가능한 이벤트:</div>
        {dragEvents.map((event, index) => (
          <div
            key={index}
            className={`${styles['C-draggableEventItem']} fc-event`}
            style={{
              backgroundColor: event.color,
              color: '#fff',
            }}
          >
            <span>{event.title}</span>
            <div className={styles['C-eventColorIndicator']} style={{ backgroundColor: event.color }}></div>
          </div>
        ))}
      </div>

      <StyledDialog 
        open={modalIsOpen} 
        onClose={() => setModalIsOpen(false)} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>일정 등록</DialogTitle>
        <DialogContent>
          <StyledTextField
            margin="dense"
            label="일정 제목"
            type="text"
            fullWidth
            value={eventTitle}
            onChange={(e) => setEventTitle(e.target.value)}
            variant="outlined"
          />
          <Select
            value={selectedCalendarIdForEvent}
            onChange={(e) => setSelectedCalendarIdForEvent(e.target.value)}
            displayEmpty
            fullWidth
            variant="outlined"
            margin="dense"
            sx={{ marginBottom: '16px' }}
          >
            <MenuItem value="" disabled>
              캘린더 선택
            </MenuItem>
            {calendars.map((calendar) => (
              <MenuItem key={calendar.calendarsSeq} value={calendar.calendarsSeq}>
                {calendar.calendarsName}
              </MenuItem>
            ))}
          </Select>
          <StyledTextField
            margin="dense"
            label="시작 날짜"
            type="datetime-local"
            fullWidth
            value={start}
            onChange={(e) => setStart(e.target.value)}
            InputLabelProps={{ shrink: true }}
            variant="outlined"
          />
          <StyledTextField
            margin="dense"
            label="종료 날짜"
            type="datetime-local"
            fullWidth
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            InputLabelProps={{ shrink: true }}
            variant="outlined"
            disabled={isAllDay}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={isAllDay}
                onChange={(e) => setIsAllDay(e.target.checked)}
                color="primary"
              />
            }
            label="종일"
          />
          <StyledTextField
            margin="dense"
            label="장소"
            type="text"
            fullWidth
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            variant="outlined"
          />
          <StyledTextField
            margin="dense"
            label="일정 설명"
            type="text"
            fullWidth
            multiline
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            variant="outlined"
          />
          <StyledTextField
            margin="dense"
            label="색상"
            type="color"
            fullWidth
            value={eventColor}
            onChange={(e) => setEventColor(e.target.value)}
            variant="outlined"
          />
        </DialogContent>
        <DialogActions>
          <StyledButton onClick={handleSaveEvent} color="primary" variant="contained">
            저장
          </StyledButton>
          <StyledButton onClick={() => setModalIsOpen(false)} color="secondary" variant="outlined">
            닫기
          </StyledButton>
        </DialogActions>
      </StyledDialog>

      {/* 드래그 가능한 이벤트 추가 다이얼로그 */}
      <StyledDialog 
        open={dragEventModalOpen} 
        onClose={() => setDragEventModalOpen(false)} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>드래그 가능한 이벤트 추가</DialogTitle>
        <DialogContent>
          <StyledTextField
            margin="dense"
            label="이벤트 제목"
            type="text"
            fullWidth
            value={dragEventTitle}
            onChange={(e) => setDragEventTitle(e.target.value)}
            variant="outlined"
          />
          
          <StyledTextField
            margin="dense"
            label="색상"
            type="color"
            fullWidth
            value={dragEventColor}
            onChange={(e) => setDragEventColor(e.target.value)}
            variant="outlined"
          />
        </DialogContent>
        <DialogActions>
          <StyledButton onClick={handleAddDragEvent} color="primary" variant="contained">
            추가
          </StyledButton>
          <StyledButton onClick={() => setDragEventModalOpen(false)} color="secondary" variant="outlined">
            닫기
          </StyledButton>
        </DialogActions>
      </StyledDialog>

      {/* 캘린더 수정 다이얼로그 */}
      <StyledDialog 
        open={editModalOpen} 
        onClose={() => setEditModalOpen(false)} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>캘린더 수정</DialogTitle>
        <DialogContent>
          <StyledTextField
            margin="dense"
            label="캘린더 이름"
            type="text"
            fullWidth
            value={newCalendarName}
            onChange={(e) => setNewCalendarName(e.target.value)}
            size="small"
          />
          <StyledTextField
            margin="dense"
            label="색상"
            type="color"
            fullWidth
            value={newCalendarColor}
            onChange={(e) => setNewCalendarColor(e.target.value)}
            size="small"
          />
        </DialogContent>
        <DialogActions>
          <StyledButton onClick={handleSaveEditedCalendar} color="primary" variant="contained">
            저장
          </StyledButton>
          <StyledButton onClick={() => setEditModalOpen(false)} color="secondary" variant="outlined">
            닫기
          </StyledButton>
        </DialogActions>
      </StyledDialog>

      {/* 이벤트 목록 다이얼로그 */}
      <StyledDialog
        open={eventsModalOpen}
        onClose={handleCloseEventsModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>캘린더 이벤트 목록</DialogTitle>
        <DialogContent>
          <ul>
            {calendarEvents.map((event) => (
              <li key={event.eventsSeq} onClick={() => setSelectedEvent(event)}> {/* 이벤트 선택 기능 추가 */}
                <div>
                  <strong>{event.eventsTitle}</strong>
                </div>
                <div>
                  시작: {new Date(event.eventsStartDate).toLocaleString()}
                </div>
                <div>
                  종료: {new Date(event.eventsEndDate).toLocaleString()}
                </div>
              </li>
            ))}
          </ul>
        </DialogContent>
        <DialogActions>
          <StyledButton onClick={handleCloseEventsModal} color="primary" variant="contained">
            닫기
          </StyledButton>
        </DialogActions>
      </StyledDialog>
    </div>
  );
};

export default Category;
