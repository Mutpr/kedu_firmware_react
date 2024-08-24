import React, { useLayoutEffect, useState } from 'react';
import axios from 'axios';
import styles from './MainBoard.module.css'; // 스타일 파일
import Pagination from '../../Pagination/Pagination';

const MainBoard = () => {
    const [data, setData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5; // 페이지당 항목 수
    const serverUrl = process.env.REACT_APP_SERVER_URL;

    useLayoutEffect(() => {
        // 서버에서 데이터 가져오기
        axios.get(`${serverUrl}:3000/board/0`)
            .then(response => {
                setData(response.data);
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
    }, [serverUrl]);

    // 페이지 변경 핸들러
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    // 현재 페이지에 해당하는 데이터 계산
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);

    return (
        <div className={styles.mainBoard}>
            <h2>공지사항</h2>
            <table>
                <thead>
                    <tr>
                        <th>공지</th>
                        <th>제목</th>
                        <th>작성일자</th>
                        <th>조회수</th>
                    </tr>
                </thead>
                <tbody>
                    {currentItems.map(item => (
                        <tr
                            key={item.board_seq}
                            onClick={() => window.location.href = `/Board/Detail/${item.board_seq}`}
                            style={{ cursor: 'pointer' }}
                        >
                            <td className={styles.notice}>[공지]</td>
                            <td className={styles.title}>{item.board_title}</td>
                            <td>{new Date(item.board_write_date).toLocaleString()}</td>
                            <td>{item.board_view_count}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {/* 페이지네이션 컴포넌트 */}
            <Pagination
                currentPage={currentPage}
                totalPages={Math.ceil(data.length / itemsPerPage)}
                handlePageChange={handlePageChange}
            />
        </div>
    );
};

export default MainBoard;
