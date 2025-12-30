import React, { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
// import { supabase } from '../supabaseClient'; // No longer needed for data
import { Container, Typography, Box, Grid, Card, CardContent, Button, CircularProgress } from '@mui/material';
import { Add, DirectionsCar, People, Event, TrendingUp } from '@mui/icons-material';
import RideCard from '../components/RideCard';
import { useNotification } from '../context/NotificationContext';

const API_BASE = "http://127.0.0.1:8000";

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
      setLoading(true);
      const userId = session.user.id;
      
      try {
        // 1. Fetch Profile
        const profileRes = await fetch(`${API_BASE}/profiles/${userId}`);
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setProfile(profileData);
        }

        // 2. Fetch User Rides (Created & Joined)
        // Note: You must add this endpoint to rides.py (see below)
        const ridesRes = await fetch(`${API_BASE}/rides/user/${userId}`);
        if (!ridesRes.ok) throw new Error("Failed to fetch user rides");
        const ridesData = await ridesRes.json();
        
        // 3. Fetch Global Stats
        const statsRes = await fetch(`${API_BASE}/rides/stats/total`);
        if (!statsRes.ok) throw new Error("Failed to fetch stats");
        const statsData = await statsRes.json();

        // Process Data
        const created = ridesData.created || [];
        const joined = ridesData.joined || [];
        const allMyRides = [...created, ...joined];
        
        // Filter upcoming
        const upcoming = allMyRides.filter(ride => new Date(ride.departure_time) > new Date());
        
        // Sort by date (nearest first)
        upcoming.sort((a, b) => new Date(a.departure_time) - new Date(b.departure_time));

        setStats({
          created: created.length,
          joined: joined.length,
          upcoming: upcoming.length,
          total: statsData.count || 0,
        });

        setUpcomingRides(upcoming.slice(0, 3));

      } catch (error) {
        console.error('Dashboard fetch failed:', error);
        showNotification(`Error loading dashboard: ${error.message}`, 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session, navigate, showNotification]);

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
        <Button variant="contained" startIcon={<Add />} component={RouterLink} to="/create" sx={{backgroundColor: '#ad57c1ff', '&:hover': { backgroundColor: '#4A148C' }}}>
          Create New Ride
        </Button>
      </Box>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}><StatCard title="Rides Created" value={stats.created} icon={<DirectionsCar sx={{ color: '#ad57c1ff' }} />} /></Grid>
        <Grid item xs={12} sm={6} md={3}><StatCard title="Rides Joined" value={stats.joined} icon={<People sx={{ color: '#ad57c1ff' }} />} /></Grid>
        <Grid item xs={12} sm={6} md={3}><StatCard title="Upcoming" value={stats.upcoming} icon={<Event sx={{ color: '#ad57c1ff' }} />} /></Grid>
        <Grid item xs={12} sm={6} md={3}><StatCard title="Total Rides" value={stats.total} icon={<TrendingUp sx={{ color: '#ad57c1ff' }} />} /></Grid>
      </Grid>
      <Card sx={{my: 4, p: 3, borderRadius: 4, boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)', backdropFilter: 'blur(4px)', border: '1px solid rgba(255, 255, 255, 0.18)', background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.1))'}}>
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