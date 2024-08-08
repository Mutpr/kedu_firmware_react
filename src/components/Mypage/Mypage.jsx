import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styles from './Mypage.module.css';
import AddressModal from './Address/Address';
import ApprovalListModal from './Approval/Approval_List';
import SideBar from './SideBar/SideBar';
import profileImagePlaceholder from '../../assets/image.png';

axios.defaults.withCredentials = true;

const Mypage = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState({
    usersSeq: '',
    phone: '',
    email: '',
    address: '',
    zipCode: '',  
    detailedAddress: '',  
    reason: '',
    approver: '',
    applicationDate: '',
    applicationStatus: '',
    profileImage: profileImagePlaceholder,
    rank: '',   
    employeeId: '', 
    joinDate: '', 
    name: '', 
  });

  const [isProfileEdit, setIsProfileEdit] = useState(false);
  const [isAddressOpen, setIsAddressOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isApprovalListOpen, setIsApprovalListOpen] = useState(false);
  const [approvalList, setApprovalList] = useState([]);
  const [profileImagePreview, setProfileImagePreview] = useState(profileImagePlaceholder);
  const [isLoading, setIsLoading] = useState(true);

  // 환경 변수에서 서버 URL을 가져옵니다
  const serverUrl = process.env.REACT_APP_SERVER_URL;

  const formatDateToString = (date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;
  };

  const fetchUserProfile = useCallback(async () => {
    const loginID = sessionStorage.getItem('loginID');
    const usersSeq = sessionStorage.getItem('usersSeq');
    const usersName = sessionStorage.getItem('usersName'); 
    const rank = sessionStorage.getItem('rank');
    const employeeId = sessionStorage.getItem('employeeId');

    if (!usersSeq) {
      console.error('usersSeq is missing.');
      alert('usersSeq 값이 누락되었습니다. 다시 시도해 주세요.');
      navigate('/users/login');
      return;
    }

    try {
      const response = await axios.get(`${serverUrl}/user-update-request/approval-list`);
      const latestRequest = response.data.find(item => item.usersSeq === parseInt(usersSeq) && (item.requestStatus === '승인됨' || item.requestStatus === '거부됨'));

      if (latestRequest) {
        setUserInfo(prevState => ({
          ...prevState,
          phone: latestRequest.phoneNumber,
          email: latestRequest.email,
          address: latestRequest.address,
          zipCode: latestRequest.zipCode || '',
          detailedAddress: latestRequest.detailedAddress || '',
          reason: latestRequest.requestReason,
          approver: usersName || latestRequest.approver,
          applicationDate: latestRequest.requestTimestamp,
          applicationStatus: latestRequest.requestStatus,
          profileImage: latestRequest.profileImage || profileImagePlaceholder,
          rank: rank || latestRequest.rank,
          employeeId: employeeId || latestRequest.employeeId,
          joinDate: latestRequest.joinDate ? formatDateToString(new Date(latestRequest.joinDate)) : '',
          name: usersName || latestRequest.userName,
        }));
        setProfileImagePreview(latestRequest.profileImage || profileImagePlaceholder);
        
        if (latestRequest.requestStatus === '승인됨') {
          sessionStorage.setItem('approvedUserInfo', JSON.stringify({
            phone: latestRequest.phoneNumber,
            email: latestRequest.email,
            address: latestRequest.address,
            zipCode: latestRequest.zipCode,
            detailedAddress: latestRequest.detailedAddress,
            profileImage: latestRequest.profileImage,
            rank: latestRequest.rank,
            employeeId: latestRequest.employeeId,
            joinDate: latestRequest.joinDate,
          }));
        }
      } else {
        const userProfileResponse = await axios.get(`${serverUrl}/user-profile`, {
          params: { userCode: loginID }
        });

        const data = userProfileResponse.data;
        setUserInfo({
          usersSeq: usersSeq,
          phone: data.phoneNumber,
          email: data.email,
          address: data.address,
          zipCode: data.zipCode || '',  
          detailedAddress: data.detailedAddress || '',  
          reason: '',
          approver: usersName || data.name || '', 
          applicationDate: '',
          applicationStatus: sessionStorage.getItem('applicationStatus') || '', 
          profileImage: data.profilePictureUrl || profileImagePlaceholder,
          rank: rank || data.rank,
          employeeId: data.employeeId,
          joinDate: data.joinDate ? formatDateToString(new Date(data.joinDate)) : '',
          name: data.name || '', 
        });

        setProfileImagePreview(data.profilePictureUrl || profileImagePlaceholder);

        sessionStorage.setItem('approvedUserInfo', JSON.stringify({
          phone: data.phoneNumber,
          email: data.email,
          address: data.address,
          zipCode: data.zipCode,
          detailedAddress: data.detailedAddress,
          profileImage: data.profilePictureUrl,
          rank: data.rank,
          employeeId: data.employeeId,
          joinDate: data.joinDate,
        }));
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      alert('사용자 정보를 가져오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [serverUrl, navigate]);

  useEffect(() => {
    const loginID = sessionStorage.getItem('loginID');
    const usersSeq = sessionStorage.getItem('usersSeq');
    const usersName = sessionStorage.getItem('usersName');
    const rank = sessionStorage.getItem('rank');
    const employeeId = sessionStorage.getItem('employeeId');
    const isAdmin = sessionStorage.getItem('isAdmin') === 'true';

    console.log('Session Storage Values:', { loginID, usersSeq, usersName, rank, employeeId, isAdmin });

    if (!loginID || !usersSeq) {
      console.error('User code 또는 usersSeq 값이 세션에 없습니다');
      alert('로그인 정보가 없습니다. 다시 로그인해주세요.');
      navigate('/users/login');
      return;
    }

    setUserInfo(prevState => ({
      ...prevState,
      usersSeq: usersSeq,
      rank: rank,
      employeeId: employeeId,
    }));
    setIsAdmin(isAdmin);

    fetchUserProfile();
  }, [navigate, fetchUserProfile]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserInfo(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleAddressComplete = (data) => {
    let fullAddress = data.address;
    let extraAddress = '';
    if (data.addressType === 'R') {
      if (data.bname !== '') {
        extraAddress += data.bname;
      }
      if (data.buildingName !== '') {
        extraAddress += (extraAddress !== '' ? ', ' + data.buildingName : data.buildingName);
      }
      fullAddress += (extraAddress !== '' ? ' (' + extraAddress + ')' : '');
    }
    setUserInfo(prevState => ({
      ...prevState,
      address: fullAddress,
      zipCode: data.zonecode, 
      detailedAddress: '', 
    }));
    setIsAddressOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (userInfo.applicationStatus === '대기 중') {
      alert('이미 "대기 중" 상태인 수정 요청이 존재합니다. 승인이 완료된 후에 다시 시도해 주세요.');
      return;
    }

    if (!userInfo.usersSeq) {
      console.error('usersSeq is missing.');
      alert('usersSeq 값이 누락되었습니다. 다시 시도해 주세요.');
      return;
    }

    try {
      const currentDate = formatDateToString(new Date());

      const previousUserInfo = {
        phone: userInfo.phone,
        email: userInfo.email,
        address: userInfo.address,
        zipCode: userInfo.zipCode,
        detailedAddress: userInfo.detailedAddress,
        profileImage: userInfo.profileImage,
        rank: userInfo.rank,
        employeeId: userInfo.employeeId,
        joinDate: userInfo.joinDate,
      };

      sessionStorage.setItem('previousUserInfo', JSON.stringify(previousUserInfo));

      const updatedUserInfo = {
        usersSeq: userInfo.usersSeq,
        phoneNumber: userInfo.phone,
        email: userInfo.email,
        address: userInfo.address,
        zipCode: userInfo.zipCode, 
        detailedAddress: userInfo.detailedAddress, 
        requestReason: userInfo.reason,
        requestStatus: '대기 중',
        requestTimestamp: currentDate,
        profileImage: userInfo.profileImage,
        rank: userInfo.rank,
        employeeId: userInfo.employeeId,
        joinDate: userInfo.joinDate,
        approver: sessionStorage.getItem('loginID'),
      };

      await axios.post(`${serverUrl}/user-update-request`, updatedUserInfo);
      alert('수정 요청이 성공적으로 제출되었습니다.');

      setUserInfo(prevState => ({
        ...prevState,
        approver: sessionStorage.getItem('loginID'),
        applicationDate: currentDate,
        applicationStatus: '대기 중',
      }));
    } catch (error) {
      console.error('Error submitting update request:', error);
      alert('수정 요청 제출 중 오류가 발생했습니다.');
    }
  };

  const handleApprove = async (id) => {
    try {
      await axios.post(`${serverUrl}/user-update-request/approve/${id}`);
      alert('승인되었습니다.');
      fetchUserProfile();
      setIsApprovalListOpen(false);
    } catch (error) {
      console.error('Error approving request:', error);
    }
  };

  const handleReject = async (id) => {
    try {
        await axios.post(`${serverUrl}/user-update-request/reject/${id}`);

        const approvedUserInfo = JSON.parse(sessionStorage.getItem('approvedUserInfo'));
        if (approvedUserInfo) {
            setUserInfo(prevState => ({
                ...prevState,
                ...approvedUserInfo,
                applicationStatus: '거부됨',
                applicationDate: '',
            }));
        }

        alert('거부되었습니다.');
        fetchUserProfile();
        setIsApprovalListOpen(false);
    } catch (error) {
        console.error('Error rejecting request:', error);
    }
};


  const handleProfileImageChange = async (e) => {
    const file = e.target.files[0];
    
    const maxSize = 10 * 1024 * 1024;
  
    if (file && file.size > maxSize) {
      alert('파일 사이즈가 너무 큽니다. 10MB 이하의 파일만 업로드할 수 있습니다.');
      return;
    }
  
    if (file) {
      const formData = new FormData();
      formData.append('file', file);
  
      try {
        const uploadResponse = await axios.post(`${serverUrl}/user-update-request/upload-profile-image`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
  
        const profileImageUrl = uploadResponse.data;
        
        setProfileImagePreview(profileImageUrl);
        setUserInfo(prevState => ({
          ...prevState,
          profileImage: profileImageUrl
        }));
      } catch (error) {
        console.error('Error uploading profile image:', error);
        alert('프로필 이미지 업로드 중 오류가 발생했습니다.');
      }
    }
  };

  const loadApprovalList = () => {
    axios.get(`${serverUrl}/user-update-request/approval-list`)
      .then(response => {
        const pendingRequests = response.data.filter(item => item.requestStatus === '대기 중');
        setApprovalList(pendingRequests);
      })
      .catch(error => console.error('Error fetching approval list:', error));
  };

  useEffect(() => {
    if (isAdmin && isApprovalListOpen) {
      loadApprovalList();
    }
  }, [isAdmin, isApprovalListOpen]);

  if (isLoading) {
    return <div>로딩 중...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.sub_container}>
        <SideBar profile_src={profileImagePreview} username={userInfo.name} useremail={userInfo.email} onProfileImageChange={handleProfileImageChange} />
        <div className={styles.category}>
          <section className={styles.profile}>
            {isProfileEdit ? (
              <form onSubmit={(e) => { e.preventDefault(); setIsProfileEdit(false); }}>
                <div className={styles.formGroup}>
                  <label htmlFor="profileImage">프로필 이미지</label>
                  <input type="file" id="profileImage" name="profileImage" accept="image/*" onChange={handleProfileImageChange} />
                </div>
                <button type="submit">수정 완료</button>
              </form>
            ) : (
              <div className={styles.profileInfo}>
                <img src={userInfo.profileImage} alt="프로필 이미지" className={styles.profileImage} />
                <div>
                  <h2>{userInfo.name || '이름 없음'}</h2>  
                  <p>직책: {userInfo.rank || ''}</p>  
                  <p>사번: {userInfo.employeeId || ''}</p>  
                  <p>입사일: {userInfo.joinDate || ''}</p> 
                  <p>이메일: {userInfo.email || ''}</p>  
                </div>
              </div>
            )}
          </section>
        </div>
        <div className={styles.content}>
          <section className={styles.details}>
            <h2>개인 정보 수정</h2>
            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label htmlFor="phone">전화번호</label>
                <input type="tel" id="phone" name="phone" value={userInfo.phone || ''} onChange={handleInputChange} />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="email">이메일</label>
                <input type="email" id="email" name="email" value={userInfo.email || ''} onChange={handleInputChange} readOnly />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="address">주소</label>
                <input type="text" id="address" name="address" value={userInfo.address || ''} onClick={() => setIsAddressOpen(true)} readOnly />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="zipCode">우편 번호</label>
                <input type="text" id="zipCode" name="zipCode" value={userInfo.zipCode || ''} onChange={handleInputChange} />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="detailedAddress">상세 주소</label>
                <input type="text" id="detailedAddress" name="detailedAddress" value={userInfo.detailedAddress || ''} onChange={handleInputChange} />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="reason">변경 사유</label>
                <input type="text" id="reason" name="reason" value={userInfo.reason || ''} onChange={handleInputChange} />
              </div>

              <h3>수정 대기 정보</h3>
              <div className={styles.formGroup}>
                <label htmlFor="approver">신청자</label>
                <input type="text" id="approver" name="approver" value={userInfo.approver || ''} readOnly />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="applicationDate">신청일</label>
                <input type="text" id="applicationDate" name="applicationDate" value={userInfo.applicationDate || ''} readOnly />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="applicationStatus">처리 결과</label>
                <input type="text" id="applicationStatus" name="applicationStatus" value={userInfo.applicationStatus || ''} readOnly />
              </div>
              <button type="submit"className={styles['mypage-button']} disabled={userInfo.applicationStatus === '대기 중'}> 수정 신청 </button>
            </form>
            {isAdmin && (
              <div className={styles.adminActions}>
                <button onClick={() => setIsApprovalListOpen(true)}>승인 리스트</button>
              </div>
            )}
          </section>
        </div>
      </div>
      {isAddressOpen && (
        <AddressModal
          onClose={() => setIsAddressOpen(false)}
          onComplete={handleAddressComplete}
        />  
      )}
      {isApprovalListOpen && isAdmin && (
        <ApprovalListModal
          onClose={() => setIsApprovalListOpen(false)}
          approvalList={approvalList}
          handleApprove={handleApprove}
          handleReject={handleReject}
        />
      )}
    </div>
  );
};

export default Mypage;
