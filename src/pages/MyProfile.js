import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Avatar,
  Divider,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  Chip,
  CircularProgress,
  Alert,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  FormControlLabel,
  IconButton
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';

const MyProfile = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    bio: '',
    specialties: [],
    favoriteRecipes: [],
    isPrivate: false,
    profileImageUrl: ''
  });
  const [editDialog, setEditDialog] = useState(false);
  const [newSpecialty, setNewSpecialty] = useState('');
  const [newFavoriteRecipe, setNewFavoriteRecipe] = useState('');
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    fetchUserData();
    fetchUserPosts();
    fetchFollowers();
    fetchFollowing();
  }, [user, navigate]);

  const fetchUserData = async () => {
    try {
      const response = await axios.get('/api/users/profile', { withCredentials: true });
      setProfileData({
        name: response.data.name || user.name,
        bio: response.data.bio || '',
        specialties: response.data.specialties || [],
        favoriteRecipes: response.data.favoriteRecipes || [],
        isPrivate: response.data.isPrivate || false,
        profileImageUrl: response.data.profileImageUrl || ''
      });
      setProfileImagePreview(response.data.profileImageUrl || '');
    } catch (error) {
      console.error('Error fetching user data:', error);
      setError('Failed to load your profile data. Please try again later.');
    }
  };

  const fetchUserPosts = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/posts/my', { withCredentials: true });
      setPosts(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching user posts:', error);
      setError('Failed to load your posts. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchFollowers = async () => {
    try {
      const response = await axios.get('/api/users/followers');
      setFollowers(response.data);
    } catch (error) {
      console.error('Error fetching followers:', error);
    }
  };

  const fetchFollowing = async () => {
    try {
      const response = await axios.get('/api/users/following');
      setFollowing(response.data);
    } catch (error) {
      console.error('Error fetching following:', error);
    }
  };

  const handleEditPost = (postId) => {
    navigate(`/posts/${postId}/edit`);
  };

  const handleViewPost = (postId) => {
    navigate(`/posts/${postId}`);
  };

  const handleEditProfile = () => {
    setEditDialog(true);
  };

  const handleSaveProfile = async () => {
    try {
      await axios.put('/api/users/profile', { ...profileData, id: user.id }, { withCredentials: true });
      setEditDialog(false);
      fetchUserData();
      setUser(prev => ({
        ...prev,
        name: profileData.name,
        profileImageUrl: profileData.profileImageUrl
      }));
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile. Please try again later.');
    }
  };

  const handleAddSpecialty = () => {
    if (newSpecialty && !profileData.specialties.includes(newSpecialty)) {
      setProfileData(prev => ({
        ...prev,
        specialties: [...prev.specialties, newSpecialty]
      }));
      setNewSpecialty('');
    }
  };

  const handleAddFavoriteRecipe = () => {
    if (newFavoriteRecipe && !profileData.favoriteRecipes.includes(newFavoriteRecipe)) {
      setProfileData(prev => ({
        ...prev,
        favoriteRecipes: [...prev.favoriteRecipes, newFavoriteRecipe]
      }));
      setNewFavoriteRecipe('');
    }
  };

  const handleRemoveSpecialty = (specialty) => {
    setProfileData(prev => ({
      ...prev,
      specialties: prev.specialties.filter(s => s !== specialty)
    }));
  };

  const handleRemoveFavoriteRecipe = (recipe) => {
    setProfileData(prev => ({
      ...prev,
      favoriteRecipes: prev.favoriteRecipes.filter(r => r !== recipe)
    }));
  };

  const handlePrivacyChange = (event) => {
    setProfileData(prev => ({
      ...prev,
      isPrivate: event.target.checked
    }));
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
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
      <Grid container spacing={4}>
        {/* Profile Section */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
            <Avatar
              src={profileData.profileImageUrl || user?.picture}
              alt={profileData.name || user?.name}
              sx={{ width: 120, height: 120, mx: 'auto', mb: 2 }}
            />
            <Typography variant="h5" gutterBottom>
              {profileData.name}
            </Typography>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              {user?.email}
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              {profileData.bio}
            </Typography>
            <Button
              startIcon={<EditIcon />}
              variant="outlined"
              onClick={handleEditProfile}
              sx={{ mb: 2 }}
            >
              Edit Profile
            </Button>
            <Divider sx={{ my: 2 }} />
            <Grid container spacing={2} justifyContent="center">
              <Grid item>
                <Typography variant="subtitle2">Posts</Typography>
                <Typography variant="h6">{posts.length}</Typography>
              </Grid>
              <Grid item>
                <Typography variant="subtitle2">Followers</Typography>
                <Typography variant="h6">{followers.length}</Typography>
              </Grid>
              <Grid item>
                <Typography variant="subtitle2">Following</Typography>
                <Typography variant="h6">{following.length}</Typography>
              </Grid>
            </Grid>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>
              Specialties
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center', mb: 2 }}>
              {profileData.specialties.map((specialty, index) => (
                <Chip key={index} label={specialty} color="primary" variant="outlined" />
              ))}
            </Box>
            <Typography variant="h6" gutterBottom>
              Favorite Recipes
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
              {profileData.favoriteRecipes.map((recipe, index) => (
                <Chip key={index} label={recipe} color="secondary" variant="outlined" />
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Posts Section */}
        <Grid item xs={12} md={8}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4">
              My Posts
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate('/posts/create')}
            >
              Create New Post
            </Button>
          </Box>
          {posts.length === 0 ? (
            <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary">
                You haven't created any posts yet.
              </Typography>
              <Button
                variant="contained"
                color="primary"
                sx={{ mt: 2 }}
                onClick={() => navigate('/posts/create')}
              >
                Create Your First Post
              </Button>
            </Paper>
          ) : (
            <Grid container spacing={3}>
              {posts.map((post) => (
                <Grid item xs={12} key={post.id}>
                  <Card>
                    {post.mediaUrls && post.mediaUrls.length > 0 && (
                      <CardMedia
                        component="img"
                        height="200"
                        image={Array.isArray(post.mediaUrls) ? post.mediaUrls[0] : post.mediaUrls}
                        alt={post.title}
                        sx={{ 
                          objectFit: 'cover',
                          backgroundColor: '#f5f5f5',
                          maxHeight: '200px',
                          width: '100%'
                        }}
                        onError={(e) => {
                          console.error('Error loading image:', post.mediaUrls[0]);
                          e.target.src = '/placeholder-image.jpg';
                        }}
                      />
                    )}
                    <CardContent>
                      <Typography variant="h5" component="div" gutterBottom>
                        {post.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {post.description}
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                        {post.ingredients && post.ingredients.map((ingredient, index) => (
                          <Chip key={index} label={ingredient} size="small" />
                        ))}
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        Posted on {new Date(post.createdAt).toLocaleDateString()}
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button size="small" onClick={() => handleViewPost(post.id)}>
                        View
                      </Button>
                      <Button size="small" onClick={() => handleEditPost(post.id)}>
                        Edit
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Grid>
      </Grid>

      {/* Edit Profile Dialog */}
      <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent
          sx={{
            background: '#fff',
            boxShadow: '0 4px 32px rgba(0,0,0,0.15)',
            borderRadius: 3,
            p: 0,
            minWidth: 360,
            maxWidth: 480,
            mx: 'auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Box sx={{ width: '100%', mt: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3 }}>
            <Avatar
              src={profileImagePreview || profileData.profileImageUrl || user?.picture}
              alt={profileData.name || user?.name}
              sx={{ width: 100, height: 100, mb: 2 }}
            />
            <Button
              variant="outlined"
              component="label"
              disabled={uploadingImage}
              sx={{ mb: 2 }}
            >
              {uploadingImage ? 'Uploading...' : 'Change Profile Image'}
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={async (e) => {
                  const file = e.target.files[0];
                  if (!file) return;
                  setUploadingImage(true);
                  const formData = new FormData();
                  formData.append('image', file);
                  try {
                    const res = await axios.post('/api/users/profile/image', formData, {
                      withCredentials: true,
                      headers: { 'Content-Type': 'multipart/form-data' }
                    });
                    setProfileData(prev => ({ ...prev, profileImageUrl: res.data.profileImageUrl }));
                    setProfileImagePreview(res.data.profileImageUrl);
                    setUser(prev => ({ ...prev, profileImageUrl: res.data.profileImageUrl }));
                  } catch (err) {
                    setError('Failed to upload image.');
                  } finally {
                    setUploadingImage(false);
                  }
                }}
              />
            </Button>
            <TextField
              fullWidth
              label="Name"
              value={profileData.name}
              disabled
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Bio"
              multiline
              rows={3}
              value={profileData.bio}
              onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
              sx={{ mb: 2 }}
            />
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Specialties
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                <TextField
                  fullWidth
                  size="small"
                  value={newSpecialty}
                  onChange={(e) => setNewSpecialty(e.target.value)}
                  placeholder="Add a specialty"
                />
                <Button variant="outlined" onClick={handleAddSpecialty}>
                  Add
                </Button>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {profileData.specialties.map((specialty, index) => (
                  <Chip
                    key={index}
                    label={specialty}
                    onDelete={() => handleRemoveSpecialty(specialty)}
                  />
                ))}
              </Box>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Favorite Recipes
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                <TextField
                  fullWidth
                  size="small"
                  value={newFavoriteRecipe}
                  onChange={(e) => setNewFavoriteRecipe(e.target.value)}
                  placeholder="Add a favorite recipe"
                />
                <Button variant="outlined" onClick={handleAddFavoriteRecipe}>
                  Add
                </Button>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {profileData.favoriteRecipes.map((recipe, index) => (
                  <Chip
                    key={index}
                    label={recipe}
                    onDelete={() => handleRemoveFavoriteRecipe(recipe)}
                  />
                ))}
              </Box>
            </Box>
            <FormControlLabel
              control={
                <Switch
                  checked={profileData.isPrivate}
                  onChange={handlePrivacyChange}
                />
              }
              label="Private Profile"
            />
          </Box>
        </DialogContent>
        <Box sx={{
          width: '100%',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 2,
          mt: 2,
          px: 3
        }}>
          <Button onClick={() => setEditDialog(false)} startIcon={<CancelIcon />} color="error" variant="text">
            Cancel
          </Button>
          <Button onClick={handleSaveProfile} variant="contained" startIcon={<SaveIcon />} color="primary">
            Save
          </Button>
        </Box>
      </Dialog>
    </Container>
  );
};

export default MyProfile; 