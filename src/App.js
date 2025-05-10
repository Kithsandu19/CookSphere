import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Community from './pages/Community';
import MyProfile from './pages/MyProfile';
import UserProfile from './pages/UserProfile';
import PostList from './pages/posts/PostList';
import PostView from './pages/posts/PostView';
import PostCreate from './pages/posts/PostCreate';
import PostEdit from './pages/posts/PostEdit';
import NotificationsPage from './pages/NotificationsPage';
import Error from './pages/Error';
import CommunityChatPage from './pages/CommunityChatPage';
import LearningMaterialsList from './pages/learning-materials/LearningMaterialsList';
import LearningMaterialCreate from './pages/learning-materials/LearningMaterialCreate';
import LearningMaterialEdit from './pages/learning-materials/LearningMaterialEdit';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        
        {/* Protected Routes */}
        <Route
          path="dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="community"
          element={
            <PrivateRoute>
              <Community />
            </PrivateRoute>
          }
        />
        <Route
          path="profile"
          element={
            <PrivateRoute>
              <MyProfile />
            </PrivateRoute>
          }
        />
        <Route
          path="users/:userId"
          element={
            <PrivateRoute>
              <UserProfile />
            </PrivateRoute>
          }
        />
        <Route
          path="posts"
          element={
            <PrivateRoute>
              <PostList />
            </PrivateRoute>
          }
        />
        <Route
          path="posts/:id"
          element={
            <PrivateRoute>
              <PostView />
            </PrivateRoute>
          }
        />
        <Route
          path="posts/create"
          element={
            <PrivateRoute>
              <PostCreate />
            </PrivateRoute>
          }
        />
        <Route
          path="posts/:id/edit"
          element={
            <PrivateRoute>
              <PostEdit />
            </PrivateRoute>
          }
        />
        <Route
          path="notifications"
          element={
            <PrivateRoute>
              <NotificationsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="chat"
          element={
            <PrivateRoute>
              <CommunityChatPage />
            </PrivateRoute>
          }
        />
        <Route
          path="learning-materials"
          element={
            <PrivateRoute>
              <LearningMaterialsList />
            </PrivateRoute>
          }
        />
        <Route
          path="learning-materials/create"
          element={
            <PrivateRoute>
              <LearningMaterialCreate />
            </PrivateRoute>
          }
        />
        <Route
          path="learning-materials/:id/edit"
          element={
            <PrivateRoute>
              <LearningMaterialEdit />
            </PrivateRoute>
          }
        />
        <Route path="*" element={<Error />} />
      </Route>
    </Routes>
  );
}

export default App;