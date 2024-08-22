import React, { useRef, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './CreateMail.module.css';
//
import { Editor } from '@toast-ui/editor';

const serverUrl = process.env.REACT_APP_SERVER_URL;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 파일 첨부 크기 제한 5MB로 설정

const CreateMail = () => {
  // 웹 에디터
  const editorRef = useRef(null);
  const [editorInstance, setEditorInstance] = useState(null);
  useEffect(() => {
    if (editorRef.current && !editorInstance) {
        const instance = new Editor({
            el: editorRef.current,
            height: '400px',
            // initialEditType: 'markdown',
            initialEditType: 'wysiwyg',
            previewStyle: 'vertical',
        });

        instance.setMarkdown('');
        setEditorInstance(instance);
    }
}, [editorRef, editorInstance]);

  //
  const location = useLocation(); // 로케이션
  const navigate = useNavigate(); // 메일이 성공적으로 작성된 후 메일함으로 이동시키기 위함
  const [to, setTo] = useState(''); // 받는사람
  const [subject, setSubject] = useState(''); // 제목
  const [message, setMessage] = useState(''); // 내용
  const [attachments, setAttachments] = useState([]); // 파일첨부

  //부서
  const [showDepartmentList, setShowDepartmentList] = useState(false); // 부서 이메일 목록 표시 상태
  const [departmentUsers, setDepartmentUsers] = useState([]); // 부서 이메일 목록 데이터
  

  

  const fetchDepartmentEmails = async () => {
    try {
      // 로그인된 사용자의 ID를 기반으로 부서 이메일 및 이름 목록 요청
      console.log("토글 실행")

      const loginID = sessionStorage.getItem("loginID");
      const response = await axios.get(`${serverUrl}/users/${loginID}/departmentmemberinfo`);
      setDepartmentUsers(response.data);
      console.log(departmentUsers);
    } catch (error) {
      console.error('부서 이메일 목록을 가져오는 중 오류가 발생했습니다.', error);
    }
  };

  // 회신 메일인지 여부를 확인하고, replyToMailId를 가져옴
  const replyToMailId = location.state?.replyToMailId || null;
  if(replyToMailId){
    console.log("회신 요청입니다.")

  }else if(replyToMailId == null){
    console.log("메일 작성 요청입니다.")
  }

  //회신일때 input에 회신자의 이메일을 찾아서 넣어줌
  useEffect(() => {
    if (replyToMailId) {
      fetchReplyToEmail(replyToMailId);
    }
  }, [replyToMailId]);

  const fetchReplyToEmail = async (mailId) => {
    try {
      const response = await axios.get(`${serverUrl}/mail/${mailId}/replyemail`);
      setTo(response.data); // 회신자의 이메일을 to 상태에 설정
    } catch (error) {
      console.error('회신자 이메일을 가져오는 중 오류가 발생했습니다.', error);
    }
  };



  const handleAddAttachment = () => {
    // 현재 첨부 파일의 수가 10개 미만일 때만 첨부 항목을 추가
    if (attachments.length < 10) {
      setAttachments([...attachments, '']);
    } else {
      alert('최대 10개의 파일만 첨부할 수 있습니다.');
    }
  };
  

  const handleFileChange = (e, index) => {
    const file = e.target.files[0];
  
    // 파일 크기 제한
    if (file.size > MAX_FILE_SIZE) {
      alert('파일 크기는 5MB를 초과할 수 없습니다.');
      e.target.value = '';  // 파일 input을 초기화하여 첨부되지 않도록 함
      return;
    }
  
    const files = [...attachments];
    files[index] = file;
    setAttachments(files);
  };
  

  // 제목 길이 제어 로직
  // 제목 길이가 100자가 넘어가면 제한에 걸리고, 초과된 부분은 잘라내어 저장함
  const handleSubjectChange = (e) => {
    let inputSubject = e.target.value;
    if (inputSubject.length > 50) {
      inputSubject = inputSubject.substring(0, 50); // 100자까지만 잘라내기
      alert('제목은 최대 50자까지만 입력 가능합니다. 초과된 부분은 잘라낼게요.');
    }
    setSubject(inputSubject);
  };
  
  const handleSubmit = async () => { 
    // async -> await 키워드를 사용하기위하여 필요
    // -> 에러 핸들링을 간단하게 하기위함


    // HTML 내용을 가져와 <p> 태그 제거
  const content = editorInstance.getHTML(); // 여기서 getHTML()을 호출해야 함
  
  setMessage(content);


    console.log(to);
    console.log(subject);
    console.log(content)
    // console.log(message);

    
    
    

    // FormData 객체에 폼데이터를 추가하고 서버로 전송
    const formData = new FormData();
    formData.append('to', to);
    formData.append('subject', subject);
    formData.append('message', content);
    attachments.forEach((file) => {
      formData.append(`attachments`, file);
    });
    console.log("파일 처리 확인 중")

    // 회신 메일일 경우 replyToMailId 추가
    if (replyToMailId) {
      formData.append('replyToMailId', replyToMailId);
    }


    try {
      //await : axios.post가 처리될때까지 기다린 후 response 변수에 할당(디버깅 목적)
      console.log("보냅니다!!");
      const response = await axios.post(`${serverUrl}/mail`, formData);        
      alert('메일이 성공적으로 전송되었습니다.');
      navigate('/mailbox');
    } catch (error) {
      console.error('메일 전송 오류:', error);
      if (error.response && error.response.status === 404) {
        alert("해당하는 이메일의 유저가 없습니다.");
      } else if (error.response && error.response.status === 413) {
        alert("파일 크기가 너무 큽니다. 파일 크기를 줄여 다시 시도해 주세요.");
      }
      else {
        alert('메일 전송 중 오류가 발생했습니다.');
      }
    }
  };

  const handleUserSelect = (email) => {
    setTo(email);
    setShowDepartmentList(false); // 부서 목록 숨기기
  };

  return (
    <div className={styles.composeContainer}>
    <h2>메일 쓰기</h2>
    <div className={styles.formGroup}>
      <label>받는사람</label>
      <div style={{ position: 'relative' }}>
        <input
          type="text"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          required
          className={`${styles.withButton}
          ${replyToMailId ? styles.inputReadOnly : ''}`}
          readOnly={!!replyToMailId} // replyToMailId가 존재하면 readOnly 속성을 true로 설정
        />
        {!replyToMailId && ( // replyToMailId가 없을 때만 버튼을 렌더링
        <button
          type="button"
          className={styles.dropdownButton}
          onClick={() => {
            setShowDepartmentList(!showDepartmentList);
            if (!showDepartmentList) {
              fetchDepartmentEmails(); // 리스트를 열 때만 데이터를 가져오도록 설정
            }
          }}
        >
          ▼
        </button>
        )}
        {/* 부서 이메일 토글 */}
        {showDepartmentList && (
          <div className={styles.departmentList}>
            {departmentUsers.length > 0 ? (
              departmentUsers.map((user) => (
                <div key={user.USERS_EMAIL} onClick={() => handleUserSelect(user.USERS_EMAIL)}>
                  {user.USERS_EMAIL} ({user.USERS_NAME})
                </div>
              ))
            ) : (
              <p>부서 사람을 찾을 수 없어요.</p>
            )}
          </div>
        )}
      </div>
    </div>

      <div className={styles.formGroup}>
        <label>제목</label>
        <input type="text" value={subject} 
          onChange={handleSubjectChange} 
          required 
        />
      </div>
      <div className={styles.formGroup}>
        <label>파일첨부</label>
        {attachments.map((attachment, index) => (
          <input key={index} type="file" 
            onChange={(e) => handleFileChange(e, index)} 
          />
        ))}
        <button type="button" onClick={handleAddAttachment} className={styles.addButton}>+ 파일추가</button>
      </div>
      <div className={styles.formGroup}>
        <label>내용</label>
        {/* <textarea value={message} 
          onChange={(e) => setMessage(e.target.value)} 
          required 
        /> */}
        <div ref={editorRef}></div>
      </div>
      <button type="button" onClick={handleSubmit} className={styles.submitButton}>보내기</button>
    </div>
  );
};

export default CreateMail;
