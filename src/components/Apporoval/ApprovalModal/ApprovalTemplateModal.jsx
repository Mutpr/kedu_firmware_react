// SecondModal.js
import React, { useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import ListGroup from 'react-bootstrap/ListGroup';
import Form from 'react-bootstrap/Form';
import styles from './ApprovalTemplateModal.module.css'; // CSS 모듈 사용
import InputGroup from 'react-bootstrap/esm/InputGroup';
import axios from 'axios';

function SecondModal({ show, onHide, listA }) {
    const [listB, setListB] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    const handleItemClick = (item) => {
        const isAlreadyAdded = listB.some(bItem => bItem.text === item.text);
        if (!isAlreadyAdded) {
            setListB([...listB, item]);
        }
    };

    const handleItemRemove = (index) => {
        setListB(listB.filter((_, i) => i !== index));
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const filteredListA = listA.filter(item =>
        item.text.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const templateSave = () =>{
        axios.post(`192.168.1.43/ApporvalTemplate`)
    }

    return (
        <Modal show={show} onHide={onHide} size="lg" centered backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>템플릿 추가</Modal.Title>
            </Modal.Header>
            <Modal.Body>
            <InputGroup className="mb-3">
                        <Form.Control
                            placeholder="템플릿 타이틀을 입력하세요."
                            aria-label="Search"
                            aria-describedby="basic-addon2"
                            name="approval_template_title"
                        />
                    </InputGroup>
                    <hr></hr>
            <InputGroup className="mb-3">
                        <Form.Control
                            placeholder="검색어를 입력하세요"
                            aria-label="Search"
                            aria-describedby="basic-addon2"
                            value={searchTerm}
                            onChange={handleSearch}
                        />
                    </InputGroup>
                <div className={styles.listGroup}>
                    <ListGroup>
                        {filteredListA.map((item, index) => (
                            <ListGroup.Item
                                key={index}
                                onClick={() => handleItemClick(item)}
                                className={styles.listItem}
                                style={{
                                    cursor: listB.some(bItem => bItem.text === item.text) ? 'not-allowed' : 'pointer',
                                    opacity: listB.some(bItem => bItem.text === item.text) ? 0.5 : 1
                                }}
                            >
                                {item.text}
                            </ListGroup.Item>
                        ))}
                    </ListGroup>

                <hr />
                    <ListGroup className={styles.horizontalList}>
                        {listB.map((item, index) => (
                            <ListGroup.Item
                                key={index}
                                onClick={() => handleItemRemove(index)}
                                className={styles.listItem}
                                style={{ cursor: 'pointer' }}
                            >
                                {item.text}
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="primary" onClick={templateSave}></Button>
                <Button variant="secondary" onClick={onHide}>
                    닫기
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default SecondModal;
