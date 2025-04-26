import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import axios from 'axios';
import {
  FavoriteRounded as LikeIcon,
  ChatBubbleRounded as CommentIcon,
  ReplyRounded as ReplyIcon,
} from '@mui/icons-material';
import DeleteIcon from '@mui/icons-material/Delete';
import './NotificationsPage.css';

const NotificationsPage = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.id) {
      fetchNotifications();
      // Set up polling for new notifications
      const interval = setInterval(fetchNotifications, 15000); // Poll every 15 seconds
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

      // Mark all notifications as read when viewing the page
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
      // Navigate based on notification type
      if (notification.type === 'LIKE' || notification.type === 'COMMENT') {
        window.location.href = `/posts/${notification.relatedPostId}`;
      } else if (notification.type === 'REPLY') {
        window.location.href = `/posts/${notification.relatedPostId}#comment-${notification.relatedCommentId}`;
      }
    } catch (error) {
      console.error('Error handling notification click:', error);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      await axios.delete(`/api/notifications/${notificationId}`, {
        withCredentials: true,
        headers: {
          'Authorization': `Bearer ${user.id}`
        }
      });
      setNotifications(notifications.filter(n => n.id !== notificationId));
    } catch (error) {
      // Optionally show error
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'LIKE':
        return <LikeIcon className="notification-icon like" />;
      case 'COMMENT':
        return <CommentIcon className="notification-icon comment" />;
      case 'REPLY':
        return <ReplyIcon className="notification-icon reply" />;
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
      <div className="notifications-page loading">
        Loading notifications...
      </div>
    );
  }

  return (
    <div className="notifications-page">
      <h1>Notifications</h1>
      <div className="notifications-list">
        {notifications.length === 0 ? (
          <div className="no-notifications">
            <p>No notifications yet</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`notification-item ${!notification.read ? 'unread' : ''}`}
              onClick={() => handleNotificationClick(notification)}
              style={{ cursor: 'pointer' }}
            >
              <div className="notification-icon-wrapper">
                {getNotificationIcon(notification.type)}
              </div>
              <div className="notification-content">
                <p className="notification-message">
                  {getNotificationMessage(notification)}
                </p>
                <span className="notification-time">
                  {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                </span>
              </div>
              <button
                className="notification-delete-btn"
                onClick={e => { e.stopPropagation(); handleDeleteNotification(notification.id); }}
                title="Delete notification"
              >
                <DeleteIcon fontSize="small" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationsPage; 