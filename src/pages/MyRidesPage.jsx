// src/pages/MyRidesPage.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Container, Typography, Box, Grid, Card, CardContent, CardActions, Button, CircularProgress, Divider } from '@mui/material';

const RideCard = ({ ride, isCreator, onDelete }) => (
  <Grid item xs={12} sm={6} md={4}>
    <Card>
      <CardContent>
        <Typography variant="h5" component="div">
          {(ride.from_display || ride.from)} to {(ride.to_display || ride.to)}
        </Typography>
        <Typography sx={{ mb: 1.5 }} color="text.secondary">
          {new Date(ride.departure_time).toLocaleString()}
        </Typography>
        <Typography variant="body2">
          Seats Available: {ride.seats_available}
        </Typography>
      </CardContent>
      <CardActions>
        <Button size="small" component={RouterLink} to={`/ride/${ride.id}`}>View Details</Button>
        {isCreator && (
          <Button size="small" color="error" onClick={() => onDelete(ride.id)}>
            Delete
          </Button>
        )}
      </CardActions>
    </Card>
  </Grid>
);

const MyRidesPage = ({ session }) => {
  const navigate = useNavigate();
  const [createdRides, setCreatedRides] = useState([]);
  const [joinedRides, setJoinedRides] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) {
      navigate('/login');
      return;
    }

    const fetchMyRides = async () => {
      setLoading(true);
      const userId = session.user.id;

      // Fetch rides created by the user
      const { data: createdData, error: createdError } = await supabase
        .from('rides')
        .select('*')
        .eq('creator_id', userId);
      
      // Fetch rides joined by the user
      // This query first finds the user in ride_passengers, then fetches the associated ride details
      const { data: joinedData, error: joinedError } = await supabase
        .from('ride_passengers')
        .select('rides(*)') // The magic is here: fetch all columns from the related 'rides' table
        .eq('user_id', userId);

      if (createdError || joinedError) {
        console.error('Error fetching my rides:', createdError || joinedError);
      } else {
        setCreatedRides(createdData);
        // The data structure is { rides: { ... } }, so we need to map over it
        setJoinedRides(joinedData.map(item => item.rides));
      }
      setLoading(false);
    };

    fetchMyRides();
  }, [session, navigate]);

  const handleDelete = async (rideId) => {
    if (window.confirm('Are you sure you want to delete this ride?')) {
      try {
        const { error } = await supabase.from('rides').delete().eq('id', rideId);
        if (error) throw error;
        // Remove the deleted ride from the state to update the UI instantly
        setCreatedRides(createdRides.filter(ride => ride.id !== rideId));
      } catch (error) {
        alert('Error deleting ride: ' + error.message);
      }
    }
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  }

  return (
    <Container>
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Rides I've Created
        </Typography>
        <Grid container spacing={2}>
          {createdRides.length > 0 ? (
            createdRides.map(ride => (
              <RideCard key={ride.id} ride={ride} isCreator={true} onDelete={handleDelete} />
            ))
          ) : (
            <Typography sx={{ ml: 2 }}>You haven't created any rides yet.</Typography>
          )}
        </Grid>
      </Box>

      <Divider sx={{ my: 4 }} />

      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Rides I've Joined
        </Typography>
        <Grid container spacing={2}>
          {joinedRides.length > 0 ? (
            joinedRides.map(ride => (
              <RideCard key={ride.id} ride={ride} isCreator={false} />
            ))
          ) : (
            <Typography sx={{ ml: 2 }}>You haven't joined any rides yet.</Typography>
          )}
        </Grid>
      </Box>
    </Container>
  );
};

export default MyRidesPage;