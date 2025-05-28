import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Tabs,
  Tab,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  IconButton,
  Chip,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { collection, query, where, getDocs, updateDoc, doc, deleteDoc, getDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { auth, db } from '../../firebase';
import DarkModeToggle from '../../components/DarkModeToggle';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [serviceProviders, setServiceProviders] = useState([]);
  const [hallManagers, setHallManagers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [allServiceProviders, setAllServiceProviders] = useState([]);
  const [allHallManagers, setAllHallManagers] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [message, setMessage] = useState('');
  const [currentItem, setCurrentItem] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [dialogType, setDialogType] = useState(''); // 'serviceProvider', 'hallManager', 'booking'

  useEffect(() => {
    fetchServiceProviders();
    fetchHallManagers();
    fetchBookings();
    fetchAllServiceProviders();
    fetchAllHallManagers();
    fetchAllBookings();
  }, []);

  const fetchServiceProviders = async () => {
    const q = query(collection(db, 'serviceProviders'), where('status', '==', 'pending'));
    const querySnapshot = await getDocs(q);
    const providers = [];
    querySnapshot.forEach((doc) => {
      providers.push({ id: doc.id, ...doc.data() });
    });
    setServiceProviders(providers);
  };

  const fetchAllServiceProviders = async () => {
    const querySnapshot = await getDocs(collection(db, 'serviceProviders'));
    const providers = [];
    querySnapshot.forEach((doc) => {
      providers.push({ id: doc.id, ...doc.data() });
    });
    setAllServiceProviders(providers);
  };

  const fetchHallManagers = async () => {
    const q = query(collection(db, 'hallManagers'), where('status', '==', 'pending'));
    const querySnapshot = await getDocs(q);
    const managers = [];
    querySnapshot.forEach((doc) => {
      managers.push({ id: doc.id, ...doc.data() });
    });
    setHallManagers(managers);
  };

  const fetchAllHallManagers = async () => {
    const querySnapshot = await getDocs(collection(db, 'hallManagers'));
    const managers = [];
    querySnapshot.forEach((doc) => {
      managers.push({ id: doc.id, ...doc.data() });
    });
    setAllHallManagers(managers);
  };

  const fetchBookings = async () => {
    const q = query(collection(db, 'bookings'), where('status', '==', 'pending'));
    const querySnapshot = await getDocs(q);
    const bookingList = [];
    querySnapshot.forEach((doc) => {
      bookingList.push({ id: doc.id, ...doc.data() });
    });
    setBookings(bookingList);
  };

  const fetchAllBookings = async () => {
    const querySnapshot = await getDocs(collection(db, 'bookings'));
    const bookingList = [];
    querySnapshot.forEach((doc) => {
      bookingList.push({ id: doc.id, ...doc.data() });
    });
    setAllBookings(bookingList);
  };

  const handleProviderApproval = async (providerId, status) => {
    try {
      await updateDoc(doc(db, 'serviceProviders', providerId), {
        status: status,
      });
      setMessage(`Service provider ${status} successfully`);
      fetchServiceProviders();
      fetchAllServiceProviders();
    } catch (error) {
      setMessage('Error updating service provider status');
    }
  };

  const handleHallManagerApproval = async (managerId, status) => {
    try {
      await updateDoc(doc(db, 'hallManagers', managerId), {
        status: status,
      });
      setMessage(`Wedding hall manager ${status} successfully`);
      fetchHallManagers();
      fetchAllHallManagers();
    } catch (error) {
      setMessage('Error updating hall manager status');
    }
  };

  const handleBookingApproval = async (bookingId, status) => {
    try {
      await updateDoc(doc(db, 'bookings', bookingId), {
        status: status,
      });
      setMessage(`Booking ${status} successfully`);
      fetchBookings();
      fetchAllBookings();
    } catch (error) {
      setMessage('Error updating booking status');
    }
  };

  const handleViewDetails = (item, type) => {
    setCurrentItem(item);
    setDialogType(type);
    setEditFormData(item);
    setOpenDialog(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditServiceProvider = async () => {
    try {
      await updateDoc(doc(db, 'serviceProviders', currentItem.id), {
        name: editFormData.name,
        email: editFormData.email,
        phone: editFormData.phone,
        services: editFormData.services,
        status: editFormData.status,
      });
      setMessage('Service provider updated successfully');
      fetchAllServiceProviders();
      setOpenDialog(false);
    } catch (error) {
      setMessage('Error updating service provider');
    }
  };

  const handleEditHallManager = async () => {
    try {
      await updateDoc(doc(db, 'hallManagers', currentItem.id), {
        name: editFormData.name,
        email: editFormData.email,
        hallName: editFormData.hallName,
        hallAddress: editFormData.hallAddress,
        hallDescription: editFormData.hallDescription,
        hallCapacity: parseInt(editFormData.hallCapacity) || 0,
        hallPrice: parseFloat(editFormData.hallPrice) || 0,
        hallPhone: editFormData.hallPhone,
        status: editFormData.status,
      });
      setMessage('Wedding hall manager updated successfully');
      fetchAllHallManagers();
      setOpenDialog(false);
    } catch (error) {
      setMessage('Error updating wedding hall manager');
    }
  };

  const handleEditBooking = async () => {
    try {
      await updateDoc(doc(db, 'bookings', currentItem.id), {
        customerName: editFormData.customerName,
        email: editFormData.email,
        phone: editFormData.phone,
        date: editFormData.date,
        status: editFormData.status,
      });
      setMessage('Booking updated successfully');
      fetchAllBookings();
      setOpenDialog(false);
    } catch (error) {
      setMessage('Error updating booking');
    }
  };

  const handleDelete = (item, type) => {
    setCurrentItem(item);
    setDialogType(type);
    setOpenDeleteDialog(true);
  };

  const confirmDelete = async () => {
    try {
      if (dialogType === 'serviceProvider') {
        await deleteDoc(doc(db, 'serviceProviders', currentItem.id));
        setMessage('Service provider deleted successfully');
        fetchAllServiceProviders();
      } else if (dialogType === 'hallManager') {
        await deleteDoc(doc(db, 'hallManagers', currentItem.id));
        setMessage('Wedding hall manager deleted successfully');
        fetchAllHallManagers();
      } else if (dialogType === 'booking') {
        await deleteDoc(doc(db, 'bookings', currentItem.id));
        setMessage('Booking deleted successfully');
        fetchAllBookings();
      }
      setOpenDeleteDialog(false);
    } catch (error) {
      setMessage(`Error deleting ${dialogType}`);
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setOpenDeleteDialog(false);
    setCurrentItem(null);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // Clear any session storage or local storage if needed
      sessionStorage.removeItem('adminId');
      sessionStorage.removeItem('userType');
      // Dispatch custom event to update UI
      window.dispatchEvent(new Event('userLogout'));
      navigate('/admin/login');
    } catch (error) {
      setMessage('Error logging out');
      console.error(error);
    }
  };

  const TabPanel = (props) => {
    const { children, value, index, ...other } = props;
    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        {...other}
      >
        {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
      </div>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 0 }}>
          Admin Dashboard
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
        <Alert severity="info" sx={{ mb: 2 }}>
          {message}
        </Alert>
      )}
      
      <Paper sx={{ width: '100%', mb: 2 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="Pending Service Providers" />
          <Tab label="Pending Wedding Hall Managers" />
          <Tab label="Pending Bookings" />
          <Tab label="All Service Providers" />
          <Tab label="All Wedding Hall Managers" />
          <Tab label="All Bookings" />
        </Tabs>
      </Paper>

      {/* Pending Service Providers */}
      <TabPanel value={tabValue} index={0}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Services</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {serviceProviders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No pending service provider requests
                  </TableCell>
                </TableRow>
              ) : (
                serviceProviders.map((provider) => (
                  <TableRow key={provider.id}>
                    <TableCell>{provider.name}</TableCell>
                    <TableCell>{provider.email}</TableCell>
                    <TableCell>{provider.services ? provider.services.join(', ') : 'No services listed'}</TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        color="success"
                        onClick={() => handleProviderApproval(provider.id, 'approved')}
                        sx={{ mr: 1 }}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        onClick={() => handleProviderApproval(provider.id, 'rejected')}
                      >
                        Reject
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Pending Wedding Hall Managers */}
      <TabPanel value={tabValue} index={1}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Manager Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Hall Name</TableCell>
                <TableCell>Hall Address</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {hallManagers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No pending wedding hall manager requests
                  </TableCell>
                </TableRow>
              ) : (
                hallManagers.map((manager) => (
                  <TableRow key={manager.id}>
                    <TableCell>{manager.name}</TableCell>
                    <TableCell>{manager.email}</TableCell>
                    <TableCell>{manager.hallName}</TableCell>
                    <TableCell>{manager.hallAddress}</TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        color="success"
                        onClick={() => handleHallManagerApproval(manager.id, 'approved')}
                        sx={{ mr: 1 }}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        onClick={() => handleHallManagerApproval(manager.id, 'rejected')}
                      >
                        Reject
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Pending Bookings */}
      <TabPanel value={tabValue} index={2}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Tracking ID</TableCell>
                <TableCell>Service Type</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {bookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No pending booking requests
                  </TableCell>
                </TableRow>
              ) : (
                bookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell>{booking.trackingId || "N/A"}</TableCell>
                    <TableCell>{booking.serviceType || booking.type}</TableCell>
                    <TableCell>{booking.date}</TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        color="success"
                        onClick={() => handleBookingApproval(booking.id, 'approved')}
                        sx={{ mr: 1 }}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        onClick={() => handleBookingApproval(booking.id, 'rejected')}
                      >
                        Reject
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* All Service Providers */}
      <TabPanel value={tabValue} index={3}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Services</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {allServiceProviders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No service providers found
                  </TableCell>
                </TableRow>
              ) : (
                allServiceProviders.map((provider) => (
                  <TableRow key={provider.id}>
                    <TableCell>{provider.name}</TableCell>
                    <TableCell>{provider.email}</TableCell>
                    <TableCell>{provider.services?.join(', ') || 'No services listed'}</TableCell>
                    <TableCell>
                      <Chip
                        label={provider.status}
                        color={
                          provider.status === 'approved'
                            ? 'success'
                            : provider.status === 'rejected'
                            ? 'error'
                            : 'warning'
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        color="primary"
                        onClick={() => handleViewDetails(provider, 'serviceProvider')}
                        size="small"
                      >
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton
                        color="secondary"
                        onClick={() => handleViewDetails(provider, 'serviceProvider')}
                        size="small"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(provider, 'serviceProvider')}
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* All Wedding Hall Managers */}
      <TabPanel value={tabValue} index={4}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Manager Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Hall Name</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {allHallManagers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No wedding hall managers found
                  </TableCell>
                </TableRow>
              ) : (
                allHallManagers.map((manager) => (
                  <TableRow key={manager.id}>
                    <TableCell>{manager.name}</TableCell>
                    <TableCell>{manager.email}</TableCell>
                    <TableCell>{manager.hallName}</TableCell>
                    <TableCell>
                      <Chip
                        label={manager.status}
                        color={
                          manager.status === 'approved'
                            ? 'success'
                            : manager.status === 'rejected'
                            ? 'error'
                            : 'warning'
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        color="primary"
                        onClick={() => handleViewDetails(manager, 'hallManager')}
                        size="small"
                      >
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton
                        color="secondary"
                        onClick={() => handleViewDetails(manager, 'hallManager')}
                        size="small"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(manager, 'hallManager')}
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* All Bookings */}
      <TabPanel value={tabValue} index={5}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Tracking ID</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {allBookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No bookings found
                  </TableCell>
                </TableRow>
              ) : (
                allBookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell>{booking.trackingId || "N/A"}</TableCell>
                    <TableCell>{booking.serviceType || booking.type}</TableCell>
                    <TableCell>{booking.date}</TableCell>
                    <TableCell>
                      <Chip
                        label={booking.status}
                        color={
                          booking.status === 'approved'
                            ? 'success'
                            : booking.status === 'rejected'
                            ? 'error'
                            : 'warning'
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        color="primary"
                        onClick={() => handleViewDetails(booking, 'booking')}
                        size="small"
                      >
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton
                        color="secondary"
                        onClick={() => handleViewDetails(booking, 'booking')}
                        size="small"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(booking, 'booking')}
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Edit/View Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {currentItem
            ? `${dialogType === 'serviceProvider' 
                ? 'Service Provider' 
                : dialogType === 'hallManager'
                ? 'Wedding Hall Manager'
                : 'Booking'} Details`
            : ''}
        </DialogTitle>
        <DialogContent>
          {currentItem && dialogType === 'serviceProvider' && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Name"
                  name="name"
                  value={editFormData.name || ''}
                  onChange={handleEditChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  value={editFormData.email || ''}
                  onChange={handleEditChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  name="phone"
                  value={editFormData.phone || ''}
                  onChange={handleEditChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Services"
                  name="services"
                  value={editFormData.services?.join(', ') || ''}
                  onChange={e => {
                    const services = e.target.value.split(',').map(s => s.trim()).filter(s => s);
                    handleEditChange({
                      target: {
                        name: 'services',
                        value: services
                      }
                    });
                  }}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Status"
                  name="status"
                  value={editFormData.status || 'pending'}
                  onChange={handleEditChange}
                  SelectProps={{
                    native: true,
                  }}
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </TextField>
              </Grid>
            </Grid>
          )}

          {currentItem && dialogType === 'hallManager' && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Name"
                  name="name"
                  value={editFormData.name || ''}
                  onChange={handleEditChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  value={editFormData.email || ''}
                  onChange={handleEditChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Hall Name"
                  name="hallName"
                  value={editFormData.hallName || ''}
                  onChange={handleEditChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Hall Address"
                  name="hallAddress"
                  value={editFormData.hallAddress || ''}
                  onChange={handleEditChange}
                  multiline
                  rows={2}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Hall Description"
                  name="hallDescription"
                  value={editFormData.hallDescription || ''}
                  onChange={handleEditChange}
                  multiline
                  rows={3}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Capacity"
                  name="hallCapacity"
                  type="number"
                  value={editFormData.hallCapacity || ''}
                  onChange={handleEditChange}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Price"
                  name="hallPrice"
                  type="number"
                  value={editFormData.hallPrice || ''}
                  onChange={handleEditChange}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Phone"
                  name="hallPhone"
                  value={editFormData.hallPhone || ''}
                  onChange={handleEditChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Status"
                  name="status"
                  value={editFormData.status || 'pending'}
                  onChange={handleEditChange}
                  SelectProps={{
                    native: true,
                  }}
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </TextField>
              </Grid>
              {editFormData.images && editFormData.images.length > 0 && (
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    Hall Images:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {editFormData.images.map((image, index) => (
                      <Box
                        key={index}
                        component="img"
                        src={image}
                        sx={{
                          width: 100,
                          height: 100,
                          objectFit: 'cover',
                          borderRadius: 1,
                        }}
                      />
                    ))}
                  </Box>
                </Grid>
              )}
            </Grid>
          )}

          {currentItem && dialogType === 'booking' && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Tracking ID"
                  name="trackingId"
                  value={editFormData.trackingId || ''}
                  onChange={handleEditChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Customer Name"
                  name="customerName"
                  value={editFormData.customerName || ''}
                  onChange={handleEditChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  value={editFormData.email || ''}
                  onChange={handleEditChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  name="phone"
                  value={editFormData.phone || ''}
                  onChange={handleEditChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Date"
                  name="date"
                  type="date"
                  value={editFormData.date || ''}
                  onChange={handleEditChange}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Status"
                  name="status"
                  value={editFormData.status || 'pending'}
                  onChange={handleEditChange}
                  SelectProps={{
                    native: true,
                  }}
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </TextField>
              </Grid>
              {editFormData.type && (
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Booking Type"
                    value={editFormData.type}
                    InputProps={{
                      readOnly: true,
                    }}
                  />
                </Grid>
              )}
              {editFormData.hallName && (
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Hall Name"
                    value={editFormData.hallName}
                    InputProps={{
                      readOnly: true,
                    }}
                  />
                </Grid>
              )}
              {editFormData.guestCount && (
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Guest Count"
                    value={editFormData.guestCount}
                    InputProps={{
                      readOnly: true,
                    }}
                  />
                </Grid>
              )}
              {editFormData.additionalRequirements && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Additional Requirements"
                    value={editFormData.additionalRequirements}
                    multiline
                    rows={2}
                    InputProps={{
                      readOnly: true,
                    }}
                  />
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={() => {
              if (dialogType === 'serviceProvider') {
                handleEditServiceProvider();
              } else if (dialogType === 'hallManager') {
                handleEditHallManager();
              } else if (dialogType === 'booking') {
                handleEditBooking();
              }
            }}
            variant="contained"
            color="primary"
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDialog}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this {dialogType}?
            {dialogType === 'serviceProvider' && currentItem?.name && ` (${currentItem.name})`}
            {dialogType === 'hallManager' && currentItem?.hallName && ` (${currentItem.hallName})`}
            {dialogType === 'booking' && currentItem?.trackingId && ` (${currentItem.trackingId})`}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={confirmDelete} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminDashboard; 