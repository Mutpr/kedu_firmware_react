import React, { useState, useEffect } from 'react';
import { Modal, ListGroup, FormControl, Button, InputGroup } from 'react-bootstrap';
import axios from 'axios';
import styles from './ApprovalTemplateModal.module.css'; // CSS 모듈 사용

const serverUrl = process.env.REACT_APP_SERVER_URL;

function SecondModal({ show, onHide, listA }) {
    console.log("listA::: "+listA)
    const [isModalInvisible, setIsModalInvisible] = useState(false);
    const [listB, setListB] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredListA, setFilteredListA] = useState([]);
    const [approvalTemplateData, setApprovalTemplateData] = useState({
        approval_template_title: '',
        approval_template_sat_user: []
    });

    useEffect(() => {
        if (Array.isArray(listA)) {
            setFilteredListA(listA.filter(item => 
                item.users_name && item.users_name.toLowerCase().includes(searchTerm.toLowerCase())
            ));
        } else {
            setFilteredListA([]);
        }
    }, [listA, searchTerm]);

    const handleItemClick = (item) => {
        if (item && !item.disabled) {
            setApprovalTemplateData(prevData => ({
                ...prevData,
                approval_template_sat_user: [...prevData.approval_template_sat_user, item.employee_code]
            }));

            setListB(prevListB => {
                if (!prevListB.some(bItem => bItem.users_name === item.employee_code)) {
                    return [...prevListB, item];
                }
                return prevListB;
            });

            setFilteredListA(listA.map(listItem => 
                listItem.users_name === item.users_name ? { ...listItem, disabled: true } : listItem
            ));
        }
    };

    const handleItemRemove = (index) => {
        const itemToRemove = listB[index];
        setListB(listB.filter((_, i) => i !== index));

        setFilteredListA(listA.map(listItem =>
            listItem.users_name === itemToRemove.users_name ? { ...listItem, disabled: false } : listItem
        ));
    };

    const handleApprovalTemplateTitleChange = (e) => {
        const { name, value } = e.target;
        setApprovalTemplateData(prev => ({ ...prev, [name]: value }));
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const templateSave = () => {

        axios.post(`${serverUrl}/approvalTemplate`, approvalTemplateData)
            .then(response => {
                console.log('템플릿 저장 성공:', response.data);
            })
            .catch(error => {
                console.error('템플릿 저장 오류:', error);
            });

        setIsModalInvisible(false);
    };
    return (
        <Modal show={show} onHide={onHide} size="lg" centered backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>템플릿 추가</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <InputGroup className="mb-3">
                    <FormControl
                        type="text"
                        name="approval_template_title"
                        placeholder="템플릿 타이틀을 입력하세요."
                        className="mb-3"
                        onChange={handleApprovalTemplateTitleChange}
                        value={approvalTemplateData.approval_template_title}
                    />
                </InputGroup>
                <hr />
                <InputGroup className="mb-3">
                    <FormControl
                        type="text"
                        placeholder="검색"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="mb-3"
                    />
                </InputGroup>
                <div className={styles.listGroup}>
                    <ListGroup>
                        {filteredListA.map((item, index) => (
                            <ListGroup.Item
                                key={index}
                                className={styles.listItem}
                                onClick={() => handleItemClick(item)}
                                style={{
                                    cursor: 'pointer',
                                    opacity: listB.some(bItem => bItem.employee_code === item.employee_code) ? 0.5 : 1,
                                    pointerEvents: listB.some(bItem => bItem.employee_code === item.employee_code) ? 'none' : 'auto'
                                }}
                            >
                                [{item.department_title}/{item.employee_code}] {item.users_name}
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
                                [{item.department_title}/{item.employee_code}] {item.users_name}
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="primary" onClick={templateSave}>템플릿 추가</Button>
                <Button variant="secondary" onClick={onHide}>
                    닫기
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default SecondModal;
