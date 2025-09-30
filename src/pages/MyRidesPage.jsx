// src/pages/MyRidesPage.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Container, Typography, Box, Grid, Card, CardContent, CardHeader, CircularProgress, Button } from '@mui/material';
import { useNotification } from '../context/NotificationContext';
import RideCard from '../components/RideCard';

const MyRidesPage = ({ session }) => {
  const navigate = useNavigate();
  const [createdRides, setCreatedRides] = useState([]);
  const [joinedRides, setJoinedRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showNotification } = useNotification();

  useEffect(() => {
    if (!session) {
      navigate('/login');
      return;
    }
    const fetchMyRides = async () => {
      setLoading(true);
      const userId = session.user.id;
      const { data: createdData, error: createdError } = await supabase.from('rides').select('*').eq('creator_id', userId);
      const { data: joinedData, error: joinedError } = await supabase.from('ride_passengers').select('rides(*)').eq('user_id', userId).eq('status', 'approved');

      if (createdError || joinedError) {
        console.error('Error fetching my rides:', createdError || joinedError);
      } else {
        setCreatedRides(createdData);
        setJoinedRides(joinedData.map(item => item.rides));
      }
      setLoading(false);
    };
    fetchMyRides();
  }, [session, navigate]);

  const handleDelete = async (rideId) => {
    if (window.confirm('Are you sure you want to delete this ride?')) {
      try {
        await supabase.from('rides').delete().eq('id', rideId);
        setCreatedRides(createdRides.filter(ride => ride.id !== rideId));
      } catch (error) {
        showNotification('Error deleting ride: ' + error.message, 'error');
      }
    }
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  }

  const cardStyles = {
    borderRadius: 4,
    border: '1px solid rgba(255, 255, 255, 0.5)',
    bgcolor: 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(4px)',
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Card sx={cardStyles}>
          {/* FIX: The 'action' prop is now correctly placed inside the CardHeader tag */}
          <CardHeader
            title={<Typography variant="h5" component="h1" sx={{ fontWeight: 'bold' }}>Rides I've Created</Typography>}
            action={
              <Button component={RouterLink} to="/create" variant="contained">
                Create New Ride
              </Button>
            }
          />
          <CardContent>
            {createdRides.length > 0 ? (
              <Grid container spacing={2}>
                {createdRides.map(ride => (
                  <Grid item xs={12} sm={6} md={4} key={ride.id}>
                    <RideCard ride={ride} isCreator={true} onDelete={handleDelete} />
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Typography sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>You haven't created any rides yet.</Typography>
            )}
          </CardContent>
        </Card>
      </Box>

      <Box>
        <Card sx={cardStyles}>
          <CardHeader title={<Typography variant="h5" component="h1" sx={{ fontWeight: 'bold' }}>Rides I've Joined</Typography>} />
          <CardContent>
            {joinedRides.length > 0 ? (
              <Grid container spacing={2}>
                {joinedRides.map(ride => (
                  <Grid item xs={12} sm={6} md={4} key={ride.id}>
                    <RideCard ride={ride} />
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Typography sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>You haven't joined any rides yet.</Typography>
            )}
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default MyRidesPage;