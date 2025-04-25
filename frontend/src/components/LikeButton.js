import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import axios from 'axios';

const LikeButton = ({ postId, currentUserId, initialLikes, onLikeChange }) => {
    const [likes, setLikes] = useState(initialLikes);
    const [isLiked, setIsLiked] = useState(false);
    const [error, setError] = useState('');

    const handleLike = async () => {
        try {
            await axios.post(`/api/interactions/posts/${postId}/likes?userId=${currentUserId}`);
            const newLikes = isLiked ? likes - 1 : likes + 1;
            setLikes(newLikes);
            setIsLiked(!isLiked);
            onLikeChange(newLikes);
        } catch (err) {
            setError('Failed to update like');
        }
    };

    return (
        <div>
            {error && <div className="text-danger">{error}</div>}
            <Button
                variant={isLiked ? "primary" : "outline-primary"}
                onClick={handleLike}
                className="me-2"
            >
                <i className={`bi ${isLiked ? 'bi-heart-fill' : 'bi-heart'}`}></i>
                {likes > 0 && <span className="ms-1">{likes}</span>}
            </Button>
        </div>
    );
};

export default LikeButton; 