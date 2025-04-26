import React, { useState, useEffect, useRef } from 'react';
import { Box, Paper, Typography, TextField, Button, Avatar, CircularProgress, IconButton } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Save as SaveIcon, Close as CloseIcon } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const CommunityChat = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchMessages();
    // Optionally, poll for new messages every 10 seconds
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
      // handle error
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
      // handle error
    } finally {
      setSending(false);
    }
  };

  const handleEdit = (msg) => {
    setEditingId(msg.id);
    setEditValue(msg.message);
  };

  const handleEditSave = async (id) => {
    if (!editValue.trim()) return;
    try {
      await axios.put(`/api/community-chat/${id}`, { message: editValue });
      setEditingId(null);
      setEditValue('');
      fetchMessages();
    } catch (err) {
      // handle error
    }
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditValue('');
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/community-chat/${id}`);
      fetchMessages();
    } catch (err) {
      // handle error
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 2, borderRadius: 2, maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Typography variant="h6" gutterBottom>Community Chat</Typography>
      <Box sx={{ maxHeight: 350, overflowY: 'auto', mb: 2, p: 1, bgcolor: '#f9f9f9', borderRadius: 1 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}><CircularProgress /></Box>
        ) : (
          messages.length === 0 ? (
            <Typography color="text.secondary">No messages yet.</Typography>
          ) : (
            messages.map(msg => (
              <Box key={msg.id} sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                <Avatar src={msg.userPicture} sx={{ mr: 1 }}>
                  {!msg.userPicture && (msg.userName ? msg.userName[0] : '?')}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2">{msg.userName || 'Unknown'}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: 12 }}>
                    {new Date(msg.createdAt).toLocaleString()}
                  </Typography>
                  {editingId === msg.id ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                      <TextField
                        value={editValue}
                        onChange={e => setEditValue(e.target.value)}
                        size="small"
                        fullWidth
                        autoFocus
                      />
                      <IconButton onClick={() => handleEditSave(msg.id)} color="primary" size="small"><SaveIcon /></IconButton>
                      <IconButton onClick={handleEditCancel} color="error" size="small"><CloseIcon /></IconButton>
                    </Box>
                  ) : (
                    <Typography variant="body1" sx={{ mt: 0.5 }}>{msg.message}</Typography>
                  )}
                </Box>
                {user && msg.userId === user.id && editingId !== msg.id && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', ml: 1 }}>
                    <IconButton onClick={() => handleEdit(msg)} size="small"><EditIcon fontSize="small" /></IconButton>
                    <IconButton onClick={() => handleDelete(msg.id)} size="small" color="error"><DeleteIcon fontSize="small" /></IconButton>
                  </Box>
                )}
              </Box>
            ))
          )
        )}
        <div ref={messagesEndRef} />
      </Box>
      {user ? (
        <form onSubmit={handleSend} style={{ display: 'flex', gap: 8 }}>
          <TextField
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Type your message..."
            size="small"
            fullWidth
            disabled={sending}
          />
          <Button type="submit" variant="contained" disabled={sending || !message.trim()}>
            Send
          </Button>
        </form>
      ) : (
        <Typography color="text.secondary">Login to participate in the chat.</Typography>
      )}
    </Paper>
  );
};

export default CommunityChat; 