import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await axios.get('/api/auth/user', { withCredentials: true });
      console.log('Auth response:', response.data);
      
      if (response.data.authenticated) {
        // Make sure we have all required fields
        const userData = {
          id: response.data.id,
          name: response.data.name,
          email: response.data.email,
          picture: response.data.picture
        };
        
        console.log('Setting user data:', userData);
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = () => {
    // Use the proxy to redirect to the OAuth endpoint
    window.location.href = '/oauth2/authorization/google';
  };

  const logout = async () => {
    try {
      await axios.post('/api/auth/logout', {}, { withCredentials: true });
      setUser(null);
      // Clear any stored user data
      localStorage.removeItem('user');
      sessionStorage.removeItem('user');
      // Force a page reload to clear any cached state
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
      // Even if the server request fails, clear the local state
      setUser(null);
      localStorage.removeItem('user');
      sessionStorage.removeItem('user');
      window.location.href = '/';
    }
  };

  const updateProfile = async (userData) => {
    try {
      setError(null);
      const response = await axios.put('/api/users/profile', userData);
      setUser(response.data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Profile update failed');
      throw err;
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    updateProfile,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 