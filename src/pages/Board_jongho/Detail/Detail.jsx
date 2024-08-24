import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './Detail.module.css';
import { useAuthStore } from '../../../store/store';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBookmark, faCheck, faPenToSquare, faTrash, faX } from '@fortawesome/free-solid-svg-icons';

axios.defaults.withCredentials = true;

const Detail = ({ category = {} }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { usersName } = useAuthStore();

    const [board, setBoard] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [updatedTitle, setUpdatedTitle] = useState('');
    const [updatedContents, setUpdatedContents] = useState('');
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [editingCommentId, setEditingCommentId] = useState();
    const [editedCommentText, setEditedCommentText] = useState('');
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [dropdownId, setDropdownId] = useState(null);

    const seq = location.pathname.split('/').pop();
    const serverUrl = process.env.REACT_APP_SERVER_URL;
    const sessionUserName = sessionStorage.getItem("usersName") || "Unknown User";
    const isAdmin = sessionStorage.getItem("isAdmin") || false;
    const user_seq = sessionStorage.getItem("usersSeq");

    useEffect(() => {
        axios.get(`${serverUrl}:3000/board/detail/${seq}`)
            .then(resp => {
                setBoard(resp.data);
                setUpdatedTitle(resp.data.board_title);
                setUpdatedContents(resp.data.board_contents);
            })
            .catch(error => {
                console.error('Error fetching board data:', error);
            });

        axios.get(`${serverUrl}:3000/board_reply/${seq}`)
            .then(resp => {
                setComments(resp.data || []);
            })
            .catch(error => {
                console.error('Error fetching comments data:', error);
            });

        axios.get(`${serverUrl}:3000/bookmark/${seq}`)
            .then(resp => {
                setIsBookmarked(resp.data);
            })
            .catch(error => {
                console.error('Error checking bookmark status:', error);
            });

    }, [seq, serverUrl]);

    const handleUpdate = (e) => {
        const updatedData = {
            board_title: updatedTitle,
            board_contents: updatedContents,
        };

        axios.put(`${serverUrl}:3000/board/${seq}`, updatedData)
            .then(resp => {
                setBoard(resp.data);
                setIsEditing(false);
            })
            .catch(error => {
                console.error('Error updating data:', error);
            });
    };

    const handleDeleteBoard = () => {
        const isConfirmed = window.confirm('정말로 이 게시물을 삭제하시겠습니까?');

        if (isConfirmed) {
            axios.delete(`${serverUrl}:3000/board/${seq}`)
                .then(() => {
                    navigate("/Board");
                })
                .catch(error => {
                    console.error('Error deleting board:', error);
                });
        }
    };

    const toggleEditMode = () => {
        setIsEditing(prev => !prev);
    };

    const handleCommentSubmit = (e) => {
        const commentData = {
            reply_userName: usersName || sessionUserName,
            reply_contents: newComment,
            board_seq: seq,
        };

        axios.post(`${serverUrl}:3000/board_reply`, commentData)
            .then(resp => {
                setComments(prevComments => [...prevComments, resp.data]);
                setNewComment('');
            })
            .catch(error => {
                console.error('Error submitting comment:', error);
            });
    };

    const handleUpdateReply = (commentId) => {
        const updatedCommentData = {
            reply_contents: editedCommentText,
            reply_reg_date: new Date().toISOString(),
        };

        axios.put(`${serverUrl}:3000/board_reply/${seq}/${commentId}`, updatedCommentData)
            .then(() => {
                setComments(prevComments => prevComments.map(comment =>
                    comment.reply_seq === commentId ? { ...comment, ...updatedCommentData } : comment
                ));
                setEditingCommentId(null);
                setEditedCommentText('');
            })
            .catch(error => {
                console.error('Error updating comment:', error);
            });
    };

    const handleDeleteComment = (commentId) => {
        const isConfirmed = window.confirm('정말로 이 댓글을 삭제하시겠습니까?');

        if (isConfirmed) {
            axios.delete(`${serverUrl}:3000/board_reply/${seq}/${commentId}`)
                .then(() => {
                    setComments(prevComments => prevComments.filter(comment => comment.reply_seq !== commentId));
                })
                .catch(error => {
                    console.error('Error deleting comment:', error);
                });
        }
    };

    const handleCommentEdit = (commentId, commentText) => {
        setEditingCommentId(commentId);
        setEditedCommentText(commentText);
    };

    const handleBookmarkClick = () => {
        if (isBookmarked) {
            axios.delete(`${serverUrl}:3000/bookmark/${seq}`)
                .then(() => {
                    setIsBookmarked(false);
                })
                .catch(error => {
                    console.error('Error removing bookmark:', error);
                });
        } else {
            axios.post(`${serverUrl}:3000/bookmark`, { board_seq: seq })
                .then(() => {
                    setIsBookmarked(true);
                })
                .catch(error => {
                    console.error('Error adding bookmark:', error);
                });
        }
    };

    const handleDropdownToggle = (commentId) => {
        setDropdownId(prevId => prevId === commentId ? null : commentId);
    };

    if (!board) {
        return <div>Loading...</div>;
    }

    console.log("isAdmin : " + isAdmin, typeof isAdmin);
    console.log("user_seq : " + user_seq, typeof user_seq);
    console.log("board_user_seq : " + board.user_seq, typeof board.user_seq);
    console.log("test : " + user_seq === (board.user_seq).toString());

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                {isEditing ? (
                    <input
                        type="text"
                        value={updatedTitle}
                        onChange={(e) => setUpdatedTitle(e.target.value)}
                        className={styles.titleInput}
                    />
                ) : (
                    <div className={styles.title}>
                        {board.board_title}
                        <FontAwesomeIcon
                            icon={faBookmark}
                            className={styles.bookmarkIcon}
                            style={{ color: isBookmarked ? 'blue' : '#f0a500' }}
                            onClick={handleBookmarkClick}
                        />
                    </div>
                )}
                <div className={styles.headerButtons}>
                    {(isAdmin === "true" || user_seq === board.user_seq.toString()) && (
                        <>
                            {!isEditing ? (
                                <>
                                    <button onClick={toggleEditMode} className={styles.button}>수정하기</button>
                                    <button onClick={handleDeleteBoard} className={styles.button}>삭제하기</button>
                                </>
                            ) : (
                                <form onSubmit={handleUpdate} className={styles.editForm}>
                                    <button type="submit" className={styles.button}>수정완료</button>
                                    <button type="button" onClick={toggleEditMode} className={styles.button}>수정취소</button>
                                </form>
                            )}
                        </>
                    )}
                    <button onClick={() => navigate("/Board")} className={styles.button}>뒤로가기</button>
                </div>

            </div>
            <div className={styles.body}>
                <div><strong>글쓴이:</strong> {board.users_name} / 작성일자 : {new Date(board.board_write_date).toLocaleString()} / 조회수 : {board.board_view_count}</div>
                <div className={styles.content}>
                    {isEditing ? (
                        <textarea
                            value={updatedContents}
                            onChange={(e) => setUpdatedContents(e.target.value)}
                            className={styles.textarea_edit}
                        />
                    ) : (
                        <div dangerouslySetInnerHTML={{ __html: board.board_contents }} />
                    )}
                </div>

                <div className={styles.commentsSection}>
                    <br></br>
                    <br></br>
                    <br></br>
                    <br></br>
                    <br></br>
                    <br></br>
                    <br></br>
                    <br></br>
                    <br></br>
                    <br></br>
                    <br></br>
                    <br></br>
                    <br></br>
                    <br></br>
                    <br></br>
                    <br></br>
                    <br></br>
                    <br></br>
                    <br></br>
                    <br></br>
                    <br></br>
                    <br></br>
                    <h3>댓글</h3>
                    {comments.length > 0 ? (
                        comments.map((comment) => (
                            <div key={comment.reply_seq} className={styles.comment}>
                                <div className={styles.commentHeader}>
                                    <strong>{comment.reply_userName || sessionUserName}</strong>
                                    <p style={{ margin: "0px" }}>{new Date(comment.reply_reg_date).toLocaleString()}</p>
                                    {comment.reply_userName === (usersName || sessionUserName) && (
                                        <div className={styles.dropdownMenu}>
                                            {editingCommentId === comment.reply_seq ? (
                                                <div>
                                                    <button onClick={() => handleUpdateReply(comment.reply_seq)} className={styles.dropdownItem}><FontAwesomeIcon icon={faCheck} /></button>
                                                    <button onClick={() => setEditingCommentId(null)} className={styles.dropdownItem}><FontAwesomeIcon icon={faX} /></button>
                                                </div>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={() => handleCommentEdit(comment.reply_seq, comment.reply_contents)}
                                                        className={styles.dropdownItem}
                                                    >
                                                        <FontAwesomeIcon icon={faTrash} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteComment(comment.reply_seq)}
                                                        className={styles.dropdownItem}
                                                    >
                                                        <FontAwesomeIcon icon={faX} />
                                                    </button>
                                                </>
                                            )}

                                        </div>
                                    )}
                                </div>

                                <div>
                                    {editingCommentId === comment.reply_seq ? (
                                        <textarea
                                            value={editedCommentText}
                                            onChange={(e) => setEditedCommentText(e.target.value)}
                                            className={styles.textarea}
                                        />
                                    ) : (
                                        <div>{comment.reply_contents}</div>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div>댓글이 없습니다.</div>
                    )}
                    <form onSubmit={handleCommentSubmit} className={styles.commentForm}>
                        <textarea
                            className={styles.textarea}
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="댓글을 작성하세요"
                        />
                        <button type="submit" className={styles.replyButton}>댓글 작성</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Detail;

