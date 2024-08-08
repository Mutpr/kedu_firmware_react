// ApprovalModal.js
import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import InputGroup from 'react-bootstrap/InputGroup';
import Form from 'react-bootstrap/Form';
import ListGroup from 'react-bootstrap/ListGroup';
import styles from '../ApprovalModal/ApprovalModal.module.css';
import axios from 'axios';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import ApprovalTemplateModal from './ApprovalTemplateModal'; // 새롭게 추가된 컴포넌트 임포트
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

function ApprovalModal() {
    const [show, setShow] = useState(false);
    const [showSecondModal, setShowSecondModal] = useState(false);
    const [listA, setListA] = useState([
        { text: 'Cras justo odio', disabled: false },
        { text: 'Dapibus ac facilisis in', disabled: false },
        { text: 'Morbi leo risus', disabled: false },
        { text: 'Porta ac consectetur ac', disabled: false },
        { text: 'Vestibulum at eros', disabled: false }
    ]);

    const [listB, setListB] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [approvalData, setApprovalData] = useState({
        "approval_title": '',
        "approval_type_seq": 0,
        "approval_contents": '',
        "approval_approver_seq": [],
        "start_date": '',
        "end_date": ''
    });
    const [approvalTypeSeq, setApprovalTypeSeq] = useState('');

    // 템플릿 목록
    const templates = {
        'template_a': [
            { text: 'Cras justo odio' },
            { text: 'Dapibus ac facilisis in' }
        ],
        'template_b': [
            { text: 'Morbi leo risus' },
            { text: 'Vestibulum at eros' }
        ],
        // 추가적인 템플릿 정의
    };

    const [startDate, setStartDate] = useState(new Date());

    //오늘에서부터 +30일 설정(전자결재 시한 체크)
    const twoWeeksLater = new Date(new Date().setDate(new Date().getDate() + 30));
    const [endDate, setEndDate] = useState(new Date());

    const handleApprovalClose = () => {
        approvalData.approval_type_seq = approvalTypeSeq;
        console.log(approvalData);
        const parsedData = JSON.stringify(approvalData);
        axios.post('http://192.168.1.43/approval', {
            "data": parsedData,
            "contentType": 'application/json'
        })
            .then(response => {
                console.log('Response:', response);
                axios.post(`192.168.1.43/approval/file/upload`, selectedFiles);
            })
            .catch(error => {
                console.error('Error:', error);
            });

        setShow(false);
    };

    const handleClose = () => {
        setShow(false);
    }

    const handleShow = () => setShow(true);

    const handleItemClick = (index) => {
        if (!filteredListA[index].disabled) {
            const selectedItem = filteredListA[index];

            setApprovalData(prevData => ({
                ...prevData,
                approval_approver_seq: [...prevData.approval_approver_seq, selectedItem.text]
            }));

            setListB(prevListB => {
                if (!prevListB.some(item => item.text === selectedItem.text)) {
                    return [...prevListB, selectedItem];
                }
                return prevListB;
            });

            setListA(listA.map(item => item.text === selectedItem.text ? { ...item, disabled: true } : item));
        }
    };

    const handleItemRemove = (index) => {
        const item = listB[index];
        setListB(listB.filter((_, i) => i !== index));
        setListA(listA.map((listItem) => listItem.text === item.text ? { ...listItem, disabled: false } : listItem));
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const filteredListA = listA.filter(item => item.text && item.text.toLowerCase().includes(searchTerm.toLowerCase()));

    const handleCategorySelect = (data) => {
        setSelectedCategory(data);
        if (data.includes("001")) {
            setApprovalTypeSeq('001');
        } else if (data.includes("002")) {
            setApprovalTypeSeq('002');
        } else if (data.includes("003")) {
            setApprovalTypeSeq('003');
        } else if (data.includes("004")) {
            setApprovalTypeSeq('004');
        } else if (data.includes("005")) {
            setApprovalTypeSeq('005');
        } else if (data.includes("006")) {
            setApprovalTypeSeq('006');
        }
    }

    const handleApprovalTitleChange = (e) => {
        const { name, value } = e.target;
        setApprovalData(prev => ({ ...prev, [name]: value }));
    }

    const handleApprovalContentChange = (e) => {
        const { name, value } = e.target;
        setApprovalData(prev => ({ ...prev, [name]: value }));
    }

    const handleTemplateSelect = (templateKey) => {
        const selectedTemplate = templates[templateKey] || [];

        setListB(prevListB => {
            // 중복 항목 제외하고 추가
            const newItems = selectedTemplate.filter(templateItem =>
                !prevListB.some(listBItem => listBItem.text === templateItem.text)
            );
            return [...prevListB, ...newItems];
        });

        setListA(prevListA =>
            prevListA.map(item =>
                selectedTemplate.some(templateItem => templateItem.text === item.text)
                    ? { ...item, disabled: true }
                    : item
            )
        );
    }

    const [selectedFiles, setSelectedFiles] = useState(null);
    const [fileInputKey, setFileInputKey] = useState(Date.now()); // 파일 입력 필드를 초기화할 키

    const handleFileChange = (event) => {
        setSelectedFiles(event.target.files);
    };

    const handleFileUpload = async (event) => {
        event.preventDefault(); // 폼 기본 동작 방지
        if (!selectedFiles) return;

        const formData = new FormData();
        for (let i = 0; i < selectedFiles.length; i++) {
            formData.append('file', selectedFiles[i]);
        }

        try {
            const response = await axios.post('http://192.168.1.43/approval/file', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data === true) {
                alert('업로드에 성공했습니다.');
            } else if (response.data === false) {
                alert('올바른 파일 형식을 이용해주세요. .docx, .pdf 파일만 업로드 가능합니다.');
                setSelectedFiles(null); // 선택된 파일 초기화
                setFileInputKey(Date.now()); // 파일 입력 필드를 초기화
            }
        } catch (error) {
            console.error('파일 업로드 오류:', error);
        }
    };


    const renderCategoryContent = () => {
        switch (selectedCategory) {
            case '[001][서류 결재]':
                return (
                    <div>
                        <p>서류 결재를 위한 내용을 입력하세요.</p>
                        <h5>서류 업로드</h5>
                        <div className="w-100">
                            <Form onSubmit={handleFileUpload} className="mb-3">
                                <Form.Group controlId="formFileMultiple" className="mb-3 d-flex" encType="multpart/form-data">
                                    <Form.Control
                                        key={fileInputKey}
                                        type="file"
                                        onChange={handleFileChange}
                                        style={{ marginRight: '10px' }}
                                    />
                                    <Button variant="primary" type="submit" style={{ wordBreak: 'keep-all' }}>
                                        업로드
                                    </Button>
                                </Form.Group>
                            </Form>
                        </div>
                    </div>
                );

            case '[002][보고서 결재]':
                return (
                    <div>
                        <p>보고서 결재를 위한 내용을 입력하세요.</p>
                        <hr />
                        <Form.Group controlId="formFileMultiple" className="mb-3">
                            <h5>보고서 업로드</h5>
                            <Form.Control type="file" multiple />
                        </Form.Group>
                        <hr />
                    </div>
                );
            case '[003][문서 결재]':
                return (
                    <div>
                        <p>문서 결재를 위한 내용을 입력하세요.</p>
                        <hr />
                        <Form.Group controlId="formFileMultiple" className="mb-3">
                            <h5>결재 문서 업로드</h5>
                            <Form.Control type="file" multiple />
                        </Form.Group>
                        <hr />
                    </div>
                );
            case '[004][예산 책정]':
                return <p>예산 책정을 위한 내용을 입력하세요.</p>;
            case '[005][예산 결재]':
                return <p>예산 결재를 위한 내용을 입력하세요.</p>;
            case '[006][휴가 신청]':
                return <p>휴가 신청을 위한 내용을 입력하세요.</p>;
            default:
                return <p>결재 구분을 선택하세요.</p>;
        }
    };

    const startDatePicker = () => {
        return (
            <DatePicker className={styles.datePickerInput}
                selected={startDate}
                onChange={date => setStartDate(date)}
                minDate={new Date()}
                maxDate={twoWeeksLater}
                popperClassName={styles.customDatePickerPortal}
                onClick={approvalData.start_date = startDate}
            />
        )
    }

    const endDatePicker = () => {
        return (
            <DatePicker className={styles.datePickerInput}
                selected={endDate}
                onChange={date => setEndDate(date)}
                minDate={new Date()}
                maxDate={twoWeeksLater}
                popperClassName={styles.customDatePickerPortal}
                onClick={approvalData.end_date = endDate}
            />
        )
    }
    return (
        <>
            <Button variant="primary" style={{ display: "flex", justifyContent: "flex-end" }} onClick={handleShow}>
                전자결재
            </Button>

            <Modal show={show} onHide={handleClose} backdrop="static">
                <Modal.Header closeButton>
                    <Modal.Title>전자 결재</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <InputGroup className="mb-3">
                        <DropdownButton
                            variant="outline-secondary"
                            title="결재 구분"
                            id="input-group-dropdown-1"
                        >
                            <Dropdown.Item onClick={() => handleCategorySelect('[001][서류 결재]')}>[001][서류 결재]</Dropdown.Item>
                            <Dropdown.Item onClick={() => handleCategorySelect('[002][보고서 결재]')}>[002][보고서 결재]</Dropdown.Item>
                            <Dropdown.Item onClick={() => handleCategorySelect('[003][문서 결재]')}>[003][문서 결재]</Dropdown.Item>
                            <Dropdown.Divider />
                            <Dropdown.Item onClick={() => handleCategorySelect('[004][예산 책정]')}>[004][예산 책정]</Dropdown.Item>
                            <Dropdown.Item onClick={() => handleCategorySelect('[005][예산 결재]')}>[005][예산 결재]</Dropdown.Item>
                            <Dropdown.Divider />
                            <Dropdown.Item onClick={() => handleCategorySelect('[006][휴가 신청]')}>[006][휴가 신청]</Dropdown.Item>
                        </DropdownButton>
                        <Form.Control name="approval_title" aria-label="Text input with dropdown button" onChange={handleApprovalTitleChange} value={approvalData.approval_title} />
                    </InputGroup>
                    <div className={styles.categoryContent}>
                        {renderCategoryContent()}
                    </div>
                    <InputGroup>
                        <Form.Control name="approval_contents" as="textarea" aria-label="With textarea" placeholder="내용을 입력하세요" onChange={handleApprovalContentChange} value={approvalData.approval_contents} />
                    </InputGroup>
                    <div className='d-flex align-items-center'>
                        <div className="w-100 mb-2 mt-2 me-2 d-flex flex-column" style={{ "wordBreak": "keep-all" }}>
                            시작일자<br></br>
                            {startDatePicker()}
                        </div>
                        <div className="w-100 mb-2 mt-2 ms-2 d-flex flex-column" style={{ "wordBreak": "keep-all" }}>
                            종료일자<br></br>
                            {endDatePicker()}
                        </div>
                    </div>
                    <h5 className="m-2"> 결재권자 추가</h5>
                    <DropdownButton
                        variant="outline-secondary"
                        title="템플릿 선택"
                        id="input-group-dropdown-1"
                        className="mt-2 mb-2"
                    >
                        {Object.keys(templates).map((key) => (
                            <Dropdown.Item
                                key={key}
                                onClick={() => handleTemplateSelect(key)}
                            >
                                {key.replace('template_', '템플릿 ')}
                            </Dropdown.Item>
                        ))}
                        <hr></hr>
                        <Dropdown.Item onClick={() => setShowSecondModal(true)}>
                            템플릿 추가
                        </Dropdown.Item>
                    </DropdownButton>

                    <InputGroup className="mb-3">
                        <Form.Control
                            placeholder="검색어를 입력하세요"
                            aria-label="Search"
                            aria-describedby="basic-addon2"
                            value={searchTerm}
                            onChange={handleSearch}
                        />
                    </InputGroup>

                    <div className={styles.listDiv}>
                        <ListGroup className={styles.listGroup}>
                            {filteredListA.map((item, index) => (
                                <ListGroup.Item className={styles.listItem}
                                    key={index}
                                    onClick={() => handleItemClick(index)}
                                    style={{ cursor: item.disabled ? 'not-allowed' : 'pointer', opacity: item.disabled ? 0.5 : 1 }}
                                >
                                    {item.text}
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                        <hr />
                        <ListGroup>
                            {listB.map((item, index) => (
                                <ListGroup.Item className={styles.listItem}
                                    key={index}
                                    onClick={() => handleItemRemove(index)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    {item.text}
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={handleApprovalClose}>
                        Save Changes
                    </Button>
                </Modal.Footer>
            </Modal>

            <ApprovalTemplateModal
                show={showSecondModal}
                onHide={() => setShowSecondModal(false)}
                listA={listA}
            />
        </>
    );
}

export default ApprovalModal;
