import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useJsApiLoader } from '@react-google-maps/api';
import LocationAutocomplete from '../components/LocationAutocomplete';
import { Container, Box, TextField, Button, Typography, CircularProgress, FormControlLabel, Checkbox, Tooltip } from '@mui/material';
import { useNotification } from '../context/NotificationContext';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

const libraries = ['places'];

const CreateRidePage = ({ session }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showNotification } = useNotification();
 const [from, setFrom] = useState(location.state?.fromLocation || null);
  const [to, setTo] = useState(location.state?.toLocation || null);

  const [rideDetails, setRideDetails] = useState({ departure_time: '', seats_available: 1, cost_per_seat: 0 });
  const [isLadiesOnly, setIsLadiesOnly] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState(null); // State for user profile

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  useEffect(() => {
    if (!session) {
      navigate('/login');
    } else {
      const fetchProfile = async () => {
        const { data, error } = await supabase
          .from('profiles')
          .select('gender')
          .eq('id', session.user.id)
          .single();
        if (data) setUserProfile(data);
      };
      fetchProfile();
    }
  }, [session, navigate]);


  const handleChange = (e) => {
    setRideDetails({ ...rideDetails, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!from || !to) {
      showNotification("Please select 'From' and 'To' locations.", 'warning');
      return;
    }
    setLoading(true);
    try {
      await supabase.from('rides').insert([
        {
          from: from.address, from_display: from.shortName, from_lat: from.lat, from_lng: from.lng,
          to: to.address, to_display: to.shortName, to_lat: to.lat, to_lng: to.lng,
          departure_time: rideDetails.departure_time,
          seats_available: parseInt(rideDetails.seats_available),
          cost_per_seat: parseFloat(rideDetails.cost_per_seat),
          creator_id: session.user.id,
          is_ladies_only: isLadiesOnly,
        },
      ]);
      showNotification('Ride created successfully!', 'success');
      navigate('/');
    } catch (error) {
      showNotification(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded || !userProfile) return <CircularProgress />;

  return (
    <Container maxWidth="sm">
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom> Create a New Ride </Typography>
        <Box sx={{ mb: 2 }}> <LocationAutocomplete label="From" onPlaceSelect={setFrom} /> </Box>
        <Box sx={{ mb: 2 }}> <LocationAutocomplete label="To" onPlaceSelect={setTo} /> </Box>
        <TextField name="departure_time" label="Departure Time" type="datetime-local" value={rideDetails.departure_time} onChange={handleChange} fullWidth required margin="normal" InputLabelProps={{ shrink: true }} />
        <TextField name="seats_available" label="Seats Available" type="number" value={rideDetails.seats_available} onChange={handleChange} fullWidth required margin="normal" />
        <TextField name="cost_per_seat" label="Cost per Seat (₹)" type="number" value={rideDetails.cost_per_seat} onChange={handleChange} fullWidth margin="normal" />
        
        {/* Only show the checkbox to female users */}
        {userProfile.gender === 'female' && (
          <>
            <FormControlLabel
              control={ <Checkbox checked={isLadiesOnly} onChange={(e) => setIsLadiesOnly(e.target.checked)} name="ladiesOnly" color="primary" /> }
              label="This is a ladies-only ride"
            />
            <Tooltip title="Only female students will be able to see and request to join this ride.">
              <InfoOutlinedIcon sx={{ ml: 1, verticalAlign: 'middle', color: 'text.secondary' }} />
            </Tooltip>
          </>
        )}

        <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }} disabled={loading}>
          {loading ? 'Creating...' : 'Create Ride'}
        </Button>
      </Box>
    </Container>
  );
};

export default CreateRidePage;