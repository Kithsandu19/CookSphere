import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import axios from 'axios';
import {
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Typography,
  Box,
  Divider,
  Button,
  Avatar,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import FavoriteIcon from '@mui/icons-material/Favorite';
import CommentIcon from '@mui/icons-material/Comment';
import ReplyIcon from '@mui/icons-material/Reply';
import './NotificationList.css';

const NotificationList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user && user.id) {
      fetchNotifications();
      // Set up polling for new notifications
      const interval = setInterval(fetchNotifications, 30000); // Poll every 30 seconds
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
      setUnreadCount(response.data.filter(n => !n.read).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = async (notification) => {
    try {
      // Mark as read
      await axios.put(`/api/notifications/${notification.id}/read`, null, {
        withCredentials: true,
        headers: {
          'Authorization': `Bearer ${user.id}`
        }
      });

      // Close the notification menu first
      handleClose();

      // Navigate based on notification type
      if (notification.type === 'LIKE') {
        navigate(`/community?postId=${notification.relatedPostId}&type=like`);
      } else if (notification.type === 'COMMENT') {
        navigate(`/community?postId=${notification.relatedPostId}&type=comment`);
      } else if (notification.type === 'REPLY') {
        navigate(`/community?postId=${notification.relatedPostId}&type=reply&commentId=${notification.relatedCommentId}`);
      }

      // Fetch notifications after a short delay to ensure navigation is complete
      setTimeout(fetchNotifications, 500);
    } catch (error) {
      console.error('Error handling notification click:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.put('/api/notifications/read-all', null, {
        withCredentials: true,
        headers: {
          'Authorization': `Bearer ${user.id}`
        }
      });
      fetchNotifications();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'LIKE':
        return <FavoriteIcon color="error" />;
      case 'COMMENT':
        return <CommentIcon color="primary" />;
      case 'REPLY':
        return <ReplyIcon color="secondary" />;
      default:
        return <NotificationsIcon />;
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

  if (!user || !user.id) {
    return null;
  }

  return (
    <div className="notification-container">
      <IconButton
        color="inherit"
        onClick={handleClick}
        aria-label="show notifications"
        sx={{ color: 'white' }}
      >
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          style: {
            maxHeight: 400,
            width: 320,
          },
        }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Notifications</Typography>
          {unreadCount > 0 && (
            <Button size="small" onClick={markAllAsRead}>
              Mark all as read
            </Button>
          )}
        </Box>
        <Divider />
        {notifications.length === 0 ? (
          <MenuItem>
            <Typography variant="body2" color="text.secondary">
              No notifications
            </Typography>
          </MenuItem>
        ) : (
          notifications.map((notification) => (
            <MenuItem
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              sx={{
                backgroundColor: notification.read ? 'inherit' : 'action.hover',
                '&:hover': {
                  backgroundColor: 'action.selected',
                },
                py: 1.5,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <Box sx={{ mr: 2 }}>
                  {getNotificationIcon(notification.type)}
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" component="div">
                    {getNotificationMessage(notification)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                  </Typography>
                </Box>
              </Box>
            </MenuItem>
          ))
        )}
      </Menu>
    </div>
  );
};

export default NotificationList; 