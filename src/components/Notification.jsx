import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import '../styles/Notification.css';

const Notification = ({ notification, onMarkAsRead }) => {
  const getNotificationIcon = () => {
    switch (notification.type) {
      case 'LIKE':
        return 'favorite';
      case 'COMMENT':
        return 'comment';
      case 'FOLLOW':
        return 'person_add';
      default:
        return 'notifications';
    }
  };

  const getNotificationMessage = () => {
    switch (notification.type) {
      case 'LIKE':
        return `${notification.senderName} liked your post`;
      case 'COMMENT':
        return `${notification.senderName} commented on your post`;
      case 'FOLLOW':
        return `${notification.senderName} started following you`;
      default:
        return notification.message;
    }
  };

  return (
    <div 
      className={`notification ${!notification.read ? 'unread' : ''}`}
      onClick={() => onMarkAsRead(notification.id)}
    >
      <div className="notification-icon">
        <span className="material-icons">{getNotificationIcon()}</span>
      </div>
      <div className="notification-content">
        <p className="notification-message">{getNotificationMessage()}</p>
        <span className="notification-time">
          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
        </span>
      </div>
      {!notification.read && <div className="notification-dot" />}
    </div>
  );
};

export default Notification; 