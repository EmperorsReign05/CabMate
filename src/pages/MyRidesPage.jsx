
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Container, Typography, Box, Grid, Card, CardContent, CardHeader, CircularProgress, Divider } from '@mui/material';
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

      // Fetch rides created by the user
      const { data: createdData, error: createdError } = await supabase
        .from('rides')
        .select('*')
        .eq('creator_id', userId);
      
      // Fetch rides joined by the user
      const { data: joinedData, error: joinedError } = await supabase
        .from('ride_passengers')
        .select('rides(*)')
        .eq('user_id', userId)
        .eq('status', 'approved'); // Only show approved rides

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
        const { error } = await supabase.from('rides').delete().eq('id', rideId);
        if (error) throw error;
        setCreatedRides(createdRides.filter(ride => ride.id !== rideId));
      } catch (error) {
        showNotification('Error deleting ride: ' + error.message);
      }
    }
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Card>
          <CardHeader title={<Typography variant="h5" component="h1" sx={{ fontWeight: 'bold' }}>Rides I've Created</Typography>} />
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
        <Card>
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