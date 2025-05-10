import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Avatar, 
  CircularProgress, 
  IconButton,
  Menu,
  MenuItem,
  Divider,
} from '@mui/material';
import { 
  MoreVert as MoreVertIcon,
  Send as SendIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Close as CloseIcon 
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';

const CommunityChat = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/community-chat');
      setMessages(res.data);
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    setSending(true);
    try {
      await axios.post('/api/community-chat', null, { params: { message } });
      setMessage('');
      fetchMessages();
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setSending(false);
    }
  };

  const handleMenuOpen = (event, msg) => {
    event.stopPropagation();
    setSelectedMessage(msg);
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedMessage(null);
  };

  const handleEdit = () => {
    setEditingId(selectedMessage.id);
    setEditValue(selectedMessage.message);
    handleMenuClose();
  };

  const handleEditSave = async (id) => {
    if (!editValue.trim()) return;
    try {
      await axios.put(`/api/community-chat/${id}`, { message: editValue });
      setEditingId(null);
      setEditValue('');
      fetchMessages();
    } catch (err) {
      console.error('Error updating message:', err);
    }
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditValue('');
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/community-chat/${selectedMessage.id}`);
      handleMenuClose();
      fetchMessages();
    } catch (err) {
      console.error('Error deleting message:', err);
    }
  };

  const renderMessage = (msg) => {
    const isCurrentUser = user && msg.userId === user.id;

    return (
      <Box 
        key={msg.id} 
        sx={{ 
          display: 'flex', 
          alignItems: 'flex-start', 
          mb: 3,
          flexDirection: isCurrentUser ? 'row-reverse' : 'row',
          '&:hover .message-actions': {
            opacity: 1,
          },
        }}
      >
        <Avatar 
          src={msg.userPicture} 
          sx={{ 
            width: 32,
            height: 32,
            mr: isCurrentUser ? 0 : 1.5,
            ml: isCurrentUser ? 1.5 : 0,
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            border: '2px solid #fff',
          }}
        >
          {!msg.userPicture && (msg.userName ? msg.userName[0] : '?')}
        </Avatar>
        <Box 
          sx={{ 
            maxWidth: '70%',
            minWidth: '100px',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              flexDirection: isCurrentUser ? 'row-reverse' : 'row',
              gap: 1,
              mb: 0.5,
            }}
          >
            <Typography 
              variant="subtitle2" 
              sx={{ 
                fontSize: '0.85rem',
                color: isCurrentUser ? '#1976d2' : 'text.primary', // blue for current user
                fontWeight: 600,
              }}
            >
              {msg.userName || 'Unknown'}
            </Typography>
            <Typography 
              variant="caption" 
              sx={{ 
                color: 'text.secondary',
                fontSize: '0.75rem',
              }}
            >
              {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
            </Typography>
          </Box>
          
          {editingId === msg.id ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
              <TextField
                value={editValue}
                onChange={e => setEditValue(e.target.value)}
                size="small"
                fullWidth
                autoFocus
                multiline
                maxRows={4}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: 'background.paper',
                  }
                }}
              />
              <IconButton onClick={() => handleEditSave(msg.id)} color="primary" size="small">
                <SaveIcon />
              </IconButton>
              <IconButton onClick={handleEditCancel} color="error" size="small">
                <CloseIcon />
              </IconButton>
            </Box>
          ) : (
            <Box
              sx={{
                position: 'relative',
                display: 'inline-block',
                maxWidth: '100%',
              }}
            >
              <Typography 
              variant="body1" 
              sx={{
                color: isCurrentUser ? '#111' : 'text.primary', // black for current user
                fontSize: '0.95rem',
                lineHeight: 1.5,
                wordBreak: 'break-word',
              }}
            >
              {msg.message}
              </Typography>
            </Box>
          )}
        </Box>
        {user && msg.userId === user.id && editingId !== msg.id && (
          <IconButton 
            size="small"
            onClick={(e) => handleMenuOpen(e, msg)}
            className="message-actions"
            sx={{ 
              ml: 1,
              opacity: 0,
              transition: 'opacity 0.2s ease',
              color: 'text.secondary',
              padding: 0.5,
              '&:hover': {
                color: 'primary.main',
                backgroundColor: 'transparent',
              },
            }}
          >
            <MoreVertIcon fontSize="small" />
          </IconButton>
        )}
      </Box>
    );
  };

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        p: 3, 
        borderRadius: 3, 
        maxWidth: 800, 
        mx: 'auto', 
        mt: 4,
        height: 'calc(100vh - 200px)',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#ffffff',
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        border: '2.5px solidrgb(167, 2, 125)', // blue border for distinction
        outline: '4px solid #e3eeff', // subtle tile effect
      }}
    >
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
        
      </Typography>
      <Typography 
        variant="body2" 
        color="text.secondary" 
        gutterBottom 
        sx={{ 
          fontWeight: 500,
          opacity: 0.8,
        }}
      >
Please be kind and respectful to others in this chat. Let’s keep it friendly!      </Typography>
      <Divider sx={{ my: 2 }} />
      
      <Box 
        sx={{ 
          flex: 1,
          overflowY: 'auto',
          mb: 2,
          px: 2,
          py: 1,
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(0,0,0,0.1)',
            borderRadius: '10px',
            '&:hover': {
              background: 'rgba(0,0,0,0.2)',
            },
          },
        }}
      >
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <CircularProgress size={24} sx={{ color: 'primary.light' }} />
          </Box>
        ) : messages.length === 0 ? (
          <Typography 
            color="text.secondary" 
            align="center"
            sx={{ 
              fontStyle: 'italic',
              opacity: 0.8,
            }}
          >
            No messages yet. Be the first to start the conversation!
          </Typography>
        ) : (
          messages.map(renderMessage)
        )}
        <div ref={messagesEndRef} />
      </Box>

      {user ? (
        <Box
          component="form"
          onSubmit={handleSend}
          sx={{
            display: 'flex',
            gap: 1,
            pt: 2,
            borderTop: '1px solid',
            borderColor: 'divider',
          }}
        >
          <TextField
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Type your message..."
            size="small"
            fullWidth
            disabled={sending}
            multiline
            maxRows={4}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                backgroundColor: 'rgba(0,0,0,0.02)',
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: 'rgba(0,0,0,0.03)',
                },
                '&.Mui-focused': {
                  backgroundColor: '#fff',
                  boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.1)',
                },
              },
            }}
          />
          <IconButton 
            type="submit" 
            disabled={sending || !message.trim()}
            sx={{
              borderRadius: 2,
              width: 40,
              height: 40,
              color: 'primary.main',
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: 'primary.main',
                color: '#fff',
              },
              '&.Mui-disabled': {
                backgroundColor: 'transparent',
                color: 'action.disabled',
              },
            }}
          >
            <SendIcon />
          </IconButton>
        </Box>
      ) : (
        <Typography 
          color="text.secondary" 
          align="center"
          sx={{ 
            fontStyle: 'italic',
            opacity: 0.8,
          }}
        >
          Login to participate in the chat.
        </Typography>
      )}

      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          elevation: 2,
          sx: {
            borderRadius: 2,
            minWidth: 120,
          }
        }}
      >
        <MenuItem 
          onClick={handleEdit}
          sx={{ 
            py: 1,
            '&:hover': {
              backgroundColor: 'action.hover',
            }
          }}
        >
          <EditIcon fontSize="small" sx={{ mr: 1.5, color: 'primary.main' }} />
          Edit
        </MenuItem>
        <MenuItem 
          onClick={handleDelete} 
          sx={{ 
            color: 'error.main',
            py: 1,
            '&:hover': {
              backgroundColor: 'error.lighter',
            }
          }}
        >
          <DeleteIcon fontSize="small" sx={{ mr: 1.5 }} />
          Delete
        </MenuItem>
      </Menu>
    </Paper>
  );
};

export default CommunityChat; 