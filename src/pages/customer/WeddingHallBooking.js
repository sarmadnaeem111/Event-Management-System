import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  Grid,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import { collection, doc, getDoc, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';

const WeddingHallBooking = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const hallId = queryParams.get('hallId');
  const isManager = queryParams.get('isManager') === 'true';

  const [hallData, setHallData] = useState(null);
  const [bookingDate, setBookingDate] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [guestCount, setGuestCount] = useState('');
  const [eventType, setEventType] = useState('');
  const [additionalRequirements, setAdditionalRequirements] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [existingBookings, setExistingBookings] = useState([]);

  useEffect(() => {
    if (!hallId) {
      navigate('/customer/dashboard');
      return;
    }
    fetchHallData();
    fetchExistingBookings();
  }, [hallId, navigate]);

  const fetchHallData = async () => {
    try {
      const hallRef = doc(db, isManager ? 'hallManagers' : 'weddingHalls', hallId);
      const hallDoc = await getDoc(hallRef);
      if (hallDoc.exists()) {
        setHallData({ id: hallDoc.id, ...hallDoc.data() });
      } else {
        setError('Wedding hall not found');
        navigate('/customer/dashboard');
      }
    } catch (error) {
      console.error('Error fetching hall data:', error);
      setError('Error fetching hall data');
    } finally {
      setLoading(false);
    }
  };

  const fetchExistingBookings = async () => {
    try {
      const q = query(
        collection(db, 'bookings'),
        where(isManager ? 'hallManagerId' : 'hallId', '==', hallId)
      );
      const querySnapshot = await getDocs(q);
      const bookings = [];
      querySnapshot.forEach((doc) => {
        bookings.push({ id: doc.id, ...doc.data() });
      });
      setExistingBookings(bookings);
    } catch (error) {
      console.error('Error fetching existing bookings:', error);
    }
  };

  const isDateBooked = (date) => {
    if (!date) return false;
    return existingBookings.some(
      booking => 
        booking.date === date && 
        booking.status !== 'rejected'
    );
  };

  const handleDateChange = (e) => {
    const newDate = e.target.value;
    setBookingDate(newDate);
    if (isDateBooked(newDate)) {
      setError('This date is already booked');
    } else {
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!bookingDate) {
      setError('Please select a booking date');
      return;
    }

    if (isDateBooked(bookingDate)) {
      setError('This date is already booked');
      return;
    }

    try {
      const bookingData = {
        hallId: isManager ? null : hallId,
        hallManagerId: isManager ? hallId : null,
        hallName: hallData.hallName || hallData.name,
        customerName,
        email,
        phone,
        date: bookingDate,
        guestCount: parseInt(guestCount),
        eventType,
        additionalRequirements,
        status: 'pending',
        createdAt: new Date().toISOString(),
        price: hallData.hallPrice || hallData.price,
      };

      await addDoc(collection(db, 'bookings'), bookingData);
      setSuccess('Booking request submitted successfully!');
      setOpenDialog(true);
    } catch (error) {
      console.error('Error submitting booking:', error);
      setError('Error submitting booking request');
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    navigate('/customer/dashboard');
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Book Wedding Hall
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        {hallData && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6">{hallData.hallName || hallData.name}</Typography>
            <Typography>Capacity: {hallData.hallCapacity || hallData.capacity} guests</Typography>
            <Typography>Price: ${hallData.hallPrice || hallData.price}/day</Typography>
            {hallData.hallDescription && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                {hallData.hallDescription}
              </Typography>
            )}
          </Box>
        )}

        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          Existing Bookings
        </Typography>
        <TableContainer component={Paper} sx={{ mb: 4 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Event Type</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {existingBookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    No existing bookings
                  </TableCell>
                </TableRow>
              ) : (
                existingBookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell>{booking.date}</TableCell>
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

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Customer Name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Booking Date"
                type="date"
                value={bookingDate}
                onChange={handleDateChange}
                InputLabelProps={{
                  shrink: true,
                }}
                error={isDateBooked(bookingDate)}
                helperText={isDateBooked(bookingDate) ? 'Date is already booked' : ''}
                inputProps={{
                  min: new Date().toISOString().split('T')[0]
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Number of Guests"
                type="number"
                value={guestCount}
                onChange={(e) => setGuestCount(e.target.value)}
                inputProps={{ min: 1 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Event Type</InputLabel>
                <Select
                  value={eventType}
                  label="Event Type"
                  onChange={(e) => setEventType(e.target.value)}
                >
                  <MenuItem value="Wedding">Wedding</MenuItem>
                  <MenuItem value="Reception">Reception</MenuItem>
                  <MenuItem value="Engagement">Engagement</MenuItem>
                  <MenuItem value="Birthday">Birthday</MenuItem>
                  <MenuItem value="Corporate">Corporate Event</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Additional Requirements"
                multiline
                rows={4}
                value={additionalRequirements}
                onChange={(e) => setAdditionalRequirements(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={isDateBooked(bookingDate)}
              >
                Submit Booking Request
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Booking Submitted</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Your booking request has been submitted successfully. The hall manager will review your request and confirm the booking.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} variant="contained">
            Return to Dashboard
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default WeddingHallBooking; 