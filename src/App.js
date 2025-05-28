import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Components
import Navbar from './components/Navbar';
import Home from './pages/Home.js';
import AdminDashboard from './pages/admin/Dashboard';
import ServiceProviderDashboard from './pages/serviceProvider/Dashboard';
import CustomerDashboard from './pages/customer/Dashboard';
import AdminLogin from './pages/admin/Login';
import WeddingHallBooking from './pages/customer/WeddingHallBooking';
import ServiceBooking from './pages/customer/ServiceBooking';
import HallManagerDashboard from './pages/hallManager/Dashboard';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Theme Context
import { ThemeProvider, useTheme } from './context/ThemeContext';

const AppContent = () => {
  const { theme } = useTheme();

  const lightTheme = createTheme({
    palette: {
      mode: 'light',
      primary: {
        main: '#1976d2',
      },
      secondary: {
        main: '#dc004e',
      },
      background: {
        default: '#f5f5f5',
        paper: '#ffffff',
      },
    },
  });

  const darkTheme = createTheme({
    palette: {
      mode: 'dark',
      primary: {
        main: '#90caf9',
      },
      secondary: {
        main: '#f48fb1',
      },
      background: {
        default: '#121212',
        paper: '#1e1e1e',
      },
    },
  });

  const currentTheme = theme === 'light' ? lightTheme : darkTheme;

  return (
    <MuiThemeProvider theme={currentTheme}>
      <CssBaseline />
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          
          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          
          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Service Provider Routes */}
          <Route path="/service-provider/dashboard" element={<ServiceProviderDashboard />} />
          
          {/* Wedding Hall Manager Routes */}
          <Route path="/hall-manager/dashboard" element={<HallManagerDashboard />} />
          
          {/* Customer Routes */}
          <Route path="/customer/dashboard" element={<CustomerDashboard />} />
          <Route path="/customer/book-hall" element={<WeddingHallBooking />} />
          <Route path="/customer/book-service" element={<ServiceBooking />} />
        </Routes>
      </Router>
    </MuiThemeProvider>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App; 
