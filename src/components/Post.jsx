import React from 'react';
import { Link } from 'react-router-dom';
import PostInteraction from './PostInteraction';
import { Card, CardHeader, CardContent, CardMedia, Typography, Avatar, Box } from '@mui/material';
import { formatDistanceToNow } from 'date-fns';

const Post = ({ post, onUpdate }) => {
  return (
    <Card 
      sx={{ 
        mb: 2,
        borderRadius: 2,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        '&:hover': {
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          transform: 'translateY(-2px)',
        },
        transition: 'all 0.2s ease-in-out'
      }}
    >
      <CardHeader
        avatar={
          <Link to={`/profile/${post.userId}`} style={{ textDecoration: 'none' }}>
            <Avatar 
              src={post.userPicture} 
              alt={post.userName}
              sx={{ 
                width: 40, 
                height: 40,
                border: '2px solid #fff',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            />
          </Link>
        }
        title={
          <Link to={`/profile/${post.userId}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {post.userName}
            </Typography>
          </Link>
        }
        subheader={
          <Typography variant="caption" color="text.secondary">
            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
          </Typography>
        }
      />
      
      <CardContent sx={{ pt: 1 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          {post.title}
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          {post.description}
        </Typography>
        {post.imageUrl && (
          <Box sx={{ mt: 2, mb: 2, borderRadius: 2, overflow: 'hidden' }}>
            <CardMedia
              component="img"
              image={post.imageUrl}
              alt={post.title}
              sx={{
                width: '100%',
                maxHeight: 400,
                objectFit: 'cover',
                transition: 'transform 0.3s ease-in-out',
                '&:hover': {
                  transform: 'scale(1.02)'
                }
              }}
            />
          </Box>
        )}
      </CardContent>

      <PostInteraction post={post} onUpdate={onUpdate} />
    </Card>
  );
};

export default Post; 