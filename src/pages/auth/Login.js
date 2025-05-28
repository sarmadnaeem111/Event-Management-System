import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Paper,
  Alert,
  InputAdornment,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../../firebase';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [openResetDialog, setOpenResetDialog] = useState(false);
  const [resetMessage, setResetMessage] = useState({ type: '', message: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Sign in with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      
      const user = userCredential.user;
      
      // Check if the user is a hall manager
      const hallManagerQuery = query(
        collection(db, 'hallManagers'),
        where('uid', '==', user.uid)
      );
      
      const hallManagerSnapshot = await getDocs(hallManagerQuery);
      
      // Check if the user is a service provider
      const serviceProviderQuery = query(
        collection(db, 'serviceProviders'),
        where('uid', '==', user.uid)
      );
      
      const serviceProviderSnapshot = await getDocs(serviceProviderQuery);
      
      if (hallManagerSnapshot.empty && serviceProviderSnapshot.empty) {
        await auth.signOut();
        setError('No account found with this email');
        setLoading(false);
        return;
      }
      
      if (!hallManagerSnapshot.empty) {
        const hallManagerData = hallManagerSnapshot.docs[0].data();
        
        if (hallManagerData.status === 'pending') {
          await auth.signOut();
          setError('Your account is pending approval by the admin');
          setLoading(false);
          return;
        }
        
        if (hallManagerData.status === 'rejected') {
          await auth.signOut();
          setError('Your account has been rejected by the admin');
          setLoading(false);
          return;
        }
        
        // Store hall manager ID in session
        sessionStorage.setItem('hallManagerId', hallManagerSnapshot.docs[0].id);
        sessionStorage.setItem('userType', 'hallManager');
        
        // Dispatch custom event to update UI
        window.dispatchEvent(new Event('userLogin'));
        
        // Redirect to dashboard
        navigate('/hall-manager/dashboard');
      } else {
        const serviceProviderData = serviceProviderSnapshot.docs[0].data();
        
        if (serviceProviderData.status === 'pending') {
          await auth.signOut();
          setError('Your account is pending approval by the admin');
          setLoading(false);
          return;
        }
        
        if (serviceProviderData.status === 'rejected') {
          await auth.signOut();
          setError('Your account has been rejected by the admin');
          setLoading(false);
          return;
        }
        
        // Store user type in session storage
        sessionStorage.setItem('userType', 'serviceProvider');
        // Dispatch custom event to update UI
        window.dispatchEvent(new Event('userLogin'));
        navigate('/service-provider/dashboard');
      }
    } catch (error) {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenResetDialog = () => {
    setOpenResetDialog(true);
    setResetEmail(formData.email);
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
      <Paper elevation={3} sx={{ p: 4, mt: 8 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Login
        </Typography>
        
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            margin="normal"
          />
          
          <TextField
            fullWidth
            label="Password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={handleChange}
            required
            margin="normal"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            disabled={loading}
            sx={{ mt: 3, mb: 2 }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
            <Button 
              variant="text" 
              color="primary" 
              onClick={handleOpenResetDialog}
              disabled={loading}
            >
              Forgot Password?
            </Button>
            <Typography variant="body2">
              Don't have an account?{' '}
              <Link to="/register" style={{ textDecoration: 'none' }}>
                Register here
              </Link>
            </Typography>
          </Box>
        </Box>
      </Paper>

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

export default Login; 