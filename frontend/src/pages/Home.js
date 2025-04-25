import React from 'react';
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
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { isAuthenticated } = useAuth();

  const features = [
    {
      title: 'Share Your Recipes',
      description: 'Create and share your favorite recipes with the community',
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    },
    {
      title: 'Learn from Experts',
      description: 'Follow top chefs and learn their cooking techniques',
      image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    },
    {
      title: 'Join the Community',
      description: 'Connect with fellow food enthusiasts and share your passion',
      image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    },
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          height: '80vh',
          display: 'flex',
          alignItems: 'center',
          color: 'white',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `linear-gradient(45deg, ${theme.palette.primary.main}33, ${theme.palette.secondary.main}33)`,
          },
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ maxWidth: 600, position: 'relative', zIndex: 1 }}>
            <Typography
              variant="h1"
              sx={{
                mb: 3,
                fontWeight: 700,
                fontSize: isMobile ? '2.5rem' : '3.5rem',
                textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
              }}
            >
              Welcome to CookSphere
            </Typography>
            <Typography 
              variant="h5" 
              sx={{ 
                mb: 4, 
                opacity: 0.9,
                textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
              }}
            >
              Join our community of food enthusiasts and share your culinary journey
            </Typography>
            {!isAuthenticated && (
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/register')}
                sx={{
                  backgroundColor: theme.palette.primary.main,
                  '&:hover': {
                    backgroundColor: theme.palette.primary.dark,
                  },
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                }}
              >
                Get Started
              </Button>
            )}
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography
          variant="h2"
          align="center"
          sx={{ 
            mb: 6, 
            fontWeight: 700,
            color: theme.palette.primary.main,
          }}
        >
          Why Choose CookSphere?
        </Typography>
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                  },
                }}
              >
                <CardMedia
                  component="img"
                  height="200"
                  image={feature.image}
                  alt={feature.title}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography
                    gutterBottom
                    variant="h5"
                    component="h2"
                    sx={{ 
                      fontWeight: 600,
                      color: theme.palette.primary.main,
                    }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography>{feature.description}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* CTA Section */}
      <Box
        sx={{
          background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          color: 'white',
          py: 8,
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={8}>
              <Typography variant="h3" sx={{ mb: 2, fontWeight: 700 }}>
                Ready to Start Your Culinary Journey?
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                Join thousands of food enthusiasts and share your passion for cooking
              </Typography>
            </Grid>
            <Grid
              item
              xs={12}
              md={4}
              sx={{ display: 'flex', justifyContent: 'center' }}
            >
              {!isAuthenticated && (
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate('/register')}
                  sx={{
                    backgroundColor: 'white',
                    color: theme.palette.primary.main,
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    },
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                  }}
                >
                  Sign Up Now
                </Button>
              )}
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default Home; 