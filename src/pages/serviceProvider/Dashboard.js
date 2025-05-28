import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  IconButton,
} from '@mui/material';
import { LogoutOutlined as LogoutIcon, Edit as EditIcon } from '@mui/icons-material';
import { collection, query, where, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { db, auth } from '../../firebase';
import DarkModeToggle from '../../components/DarkModeToggle';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

// Available services
const availableServices = [
  'CATERING',
  'DECORATION',
  'PHOTOGRAPHY',
  'VIDEOGRAPHY',
  'MUSIC',
  'TRANSPORTATION',
  'MAKEUP',
  'MEHNDI',
];

const ServiceProviderDashboard = () => {
  const navigate = useNavigate();
  const [providerData, setProviderData] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [message, setMessage] = useState('');
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    phone: '',
    address: '',
    services: [],
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProviderData();
    fetchBookings();
  }, []);

  const fetchProviderData = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const docRef = doc(db, 'serviceProviders', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          // Ensure services array exists
          const providerDataWithDefaults = {
            ...data,
            services: data.services || [],
            name: data.name || '',
            phone: data.phone || '',
            address: data.address || '',
          };
          setProviderData(providerDataWithDefaults);
          setEditFormData({
            name: providerDataWithDefaults.name,
            phone: providerDataWithDefaults.phone,
            address: providerDataWithDefaults.address,
            services: providerDataWithDefaults.services,
          });
        }
      }
    } catch (error) {
      console.error('Error fetching provider data:', error);
      setMessage('Error fetching provider data');
    }
  };

  const fetchBookings = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const q = query(
          collection(db, 'bookings'),
          where('serviceProviderId', '==', user.uid)
        );
        const querySnapshot = await getDocs(q);
        const bookingList = [];
        querySnapshot.forEach((doc) => {
          bookingList.push({ id: doc.id, ...doc.data() });
        });
        setBookings(bookingList);
      }
    } catch (error) {
      setMessage('Error fetching bookings');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // Clear any session storage or local storage if needed
      sessionStorage.removeItem('serviceProviderId');
      sessionStorage.removeItem('userType');
      // Dispatch custom event to update UI
      window.dispatchEvent(new Event('userLogout'));
      navigate('/service-provider/login');
    } catch (error) {
      setMessage('Error logging out');
      console.error(error);
    }
  };

  const handleToggleStatus = async (bookingId, currentStatus) => {
    try {
      // Toggle between pending and completed
      const newStatus = currentStatus === 'pending' ? 'completed' : 'pending';
      
      // Update the booking in Firestore
      const bookingRef = doc(db, 'bookings', bookingId);
      await updateDoc(bookingRef, {
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
      
      // Update local state
      setBookings(bookings.map(booking => 
        booking.id === bookingId ? { ...booking, status: newStatus } : booking
      ));
      
      setMessage(`Booking status updated to ${newStatus}`);
    } catch (error) {
      setMessage('Error updating booking status');
      console.error(error);
    }
  };

  const handleOpenEditDialog = () => {
    setOpenEditDialog(true);
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: value,
    });
  };

  const handleServicesChange = (event) => {
    const {
      target: { value },
    } = event;
    setEditFormData({
      ...editFormData,
      services: typeof value === 'string' ? value.split(',') : value,
    });
  };

  const handleSubmitEdit = async () => {
    try {
      setLoading(true);
      const user = auth.currentUser;
      if (user) {
        const providerRef = doc(db, 'serviceProviders', user.uid);
        await updateDoc(providerRef, {
          name: editFormData.name,
          phone: editFormData.phone,
          address: editFormData.address,
          services: editFormData.services,
        });
        
        // Update local state
        setProviderData({
          ...providerData,
          name: editFormData.name,
          phone: editFormData.phone,
          address: editFormData.address,
          services: editFormData.services,
        });
        
        setMessage('Profile updated successfully');
        setOpenEditDialog(false);
      }
    } catch (error) {
      setMessage('Error updating profile');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 0 }}>
          Service Provider Dashboard
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <DarkModeToggle />
          <Button 
            variant="outlined" 
            color="error" 
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            sx={{ ml: 1 }}
          >
            Logout
          </Button>
        </Box>
      </Box>
      
      {message && (
        <Alert severity="info" sx={{ mb: 2 }} onClose={() => setMessage('')}>
          {message}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Profile Summary */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Profile Summary
                </Typography>
                <IconButton 
                  color="primary" 
                  onClick={handleOpenEditDialog}
                  size="small"
                >
                  <EditIcon />
                </IconButton>
              </Box>
              {providerData && (
                <>
                  <Typography>Name: {providerData.name}</Typography>
                  <Typography>Email: {providerData.email}</Typography>
                  <Typography>Phone: {providerData.phone}</Typography>
                  <Typography>Address: {providerData.address}</Typography>
                  <Typography variant="subtitle1" sx={{ mt: 2 }}>
                    Services Offered:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {providerData.services && providerData.services.length > 0 ? (
                      providerData.services.map((service, index) => (
                        <Button
                          key={index}
                          variant="outlined"
                          size="small"
                          disabled
                        >
                          {service}
                        </Button>
                      ))
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No services listed
                      </Typography>
                    )}
                  </Box>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Bookings */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Bookings
            </Typography>
            {bookings.length === 0 ? (
              <Typography variant="body1" color="text.secondary" align="center" sx={{ py: 4 }}>
                No bookings found
              </Typography>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {bookings.map((booking) => (
                  <Paper key={booking.id} elevation={1} sx={{ p: 2 }}>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="subtitle2" color="text.secondary">Tracking ID</Typography>
                        <Typography variant="body1">{booking.trackingId || "N/A"}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="subtitle2" color="text.secondary">Service</Typography>
                        <Typography variant="body1">{booking.serviceType}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="subtitle2" color="text.secondary">Date</Typography>
                        <Typography variant="body1">{booking.date}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                        <Button
                          variant={booking.status === 'completed' ? 'outlined' : 'contained'}
                          color={
                            booking.status === 'approved'
                              ? 'success'
                              : booking.status === 'rejected'
                              ? 'error'
                              : booking.status === 'completed'
                              ? 'success'
                              : 'warning'
                          }
                          size="small"
                          onClick={() => handleToggleStatus(booking.id, booking.status)}
                          sx={{ 
                            cursor: 'pointer',
                            '&:hover': { 
                              opacity: 0.8,
                              boxShadow: 2
                            }
                          }}
                        >
                          {booking.status}
                        </Button>
                      </Grid>
                      <Grid item xs={12}>
                        <Divider sx={{ my: 1 }} />
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="subtitle2" color="text.secondary">Customer Address</Typography>
                        <Typography variant="body2">{booking.customerAddress || "Not provided"}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="subtitle2" color="text.secondary">Customer Phone</Typography>
                        <Typography variant="body2">{booking.phone || "Not provided"}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="subtitle2" color="text.secondary">Number of Guests</Typography>
                        <Typography variant="body2">{booking.numberOfGuests || "Not specified"}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="subtitle2" color="text.secondary">Additional Requirements</Typography>
                        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                          {booking.additionalRequirements || "None"}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Paper>
                ))}
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Edit Profile Dialog */}
      <Dialog open={openEditDialog} onClose={handleCloseEditDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Profile Information</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Full Name"
                  name="name"
                  value={editFormData.name}
                  onChange={handleEditChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  name="phone"
                  value={editFormData.phone}
                  onChange={handleEditChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  name="address"
                  value={editFormData.address}
                  onChange={handleEditChange}
                  multiline
                  rows={2}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel id="services-label">Services Offered</InputLabel>
                  <Select
                    labelId="services-label"
                    id="services"
                    multiple
                    value={editFormData.services}
                    onChange={handleServicesChange}
                    input={<OutlinedInput label="Services Offered" />}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip key={value} label={value} />
                        ))}
                      </Box>
                    )}
                    MenuProps={MenuProps}
                  >
                    {availableServices.map((service) => (
                      <MenuItem
                        key={service}
                        value={service}
                      >
                        {service}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>Cancel</Button>
          <Button 
            onClick={handleSubmitEdit} 
            variant="contained" 
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ServiceProviderDashboard; 