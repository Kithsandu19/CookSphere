import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  useTheme,
  useMediaQuery,
  Avatar,
  Chip,
  IconButton,
  LinearProgress,
  Paper,
  Divider,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import GroupIcon from '@mui/icons-material/Group';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import LocalDiningIcon from '@mui/icons-material/LocalDining';
import PeopleIcon from '@mui/icons-material/People';
import StarIcon from '@mui/icons-material/Star';
import axios from 'axios';

const Dashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user } = useAuth();
  const [trendingRecipes, setTrendingRecipes] = useState([]);
  const [dailyChallenge, setDailyChallenge] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [cookingTips] = useState([
    { tip: "Always preheat your oven for consistent results", author: "Chef Maria" },
    { tip: "Sharp knives are safer than dull ones", author: "Chef John" },
    { tip: "Season as you go, not just at the end", author: "Chef Lisa" },
  ]);

  useEffect(() => {
    fetchTrendingRecipes();
    fetchDailyChallenge();
    fetchAchievements();
  }, []);

  const fetchTrendingRecipes = async () => {
    try {
      const response = await axios.get('/api/posts/trending');
      setTrendingRecipes(response.data.slice(0, 3));
    } catch (error) {
      console.error('Error fetching trending recipes:', error);
    }
  };

  const fetchDailyChallenge = async () => {
    // Simulated daily challenge data
    setDailyChallenge({
      title: "Today's Cooking Challenge",
      description: "Create a fusion dish combining two different cuisines!",
      participants: 158,
      deadline: "8 hours left"
    });
  };

  const fetchAchievements = async () => {
    // Simulated achievements data
    setAchievements([
      { title: 'Recipe Master', progress: 70, total: 100, description: 'Create 100 recipes' },
      { title: 'Community Star', progress: 45, total: 50, description: '50 recipe reviews' },
      { title: 'Trending Chef', progress: 8, total: 10, description: 'Get 10 recipes trending' }
    ]);
  };

  return (
    <Box sx={{ py: 4 }}>
      <Container maxWidth="xl">
        {/* Welcome Section with Time-based Greeting */}
        <Box sx={{ mb: 6, textAlign: 'center' }}>
          <Typography variant="h3" sx={{ 
            mb: 2, 
            fontWeight: 700, 
            background: 'linear-gradient(45deg, #C71585, #DB7093)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
          }}>
            {`Good ${new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}, ${user?.name?.split(' ')[0]}! 👋`}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            What delicious recipe will you create today?
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {/* Main Content Area */}
          <Grid item xs={12} md={8}>
            <Grid container spacing={3}>
              {/* Community Spotlight Section */}
              <Grid item xs={12}>
                <Card sx={{ 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  position: 'relative',
                  overflow: 'hidden',
                  mb: 4,
                }}>
                  <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <PeopleIcon sx={{ fontSize: 40, mr: 2 }} />
                      <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                        Join Our Vibrant Community!
                      </Typography>
                    </Box>
                    <Typography variant="h6" sx={{ mb: 2, opacity: 0.9 }}>
                      Connect with 5,000+ food enthusiasts, share recipes, and learn from the best!
                    </Typography>
                    <Button
                      variant="contained"
                      size="large"
                      onClick={() => navigate('/community')}
                      sx={{
                        bgcolor: '#FF1493',
                        color: 'white',
                        px: 4,
                        py: 1.5,
                        borderRadius: '30px',
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        textTransform: 'none',
                        boxShadow: '0 8px 16px rgba(255, 20, 147, 0.2)',
                        '&:hover': {
                          bgcolor: '#FF1493',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 12px 20px rgba(255, 20, 147, 0.3)',
                        },
                        transition: 'all 0.3s ease',
                        position: 'relative',
                        overflow: 'hidden',
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          background: 'linear-gradient(45deg, rgba(255,255,255,0.1), rgba(255,255,255,0))',
                          opacity: 0,
                          transition: 'opacity 0.3s ease',
                        },
                        '&:hover::after': {
                          opacity: 1,
                        },
                      }}
                      startIcon={<PeopleIcon sx={{ fontSize: 24 }} />}
                    >
                      Explore Community
                    </Button>
                  </CardContent>
                  <Box sx={{
                    position: 'absolute',
                    right: -20,
                    top: -20,
                    width: '200px',
                    height: '200px',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.1)',
                  }} />
                </Card>
              </Grid>

              {/* Quick Actions Grid */}
              <Grid item xs={12}>
                <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                  Quick Actions
                </Typography>
                <Grid container spacing={2}>
                  {[
                    { title: 'Share Recipe', icon: <RestaurantIcon />, path: '/posts/create', color: '#FF6B6B' },
                    { title: 'Browse Recipes', icon: <LocalDiningIcon />, path: '/community', color: '#4ECDC4' },
                    { title: 'Learning Hub', icon: <BookmarkIcon />, path: '/learning-materials', color: '#45B7D1' },
                    { title: 'My Favorites', icon: <StarIcon />, path: '/profile', color: '#96CEB4' },
                  ].map((action) => (
                    <Grid item xs={6} sm={3} key={action.title}>
                      <Card 
                        sx={{ 
                          cursor: 'pointer',
                          height: '100%',
                          '&:hover': { transform: 'translateY(-4px)' },
                          transition: 'transform 0.2s',
                        }}
                        onClick={() => navigate(action.path)}
                      >
                        <CardContent sx={{ textAlign: 'center' }}>
                          <Box sx={{ 
                            color: action.color,
                            mb: 1,
                          }}>
                            {action.icon}
                          </Box>
                          <Typography variant="subtitle2">
                            {action.title}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Grid>

              {/* Daily Challenge Card */}
              <Grid item xs={12} sm={6}>
                <Card sx={{ 
                  height: '100%',
                  background: 'linear-gradient(135deg, #FF69B4 0%, #FFB6C1 100%)',
                  color: 'white'
                }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box>
                        <WhatshotIcon sx={{ fontSize: 40, mb: 1 }} />
                        <Typography variant="h6" gutterBottom>Today's Challenge</Typography>
                        <Typography variant="body2" sx={{ mb: 2, opacity: 0.9 }}>
                          Create a fusion dish combining Asian and Mediterranean cuisines!
                        </Typography>
                        <Chip 
                          label="158 participants"
                          size="small"
                          sx={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                        />
                      </Box>
                      <Chip 
                        label="8 hours left"
                        size="small"
                        sx={{ backgroundColor: 'rgba(255,255,255,0.3)' }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Cooking Tip of the Day */}
              <Grid item xs={12} sm={6}>
                <Card sx={{ height: '100%', bgcolor: '#f8f9fa' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ color: theme.palette.primary.main }}>
                      Cooking Tip of the Day
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      {cookingTips.map((tip, index) => (
                        <Box key={index} sx={{ mb: 2 }}>
                          <Typography variant="body1" sx={{ mb: 1, fontStyle: 'italic' }}>
                            "{tip.tip}"
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            - {tip.author}
                          </Typography>
                          {index < cookingTips.length - 1 && <Divider sx={{ mt: 2 }} />}
                        </Box>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Trending Recipes Section */}
              <Grid item xs={12}>
                <Paper sx={{ p: 3, borderRadius: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <TrendingUpIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                    <Typography variant="h6">Trending Recipes</Typography>
                  </Box>
                  <Grid container spacing={2}>
                    {trendingRecipes.map((recipe, index) => (
                      <Grid item xs={12} sm={4} key={index}>
                        <Card 
                          sx={{ 
                            cursor: 'pointer',
                            '&:hover': { transform: 'translateY(-4px)' },
                            transition: 'transform 0.3s ease'
                          }}
                          onClick={() => navigate(`/posts/${recipe.id}`)}
                        >
                          <CardMedia
                            component="img"
                            height="140"
                            image={recipe.mediaUrls?.[0] || 'https://source.unsplash.com/random/?food'}
                            alt={recipe.title}
                          />
                          <CardContent>
                            <Typography variant="subtitle1" noWrap>{recipe.title}</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                              <Avatar
                                src={recipe.userPicture}
                                sx={{ width: 24, height: 24, mr: 1 }}
                              />
                              <Typography variant="caption" color="text.secondary">
                                {recipe.userName}
                              </Typography>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Paper>
              </Grid>
            </Grid>
          </Grid>

          {/* Right Sidebar */}
          <Grid item xs={12} md={4}>
            <Grid container spacing={3}>
              {/* Achievements */}
              <Grid item xs={12}>
                <Paper sx={{ p: 3, borderRadius: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <EmojiEventsIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                    <Typography variant="h6">Your Achievements</Typography>
                  </Box>
                  {achievements.map((achievement, index) => (
                    <Box key={index} sx={{ mb: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="subtitle2">{achievement.title}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {achievement.progress}/{achievement.total}
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={(achievement.progress / achievement.total) * 100}
                        sx={{ mb: 1, height: 6, borderRadius: 3 }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {achievement.description}
                      </Typography>
                    </Box>
                  ))}
                </Paper>
              </Grid>

              {/* Quick Stats */}
              <Grid item xs={12}>
                <Paper sx={{ p: 3, borderRadius: 2 }}>
                  <Typography variant="h6" gutterBottom>Your Cooking Journey</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center', p: 2 }}>
                        <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>28</Typography>
                        <Typography variant="body2" color="text.secondary">Recipes</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center', p: 2 }}>
                        <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>142</Typography>
                        <Typography variant="body2" color="text.secondary">Followers</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center', p: 2 }}>
                        <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>45</Typography>
                        <Typography variant="body2" color="text.secondary">Following</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center', p: 2 }}>
                        <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>89</Typography>
                        <Typography variant="body2" color="text.secondary">Likes</Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Dashboard; 