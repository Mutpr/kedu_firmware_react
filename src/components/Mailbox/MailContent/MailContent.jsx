import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import styles from './MailContent.module.css';
import { useMailStore } from '../../../store/mail_store';
import axios from 'axios';

const serverUrl = process.env.REACT_APP_SERVER_URL;

const MailContent = () => {

  const { selectedMailContent, selectedMailSeq, setSelectedMailContent, handleGetAll } = useMailStore();
  const navigate = useNavigate();

  const [showAttachments, setShowAttachments] = useState(false); // 첨부파일 토글 상태

  const handleReply = (mailId) => {
     // 회신 페이지로 이동하며 메일 ID를 전달
     navigate(`compose`, { state: { replyToMailId: mailId } });
  };

  // 삭제하고 삭제된 메일을 제외한 content를 보여줘야 한다
  const handleDeleteSelectedMail = (mailId) => {
    console.log("삭제요청");

    // 삭제 확인 대화 상자
    const confirmDelete = window.confirm("정말로 해당 메일을 삭제하시겠습니까?");
    if (confirmDelete) {
      console.log("현재 선택된 메일 Seq: " + mailId);
      axios.delete(`${serverUrl}/mail/${mailId}`).then(() => {
        handleGetAll();
      }).then(() => {
        axios.get(`${serverUrl}/mail`, {
          params: { seq: selectedMailSeq }
        }).then((resp) => {
          setSelectedMailContent(resp.data);
        });
      });
    } else {
      console.log("메일 삭제 취소");
    }
  };

  // 첨부파일 토글 기능
  const toggleAttachments = () => {
    setShowAttachments(!showAttachments);
  };

  // 첨부파일 삭제 기능
  const handleDeleteAttachment = (attachmentId) => {
    axios.delete(`${serverUrl}/mailattachment/${attachmentId}`)
      .then(() => {
        // 삭제 후 첨부파일 목록 업데이트
        axios.get(`${serverUrl}/mail`, {
          params: { seq: selectedMailSeq },
        }).then((resp) => {
          setSelectedMailContent(resp.data);
        });
      })
      .catch((error) => {
        console.error('첨부파일 삭제 오류:', error);
      });
  };

  // 첨부파일 다운로드 기능
  const handleDownloadAttachment = async (attachmentId, fileName) => {
    try {
      const response = await axios.get(`${serverUrl}/mailattachment/${attachmentId}`, {
        responseType: 'blob', // 파일을 Blob 형식으로 받아옴
      });

      // Blob을 이용하여 파일 다운로드 처리
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName); // 파일 이름 설정
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('파일 다운로드 오류:', error);
    }
  };



  // 회신을 하고 돌아왔을 때 mailContent 내용을 갱신해준다
  // mailContent는 메일함 목록을 눌렀을 때 갱신이 되기 때문에
  // 회신 이후에 바로 회신 메일을 확인해주기 위해 아래와 같은 처리를 해줌
  useEffect(() => {
    if (selectedMailSeq) { // selectedMailSeq가 있을 경우만 실행
      axios.get(`${serverUrl}/mail`, {
        params: { seq: selectedMailSeq }
      }).then((resp) => {
        setSelectedMailContent(resp.data); // 메일 내용 설정
      });
    }
  }, [selectedMailSeq]); // selectedMailSeq가 변경될 때마다 실행

  
  // 데이터가 없을 때 예외 처리
  if (!selectedMailContent || !Array.isArray(selectedMailContent.mails) || selectedMailContent.mails.length === 0) {
    return <div className={styles.mailContainer}>메일을 선택해 주세요</div>;
  }

  return (
    <div className={styles.mailContainer}>
      {selectedMailContent.mails.map((mail, index) => (
        <div key={index} className={styles.mail}>
          <h2>{mail.mail_title}</h2>
          {mail.copyType === 'reply' && <small>(회신)</small>} {/* 메일제목 */}
          <div className={styles.contentHeader}>
            <div className={styles.contentInfo}>
              <span>
                {mail.sender_name} ({mail.sender_department_name})<br />
                <strong>받는 사람</strong> {mail.receiver_name} ({mail.receiver_department_name})
              </span>
            </div>

            <div className={styles.contentButtons}>
              <button onClick={() => handleReply(mail.mail_seq)}>회신</button>
              {index !== selectedMailContent.mails.length - 1 && ( // 가장 오래된 메일은 삭제 불가
                <button onClick={() => handleDeleteSelectedMail(mail.mail_seq)}>삭제</button>
              )}
            </div>
          </div>

          {/* 첨부파일 버튼을 mailContent 위에 배치 */}
          {selectedMailContent.attachments && selectedMailContent.attachments.length > 0 && (
            <div className={styles.attachmentsSection}>
              <button className={styles.attachmentToggle} onClick={toggleAttachments}>
                첨부파일 ({selectedMailContent.attachments.length})
              </button>

              {/* 토글 상태에 따라 파일 목록 표시 */}
              {showAttachments && (
                <div className={styles.attachmentsList}>
                  {selectedMailContent.attachments.map((attachment) => (
                    <div key={attachment.mail_attachment_seq} className={styles.attachmentItem}>
                      <a 
                        href="#"
                        onClick={() => handleDownloadAttachment(attachment.mail_attachment_seq, attachment.original_file_name)}
                        rel="noopener noreferrer"
                      >
                        {attachment.original_file_name}
                      </a>
                      {mail.sender_user_seq === parseInt(sessionStorage.getItem('user_seq')) && (
                        <button onClick={() => handleDeleteAttachment(attachment.mail_attachment_seq)}>X</button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className={styles.mailContent}>
            <div className={styles.editor_contents} dangerouslySetInnerHTML={{ __html: mail.mail_content }} /> {/* 메일 내용 */}
          </div>
        </div>
      ))}
    </div>
  );
}

export default MailContent;
