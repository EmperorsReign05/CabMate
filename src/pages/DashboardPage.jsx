import React, { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { 
  Container, Typography, Box, Grid, Button, CircularProgress, 
  Paper, Fade, IconButton 
} from '@mui/material';
import { 
  Add, DirectionsCar, People, Event, TrendingUp, ArrowForward 
} from '@mui/icons-material';
import RideCard from '../components/RideCard';
import { useNotification } from '../context/NotificationContext';

const API_BASE = "http://127.0.0.1:8000";

// Modern Stat Widget Component
const StatWidget = ({ title, value, icon, color }) => (
  <Paper
    elevation={0}
    sx={{
      p: 3,
      borderRadius: '24px',
      background: 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(255, 255, 255, 0.6)',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
      display: 'flex',
      alignItems: 'center',
      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      cursor: 'default',
      '&:hover': {
        transform: 'translateY(-5px)',
        boxShadow: `0 12px 30px ${color}25`, // Dynamic colored shadow
      }
    }}
  >
    {/* Icon Container with Gradient */}
    <Box sx={{
      p: 2,
      borderRadius: '18px',
      background: `linear-gradient(135deg, ${color}15 0%, ${color}30 100%)`,
      color: color,
      display: 'flex',
      mr: 2.5,
      boxShadow: `0 4px 12px ${color}15`
    }}>
      {React.cloneElement(icon, { sx: { fontSize: 28 } })}
    </Box>
    
    {/* Text Content */}
    <Box>
      <Typography variant="h4" fontWeight="800" sx={{ color: '#2c3e50', lineHeight: 1, mb: 0.5 }}>
        {value}
      </Typography>
      <Typography variant="body2" fontWeight="600" color="text.secondary" sx={{ textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px' }}>
        {title}
      </Typography>
    </Box>
  </Paper>
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
        const profileRes = await fetch(`${API_BASE}/profiles/${userId}`);
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setProfile(profileData);
        }

        const ridesRes = await fetch(`${API_BASE}/rides/user/${userId}`);
        if (!ridesRes.ok) throw new Error("Failed to fetch user rides");
        const ridesData = await ridesRes.json();
        
        const statsRes = await fetch(`${API_BASE}/rides/stats/total`);
        if (!statsRes.ok) throw new Error("Failed to fetch stats");
        const statsData = await statsRes.json();

        const created = ridesData.created || [];
        const joined = ridesData.joined || [];
        const allMyRides = [...created, ...joined];
        
        const upcoming = allMyRides.filter(ride => new Date(ride.departure_time) > new Date());
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
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;
  }
  
  const welcomeName = profile?.full_name ? profile.full_name.split(" ")[0] : "Traveler";

  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      
      {/* 1. WELCOME SECTION */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 5 }}>
        <Box>
          <Fade in={true} timeout={800}>
            <Typography variant="h3" component="h1" sx={{ 
                fontWeight: '800', 
                mb: 1,
                background: 'linear-gradient(45deg, #2c3e50 30%, #ad57c1 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-1px'
            }}>
              Hello, {welcomeName}
            </Typography>
          </Fade>
          <Fade in={true} timeout={1200}>
            <Typography variant="h6" color="text.secondary" fontWeight="500">
              Here is your daily travel summary.
            </Typography>
          </Fade>
        </Box>
        
        <Button 
            variant="contained" 
            startIcon={<Add />} 
            component={RouterLink} 
            to="/create" 
            sx={{
                bgcolor: '#ad57c1', 
                borderRadius: '12px',
                px: 3,
                py: 1.2,
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 'bold',
                boxShadow: '0 4px 14px rgba(173, 87, 193, 0.4)',
                '&:hover': { bgcolor: '#8e44ad', transform: 'translateY(-2px)' },
                transition: 'all 0.2s'
            }}
        >
          New Ride
        </Button>
      </Box>

      {/* 2. STAT WIDGETS */}
      <Grid container spacing={3} sx={{ mb: 6 }}>
        <Grid item xs={12} sm={6} md={3}>
            <Fade in={true} style={{ transitionDelay: '100ms' }}>
                <div><StatWidget title="Rides Created" value={stats.created} icon={<DirectionsCar />} color="#ad57c1" /></div>
            </Fade>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
            <Fade in={true} style={{ transitionDelay: '200ms' }}>
                <div><StatWidget title="Rides Joined" value={stats.joined} icon={<People />} color="#2196f3" /></div>
            </Fade>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
            <Fade in={true} style={{ transitionDelay: '300ms' }}>
                <div><StatWidget title="Upcoming" value={stats.upcoming} icon={<Event />} color="#ff9800" /></div>
            </Fade>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
            <Fade in={true} style={{ transitionDelay: '400ms' }}>
                <div><StatWidget title="Total App Rides" value={stats.total} icon={<TrendingUp />} color="#00c853" /></div>
            </Fade>
        </Grid>
      </Grid>

      {/* 3. UPCOMING RIDES SECTION */}
      <Fade in={true} style={{ transitionDelay: '500ms' }}>
        <Paper 
            elevation={0}
            sx={{
                p: 4, 
                borderRadius: '32px', 
                background: 'rgba(255, 255, 255, 0.6)', 
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.5)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.02)' 
            }}
        >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, px: 1 }}>
                <Typography variant="h5" sx={{ fontWeight: '800', color: '#2c3e50' }}>
                    Your Upcoming Trips
                </Typography>
                <Button 
                    component={RouterLink} 
                    to="/my-rides" 
                    endIcon={<ArrowForward />}
                    sx={{ 
                        textTransform: 'none', 
                        fontWeight: 'bold', 
                        color: '#ad57c1',
                        '&:hover': { bgcolor: 'rgba(173, 87, 193, 0.08)' }
                    }}
                >
                    View All
                </Button>
            </Box>

            {upcomingRides.length > 0 ? (
                <Grid container spacing={3}>
                    {upcomingRides.map((ride, index) => (
                        <Grid item xs={12} md={4} key={ride.id || ride._id}>
                             <RideCard ride={ride} />
                        </Grid>
                    ))}
                </Grid>
            ) : (
                <Box sx={{ textAlign: 'center', py: 8, opacity: 0.7 }}>
                    <img src="https://cdn-icons-png.flaticon.com/512/7486/7486754.png" alt="Empty" style={{ width: '80px', marginBottom: '16px', opacity: 0.5 }} />
                    <Typography color="text.secondary" fontWeight="500" sx={{ mb: 2 }}>
                        You have no upcoming trips scheduled.
                    </Typography>
                    <Button 
                        variant="outlined" 
                        component={RouterLink} 
                        to="/create" 
                        sx={{ 
                            borderRadius: '10px', 
                            textTransform: 'none', 
                            borderColor: '#ad57c1', 
                            color: '#ad57c1', 
                            fontWeight: 'bold' 
                        }}
                    >
                        Plan a Ride
                    </Button>
                </Box>
            )}
        </Paper>
      </Fade>
    </Container>
  );
};

export default DashboardPage;