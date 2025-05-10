import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
  Alert,
  ImageList,
  ImageListItem
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const PostView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await axios.get(`/api/posts/${id}`);
        setPost(response.data);
      } catch (error) {
        console.error('Error fetching post:', error);
        setError('Failed to load post');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await axios.delete(`/api/posts/${id}`);
        navigate('/posts');
      } catch (error) {
        console.error('Error deleting post:', error);
        setError('Failed to delete post');
      }
    }
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!post) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">Post not found</Alert>
      </Container>
    );
  }

  const isOwner = user && user.id === post.userId;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton onClick={() => navigate('/posts')} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1">
            {post.title}
          </Typography>
          {isOwner && (
            <Box sx={{ ml: 'auto' }}>
              <IconButton onClick={() => navigate(`/posts/${id}/edit`)} sx={{ mr: 1 }}>
                <EditIcon />
              </IconButton>
              <IconButton onClick={handleDelete} color="error">
                <DeleteIcon />
              </IconButton>
            </Box>
          )}
        </Box>

        <Grid container spacing={3}>
          {/* Media Section */}
          {post.mediaUrls && post.mediaUrls.length > 0 && (
            <Grid item xs={12}>
              <Box sx={{ width: '100%', maxWidth: '800px', mx: 'auto' }}>
                <Grid container spacing={2}>
                  {post.mediaUrls.map((url, index) => {
                    const isVideo = url.match(/\.(mp4|webm|ogg)$/i);
                    return (
                      <Grid item xs={12} sm={6} md={4} key={index}>
                        <Box sx={{ position: 'relative', paddingTop: '100%' }}>
                          {!isVideo ? (
                            <img
                              src={url}
                              alt={`${post.title} - Image ${index + 1}`}
                              style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                borderRadius: '8px'
                              }}
                            />
                          ) : (
                            <video
                              controls
                              style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                borderRadius: '8px'
                              }}
                            >
                              <source src={url} type="video/mp4" />
                              Your browser does not support the video tag.
                            </video>
                          )}
                        </Box>
                      </Grid>
                    );
                  })}
                </Grid>
              </Box>
            </Grid>
          )}

          {/* Description */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Description
            </Typography>
            <Typography variant="body1" paragraph>
              {post.description}
            </Typography>
          </Grid>

          {/* Content */}
          {post.content && (
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Content
              </Typography>
              <Typography variant="body1" paragraph>
                {post.content}
              </Typography>
            </Grid>
          )}

          {/* Recipe Details */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Recipe Details
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1">
                  Cooking Time: {post.cookingTime} minutes
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1">
                  Servings: {post.servings}
                </Typography>
              </Grid>
            </Grid>
          </Grid>

          {/* Ingredients */}
          {post.ingredients && (
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Ingredients
              </Typography>
              <List>
                {(() => {
                  // Process ingredients to ensure they're in array format
                  let processedIngredients = [];
                  
                  if (Array.isArray(post.ingredients)) {
                    processedIngredients = post.ingredients;
                  } else if (typeof post.ingredients === 'string') {
                    try {
                      const parsed = JSON.parse(post.ingredients);
                      processedIngredients = Array.isArray(parsed) ? parsed : [post.ingredients];
                    } catch (e) {
                      // If parsing fails, it might be a single string value
                      processedIngredients = [post.ingredients];
                    }
                  }
                  
                  // Filter out empty values
                  processedIngredients = processedIngredients.filter(ing => ing && ing.trim() !== '');
                  
                  return processedIngredients.map((ingredient, index) => (
                    <ListItem key={index}>
                      <ListItemText
                        primary={ingredient}
                        secondary={post.amounts && post.amounts[index]}
                      />
                    </ListItem>
                  ));
                })()}
              </List>
            </Grid>
          )}

          {/* Instructions */}
          {post.instructions && (
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Instructions
              </Typography>
              <List>
                {(() => {
                  // Process instructions to ensure they're in array format
                  let processedInstructions = [];
                  
                  if (Array.isArray(post.instructions)) {
                    processedInstructions = post.instructions;
                  } else if (typeof post.instructions === 'string') {
                    try {
                      const parsed = JSON.parse(post.instructions);
                      processedInstructions = Array.isArray(parsed) ? parsed : [post.instructions];
                    } catch (e) {
                      // If parsing fails, it might be a single string value
                      processedInstructions = [post.instructions];
                    }
                  }
                  
                  // Filter out empty values
                  processedInstructions = processedInstructions.filter(inst => inst && inst.trim() !== '');
                  
                  return processedInstructions.map((instruction, index) => (
                    <ListItem key={index}>
                      <ListItemText
                        primary={`Step ${index + 1}`}
                        secondary={instruction}
                      />
                    </ListItem>
                  ));
                })()}
              </List>
            </Grid>
          )}

          {/* Post Metadata */}
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Posted by {post.userName} on {new Date(post.createdAt).toLocaleDateString()}
              </Typography>
              <Box>
                <Typography variant="body2" color="text.secondary" component="span" sx={{ mr: 2 }}>
                  {post.likes} likes
                </Typography>
                <Typography variant="body2" color="text.secondary" component="span">
                  {post.comments} comments
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default PostView; 