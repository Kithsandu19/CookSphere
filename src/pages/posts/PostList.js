import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  Box,
  Card,
  CardContent,
  CardActions,
  CardMedia,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const PostList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching posts from API...');
      
      // Add request interceptor to log request details
      axios.interceptors.request.use(request => {
        console.log('Request:', {
          method: request.method,
          url: request.url,
          headers: request.headers,
          data: request.data
        });
        return request;
      });

      // Add response interceptor to log response details
      axios.interceptors.response.use(
        response => {
          console.log('Response:', {
            status: response.status,
            headers: response.headers,
            data: response.data
          });
          return response;
        },
        error => {
          console.error('Response Error:', {
            message: error.message,
            response: error.response ? {
              status: error.response.status,
              statusText: error.response.statusText,
              data: error.response.data
            } : 'No response',
            config: error.config
          });
          return Promise.reject(error);
        }
      );

      const response = await axios.get('/api/posts', {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });

      console.log('API Response:', response);
      console.log('Response data type:', typeof response.data);
      console.log('Response data:', response.data);

      if (Array.isArray(response.data)) {
        // Parse ingredients and steps from JSON strings
        const processedPosts = response.data.map(post => {
          console.log('Raw post data:', post);
          
          // Helper function to parse deeply nested JSON strings
          const parseDeepJson = (str) => {
            if (!str || typeof str !== 'string') return str;
            
            try {
              // First parse
              const firstParse = JSON.parse(str);
              
              // If it's an array with one string element that looks like JSON
              if (Array.isArray(firstParse) && firstParse.length === 1 && 
                  typeof firstParse[0] === 'string' && firstParse[0].startsWith('[')) {
                // Second parse
                const secondParse = JSON.parse(firstParse[0]);
                
                // If it's an array with one string element that looks like JSON
                if (Array.isArray(secondParse) && secondParse.length === 1 && 
                    typeof secondParse[0] === 'string' && secondParse[0].startsWith('[')) {
                  // Third parse
                  return JSON.parse(secondParse[0]);
                }
                
                return secondParse;
              }
              
              return firstParse;
            } catch (e) {
              console.error('Error parsing deep JSON:', e);
              return str;
            }
          };
          
          // Process ingredients
          if (typeof post.ingredients === 'string') {
            post.ingredients = parseDeepJson(post.ingredients);
          }
          
          // Process steps
          if (typeof post.steps === 'string') {
            post.steps = parseDeepJson(post.steps);
          }
          
          // Ensure they're arrays
          if (!Array.isArray(post.ingredients)) {
            post.ingredients = [];
          }
          
          if (!Array.isArray(post.steps)) {
            post.steps = [];
          }
          
          return post;
        });
        
        setPosts(processedPosts);
        console.log(`Successfully loaded ${processedPosts.length} posts`);
        if (processedPosts.length === 0) {
          console.log('No posts found in the response');
        } else {
          console.log('First post:', processedPosts[0]);
        }
      } else if (response.data === null) {
        console.error('Received null response data');
        setError('Server returned null data. Please try again later.');
      } else {
        console.error('Expected an array of posts, but got:', typeof response.data);
        setError('Invalid data format received from server');
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response ? {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data
        } : 'No response data',
        request: error.request ? 'Request was made but no response received' : 'No request was made'
      });
      
      let errorMessage = 'Failed to load posts. Please try again later.';
      if (error.response) {
        errorMessage += ` (Status: ${error.response.status})`;
        if (error.response.data && error.response.data.message) {
          errorMessage += ` - ${error.response.data.message}`;
        }
      } else if (error.request) {
        errorMessage += ' (No response from server)';
      } else {
        errorMessage += ` (${error.message})`;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleMenuOpen = (event, post) => {
    setAnchorEl(event.currentTarget);
    setSelectedPost(post);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedPost(null);
  };

  const handleEdit = () => {
    handleMenuClose();
    navigate(`/posts/${selectedPost.id}/edit`);
  };

  const handleDeleteClick = (post) => {
    setSelectedPost(post);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`/api/posts/${selectedPost.id}`);
      fetchPosts();
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting post:', error);
      setError('Failed to delete post. Please try again later.');
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedPost(null);
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
          <Button 
            variant="contained" 
            color="primary" 
            onClick={fetchPosts}
            sx={{ ml: 2 }}
          >
            Retry
          </Button>
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Header */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h4">
              Cooking Posts
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/posts/create')}
            >
              New Post
            </Button>
          </Paper>
        </Grid>

        {/* Posts Grid */}
        <Grid item xs={12}>
          {posts.length > 0 ? (
            <Grid container spacing={3}>
              {posts.map((post) => (
                <Grid item xs={12} md={6} lg={4} key={post.id}>
                  <Card>
                    {post.mediaUrls && post.mediaUrls.length > 0 && (
                      post.mediaType === 'image' ? (
                        <CardMedia
                          component="img"
                          height="300"
                          image={post.mediaUrls[0]}
                          alt={post.title}
                          sx={{ 
                            objectFit: 'contain',
                            backgroundColor: '#f5f5f5',
                            maxHeight: '300px',
                            width: '100%'
                          }}
                          onError={(e) => {
                            console.error('Error loading image:', post.mediaUrls[0]);
                            e.target.src = '/placeholder-image.jpg';
                          }}
                        />
                      ) : post.mediaType === 'video' ? (
                        <CardMedia
                          component="video"
                          height="200"
                          image={post.mediaUrls[0]}
                          controls
                          sx={{ objectFit: 'cover' }}
                        />
                      ) : null
                    )}
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Typography variant="h6" gutterBottom>
                          {post.title}
                        </Typography>
                        {user && user.sub === post.userId && (
                          <IconButton onClick={(e) => handleMenuOpen(e, post)}>
                            <MoreVertIcon />
                          </IconButton>
                        )}
                      </Box>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {post.description}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {(() => {
                          const getIngredients = (post) => {
                            try {
                              // If it's already an array, use it
                              if (Array.isArray(post.ingredients)) {
                                return post.ingredients;
                              }
                              
                              // If it's a string, try to parse it
                              if (typeof post.ingredients === 'string') {
                                try {
                                  const parsed = JSON.parse(post.ingredients);
                                  return Array.isArray(parsed) ? parsed : [post.ingredients];
                                } catch (e) {
                                  // If parsing fails, it might be a single string value
                                  return [post.ingredients];
                                }
                              }
                              
                              // Default to empty array
                              return [];
                            } catch (e) {
                              console.error('Error extracting ingredients:', e);
                              return [];
                            }
                          };
                          
                          const ingredients = getIngredients(post);
                          console.log('Rendering ingredients:', ingredients);
                          
                          // Ensure we have an array of strings and filter out empty values
                          const finalIngredients = Array.isArray(ingredients) 
                            ? ingredients.filter(ing => ing && ing.trim() !== '')
                            : [ingredients].filter(ing => ing && ing.trim() !== '');
                          
                          return finalIngredients.map((ingredient, index) => (
                            <Chip
                              key={index}
                              label={ingredient}
                              size="small"
                              variant="outlined"
                            />
                          ));
                        })()}
                      </Box>
                    </CardContent>
                    <CardActions>
                      <Button size="small" onClick={() => navigate(`/posts/${post.id}`)}>
                        View Details
                      </Button>
                      {user && user.sub === post.userId && (
                        <IconButton 
                          size="small" 
                          color="error" 
                          onClick={() => handleDeleteClick(post)}
                          sx={{ ml: 'auto' }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      )}
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                        {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : 'No date'}
                      </Typography>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography color="text.secondary">
                No posts yet. Start sharing your recipes!
              </Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => navigate('/posts/create')}
                sx={{ mt: 2 }}
              >
                Create Your First Post
              </Button>
            </Paper>
          )}
        </Grid>
      </Grid>

      {/* Post Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEdit}>Edit</MenuItem>
        <MenuItem onClick={handleDeleteClick}>Delete</MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>Delete Post</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this post? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default PostList; 