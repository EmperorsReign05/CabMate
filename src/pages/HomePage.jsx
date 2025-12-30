import React, { useState } from 'react'; 
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useJsApiLoader } from '@react-google-maps/api';
import LocationAutocomplete from '../components/LocationAutocomplete';
import {
  Container, Typography, Grid, Box, Button, CircularProgress,
  IconButton, Chip, Stack, Paper, Fade, Zoom
} from '@mui/material';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import RideCard from '../components/RideCard';

const libraries = ['places'];

const THEME = {
  primary: '#ad57c1ff',
  primaryDark: '#7b1fa2',
  gradient: 'linear-gradient(135deg, #ad57c1 0%, #7b1fa2 100%)',
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
  const [fromLocation, setFromLocation] = useState(null);
  const [toLocation, setToLocation] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const handleSearch = async () => {
    if (!fromLocation && !toLocation) {
      alert("Please select at least one location");
      return;
    }

    setLoading(true);
    setSearched(true);

    try {
      const params = new URLSearchParams();
      if (fromLocation) params.append("from_location", fromLocation.address);
      if (toLocation) params.append("to_location", toLocation.address);

      const res = await fetch(`http://127.0.0.1:8000/rides/search?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch rides");
      
      const data = await res.json();
      setSearchResults(data);
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

  if (!isLoaded) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  }

  return (
    <Box sx={{ minHeight: '90vh', pb: 8 }}>
      
      <Container maxWidth="lg">
        <Box sx={{ pt: 8, pb: 4, textAlign: 'center' }}>
            <Fade in={true} timeout={1000}>
                <Typography variant="h2" component="h1" sx={{ 
                    fontWeight: 800, 
                    mb: 2,
                    background: 'linear-gradient(45deg, #2c3e50 30%, #ad57c1 90%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    letterSpacing: '-1px'
                }}>
                    Your Campus Commute, <br /> Reimagined.
                </Typography>
            </Fade>
            <Fade in={true} timeout={1500}>
                <Typography variant="h6" color="text.secondary" sx={{ mb: 6, fontWeight: 400, maxWidth: '600px', mx: 'auto' }}>
                    Share rides, split costs, and travel safely with fellow students.
                    The smartest way to get from Campus to City.
                </Typography>
            </Fade>
        </Box>

        {/* search section*/}
        <Zoom in={true} style={{ transitionDelay: '300ms' }}>
          <Paper 
            elevation={0}
            sx={{ 
                p: { xs: 3, md: 5 },
                borderRadius: '32px', 
                background: THEME.glass,
                backdropFilter: 'blur(20px)',
                border: THEME.glassBorder,
                boxShadow: '0 20px 80px rgba(173, 87, 193, 0.15)', 
                maxWidth: '900px',
                mx: 'auto',
                position: 'relative',
                overflow: 'hidden'
            }}
          >
            
            <Box sx={{
                position: 'absolute',
                top: '-50%',
                left: '-50%',
                width: '200%',
                height: '200%',
                background: 'radial-gradient(circle at 50% 50%, rgba(173, 87, 193, 0.05) 0%, transparent 50%)',
                zIndex: 0,
                pointerEvents: 'none'
            }} />

            <Typography variant="h5" fontWeight="800" sx={{ mb: 3, position: 'relative', color: '#2c3e50', letterSpacing: '-0.5px' }}>
      Where are you headed?
  </Typography>

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center" sx={{ position: 'relative', zIndex: 1 }}>
              <Box sx={{ width: '100%', bgcolor: 'white', borderRadius: 3, p: 0.5, boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                <LocationAutocomplete label="Leaving from..." onPlaceSelect={setFromLocation} value={fromLocation} />
              </Box>

              <IconButton onClick={handleSwap} sx={{ 
                  bgcolor: 'white', 
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  '&:hover': { bgcolor: '#f5f5f5', transform: 'rotate(180deg)' },
                  transition: 'all 0.3s'
              }}>
                <SwapVertIcon color="primary" />
              </IconButton>

              <Box sx={{ width: '100%', bgcolor: 'white', borderRadius: 3, p: 0.5, boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
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
                    boxShadow: '0 8px 24px rgba(173, 87, 193, 0.4)',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    textTransform: 'none',
                    minWidth: '140px',
                    '&:hover': { 
                        boxShadow: '0 12px 32px rgba(173, 87, 193, 0.6)',
                        transform: 'translateY(-2px)'
                    },
                    transition: 'all 0.3s'
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : "Search"}
              </Button>
            </Stack>

            
            <Box sx={{ mt: 4, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1.5, position: 'relative', zIndex: 1 }}>
                <Typography variant="body2" color="text.secondary" fontWeight="600" mr={1}>
                    Popular:
                </Typography>
                {commonRoutes.map((route) => (
                    <Chip
                    key={route.label}
                    label={route.label}
                    onClick={() => handleQuickSearch(route)}
                    sx={{
                        bgcolor: 'rgba(173, 87, 193, 0.1)',
                        color: '#ad57c1',
                        fontWeight: '600',
                        border: '1px solid transparent',
                        '&:hover': {
                            bgcolor: 'rgba(173, 87, 193, 0.2)',
                            border: '1px solid #ad57c1'
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
      </Container>
    </Box>
  );
};

export default HomePage;