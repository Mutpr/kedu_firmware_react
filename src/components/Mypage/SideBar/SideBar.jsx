import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faList, faUser, faHome, faCalendar, faImagePortrait, faRightFromBracket, faEnvelope, faBarsStaggered, faFileInvoice, faMessage, faHardDrive } from '@fortawesome/free-solid-svg-icons';
import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import styles from './SideBar.module.css';

export default function SideBar({ profile_src = "", username, useremail, onProfileImageChange }) {
    const [toggle, setToggle] = useState(false);
    const fileInputRef = useRef(null);
    const serverUrl = process.env.REACT_APP_SERVER_URL;

    const handleProfileImageClick = () => {
        fileInputRef.current.click();
    };

    return (
        <div className={styles.sidebar} style={!toggle ? { width: "50px" } : {}}>
            <div className={styles.sidebar_container} style={!toggle ? { alignItems: "center" } : {}} >
                {/* 사이드바 토글 버튼 */}
                <div className={styles.icon} onClick={() => setToggle(!toggle)}>
                    <FontAwesomeIcon icon={faList} />
                </div>

                {/* 회사명 */}
                <div className={styles.company_name}>
                    {toggle && <h1>Firmware</h1>}
                </div>

                {/* 사용자 정보 영역 */}
                <div className={styles.user_info} style={!toggle ? { paddingLeft: "0px" } : {}}>
                    {
                        profile_src === "" &&
                        <div className={styles.user_img_box} style={!toggle ? { width: "21px", height: "21px" } : {}} onClick={handleProfileImageClick}>
                            <FontAwesomeIcon icon={faUser} className={styles.user_img} style={!toggle ? { width: "18px" } : {}} />
                        </div>
                    }
                    {
                        profile_src !== "" &&
                        <img src={profile_src} alt="profile" className={styles.user_img_box} style={!toggle ? { width: "21px", height: "21px" } : {}} onClick={handleProfileImageClick} />
                    }
                    {toggle &&
                        <>
                            <h1>{username}</h1>
                            <p>{useremail}</p>
                        </>
                    }
                    <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        accept="image/*"
                        onChange={onProfileImageChange}
                    />
                </div>

                {/* 메뉴 리스트 */}
                <div className={styles.side_group} style={!toggle ? { paddingLeft: "0px" } : {}}>
                    <div className={styles.side_list}>
                        <div className={styles.list_item}>
                            <FontAwesomeIcon icon={faHome} />
                            {toggle && (
                                <a href={`${serverUrl}:3000/`} className={styles.link}>홈</a>
                            )}
                        </div>
                        <div className={styles.list_item}>
                            <FontAwesomeIcon icon={faEnvelope} />
                            {toggle && (
                                <a href={`${serverUrl}:3000/mailbox`} className={styles.link}>메일함</a>
                            )}
                        </div>
                        <div className={styles.list_item}>
                            <FontAwesomeIcon icon={faBarsStaggered} />
                            {toggle && (
                                <Link to={`${serverUrl}/Board`} className={styles.link}>게시판</Link>
                            )}
                        </div>
                        <div className={styles.list_item}>
                            <FontAwesomeIcon icon={faCalendar} />
                            {toggle && (
                                <a href={`${serverUrl}:3000/calendar`} className={styles.link}>캘린더</a>
                            )}
                        </div>
                        <div className={styles.list_item}>
                            <FontAwesomeIcon icon={faFileInvoice} />
                            {toggle && (
                                <a href={`${serverUrl}:3000/e-payment`} className={styles.link}>전자결제</a>
                            )}
                        </div>
                        <div className={styles.list_item}>
                            <FontAwesomeIcon icon={faMessage} />
                            {toggle && (
                                <Link to={`${serverUrl}:3000/messenger`} className={styles.link}>메신저</Link>
                            )}
                        </div>
                        <div className={styles.list_item}>
                            <FontAwesomeIcon icon={faHardDrive} />
                            {toggle && (
                                <a href={`${serverUrl}:3000/resources`} className={styles.link}>자료실</a>
                            )}
                        </div>
                    </div>

                    {/* 하단 사용자 메뉴 */}
                    <div>
                        <div className={styles.list_item}>
                            <FontAwesomeIcon icon={faImagePortrait} />
                            {toggle && (
                                <Link to={`${serverUrl}:3000/mypage`} className={styles.link}>마이페이지</Link>
                            )}
                        </div>
                        <div className={styles.list_item}>
                            <FontAwesomeIcon icon={faRightFromBracket} />
                            {toggle && (
                                <Link to="/users/login" className={styles.link}>로그아웃</Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
