// src/pages/CreateRidePage.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useJsApiLoader } from '@react-google-maps/api';
import LocationAutocomplete from '../components/LocationAutocomplete'; 
import { Container, Box, TextField, Button, Typography, CircularProgress } from '@mui/material';

const libraries = ['places'];

const CreateRidePage = ({ session }) => {
  const navigate = useNavigate();
  // State now holds address and coordinates
  const [from, setFrom] = useState(null);
  const [to, setTo] = useState(null);
  const [rideDetails, setRideDetails] = useState({ departure_time: '', seats_available: 1, cost_per_seat: 0 });
  const [loading, setLoading] = useState(false);

  // Load the Google Maps script
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  // Redirect if not logged in
  useEffect(() => { if (!session) navigate('/'); }, [session, navigate]);

  const handleChange = (e) => {
    setRideDetails({ ...rideDetails, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!from || !to) {
      alert("Please select 'From' and 'To' locations.");
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.from('rides').insert([
        {
          from: from.address,
          from_display: from.shortName,
          from_lat: from.lat,
          from_lng: from.lng,
          to: to.address,
          to_display: to.shortName,
          to_lat: to.lat,
          to_lng: to.lng,
          departure_time: rideDetails.departure_time,
          seats_available: parseInt(rideDetails.seats_available),
          cost_per_seat: parseFloat(rideDetails.cost_per_seat),
          creator_id: session.user.id,
        },
      ]);
      if (error) throw error;
      alert('Ride created successfully!');
      navigate('/');
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded) return <CircularProgress />;

  return (
    <Container maxWidth="sm">
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Create a New Ride
        </Typography>
        
        {/* Replace TextFields with Autocomplete */}
        <Box sx={{ mb: 2 }}>
          <LocationAutocomplete label="From" onPlaceSelect={setFrom} />
        </Box>
        <Box sx={{ mb: 2 }}>
          <LocationAutocomplete label="To" onPlaceSelect={setTo} />
        </Box>

        <TextField name="departure_time" label="Departure Time" type="datetime-local" value={rideDetails.departure_time} onChange={handleChange} fullWidth required margin="normal" InputLabelProps={{ shrink: true }} />
        <TextField name="seats_available" label="Seats Available" type="number" value={rideDetails.seats_available} onChange={handleChange} fullWidth required margin="normal" />
        <TextField name="cost_per_seat" label="Cost per Seat (₹)" type="number" value={rideDetails.cost_per_seat} onChange={handleChange} fullWidth margin="normal" />
        <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }} disabled={loading}>
          {loading ? 'Creating...' : 'Create Ride'}
        </Button>
      </Box>
    </Container>
  );
};

export default CreateRidePage;