import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../firebase';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [openResetDialog, setOpenResetDialog] = useState(false);
  const [resetMessage, setResetMessage] = useState({ type: '', message: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Store user type in session storage
      sessionStorage.setItem('userType', 'admin');
      // Dispatch custom event to update UI
      window.dispatchEvent(new Event('userLogin'));
      navigate('/admin/dashboard');
    } catch (error) {
      setError('Invalid email or password');
    }
  };

  const handleOpenResetDialog = () => {
    setOpenResetDialog(true);
    setResetEmail(email);
    setResetMessage({ type: '', message: '' });
  };

  const handleCloseResetDialog = () => {
    setOpenResetDialog(false);
    setResetMessage({ type: '', message: '' });
  };

  const handleResetPassword = async () => {
    if (!resetEmail) {
      setResetMessage({ type: 'error', message: 'Please enter your email address' });
      return;
    }
    
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetMessage({ 
        type: 'success', 
        message: 'Password reset email sent. Please check your inbox.' 
      });
    } catch (error) {
      setResetMessage({ 
        type: 'error', 
        message: 'Failed to send reset email. Please verify your email address.' 
      });
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Admin Login
          </Typography>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              required
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              sx={{ mt: 3 }}
            >
              Login
            </Button>
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Button 
                variant="text" 
                color="primary" 
                onClick={handleOpenResetDialog}
              >
                Forgot Password?
              </Button>
            </Box>
          </form>
        </Paper>
      </Box>

      {/* Password Reset Dialog */}
      <Dialog open={openResetDialog} onClose={handleCloseResetDialog}>
        <DialogTitle>Reset Password</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Enter your email address and we'll send you a link to reset your password.
          </DialogContentText>
          {resetMessage.message && (
            <Alert severity={resetMessage.type} sx={{ mt: 2 }}>
              {resetMessage.message}
            </Alert>
          )}
          <TextField
            autoFocus
            margin="dense"
            label="Email Address"
            type="email"
            fullWidth
            variant="outlined"
            value={resetEmail}
            onChange={(e) => setResetEmail(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseResetDialog}>Cancel</Button>
          <Button onClick={handleResetPassword}>Reset Password</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminLogin; 