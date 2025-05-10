import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';
import '../styles/PostInteraction.css';
import '../styles/Icons.css';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  Box,
  IconButton,
  Typography,
  TextField,
  Button,
  Divider,
  Avatar,
  Menu,
  MenuItem,
  CardActions,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Collapse,
} from '@mui/material';
import {
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Share as ShareIcon,
  MoreVert as MoreVertIcon,
  Send as SendIcon,
  Comment as CommentIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
} from '@mui/icons-material';

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
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedComment, setSelectedComment] = useState(null);
  const [showComments, setShowComments] = useState(false);
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

  const handleMenuOpen = (event, comment) => {
    event.stopPropagation();
    setSelectedComment(comment);
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedComment(null);
  };

  const handleEditClick = () => {
    setEditingComment(selectedComment.id);
    setEditCommentText(selectedComment.content);
    handleMenuClose();
  };

  const handleDeleteClick = () => {
    handleDeleteComment(selectedComment.id);
    handleMenuClose();
  };

  return (
    <>
      <Divider />
      <CardActions sx={{ justifyContent: 'space-between', px: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton 
            onClick={handleLike}
            disabled={isLikeLoading}
            color={isLiked ? 'primary' : 'default'}
            sx={{ 
              transition: 'transform 0.2s',
              '&:hover': { transform: 'scale(1.1)' }
            }}
          >
            {isLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
          </IconButton>
          <Typography variant="body2" color="text.secondary">
            {likeCount} {likeCount === 1 ? 'like' : 'likes'}
          </Typography>
          <Box 
            component="button"
            onClick={() => setShowComments(!showComments)}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: 1,
              transition: 'background-color 0.2s',
              '&:hover': {
                backgroundColor: 'action.hover',
              }
            }}
          >
            <CommentIcon fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
            </Typography>
            {showComments ? 
              <KeyboardArrowUpIcon fontSize="small" color="action" /> : 
              <KeyboardArrowDownIcon fontSize="small" color="action" />
            }
          </Box>
        </Box>
        <IconButton onClick={handleShare}>
          <ShareIcon />
        </IconButton>
      </CardActions>

      <Collapse in={showComments}>
        <Box sx={{ px: 2, py: 1 }}>
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3
                }
              }}
            />
            <IconButton 
              color="primary"
              onClick={handleAddComment}
              disabled={!newComment.trim()}
              sx={{
                borderRadius: 2,
                backgroundColor: 'primary.main',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'primary.dark',
                },
                '&.Mui-disabled': {
                  backgroundColor: 'action.disabledBackground',
                  color: 'action.disabled',
                }
              }}
            >
              <SendIcon />
            </IconButton>
          </Box>

          <Box 
            sx={{ 
              maxHeight: 300, 
              overflowY: 'auto',
              scrollbarWidth: 'thin',
              '&::-webkit-scrollbar': {
                width: '6px',
              },
              '&::-webkit-scrollbar-track': {
                background: '#f1f1f1',
                borderRadius: '10px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: '#888',
                borderRadius: '10px',
                '&:hover': {
                  background: '#666',
                },
              },
            }}
          >
            {comments.map((comment) => (
              <ListItem
                key={comment.id}
                alignItems="flex-start"
                sx={{ 
                  px: 0,
                  '&:hover': {
                    backgroundColor: 'action.hover',
                    borderRadius: 1
                  }
                }}
              >
                <ListItemAvatar>
                  <Avatar src={comment.userPicture} alt={comment.userName} />
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography variant="subtitle2" component="span">
                      {comment.userName}
                    </Typography>
                  }
                  secondary={
                    editingComment === comment.id ? (
                      <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                        <TextField
                          fullWidth
                          size="small"
                          value={editCommentText}
                          onChange={(e) => setEditCommentText(e.target.value)}
                          autoFocus
                        />
                        <Button 
                          variant="contained" 
                          size="small"
                          onClick={() => handleEditComment(comment.id)}
                        >
                          Save
                        </Button>
                        <Button 
                          variant="outlined" 
                          size="small"
                          onClick={() => setEditingComment(null)}
                        >
                          Cancel
                        </Button>
                      </Box>
                    ) : (
                      <Box component="span">
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.primary"
                          sx={{ display: 'block', mb: 0.5 }}
                        >
                          {comment.content}
                        </Typography>
                        <Typography
                          component="span"
                          variant="caption"
                          color="text.secondary"
                        >
                          {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                        </Typography>
                      </Box>
                    )
                  }
                />
                {user && (user.id === comment.userId) && !editingComment && (
                  <ListItemSecondaryAction>
                    <IconButton 
                      edge="end" 
                      size="small"
                      onClick={(e) => handleMenuOpen(e, comment)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                )}
              </ListItem>
            ))}
          </Box>
        </Box>
      </Collapse>

      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleEditClick}>Edit</MenuItem>
        <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
          Delete
        </MenuItem>
      </Menu>
    </>
  );
};

export default PostInteraction; 