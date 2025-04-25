import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  LinearProgress,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Checkbox,
} from '@mui/material';
import {
  ArrowBack,
  Edit,
  CheckCircle,
  RadioButtonUnchecked,
  AccessTime,
  CalendarToday,
  School,
  Description,
  Delete,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const LearningPlanDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [updateData, setUpdateData] = useState({
    completedItems: {},
    subjectStatuses: {},
    milestoneCompletions: {},
  });
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editPlan, setEditPlan] = useState(null);

  useEffect(() => {
    fetchPlan();
  }, [id]);

  const fetchPlan = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/learning-plans/${id}`);
      setPlan(response.data);
      setError('');
    } catch (error) {
      console.error('Error fetching learning plan:', error);
      setError('Failed to load the learning plan. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProgress = async () => {
    try {
      const response = await axios.put(`/api/learning-plans/${id}/progress`, updateData);
      setPlan(response.data);
      setOpenDialog(false);
      setSelectedSubject(null);
      setUpdateData({
        completedItems: {},
        subjectStatuses: {},
        milestoneCompletions: {},
      });
      setError('');
    } catch (error) {
      console.error('Error updating progress:', error);
      setError('Failed to update progress. Please try again later.');
    }
  };

  const handleSubjectClick = (subject) => {
    setSelectedSubject(subject);
    setUpdateData({
      completedItems: { ...plan.completedItems },
      subjectStatuses: { ...plan.subjectStatuses },
      milestoneCompletions: { ...plan.milestoneCompletions },
    });
    setOpenDialog(true);
  };

  const handleStatusChange = (subjectId, status) => {
    setUpdateData(prev => ({
      ...prev,
      subjectStatuses: {
        ...prev.subjectStatuses,
        [subjectId]: status,
      },
    }));
  };

  const handleMilestoneToggle = (milestoneId) => {
    setUpdateData(prev => ({
      ...prev,
      milestoneCompletions: {
        ...prev.milestoneCompletions,
        [milestoneId]: !prev.milestoneCompletions[milestoneId],
      },
    }));
  };

  const calculateProgress = () => {
    if (!plan || !plan.subjects) return 0;
    const total = plan.subjects.length;
    const completed = Object.values(plan.completedItems || {}).filter(Boolean).length;
    return (completed / total) * 100;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'success';
      case 'IN_PROGRESS':
        return 'primary';
      default:
        return 'default';
    }
  };

  const handleEditPlan = async () => {
    try {
      if (!editPlan.title || !editPlan.startDate || !editPlan.dueDate) {
        setError('Please fill in all required fields');
        return;
      }

      const response = await axios.put(`/api/learning-plans/${id}`, editPlan);
      setPlan(response.data);
      setOpenEditDialog(false);
      setError('');
    } catch (error) {
      console.error('Error updating learning plan:', error);
      setError('Failed to update learning plan. Please try again later.');
    }
  };

  const handleDeletePlan = async () => {
    if (window.confirm('Are you sure you want to delete this learning plan?')) {
      try {
        await axios.delete(`/api/learning-plans/${id}`);
        navigate('/learning-plans');
      } catch (error) {
        console.error('Error deleting learning plan:', error);
        setError('Failed to delete learning plan. Please try again later.');
      }
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!plan) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">Learning plan not found</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <IconButton onClick={() => navigate('/learning-plans')} sx={{ mr: 2 }}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" sx={{ flexGrow: 1 }}>{plan.title}</Typography>
        <IconButton 
          onClick={() => {
            setEditPlan({ ...plan });
            setOpenEditDialog(true);
          }} 
          sx={{ mr: 1 }}
        >
          <Edit />
        </IconButton>
        <IconButton onClick={handleDeletePlan} color="error">
          <Delete />
        </IconButton>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Plan Overview
            </Typography>
            <Typography color="textSecondary" paragraph>
              {plan.description}
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Chip
                icon={<CalendarToday />}
                label={`Start: ${new Date(plan.startDate).toLocaleDateString()}`}
                sx={{ mr: 1, mb: 1 }}
              />
              <Chip
                icon={<CalendarToday />}
                label={`Due: ${new Date(plan.dueDate).toLocaleDateString()}`}
                sx={{ mr: 1, mb: 1 }}
              />
              <Chip
                icon={<School />}
                label={plan.progress}
                color={getStatusColor(plan.progress)}
                sx={{ mb: 1 }}
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Overall Progress
              </Typography>
              <LinearProgress
                variant="determinate"
                value={calculateProgress()}
                sx={{ mb: 1 }}
              />
              <Typography variant="body2" color="textSecondary">
                {Math.round(calculateProgress())}% complete
              </Typography>
            </Box>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Subjects
            </Typography>
            <List>
              {plan.subjects.map((subject, index) => (
                <React.Fragment key={index}>
                  <ListItem
                    button
                    onClick={() => handleSubjectClick(subject)}
                    sx={{ mb: 2 }}
                  >
                    <ListItemIcon>
                      {subject.status === 'COMPLETED' ? (
                        <CheckCircle color="success" />
                      ) : (
                        <RadioButtonUnchecked />
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={subject.name}
                      secondary={
                        <Box>
                          <Typography variant="body2" color="textSecondary">
                            {subject.description}
                          </Typography>
                          <Box sx={{ mt: 1 }}>
                            <Chip
                              size="small"
                              label={subject.status || 'NOT_STARTED'}
                              color={getStatusColor(subject.status)}
                              sx={{ mr: 1 }}
                            />
                            {subject.materials && subject.materials.length > 0 && (
                              <Chip
                                size="small"
                                icon={<Description />}
                                label={`${subject.materials.length} materials`}
                              />
                            )}
                          </Box>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < plan.subjects.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Milestones
            </Typography>
            <List>
              {plan.milestones.map((milestone, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <Checkbox
                      edge="start"
                      checked={milestone.completed}
                      onChange={() => handleMilestoneToggle(milestone.id)}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={milestone.title}
                    secondary={
                      <Box>
                        <Typography variant="body2" color="textSecondary">
                          {milestone.description}
                        </Typography>
                        <Chip
                          size="small"
                          icon={<CalendarToday />}
                          label={`Due: ${new Date(milestone.dueDate).toLocaleDateString()}`}
                          sx={{ mt: 1 }}
                        />
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Update Progress - {selectedSubject?.name}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Status
            </Typography>
            <Box sx={{ mb: 3 }}>
              <Button
                variant={updateData.subjectStatuses[selectedSubject?.id] === 'NOT_STARTED' ? 'contained' : 'outlined'}
                onClick={() => handleStatusChange(selectedSubject?.id, 'NOT_STARTED')}
                sx={{ mr: 1 }}
              >
                Not Started
              </Button>
              <Button
                variant={updateData.subjectStatuses[selectedSubject?.id] === 'IN_PROGRESS' ? 'contained' : 'outlined'}
                onClick={() => handleStatusChange(selectedSubject?.id, 'IN_PROGRESS')}
                sx={{ mr: 1 }}
              >
                In Progress
              </Button>
              <Button
                variant={updateData.subjectStatuses[selectedSubject?.id] === 'COMPLETED' ? 'contained' : 'outlined'}
                onClick={() => handleStatusChange(selectedSubject?.id, 'COMPLETED')}
              >
                Completed
              </Button>
            </Box>

            {selectedSubject?.materials && selectedSubject.materials.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Materials
                </Typography>
                <List>
                  {selectedSubject.materials.map((material, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <Checkbox
                          edge="start"
                          checked={updateData.completedItems[material.id] || false}
                          onChange={() => {
                            setUpdateData(prev => ({
                              ...prev,
                              completedItems: {
                                ...prev.completedItems,
                                [material.id]: !prev.completedItems[material.id],
                              },
                            }));
                          }}
                        />
                      </ListItemIcon>
                      <ListItemText primary={material.name} secondary={material.description} />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleUpdateProgress} variant="contained">
            Update Progress
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Learning Plan</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Title"
              value={editPlan?.title || ''}
              onChange={(e) => setEditPlan({ ...editPlan, title: e.target.value })}
              sx={{ mb: 2 }}
            />
            
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={3}
              value={editPlan?.description || ''}
              onChange={(e) => setEditPlan({ ...editPlan, description: e.target.value })}
              sx={{ mb: 2 }}
            />
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Start Date"
                  value={editPlan?.startDate || ''}
                  onChange={(e) => setEditPlan({ ...editPlan, startDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Due Date"
                  value={editPlan?.dueDate || ''}
                  onChange={(e) => setEditPlan({ ...editPlan, dueDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
          <Button onClick={handleEditPlan} variant="contained">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default LearningPlanDetail; 