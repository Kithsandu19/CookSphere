import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
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
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const MAX_IMAGES = 3;
const MAX_VIDEO_DURATION_SECONDS = 30;

const PostEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const videoRef = useRef(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    media: [],
    mediaType: '',
    ingredients: [''],
    amounts: [''],
    instructions: [''],
    cookingTime: '',
    servings: ''
  });

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await axios.get(`/api/posts/${id}`);
        const post = response.data;
        
        // Check if user is the owner of the post
        if (user.id !== post.userId) {
          navigate('/posts');
          return;
        }

        setFormData({
          title: post.title,
          description: post.description,
          content: post.content || '',
          media: [],
          mediaType: post.mediaType || '',
          ingredients: post.ingredients || [''],
          amounts: post.amounts || [''],
          instructions: post.instructions || [''],
          cookingTime: post.cookingTime || '',
          servings: post.servings || ''
        });
      } catch (error) {
        console.error('Error fetching post:', error);
        setError('Failed to load post');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id, user, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMediaChange = async (e) => {
    const files = Array.from(e.target.files);
    setError('');

    // Check if all files are valid type
    const hasInvalidType = files.some(file => 
      !file.type.startsWith('image/') && !file.type.startsWith('video/')
    );

    if (hasInvalidType) {
      setError('Invalid file type. Please upload images or videos only.');
      return;
    }

    // Check total number of files
    if (formData.media.length + files.length > MAX_IMAGES) {
      setError(`Maximum ${MAX_IMAGES} media files allowed`);
      return;
    }

    // For videos, check duration
    const videoFiles = files.filter(file => file.type.startsWith('video/'));
    if (videoFiles.length > 0) {
      try {
        const checkDuration = (file) => {
          return new Promise((resolve, reject) => {
            const video = document.createElement('video');
            video.preload = 'metadata';
            
            video.onloadedmetadata = () => {
              URL.revokeObjectURL(video.src);
              if (video.duration > MAX_VIDEO_DURATION_SECONDS) {
                reject(`Video "${file.name}" duration must be ${MAX_VIDEO_DURATION_SECONDS} seconds or less`);
              }
              resolve();
            };
            
            video.onerror = () => {
              URL.revokeObjectURL(video.src);
              reject(`Error loading video metadata for "${file.name}"`);
            };
            
            video.src = URL.createObjectURL(file);
          });
        };

        await Promise.all(videoFiles.map(checkDuration));
      } catch (err) {
        setError(err.message);
        return;
      }
    }

    setFormData(prev => ({
      ...prev,
      media: [...prev.media, ...files]
    }));
  };

  const handleArrayInputChange = (index, value, field) => {
    const newArray = [...formData[field]];
    newArray[index] = value;
    setFormData(prev => ({
      ...prev,
      [field]: newArray
    }));
  };

  const addArrayItem = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayItem = (index, field) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const formDataToSend = new FormData();
      
      // Add required fields
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      
      // Add optional fields if they exist
      if (formData.content) {
        formDataToSend.append('content', formData.content);
      }
      
      // Add ingredients and instructions as arrays
      if (formData.ingredients && formData.ingredients.length > 0) {
        // Filter out empty ingredients
        const validIngredients = formData.ingredients.filter(ingredient => ingredient.trim() !== '');
        validIngredients.forEach(ingredient => {
          formDataToSend.append('ingredients', ingredient);
        });
      }
      
      if (formData.amounts && formData.amounts.length > 0) {
        // Filter out empty amounts
        const validAmounts = formData.amounts.filter(amount => amount.trim() !== '');
        validAmounts.forEach(amount => {
          formDataToSend.append('amounts', amount);
        });
      }
      
      if (formData.instructions && formData.instructions.length > 0) {
        // Filter out empty instructions
        const validInstructions = formData.instructions.filter(instruction => instruction.trim() !== '');
        validInstructions.forEach(instruction => {
          formDataToSend.append('instructions', instruction);
        });
      }
      
      // Add cooking time and servings if they exist
      if (formData.cookingTime) {
        formDataToSend.append('cookingTime', formData.cookingTime);
      }
      
      if (formData.servings) {
        formDataToSend.append('servings', formData.servings);
      }

      // Append media files
      if (formData.media && formData.media.length > 0) {
        formData.media.forEach(file => {
          formDataToSend.append('media', file);
        });
      }

      await axios.put(`/api/posts/${id}`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      navigate(`/posts/${id}`);
    } catch (error) {
      console.error('Error updating post:', error);
      setError(error.response?.data || 'Failed to update post');
    } finally {
      setSaving(false);
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

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Edit Post
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                multiline
                rows={2}
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Content"
                name="content"
                value={formData.content}
                onChange={handleInputChange}
              />
            </Grid>

            {/* Media Upload */}
            <Grid item xs={12}>
              <Button
                variant="outlined"
                component="label"
              >
                Upload Media
                <input
                  type="file"
                  hidden
                  multiple
                  accept="image/*,video/*"
                  onChange={handleMediaChange}
                />
              </Button>
              {formData.media.length > 0 && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Selected files: {formData.media.map(file => file.name).join(', ')}
                </Typography>
              )}
              <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                {formData.mediaType === 'image' 
                  ? `Upload up to ${MAX_IMAGES} images`
                  : `Upload up to ${MAX_IMAGES} videos (max ${MAX_VIDEO_DURATION_SECONDS} seconds each)`}
              </Typography>
            </Grid>

            {/* Recipe Details */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Recipe Details
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Cooking Time (minutes)"
                    name="cookingTime"
                    value={formData.cookingTime}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Servings"
                    name="servings"
                    value={formData.servings}
                    onChange={handleInputChange}
                  />
                </Grid>
              </Grid>
            </Grid>

            {/* Ingredients */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Ingredients
              </Typography>
              <List>
                {formData.ingredients.map((ingredient, index) => (
                  <ListItem key={index}>
                    <Grid container spacing={2}>
                      <Grid item xs={5}>
                        <TextField
                          fullWidth
                          label="Ingredient"
                          value={ingredient}
                          onChange={(e) => handleArrayInputChange(index, e.target.value, 'ingredients')}
                        />
                      </Grid>
                      <Grid item xs={5}>
                        <TextField
                          fullWidth
                          label="Amount"
                          value={formData.amounts[index]}
                          onChange={(e) => handleArrayInputChange(index, e.target.value, 'amounts')}
                        />
                      </Grid>
                      <Grid item xs={2}>
                        <IconButton
                          edge="end"
                          onClick={() => removeArrayItem(index, 'ingredients')}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Grid>
                    </Grid>
                  </ListItem>
                ))}
              </List>
              <Button
                startIcon={<AddIcon />}
                onClick={() => addArrayItem('ingredients')}
                sx={{ mt: 1 }}
              >
                Add Ingredient
              </Button>
            </Grid>

            {/* Instructions */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Instructions
              </Typography>
              <List>
                {formData.instructions.map((instruction, index) => (
                  <ListItem key={index}>
                    <Grid container spacing={2}>
                      <Grid item xs={10}>
                        <TextField
                          fullWidth
                          label={`Step ${index + 1}`}
                          value={instruction}
                          onChange={(e) => handleArrayInputChange(index, e.target.value, 'instructions')}
                        />
                      </Grid>
                      <Grid item xs={2}>
                        <IconButton
                          edge="end"
                          onClick={() => removeArrayItem(index, 'instructions')}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Grid>
                    </Grid>
                  </ListItem>
                ))}
              </List>
              <Button
                startIcon={<AddIcon />}
                onClick={() => addArrayItem('instructions')}
                sx={{ mt: 1 }}
              >
                Add Step
              </Button>
            </Grid>

            {/* Submit Button */}
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={saving}
                sx={{ mt: 2 }}
              >
                {saving ? <CircularProgress size={24} /> : 'Update Post'}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default PostEdit; 