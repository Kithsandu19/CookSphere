import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box
} from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

const Error = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const error = location.state?.error || {
    status: '404',
    message: 'Page not found'
  };

  return (
    <Container maxWidth="sm">
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
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <ErrorOutlineIcon sx={{ fontSize: 60, color: 'error.main', mb: 2 }} />
          <Typography component="h1" variant="h4" gutterBottom>
            Oops! Something went wrong
          </Typography>
          <Typography variant="h6" color="error" gutterBottom>
            Error {error.status}
          </Typography>
          <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 3 }}>
            {error.message}
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/')}
            sx={{ mt: 2 }}
          >
            Go to Home
          </Button>
        </Paper>
      </Box>
    </Container>
  );
};

export default Error; 