import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Card from 'react-bootstrap/Card';
import ApprovalModal from '../ApprovalModal/ApprovalModal';
import ApprovalCardBox from '../ApprovalCardBox/ApprovalCardBox'
import styles from './ApprovalMainContent.module.css'; // 가정한 경로
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFile } from '@fortawesome/free-solid-svg-icons';
import { faFileInvoice } from '@fortawesome/free-solid-svg-icons';
import { faFileInvoiceDollar } from '@fortawesome/free-solid-svg-icons';
import { faLocationDot } from '@fortawesome/free-solid-svg-icons';
import { faFolderOpen } from '@fortawesome/free-solid-svg-icons';
import ListGroup from 'react-bootstrap/ListGroup';
import Image from 'react-bootstrap/Image';
import { faCheckCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import ApprovalInfoModal from '../ApprovalInfoModal/ApprovalInfoModal';

const serverUrl = process.env.REACT_APP_SERVER_URL;

function ApprovalMainContents() {
    const [approvalList, setApprovalList] = useState([]); // 상태 추가
    const [showApprovalInfo, setShowApprovalInfo] = useState(false);
    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    useEffect(() => {
        const link = document.createElement('link');
        link.rel = 'stylesheet'
        link.href = 'https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css';
        document.head.appendChild(link);

        return () => {
            document.head.removeChild(link);
        };
    }, [])
    useEffect(() => {
        // API 호출
        axios.get(`${serverUrl}/approval/approvalList`)
            .then(response => {
                setApprovalList(response.data);
            })
            .catch(error => {
                console.error('데이터를 가져오는 데 실패했습니다', error);
            });
    }, []);

    useEffect(() => {
        console.log("Updated approvalList:", approvalList);
    }, [approvalList]);
    return (
        <div className={styles.grid_container}>
            <ApprovalCardBox />
            <div>
                <Card border='secondary'>
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
                    <Card key={index} className={`${styles.card} mb-3`}>
                        <Card.Body className="d-flex align-items-center">
                            {/* 왼쪽 아이콘 */}
                            <div className="me-3">
                                <div className={styles.circle}>
                                    {item.approval_type_seq === 1 && (<><FontAwesomeIcon className={styles.icon} icon={faFileInvoice} /><h6>서류결재</h6></>)}
                                    {item.approval_type_seq === 2 && (<FontAwesomeIcon className="d-flex mt-2 mb-1" icon={faFile} />)}
                                    {item.approval_type_seq === 3 && (<FontAwesomeIcon className="d-flex mt-2 mb-1" icon={faFolderOpen} />)}
                                    {item.approval_type_seq === 4 && (<FontAwesomeIcon className="d-flex mt-2 mb-1" icon={faFile} />)}
                                    {item.approval_type_seq === 5 && (<FontAwesomeIcon className="d-flex mt-2 mb-1" icon={faFileInvoiceDollar} />)}
                                    {item.approval_type_seq === 6 && (<FontAwesomeIcon className="d-flex mt-2 mb-1" icon={faLocationDot} />)}
                                </div>
                            </div>

                            {/* 중간 텍스트 */}
                            <div className="flex-grow-1">
                                <Card.Title className={styles.title}>{item.approval_title}</Card.Title>
                                <Card.Text className={styles.subtitle}>
                                    {item.approval_type_seq === 1 && ("#서류 결재")}
                                    {item.approval_type_seq === 2 && ("#보고서 결재")}
                                    {item.approval_type_seq === 3 && ("#문서 결재")}
                                    {item.approval_type_seq === 4 && ("#예산 결재")}
                                    &nbsp; | &nbsp;         {new Date(item.approval_reg_date).toLocaleDateString('ko-KR', {
                                        year: 'numeric',
                                        month: '2-digit',
                                        day: '2-digit',
                                    })} ~ &nbsp;  {new Date(item.approval_end_date).toLocaleDateString('ko-KR', {
                                        year: 'numeric',
                                        month: '2-digit',
                                        day: '2-digit',
                                    })}
                                </Card.Text>
                                <Card.Text className={styles.additionalInfo}>
                                    <ApprovalInfoModal
                                        approvalSeq={item.approval_seq}
                                        onHide={() => setShow(false)}
                                    />
                                </Card.Text>

                            </div>

                            {/* 오른쪽 아이콘들 */}
                            <div className="d-flex align-items-center">
                                <Image roundedCircle className={styles.avatar} />
                                <div className="ms-2 d-flex align-items-center">
                                    <FontAwesomeIcon icon={faCheckCircle} className="text-success me-2" />
                                    <FontAwesomeIcon icon={faTimesCircle} className="text-danger" />
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                ))}
            </div>
        </div>
    );
}

export default ApprovalMainContents;
