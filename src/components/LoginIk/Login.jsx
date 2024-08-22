import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '../../store/store';
import styles from './Login.module.css';

// 서버 URL을 환경 변수로 설정
const serverUrl = process.env.REACT_APP_SERVER_URL;

axios.defaults.withCredentials = true;

const Login = ({ setIsMypage }) => {
  const { loginID, setLoginID } = useAuthStore();
  const navigate = useNavigate();

  const [auth, setAuth] = useState({ users_code: '', users_password: '' });
  const [isAdmin, setIsAdmin] = useState(() => sessionStorage.getItem('isAdmin') === 'true');

  useEffect(() => {
    sessionStorage.setItem('isAdmin', isAdmin);
  }, [isAdmin]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAuth((prev) => ({ ...prev, [name]: value }));
  };

  const fetchUserProfile = async (userCode, usersSeq) => {
    try {
      const response = await axios.get(`${serverUrl}/user-profile`, {
        params: { userCode: userCode },
      });
      const { rank, employeeId, joinDate, phoneNumber, email, address, zipCode, detailedAddress, profilePictureUrl } = response.data;

      // 세션에 userProfile 정보 저장
      sessionStorage.setItem('rank', rank || '');
      sessionStorage.setItem('employeeId', employeeId || '');
      sessionStorage.setItem('joinDate', joinDate || '');

      // approvedUserInfo에도 필요한 정보 저장
      sessionStorage.setItem('approvedUserInfo', JSON.stringify({
        phone: phoneNumber || '',
        email: email || '',
        address: address || '',
        zipCode: zipCode || '',
        detailedAddress: detailedAddress || '',
        profileImage: profilePictureUrl || '',
        rank: rank || '',
        employeeId: employeeId || '',
        joinDate: joinDate || ''
      }));
    } catch (error) {
      console.error('Error fetching user profile:', error);
      alert('프로필 정보를 가져오는 중 오류가 발생했습니다.');
    }
  };

  // 휴가 상태 확인 및 필요시 지급
  const checkVacationStatus = (users_seq) => {
    const joinDate = sessionStorage.getItem('joinDate');  // 입사일 가져오기

    axios.post(`${serverUrl}/vacation/check`, { users_seq, joinDate })  // 입사일 함께 전송
      .then((response) => {
        if (response.data.message === "휴가가 지급되었습니다") {
          console.log("최초 로그인 유저에게 휴가 지급 됌");
        } else if (response.data.message === "잔여 휴가 체크 완료") {
          console.log("잔여 휴가 상태 확인 완료:", response.data);
        }
      })
      .catch((error) => {
        console.error("휴가 체크 중 오류 발생:", error);
        alert("휴가 상태 확인 중 오류가 발생했습니다.");
      });
  };

  const handleLogin = () => {
    console.log('로그인 시도 중:', auth);
    
    axios.post(`${serverUrl}/auth`, auth)
      .then(async (resp) => {
        console.log('서버 응답:', resp.data);
        const { users_code, users_name, users_is_admin, users_seq } = resp.data;
  
        sessionStorage.setItem('loginID', users_code);
        sessionStorage.setItem('usersName', users_name); 
        sessionStorage.setItem('usersSeq', users_seq);
  
        setLoginID(users_code);
        const isAdmin = users_is_admin === 1;
        setIsAdmin(isAdmin);

        // 프로필 정보 가져오기 및 세션에 저장
        fetchUserProfile(users_code, users_seq);

        // 로그인 성공 후 휴가 상태 확인
        checkVacationStatus(users_seq);
  
        alert('로그인 성공');
  
        if (isAdmin) {
          navigate('/users/login');
        } else {
          navigate('/');
        }
      })
      .catch((err) => {
        console.error('로그인 오류:', err);
        if (err.response && err.response.status === 401) {
          alert('사원 코드 또는 패스워드를 다시 확인해주세요.');
        } else {
          alert('서버 오류가 발생했습니다. 관리자에게 문의하세요.');
        }
      });
  };
  

  const handleLogout = () => {
    axios.post(`${serverUrl}/auth/logout`)
      .then(() => {
        console.log('로그아웃 성공');
        sessionStorage.removeItem('loginID');
        sessionStorage.removeItem('usersName');
        sessionStorage.removeItem('usersSeq');
        sessionStorage.removeItem('rank'); 
        sessionStorage.removeItem('employeeId'); 
        sessionStorage.removeItem('joinDate'); 
        sessionStorage.removeItem('isAdmin');
        sessionStorage.removeItem('approvedUserInfo');

        setLoginID('');
        setAuth({ users_code: '', users_password: '' });
        setIsAdmin(false);
        alert('로그아웃 성공');
        navigate('/users/login');
      })
      .catch((err) => {
        console.error('로그아웃 오류:', err);
        alert('로그아웃 실패');
      });
  };

  const handleMemberout = () => {
    if (!window.confirm('정말 탈퇴하시겠습니까?')) {
      return;
    }
    axios.delete(`${serverUrl}/users`)
      .then(() => {
        console.log('회원 탈퇴 성공');
        sessionStorage.removeItem('loginID');
        sessionStorage.removeItem('usersName');
        sessionStorage.removeItem('usersSeq');
        sessionStorage.removeItem('rank'); 
        sessionStorage.removeItem('employeeId'); 
        sessionStorage.removeItem('joinDate'); 
        sessionStorage.removeItem('isAdmin');

        setLoginID('');
        setAuth({ users_code: '', users_password: '' });
        setIsAdmin(false);
        alert('회원 탈퇴 성공');
        navigate('/users/login');
      })
      .catch((err) => {
        console.error('회원 탈퇴 오류:', err);
        alert('회원 탈퇴 실패');
      });
  };

  const handleDeleteUser = () => {
    navigate('/admin/deleteuser');
  };

  const handleUserRegister = () => {
    navigate('/admin');
  };

  const handleGoToMain = () => {
    navigate('/');
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.title}>Firmware</div>
      <div className={styles.loginForm}>
        <div className={styles.tabs}>
          <span className={loginID ? '' : styles.active}>{loginID ? '환영합니다' : '로그인'}</span>
        </div>
        {loginID ? (
          <>
            <div className={styles.welcomeMessage}>
              <span className={styles.userName}><strong>{loginID}</strong> 님 환영합니다.</span>
            </div>
            <div className={styles.actionButtons}>
              <button className={styles.actionButton} onClick={handleLogout}>로그아웃</button>
              <button className={styles.actionButton} onClick={handleMemberout}>회원탈퇴</button>
              {isAdmin && (
                <>
                  <button className={styles.actionButton} onClick={handleUserRegister}>유저 & 사원 등록</button>
                  <button className={styles.actionButton} onClick={handleDeleteUser}>사원 제명</button>
                  <button className={styles.actionButton} onClick={handleGoToMain}>메인으로 이동</button>
                </>
              )}
            </div>
          </>
        ) : (
          <>
            <div className={styles.inputContainer}>
              <input type="text" name="users_code" placeholder="사원 코드 입력" value={auth.users_code} onChange={handleChange}/> 
              <input type="password" name="users_password" placeholder="비밀번호 입력" value={auth.users_password} onChange={handleChange}/>
            </div>
            <button className={styles.loginButton} onClick={handleLogin}>로그인</button>
          </>
        )}
      </div>
    </div>
  );
};

export default Login;
