import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import {
  Home as HomeIcon,
  Explore as ExploreIcon,
  AddCircleOutline as AddIcon,
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  Menu as MenuIcon,
  Person as PersonIcon,
  Restaurant as RestaurantIcon,
  Google as GoogleIcon,
  ChatBubbleOutline as ChatIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (user && user.id) {
      fetchUnreadNotificationsCount();
      const interval = setInterval(fetchUnreadNotificationsCount, 15000); // Poll every 15 seconds
      return () => clearInterval(interval);
    } else {
      setUnreadNotifications(0);
    }
  }, [user, location.pathname]); // Re-fetch when location changes

  const fetchUnreadNotificationsCount = async () => {
    try {
      const response = await axios.get('/api/notifications/unread-count', {
        withCredentials: true,
        headers: {
          'Authorization': `Bearer ${user.id}`
        }
      });
      setUnreadNotifications(response.data.count || 0);
    } catch (error) {
      console.error('Error fetching unread notifications count:', error);
      setUnreadNotifications(0);
    }
  };

  const handleGoogleLogin = () => {
    login();
  };

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate('/');
  };

  const navItems = [
    { icon: <HomeIcon />, label: 'Home', path: '/' },
    { icon: <ExploreIcon />, label: 'Community', path: '/community' },
    { icon: <AddIcon />, label: 'Create Post', path: '/posts/create' },
    { 
      icon: <NotificationsIcon />, 
      label: 'Notifications', 
      path: '/notifications',
      badge: unreadNotifications > 0 ? unreadNotifications : null
    },
    { icon: <ChatIcon />, label: 'Chat', path: '/chat' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-content">
          {/* Logo */}
          <Link to="/" className="navbar-logo">
            <RestaurantIcon />
            <span>CookSphere</span>
          </Link>

          {/* Search Bar */}
          {!isMobile && (
            <div className="navbar-search">
              <SearchIcon className="search-icon" />
              <input
                type="text"
                placeholder="Search..."
                className="search-input"
              />
            </div>
          )}

          {/* Navigation */}
          <div className="navbar-nav">
            {user ? (
              <>
                {!isMobile && (
                  <div className="nav-icons">
                    {navItems.map((item) => (
                      <button
                        key={item.label}
                        className={`nav-icon-btn ${isActive(item.path) ? 'active' : ''}`}
                        onClick={() => navigate(item.path)}
                      >
                        {item.badge ? (
                          <div className="notification-badge">
                            {item.icon}
                            <span className="badge">{item.badge}</span>
                          </div>
                        ) : (
                          item.icon
                        )}
                      </button>
                    ))}
                  </div>
                )}
                {isMobile && (
                  <button
                    className="mobile-menu-btn"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  >
                    <MenuIcon />
                  </button>
                )}
                <img
                  src={user.picture}
                  alt={user.name}
                  className={`avatar ${isActive('/profile') ? 'active' : ''}`}
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                />
              </>
            ) : (
              <button className="login-btn" onClick={handleGoogleLogin}>
                <GoogleIcon />
                Sign in with Google
              </button>
            )}
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="menu" style={{ top: '64px', left: '0', right: '0' }}>
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.path}
                  className={`menu-item ${isActive(item.path) ? 'active' : ''}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.badge && <span className="badge mobile">{item.badge}</span>}
                </Link>
              ))}
            </div>
          )}

          {/* User Menu */}
          {userMenuOpen && (
            <div className="menu" style={{ top: '64px', right: '20px' }}>
              <Link
                to="/profile"
                className={`menu-item ${isActive('/profile') ? 'active' : ''}`}
                onClick={() => setUserMenuOpen(false)}
              >
                <PersonIcon />
                <span>Profile</span>
              </Link>
              <div className="menu-divider" />
              <button className="menu-item" onClick={handleLogout}>
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 