import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import InputGroup from 'react-bootstrap/InputGroup';
import Form from 'react-bootstrap/Form';
import ListGroup from 'react-bootstrap/ListGroup';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import SecondModal from './ApprovalTemplateModal'; // Update the path if needed
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import axios from 'axios';
import styles from '../ApprovalModal/ApprovalModal.module.css';

const serverUrl = process.env.REACT_APP_SERVER_URL;

function ApprovalModal() {
    const [show, setShow] = useState(false);
    const [showSecondModal, setShowSecondModal] = useState(false);
    const [listA, setListA] = useState([]);
    const [listB, setListB] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [userList, setUserList] = useState([]);
    const [approvalData, setApprovalData] = useState({
        "approval_title": '',
        "approval_type_seq": 0,
        "approval_contents": '',
        "approval_file_seq":'',
        "approval_approver_seq": [],
        "start_date": '',
        "end_date": ''
    });
    const [approvalTypeSeq, setApprovalTypeSeq] = useState('');
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [fileSeq, setFileSeq] = useState('');
    const [filteredListA, setFilteredListA] = useState([]);
    const twoWeeksLater = new Date(new Date().setDate(new Date().getDate() + 30));
    const [templateSelect, setTemplateSelect] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`${serverUrl}/approvalTemplate`);
                console.log('Fetched Data:', response.data);
                setListA(response.data);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        if (show) {
            fetchData();
        }
    }, [show]);

    useEffect(() => {
        console.log('listA state updated:', listA);
    }, [listA]);

    useEffect(() => {
        if (Array.isArray(listA)) {
            setFilteredListA(
                listA.filter(item =>
                    item.users_name && item.users_name.toLowerCase().includes(searchTerm.toLowerCase())
                )
            );
        } else {
            setFilteredListA([]);
        }
    }, [listA, searchTerm]);

    useEffect(() => {
        console.log('Filtered List A:', filteredListA); // Debugging line
    }, [filteredListA]);



    const handleApprovalClose = async (e) => {
        e.preventDefault(); // Prevent default form submission
        approvalData.approval_type_seq = approvalTypeSeq;
        console.log(approvalData);

        const uploadResult = await handleFileUpload(e);

            const approverSeqList = listB.map(item => item.user_seq);
            approvalData.approval_approver_seq = approverSeqList;
        
        if (uploadResult) {
            try {
                await axios.post(`${serverUrl}/approval`, {
                    data: JSON.stringify(approvalData),
                    contentType: 'application/json'
                })
                alert('결재 상신에 성공했습니다.');
            } catch (error) {
                console.error('Error:', error);
                alert('결재 상신에 실패했습니다.');
            }
        }
    };

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const handleItemClick = (item) => {
        if (item && !item.disabled) {
            setApprovalData(prevData => {
                // 중복 방지: 이미 추가된 employee_code가 있으면 추가하지 않음
                if (!prevData.approval_approver_seq.includes(item.employee_code)) {
                    return {
                        ...prevData,
                        approval_approver_seq: [...prevData.approval_approver_seq, item.employee_code]
                    };
                }
                
                return prevData; // 중복되면 이전 상태 유지
            });

            setListB(prevListB => {
                if (!prevListB.some(bItem => bItem.employee_code === item.employee_code)) {
                    return [...prevListB, item];
                }
                console.log("prevData::: "+prevListB);
                return prevListB; // 중복되면 이전 상태 유지
            });

            setFilteredListA(listA.map(listItem =>
                listItem.employee_code === item.employee_code ? { ...listItem, disabled: true } : listItem
            ));
        }
    };




    const handleItemRemove = (index) => {
        const removedItem = listB[index];

        // 리스트 B에서 항목 제거
        setListB(prevListB => prevListB.filter((_, i) => i !== index));

        // approval_approver_seq에서 항목 제거
        setApprovalData(prevData => ({
            ...prevData,
            approval_approver_seq: prevData.approval_approver_seq.filter(code => code !== removedItem.employee_code)
        }));

        // 항목을 다시 추가할 수 있도록 활성화 상태 변경
        setFilteredListA(prevListA =>
            prevListA.map(item =>
                item.employee_code === removedItem.employee_code ? { ...item, disabled: false } : item
            )
        );
    };


    const handleSearch = (e) => setSearchTerm(e.target.value);

    const handleCategorySelect = (data) => {
        setSelectedCategory(data);
        const typeSeq = data.match(/\[(\d+)\]/)?.[1] || '';
        setApprovalTypeSeq(typeSeq);
    };

    const handleApprovalTitleChange = (e) => {
        const { name, value } = e.target;
        setApprovalData(prev => ({ ...prev, [name]: value }));
    };

    const handleApprovalContentChange = (e) => {
        const { name, value } = e.target;
        setApprovalData(prev => ({ ...prev, [name]: value }));
    };

    const handleTemplateSelect = () => {
        axios.get(`${serverUrl}/approval`)
            .then(response => {
                console.log('템플릿 데이터:', response.data);
                setUserList(response.data);
            })
            .catch(error => {
                console.error('템플릿 목록 불러오기 오류:', error);
            });
    };

    useEffect(() => {
        console.log('userList가 업데이트되었습니다:', userList);
    }, [userList]);

    const [selectedFiles, setSelectedFiles] = useState(null);
    const [fileInputKey, setFileInputKey] = useState(Date.now());

    const handleFileChange = (event) => setSelectedFiles(event.target.files);

    const handleFileUpload = async (event) => {
        event.preventDefault();
        if (!selectedFiles) return false;

        const formData = new FormData();
        for (let i = 0; i < selectedFiles.length; i++) {
            formData.append('file', selectedFiles[i]);
        }

        try {
            const response = await axios.post(`${serverUrl}/approval/file`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data === true) {
                alert('업로드에 성공했습니다.');
                //업로드 코드 누락 부분 추가
                axios.post(`${serverUrl}/approval/file/upload`, formData,{
                    headers:{
                        'Content-Type': 'multipart/form-data',
                    }
                }).then(response=>(
                    approvalData.approval_file_seq = response.data
                )
            )
                return true;
            } else {
                alert('올바른 파일 형식을 이용해주세요. .docx, .pdf 파일만 업로드 가능합니다.');
                setSelectedFiles(null);
                setFileInputKey(Date.now());
                return false;
            }
        } catch (error) {
            console.error('파일 업로드 오류:', error);
            return false;
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
                                <Form.Group controlId="formFileMultiple" className="mb-3 d-flex" encType="multipart/form-data">
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
                return (
                    <div>
                        <p>예산 책정을 위한 내용을 입력하세요.</p>
                        <hr />
                        <Form.Group controlId="formFileMultiple" className="mb-3">
                            <h5>예산 문서 업로드</h5>
                            <Form.Control type="file" multiple />
                        </Form.Group>
                        <hr />
                    </div>
                );
            case '[005][예산 결재]':
                return (
                    <div>
                        <p>예산 결재를 위한 내용을 입력하세요.</p>
                        <hr />
                        <Form.Group controlId="formFileMultiple" className="mb-3">
                            <h5>예산 문서 업로드</h5>
                            <Form.Control type="file" multiple />
                        </Form.Group>
                        <hr />
                    </div>
                );
            case '[006][휴가 신청]':
                return (
                    <div>
                        <p>휴가 신청을 위한 내용을 입력하세요.</p>
                        <hr />
                        <Form.Group controlId="formFileMultiple" className="mb-3">
                            <h5>휴가 문서 업로드</h5>
                            <Form.Control type="file" multiple />
                        </Form.Group>
                        <hr />
                    </div>
                );
            default:
                return null;
        }
    };

    const startDatePicker = (date) => {
        setStartDate(date);
        setApprovalData(prevData => ({
            ...prevData,
            start_date: date ? date.toISOString().split('T')[0] :  new Date().toISOString().split('T')[0]
        }));
    }

    const endDatePicker = (date) => {
        setEndDate(date);
        setApprovalData(prevData => ({
            ...prevData,
            end_date: date ? date.toISOString().split('T')[0] :  new Date().toISOString().split('T')[0]
        }));

    }

    const handleTemplateClick=(templateTitle)=>{
        axios.get(`${serverUrl}/approvalTemplate/getAllTemplate/${templateTitle}`)
        .then(response=>
            setListB(response.data)
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
                            시작일자<br />
                            <DatePicker
                                className={styles.datePickerInput}
                                selected={startDate}
                                onChange={startDatePicker} // 날짜가 선택되면 상태 업데이트
                                minDate={new Date()}
                                maxDate={twoWeeksLater}
                                popperClassName={styles.customDatePickerPortal}
                            />
                        </div>
                        <div className="w-100 mb-2 mt-2 ms-2 d-flex flex-column" style={{ "wordBreak": "keep-all" }}>
                            종료일자<br />
                            <DatePicker
                                className={styles.datePickerInput}
                                selected={endDate}
                                onChange={endDatePicker} // 날짜가 선택되면 상태 업데이트
                                minDate={startDate} // 종료일자는 시작일자 이후로 제한
                                maxDate={twoWeeksLater}
                                popperClassName={styles.customDatePickerPortal}
                            />
                        </div>
                    </div>
                    <h5 className="m-2"> 결재권자 추가</h5>
                    <DropdownButton
                        variant="outline-secondary"
                        title="템플릿 선택"
                        id="input-group-dropdown-1"
                        className="mt-2 mb-2"
                        onClick={handleTemplateSelect}
                    >
                        {userList.map((item, index) => (
                            <Dropdown.Item
                                key={index}
                                onClick={()=>handleTemplateClick(item)}
                                value={item}
                            >
                                {item}
                            </Dropdown.Item>
                        ))}
                        <hr />
                        <div>
                            <Dropdown.Item onClick={() => setShowSecondModal(true)}>
                                템플릿 추가
                            </Dropdown.Item>
                            {showSecondModal && (
                                <SecondModal
                                    show={showSecondModal}
                                    onHide={() => setShowSecondModal(false)}
                                    listA={listA}
                                />
                            )}
                        </div>
                    </DropdownButton>

                    <InputGroup className="mb-3">
                        <Form.Control
                            type="text"
                            placeholder="Search"
                            value={searchTerm}
                            onChange={handleSearch}
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
                        <ListGroup>
                            {listB.map((item, index) => (
                                <ListGroup.Item
                                    className={styles.listItem}
                                    key={index}
                                    onClick={() => handleItemRemove(index)}
                                    style={{ cursor: 'pointer' }}
                                    value={item.employee_code}
                                >
                                    [{item.department_title}/{item.employee_code}] {item.users_name}
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
        </>
    );
}

export default ApprovalModal;
