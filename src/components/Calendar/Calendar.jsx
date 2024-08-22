import React, { useState, useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin, { Draggable } from '@fullcalendar/interaction';
import { Box, TextField, Button, IconButton } from '@mui/material';
import { format } from 'date-fns';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';
import styles from './Calendar.module.css';
import SideBar from './SideBar/SideBar';
import Category from './Category/Category';
import profileImagePlaceholder from '../../assets/image.png';
import { useCalendarStore } from '../../store/store';

const serverUrl = process.env.REACT_APP_SERVER_URL;

axios.defaults.withCredentials = true;

const apiClient = axios.create({
  baseURL: serverUrl,
  withCredentials: true,
});

const userSeq = sessionStorage.getItem('usersSeq') || '1';
const usersName = sessionStorage.getItem('usersName') || 'defaultUser';

const rgbToHex = (rgb) => {
  const result = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
  return result
    ? "#" +
      ("0" + parseInt(result[1], 10).toString(16)).slice(-2) +
      ("0" + parseInt(result[2], 10).toString(16)).slice(-2) +
      ("0" + parseInt(result[3], 10).toString(16)).slice(-2)
    : rgb;
};

const fetchCalendarEvents = async (calendarId, startDate, endDate) => {
  try {
    const response = await apiClient.get(`/events/calendar/${calendarId}`, {
      params: { startDate: startDate.toISOString(), endDate: endDate.toISOString() },
    });
    return response.data.map(event => ({
      id: event.eventsSeq,
      title: event?.eventsTitle || 'Untitled Event',
      start: event?.eventsStartDate ? new Date(event.eventsStartDate) : new Date(),
      end: event?.eventsEndDate ? new Date(event.eventsEndDate) : new Date(),
      allDay: event?.eventsIsDraggable === 'Y',
      backgroundColor: event?.eventsColor || '#000000',
      location: event?.eventsLocation || 'No Location',
      description: event?.eventsDescription || 'No Description',
      textColor: '#FFFFFF',
    }));
  } catch (error) {
    console.error('Error fetching events:', error);
    throw error;
  }
};

const createCalendarEvent = async (eventData) => {
  try {
    const response = await apiClient.post(`/events`, eventData);
    return response.data;
  } catch (error) {
    console.error('Error creating calendar event:', error);
    throw error;
  }
};

const deleteCalendarEvent = async (eventId) => {
  try {
    await apiClient.delete(`/events/${eventId}`);
  } catch (error) {
    console.error('Error deleting event:', error);
    throw error;
  }
};

const updateCalendarEvent = async (eventId, eventData) => {
  try {
    const response = await apiClient.put(`/events/${eventId}`, eventData);
    return response.data;
  } catch (error) {
    console.error('Error updating event:', error);
    throw error;
  }
};

const Calendar = () => {
  const calendarRef = useRef(null);
  const handleEventReceiveRef = useRef(false);

  const {
    selectedCalendarId,
    setSelectedCalendarId,
    newlyAddedCalendarId,
    setNewlyAddedCalendarId,
    events,
    setEvents,
    calendars,
    setCalendars,
  } = useCalendarStore();

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [period, setPeriod] = useState({ startDate: null, endDate: null });
  const [mouseX, setMouseX] = useState(undefined);
  const [mouseY, setMouseY] = useState(undefined);
  
  const [location, setLocation] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const userInfo = {
    username: usersName,
    profileImage: profileImagePlaceholder,
  };

  const fetchCalendars = async () => {
    try {
      const response = await apiClient.get('/calendars');
      if (response.data && response.data.length > 0) {
        setCalendars(response.data);
        if (!selectedCalendarId) {
          setSelectedCalendarId(response.data[0].calendarsSeq);
        }
      } else {
        console.log('No calendars found in the database.');
      }
    } catch (error) {
      console.error('Error fetching calendars:', error);
    }
  };

  const fetchEvents = async (calendarId, startDate, endDate) => {
    try {
      const eventsList = await fetchCalendarEvents(calendarId, startDate, endDate);
      setEvents(eventsList);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  useEffect(() => {
    fetchCalendars();
  }, []);

  useEffect(() => {
    if (selectedCalendarId && period.startDate && period.endDate) {
      fetchEvents(selectedCalendarId, period.startDate, period.endDate);
    }
  }, [selectedCalendarId, period]);

  useEffect(() => {
    if (newlyAddedCalendarId) {
      setSelectedCalendarId(newlyAddedCalendarId);

      (async () => {
        try {
          await fetchEvents(newlyAddedCalendarId, period.startDate, period.endDate);
          setNewlyAddedCalendarId(null);
        } catch (error) {
          console.error('Error fetching events for newly added calendar:', error);
        }
      })();
    }
  }, [newlyAddedCalendarId, period.startDate, period.endDate]);

  useEffect(() => {
    const handleResize = () => {
      if (calendarRef.current) {
        calendarRef.current.getApi().updateSize();
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    const draggableEl = document.getElementById('external-events');
    new Draggable(draggableEl, {
      itemSelector: '.fc-event',
      eventData(eventEl) {
        return {
          title: eventEl.innerText,
          backgroundColor: eventEl.style.backgroundColor,
          borderColor: eventEl.style.backgroundColor,
          textColor: '#fff',
          id: String(Date.now()),
        };
      },
    });
  }, []);

  const handleEventClick = (clickInfo) => {
    const event = clickInfo.event;
    setSelectedEvent(event);

    setMouseX(clickInfo.jsEvent.clientX);
    setMouseY(clickInfo.jsEvent.clientY - 90);
  
    setLocation(event.extendedProps?.location || 'No Location');
    setStartTime(event.start ? format(event.start, "yyyy-MM-dd'T'HH:mm") : '');
    setEndTime(event.end ? format(event.end, "yyyy-MM-dd'T'HH:mm") : '');
  };

  const handleUpdateEvent = async () => {
    if (!selectedEvent) return;

    const updatedEvent = {
      eventsTitle: selectedEvent.title,
      eventsStartDate: new Date(startTime).toISOString(),
      eventsEndDate: new Date(endTime).toISOString(),
      eventsLocation: location,
      eventsDescription: selectedEvent.extendedProps?.description || 'No Description',
      eventsColor: selectedEvent.backgroundColor,
      textColor: '#ffffff',
      eventsIsDraggable: selectedEvent.allDay ? 'Y' : 'N',
      calendarsSeq: selectedEvent.extendedProps?.calendarsSeq || selectedCalendarId,
    };

    try {
      await updateCalendarEvent(selectedEvent.id, updatedEvent);
      setEvents((prevEvents) =>
        prevEvents.map(event =>
          event.id === selectedEvent.id
            ? { ...event, ...updatedEvent, start: new Date(startTime), end: new Date(endTime) }
            : event
        )
      );
      setSelectedEvent(null);
      alert('이벤트가 성공적으로 수정되었습니다.');
    } catch (error) {
      console.error('Error updating event:', error);
      alert('이벤트 수정 중 오류가 발생했습니다.');
    }
  };

  const handleDeleteEvent = async () => {
    if (!selectedEvent) return;

    try {
      await deleteCalendarEvent(selectedEvent.id);

      setEvents((prevEvents) => {
        if (Array.isArray(prevEvents)) {
          return prevEvents.filter(event => event.id !== selectedEvent.id);
        } else {
          return [];
        }
      });

      setSelectedEvent(null);
      alert('이벤트가 성공적으로 삭제되었습니다.');
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('이벤트 삭제 중 오류가 발생했습니다.');
    }
  };

  const showEventDetails = () => {
    if (selectedEvent && mouseX !== undefined && mouseY !== undefined) {
      return (
        <div 
          className="event-details" 
          style={{ 
            position: 'absolute', 
            left: mouseX, 
            top: mouseY, 
            backgroundColor: '#d4e6f1', 
            padding: '10px', 
            borderRadius: '10px', 
            zIndex: 1000, 
            width: '300px' // 모달 창 너비 조정
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0 }}>이벤트 정보</h3>
            <IconButton size="small" onClick={() => setSelectedEvent(null)} style={{ marginRight: '-8px', marginTop: '-8px' }}>
              <CloseIcon />
            </IconButton>
          </div>
          <TextField
            label="장소"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            fullWidth
            margin="normal"
            variant="outlined"
            sx={{
              '& input': {
                padding: '10px 14px', // 패딩 추가
              },
            }}
          />
          <TextField
            label="시작 시간"
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            fullWidth
            margin="normal"
            variant="outlined"
            sx={{
              '& input': {
                padding: '10px 14px', // 패딩 추가
              },
            }}
          />
          <TextField
            label="종료 시간"
            type="datetime-local"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            fullWidth
            margin="normal"
            variant="outlined"
            sx={{
              '& input': {
                padding: '10px 14px', // 패딩 추가
              },
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
            <Button 
              onClick={handleUpdateEvent} 
              color="primary" 
              variant="contained" 
              style={{ marginRight: '10px' }}
            >
              수정
            </Button>
            <Button 
              onClick={handleDeleteEvent} 
              variant="contained" 
              style={{ backgroundColor: 'red', color: 'white' }}
            >
              삭제
            </Button>
          </div>
        </div>
      );
    }
    return null;
  };

  const onChangeDate = ({ startStr, endStr }) => {
    setPeriod({ startDate: new Date(startStr), endDate: new Date(endStr) });
  };

  const eventContent = (eventInfo) => (
    <Box
      sx={{
        width: '100%',
        backgroundColor: eventInfo.event.backgroundColor,
        borderRadius: '3px',
        p: 0.5,
        color: eventInfo.event.textColor || '#FFFFFF',
        fontWeight: 600,
        overflow: 'hidden',
      }}
    >
      {eventInfo.event.title}
    </Box>
  );

  const handleSaveEvent = async (eventData) => {
    if (!selectedCalendarId) {
      alert('캘린더를 선택하세요.');
      return;
    }

    const newEventToAdd = {
      usersSeq: userSeq,
      eventsTitle: `${eventData.title || 'Untitled Event'}`,
      eventsStartDate: eventData.start.toISOString(),
      eventsEndDate: eventData.end.toISOString(),
      eventsIsDraggable: eventData.allDay ? 'Y' : 'N',
      eventsColor: eventData.color || '#000000',
      eventsLocation: eventData.location || 'No Location',
      eventsDescription: eventData.description || 'No Description',
      calendarsSeq: selectedCalendarId,
    };

    try {
      const createdEvent = await createCalendarEvent(newEventToAdd);
      
      setEvents((prevEvents) => {
        if (Array.isArray(prevEvents)) {
          return [...prevEvents, {
            id: createdEvent.eventsSeq,
            title: createdEvent.eventsTitle,
            start: new Date(createdEvent.eventsStartDate),
            end: new Date(createdEvent.eventsEndDate),
            allDay: createdEvent.eventsIsDraggable === 'Y',
            backgroundColor: createdEvent.eventsColor,
            location: createdEvent.eventsLocation,
            description: createdEvent.eventsDescription,
            textColor: '#FFFFFF',
          }];
        } else {
          return [{
            id: createdEvent.eventsSeq,
            title: createdEvent.eventsTitle,
            start: new Date(createdEvent.eventsStartDate),
            end: new Date(createdEvent.eventsEndDate),
            allDay: createdEvent.eventsIsDraggable === 'Y',
            backgroundColor: createdEvent.eventsColor,
            location: createdEvent.eventsLocation,
            description: createdEvent.eventsDescription,
            textColor: '#FFFFFF',
          }];
        }
      });

      setSelectedEvent(null);
    } catch (error) {
      console.error('Error saving event:', error);
    }
  };

  const handleEventDrop = async (info) => {
    if (!selectedCalendarId) {
      alert('캘린더를 선택하세요.');
      return;
    }

    if (!info.event.start || !info.event.end) {
      alert("시작 날짜와 종료 날짜는 필수입니다.");
      return;
    }

    try {
      const updatedEvent = {
        usersSeq: userSeq,
        eventsTitle: info.event.title,
        eventsStartDate: info.event.start.toISOString(), // 날짜를 ISO 포맷으로 변환
        eventsEndDate: info.event.end.toISOString(), // 날짜를 ISO 포맷으로 변환
        eventsColor: info.event.backgroundColor.slice(0, 7) || '#00a9ff',
        textColor: '#ffffff',
        eventsIsDraggable: info.event.allDay ? 'Y' : 'N',
        calendarsSeq: selectedCalendarId,
      };

      await apiClient.put(`/events/${info.event.id}`, updatedEvent);

      setEvents((prevEvents) => {
        if (Array.isArray(prevEvents)) {
          return prevEvents.map(event => 
            event.id === info.event.id ? { ...event, start: info.event.start, end: info.event.end } : event
          );
        } else {
          return [];
        }
      });

    } catch (error) {
      console.error('Error updating event:', error);
      alert('이벤트 업데이트 중 오류가 발생했습니다.');
    }
  };

  const handleEventReceiveFunction = async (info) => {
    if (!selectedCalendarId) {
      alert('캘린더를 선택하세요.');
      return;
    }

    if (handleEventReceiveRef.current) return;
    handleEventReceiveRef.current = true;

    try {
      let color = info.event.backgroundColor || '#000000';
      
      if (color.startsWith('rgb')) {
          color = rgbToHex(color);
      }

      const newEventTitle = info.draggedEl.innerText;

      const eventData = {
        usersSeq: userSeq,
        eventsTitle: newEventTitle,
        eventsStartDate: info.event.start ? info.event.start.toISOString() : new Date().toISOString(),
        eventsEndDate: info.event.start ? info.event.start.toISOString() : new Date().toISOString(),  // End date = start date
        eventsColor: color,
        textColor: '#ffffff',
        eventsIsDraggable: info.event.allDay ? 'Y' : 'N',
        calendarsSeq: selectedCalendarId,
      };

      const createdEvent = await createCalendarEvent(eventData);

      setEvents((prevEvents) => {
        if (Array.isArray(prevEvents)) {
          return [...prevEvents, {
            id: createdEvent.eventsSeq,
            title: createdEvent.eventsTitle,
            start: new Date(createdEvent.eventsStartDate),
            end: new Date(createdEvent.eventsEndDate),
            allDay: createdEvent.eventsIsDraggable === 'Y',
            backgroundColor: createdEvent.eventsColor,
            location: createdEvent.eventsLocation,
            description: createdEvent.eventsDescription,
            textColor: '#FFFFFF',
          }];
        } else {
          return [{
            id: createdEvent.eventsSeq,
            title: createdEvent.eventsTitle,
            start: new Date(createdEvent.eventsStartDate),
            end: new Date(createdEvent.eventsEndDate),
            allDay: createdEvent.eventsIsDraggable === 'Y',
            backgroundColor: createdEvent.eventsColor,
            location: createdEvent.eventsLocation,
            description: createdEvent.eventsDescription,
            textColor: '#FFFFFF',
          }];
        }
      });

      setSelectedEvent(null);
    } catch (error) {
      console.error('Error receiving event:', error);
    } finally {
      handleEventReceiveRef.current = false;
    }

    info.event.remove();
  };

  const handleSelectCalendar = async (calendarId) => {
    if (!calendarId || calendarId === 'undefined') {
        return;
    }

    setSelectedCalendarId(String(calendarId));

    try {
      await fetchEvents(calendarId, period.startDate, period.endDate);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const handleCalendarUpdate = async () => {
    try {
      await fetchCalendars();
      if (selectedCalendarId) {
        await fetchEvents(selectedCalendarId, period.startDate, period.endDate);
      }
    } catch (error) {
      console.error('Error updating calendar:', error);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.sub_container}>
        <SideBar profile_src={userInfo.profileImage} username={userInfo.username} useremail={userInfo.email} />
        <div className={styles.category}>
          <Category 
            openScheduleDialog={handleSaveEvent} 
            calendars={calendars} 
            onSelectCalendar={handleSelectCalendar}  
            selectedCalendarId={selectedCalendarId}
            fetchCalendars={handleCalendarUpdate} 
            setNewlyAddedCalendarId={setNewlyAddedCalendarId} 
          />
        </div>
        <div className={styles.content}>
          <section className={styles.calendarSection}>
            <h2>캘린더</h2>
            <div className={styles.fullCalendar}>
              <FullCalendar
                ref={calendarRef}
                locale="ko"
                plugins={[dayGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                editable={true}
                droppable={true}
                events={events}
                eventDrop={handleEventDrop}
                eventReceive={handleEventReceiveFunction}
                eventClick={handleEventClick}
                datesSet={onChangeDate}
                eventContent={eventContent}
                headerToolbar={{
                  left: 'prev,next today',
                  center: 'title',
                  right: 'dayGridMonth,dayGridWeek,dayGridDay',
                }}
                aspectRatio={2}
                height="100%"
                contentHeight="100%"
                expandRows={true}
                fixedWeekCount={false}
              />
              {showEventDetails()}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
