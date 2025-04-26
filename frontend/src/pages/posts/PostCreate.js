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
  CircularProgress,
  Card,
  CardContent,
  Stepper,
  Step,
  StepLabel
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
    <Box sx={{ bgcolor: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ef 100%)', minHeight: '100vh', py: 6 }}>
      <Container maxWidth="sm">
        <Card elevation={4} sx={{ borderRadius: 4, p: 3, boxShadow: 6 }}>
          <CardContent>
            <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main', mb: 2, textAlign: 'center' }}>
              Create a New Recipe
            </Typography>
            <Divider sx={{ mb: 3 }} />
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    label="Recipe Title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    fullWidth
                    required
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Short Description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    fullWidth
                    required
                    multiline
                    minRows={2}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Full Content (optional)"
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    fullWidth
                    multiline
                    minRows={3}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mb: 1 }}>Media (Images/Videos)</Typography>
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<CloudUploadIcon />}
                    sx={{ mb: 1 }}
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
                  {mediaError && <Alert severity="error" sx={{ mb: 1 }}>{mediaError}</Alert>}
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 1 }}>
                    {mediaPreviews.map((media, idx) => (
                      <Box key={idx} sx={{ position: 'relative' }}>
                        {media.type === 'image' ? (
                          <img src={media.url} alt="preview" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8, border: '1px solid #eee' }} />
                        ) : (
                          <video src={media.url} style={{ width: 80, height: 80, borderRadius: 8, border: '1px solid #eee' }} controls />
                        )}
                        <IconButton size="small" sx={{ position: 'absolute', top: 0, right: 0, bgcolor: 'white' }} onClick={() => handleRemoveMedia(idx)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    ))}
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Cooking Time (minutes)"
                    name="cookingTime"
                    value={formData.cookingTime}
                    onChange={handleInputChange}
                    type="number"
                    fullWidth
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Servings"
                    name="servings"
                    value={formData.servings}
                    onChange={handleInputChange}
                    type="number"
                    fullWidth
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mb: 1 }}>Ingredients</Typography>
                  <List>
                    {formData.ingredients.map((ingredient, idx) => (
                      <ListItem key={idx} sx={{ pl: 0 }}>
                        <TextField
                          label={`Ingredient ${idx + 1}`}
                          value={ingredient}
                          onChange={e => handleArrayInputChange(idx, e.target.value, 'ingredients')}
                          sx={{ mr: 2 }}
                        />
                        <IconButton onClick={() => removeArrayItem(idx, 'ingredients')} disabled={formData.ingredients.length === 1}>
                          <DeleteIcon />
                        </IconButton>
                      </ListItem>
                    ))}
                  </List>
                  <Button startIcon={<AddIcon />} onClick={() => addArrayItem('ingredients')} sx={{ mt: 1 }}>
                    Add Ingredient
                  </Button>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mb: 1 }}>Amounts (optional)</Typography>
                  <List>
                    {formData.amounts.map((amount, idx) => (
                      <ListItem key={idx} sx={{ pl: 0 }}>
                        <TextField
                          label={`Amount ${idx + 1}`}
                          value={amount}
                          onChange={e => handleArrayInputChange(idx, e.target.value, 'amounts')}
                          sx={{ mr: 2 }}
                        />
                        <IconButton onClick={() => removeArrayItem(idx, 'amounts')} disabled={formData.amounts.length === 1}>
                          <DeleteIcon />
                        </IconButton>
                      </ListItem>
                    ))}
                  </List>
                  <Button startIcon={<AddIcon />} onClick={() => addArrayItem('amounts')} sx={{ mt: 1 }}>
                    Add Amount
                  </Button>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mb: 1 }}>Cooking Steps</Typography>
                  <List>
                    {formData.instructions.map((step, idx) => (
                      <ListItem key={idx} sx={{ pl: 0 }}>
                        <TextField
                          label={`Step ${idx + 1}`}
                          value={step}
                          onChange={e => handleArrayInputChange(idx, e.target.value, 'instructions')}
                          sx={{ mr: 2 }}
                        />
                        <IconButton onClick={() => removeArrayItem(idx, 'instructions')} disabled={formData.instructions.length === 1}>
                          <DeleteIcon />
                        </IconButton>
                      </ListItem>
                    ))}
                  </List>
                  <Button startIcon={<AddIcon />} onClick={() => addArrayItem('instructions')} sx={{ mt: 1 }}>
                    Add Cooking Step
                  </Button>
                </Grid>
                {error && (
                  <Grid item xs={12}>
                    <Alert severity="error">{error}</Alert>
                  </Grid>
                )}
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    fullWidth
                    size="large"
                    disabled={loading}
                    sx={{ mt: 2, fontWeight: 700, fontSize: 18, py: 1.5 }}
                    startIcon={loading ? <CircularProgress size={24} /> : null}
                  >
                    {loading ? 'Posting...' : 'Create Recipe'}
                  </Button>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default PostCreate; 