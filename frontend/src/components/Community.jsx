import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import Post from './Post';
import '../styles/Community.css';

const Community = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const postId = searchParams.get('postId');
  const highlightType = searchParams.get('type');
  const commentId = searchParams.get('commentId');

  const fetchPosts = async () => {
    try {
      const response = await axios.get('/api/posts');
      setPosts(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    if (postId && posts.length > 0 && !loading) {
      // Add a small delay to ensure DOM is ready
      setTimeout(() => {
        const postElement = document.getElementById(`post-${postId}`);
        if (postElement) {
          // Create a temporary anchor element
          const anchor = document.createElement('a');
          anchor.href = `#post-${postId}`;
          
          // Add highlight class based on type
          if (highlightType === 'like') {
            postElement.classList.add('highlight-like');
          } else if (highlightType === 'comment') {
            postElement.classList.add('highlight-comment');
          } else if (highlightType === 'reply' && commentId) {
            postElement.classList.add('highlight-reply');
            
            // Find and highlight the specific comment
            setTimeout(() => {
              const commentElement = document.getElementById(`comment-${commentId}`);
              if (commentElement) {
                commentElement.classList.add('highlight-comment');
              }
            }, 500);
          }

          // Remove highlight classes after animation
          setTimeout(() => {
            postElement.classList.remove('highlight-like', 'highlight-comment', 'highlight-reply');
            if (commentId) {
              const commentElement = document.getElementById(`comment-${commentId}`);
              if (commentElement) {
                commentElement.classList.remove('highlight-comment');
              }
            }
          }, 2000);
          
          // Trigger the anchor click to scroll to the element
          anchor.click();
        }
      }, 100);
    }
  }, [postId, posts, highlightType, commentId, loading]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="community">
      <h1>Community Posts</h1>
      <div className="posts-grid">
        {posts.map(post => (
          <Post key={post.id} post={post} onUpdate={fetchPosts} />
        ))}
      </div>
    </div>
  );
};

export default Community; 