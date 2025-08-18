// src/pages/RideDetailPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Container, Typography, Button, Card, CardContent, Box, CircularProgress, List, ListItem, ListItemText, Divider } from '@mui/material';
import { useNotification } from '../context/NotificationContext';

const RideDetailPage = ({ session }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ride, setRide] = useState(null);
  const [passengers, setPassengers] = useState([]);
  const [creator, setCreator] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const { showNotification } = useNotification();

  const fetchRideDetails = useCallback(async () => {
    // No setLoading here so it can be called silently for a refresh
    try {
      const { data, error } = await supabase
        .from('rides')
        .select(`
          *,
          creator:profiles (id, full_name), 
          passengers:ride_passengers (user_id, profiles (id, full_name))
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setRide(data);
      setCreator(data.creator);
      setPassengers(data.passengers.map(p => p.profiles));
    } catch (error) {
      console.error('Error fetching ride details:', error.message);
      showNotification('Could not find the requested ride.', 'error');
      navigate('/');
    } finally {
      setLoading(false);
    }
  }, [id, navigate, showNotification]);

  useEffect(() => {
    fetchRideDetails();
  }, [fetchRideDetails]);

  const handleJoinRide = async () => {
    if (!session) {
      showNotification('You must be logged in to join a ride.', 'warning');
      navigate('/login');
      return;
    }
    
    // ... (rest of the checks)

    setIsJoining(true);
    try {
      const { error: joinError } = await supabase
        .from('ride_passengers')
        .insert([{ ride_id: ride.id, user_id: session.user.id }]);
      if (joinError) throw joinError;

      const newSeatCount = ride.seats_available - 1;
      const { error: updateError } = await supabase
        .from('rides')
        .update({ seats_available: newSeatCount })
        .eq('id', ride.id);
      if (updateError) throw updateError;
      
      showNotification('You have successfully joined the ride!', 'success');
      
      // --- FIX: Re-fetch the data to ensure the UI is perfectly in sync ---
      fetchRideDetails();

    } catch (error) {
      showNotification('Failed to join ride: ' + error.message, 'error');
    } finally {
      setIsJoining(false);
    }
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  }
  if (!ride) {
    return <Typography>Ride not found.</Typography>;
  }

  const alreadyJoined = session ? passengers.some(p => p.id === session.user.id) : false;
  const canJoin = session && session.user.id !== creator.id && ride.seats_available > 0 && !alreadyJoined;

  return (
    <Container maxWidth="md">
      <Card sx={{ mt: 4 }}>
        <CardContent>
          <Typography variant="h4" component="h1" gutterBottom>
            Ride from {ride.from_display || ride.from} to {ride.to_display || ride.to}
          </Typography>

          {/* --- FIX #1: Use creator's full_name --- */}
          {creator && <Typography variant="subtitle1">Created by: {creator.full_name || 'A user'}</Typography>}
          
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Departure: {new Date(ride.departure_time).toLocaleString()}
          </Typography>
          {/* ... (rest of ride info) ... */}
          
          <Divider sx={{ my: 3 }} />

          <Typography variant="h6">Passengers ({passengers.length})</Typography>
          {passengers.length > 0 ? (
            <List>
              {passengers.map(passenger => (
                <ListItem key={passenger.id}>
                  {/* --- FIX #2: Use passenger's full_name --- */}
                  <ListItemText primary={passenger.full_name || 'A user'} />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography variant="body2" color="text.secondary">No passengers have joined yet.</Typography>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default RideDetailPage;