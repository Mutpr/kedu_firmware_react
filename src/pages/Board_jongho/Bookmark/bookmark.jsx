// BookmarkContext.js
import React, { createContext, useState, useContext } from 'react';

// Context 생성
const BookmarkContext = createContext();

// Context Provider 컴포넌트
export const BookmarkProvider = ({ children }) => {
    const [bookmarks, setBookmarks] = useState(new Set()); // 북마크 상태를 Set으로 관리

    const addBookmark = (id) => {
        setBookmarks(prev => new Set(prev).add(id));
    };

    const removeBookmark = (id) => {
        setBookmarks(prev => {
            const newBookmarks = new Set(prev);
            newBookmarks.delete(id);
            return newBookmarks;
        });
    };

    const isBookmarked = (id) => bookmarks.has(id);

    return (
        <BookmarkContext.Provider value={{ addBookmark, removeBookmark, isBookmarked }}>
            {children}
        </BookmarkContext.Provider>
    );
};

// Context를 사용하는 커스텀 훅
export const useBookmarks = () => useContext(BookmarkContext);