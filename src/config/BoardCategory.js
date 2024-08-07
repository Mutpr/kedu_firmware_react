import React, { useEffect, useState } from 'react';
import styles from './BoardCategory.module.css';
import axios from 'axios';

const serverUrl = process.env.REACT_APP_SERVER_URL;
axios.defaults.withCredentials = true;

const BoardCategoryComponent = ({ categories, onCategoryClick }) => {
    return (
        <div className={styles.boardCategories}>
            {categories.map(category => (
                <div
                    key={category.category_seq}
                    className={styles.category}
                    data-code={category.category_seq}
                    onClick={() => onCategoryClick(category)}
                >
                    {category.category_name}
                </div>
            ))}
        </div>
    );
};

const BoardPostComponent = ({ category }) => {
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        if (category) {
            console.log(category);
            axios.get(`${serverUrl}/posts/category/${category.category_seq}`)
                .then(resp => {
                    setPosts(resp.data);
                })
                .catch(error => {
                    console.error('Error fetching posts:', error);
                });
        }
    }, [category]);

    return (
        <div className={styles.posts}>
            {posts.map(post => (
                <div key={post.id} className={styles.post}>
                    <h3>{post.title}</h3>
                    <p>{post.content}</p>
                </div>
            ))}
        </div>
    );
};

const BoardPage = () => {
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(categories[0]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get(`${serverUrl}/board_category`)
            .then(resp => {
                setCategories(resp.data);
                setSelectedCategory(resp.data[0]);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching categories:', error);
                setLoading(false);
            });
    }, []);

    const handleCategoryClick = (category) => {
        setSelectedCategory(category);
    };

    if (loading) {
        return <div>Loading...</div>; // 로딩 스피너 또는 메시지를 표시할 수 있습니다.
    }

    return (
        <div className={styles.boardPage}>
            <BoardCategoryComponent
                categories={categories}
                onCategoryClick={handleCategoryClick}
            />
            {selectedCategory && <BoardPostComponent category={selectedCategory} />}
        </div>
    );
};

export default BoardPage;
