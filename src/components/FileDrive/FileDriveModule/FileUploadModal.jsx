import React, { useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import axios from 'axios';
import styles from './FileUploadModal.module.css'; // CSS 모듈 경로 수정

const serverUrl = process.env.REACT_APP_SERVER_URL;

const FileUploadModal = () => {
    const [showFileUploadModal, setShowFileUploadModal] = useState(false); // 첫 번째 모달 상태
    const [showAuthModal, setShowAuthModal] = useState(false); // 두 번째 모달 상태

    const handleCloseFileUploadModal = () => setShowFileUploadModal(false);
    const handleShowFileUploadModal = () => setShowFileUploadModal(true);

    const handleCloseAuthModal = () => setShowAuthModal(false);
    const handleShowAuthModal = () => setShowAuthModal(true);

    const [show, setShow] = useState(false);
    const [uploadedInfo, setUploadedInfo] = useState(null);
    const [isActive, setActive] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState(null);

    const handleClose = () => {
        setShow(false);
        setUploadedInfo(null); // 모달 닫을 때 파일 정보 초기화
        setSelectedFiles(null); // 선택된 파일 초기화
    };

    const handleShow = () => setShow(true);

    const handleDragStart = () => setActive(true);
    const handleDragEnd = () => setActive(false);
    const handleDragOver = (event) => event.preventDefault();

    const setFileInfo = (file) => {
        const { name, size: byteSize, type } = file;
        const size = (byteSize / (1024 * 1024)).toFixed(2) + ' MB'; // MB로 변환
        setUploadedInfo({ name, size, type });
        setSelectedFiles(file); // 파일을 상태로 저장
    };

    const handleDrop = (event) => {
        event.preventDefault();
        setActive(false);
        const file = event.dataTransfer.files[0];
        setFileInfo(file);
    };

    const handleUpload = ({ target }) => {
        const file = target.files[0];
        setFileInfo(file);
    };

    const sendFileInfoToServer = async () => {
        if (!selectedFiles) {
            alert('업로드할 파일을 선택해주세요.');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('file', selectedFiles);

            await axios.post(`${serverUrl}/file`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            alert('파일이 성공적으로 업로드되었습니다.');
            handleClose(); // 파일 업로드 후 모달 닫기
        } catch (error) {
            console.error('파일 업로드 실패:', error);
            alert('파일 업로드에 실패했습니다.');
        }
    };



    const FileInfo = ({ uploadedInfo }) => (
        <>
            <ul className={styles.preview_info}>
                {Object.entries(uploadedInfo).map(([key, value]) => (
                    <li key={key}>
                        <span className={styles.info_key}>{key}</span>
                        <span className={styles.info_value}>{value}</span>
                    </li>

                ))}
            </ul>
            <Button variant="primary" onClick={handleShowAuthModal}>
                권한 설정
            </Button>
        </>
    );

    const Logo = () => (
        <svg className={styles.icon} x="0px" y="0px" viewBox="0 0 24 24">
            <path fill="transparent" d="M0,0h24v24H0V0z" />
            <path fill="#000" d="M20.5,5.2l-1.4-1.7C18.9,3.2,18.5,3,18,3H6C5.5,3,5.1,3.2,4.8,3.5L3.5,5.2C3.2,5.6,3,6,3,6.5V19c0,1.1,0.9,2,2,2h14c1.1,0,2-0.9,2-2V6.5C21,6,20.8,5.6,20.5,5.2z M12,17.5L6.5,12H10v-2h4v2h3.5L12,17.5z M5.1,5l0.8-1h12l0.9,1H5.1z" />
        </svg>
    );

    const UploadBox = () => (
        <label
            className={`${styles.preview}${isActive ? ` ${styles.active}` : ''}`}
            onDragEnter={handleDragStart}
            onDragOver={handleDragOver}
            onDragLeave={handleDragEnd}
            onDrop={handleDrop}
        >
            <input type="file" className={styles.file} onChange={handleUpload} />
            {uploadedInfo ? (
                <FileInfo uploadedInfo={uploadedInfo} />
            ) : (
                <>
                    <Logo />
                    <p className={styles.preview_msg}>클릭 혹은 파일을 이곳에 드롭하세요.</p>
                    <p className={styles.preview_desc}>파일당 최대 3MB</p>
                </>
            )}
        </label>
    );

    return (
        <>
            <Button variant="primary" onClick={handleShow}>
                파일 업로드
            </Button>

            <Modal show={show} onHide={handleClose} backdrop="static" centered>
                <Modal.Header closeButton>
                    <Modal.Title>파일 업로드</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <UploadBox />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        닫기
                    </Button>
                    <Button variant="primary" onClick={sendFileInfoToServer}>
                        저장
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* 두 번째 모달: 권한 설정 모달 */}
            <Modal show={showAuthModal} onHide={handleCloseAuthModal} backdrop="static" centered>
                <Modal.Header closeButton>
                    <Modal.Title>권한 설정</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseAuthModal}>
                        닫기
                    </Button>
                    <Button variant="primary">
                        저장
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default FileUploadModal;
