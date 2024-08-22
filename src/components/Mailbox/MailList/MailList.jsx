import { useEffect, useState } from 'react';
import MailItem from './MailItem/MailItem';
import styles from './MailList.module.css';
import axios from 'axios';
import { useMailStore } from '../../../store/mail_store';

const serverUrl = process.env.REACT_APP_SERVER_URL;

const MailList = () => {
  const { mails, handleGetAll, setSelectedMailContent, setSelectedMailSeq, handleGetPage } = useMailStore();

  // 현재 페이지 상태
  const [currentPage, setCurrentPage] = useState(1); // 현재 페이지 상태
  const mailsPerPage = 10; // 페이지당 메일 수
  const [sortOption, setSortOption] = useState('date_desc'); // 정렬 옵션 상태

  // 페이지 번호 변경 시 메일 목록 업데이트
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  useEffect(() => {
    handleGetAll();
  }, []); // 빈 배열을 전달하면 컴포넌트가 처음 마운트될 때 한번만 실행 됌

  useEffect(() => {
    console.log("useEffect 호출됨");
    handleGetPage(currentPage, mailsPerPage, sortOption); // 페이지 및 정렬 옵션 전달
  }, [currentPage, sortOption]); // currentPage 또는 sortOption 변경 시마다 호출

  useEffect(() => {
    console.log("mails 상태 업데이트 감지:", mails);
    if (mails && Array.isArray(mails.mails)) { // mails가 객체이고 mails.mails가 배열인지 확인
      console.log("currentMails 설정됨:", mails.mails);
      console.log(mails.total);
      console.log("Total pages:", Math.ceil(mails.total / mailsPerPage));
    }
  }, [mails]);

  const handleMailClick = (mailSeq) => {
    setSelectedMailSeq(mailSeq); // 선택된 메일의 Seq를 저장(삭제에서 사용)
    console.log("선택된 메일 Seq는" + mailSeq);
    // 메일 내용 가져오기 로직
    axios.get(`${serverUrl}/mail`, {
      params: { seq: mailSeq }
    }).then((resp) => {
      console.log("받은 메일 내용:", resp.data);
      setSelectedMailContent(resp.data); // 서버로부터 받은 메일 내용을 상태에 저장
    });
  };

  return (
    <div className={styles.mailContainer}>
      <div className={styles.sortButtons}>
        <select value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
          <option value="date_desc">최신순</option>
          <option value="date_asc">오래된 순</option>
          <option value="my_mails">작성한 메일</option>
        </select>
      </div>
      <div className={styles.mailList}>
        {mails.mails.map((mail) => (
          <MailItem
            key={mail.mail_seq}
            mail={mail}
            onClick={() => handleMailClick(mail.mail_seq)}
          />
        ))}
      </div>

      <div className={styles.pagination}>
        {[...Array(Math.ceil(mails.total / mailsPerPage))].map((_, i) => (
          <button
            key={i + 1}
            onClick={() => handlePageChange(i + 1)}
            className={i + 1 === currentPage ? styles.active : ''}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default MailList;
