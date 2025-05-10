import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  IconButton,
  Typography,
  Button
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import CloseIcon from '@mui/icons-material/Close';

const FollowList = ({ 
  open, 
  onClose, 
  users, 
  title, 
  onFollow, 
  onUnfollow, 
  currentUserId,
  followingIds 
}) => {
  const navigate = useNavigate();

  const handleUserClick = (userId) => {
    navigate(`/users/${userId}`);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          {title}
        </Typography>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {users.length === 0 ? (
          <Typography color="text.secondary" align="center" sx={{ py: 3 }}>
            No {title.toLowerCase()} yet
          </Typography>
        ) : (
          <List>
            {users.map((user) => (
              <ListItem
                key={user.id}
                secondaryAction={
                  user.id !== currentUserId && (
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={followingIds.includes(user.id) ? <PersonRemoveIcon /> : <PersonAddIcon />}
                      onClick={() => followingIds.includes(user.id) ? onUnfollow(user.id) : onFollow(user.id)}
                    >
                      {followingIds.includes(user.id) ? 'Unfollow' : 'Follow'}
                    </Button>
                  )
                }
              >
                <ListItemAvatar>
                  <Avatar
                    src={user.picture}
                    alt={user.name}
                    sx={{ cursor: 'pointer' }}
                    onClick={() => handleUserClick(user.id)}
                  />
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography
                      variant="subtitle1"
                      sx={{ cursor: 'pointer' }}
                      onClick={() => handleUserClick(user.id)}
                    >
                      {user.name}
                    </Typography>
                  }
                  secondary={user.bio}
                />
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default FollowList; 