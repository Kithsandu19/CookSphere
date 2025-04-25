import React from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  Divider,
  Link,
  useTheme,
} from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import { useAuth } from '../contexts/AuthContext';

const Register = () => {
  const theme = useTheme();
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleGoogleSignup = () => {
    login();
    // After successful registration, user will be redirected to dashboard
    navigate('/dashboard');
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            width: '100%',
            borderRadius: 2,
            backgroundColor: 'white',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          }}
        >
          <Typography
            component="h1"
            variant="h4"
            align="center"
            sx={{
              mb: 2,
              fontWeight: 700,
              color: theme.palette.primary.main,
            }}
          >
            Join CookSkills
          </Typography>

          <Typography
            variant="body1"
            color="text.secondary"
            align="center"
            sx={{ mb: 4 }}
          >
            Start your culinary journey and connect with food enthusiasts
          </Typography>

          <Button
            variant="contained"
            fullWidth
            startIcon={<GoogleIcon />}
            onClick={handleGoogleSignup}
            sx={{
              py: 1.5,
              backgroundColor: theme.palette.primary.main,
              '&:hover': {
                backgroundColor: theme.palette.primary.dark,
              },
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            }}
          >
            Sign up with Google
          </Button>

          <Divider sx={{ my: 3 }}>OR</Divider>

          <Typography variant="body2" color="text.secondary" align="center">
            Already have an account?{' '}
            <Link
              component={RouterLink}
              to="/login"
              sx={{
                color: theme.palette.primary.main,
                textDecoration: 'none',
                '&:hover': {
                  textDecoration: 'underline',
                },
              }}
            >
              Sign in
            </Link>
          </Typography>

          <Typography
            variant="caption"
            color="text.secondary"
            align="center"
            sx={{ mt: 3, display: 'block' }}
          >
            By signing up, you agree to our{' '}
            <Link
              href="#"
              sx={{
                color: theme.palette.primary.main,
                textDecoration: 'none',
                '&:hover': {
                  textDecoration: 'underline',
                },
              }}
            >
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link
              href="#"
              sx={{
                color: theme.palette.primary.main,
                textDecoration: 'none',
                '&:hover': {
                  textDecoration: 'underline',
                },
              }}
            >
              Privacy Policy
            </Link>
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default Register; 