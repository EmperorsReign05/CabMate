// src/pages/RideDetailPage.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Container, Typography, Button, Card, CardContent, Box, CircularProgress, List, ListItem, ListItemText, Divider } from '@mui/material';

const RideDetailPage = ({ session }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ride, setRide] = useState(null);
  const [passengers, setPassengers] = useState([]);
  const [creator, setCreator] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    const fetchRideDetails = async () => {
      setLoading(true);
      try {
        // This is an advanced query that fetches the ride, its creator's profile,
        // and a list of passengers with their profiles, all in one go.
        const { data, error } = await supabase
          .from('rides')
          .select(`
            *,
            creator:profiles (id, email:raw_user_meta_data->'email'),
            passengers:ride_passengers (user_id, profiles (id, email:raw_user_meta_data->'email'))
          `)
          .eq('id', id)
          .single();

        if (error) throw error;

        setRide(data);
        setCreator(data.creator);
        setPassengers(data.passengers.map(p => p.profiles));

      } catch (error) {
        console.error('Error fetching ride details:', error.message);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchRideDetails();
  }, [id, navigate]);

  // handleJoinRide function remains the same as before...
  const handleJoinRide = async () => {
    if (!session) {
      alert('You must be logged in to join a ride.');
      navigate('/login');
      return;
    }

    // Check if user has already joined
    const alreadyJoined = passengers.some(p => p.id === session.user.id);
    if (alreadyJoined) {
      alert("You have already joined this ride.");
      return;
    }

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

      alert('You have successfully joined the ride!');
      // Manually update the state to reflect the changes immediately
      setRide({ ...ride, seats_available: newSeatCount });
      setPassengers([...passengers, {id: session.user.id, email: session.user.email}]);

    } catch (error) {
      alert('Failed to join ride: ' + error.message);
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
  const canJoin = session && session.user.id !== ride.creator_id && ride.seats_available > 0 && !alreadyJoined;

  return (
    <Container maxWidth="md">
      <Card sx={{ mt: 4 }}>
        <CardContent>
          {/* Ride Info Section */}
          <Typography variant="h4" component="h1" gutterBottom>
            Ride from {ride.from} to {ride.to}
          </Typography>
          {creator && <Typography variant="subtitle1">Created by: {creator.email}</Typography>}
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Departure: {new Date(ride.departure_time).toLocaleString()}
          </Typography>
          <Typography variant="body1" sx={{ mt: 2 }}>
            Seats Available: <strong>{ride.seats_available}</strong>
          </Typography>
          <Typography variant="h5" sx={{ mt: 1, mb: 3 }}>
            Price: <strong>₹{ride.cost_per_seat}</strong> per seat
          </Typography>

          {/* Action Button Section */}
          {canJoin && (
            <Button variant="contained" color="primary" onClick={handleJoinRide} disabled={isJoining}>
              {isJoining ? 'Joining...' : 'Join Ride'}
            </Button>
          )}
          {session && session.user.id === ride.creator_id && (
            <Typography variant="body2" color="text.secondary">You are the creator of this ride.</Typography>
          )}
          {ride.seats_available === 0 && !alreadyJoined && (
            <Typography variant="body2" color="error">This ride is full.</Typography>
          )}
          {alreadyJoined && (
            <Typography variant="body2" color="success.main">You have joined this ride.</Typography>
          )}

          <Divider sx={{ my: 3 }} />

          {/* Passengers List Section */}
          <Typography variant="h6">Passengers ({passengers.length})</Typography>
          {passengers.length > 0 ? (
            <List>
              {passengers.map(passenger => (
                <ListItem key={passenger.id}>
                  <ListItemText primary={passenger.email} />
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