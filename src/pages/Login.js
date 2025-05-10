import React, { useEffect } from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
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

const Login = () => {
  const theme = useTheme();
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get the redirect path from location state, or default to dashboard
  const from = location.state?.from?.pathname || '/dashboard';

  useEffect(() => {
    // If user is already authenticated, redirect to the intended page
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  const handleGoogleLogin = () => {
    login();
    // The actual navigation will happen in the useEffect when user state updates
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
            Welcome Back
          </Typography>

          <Typography
            variant="body1"
            color="text.secondary"
            align="center"
            sx={{ mb: 4 }}
          >
            Continue your culinary journey with CookSkills
          </Typography>

          <Button
            variant="contained"
            fullWidth
            startIcon={<GoogleIcon />}
            onClick={handleGoogleLogin}
            sx={{
              py: 1.5,
              backgroundColor: theme.palette.primary.main,
              '&:hover': {
                backgroundColor: theme.palette.primary.dark,
              },
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            }}
          >
            Sign in with Google
          </Button>

          <Divider sx={{ my: 3 }}>OR</Divider>

          <Typography variant="body2" color="text.secondary" align="center">
            Don't have an account?{' '}
            <Link
              component={RouterLink}
              to="/register"
              sx={{
                color: theme.palette.primary.main,
                textDecoration: 'none',
                '&:hover': {
                  textDecoration: 'underline',
                },
              }}
            >
              Sign up
            </Link>
          </Typography>

          <Typography
            variant="caption"
            color="text.secondary"
            align="center"
            sx={{ mt: 3, display: 'block' }}
          >
            By signing in, you agree to our{' '}
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

export default Login; 