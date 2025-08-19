// src/pages/HomePage.jsx

import React, { useState, useCallback } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useJsApiLoader } from '@react-google-maps/api';
import LocationAutocomplete from '../components/LocationAutocomplete';
import {
  Container, Typography, Card, CardContent, Grid,
  CardActionArea, Box, Button, CircularProgress,
  IconButton, Chip, Stack
} from '@mui/material';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import RideCard from '../components/RideCard';

const libraries = ['places'];

const commonRoutes = [
  {
    label: "Station to Hostel",
    from: {
      address: "Jaipur Junction, Jaipur, Rajasthan",
      shortName: "Jaipur Junction",
      lat: 26.91806430588278, lng: 75.79018840654534
    },
    to: {
      address: "GHS Hostel, Manipal University Jaipur",
      shortName: "GHS Hostel",
      lat: 26.841833083482314, lng: 75.56287323121721
    }
  },
  {
    label: "Airport to Hostel",
    from: {
      address: "Jaipur International Airport, Jaipur",
      shortName: "Jaipur Airport",
      lat: 26.828500360798287, lng: 75.80639863352846
    },
    to: {
      address: "GHS Hostel, Manipal University Jaipur",
      shortName: "GHS Hostel",
      lat: 26.841833083482314, lng: 75.56287323121721
    }
  }
];

const HomePage = () => {
  const [fromLocation, setFromLocation] = useState(null);
  const [toLocation, setToLocation] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
 useEffect(() => {
    //Set up the channel
    const channel = supabase.channel('public:rides');

    //Define what to do when a new ride is inserted
    const onInsert = (payload) => {
      console.log('New ride received!', payload);
      // Add the new ride to the top of our current search results
      setSearchResults(currentRides => [payload.new, ...currentRides]);
    };

    // Subscribe to the channel
    channel
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'rides' }, onInsert)
      .subscribe();

    // Cleanup: Unsubscribe when the component unmounts
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const performSearch = useCallback(async (from, to) => {
    if (!from || !to) {
      alert('Please select both "From" and "To" locations.');
      return;
    }
    setLoading(true);
    setSearched(true);
    try {
      const { data, error } = await supabase.rpc('search_rides', {
        origin_lat: from.lat,
        origin_lng: from.lng,
        dest_lat: to.lat,
        dest_lng: to.lng,
        radius_meters: 5000,
      });

      if (error) throw error;
      setSearchResults(data);
    } catch (error) {
      console.error('Error searching for rides:', error.message);
      alert('Could not fetch rides.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearch = () => {
    performSearch(fromLocation, toLocation);
  };

  const handleQuickSearch = (route) => {
    setFromLocation(route.from);
    setToLocation(route.to);
    // Autofills inputs, search happens only when "Find Rides" is clicked
  };

  const handleSwap = () => {
    setFromLocation(toLocation);
    setToLocation(fromLocation);
  };

  if (!isLoaded) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container>
      {/* Search Form */}
      <Box sx={{ my: 4, p: 2, border: '1px solid lightgray', borderRadius: 2 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          Find a Ride
        </Typography>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} alignItems="center">
          <Box sx={{ width: '100%' }}>
            <LocationAutocomplete
              label="From"
              onPlaceSelect={setFromLocation}
              value={fromLocation}
            />
          </Box>
          <IconButton onClick={handleSwap} aria-label="swap from and to">
            <SwapVertIcon />
          </IconButton>
          <Box sx={{ width: '100%' }}>
            <LocationAutocomplete
              label="To"
              onPlaceSelect={setToLocation}
              value={toLocation}
            />
          </Box>
          <Button
            variant="contained"
            sx={{ height: '56px', width: { xs: '100%', md: 'auto' }, px: 4 }}
            onClick={handleSearch}
            disabled={loading}
          >
            Find Rides
          </Button>
        </Stack>

        {/* Quick Search Chips */}
        <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: 'wrap', gap: 1 }}>
          {commonRoutes.map((route) => (
            <Chip
              key={route.label}
              label={route.label}
              onClick={() => handleQuickSearch(route)}
            />
          ))}
        </Stack>
      </Box>

      {/* Search Results */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {!loading && searched && (
        <Box>
          <Typography variant="h5" component="h2" gutterBottom>
            Search Results
          </Typography>
          <Grid container spacing={2}>
            {searchResults.length === 0 ? (
              <Typography sx={{ ml: 2, mt: 2 }}>
                No rides found starting near your selected location.
              </Typography>
            ) : (
              searchResults.map((ride) => (
                <Grid item xs={12} sm={6} md={4} key={ride.id}>
                  <CardActionArea component={RouterLink} to={`/ride/${ride.id}`}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" noWrap title={ride.from_display || ride.from}>
                          {ride.from_display || ride.from}
                        </Typography>
                        <Typography variant="body1" noWrap title={ride.to_display || ride.to}>
                          to {ride.to_display || ride.to}
                        </Typography>
                        <Typography sx={{ my: 1.5 }} color="text.secondary">
                          {new Date(ride.departure_time).toLocaleString()}
                        </Typography>
                        <Typography variant="body2">
                          Seats Available: {ride.seats_available}
                        </Typography>
                      </CardContent>
                    </Card>
                  </CardActionArea>
                </Grid>
              ))
            )}
          </Grid>
        </Box>
      )}
    </Container>
  );
};

export default HomePage;
