import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  Box,
  Card,
  CardContent,
  CardActions,
  LinearProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
  Alert,
  Divider,
  IconButton,
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { Add as AddIcon, CalendarToday, AccessTime, School, Delete as DeleteIcon } from '@mui/icons-material';

const LearningPlans = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [newPlan, setNewPlan] = useState({
    title: '',
    description: '',
    startDate: '',
    dueDate: '',
  });

  useEffect(() => {
    fetchPlans();
    fetchTemplates();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/learning-plans/user/${user.id}`);
      setPlans(response.data);
      setError('');
    } catch (error) {
      console.error('Error fetching learning plans:', error);
      setError('Failed to load your learning plans. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      console.log('Fetching templates - starting request...');
      const response = await axios.get('/api/learning-plan-templates', {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });
      console.log('Templates API response:', {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        data: response.data
      });
      
      if (!response.data || response.data.length === 0) {
        console.warn('No templates returned from API');
        // Try to initialize templates
        try {
          console.log('Attempting to initialize templates...');
          const initResponse = await axios.get('/api/learning-plan-templates/test');
          console.log('Template initialization response:', {
            status: initResponse.status,
            statusText: initResponse.statusText,
            headers: initResponse.headers,
            data: initResponse.data
          });
          
          // Fetch templates again after initialization
          console.log('Fetching templates again after initialization...');
          const retryResponse = await axios.get('/api/learning-plan-templates');
          console.log('Templates after initialization:', {
            status: retryResponse.status,
            statusText: retryResponse.statusText,
            headers: retryResponse.headers,
            data: retryResponse.data
          });
          setTemplates(retryResponse.data);
        } catch (initError) {
          console.error('Error initializing templates:', {
            message: initError.message,
            response: initError.response?.data,
            status: initError.response?.status
          });
        }
      } else {
        console.log('Setting templates with data:', response.data);
        setTemplates(response.data);
      }
      
      setError('');
    } catch (error) {
      console.error('Error fetching templates:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      setError('Failed to load learning plan templates. Please try again later.');
    }
  };

  const handleCreatePlan = async () => {
    try {
      if (!selectedTemplate) {
        setError('Please select a template');
        return;
      }
      
      if (!newPlan.title || !newPlan.startDate || !newPlan.dueDate) {
        setError('Please fill in all required fields');
        return;
      }
      
      const template = templates.find(t => t.id === selectedTemplate);
      console.log('Selected template:', template);
      
      if (!template) {
        setError('Selected template not found');
        return;
      }
      
      // Convert template subjects to learning plan subjects
      const subjects = template.subjects.map(subject => ({
        name: subject.name,
        description: subject.description,
        materials: subject.materials,
        status: 'NOT_STARTED'
      }));
      
      // Create milestones based on subjects
      const milestones = subjects.map((subject, index) => ({
        title: `Complete ${subject.name}`,
        description: `Master the skills in ${subject.name}`,
        dueDate: new Date(newPlan.dueDate).toISOString().split('T')[0],
        completed: false,
        type: 'SKILL_MASTERY'
      }));
      
      const planData = {
        ...newPlan,
        userId: user.id,
        subjects: subjects,
        milestones: milestones,
        progress: 'NOT_STARTED',
        completedItems: {}
      };
      
      console.log('Creating plan with data:', planData);
      await axios.post('/api/learning-plans', planData);
      setOpenDialog(false);
      fetchPlans();
      setError('');
    } catch (error) {
      console.error('Error creating learning plan:', error);
      setError('Failed to create learning plan. Please try again later.');
    }
  };

  const calculateProgress = (plan) => {
    if (!plan.completedItems || !plan.subjects) return 0;
    const total = plan.subjects.length;
    const completed = Object.values(plan.completedItems).filter(Boolean).length;
    return (completed / total) * 100;
  };

  const getProgressColor = (progress) => {
    switch (progress) {
      case 'COMPLETED':
        return 'success';
      case 'IN_PROGRESS':
        return 'primary';
      default:
        return 'default';
    }
  };

  const handleViewPlan = (planId) => {
    navigate(`/learning-plans/${planId}`);
  };

  const handleDeletePlan = async (planId, event) => {
    event.stopPropagation(); // Prevent triggering the view plan action
    if (window.confirm('Are you sure you want to delete this learning plan?')) {
      try {
        await axios.delete(`/api/learning-plans/${planId}`);
        fetchPlans(); // Refresh the list
      } catch (error) {
        console.error('Error deleting learning plan:', error);
        setError('Failed to delete learning plan. Please try again later.');
      }
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
        <Typography variant="h4">My Learning Plans</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
        >
          Create New Plan
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : plans.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            You don't have any learning plans yet
          </Typography>
          <Typography color="textSecondary" paragraph>
            Create a new learning plan to start tracking your cooking journey
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenDialog(true)}
          >
            Create Your First Plan
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {plans.map((plan) => (
            <Grid item xs={12} md={6} lg={4} key={plan.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" gutterBottom>
                    {plan.title}
                  </Typography>
                  <Typography color="textSecondary" paragraph>
                    {plan.description}
                  </Typography>
                  
                  <Box sx={{ mb: 2 }}>
                    <Chip
                      icon={<CalendarToday />}
                      label={`Due: ${new Date(plan.dueDate).toLocaleDateString()}`}
                      size="small"
                      sx={{ mr: 1, mb: 1 }}
                    />
                    <Chip
                      icon={<AccessTime />}
                      label={`${plan.subjects ? plan.subjects.length : 0} subjects`}
                      size="small"
                      sx={{ mr: 1, mb: 1 }}
                    />
                    <Chip
                      icon={<School />}
                      label={plan.progress}
                      color={getProgressColor(plan.progress)}
                      size="small"
                      sx={{ mb: 1 }}
                    />
                  </Box>
                  
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      Progress
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={calculateProgress(plan)}
                      sx={{ mb: 1 }}
                    />
                    <Typography variant="body2" color="textSecondary">
                      {Math.round(calculateProgress(plan))}% complete
                    </Typography>
                  </Box>
                </CardContent>
                <CardActions>
                  <Button size="small" onClick={() => handleViewPlan(plan.id)}>
                    View Details
                  </Button>
                  <IconButton 
                    size="small" 
                    color="error" 
                    onClick={(e) => handleDeletePlan(plan.id, e)}
                    sx={{ ml: 'auto' }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Learning Plan</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2, mb: 2 }}>
            <InputLabel id="template-label">Template</InputLabel>
            <Select
              labelId="template-label"
              value={selectedTemplate}
              onChange={(e) => {
                console.log('Template selected:', e.target.value);
                setSelectedTemplate(e.target.value);
                const template = templates.find(t => t.id === e.target.value);
                if (template) {
                  setNewPlan({
                    ...newPlan,
                    title: template.title,
                    description: template.description
                  });
                }
              }}
              label="Template"
            >
              {templates.length === 0 ? (
                <MenuItem disabled>No templates available</MenuItem>
              ) : (
                templates.map((template) => (
                  <MenuItem key={template.id} value={template.id}>
                    {template.title} - {template.difficulty}
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>
          
          <TextField
            fullWidth
            label="Title"
            value={newPlan.title}
            onChange={(e) => setNewPlan({ ...newPlan, title: e.target.value })}
            sx={{ mb: 2 }}
          />
          
          <TextField
            fullWidth
            label="Description"
            multiline
            rows={3}
            value={newPlan.description}
            onChange={(e) => setNewPlan({ ...newPlan, description: e.target.value })}
            sx={{ mb: 2 }}
          />
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="Start Date"
                value={newPlan.startDate}
                onChange={(e) => setNewPlan({ ...newPlan, startDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="Due Date"
                value={newPlan.dueDate}
                onChange={(e) => setNewPlan({ ...newPlan, dueDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
          
          {selectedTemplate && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Template Details
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {templates.find(t => t.id === selectedTemplate)?.subjects.map((subject, index) => (
                <Box key={index} sx={{ mb: 2 }}>
                  <Typography variant="body1" fontWeight="bold">
                    {subject.name}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {subject.description}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleCreatePlan} variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default LearningPlans; 