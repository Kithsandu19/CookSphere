import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import CommunityChat from '../components/CommunityChat';

const CommunityChatPage = () => (
  <Container maxWidth="sm" sx={{ mt: 6 }}>
    <Box sx={{ textAlign: 'center', mb: 3 }}>
      <Typography variant="h4" gutterBottom>Community Chat</Typography>
      <Typography variant="body1" color="text.secondary">
        Chat with other members of the community in real time!
      </Typography>
    </Box>
    <CommunityChat />
  </Container>
);

export default CommunityChatPage; 