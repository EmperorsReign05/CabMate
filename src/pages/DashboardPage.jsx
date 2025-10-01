// src/pages/DashboardPage.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Container, Typography, Box, Grid, Card, CardContent, Button, CircularProgress } from '@mui/material';
import { Add, DirectionsCar, People, Event, TrendingUp } from '@mui/icons-material';
import RideCard from '../components/RideCard';
import { useNotification } from '../context/NotificationContext';

const StatCard = ({ title, value, icon }) => (
  <Card>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Box sx={{ p: 1.5, bgcolor: 'rgba(173, 87, 193, 0.15)', borderRadius: '50%', display: 'flex', mr: 2 }}>
          {icon}
        </Box>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{value}</Typography>
          <Typography variant="body2" color="text.secondary">{title}</Typography>
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const DashboardPage = ({ session }) => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [stats, setStats] = useState({ created: 0, joined: 0, upcoming: 0, total: 0 });
  const [upcomingRides, setUpcomingRides] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      console.log('--- STARTING DASHBOARD FETCH ---');
      setLoading(true);
      const userId = session.user.id;
      
      try {
        // --- QUERY 1: PROFILES ---
        console.log('1. Fetching profile...');
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', userId)
          .single();
        console.log('Profile Result:', { profileData, profileError });
        if (profileError && profileError.code !== 'PGRST116') throw profileError;
        if (profileData) setProfile(profileData);

        // --- QUERY 2: CREATED RIDES ---
        console.log('2. Fetching created rides...');
        const { data: created, error: createdError } = await supabase.from('rides').select('id, departure_time').eq('creator_id', userId);
        console.log('Created Rides Result:', { created, createdError });
        if (createdError) throw createdError;

        // --- QUERY 3: JOINED RIDES ---
        console.log('3. Fetching joined rides...');
        const { data: joined, error: joinedError } = await supabase.from('ride_passengers').select('rides(id, departure_time)').eq('user_id', userId).eq('status', 'approved');
        console.log('Joined Rides Result:', { joined, joinedError });
        if (joinedError) throw joinedError;
        
        // --- QUERY 4: TOTAL RIDES COUNT ---
        console.log('4. Fetching total rides count...');
        const { count: total, error: totalError } = await supabase.from('rides').select('*', { count: 'exact', head: true });
        console.log('Total Rides Result:', { total, totalError });
        if (totalError) throw totalError;

        // --- PROCESSING DATA ---
        console.log('All queries successful. Processing data...');
        const allUserRides = [
          ...(created || []),
          ...(joined?.map(j => j.rides) || [])
        ];
        
        const upcoming = allUserRides.filter(ride => new Date(ride.departure_time) > new Date());
        
        setStats({
          created: created?.length || 0,
          joined: joined?.length || 0,
          upcoming: upcoming.length,
          total: total || 0,
        });

        const upcomingRideIds = upcoming.map(r => r.id).slice(0, 3);
        if (upcomingRideIds.length > 0) {
            const { data: upcomingDetails, error: upcomingError } = await supabase.from('rides').select('*').in('id', upcomingRideIds);
            if (upcomingError) throw upcomingError;
            if (upcomingDetails) setUpcomingRides(upcomingDetails);
        }

      } catch (error) {
        console.error('--- DASHBOARD FETCH FAILED ---');
        console.error('The operation failed at this error:', error);
        showNotification(`Error fetching dashboard data: ${error.message}`, 'error');
      } finally {
        console.log('--- FINISHING DASHBOARD FETCH ---');
        setLoading(false);
      }
    };

    fetchData();
  }, [session, navigate, showNotification]);

  // The JSX part of the component remains the same...
  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  }
  
  const welcomeName = profile?.full_name ? profile.full_name.split(" ")[0] : "User";

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>Welcome back, {welcomeName}!</Typography>
          <Typography color="text.secondary">Here's what's happening with your rides.</Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} component={RouterLink} to="/create" sx={{backgroundColor: '#ad57c1ff', // A deep purple color
              '&:hover': {
                backgroundColor: '#4A148C', // A slightly darker purple for hover
              },}}>
          Create New Ride
        </Button>
      </Box>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}><StatCard title="Rides Created" value={stats.created} icon={<DirectionsCar sx={{ color: '#ad57c1ff' }} />} /></Grid>
        <Grid item xs={12} sm={6} md={3}><StatCard title="Rides Joined" value={stats.joined} icon={<People sx={{ color: '#ad57c1ff' }} />} /></Grid>
        <Grid item xs={12} sm={6} md={3}><StatCard title="Upcoming" value={stats.upcoming} icon={<Event sx={{ color: '#ad57c1ff' }} />} /></Grid>
        <Grid item xs={12} sm={6} md={3}><StatCard title="Total Rides" value={stats.total} icon={<TrendingUp sx={{ color: '#ad57c1ff' }} />} /></Grid>
      </Grid>
      <Card sx={{my: 4, 
          p: 3, // Increased padding
          borderRadius: 4, // More rounded corners
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)', // A modern shadow
          backdropFilter: 'blur(4px)',
          border: '1px solid rgba(255, 255, 255, 0.18)',
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.1))'}}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2  }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Upcoming Rides</Typography>
            <Button component={RouterLink} to="/my-rides" variant="contained" sx={{backgroundColor: '#ad57c1ff', '&:hover': { backgroundColor: '#4A148C' }}}>View All</Button>
        </Box>
        <CardContent>
            {upcomingRides.length > 0 ? (
                <Grid container spacing={2}>
                    {upcomingRides.map(ride => (
                        <Grid item xs={12} md={4} key={ride.id}><RideCard ride={ride} /></Grid>
                    ))}
                </Grid>
            ) : (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                    <Typography color="text.secondary" sx={{ mb: 2 }}>No upcoming rides</Typography>
                    <Button variant="contained" component={RouterLink} to="/create" sx={{backgroundColor: '#ad57c1ff', '&:hover': { backgroundColor: '#4A148C' }}}>Create Your First Ride</Button>
                </Box>
            )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default DashboardPage;