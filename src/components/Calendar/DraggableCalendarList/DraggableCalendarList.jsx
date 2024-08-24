import React from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Checkbox, IconButton, TextField } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import styles from './DraggableCalendarList.module.css';

const DraggableCalendarList = ({
  calendars = [],
  interestCalendars = [],
  handleToggleInterestCalendar = () => {},
  handleEditCalendar = () => {},
  handleSaveEdit = () => {},
  handleCancelEdit = () => {},
  handleDeleteCalendar = () => {},
  editIndex = -1,
  editName = '',
  setEditName = () => {},
  handleOpenEventsModal = () => {},
  onDragEnd = () => {},
  handleSelectCalendar = () => {},
}) => {
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="calendars">
        {(provided) => (
          <ul className={styles.ul} {...provided.droppableProps} ref={provided.innerRef}>
            {calendars.map((calendar, index) => (
              <Draggable key={calendar.id || String(index)} draggableId={calendar.id || String(index)} index={index}>
                {(provided) => (
                  <li
                    className={styles.li}
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    onClick={() => handleSelectCalendar(calendar.id)} // 캘린더 선택 핸들러 추가
                  >
                    <Checkbox
                      checked={interestCalendars.some((c) => c.id === calendar.id)}
                      onChange={() => handleToggleInterestCalendar(calendar)}
                      color="primary"
                      size="small"
                      sx={{ padding: '0 5px 0 0' }}
                    />
                    {editIndex === index ? (
                      <div className={styles.editContainer}>
                        <TextField
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          size="small"
                          sx={{ marginRight: 1, width: '100px' }}
                        />
                        <IconButton
                          size="small"
                          onClick={() => handleSaveEdit(index)}
                          sx={{ padding: '3px' }}
                        >
                          <CheckIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={handleCancelEdit}
                          sx={{ padding: '3px' }}
                        >
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      </div>
                    ) : (
                      <div className={styles.labelContainer} onClick={handleOpenEventsModal}>
                        <span className={styles.label}>{calendar.name}</span>
                        <span className={styles.colorDot} style={{ backgroundColor: calendar.color, marginLeft: 8 }}></span>
                      </div>
                    )}
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditCalendar(index);
                      }}
                      className={styles.editButton}
                      sx={{ padding: '5px' }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCalendar(index);
                      }}
                      className={styles.deleteButton}
                      sx={{ padding: '5px' }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </li>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </ul>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default DraggableCalendarList;
