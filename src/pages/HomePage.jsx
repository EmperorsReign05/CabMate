import React, { useState, useCallback, useEffect } from 'react'; 
import { Link as RouterLink } from 'react-router-dom';
import { useNavigate } from 'react-router-dom'; 
//import { supabase } from '../supabaseClient';
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
    label: "Hostel to Station",
    from: {
      address: "GHS Hostel campus, Jaipur, Dahmi Kalan, Rajasthan 303007, India",
      shortName: "GHS Hostel",
      lat: 26.84191836301402, lng: 75.56236340893899
    },
    to: {
      address: "WQ9Q+5V9, Kanti Nagar, Sindhi Camp, Jaipur, Rajasthan 302006, India",
      shortName: "Jaipur Junction",
      lat: 26.91814083720423, lng: 75.78976998195542
    }
  },
  {
    label: "Hostel to Airport",
    from: {
      address: "GHS Hostel campus, Jaipur, Dahmi Kalan, Rajasthan 303007, India",
      shortName: "GHS Hostel",
      lat: 26.84191836301402, lng: 75.56236340893899
    },
    to: {
      address: "Airport Rd, Sanganer, Jaipur, Rajasthan 302029, India",
      shortName: "Jaipur Airport",
      lat: 26.828500360798287, lng: 75.80639863352846
    }
  },
  {
    label: "Hostel to Sindhi Camp",
    from: {
      address: "GHS Hostel, Manipal University Jaipur",
      shortName: "GHS Hostel",
      lat: 26.84191836301402, lng: 75.56236340893899
    },
    to: {
      address: "Sindhi Camp Bus Stand",
      shortName: "Sindhi Camp",
      lat: 26.923614455298253, lng: 75.80057210709235 
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
  const [fromInput, setFromInput] = useState('');
  const [toInput, setToInput] = useState('');
 /*useEffect(() => {
    //Set up the channel
    const channel = supabase.channel('public:rides');

    //when a new ride is inserted
    const onInsert = (payload) => {
      console.log('New ride received!', payload);
      //new ride to the top of current search results
      setSearchResults(currentRides => [payload.new, ...currentRides]);
    };

    //Subscribe to the channel
    channel
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'rides' }, onInsert)
      .subscribe();

    //Unsubscribe when the component unmounts
    return () => {
      supabase.removeChannel(channel);
    };
  }, []); */
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  /*const performSearch = useCallback(async (from, to) => {
    if (!from || !to) {
      alert('Please select both "From" and "To" locations.');
      return;
    }
    setLoading(true);
    setSearched(true);
    /*try {
      const { data, error } = await supabase.rpc('search_rides', {
        origin_lat: from.lat,
        origin_lng: from.lng,
        dest_lat: to.lat,
        dest_lng: to.lng,
        radius_meters: 1000,
      });

      if (error) throw error;
      setSearchResults(data);
      const res = await fetch(
  `http://127.0.0.1:8000/rides/?from_location=${encodeURIComponent(from.address)}&to_location=${encodeURIComponent(to.address)}`
);

if (!res.ok) {
  throw new Error("Failed to fetch rides");
}

const data = await res.json();
setSearchResults(data);

    } catch (error) {
      console.error('Error searching for rides:', error.message);
      alert('Could not fetch rides.');
    } finally {
      setLoading(false);
    }
  }, []);*/

const handleSearch = async () => {
  if (!fromLocation || !toLocation) {
    alert("Please select both locations");
    return;
  }

  setLoading(true);
  setSearched(true);

  try {
    const res = await fetch(
      `http://127.0.0.1:8000/rides/search?from_location=${encodeURIComponent(
        fromLocation.address
      )}&to_location=${encodeURIComponent(toLocation.address)}`
    );

    if (!res.ok) {
      throw new Error("Failed to fetch rides");
    }

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
     setFromInput(route.from.shortName);
    setToInput(route.to.shortName);
  
  };

  const handleSwap = () => {
    setFromLocation(toLocation);
    setToLocation(fromLocation);
    setFromInput(toInput);
    setToInput(fromInput);
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
      <Box sx={{ 
          my: 4, 
          p: 3, // Increased padding
          borderRadius: 4, // More rounded corners
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)', // A modern shadow
          backdropFilter: 'blur(4px)',
          border: '1px solid rgba(255, 255, 255, 0.18)',
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.1))' // New gradient
        }}>
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
            sx={{
              height: '56px',
              width: { xs: '100%', md: 'auto' },
              px: 4,
              // Add these lines to change the color
              backgroundColor: '#ad57c1ff', // A deep purple color
              '&:hover': {
                backgroundColor: '#5d358eff', // A slightly darker purple for hover
              },
            }}
            onClick={handleSearch}
            disabled={loading}
          >
            Find Rides
          </Button>
        </Stack>

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

      {/* Create Ride button under Find Rides section */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 3 }}>
        <Button
          component={RouterLink}
          to="/create"
          variant="contained"
          sx={{
            height: '35px',
            width: { xs: '100%', md: 'auto' },
            px: 4,
            backgroundColor: '#ad57c1ff',
            '&:hover': { backgroundColor: '#4A148C' },
          }}
        >
          Create New Ride
        </Button>
      </Box>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {!loading && searched && (
         <Box>
          <Typography variant="h5" component="h2" gutterBottom>Search Results</Typography>
          <Grid container spacing={2}>
            {searchResults.length === 0 ? (
              <Box sx={{ textAlign: 'center', width: '100%', my: 4 }}>
                <Typography sx={{ mb: 2 }}>No rides found for this route.</Typography>
                <Button 
                  variant="contained"
                  sx={{
                    backgroundColor: '#ad57c1ff',
                    '&:hover': { backgroundColor: '#4A148C' },
                  }}
                  onClick={() => navigate('/create', { state: { fromLocation, toLocation } })}
                >
                  Be the first to create one!
                </Button>
              </Box>
            ) : (
              searchResults.map((ride) => (<Grid item xs={12} sm={6} md={4} key={ride._id}><RideCard ride={ride} /></Grid>))
            )}
          </Grid>
        </Box>
      )}
    </Container>
  );
};

export default HomePage;
