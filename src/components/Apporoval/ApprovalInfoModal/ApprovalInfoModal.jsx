import axios from 'axios';
import { useEffect, useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

const serverUrl = process.env.REACT_APP_SERVER_URL;

function ApprovalInfoModal({ approvalSeq, onHide }) {
    const [show, setShow] = useState(false);
    const [approvalDetail, setApprovalDetail] = useState(null);
    const [error, setError] = useState('');

    const handleShow = () => {
        setShow(true);
        fetchDetails();
    }

    const fetchDetails = () => {
        axios.get(`${serverUrl}/approval/detail`, { params: { approval_seq: approvalSeq } })
            .then(response => {
                setApprovalDetail(response.data);
                setError(''); // Clear any previous errors
            })
            .catch(error => {
                console.error('Failed to fetch data:', error);
                setError('Failed to load data. Please try again later.');
                setApprovalDetail(null); // Reset the details on error
            });
        console.log(approvalSeq)
    };

    useEffect(() => {
        if (show && approvalSeq) {
            fetchDetails();
        }
    }, [show, approvalSeq]);

    return (
        <>
            <span onClick={handleShow} style={{ cursor: 'pointer', color: 'blue', textDecoration: 'underline' }}>
                세부사항
            </span>

            <Modal show={show} onHide={onHide} centered>
                <Modal.Header closeButton>
                    <Modal.Title>추가 정보</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                            <h5>제목</h5>
                            <Form.Control
                                type="email"
                                placeholder="name@example.com"
                                autoFocus
                                disabled
                            />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
                            <h5>내용</h5>
                            <Form.Control as="textarea" rows={3} disabled/>
                        </Form.Group>
                    </Form>
                    <hr/>
                    <h5>결재 현황</h5>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={onHide}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default ApprovalInfoModal;