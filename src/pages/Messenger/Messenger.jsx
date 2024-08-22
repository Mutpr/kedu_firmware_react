import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import Header from '../../components/Header/Header';
import Sidebar from '../../components/Sidebar/Sidebar';
import EmojiPicker from 'emoji-picker-react'; // 이모티콘 선택 라이브러리
import { FaSmile } from 'react-icons/fa'; // 이모티콘 버튼을 위한 아이콘
import styles from './Messenger.module.css';

axios.defaults.withCredentials = true;

const Messenger = () => {
  const [messages, setMessages] = useState([]); // 전체 메시지 저장
  const [currentChat, setCurrentChat] = useState([]); // 선택된 유저와의 채팅만 저장
  const [inputMessage, setInputMessage] = useState('');
  const [username, setUsername] = useState('');
  const [socket, setSocket] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false); // 이모티콘 창 표시 상태
  const unreadCountsRef = useRef({});
  const messagesEndRef = useRef(null);
  const messageInputRef = useRef(null); // contenteditable 영역을 참조하는 Ref

  const maxLength = 1000; // 글자 수 제한

  const serverUrl = process.env.REACT_APP_SERVER_URL;

  const showMessage = useCallback(
    (message) => {
      setMessages((prevMessages) => [...prevMessages, message]); // 전체 메시지에 저장
      if (message.sender_username === selectedUser?.users_name || message.receiver_username === selectedUser?.users_name) {
        setCurrentChat((prevMessages) => [...prevMessages, message]); // 선택된 유저와의 채팅에만 추가
      }
      scrollToBottom();
    },
    [selectedUser]
  );

  useEffect(() => {
    const loginID = sessionStorage.getItem('loginID');
    if (loginID) {
      // 두 개의 API 호출을 병렬로 실행
      const fetchUsers = axios.get(`${serverUrl}/users/all`);
      const fetchEmployees = axios.get(`${serverUrl}/employees/all`);

      Promise.all([fetchUsers, fetchEmployees])
        .then(([usersResponse, employeesResponse]) => {
          const users = usersResponse.data;
          const employees = employeesResponse.data;

          // users 데이터와 employees 데이터를 매칭
          const mergedUsers = users.map((user) => {
            const employee = employees.find((emp) => emp.user_seq === user.users_seq);
            return {
              ...user,
              rank_title: user.users_name === 'admin' ? '관리자' : (employee?.rank_title || '직급 없음'),
              unit_title: user.users_name === 'admin' ? '' : (employee?.unit_title || '부서 없음'),
            };
          });

          // 로그인한 유저를 찾음
          const currentUser = mergedUsers.find((user) => user.users_code === loginID);
          if (currentUser) {
            setUsername(currentUser.users_name);
            setUsers(mergedUsers.filter((user) => user.users_name !== currentUser.users_name));

            axios
              .get(`${serverUrl}/messages/unread/${currentUser.users_name}`)
              .then((res) => {
                unreadCountsRef.current = res.data;
              })
              .catch((error) => {
                console.error('Error fetching unread messages:', error);
              });
          } else {
            console.error('Unable to find logged-in user information.');
          }
        })
        .catch((error) => {
          console.error('Error fetching user or employee information:', error);
        });
    }

    const wsServerUrl = `${serverUrl.replace(/^http(s?):\/\//, 'ws://')}/ws/chat`;
    const webSocket = new WebSocket(wsServerUrl);

    webSocket.onopen = () => {
      console.log('Connected to WebSocket');
      setSocket(webSocket);
    };

    webSocket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log('Received message:', message);

      if (message.receiver_username === username) {
        unreadCountsRef.current[message.sender_username] =
          (unreadCountsRef.current[message.sender_username] || 0) + 1;
        localStorage.setItem('unreadCounts', JSON.stringify(unreadCountsRef.current));
      }

      showMessage(message); 
    };

    webSocket.onclose = () => {
      console.log('WebSocket connection closed');
      setSocket(null);
    };

    return () => {
      if (webSocket) {
        webSocket.close();
      }
    };
  }, [serverUrl, username, showMessage]);

  const selectUser = async (user) => {
    setSelectedUser(user);

    try {
      const response = await axios.get(`${serverUrl}/messages/chat/${username}/${user.users_name}`);
      setCurrentChat(response.data); // 선택된 유저와의 채팅만 불러옴

      await axios.post(`${serverUrl}/messages/read/${username}/${user.users_name}`);

      // 알람 카운트를 0으로 설정하고 상태를 업데이트
      unreadCountsRef.current[user.users_name] = 0;
      localStorage.setItem('unreadCounts', JSON.stringify(unreadCountsRef.current));
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentChat]);

  const sendMessage = useCallback(() => {
    const content = messageInputRef.current.innerText.trim();
    if (content === '') {
      console.error('Cannot send an empty message');
      return;
    }

    if (!username.trim() || !selectedUser) {
      console.error('User name or selected user is required');
      return;
    }

    if (socket && socket.readyState === WebSocket.OPEN) {
      const message = {
        sender_username: username,
        receiver_username: selectedUser.users_name,
        content: content,
        send_date: new Date().toISOString(),
      };

      socket.send(JSON.stringify(message));
      messageInputRef.current.innerText = ''; // 메시지 전송 후 입력창 초기화
    } else {
      console.error('WebSocket is not connected');
    }
  }, [username, selectedUser, socket]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        sendMessage();
      }
    },
    [sendMessage]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  const handleInputChange = (e) => {
    const input = messageInputRef.current.innerText;
    if (input.length > maxLength) {
      alert(`메시지는 최대 ${maxLength}자까지 입력 가능합니다.`);
      messageInputRef.current.innerText = input.slice(0, maxLength);
    }
  };

  const onEmojiClick = (emojiObject) => {
    if (messageInputRef.current.innerText.length + emojiObject.emoji.length <= maxLength) {
      messageInputRef.current.innerText += emojiObject.emoji; // 이모티콘 추가
    } else {
      alert(`이모티콘을 추가하면 ${maxLength}자를 초과합니다.`);
    }
  };

  return (
    <div className={styles.messengerContainer}>
      <Header />
      <div className={styles.mainContent}>
        <Sidebar />
        <div className={styles.messengerBody}>
          <div className={styles.messengerSidebar}>
            <div className={styles.sidebarHeader}>유저 목록</div>
            <ul>
              {users.map((user) => (
                <li key={user.users_code} onClick={() => selectUser(user)}>
                  {user.users_name} ({user.rank_title} / {user.unit_title})
                  {unreadCountsRef.current[user.users_name] > 0 && (
                    <span className={styles.unreadBadge}>
                      {unreadCountsRef.current[user.users_name]}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {showEmojiPicker && (
            <div className={styles.emojiPickerPopup}>
              <EmojiPicker onEmojiClick={onEmojiClick} />
            </div>
          )}

          <div className={styles.messengerMain}>
            <div className={styles.chatHeader}>
              채팅방: {selectedUser ? selectedUser.users_name : '선택된 사용자가 없습니다'}
            </div>
            <div className={styles.messengerChat}>
              <ul>
                {currentChat.map((msg, index) => (
                  <li key={index} className={styles.messageContainer}>
                    {msg.sender_username === username ? (
                      <div className={styles.messageSentWrapper}>
                        <div className={styles.messageSent}>
                          {msg.content}
                          <div className={styles.messageTimeLeft}>
                            {new Date(msg.send_date).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className={styles.messageReceivedWrapper}>
                        <div className={styles.senderName}>{msg.sender_username}</div>
                        <div className={styles.messageReceived}>
                          {msg.content}
                          <div className={styles.messageTimeRight}>
                            {new Date(msg.send_date).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    )}
                  </li>
                ))}
                <div ref={messagesEndRef} />
              </ul>
            </div>
            <div className={styles.messageBox}>
              <button
                className={styles.emojiButton}
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              >
                <FaSmile />
              </button>
              <div
                className={styles.editableDiv}
                contentEditable="true"
                ref={messageInputRef}
                onInput={handleInputChange}
                placeholder="메시지를 입력하세요..."
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messenger;
