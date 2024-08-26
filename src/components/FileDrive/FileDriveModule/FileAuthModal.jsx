import React, { useState } from 'react';
import { Button, Modal } from 'react-bootstrap';

const FileAuthModal = () => {
    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const handleAuth = () => {
        setShow(true); // 모달을 열기 위해 상태 업데이트
    };

    return (
        <>
            <Button variant="primary" onClick={handleAuth}>
                권한 설정
            </Button>

            <Modal show={show} onHide={handleClose} backdrop="static" centered>
                <Modal.Header closeButton>
                    <Modal.Title>파일 업로드</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
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

export default FileAuthModal;
