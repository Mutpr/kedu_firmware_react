import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFile } from '@fortawesome/free-regular-svg-icons';
import styles from './MailItem.module.css';

const MailItem = ({ mail, attachments, onClick }) => {
    const formatDate = (dateString) => {
        const date = new Date(dateString);
    
        // "YYYY.MM.DD" 형식의 날짜를 "YYYY-MM-DD"로 변환
        let formattedDate = date.toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        }).replace(/\.\s?/g, '-'); // "."와 그 뒤의 공백을 "-"로 변환
    
        // 날짜 문자열 끝에 있는 "-" 제거
        if (formattedDate.endsWith('-')) {
          formattedDate = formattedDate.slice(0, -1);
        }
    
        const formattedTime = date.toLocaleTimeString('ko-KR', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false // 24시간 형식 사용
        });
        
    
        return `${formattedDate} ${formattedTime}`; // 최종 형식 "YYYY-MM-DD HH:MM"
      };

      
      

  return (
    <div className={styles.mailItem} onClick={() => onClick(mail.mail_seq)}>
      <div className={styles.mailInfo}>
        <div className={styles.mailSender}>
          <span>{mail.sender_name}</span> {/* 발신자 이름 */}
        </div>
        <div className={styles.mailDate}>
          <span>{formatDate(mail.mail_received_date)}</span> {/* 받은 날짜 */}
        </div>
      </div>
      <div className={styles.mailSubject}>
        <span>{mail.mail_title}</span> {/* 메일 제목 */}
        
        {mail.has_attachments === true && (
          <FontAwesomeIcon icon={faFile} className={styles.attachmentIcon} alt="첨부 파일" />
        )}
      </div>
    </div>
  );
};

export default MailItem;
