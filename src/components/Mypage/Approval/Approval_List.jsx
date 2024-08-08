import React from 'react';
import styles from './Approval_List.module.css';

const ApprovalListModal = ({ onClose, approvalList, handleApprove, handleReject }) => {
  return (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <h2>승인 리스트</h2>
        <ul className={styles.ul}>
          {approvalList.length > 0 ? (
            approvalList.map((item, index) => (
              <li key={item.usersUpdateRequestSeq || index} className={styles.li}>
                <div>
                  <p>{item.userName || '이름 없음'} - {item.requestReason || '사유 없음'}</p>
                  <p>상태: {item.requestStatus || '대기 중'}</p>
                  <p>요청 일시: {new Date(item.requestTimestamp).toLocaleString()}</p>
                </div>
                <div className={styles.adminActions}>
                  <button className={`${styles.button} ${styles.approveButton}`} onClick={() => handleApprove(item.usersUpdateRequestSeq)}>승인</button>
                  <button className={`${styles.button} ${styles.rejectButton}`} onClick={() => handleReject(item.usersUpdateRequestSeq)}>거부</button>
                </div>
              </li>
            ))
          ) : (
            <p>대기 중인 요청이 없습니다.</p>
          )}
        </ul>
        <button className={`${styles.button} ${styles.closeButton}`} onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default ApprovalListModal;
