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
    // Set up interval to check auth status every 5 minutes
    const interval = setInterval(checkAuthStatus, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await axios.get('/api/auth/user', { 
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data.authenticated) {
        const userData = {
          id: response.data.id,
          name: response.data.name,
          email: response.data.email,
          picture: response.data.picture
        };
        
        // Store user data in localStorage
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
      } else {
        // Clear user data if not authenticated
        localStorage.removeItem('user');
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      // On error, try to get user from localStorage
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      } else {
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const login = () => {
    window.location.href = '/oauth2/authorization/google';
  };

  const logout = async () => {
    try {
      await axios.post('/api/auth/logout', {}, { withCredentials: true });
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      // Always clear local state
      setUser(null);
      localStorage.removeItem('user');
      sessionStorage.removeItem('user');
      window.location.href = '/';
    }
  };

  const updateProfile = async (userData) => {
    try {
      setError(null);
      const response = await axios.put('/api/users/profile', userData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data) {
        const updatedUser = {
          ...user,
          ...response.data
        };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Profile update failed');
      throw err;
    }
  };

  const value = {
    user,
    setUser,
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