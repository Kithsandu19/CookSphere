import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Avatar,
  Divider,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  useTheme,
  useMediaQuery,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import PostInteraction from '../components/PostInteraction';
import { useInView } from 'react-intersection-observer';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import CommunityChat from '../components/CommunityChat';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import '../styles/Community.css';

const Community = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [posts, setPosts] = useState([]);
  const [trendingPosts, setTrendingPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);

  const { ref, inView } = useInView({ threshold: 0 });

  const categories = [
    'all',
    'breakfast',
    'lunch',
    'dinner',
    'dessert',
    'snacks',
    'vegetarian',
    'vegan',
    'gluten-free',
  ];

  useEffect(() => {
    fetchPosts();
    fetchTrendingPosts();
  }, []);

  useEffect(() => {
    if (inView && hasMore && !loadingMore) {
      loadMorePosts();
    }
  }, [inView]);

  const fetchPosts = async () => {
    try {
      const response = await axios.get(`/api/posts?page=${page}&category=${selectedCategory}`);
      setPosts(response.data.content || response.data);
      setHasMore(response.data.content ? response.data.content.length > 0 : false);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrendingPosts = async () => {
    try {
      const response = await axios.get('/api/posts/trending');
      setTrendingPosts(response.data);
    } catch (error) {
      console.error('Error fetching trending posts:', error);
    }
  };

  const loadMorePosts = async () => {
    if (loadingMore) return;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const response = await axios.get(`/api/posts?page=${nextPage}&category=${selectedCategory}`);
      const newPosts = response.data.content || response.data;
      if (newPosts.length > 0) {
        setPosts(prevPosts => [...prevPosts, ...newPosts]);
        setPage(nextPage);
        setHasMore(true);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error loading more posts:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
    setPage(1);
    setPosts([]);
    setLoading(true);
    fetchPosts();
  };

  const handlePostUpdate = () => {
    fetchPosts();
    fetchTrendingPosts();
  };

  const handleEditPost = (postId) => {
    navigate(`/posts/${postId}/edit`);
  };

  const handleDeletePost = (postId) => {
    setPostToDelete(postId);
    setDeleteDialogOpen(true);
  };

  const confirmDeletePost = async () => {
    if (!postToDelete) return;
    try {
      await axios.delete(`/api/posts/${postToDelete}`);
      setDeleteDialogOpen(false);
      setPostToDelete(null);
      fetchPosts();
    } catch (error) {
      // Optionally show error
      setDeleteDialogOpen(false);
      setPostToDelete(null);
    }
  };

  const cancelDeletePost = () => {
    setDeleteDialogOpen(false);
    setPostToDelete(null);
  };

  const renderPost = (post) => (
    <Card key={post.id} className="modern-post-tile" sx={{ borderRadius: 4, boxShadow: 3, transition: '0.3s', '&:hover': { boxShadow: 8, transform: 'translateY(-4px) scale(1.01)' }, bgcolor: 'background.paper' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar
            alt={post.userName}
            src={post.userPicture}
            sx={{ mr: 2, cursor: 'pointer', width: 48, height: 48, border: '2px solid #eee' }}
            onClick={() => navigate(`/profile/${post.userId}`)}
          />
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" sx={{ cursor: 'pointer', fontWeight: 600 }} onClick={() => navigate(`/profile/${post.userId}`)}>
              {post.userName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            </Typography>
          </Box>
          {user && post.userId === user.id && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton onClick={() => handleEditPost(post.id)} size="small" color="primary"><EditIcon /></IconButton>
              <IconButton onClick={() => handleDeletePost(post.id)} size="small" color="error"><DeleteIcon /></IconButton>
            </Box>
          )}
        </Box>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, color: 'primary.main' }}>
          {post.title}
        </Typography>
        <Typography variant="body1" paragraph sx={{ color: 'text.secondary', minHeight: 48 }}>
          {post.description}
        </Typography>
        {post.mediaUrls && post.mediaUrls.length > 0 && (
          <Box sx={{ mt: 2, mb: 2, borderRadius: 2, overflow: 'hidden', boxShadow: 1 }}>
            {post.mediaType === 'image' ? (
              <img
                src={post.mediaUrls[0]}
                alt={post.title}
                style={{ width: '100%', maxHeight: 300, objectFit: 'cover', borderRadius: 12 }}
              />
            ) : post.mediaType === 'video' ? (
              <video controls style={{ width: '100%', maxHeight: 300, borderRadius: 12 }}>
                <source src={post.mediaUrls[0]} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            ) : null}
          </Box>
        )}
        {post.ingredients && post.ingredients.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
              Ingredients:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {post.ingredients.map((ingredient, index) => (
                <Paper key={index} elevation={1} sx={{ px: 1.5, py: 0.5, borderRadius: 2, bgcolor: 'grey.100', fontSize: 13 }}>
                  {ingredient}{post.amounts ? ` - ${post.amounts[index]}` : ''}
                </Paper>
              ))}
            </Box>
          </Box>
        )}
      </CardContent>
      <Divider sx={{ my: 1 }} />
      <Box sx={{ px: 2, pb: 2 }}>
        <PostInteraction post={post} onUpdate={handlePostUpdate} />
      </Box>
    </Card>
  );

  return (
    <Box sx={{ bgcolor: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ef 100%)', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="xl">
        <Grid container spacing={4}>
          {/* Main Content */}
          <Grid item xs={12} md={8}>
            <Paper elevation={0} sx={{ p: { xs: 2, md: 4 }, borderRadius: 4, bgcolor: 'white', mb: 4 }}>
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'stretch', sm: 'center' }, gap: 2, mb: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main', flex: 1 }}>
                  Community
                </Typography>
                <FormControl sx={{ minWidth: 180 }} size="small">
                  <InputLabel id="category-select-label">Category</InputLabel>
                  <Select
                    labelId="category-select-label"
                    value={selectedCategory}
                    label="Category"
                    onChange={handleCategoryChange}
                  >
                    {categories.map((category) => (
                      <MenuItem key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              <Divider sx={{ mb: 3 }} />
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress />
                </Box>
              ) : posts.length > 0 ? (
                <Box className="posts-grid" sx={{ mt: 2 }}>
                  {posts.map(renderPost)}
                  {hasMore && (
                    <Box ref={ref} sx={{ display: 'flex', justifyContent: 'center', p: 3, gridColumn: '1/-1' }}>
                      {loadingMore ? <CircularProgress /> : null}
                    </Box>
                  )}
                </Box>
              ) : (
                <Typography align="center" color="text.secondary">
                  No posts yet. Be the first to share!
                </Typography>
              )}
            </Paper>
            {/* Optionally, add CommunityChat here or elsewhere */}
          </Grid>
          {/* Trending Posts */}
          <Grid item xs={12} md={4}>
            <Box sx={{ position: 'sticky', top: 32, display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Featured Chef Card */}
              <Card sx={{ borderRadius: 3, boxShadow: 2, bgcolor: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ef 100%)', p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar src="https://randomuser.me/api/portraits/men/32.jpg" sx={{ width: 56, height: 56 }} />
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Chef of the Week</Typography>
                    <Typography variant="body2" color="text.secondary">Alex Gourmet</Typography>
                  </Box>
                </Box>
                <Typography variant="body2" sx={{ mt: 2 }}>
                  "Cooking is an art, but all art requires knowing something about the techniques and materials."
                </Typography>
              </Card>
              {/* Cooking Tip Card */}
              <Card sx={{ borderRadius: 3, boxShadow: 2, bgcolor: '#fff', p: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'primary.main' }}>Quick Cooking Tip</Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Always let your meat rest after cooking to keep it juicy and flavorful!
                </Typography>
              </Card>
              {/* Fun Fact Card */}
              <Card sx={{ borderRadius: 3, boxShadow: 2, bgcolor: '#fff', p: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'secondary.main' }}>Did You Know?</Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  The world's largest omelette was made with 145,000 eggs in Portugal!
                </Typography>
              </Card>
              {/* Trending Posts List (kept for functionality, but no title) */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {trendingPosts.map((post) => (
                  <Card key={post.id} sx={{ borderRadius: 3, boxShadow: 2, cursor: 'pointer', transition: '0.2s', '&:hover': { boxShadow: 6, bgcolor: 'grey.50' } }} onClick={() => navigate(`/posts/${post.id}`)}>
                    <CardContent sx={{ p: 2 }}>
                      <Typography variant="subtitle2" noWrap sx={{ fontWeight: 600 }}>
                        {post.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {post.likes} likes • {post.comments} comments
                      </Typography>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>
      <Dialog open={deleteDialogOpen} onClose={cancelDeletePost}>
        <DialogTitle>Delete Post</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this post? This action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelDeletePost}>Cancel</Button>
          <Button onClick={confirmDeletePost} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Community; 