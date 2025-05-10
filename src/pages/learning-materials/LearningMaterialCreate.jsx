import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  IconButton
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PdfIcon from '@mui/icons-material/PictureAsPdf';
import DocIcon from '@mui/icons-material/Description';
import TxtIcon from '@mui/icons-material/TextSnippet';
import PptIcon from '@mui/icons-material/TextFields';

const LearningMaterialCreate = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    files: []
  });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [mediaPreviews, setMediaPreviews] = useState([]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      setError('Maximum 5 files allowed');
      return;
    }
    
    // Clear previous selections
    setSelectedFiles(files);
    
    // Create previews for PDF files
    const previews = files.map(file => {
      const fileType = file.type;
      const fileName = file.name;
      const fileSize = (file.size / 1024 / 1024).toFixed(2); // Convert to MB
      
      return {
        name: fileName,
        type: fileType,
        size: fileSize,
        isPdf: fileType === 'application/pdf'
      };
    });
    
    setMediaPreviews(previews);
  };

  const handleRemoveFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    setError(null);

    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    selectedFiles.forEach(file => {
      data.append('files', file);
    });

    try {
      await axios.post('/api/study-materials', data, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      navigate('/learning-materials');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload material');
      setUploading(false);
    }
  };

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
            Upload Learning Material
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
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Upload Files
            </Typography>
            <Button
              variant="outlined"
              component="label"
              startIcon={<CloudUploadIcon />}
              sx={{ mb: 2 }}
            >
              Select Files
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
                  Selected Files ({mediaPreviews.length})
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
                            ) : file.type.includes('word') ? (
                              <DocIcon sx={{ color: '#2196F3' }} />
                            ) : file.type.includes('text') ? (
                              <TxtIcon sx={{ color: '#4CAF50' }} />
                            ) : (
                              <PptIcon sx={{ color: '#FF9800' }} />
                            )}
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {file.name}
                            </Typography>
                          </Box>
                        }
                        secondary={`${file.size} MB`}
                      />
                      <ListItemSecondaryAction>
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
            disabled={uploading || selectedFiles.length === 0}
            sx={{ mt: 2 }}
          >
            {uploading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={20} color="inherit" />
                Uploading...
              </Box>
            ) : (
              'Upload Material'
            )}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default LearningMaterialCreate;