import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';
import '../styles/PostInteraction.css';
import '../styles/Icons.css';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

// Configure axios defaults
axios.defaults.withCredentials = true;
axios.defaults.headers.common['Accept'] = 'application/json';
axios.defaults.headers.common['Content-Type'] = 'application/json';

const PostInteraction = ({ post, onUpdate }) => {
  const { user, checkAuthStatus } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes || 0);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [editingComment, setEditingComment] = useState(null);
  const [editCommentText, setEditCommentText] = useState('');
  const [isLikeLoading, setIsLikeLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchComments();
    checkIfLiked();
  }, [post.id, user?.id]);

  // Update like count when post changes
  useEffect(() => {
    setLikeCount(post.likes || 0);
  }, [post.likes]);

  const fetchComments = async () => {
    if (!post.id) return;
    
    try {
      const response = await axios.get(`/api/interactions/posts/${post.id}/comments`);
      setComments(response.data);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast.error('Failed to load comments. Please try again.');
    }
  };

  const checkIfLiked = async () => {
    if (!user || !post.id) return;
    try {
      const response = await axios.get(`/api/posts/${post.id}/likes/check`);
      setIsLiked(response.data.liked);
    } catch (error) {
      console.error('Error checking like status:', error.response?.data || error.message);
      if (error.response?.status === 401) {
        // If unauthorized, try to refresh auth status
        await checkAuthStatus();
      }
    }
  };

  const handleLike = async () => {
    if (!user) {
      toast.error('Please log in to like posts');
      navigate('/login');
      return;
    }

    if (!post.id) {
      console.error('Post ID is undefined:', post);
      toast.error('Cannot like this post. Post ID is missing.');
      return;
    }

    if (!user.id) {
      console.error('User ID is undefined:', user);
      toast.error('Cannot like this post. User ID is missing.');
      return;
    }

    try {
      setIsLikeLoading(true);
      console.log('Sending like request for post:', post.id, 'user:', user.id);
      
      // First check if the user exists in the database
      try {
        const userResponse = await axios.get(`/api/users/${user.id}`);
        console.log('User found:', userResponse.data);
      } catch (userError) {
        console.error('Error checking user:', userError);
        // If user doesn't exist, create them
        try {
          // Make sure we have all required fields
          if (!user.name || !user.email) {
            console.error('Missing user data:', user);
            toast.error('Cannot create user account. Missing required information.');
            setIsLikeLoading(false);
            return;
          }
          
          console.log('Creating user with data:', {
            id: user.id,
            name: user.name,
            email: user.email
          });
          
          const createUserResponse = await axios.post('/api/users', {
            id: user.id,
            name: user.name,
            email: user.email
          });
          
          console.log('User created:', createUserResponse.data);
        } catch (createError) {
          console.error('Error creating user:', createError);
          console.error('Error response:', createError.response?.data);
          toast.error(createError.response?.data?.message || 'Failed to create user account. Please try again.');
          setIsLikeLoading(false);
          return;
        }
      }
      
      // Now proceed with the like
      const response = await axios.post(`/api/interactions/posts/${post.id}/likes`, null, {
        params: { userId: user.id }
      });
      
      console.log('Like response:', response.data);
      
      if (response.data.success) {
        // Toggle the like state
        const newIsLiked = !isLiked;
        setIsLiked(newIsLiked);
        
        // Update the like count
        const newLikeCount = newIsLiked ? likeCount + 1 : likeCount - 1;
        setLikeCount(newLikeCount);
        
        // Update the post object
        if (onUpdate) {
          const updatedPost = { ...post, likes: newLikeCount };
          onUpdate(updatedPost);
        }
        
        toast.success(newIsLiked ? 'Post liked!' : 'Post unliked');
      } else {
        console.error('Failed to update like:', response.data.message);
        toast.error(response.data.message || 'Failed to update like. Please try again.');
      }
    } catch (error) {
      console.error('Error updating like:', error);
      console.error('Error response:', error.response?.data);
      if (error.response?.status === 401) {
        toast.error('Your session has expired. Please log in again.');
      } else {
        toast.error(error.response?.data?.message || 'Failed to update like. Please try again.');
      }
    } finally {
      setIsLikeLoading(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please log in to comment');
      navigate('/login');
      return;
    }
    
    if (!newComment.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }
    
    try {
      const response = await axios.post(`/api/interactions/posts/${post.id}/comments`, 
        { content: newComment },
        {
          params: {
            userId: user.id,
            userName: user.name,
            userPicture: user.picture
          }
        }
      );
      setNewComment('');
      fetchComments();
      if (onUpdate) onUpdate();
      toast.success('Comment added successfully');
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment. Please try again.');
    }
  };

  const handleEditComment = async (commentId) => {
    if (!editCommentText.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }
    
    try {
      const response = await axios.put(
        `/api/posts/${post.id}/comments/${commentId}`,
        { content: editCommentText },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      setComments(comments.map(comment => 
        comment.id === commentId 
          ? { ...comment, content: editCommentText, updatedAt: new Date().toISOString() }
          : comment
      ));
      
      setEditingComment(null);
      setEditCommentText('');
      
      if (onUpdate) onUpdate();
      toast.success('Comment updated successfully');
    } catch (error) {
      console.error('Error editing comment:', error);
      toast.error('Failed to update comment. Please try again.');
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await axios.delete(`/api/posts/${post.id}/comments/${commentId}`);
      setComments(comments.filter(comment => comment.id !== commentId));
      if (onUpdate) onUpdate();
      toast.success('Comment deleted successfully');
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Failed to delete comment. Please try again.');
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: post.title,
          text: post.description,
          url: window.location.href
        });
        toast.success('Shared successfully');
      } else {
        // Fallback for browsers that don't support Web Share API
        const shareUrl = window.location.href;
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      toast.error('Failed to share. Please try again.');
    }
  };

  return (
    <div className="post-interaction">
      <div className="interaction-buttons">
        <button 
          className={`icon-button ${isLiked ? 'liked' : ''}`}
          onClick={handleLike}
          disabled={isLikeLoading}
        >
          <span className="material-icons md-animate like">
            {isLiked ? 'favorite' : 'favorite_border'}
          </span>
          <span>{likeCount}</span>
        </button>
        
        <button className="icon-button">
          <span className="material-icons md-animate comment">comment</span>
          <span>{comments.length}</span>
        </button>

        <button className="icon-button" onClick={handleShare}>
          <span className="material-icons md-animate share">share</span>
        </button>
      </div>

      <div className="comments-section">
        <form onSubmit={handleAddComment} className="add-comment">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="comment-input"
          />
          <button type="submit" className="submit-comment">
            Post
          </button>
        </form>

        <div className="comments-list">
          {comments.map(comment => (
            <div 
              key={comment.id} 
              id={`comment-${comment.id}`}
              className="comment"
            >
              <div className="comment-header">
                <span className="comment-author">{comment.userName || 'Anonymous'}</span>
                <span className="comment-time">
                  {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                </span>
              </div>
              
              {editingComment === comment.id ? (
                <div className="edit-comment">
                  <input
                    type="text"
                    value={editCommentText}
                    onChange={(e) => setEditCommentText(e.target.value)}
                    className="edit-comment-input"
                    autoFocus
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleEditComment(comment.id);
                      }
                    }}
                  />
                  <div className="edit-comment-buttons">
                    <button 
                      onClick={() => handleEditComment(comment.id)}
                      className="save-button"
                      type="button"
                    >
                      Save
                    </button>
                    <button 
                      onClick={() => {
                        setEditingComment(null);
                        setEditCommentText('');
                      }}
                      className="cancel-button"
                      type="button"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="comment-content">
                  <p>{comment.content}</p>
                  {(user?.id === comment.userId || user?.id === post.userId) && (
                    <div className="comment-actions">
                      {user?.id === comment.userId && (
                        <button 
                          onClick={() => {
                            setEditingComment(comment.id);
                            setEditCommentText(comment.content);
                          }}
                          className="icon-button"
                          title="Edit comment"
                        >
                          <span className="material-icons md-animate edit">edit</span>
                        </button>
                      )}
                      <button 
                        onClick={() => handleDeleteComment(comment.id)}
                        className="icon-button"
                        title="Delete comment"
                      >
                        <span className="material-icons md-animate delete">delete</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PostInteraction; 