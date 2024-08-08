import React, { useState, useEffect, startTransition } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './DeleteUser.module.css';

axios.defaults.withCredentials = true;

const DeleteUser = () => {
  const [users, setUsers] = useState([]);
  const [selectedUserCode, setSelectedUserCode] = useState('');
  const [selectedUserInfo, setSelectedUserInfo] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const navigate = useNavigate();
  const serverUrl = process.env.REACT_APP_SERVER_URL; // 환경 변수로부터 서버 URL 가져오기

  useEffect(() => {
    axios.get(`${serverUrl}/users/all`)
      .then(response => {
        const usersArray = Array.isArray(response.data) ? response.data : [response.data];
        console.log("Fetched Users:", usersArray);
        setUsers(usersArray);

        const currentUser = sessionStorage.getItem("loginID");
        const currentUserData = usersArray.find(user => user.users_code === currentUser);
        if (currentUserData && currentUserData.users_is_admin) {
          setIsAdmin(true);
        }
      })
      .catch(error => {
        console.error("유저 목록을 가져오는 중 오류 발생:", error);
        alert("유저 목록을 불러오는 중 오류가 발생했습니다.");
      });
  }, [serverUrl]);

  const handleUserChange = (e) => {
    const userCode = e.target.value;
    setSelectedUserCode(userCode);

    if (userCode) {
      const user = users.find(u => u.users_code === userCode);
      setSelectedUserInfo(user);
    } else {
      setSelectedUserInfo(null);
    }
  };

  const handleDelete = () => {
    if (!selectedUserCode) {
      alert("제명할 유저를 선택해주세요.");
      return;
    }

    const userToDelete = users.find(user => user.users_code === selectedUserCode);
    
    if (userToDelete && userToDelete.users_is_admin === 1) {
      alert("관리자는 삭제할 수 없습니다.");
      return;
    }

    if (window.confirm(`정말 이 유저를 제명하시겠습니까?`)) {
      setIsDeleting(true);
      axios.delete(`${serverUrl}/users/code/${selectedUserCode}`)
        .then(() => {
          alert("유저 제명 성공");
          setUsers(users.filter(user => user.users_code !== selectedUserCode));
          setSelectedUserCode('');
          setSelectedUserInfo(null);
          navigate('/users/login'); 
        })
        .catch(error => {
          console.error("유저 제명 중 오류 발생:", error);
          alert("유저 제명 중 오류가 발생했습니다.");
        })
        .finally(() => {
          setIsDeleting(false);
        });
    }
  };

  if (!isAdmin) {
    return <div>관리자만 접근할 수 있습니다.</div>;
  }

  return (
    <div className={styles.deleteUserContainer}>
      <div className={styles.title}>Firmware</div>
      <div className={styles.deleteUserForm}>
        <div className={styles.inputContainer}>
          {users.length === 0 ? (
            <div>No users available</div>
          ) : (
            <select
              value={selectedUserCode}
              onChange={handleUserChange}
            >
              <option value="">유저 선택</option>
              {users.map(user => (
                <option key={user.users_code} value={user.users_code}>
                  {user.users_name} ({user.users_code})
                </option>
              ))}
            </select>
          )}
        </div>
        {selectedUserInfo && (
          <div className={styles.userInfo}>
            <h3>유저 정보</h3>
            <p>이름: {selectedUserInfo.users_name}</p>
            <p>코드: {selectedUserInfo.users_code}</p>
            <p>이메일: {selectedUserInfo.users_email}</p>
            <p>관리자 여부: {selectedUserInfo.users_is_admin ? '예' : '아니오'}</p>
          </div>
        )}
        <button
          className={styles.deleteButton}
          onClick={handleDelete}
          disabled={isDeleting}
        >
          {isDeleting ? "삭제 중..." : "유저 제명"}
        </button>
      </div>
    </div>
  );
};

export default DeleteUser;
