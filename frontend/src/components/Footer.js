import React from 'react';
import { Box, Container, Typography, Link, Grid, IconButton } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { Instagram, Twitter, Facebook, YouTube } from '@mui/icons-material';

const Footer = () => {
  return (
    <Box
      component="footer"
      style={{
        padding: '32px 24px',
        marginTop: 'auto',
        background: 'linear-gradient(135deg, #D8B4FE 0%, #1E3A8A 100%)',
        color: '#F5F5F5',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} sm={4}>
            <Typography
              variant="h5"
              style={{ color: '#F5F5F5', fontWeight: 'bold', marginBottom: '16px' }}
            >
              CookSphere
            </Typography>
            <Typography
              variant="body2"
              style={{ color: '#EDE9FE' }}
            >
              Ignite your culinary passion with CookSphere. Explore vibrant recipes, connect with global food enthusiasts, and share your kitchen adventures.
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography
              variant="h5"
              style={{ color: '#F5F5F5', fontWeight: 'bold', marginBottom: '16px' }}
            >
              Explore
            </Typography>
            <Link
              component={RouterLink}
              to="/"
              style={{ color: '#EDE9FE', display: 'block', marginBottom: '8px', textDecoration: 'none' }}
              onMouseOver={(e) => (e.target.style.color = '#A5B4FC')}
              onMouseOut={(e) => (e.target.style.color = '#EDE9FE')}
            >
              Home
            </Link>
            <Link
              component={RouterLink}
              to="/recipes"
              style={{ color: '#EDE9FE', display: 'block', marginBottom: '8px', textDecoration: 'none' }}
              onMouseOver={(e) => (e.target.style.color = '#A5B4FC')}
              onMouseOut={(e) => (e.target.style.color = '#EDE9FE')}
            >
              Recipes
            </Link>
            <Link
              component={RouterLink}
              to="/community"
              style={{ color: '#EDE9FE', display: 'block', marginBottom: '8px', textDecoration: 'none' }}
              onMouseOver={(e) => (e.target.style.color = '#A5B4FC')}
              onMouseOut={(e) => (e.target.style.color = '#EDE9FE')}
            >
              Community
            </Link>
            <Link
              component={RouterLink}
              to="/events"
              style={{ color: '#EDE9FE', display: 'block', marginBottom: '8px', textDecoration: 'none' }}
              onMouseOver={(e) => (e.target.style.color = '#A5B4FC')}
              onMouseOut={(e) => (e.target.style.color = '#EDE9FE')}
            >
              Events
            </Link>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography
              variant="h5"
              style={{ color: '#F5F5F5', fontWeight: 'bold', marginBottom: '16px' }}
            >
              Connect With Us
            </Typography>
            <Typography
              variant="body2"
              style={{ color: '#EDE9FE', marginBottom: '8px' }}
            >
              Email: hello@cooksphere.app
            </Typography>
            <Typography
              variant="body2"
              style={{ color: '#EDE9FE', marginBottom: '16px' }}
            >
              Address: 123 Flavor Street, Culinary City, CA 90210
            </Typography>
            <Box>
              <IconButton
                href="https://instagram.com/cooksphere"
                target="_blank"
                style={{ color: '#F5F5F5' }}
                onMouseOver={(e) => (e.target.style.color = '#FBCFE8')}
                onMouseOut={(e) => (e.target.style.color = '#F5F5F5')}
              >
                <Instagram />
              </IconButton>
              <IconButton
                href="https://twitter.com/cooksphere"
                target="_blank"
                style={{ color: '#F5F5F5' }}
                onMouseOver={(e) => (e.target.style.color = '#FBCFE8')}
                onMouseOut={(e) => (e.target.style.color = '#F5F5F5')}
              >
                <Twitter />
              </IconButton>
              <IconButton
                href="https://facebook.com/cooksphere"
                target="_blank"
                style={{ color: '#F5F5F5' }}
                onMouseOver={(e) => (e.target.style.color = '#FBCFE8')}
                onMouseOut={(e) => (e.target.style.color = '#F5F5F5')}
              >
                <Facebook />
              </IconButton>
              <IconButton
                href="https://youtube.com/cooksphere"
                target="_blank"
                style={{ color: '#F5F5F5' }}
                onMouseOver={(e) => (e.target.style.color = '#FBCFE8')}
                onMouseOut={(e) => (e.target.style.color = '#F5F5F5')}
              >
                <YouTube />
              </IconButton>
            </Box>
          </Grid>
        </Grid>
        <Box style={{ marginTop: '40px' }}>
          <Typography
            variant="body2"
            align="center"
            style={{ color: '#EDE9FE' }}
          >
            © {new Date().getFullYear()} CookSphere. All rights reserved. |{' '}
            <Link
              component={RouterLink}
              to="/privacy"
              style={{ color: '#EDE9FE', textDecoration: 'none' }}
              onMouseOver={(e) => (e.target.style.color = '#A5B4FC')}
              onMouseOut={(e) => (e.target.style.color = '#EDE9FE')}
            >
              Privacy Policy
            </Link>{' '}
            |{' '}
            <Link
              component={RouterLink}
              to="/terms"
              style={{ color: '#EDE9FE', textDecoration: 'none' }}
              onMouseOver={(e) => (e.target.style.color = '#A5B4FC')}
              onMouseOut={(e) => (e.target.style.color = '#EDE9FE')}
            >
              Terms of Service
            </Link>
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;