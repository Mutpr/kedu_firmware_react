import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card } from 'react-bootstrap';
import ApprovalModal from '../ApprovalModal/ApprovalModal';
import ApprovalCardBox from '../ApprovalCardBox/ApprovalCardBox'
import styles from './ApprovalMainContent.module.css'; // 가정한 경로
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFile } from '@fortawesome/free-solid-svg-icons';
import { faFileInvoice } from '@fortawesome/free-solid-svg-icons';
import { faFileInvoiceDollar } from '@fortawesome/free-solid-svg-icons';
import { faLocationDot } from '@fortawesome/free-solid-svg-icons';
import { faFolderOpen } from '@fortawesome/free-solid-svg-icons';

const serverUrl = process.env.REACT_APP_SERVER_URL;

function ApprovalMainContents() {
    const [approvalList, setApprovalList] = useState([]); // 상태 추가

    useEffect(() => {
        // API 호출
        axios.get(`${serverUrl}/approval/approvalList`)
            .then(response => {
                // 데이터를 상태에 저장
                setApprovalList(response.data);
            })
            .catch(error => {
                console.error('데이터를 가져오는 데 실패했습니다', error);
            });
    }, []); // 의존성 배열이 빈 배열인 경우, 컴포넌트가 마운트될 때 한 번만 실행됩니다.

    useEffect(() => {
        console.log("Updated approvalList:", approvalList);
    }, [approvalList]); // approvalList가 변경될 때마다 실행됩니다.
    return (
        <div className={styles.grid_container}>
            <ApprovalCardBox />
            <div>
                <Card>
                    <Card.Body>
                        <h1 style={{ display: "flex", justifyContent: "flex-start" }}>전자결재창</h1>
                        <div style={{ display: "flex", justifyContent: "flex-end" }}>
                            <ApprovalModal />
                        </div>
                    </Card.Body>
                </Card>
            </div>
            <div>
                {approvalList.map((item, index) => (
                    <Card className="mb-3">
                        <Card.Body>
                            <div className={styles.circle}>
                                {item.approval_type_seq===1 && (<><FontAwesomeIcon className="d-flex mt-2 mb-1" icon={faFileInvoice} /><h6>서류결재</h6></>)}
                                {item.approval_type_seq===2 && (<FontAwesomeIcon icon={faFile}/>)}
                                {item.approval_type_seq===3 && (<FontAwesomeIcon icon={faFolderOpen} />)}
                                {item.approval_type_seq===4 && (<FontAwesomeIcon icon={faFile}/>)}
                                {item.approval_type_seq===5 && (<FontAwesomeIcon icon={faFileInvoiceDollar} />)}
                                {item.approval_type_seq===6 && (<FontAwesomeIcon icon={faLocationDot} />)}
                                </div>
                            <div></div>
                        </Card.Body>
                    </Card>
                ))}

            </div>
        </div>
    );
}

export default ApprovalMainContents;
