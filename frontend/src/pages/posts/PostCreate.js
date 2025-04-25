import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
  ListItemSecondaryAction,
  Divider,
  Alert,
  CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const MAX_IMAGES = 3;
const MAX_VIDEO_DURATION_SECONDS = 30;

const PostCreate = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
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
  const [mediaFiles, setMediaFiles] = useState([]);
  const [mediaPreviews, setMediaPreviews] = useState([]);
  const [mediaError, setMediaError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMediaChange = (event) => {
    const files = Array.from(event.target.files);
    setMediaError('');

    // Check total number of files
    if (mediaFiles.length + files.length > 3) {
      setMediaError('Maximum 3 media files allowed (photos and videos combined)');
      return;
    }

    // Validate each file
    for (const file of files) {
      if (file.type.startsWith('image/')) {
        // Handle image file
        setMediaFiles(prev => [...prev, { file, type: 'image' }]);
        const preview = URL.createObjectURL(file);
        setMediaPreviews(prev => [...prev, { url: preview, type: 'image' }]);
      } else if (file.type.startsWith('video/')) {
        // Handle video file
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.onloadedmetadata = function() {
          if (this.duration > 30) {
            setMediaError('Videos must be 30 seconds or less');
            return;
          }
          setMediaFiles(prev => [...prev, { file, type: 'video' }]);
          const preview = URL.createObjectURL(file);
          setMediaPreviews(prev => [...prev, { url: preview, type: 'video' }]);
        };
        video.src = URL.createObjectURL(file);
      } else {
        setMediaError('Invalid file type. Please upload images or videos only.');
        return;
      }
    }
  };

  const handleRemoveMedia = (index) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
    setMediaPreviews(prev => {
      const newPreviews = [...prev];
      URL.revokeObjectURL(newPreviews[index].url);
      return newPreviews.filter((_, i) => i !== index);
    });
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
    console.log("Form submission started");
    setLoading(true);
    setError('');

    try {
      // Create a FormData object
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
      if (mediaFiles.length > 0) {
        mediaFiles.forEach(({ file, type }, index) => {
          formDataToSend.append('media', file);
        });
        
        // Set media type based on the first file
        const firstFileType = mediaFiles[0].type;
        formDataToSend.append('mediaType', firstFileType);
      }

      console.log("Sending API request...");
      
      // Make the API call
      const response = await axios.post('/api/posts', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log("API response received:", response);
      
      // If successful, show a success message and redirect
      if (response.status === 200 || response.status === 201) {
        console.log("Post created successfully, redirecting...");
        
        // Show a success message
        alert("Post created successfully! Redirecting to posts page...");
        
        // Navigate to posts page
        window.location.href = '/posts';
      }
    } catch (err) {
      console.error("Error creating post:", err);
      setError(err.response?.data?.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Create New Post
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
              <Typography variant="h6" gutterBottom>
                Media Upload
              </Typography>
              <input
                accept="image/*,video/*"
                style={{ display: 'none' }}
                id="media-upload"
                multiple
                type="file"
                onChange={handleMediaChange}
              />
              <label htmlFor="media-upload">
                <Button
                  variant="contained"
                  component="span"
                  startIcon={<CloudUploadIcon />}
                  disabled={mediaFiles.length >= 3}
                >
                  Upload Media
                </Button>
              </label>
              {mediaError && (
                <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                  {mediaError}
                </Typography>
              )}
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                Maximum 3 media files allowed (photos and videos)
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Videos must be 30 seconds or less
              </Typography>
              <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {mediaPreviews.map((preview, index) => (
                  <Box key={index} sx={{ position: 'relative' }}>
                    {preview.type === 'image' ? (
                      <img
                        src={preview.url}
                        alt={`Preview ${index + 1}`}
                        style={{ width: 200, height: 200, objectFit: 'cover' }}
                      />
                    ) : (
                      <video
                        src={preview.url}
                        style={{ width: 200, height: 200, objectFit: 'cover' }}
                      />
                    )}
                    <IconButton
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                      }}
                      onClick={() => handleRemoveMedia(index)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                ))}
              </Box>
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
                disabled={loading}
                sx={{ mt: 2 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Create Post'}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default PostCreate; 