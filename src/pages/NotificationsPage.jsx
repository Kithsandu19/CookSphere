import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import axios from 'axios';
import {
  Container,
  Typography,
  Box,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  CircularProgress,
  Divider,
} from '@mui/material';
import {
  FavoriteRounded as LikeIcon,
  ChatBubbleRounded as CommentIcon,
  ReplyRounded as ReplyIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';

const NotificationsPage = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedNotification, setSelectedNotification] = useState(null);

  useEffect(() => {
    if (user && user.id) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 15000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get('/api/notifications', {
        withCredentials: true,
        headers: {
          'Authorization': `Bearer ${user.id}`
        }
      });
      setNotifications(response.data);
      setLoading(false);

      if (response.data.some(n => !n.read)) {
        await axios.put('/api/notifications/read-all', null, {
          withCredentials: true,
          headers: {
            'Authorization': `Bearer ${user.id}`
          }
        });
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setLoading(false);
    }
  };

  const handleNotificationClick = async (notification) => {
    try {
      if (notification.type === 'LIKE' || notification.type === 'COMMENT') {
        window.location.href = `/posts/${notification.relatedPostId}`;
      } else if (notification.type === 'REPLY') {
        window.location.href = `/posts/${notification.relatedPostId}#comment-${notification.relatedCommentId}`;
      }
    } catch (error) {
      console.error('Error handling notification click:', error);
    }
  };

  const handleMenuOpen = (event, notification) => {
    event.stopPropagation();
    setSelectedNotification(notification);
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedNotification(null);
  };

  const handleDeleteNotification = async () => {
    try {
      await axios.delete(`/api/notifications/${selectedNotification.id}`, {
        withCredentials: true,
        headers: {
          'Authorization': `Bearer ${user.id}`
        }
      });
      setNotifications(notifications.filter(n => n.id !== selectedNotification.id));
      handleMenuClose();
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'LIKE':
        return <Avatar sx={{ bgcolor: 'error.light' }}><LikeIcon /></Avatar>;
      case 'COMMENT':
        return <Avatar sx={{ bgcolor: 'primary.light' }}><CommentIcon /></Avatar>;
      case 'REPLY':
        return <Avatar sx={{ bgcolor: 'secondary.light' }}><ReplyIcon /></Avatar>;
      default:
        return null;
    }
  };

  const getNotificationMessage = (notification) => {
    if (!notification.senderName) {
      return 'Someone interacted with your post';
    }

    switch (notification.type) {
      case 'LIKE':
        return `${notification.senderName} liked your post`;
      case 'COMMENT':
        return `${notification.senderName} commented on your post`;
      case 'REPLY':
        return `${notification.senderName} replied to your comment`;
      default:
        return notification.message || 'New notification';
    }
  };

  if (loading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '60vh' 
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3 }}>
        Notifications
      </Typography>
      <Paper elevation={2} sx={{ borderRadius: 2 }}>
        <List sx={{ p: 0 }}>
          {notifications.length === 0 ? (
            <ListItem>
              <ListItemText
                primary={
                  <Typography color="text.secondary" align="center">
                    No notifications yet
                  </Typography>
                }
              />
            </ListItem>
          ) : (
            notifications.map((notification, index) => (
              <React.Fragment key={notification.id}>
                {index > 0 && <Divider />}
                <ListItem
                  onClick={() => handleNotificationClick(notification)}
                  sx={{
                    cursor: 'pointer',
                    py: 2,
                    backgroundColor: notification.read ? 'inherit' : 'action.hover',
                    '&:hover': {
                      backgroundColor: 'action.selected',
                    },
                    transition: 'background-color 0.2s',
                  }}
                >
                  <ListItemAvatar>
                    {getNotificationIcon(notification.type)}
                  </ListItemAvatar>
                  <ListItemText
                    primary={getNotificationMessage(notification)}
                    secondary={
                      <Typography variant="caption" color="text.secondary">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </Typography>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton 
                      edge="end" 
                      size="small"
                      onClick={(e) => handleMenuOpen(e, notification)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              </React.Fragment>
            ))
          )}
        </List>
      </Paper>

      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem 
          onClick={handleDeleteNotification}
          sx={{ color: 'error.main' }}
        >
          Delete
        </MenuItem>
      </Menu>
    </Container>
  );
};

export default NotificationsPage; 