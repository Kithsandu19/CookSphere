import React, { useState, useEffect, useRef } from 'react';
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
  Tabs,
  Tab,
  Chip,
  IconButton,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import PostInteraction from '../components/PostInteraction';
import { useInView } from 'react-intersection-observer';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';

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
  
  const { ref, inView } = useInView({
    threshold: 0,
  });

  const categories = [
    'all',
    'breakfast',
    'lunch',
    'dinner',
    'dessert',
    'snacks',
    'vegetarian',
    'vegan',
    'gluten-free'
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

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setPage(1);
    setPosts([]);
    setLoading(true);
    fetchPosts();
  };

  const handlePostUpdate = () => {
    fetchPosts();
    fetchTrendingPosts();
  };

  const renderPost = (post) => (
    <Card key={post.id} sx={{ mb: 3, borderRadius: 2, boxShadow: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar
            alt={post.userName}
            src={post.userPicture}
            sx={{ mr: 2, cursor: 'pointer' }}
            onClick={() => navigate(`/profile/${post.userId}`)}
          />
          <Box sx={{ flex: 1 }}>
            <Typography 
              variant="subtitle1" 
              sx={{ cursor: 'pointer' }}
              onClick={() => navigate(`/profile/${post.userId}`)}
            >
              {post.userName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            </Typography>
          </Box>
        </Box>
        
        <Typography variant="h6" gutterBottom>
          {post.title}
        </Typography>
        
        <Typography variant="body1" paragraph>
          {post.description}
        </Typography>
        
        {post.mediaUrls && post.mediaUrls.length > 0 && (
          <Box sx={{ mt: 2, mb: 2 }}>
            {post.mediaType === 'image' ? (
              <img
                src={post.mediaUrls[0]}
                alt={post.title}
                style={{ 
                  maxWidth: '100%', 
                  borderRadius: '8px',
                  maxHeight: '500px',
                  objectFit: 'cover'
                }}
              />
            ) : post.mediaType === 'video' ? (
              <video
                controls
                style={{ 
                  maxWidth: '100%', 
                  borderRadius: '8px',
                  maxHeight: '500px'
                }}
              >
                <source src={post.mediaUrls[0]} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            ) : null}
          </Box>
        )}
        
        {post.ingredients && post.ingredients.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Ingredients:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {post.ingredients.map((ingredient, index) => (
                <Chip
                  key={index}
                  label={`${ingredient}${post.amounts ? ` - ${post.amounts[index]}` : ''}`}
                  size="small"
                  variant="outlined"
                />
              ))}
            </Box>
          </Box>
        )}
      </CardContent>
      
      <PostInteraction 
        post={post} 
        onUpdate={handlePostUpdate}
      />
    </Card>
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Left Sidebar - Categories */}
        {!isMobile && (
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 2, position: 'sticky', top: 20 }}>
              <Typography variant="h6" gutterBottom>
                Categories
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {categories.map((category) => (
                  <Chip
                    key={category}
                    label={category.charAt(0).toUpperCase() + category.slice(1)}
                    onClick={() => handleCategoryChange(category)}
                    color={selectedCategory === category ? 'primary' : 'default'}
                    variant={selectedCategory === category ? 'filled' : 'outlined'}
                  />
                ))}
              </Box>
            </Paper>
          </Grid>
        )}

        {/* Main Content */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h4" gutterBottom>
              Cooking Community
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Connect with fellow cooking enthusiasts and share your culinary experiences
            </Typography>
            
            {/* Mobile Categories */}
            {isMobile && (
              <Box sx={{ mb: 3, overflowX: 'auto', whiteSpace: 'nowrap' }}>
                <Box sx={{ display: 'inline-flex', gap: 1, pb: 1 }}>
                  {categories.map((category) => (
                    <Chip
                      key={category}
                      label={category.charAt(0).toUpperCase() + category.slice(1)}
                      onClick={() => handleCategoryChange(category)}
                      color={selectedCategory === category ? 'primary' : 'default'}
                      variant={selectedCategory === category ? 'filled' : 'outlined'}
                    />
                  ))}
                </Box>
              </Box>
            )}
            
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              sx={{ mb: 3 }}
            >
              <Tab label="For You" />
              <Tab label="Following" />
            </Tabs>
            
            <Divider sx={{ mb: 3 }} />
            
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : posts.length > 0 ? (
              <>
                {posts.map(renderPost)}
                {hasMore && (
                  <Box ref={ref} sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                    {loadingMore ? <CircularProgress /> : null}
                  </Box>
                )}
              </>
            ) : (
              <Typography align="center" color="text.secondary">
                No posts yet. Be the first to share!
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Right Sidebar - Trending Posts */}
        {!isMobile && (
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 2, position: 'sticky', top: 20 }}>
              <Typography variant="h6" gutterBottom>
                Trending Posts
              </Typography>
              {trendingPosts.map((post) => (
                <Card key={post.id} sx={{ mb: 2, cursor: 'pointer' }} onClick={() => navigate(`/posts/${post.id}`)}>
                  <CardContent sx={{ p: 2 }}>
                    <Typography variant="subtitle2" noWrap>
                      {post.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {post.likes} likes • {post.comments} comments
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Paper>
          </Grid>
        )}
      </Grid>
    </Container>
  );
};

export default Community; 