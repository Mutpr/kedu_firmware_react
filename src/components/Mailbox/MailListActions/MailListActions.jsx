import { useState, useEffect } from 'react';
import styles from './MailListActions.module.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useMailStore } from '../../../store/mail_store';

const serverUrl = process.env.REACT_APP_SERVER_URL;

const MailListActions = () => {
    const [searchTerm, setSearchTerm] = useState(''); //검색어 상태 (store로 보낼지 고민 중)
    const [previewResults, setPreviewResults] = useState([]);
    const navi = useNavigate();
    const { setSelectedMailContent, selectedMailSeq, setSelectedMailSeq, handleGetAll, setMails } = useMailStore();

    //현재 선택되어있는 메일함 전체 삭제
    const handleDeleteSelectedMailBox = () => {
        if (!selectedMailSeq) {
            alert("선택된 메일함이 없습니다.");
            console.log("선택된 메일함이 없습니다.");
            return;
        }

        // 삭제 확인 대화 상자
        const confirmDelete = window.confirm("정말로 이 메일함을 삭제하시겠습니까?");
  
        if (confirmDelete) {
        console.log("현재 선택된 메일 Seq: " + selectedMailSeq);
        axios.delete(`${serverUrl}/mailbox/${selectedMailSeq}`).then(() => {
          handleGetAll();
        }).then(() => {
            axios.get(`${serverUrl}/mail`, {
              params: { seq: selectedMailSeq }
            }).then((resp) => {
              setSelectedMailContent(resp.data);
              setSelectedMailSeq(null);
            })
          });
        } else {
            console.log("메일함 삭제 취소")
        }
      };
    
    const handleComposeMail = () => {
        navi('compose');
    };

    const handleRefresh = () => {
      handleGetAll();
      setSelectedMailContent([]); // 메일 내용 초기화
      setSelectedMailSeq(null); // 선택된 메일함 초기화
    };

    const handleSearch = () => {
      axios.get(`${serverUrl}/mail`, {
          params: { query: searchTerm }
      }).then((resp) => {
          const searchResults = resp.data.mails;

          // 각 메일함의 첫 번째 메일만 가져오도록 필터링
          const filteredMails = searchResults.filter((mail, index, self) =>
              index === self.findIndex((m) => m.mail_seq === mail.mail_seq)
          );

          setMails({ mails: filteredMails, total: filteredMails.length });
          setSelectedMailContent([]); // 검색 후 content 초기화
          setPreviewResults([]);
      });
  };

  const handleKeyPress = (event) => {
      if (event.key === 'Enter') {
        console.log("검색 요청합니다.")
          handleSearch(); // Enter 키를 눌렀을 때 검색 실행
      }
  };

  useEffect(() => {
    if (searchTerm) {
        axios.get(`${serverUrl}/mail`, {
            params: { query: searchTerm }
        }).then((resp) => {
            setPreviewResults(resp.data.mails);
            console.log(previewResults);
        });
    } else {
        setPreviewResults([]);
    }
}, [searchTerm]);


  const handlePreviewClick = (mailSeq) => {
    // 선택된 미리보기 항목의 메일 Seq를 이용해 메일 리스트를 갱신
    axios.get(`${serverUrl}/mail`, {
        params: { seq: mailSeq }
    }).then((resp) => {
        const searchResults = resp.data.mails;

    // `setMails`에 검색된 결과 중 첫 번째 메일만 배열로 설정
    if (searchResults && searchResults.length > 0) {
      setMails({ mails: [searchResults[searchResults.length - 1]], total: 1 }); // 첫 번째 메일만 설정
      setSelectedMailContent(searchResults[0]);
      setPreviewResults([]);
    }
    });
  };


  const stripHtmlTags = (str) => {
    // HTML 태그를 제거하는 정규식
    return str.replace(/<[^>]*>?/gm, '');
  };

    return (
        <div className={styles.mailListActions}>
            <input type="text" className={styles.searchInput} placeholder="메일검색" autoComplete="off" maxLength="100" value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)} 
            onKeyPress={handleKeyPress} // Enter 키 누를 때 검색 실행
            /> 
            {previewResults.length > 0 && (
                <div className={styles.previewContainer}>
                    {previewResults.map((mail, index) => (
                        <div 
                            key={index} 
                            className={styles.previewItem} 
                            onClick={() => handlePreviewClick(mail.mail_seq)} // 미리보기 항목 클릭 시 메일 목록 업데이트
                        >
                            <div className={styles.previewTitle}>{mail.mail_title}</div>
                            <div className={styles.previewContent}>{stripHtmlTags(mail.mail_content)}</div>
                        </div>
                    ))}
                </div>
            )}
            <button className={styles.refreshButton} onClick={handleRefresh}>새로고침</button>
            <button className={styles.actionButtons} onClick={handleComposeMail}>메일쓰기</button>
            <button className={styles.actionButtons} onClick={handleDeleteSelectedMailBox}>삭제</button>
            {/* <button className={styles.actionButtons}>이동</button> */}
        </div>
    );
};

export default MailListActions;