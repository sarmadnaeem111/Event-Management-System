import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  ImageList,
  ImageListItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebase';
import weddingHallImage from '../../wedding_hall.jpg';
import DarkModeToggle from '../../components/DarkModeToggle';

const CustomerDashboard = () => {
  const [weddingHalls, setWeddingHalls] = useState([]);
  const [serviceProviders, setServiceProviders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [openBookingDialog, setOpenBookingDialog] = useState(false);
  const [selectedHall, setSelectedHall] = useState(null);
  const [viewImagesDialog, setViewImagesDialog] = useState(false);
  const [hallBookings, setHallBookings] = useState([]);
  const [openProviderSlotsDialog, setOpenProviderSlotsDialog] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [providerBookings, setProviderBookings] = useState([]);

  useEffect(() => {
    fetchWeddingHalls();
    fetchServiceProviders();
  }, []);

  const fetchWeddingHalls = async () => {
    try {
      // Fetch from both weddingHalls collection (legacy) and approved hallManagers
      const legacySnapshot = await getDocs(collection(db, 'weddingHalls'));
      const legacyHalls = [];
      legacySnapshot.forEach((doc) => {
        legacyHalls.push({ id: doc.id, ...doc.data() });
      });
      
      // Fetch from hallManagers collection where status is approved
      const hallManagersQuery = query(
        collection(db, 'hallManagers'),
        where('status', '==', 'approved')
      );
      const hallManagersSnapshot = await getDocs(hallManagersQuery);
      const managerHalls = [];
      hallManagersSnapshot.forEach((doc) => {
        managerHalls.push({ 
          id: doc.id, 
          name: doc.data().hallName,
          capacity: doc.data().hallCapacity,
          price: doc.data().hallPrice,
          address: doc.data().hallAddress,
          description: doc.data().hallDescription,
          phone: doc.data().hallPhone,
          images: doc.data().images,
          hallManagerId: doc.id,
          isFromManager: true
        });
      });
      
      // Combine both sources
      setWeddingHalls([...legacyHalls, ...managerHalls]);
    } catch (error) {
      console.error('Error fetching wedding halls:', error);
    }
  };

  const fetchServiceProviders = async () => {
    try {
      const q = query(
        collection(db, 'serviceProviders'),
        where('status', '==', 'approved')
      );
      const querySnapshot = await getDocs(q);
      const providers = [];
      querySnapshot.forEach((doc) => {
        providers.push({ id: doc.id, ...doc.data() });
      });
      setServiceProviders(providers);
    } catch (error) {
      console.error('Error fetching service providers:', error);
    }
  };

  const fetchHallBookings = async (hallId, isFromManager) => {
    try {
      const q = query(
        collection(db, 'bookings'),
        where(isFromManager ? 'hallManagerId' : 'hallId', '==', hallId)
      );
      const querySnapshot = await getDocs(q);
      const bookings = [];
      querySnapshot.forEach((doc) => {
        bookings.push({ id: doc.id, ...doc.data() });
      });
      setHallBookings(bookings);
    } catch (error) {
      console.error('Error fetching hall bookings:', error);
    }
  };

  const fetchProviderBookings = async (providerId) => {
    try {
      const q = query(
        collection(db, 'bookings'),
        where('serviceProviderId', '==', providerId)
      );
      const querySnapshot = await getDocs(q);
      const bookings = [];
      querySnapshot.forEach((doc) => {
        bookings.push({ id: doc.id, ...doc.data() });
      });
      setProviderBookings(bookings);
    } catch (error) {
      console.error('Error fetching service provider bookings:', error);
    }
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleServiceChange = (event) => {
    setSelectedService(event.target.value);
  };

  const handleBookingClick = (hall) => {
    setSelectedHall(hall);
    setOpenBookingDialog(true);
    fetchHallBookings(hall.id, hall.isFromManager);
  };

  const handleCloseDialog = () => {
    setOpenBookingDialog(false);
    setSelectedHall(null);
    setHallBookings([]);
  };

  const handleViewImages = (hall) => {
    setSelectedHall(hall);
    setViewImagesDialog(true);
  };

  const handleCloseImagesDialog = () => {
    setViewImagesDialog(false);
  };

  const handleViewProviderSlots = (provider) => {
    setSelectedProvider(provider);
    setOpenProviderSlotsDialog(true);
    fetchProviderBookings(provider.id);
  };

  const handleCloseProviderSlotsDialog = () => {
    setOpenProviderSlotsDialog(false);
    setSelectedProvider(null);
    setProviderBookings([]);
  };

  const filteredHalls = weddingHalls.filter((hall) => {
    if (!hall || !hall.name) return false;
    const searchIn = hall.name || '';
    return searchIn.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const filteredProviders = serviceProviders.filter((provider) =>
    selectedService
      ? provider.services && Array.isArray(provider.services) && provider.services.includes(selectedService)
      : true
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 0 }}>
          Wedding Halls & Services
        </Typography>
        <Box>
          <DarkModeToggle type="switch" />
        </Box>
      </Box>

      {/* Search Section */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search wedding halls..."
              value={searchTerm}
              onChange={handleSearch}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Filter by Service</InputLabel>
              <Select
                value={selectedService}
                onChange={handleServiceChange}
                label="Filter by Service"
              >
                <MenuItem value="">All Services</MenuItem>
                <MenuItem value="Decoration">Decoration</MenuItem>
                <MenuItem value="Photography">Photography</MenuItem>
                <MenuItem value="Catering">Catering</MenuItem>
                <MenuItem value="Beauty Parlour">Beauty Parlour</MenuItem>
                
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Wedding Halls Section */}
      <Typography variant="h5" gutterBottom>
        Available Wedding Halls
      </Typography>
      <Grid container spacing={3} sx={{ mb: 6 }}>
        {filteredHalls.map((hall) => (
          <Grid item xs={12} sm={6} md={4} key={hall.id}>
            <Card>
              <CardMedia
                component="img"
                height="200"
                image={hall.isFromManager && hall.images && hall.images.length > 0 
                  ? hall.images[0] 
                  : (hall.image || weddingHallImage)}
                alt={hall.name}
              />
              <CardContent>
                <Typography gutterBottom variant="h6">
                  {hall.isFromManager ? hall.name : hall.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Capacity: {hall.capacity} guests
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Price: ${hall.price}/day
                </Typography>
                {hall.isFromManager && hall.address && (
                  <Typography variant="body2" color="text.secondary">
                    Address: {hall.address}
                  </Typography>
                )}
                {hall.isFromManager && hall.images && hall.images.length > 1 && (
                  <Button 
                    size="small" 
                    sx={{ mt: 1 }}
                    onClick={() => handleViewImages(hall)}
                  >
                    View All Images
                  </Button>
                )}
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  sx={{ mt: 2 }}
                  onClick={() => handleBookingClick(hall)}
                >
                  Book Now
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Service Providers Section */}
      <Typography variant="h5" gutterBottom>
        Service Providers
      </Typography>
      <Grid container spacing={3}>
        {filteredProviders.map((provider) => (
          <Grid item xs={12} sm={6} md={4} key={provider.id}>
            <Card>
              <CardContent>
                <Typography gutterBottom variant="h6">
                  {provider.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {provider.email}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {provider.phone}
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2">Services Offered:</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {provider.services && Array.isArray(provider.services) ? (
                      provider.services.map((service, index) => (
                        <Chip key={index} label={service} size="small" />
                      ))
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No services listed
                      </Typography>
                    )}
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                  <Button
                    variant="outlined"
                    color="primary"
                    sx={{ flex: 1 }}
                    onClick={() => handleViewProviderSlots(provider)}
                  >
                    View Slots
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    sx={{ flex: 1 }}
                    onClick={() => window.location.href = `/customer/book-service?providerId=${provider.id}`}
                  >
                    Book Service
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Booking Dialog */}
      <Dialog 
        open={openBookingDialog} 
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Book Wedding Hall</DialogTitle>
        <DialogContent>
          {selectedHall && (
            <Box>
              <Typography variant="h6">{selectedHall.isFromManager ? selectedHall.name : selectedHall.name}</Typography>
              <Typography>Capacity: {selectedHall.capacity} guests</Typography>
              <Typography>Price: ${selectedHall.price}/day</Typography>
              {selectedHall.isFromManager && selectedHall.description && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {selectedHall.description}
                </Typography>
              )}
              {selectedHall.isFromManager && selectedHall.phone && (
                <Typography variant="body2" sx={{ mt: 1, mb: 3 }}>
                  Contact: {selectedHall.phone}
                </Typography>
              )}

              <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
                Booking Schedule
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Customer Name</TableCell>
                      <TableCell>Event Type</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {hallBookings.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          No bookings found for this hall
                        </TableCell>
                      </TableRow>
                    ) : (
                      hallBookings.map((booking) => (
                        <TableRow key={booking.id}>
                          <TableCell>{booking.date}</TableCell>
                          <TableCell>{booking.customerName}</TableCell>
                          <TableCell>{booking.eventType}</TableCell>
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
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => {
              const url = selectedHall?.isFromManager 
                ? `/customer/book-hall?hallId=${selectedHall?.id}&isManager=true` 
                : `/customer/book-hall?hallId=${selectedHall?.id}`;
              window.location.href = url;
            }}
          >
            Proceed to Booking
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Images Dialog */}
      <Dialog 
        open={viewImagesDialog} 
        onClose={handleCloseImagesDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Hall Images</DialogTitle>
        <DialogContent>
          {selectedHall && selectedHall.images && (
            <ImageList cols={3} gap={8}>
              {selectedHall.images.map((img, index) => (
                <ImageListItem key={index}>
                  <img
                    src={img}
                    alt={`Hall view ${index + 1}`}
                    loading="lazy"
                    style={{ height: '200px', objectFit: 'cover' }}
                  />
                </ImageListItem>
              ))}
            </ImageList>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseImagesDialog}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Provider Slots Dialog */}
      <Dialog 
        open={openProviderSlotsDialog} 
        onClose={handleCloseProviderSlotsDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Provider Slots</DialogTitle>
        <DialogContent>
          {selectedProvider && (
            <Box>
              <Typography variant="h6">{selectedProvider.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedProvider.email}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedProvider.phone}
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2">Services Offered:</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {selectedProvider.services && Array.isArray(selectedProvider.services) ? (
                    selectedProvider.services.map((service, index) => (
                      <Chip key={index} label={service} size="small" />
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No services listed
                    </Typography>
                  )}
                </Box>
              </Box>
              <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
                Provider Slots
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Tracking ID</TableCell>
                      <TableCell>Service Type</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {providerBookings.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          No slots found for this provider
                        </TableCell>
                      </TableRow>
                    ) : (
                      providerBookings.map((booking) => (
                        <TableRow key={booking.id}>
                          <TableCell>{booking.date}</TableCell>
                          <TableCell>{booking.trackingId || "N/A"}</TableCell>
                          <TableCell>{booking.serviceType}</TableCell>
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
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseProviderSlotsDialog}>Close</Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => window.location.href = `/customer/book-service?providerId=${selectedProvider?.id}`}
          >
            Book Service
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CustomerDashboard; 