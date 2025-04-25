import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Avatar,
  Button,
  Divider,
  Card,
  CardContent,
  CardMedia,
  CircularProgress,
  Alert,
  Chip,
  IconButton
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import LockIcon from '@mui/icons-material/Lock';

const UserProfile = () => {
  const { userId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  
  useEffect(() => {
    fetchUserProfile();
    fetchUserPosts();
    checkFollowStatus();
  }, [userId]);

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get(`/api/users/${userId}/profile`);
      setProfile(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setError('Failed to load user profile. Please try again later.');
    }
  };

  const fetchUserPosts = async () => {
    try {
      const response = await axios.get(`/api/users/${userId}/posts`);
      setPosts(response.data);
    } catch (error) {
      console.error('Error fetching user posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkFollowStatus = async () => {
    try {
      const response = await axios.get(`/api/users/${userId}/follow/check`);
      setIsFollowing(response.data.following);
    } catch (error) {
      console.error('Error checking follow status:', error);
    }
  };

  const handleFollow = async () => {
    try {
      await axios.post(`/api/users/${userId}/follow`);
      setIsFollowing(true);
      fetchUserProfile(); // Refresh follower count
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  const handleUnfollow = async () => {
    try {
      await axios.delete(`/api/users/${userId}/follow`);
      setIsFollowing(false);
      fetchUserProfile(); // Refresh follower count
    } catch (error) {
      console.error('Error unfollowing user:', error);
    }
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

  if (!profile) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="info">User not found.</Alert>
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
              src={profile.picture}
              alt={profile.name}
              sx={{ width: 120, height: 120, mx: 'auto', mb: 2 }}
            />
            <Typography variant="h5" gutterBottom>
              {profile.name}
            </Typography>
            {profile.isPrivate && !profile.isFollowing && (
              <Chip
                icon={<LockIcon />}
                label="Private Profile"
                color="default"
                sx={{ mb: 2 }}
              />
            )}
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                {profile.bio || "No bio available"}
              </Typography>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Grid container spacing={2} justifyContent="center">
              <Grid item>
                <Typography variant="subtitle2">Posts</Typography>
                <Typography variant="h6">{profile.postCount}</Typography>
              </Grid>
              <Grid item>
                <Typography variant="subtitle2">Followers</Typography>
                <Typography variant="h6">{profile.followerCount}</Typography>
              </Grid>
              <Grid item>
                <Typography variant="subtitle2">Following</Typography>
                <Typography variant="h6">{profile.followingCount}</Typography>
              </Grid>
            </Grid>
            {user && user.id !== userId && (
              <Button
                variant="contained"
                color={isFollowing ? "error" : "primary"}
                startIcon={isFollowing ? <PersonRemoveIcon /> : <PersonAddIcon />}
                onClick={isFollowing ? handleUnfollow : handleFollow}
                sx={{ mt: 2 }}
              >
                {isFollowing ? "Unfollow" : "Follow"}
              </Button>
            )}
          </Paper>
        </Grid>

        {/* Posts Section */}
        <Grid item xs={12} md={8}>
          <Typography variant="h4" gutterBottom>
            Posts
          </Typography>
          {(!profile.isPrivate || profile.isFollowing) ? (
            posts.length === 0 ? (
              <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h6" color="text.secondary">
                  No posts yet.
                </Typography>
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
                          image={post.mediaUrls[0]}
                          alt={post.title}
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
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )
          ) : (
            <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
              <LockIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                This account is private
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Follow this account to see their posts
              </Typography>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default UserProfile; 