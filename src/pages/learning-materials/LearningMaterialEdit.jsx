import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PdfIcon from '@mui/icons-material/PictureAsPdf';
import DocIcon from '@mui/icons-material/Description';
import TxtIcon from '@mui/icons-material/TextSnippet';
import PptIcon from '@mui/icons-material/TextFields';

const LearningMaterialEdit = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    existingFiles: []
  });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [mediaPreviews, setMediaPreviews] = useState([]);

  useEffect(() => {
    const fetchMaterial = async () => {
      try {
        const response = await axios.get(`/api/study-materials/${id}`, {
          withCredentials: true
        });
        
        // Create previews for existing files
        const existingPreviews = response.data.fileUrls.map(url => {
          const fileName = url.split('/').pop();
          const fileExtension = fileName.split('.').pop().toLowerCase();
          return {
            name: fileName,
            url: url,
            isPdf: fileExtension === 'pdf',
            isExisting: true
          };
        });
        
        setFormData({
          title: response.data.title,
          description: response.data.description,
          existingFiles: response.data.fileUrls || []
        });
        setMediaPreviews(existingPreviews);
        setLoading(false);
      } catch (err) {
        setError('Failed to load material');
        setLoading(false);
      }
    };

    if (user) {
      fetchMaterial();
    }
  }, [id, user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      setError('Maximum 5 files allowed');
      return;
    }
    
    setSelectedFiles(files);
    
    // Create previews for new files
    const newPreviews = files.map(file => {
      const fileType = file.type;
      const fileName = file.name;
      const fileSize = (file.size / 1024 / 1024).toFixed(2);
      
      return {
        name: fileName,
        type: fileType,
        size: fileSize,
        isPdf: fileType === 'application/pdf',
        isNew: true
      };
    });
    
    // Combine existing and new previews
    setMediaPreviews(prev => [...prev.filter(p => p.isExisting), ...newPreviews]);
  };

  const handleRemoveFile = (index) => {
    const fileToRemove = mediaPreviews[index];
    
    if (fileToRemove.isExisting) {
      // Remove from existing files
      setFormData(prev => ({
        ...prev,
        existingFiles: prev.existingFiles.filter((_, i) => i !== index)
      }));
    } else {
      // Remove from new files
      setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    }
    
    // Remove from previews
    setMediaPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    setError(null);

    // Check if there are any files (either existing or new)
    const hasFiles = mediaPreviews.length > 0;
    if (!hasFiles) {
      setError('At least one file is required to update the material');
      setUploading(false);
      return;
    }

    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    
    // Add new files
    selectedFiles.forEach(file => {
      data.append('files', file);
    });
    
    // Add existing files
    mediaPreviews.forEach(preview => {
      if (preview.isExisting) {
        data.append('existingFiles', preview.url);
      }
    });

    try {
      const response = await axios.put(`/api/study-materials/${id}`, data, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      navigate('/learning-materials');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update material');
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/learning-materials')}
            sx={{ mr: 2 }}
          >
            Back
          </Button>
          <Typography variant="h4">
            Edit Learning Material
          </Typography>
        </Box>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <TextField
            label="Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            fullWidth
          />
          <TextField
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            multiline
            rows={4}
            required
            fullWidth
          />
          {formData.existingFiles.length > 0 && (
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Current Files
              </Typography>
              <List>
                {formData.existingFiles.map((url, index) => (
                  <ListItem key={index}>
                    <ListItemText 
                      primary={`File ${index + 1}`}
                      secondary={url.split('/').pop()}
                    />
                    <ListItemSecondaryAction>
                      <IconButton edge="end" onClick={() => handleRemoveFile(index)}>
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Files
            </Typography>
            <Button
              variant="outlined"
              component="label"
              startIcon={<CloudUploadIcon />}
              sx={{ mb: 2 }}
            >
              Add New Files
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                hidden
                accept=".pdf,.doc,.docx,.txt,.ppt,.pptx"
              />
            </Button>
            <Typography variant="caption" display="block" color="text.secondary" sx={{ mb: 2 }}>
              Maximum 5 files allowed (PDF, DOC, DOCX, TXT, PPT, PPTX)
            </Typography>
            
            {mediaPreviews.length > 0 && (
              <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Files ({mediaPreviews.length})
                </Typography>
                <List>
                  {mediaPreviews.map((file, index) => (
                    <ListItem
                      key={index}
                      sx={{
                        borderRadius: 1,
                        mb: 1,
                        '&:hover': {
                          bgcolor: 'rgba(0,0,0,0.02)',
                        },
                      }}
                    >
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {file.isPdf ? (
                              <PdfIcon sx={{ color: '#FF5252' }} />
                            ) : file.type?.includes('word') ? (
                              <DocIcon sx={{ color: '#2196F3' }} />
                            ) : file.type?.includes('text') ? (
                              <TxtIcon sx={{ color: '#4CAF50' }} />
                            ) : (
                              <PptIcon sx={{ color: '#FF9800' }} />
                            )}
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {file.name}
                            </Typography>
                            {file.isExisting && (
                              <Chip 
                                label="Existing" 
                                size="small" 
                                sx={{ 
                                  bgcolor: 'primary.lighter',
                                  color: 'primary.main',
                                  fontWeight: 500,
                                }} 
                              />
                            )}
                          </Box>
                        }
                        secondary={file.isExisting ? 'Uploaded file' : `${file.size} MB`}
                      />
                      <ListItemSecondaryAction>
                        {file.isExisting && file.isPdf && (
                          <Button
                            size="small"
                            startIcon={<PdfIcon />}
                            onClick={() => window.open(file.url, '_blank')}
                            sx={{
                              mr: 1,
                              color: 'primary.main',
                              '&:hover': {
                                bgcolor: 'primary.lighter',
                              }
                            }}
                          >
                            View
                          </Button>
                        )}
                        <IconButton 
                          edge="end" 
                          onClick={() => handleRemoveFile(index)}
                          sx={{ 
                            color: 'error.main',
                            '&:hover': {
                              bgcolor: 'error.lighter',
                            }
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              </Paper>
            )}
          </Box>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={uploading || mediaPreviews.length === 0}
            sx={{ mt: 2 }}
          >
            {uploading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={20} color="inherit" />
                Updating...
              </Box>
            ) : (
              'Update Material'
            )}
          </Button>
          {mediaPreviews.length === 0 && (
            <Typography 
              variant="caption" 
              color="error" 
              sx={{ mt: 1, display: 'block', textAlign: 'center' }}
            >
              At least one file is required to update the material
            </Typography>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default LearningMaterialEdit;