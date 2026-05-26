import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import LocationAutocomplete from '../components/LocationAutocomplete';
import {
  Container, Typography, Grid, Box, Button, CircularProgress,
  IconButton, Chip, Stack, Paper, Fade, Zoom
} from '@mui/material';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import GitHubIcon from '@mui/icons-material/GitHub';
import RideCard from '../components/RideCard';

const API_BASE = import.meta.env.VITE_API_BASE_URL;
const THEME = {
  primary: '#f06292',
  primaryDark: '#d81b60',
  gradient: 'linear-gradient(135deg, #f06292 0%, #d81b60 100%)',
  glass: 'rgba(255, 255, 255, 0.75)',
  glassBorder: '1px solid rgba(255, 255, 255, 0.5)',
};

const commonRoutes = [
  {
    label: "Hostel ➝ Station",
    from: {
      address: "GHS Hostel campus, Jaipur, Dahmi Kalan, Rajasthan 303007, India",
      shortName: "GHS Hostel",
      lat: 26.841918,
      lng: 75.562363
    },
    to: {
      address: "Jaipur Junction, Gopalbari, Jaipur, Rajasthan 302006, India",
      shortName: "Jaipur Junction",
      lat: 26.918140,
      lng: 75.789769
    }
  },
  {
    label: "Hostel ➝ Airport",
    from: {
      address: "GHS Hostel campus, Jaipur, Dahmi Kalan, Rajasthan 303007, India",
      shortName: "GHS Hostel",
      lat: 26.841918,
      lng: 75.562363
    },
    to: {
      address: "Jaipur International Airport, Airport Rd, Sanganer, Jaipur, Rajasthan 302029, India",
      shortName: "Jaipur Airport",
      lat: 26.828500,
      lng: 75.806398
    }
  },
  {
    label: "Hostel ➝ Sindhi Camp",
    from: {
      address: "GHS Hostel campus, Jaipur, Dahmi Kalan, Rajasthan 303007, India",
      shortName: "GHS Hostel",
      lat: 26.841918,
      lng: 75.562363
    },
    to: {
      address: "Sindhi Camp Bus Stand, Station Road, Jaipur, Rajasthan 302001, India",
      shortName: "Sindhi Camp",
      lat: 26.924389,
      lng: 75.800747
    }
  }
];
const HomePage = () => {
  const navigate = useNavigate();
  const [fromLocation, setFromLocation] = useState(commonRoutes[0].from);
  const [toLocation, setToLocation] = useState(commonRoutes[0].to);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);



  const handleSearch = async () => {
    if (!fromLocation && !toLocation) {
      alert("Please select at least one location");
      return;
    }

    setLoading(true);
    setSearched(true);

    try {
      // Mocking the API response for portfolio demo purposes
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const mockRides = [
        {
          _id: "mock1",
          from_location: fromLocation ? fromLocation.address : "Campus",
          to_location: toLocation ? toLocation.address : "City",
          departure_time: new Date(Date.now() + 1000 * 60 * 60 * 2).toISOString(),
          seats_available: 3,
          price_per_seat: 150,
          created_by: { full_name: "Rahul Sharma" }
        },
        {
          _id: "mock2",
          from_location: fromLocation ? fromLocation.address : "Campus",
          to_location: toLocation ? toLocation.address : "City",
          departure_time: new Date(Date.now() + 1000 * 60 * 60 * 4.5).toISOString(),
          seats_available: 1,
          price_per_seat: 200,
          created_by: { full_name: "Priya Patel" }
        },
        {
          _id: "mock3",
          from_location: fromLocation ? fromLocation.address : "Campus",
          to_location: toLocation ? toLocation.address : "City",
          departure_time: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
          seats_available: 4,
          price_per_seat: 100,
          created_by: { full_name: "Amit Kumar" }
        }
      ];
      
      setSearchResults(mockRides);
    } catch (err) {
      console.error(err);
      alert("Could not fetch rides");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSearch = (route) => {
    setFromLocation(route.from);
    setToLocation(route.to);
  };

  const handleSwap = () => {
    const temp = fromLocation;
    setFromLocation(toLocation);
    setToLocation(temp);
  };


  return (
    <Box sx={{ minHeight: '90vh', pb: 8 }}>
      <Box sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: 'url(/home_bg.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        zIndex: -1
      }} />
      <Box sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.3)',
        zIndex: -1
      }} />

      <Container maxWidth="lg">
        <Box sx={{ pt: 8, pb: 4, textAlign: 'center' }}>
          <Fade in={true} timeout={1000}>
            <Box>
              <Typography variant="h2" component="h1" sx={{
                fontWeight: 800,
                color: 'white',
                letterSpacing: '-1px',
                textShadow: '0 4px 20px rgba(0,0,0,0.5)'
              }}>
                Your Campus Commute,
              </Typography>
              <Typography variant="h1" component="h2" sx={{
                fontFamily: '"Playfair Display", serif',
                fontStyle: 'italic',
                fontWeight: 600,
                color: '#ffe5b4',
                textShadow: '0 4px 20px rgba(0,0,0,0.5)',
                mb: 2
              }}>
                Reimagined.
              </Typography>
            </Box>
          </Fade>
          <Fade in={true} timeout={1500}>
            <Typography variant="h6" sx={{ mb: 6, fontWeight: 500, color: 'rgba(255,255,255,0.9)', textShadow: '0 2px 10px rgba(0,0,0,0.5)', maxWidth: '600px', mx: 'auto' }}>
              Share rides, split costs, and travel safely with fellow students.
              The smartest way to get from Campus to City.
            </Typography>
          </Fade>
        </Box>
        <Zoom in={true} style={{ transitionDelay: '300ms' }}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, md: 5 },
              borderRadius: '32px',
              background: 'var(--dark-glass-bg)',
              backdropFilter: 'blur(30px)',
              border: 'var(--dark-glass-border)',
              boxShadow: 'var(--glass-shadow)',
              maxWidth: '900px',
              mx: 'auto',
              position: 'relative',
              overflow: 'hidden'
            }}
          >

            <Typography variant="h5" fontWeight="800" sx={{ mb: 3, position: 'relative', color: 'white', letterSpacing: '-0.5px' }}>
              Where are you headed?
            </Typography>

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center" sx={{ position: 'relative', zIndex: 1 }}>
              <Box sx={{ width: '100%', bgcolor: 'rgba(255,255,255,0.95)', borderRadius: 3, p: 0.5, boxShadow: '0 2px 12px rgba(0,0,0,0.1)' }}>
                <LocationAutocomplete label="Leaving from..." onPlaceSelect={setFromLocation} value={fromLocation} />
              </Box>

              <IconButton onClick={handleSwap} sx={{
                bgcolor: 'white',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                '&:hover': { bgcolor: '#f5f5f5', transform: 'rotate(180deg)' },
                transition: 'all 0.3s'
              }}>
                <SwapVertIcon color="action" />
              </IconButton>

              <Box sx={{ width: '100%', bgcolor: 'rgba(255,255,255,0.95)', borderRadius: 3, p: 0.5, boxShadow: '0 2px 12px rgba(0,0,0,0.1)' }}>
                <LocationAutocomplete label="Going to..." onPlaceSelect={setToLocation} value={toLocation} />
              </Box>

              <Button
                variant="contained"
                onClick={handleSearch}
                disabled={loading}
                sx={{
                  height: '56px',
                  px: 4,
                  borderRadius: 3,
                  background: THEME.gradient,
                  boxShadow: '0 8px 24px rgba(240, 98, 146, 0.4)',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  textTransform: 'none',
                  minWidth: '140px',
                  '&:hover': {
                    boxShadow: '0 12px 32px rgba(240, 98, 146, 0.6)',
                    transform: 'translateY(-2px)'
                  },
                  transition: 'all 0.3s'
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : "Search"}
              </Button>
            </Stack>


            <Box sx={{ mt: 4, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1.5, position: 'relative', zIndex: 1 }}>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: '600', mr: 1 }}>
                Popular:
              </Typography>
              {commonRoutes.map((route) => (
                <Chip
                  key={route.label}
                  label={route.label}
                  onClick={() => handleQuickSearch(route)}
                  sx={{
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    fontWeight: '600',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.2)',
                      border: '1px solid rgba(255, 255, 255, 0.4)'
                    }
                  }}
                />
              ))}
            </Box>
          </Paper>
        </Zoom>


        <Box sx={{ textAlign: 'center', mt: 6 }}>
          <Button
            component={RouterLink}
            to="/create"
            startIcon={<AddIcon />}
            sx={{
              color: '#666',
              fontWeight: 'bold',
              textTransform: 'none',
              fontSize: '1rem',
              bgcolor: 'white',
              px: 3,
              py: 1.5,
              borderRadius: 4,
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              '&:hover': { bgcolor: '#fff', color: THEME.primary, boxShadow: '0 8px 20px rgba(0,0,0,0.1)' }
            }}
          >
            Going somewhere? Publish a ride
          </Button>
        </Box>

        {/* results section */}
        {!loading && searched && (
          <Box sx={{ mt: 8 }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ pl: 1 }}>
              {searchResults.length} rides available
            </Typography>
            <Grid container spacing={3}>
              {searchResults.length === 0 ? (
                <Box sx={{ textAlign: 'center', width: '100%', py: 8 }}>
                  <img
                    src="https://cdn-icons-png.flaticon.com/512/7486/7486744.png"
                    alt="No results"
                    style={{ width: '120px', opacity: 0.5, marginBottom: '20px' }}
                  />
                  <Typography variant="h6" color="text.secondary">
                    No rides found for this route yet.
                  </Typography>
                  <Button
                    variant="text"
                    onClick={() => navigate('/create', { state: { fromLocation, toLocation } })}
                    sx={{ mt: 1, color: THEME.primary, fontWeight: 'bold' }}
                  >
                    Be the first to create one!
                  </Button>
                </Box>
              ) : (
                searchResults.map((ride, index) => (
                  <Grid item xs={12} sm={6} md={4} key={ride._id}>
                    <Fade in={true} style={{ transitionDelay: `${index * 100}ms` }}>
                      <div><RideCard ride={ride} /></div>
                    </Fade>
                  </Grid>
                ))
              )}
            </Grid>
          </Box>
        )}
        <Box sx={{ mt: 12, mb: 4, textAlign: 'center' }}>
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)', textShadow: '0 2px 4px rgba(0,0,0,0.4)', fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: 0.5 }}>
            <span>&copy; 2026 CabMate Inc. All rights reserved.</span>
            <span style={{ margin: '0 8px', opacity: 0.7 }}>|</span>
            <span>Made by Mohammad Alman Farooqui</span>
            <IconButton
              component="a"
              href="https://github.com/EmperorsReign05"
              target="_blank"
              rel="noopener noreferrer"
              sx={{ color: 'inherit', opacity: 0.9, '&:hover': { color: 'white', opacity: 1, transform: 'scale(1.1)' }, transition: 'all 0.2s' }}
              size="small"
            >
              <GitHubIcon fontSize="inherit" />
            </IconButton>
            <span style={{ margin: '0 8px', opacity: 0.7 }}>|</span>
            <Button
              component="a"
              href="https://cabmate-auaw.onrender.com/docs"
              target="_blank"
              rel="noopener noreferrer"
              variant="text"
              sx={{ color: 'inherit', p: 0, textTransform: 'none', fontWeight: 500, minWidth: 'auto', '&:hover': { color: 'white', textDecoration: 'underline', bgcolor: 'transparent' } }}
            >
              API Docs
            </Button>
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default HomePage;