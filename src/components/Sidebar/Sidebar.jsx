import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faList, faHome, faCalendarCheck, faEnvelope,
    faBarsStaggered, faCalendar, faFileInvoice,
    faMessage, faHardDrive, faImagePortrait, faRightFromBracket
} from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import styles from './Sidebar.module.css';
import profileImagePlaceholder from '../../assets/image.png'; // 기본 프로필 이미지 경로

export default function SideBar({ profile_src = "", onProfileImageChange }) {
    const [toggle, setToggle] = useState(false);
    const fileInputRef = useRef(null);
    const serverUrl = process.env.REACT_APP_SERVER_URL;

    // 세션 스토리지에서 사용자 정보 불러오기
    const [profileImage, setProfileImage] = useState(profileImagePlaceholder); // 기본 이미지로 초기화
    const [userInfo, setUserInfo] = useState({ username: '', email: '' });

    useEffect(() => {
        // 세션 스토리지에서 username 가져오기
        const sessionUserName = sessionStorage.getItem('usersName') || '이름 없음';

        // approvedUserInfo에서 프로필 이미지와 이메일 정보 가져오기
        const approvedUserInfo = JSON.parse(sessionStorage.getItem('approvedUserInfo') || '{}');
        
        // 프로필 이미지가 기본 이미지 경로일 경우, 기본 이미지를 사용
        const storedProfileImage = approvedUserInfo.profileImage === '/images/image.png'
            ? profileImagePlaceholder // 로컬 기본 이미지로 대체
            : approvedUserInfo.profileImage;

        const storedEmail = approvedUserInfo.email || '이메일 없음';

        // 상태 업데이트
        setProfileImage(storedProfileImage); // 프로필 이미지 설정
        setUserInfo({
            username: sessionUserName, // 세션에서 username 가져오기
            email: storedEmail,
        });
    }, [profile_src, serverUrl]); // profile_src가 변경될 때마다 다시 렌더링

    const handleProfileImageClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (file) {
            const formData = new FormData();
            formData.append('file', file);

            try {
                // 이미지 업로드 요청 (백엔드에 POST 요청을 보내 프로필 이미지를 저장)
                const response = await fetch(`${serverUrl}/user-update-request/upload-profile-image`, {
                    method: 'POST',
                    body: formData,
                });

                if (response.ok) {
                    const imageUrl = await response.json(); // 서버에서 제공하는 이미지 URL을 받아옴
                    setProfileImage(imageUrl || profileImagePlaceholder); // 받아온 이미지 URL을 상태에 저장 (없으면 기본 이미지)
                    sessionStorage.setItem('profileImage', imageUrl); // 세션 스토리지에 저장

                    // 상위 컴포넌트에도 알림 (onProfileImageChange 콜백 실행)
                    if (onProfileImageChange) {
                        onProfileImageChange(imageUrl);
                    }
                } else {
                    console.error('프로필 이미지 업로드 실패');
                }
            } catch (error) {
                console.error('Error uploading profile image:', error);
            }
        }
    };

    return (
        <div className={styles.sidebar} style={!toggle ? { width: "100px" } : {}}>
            <div className={styles.sidebar_container} style={!toggle ? { alignItems: "center" } : {}} >
                {/* 사이드바 토글 버튼 */}
                <div className={styles.icon} onClick={() => setToggle(!toggle)}>
                    <FontAwesomeIcon icon={faList} size="2x" /> {/* 아이콘 크기를 2배로 */}
                </div>

                {/* 사용자 정보 영역 */}
                <div className={`${styles.user_info} ${!toggle ? styles.centered : ''}`}>
                    <img
                        src={profileImage || profileImagePlaceholder} // 이미지가 없으면 기본 이미지
                        alt="profile"
                        className={styles.user_img_box}
                        style={!toggle ? { width: "50px", height: "50px" } : { width: "100px", height: "100px" }} // 사이드바가 접힐 때 이미지 크기 줄임
                        onClick={handleProfileImageClick}
                    />
                    {toggle && (
                        <>
                            <h1>{userInfo.username}</h1> {/* 세션에서 가져온 username 출력 */}
                            <p>{userInfo.email}</p> {/* approvedUserInfo에서 가져온 이메일 출력 */}
                        </>
                    )}
                    <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        accept="image/*"
                        onChange={handleFileChange} // 이미지 업로드 처리
                    />
                </div>

                {/* 메뉴 리스트 */}
                <div className={styles.side_group} style={!toggle ? { paddingLeft: "0px" } : {}}>
                    <div className={styles.side_list}>
                        <Link to={`${serverUrl}:3000/`} className={styles.list_item}>
                            <FontAwesomeIcon icon={faHome} size="2x" />
                            {toggle && <span>홈</span>}
                        </Link>
                        <Link to={`${serverUrl}:3000/attendance`} className={styles.list_item}>
                            <FontAwesomeIcon icon={faCalendarCheck} size="2x" />
                            {toggle && <span>근태관리</span>}
                        </Link>
                        <Link to={`${serverUrl}:3000/mailbox`} className={styles.list_item}>
                            <FontAwesomeIcon icon={faEnvelope} size="2x" />
                            {toggle && <span>메일함</span>}
                        </Link>
                        <Link to={`${serverUrl}:3000/Board`} className={styles.list_item}>
                            <FontAwesomeIcon icon={faBarsStaggered} size="2x" />
                            {toggle && <span>게시판</span>}
                        </Link>
                        <Link to={`${serverUrl}:3000/Calendar`} className={styles.list_item}>
                            <FontAwesomeIcon icon={faCalendar} size="2x" />
                            {toggle && <span>캘린더</span>}
                        </Link>
                        <Link to={`${serverUrl}:3000/e-payment`} className={styles.list_item}>
                            <FontAwesomeIcon icon={faFileInvoice} size="2x" />
                            {toggle && <span>전자결제</span>}
                        </Link>
                        <Link to={`${serverUrl}:3000/messenger`} className={styles.list_item}>
                            <FontAwesomeIcon icon={faMessage} size="2x" />
                            {toggle && <span>메신저</span>}
                        </Link>
                        <Link to={`${serverUrl}:3000/resources`} className={styles.list_item}>
                            <FontAwesomeIcon icon={faHardDrive} size="2x" />
                            {toggle && <span>자료실</span>}
                        </Link>
                    </div>

                    {/* 하단 사용자 메뉴 */}
                    <div>
                        <Link to={`${serverUrl}:3000/mypage`} className={styles.list_item}>
                            <FontAwesomeIcon icon={faImagePortrait} size="2x" />
                            {toggle && <span>마이페이지</span>}
                        </Link>
                        <Link to="/users/login" className={styles.list_item}>
                            <FontAwesomeIcon icon={faRightFromBracket} size="2x" />
                            {toggle && <span>로그아웃</span>}
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
