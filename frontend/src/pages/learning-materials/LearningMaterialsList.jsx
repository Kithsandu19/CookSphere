import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import {
  Container,
  Grid,
  Typography,
  Button,
  Box,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
  Divider,
  Menu,
  MenuItem,
  CircularProgress,
  Paper,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  PictureAsPdf as PdfIcon,
  Description as DocIcon,
  Article as TxtIcon,
  Slideshow as PptIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Download as DownloadIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';

const LearningMaterialsList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedMaterial, setSelectedMaterial] = useState(null);

  const fileTypeIcons = {
    pdf: <PdfIcon sx={{ color: '#FF5252' }} />,
    doc: <DocIcon sx={{ color: '#2196F3' }} />,
    txt: <TxtIcon sx={{ color: '#4CAF50' }} />,
    ppt: <PptIcon sx={{ color: '#FF9800' }} />,
  };

  const filters = [
    { value: 'all', label: 'All Materials' },
    { value: 'pdf', label: 'PDF Documents' },
    { value: 'doc', label: 'Word Documents' },
    { value: 'txt', label: 'Text Files' },
    { value: 'ppt', label: 'Presentations' },
  ];

  useEffect(() => {
    fetchMaterials();
  }, []);

    const fetchMaterials = async () => {
      try {
        const response = await axios.get('/api/study-materials', {
        withCredentials: true
        });
        setMaterials(response.data);
        setLoading(false);
      } catch (err) {
      console.error('Error fetching materials:', err);
        setLoading(false);
      }
    };

  const handleFilterClick = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = (filter) => {
    if (filter && filter !== selectedFilter) {
      setSelectedFilter(filter);
    }
    setFilterAnchorEl(null);
  };

  const handleMenuClick = (event, material) => {
    event.stopPropagation();
    setSelectedMaterial(material);
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const handleDelete = async (materialId) => {
    if (window.confirm('Are you sure you want to delete this material?')) {
      try {
        await axios.delete(`/api/study-materials/${materialId}`, {
          withCredentials: true
        });
        setMaterials(materials.filter(m => m.id !== materialId));
      } catch (err) {
        console.error('Error deleting material:', err);
      }
    }
    handleMenuClose();
  };

  const handleDownload = (url) => {
    // Convert relative URL to absolute backend URL
    const backendUrl = `http://localhost:8080${url}`;
    window.open(backendUrl, '_blank');
  };

  const handleView = (url) => {
    // Convert relative URL to absolute backend URL
    const backendUrl = `http://localhost:8080${url}`;
    window.open(backendUrl, '_blank');
  };

  const filteredMaterials = materials.filter(material => {
    const matchesSearch = material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         material.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || material.fileType === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const getFileIcon = (fileType) => {
    return fileTypeIcons[fileType] || <DocIcon sx={{ color: '#757575' }} />;
  };

  const renderFileList = (fileUrls, material) => {
    return (
      <Box sx={{ mt: 2 }}>
        {fileUrls.map((url, index) => {
          const fileName = url.split('/').pop();
          const fileExtension = fileName.split('.').pop().toLowerCase();

          return (
            <Box 
              key={index}
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 2, 
                mb: 1,
                p: 1,
                borderRadius: 1,
                '&:hover': {
                  bgcolor: 'rgba(0,0,0,0.02)',
                }
              }}
            >
              {getFileIcon(fileExtension)}
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {fileName}
                </Typography>
              </Box>
              <Button
                size="small"
                startIcon={<DownloadIcon />}
                onClick={() => handleDownload(url)}
                sx={{
                  color: 'success.main',
                  '&:hover': {
                    bgcolor: 'success.lighter',
                  }
                }}
              >
                Download
              </Button>
            </Box>
          );
        })}
      </Box>
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2} alignItems="center" justifyContent="space-between">
          <Grid item xs={12} md={6}>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 700, color: 'primary.main' }}>
              Learning Materials
            </Typography>
            <Typography variant="subtitle1" sx={{ mt: 1, color: 'text.secondary' }}>
              Access and share educational resources with the community
            </Typography>
          </Grid>
          <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/learning-materials/create')}
              sx={{
                px: 3,
                py: 1,
                borderRadius: 2,
                backgroundColor: 'primary.main',
                '&:hover': { backgroundColor: 'primary.dark' },
              }}
            >
              Upload Material
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Search and Filter Section */}
      <Paper sx={{ p: 2, mb: 4, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search materials..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
              sx={{ backgroundColor: 'background.paper' }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<FilterIcon />}
              onClick={handleFilterClick}
              sx={{ height: '56px' }}
            >
              {filters.find(f => f.value === selectedFilter)?.label || 'All Materials'}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Materials Grid */}
      <Grid container spacing={3}>
        {filteredMaterials.map((material) => (
          <Grid item xs={12} sm={6} md={4} key={material.id}>
            <Card 
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 2,
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                },
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {getFileIcon(material.fileType)}
                    <Chip 
                      label={material.fileType?.toUpperCase() || 'DOC'} 
                      size="small"
                      sx={{ 
                        backgroundColor: 'rgba(0, 0, 0, 0.08)',
                        fontWeight: 500,
                      }}
                    />
                  </Box>
                  {material.userId === user?.id && (
                    <IconButton 
                      size="small" 
                      onClick={(e) => handleMenuClick(e, material)}
                      sx={{ 
                        color: 'text.secondary',
                        '&:hover': { bgcolor: 'action.hover' }
                      }}
                    >
                      <MoreVertIcon fontSize="small" />
                    </IconButton>
                  )}
                </Box>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, lineHeight: 1.3 }}>
                  {material.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {material.description}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Uploaded by {material.userName}
                  </Typography>
                </Box>
              </CardContent>
              <Divider />
              <CardContent sx={{ pt: 2 }}>
                {renderFileList(material.fileUrls, material)}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Filter Menu */}
      <Menu
        anchorEl={filterAnchorEl}
        open={Boolean(filterAnchorEl)}
        onClose={() => handleFilterClose()}
        PaperProps={{
          sx: {
            backgroundColor: '#fff',
            borderRadius: 2,
            boxShadow: '0 4px 16px rgba(60,72,88,0.15)',
            minWidth: 200,
            p: 0,
            border: '1px solid #e0e7ef',
          }
        }}
        MenuListProps={{
          sx: {
            p: 0
          }
        }}
      >
        {filters.map((filter) => (
          <MenuItem 
            key={filter.value}
            onClick={() => handleFilterClose(filter.value)}
            selected={selectedFilter === filter.value}
            sx={{
              fontWeight: selectedFilter === filter.value ? 700 : 500,
              color: selectedFilter === filter.value ? 'primary.main' : 'text.primary',
              backgroundColor: selectedFilter === filter.value ? 'rgba(225,48,108,0.08)' : 'transparent',
              '&:hover': {
                backgroundColor: 'rgba(225,48,108,0.12)',
              },
              fontSize: 16,
              px: 2.5,
              py: 1.5,
              transition: 'background 0.2s',
            }}
          >
            {filter.label}
          </MenuItem>
        ))}
      </Menu>

      {/* Actions Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem 
          onClick={() => {
            navigate(`/learning-materials/${selectedMaterial?.id}/edit`);
            handleMenuClose();
          }}
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
            minWidth: '150px'
          }}
        >
          <EditIcon fontSize="small" sx={{ color: 'primary.main' }} />
          <Typography>Edit</Typography>
        </MenuItem>
        <MenuItem 
          onClick={() => handleDelete(selectedMaterial?.id)} 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
            color: 'error.main'
          }}
        >
          <DeleteIcon fontSize="small" />
          <Typography>Delete</Typography>
        </MenuItem>
      </Menu>
    </Container>
  );
};

export default LearningMaterialsList;