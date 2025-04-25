import React from 'react';
import { Link } from 'react-router-dom';
import PostInteraction from './PostInteraction';
import '../styles/Post.css';

const Post = ({ post, onUpdate }) => {
  return (
    <div className="post" id={`post-${post.id}`}>
      <div className="post-header">
        <Link to={`/profile/${post.userId}`} className="post-author">
          <img src={post.userPicture} alt={post.userName} className="author-avatar" />
          <span className="author-name">{post.userName}</span>
        </Link>
        <span className="post-time">
          {new Date(post.createdAt).toLocaleDateString()}
        </span>
      </div>

      <div className="post-content">
        <h3 className="post-title">{post.title}</h3>
        <p className="post-description">{post.description}</p>
        {post.imageUrl && (
          <img src={post.imageUrl} alt={post.title} className="post-image" />
        )}
      </div>

      <PostInteraction post={post} onUpdate={onUpdate} />
    </div>
  );
};

export default Post; 