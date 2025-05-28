import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  IconButton,
  Tooltip,
  useMediaQuery,
  Menu,
  MenuItem,
  Avatar,
} from '@mui/material';
import {
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  Menu as MenuIcon,
} from '@mui/icons-material';
import { useTheme } from '../context/ThemeContext';
import { useTheme as useMuiTheme } from '@mui/material/styles';
import logo from '../logo.jpg';

const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));
  const [anchorEl, setAnchorEl] = useState(null);
  const [userType, setUserType] = useState(null);

  useEffect(() => {
    // Check if user is logged in
    const loggedInUserType = sessionStorage.getItem('userType');
    setUserType(loggedInUserType);
    
    // Listen for changes in sessionStorage
    const handleStorageChange = () => {
      const updatedUserType = sessionStorage.getItem('userType');
      setUserType(updatedUserType);
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Custom event for same-tab updates
    window.addEventListener('userLogin', handleStorageChange);
    window.addEventListener('userLogout', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userLogin', handleStorageChange);
      window.removeEventListener('userLogout', handleStorageChange);
    };
  }, []);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Determine which navigation links to show based on user type
  // Hide appropriate options when logged in as service provider
  const shouldShowCustomerDashboard = !userType || userType === 'customer';
  const shouldShowServiceProvider = !userType || (userType !== 'serviceProvider' && userType !== 'admin');
  const shouldShowHallManager = !userType || (userType !== 'hallManager' && userType !== 'admin' && userType !== 'serviceProvider');
  const shouldShowAdmin = !userType || (userType !== 'admin' && userType !== 'serviceProvider');

  return (
    <AppBar position="static" sx={{ 
      bgcolor: '#d32f2f', // Material-UI's red[700] color
      background: 'linear-gradient(45deg, #d32f2f 30%, #f44336 90%)', // Gradient effect from darker to lighter red
    }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar 
              src={logo} 
              alt="Logo" 
              component={RouterLink}
              to="/"
              sx={{ 
                width: 40, 
                height: 40, 
                mr: 1,
                border: '2px solid white',
              }} 
            />
            <Typography
              variant="h6"
              noWrap
              component={RouterLink}
              to="/"
              sx={{
                mr: 2,
                display: { xs: 'flex' },
                fontFamily: 'monospace',
                fontWeight: 700,
                letterSpacing: '.3rem',
                color: 'inherit',
                textDecoration: 'none',
                flexGrow: { xs: 1, md: 0 },
              }}
            >
              Event Management
            </Typography>
          </Box>

          {isMobile ? (
            <>
              <IconButton
                color="inherit"
                aria-label="toggle theme"
                onClick={toggleTheme}
                sx={{ mr: 1 }}
              >
                {theme === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
              <IconButton
                color="inherit"
                aria-label="menu"
                onClick={handleMenuOpen}
              >
                <MenuIcon />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                {shouldShowCustomerDashboard && (
                  <MenuItem 
                    component={RouterLink} 
                    to="/customer/dashboard"
                    onClick={handleMenuClose}
                  >
                    Customer Dashboard
                  </MenuItem>
                )}
                {shouldShowServiceProvider && (
                  <MenuItem 
                    component={RouterLink} 
                    to="/login"
                    onClick={handleMenuClose}
                  >
                    Service Provider
                  </MenuItem>
                )}
                {shouldShowHallManager && (
                  <MenuItem 
                    component={RouterLink} 
                    to="/login"
                    onClick={handleMenuClose}
                  >
                    Wedding Hall Manager
                  </MenuItem>
                )}
                {shouldShowAdmin && (
                  <MenuItem 
                    component={RouterLink} 
                    to="/admin/login"
                    onClick={handleMenuClose}
                  >
                    Admin
                  </MenuItem>
                )}
              </Menu>
            </>
          ) : (
            <>
              <Box sx={{ flexGrow: 1, display: 'flex' }}>
                {shouldShowCustomerDashboard && (
                  <Button
                    component={RouterLink}
                    to="/customer/dashboard"
                    sx={{ 
                      my: 2, 
                      color: 'white', 
                      display: 'block',
                      '&:hover': {
                        bgcolor: 'rgba(255, 255, 255, 0.1)',
                      }
                    }}
                  >
                    Customer Dashboard
                  </Button>
                )}
                {shouldShowServiceProvider && (
                  <Button
                    component={RouterLink}
                    to="/login"
                    sx={{ 
                      my: 2, 
                      color: 'white', 
                      display: 'block',
                      '&:hover': {
                        bgcolor: 'rgba(255, 255, 255, 0.1)',
                      }
                    }}
                  >
                    Service Provider
                  </Button>
                )}
                {shouldShowHallManager && (
                  <Button
                    component={RouterLink}
                    to="/login"
                    sx={{ 
                      my: 2, 
                      color: 'white', 
                      display: 'block',
                      '&:hover': {
                        bgcolor: 'rgba(255, 255, 255, 0.1)',
                      }
                    }}
                  >
                    Wedding Hall Manager
                  </Button>
                )}
                {shouldShowAdmin && (
                  <Button
                    component={RouterLink}
                    to="/admin/login"
                    sx={{ 
                      my: 2, 
                      color: 'white', 
                      display: 'block',
                      '&:hover': {
                        bgcolor: 'rgba(255, 255, 255, 0.1)',
                      }
                    }}
                  >
                    Admin
                  </Button>
                )}
              </Box>

              <Tooltip title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}>
                <IconButton color="inherit" onClick={toggleTheme}>
                  {theme === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
                </IconButton>
              </Tooltip>
            </>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar; 