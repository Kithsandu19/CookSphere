import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Box, Container, useTheme } from '@mui/material';
import Navbar from './Navbar';
import Footer from './Footer';
import { useAuth } from '../contexts/AuthContext';

const Layout = () => {
  const { isAuthenticated } = useAuth();
  const theme = useTheme();

  // Protected routes that require authentication
  const protectedRoutes = ['/dashboard', '/profile', '/community', '/posts', '/learning-plans'];
  const currentPath = window.location.pathname;

  if (!isAuthenticated && protectedRoutes.some(route => currentPath.startsWith(route))) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: theme.palette.background.default,
      }}
    >
      <Navbar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          pt: { xs: 9, sm: 10 }, // Increased padding-top to account for fixed navbar
          pb: { xs: 4, sm: 6 },
          px: { xs: 2, sm: 3 },
          backgroundColor: theme.palette.background.default,
        }}
      >
        <Container 
          maxWidth="lg"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
          }}
        >
          <Outlet />
        </Container>
      </Box>
      <Footer />
    </Box>
  );
};

export default Layout; 