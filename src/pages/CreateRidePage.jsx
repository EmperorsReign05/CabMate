import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useJsApiLoader } from "@react-google-maps/api";
import LocationAutocomplete from "../components/LocationAutocomplete";
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
  FormControlLabel,
  Checkbox,
  Tooltip,
  Stack,
  Chip,
  IconButton
} from "@mui/material";
import { useNotification } from "../context/NotificationContext";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import SwapVertIcon from '@mui/icons-material/SwapVert'; 

const libraries = ["places"];
const API_BASE = import.meta.env.VITE_API_BASE_URL;

const commonRoutes = [
  {
    label: "Hostel to Station",
    from: {
      address: "GHS Hostel campus, Jaipur, Dahmi Kalan, Rajasthan 303007, India",
      shortName: "GHS Hostel",
      lat: 26.84191836301402, lng: 75.56236340893899
    },
    to: {
      address: "Railway Station, Kanti Nagar, Sindhi Camp, Jaipur, Rajasthan 302006, India",
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
      address: "Sindhi Camp, Jaipur, Rajasthan, India",
      shortName: "Sindhi Camp",
      lat: 26.924389960352105, lng: 75.80074728010615 
    }
  }
];

const CreateRidePage = ({ session }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showNotification } = useNotification();

  const [from, setFrom] = useState(location.state?.fromLocation || null);
  const [to, setTo] = useState(location.state?.toLocation || null);

  const [rideDetails, setRideDetails] = useState({
    departure_time: "",
    seats_available: 1,
    cost_per_seat: 0,
  });

  const [isLadiesOnly, setIsLadiesOnly] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  useEffect(() => {
    if (!session) {
      navigate("/login");
      return;
    }

    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("gender")
        .eq("id", session.user.id)
        .single();

      if (error) {
        console.error(error);
        return;
      }

      setUserProfile(data);
    };

    fetchProfile();
  }, [session, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Block negative values immediately
    if (name === "seats_available" && value < 1 && value !== "") return;
    if (name === "cost_per_seat" && value < 0 && value !== "") return;

    setRideDetails({ ...rideDetails, [name]: value });
  };

  const handleCommonRoute = (route) => {
    setFrom(route.from);
    setTo(route.to);
  };

  const handleSwap = () => {
    const temp = from;
    setFrom(to);
    setTo(temp);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!from || !to) {
      showNotification("Please select both From and To locations.", "warning");
      return;
    }

    setLoading(true);

    const payload = {
      from_location: from.address,
      to_location: to.address,
      departure_time: new Date(rideDetails.departure_time).toISOString(),
      seats_available: Number(rideDetails.seats_available),
      price_per_seat: Number(rideDetails.cost_per_seat),
      is_ladies_only: isLadiesOnly,
      created_by: session.user.id 
    };

    try {
      const res = await fetch("http://127.0.0.1:8000/rides/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload), 
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text);
      }

      const data = await res.json();
      console.log("Ride created:", data);
      showNotification("Ride created successfully!", "success");
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      showNotification(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded || !userProfile) return <CircularProgress />;

  return (
    <Container maxWidth="sm">
      {/* Reduced Top Margin from 4 to 2 to prevent scrolling */}
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
        <Typography variant="h4" gutterBottom>
          Create a New Ride
        </Typography>

        {/* Updated Chips Styling */}
        <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
          {commonRoutes.map((route) => (
            <Chip
              key={route.label}
              label={route.label}
              onClick={() => handleCommonRoute(route)}
              clickable
              variant="outlined"
              sx={{
                borderColor: '#ad57c1ff',
                color: '#ad57c1ff',
                fontWeight: 'bold',
                '&:hover': {
                   borderColor: '#4A148C',
                   color: '#4A148C',
                   backgroundColor: 'rgba(173, 87, 193, 0.05)'
                }
              }}
            />
          ))}
        </Stack>

        <Box sx={{ position: 'relative' }}>
          <Box sx={{ mb: 1 }}>
            <LocationAutocomplete 
              label="From" 
              onPlaceSelect={setFrom} 
              value={from} 
            />
          </Box>

          {/* Adjusted Swap Button Spacing */}
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 1 }}>
            <IconButton 
              onClick={handleSwap} 
              aria-label="swap locations"
              sx={{ 
                bgcolor: 'background.paper', 
                border: '1px solid #ad57c1ff',
                color: '#ad57c1ff',
                '&:hover': { bgcolor: '#f5f5f5' },
                zIndex: 1
              }}
            >
              <SwapVertIcon />
            </IconButton>
          </Box>

          <Box sx={{ mb: 2 }}>
            <LocationAutocomplete 
              label="To" 
              onPlaceSelect={setTo} 
              value={to} 
            />
          </Box>
        </Box>

        <TextField
          name="departure_time"
          label="Departure Time"
          type="datetime-local"
          value={rideDetails.departure_time}
          onChange={handleChange}
          fullWidth
          required
          margin="normal"
          InputLabelProps={{ shrink: true }}
          size="small" 
          onClick={(e) => {
          const input = document.querySelector('input[name="departure_time"]');
            // Check if the browser supports showPicker (modern browsers)
            if (input && input.showPicker) {
              input.showPicker();
            }
          }}// Making input slightly smaller to save vertical space
        />

        <TextField
          name="seats_available"
          label="Seats Available"
          type="number"
          value={rideDetails.seats_available}
          onChange={handleChange}
          fullWidth
          required
          margin="normal"
          size="small"
        />

        <TextField
          name="cost_per_seat"
          label="Cost per Seat (₹)"
          type="number"
          value={rideDetails.cost_per_seat}
          onChange={handleChange}
          fullWidth
          margin="normal"
          size="small"
        />

        {userProfile.gender === "female" && (
          <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={isLadiesOnly}
                  onChange={(e) => setIsLadiesOnly(e.target.checked)}
                  sx={{
                    color: '#ad57c1ff',
                    '&.Mui-checked': {
                      color: '#ad57c1ff',
                    },
                  }}
                />
              }
              label="This is a ladies-only ride"
            />
            <Tooltip title="Only female students will be able to see and join this ride.">
              <InfoOutlinedIcon
                sx={{ ml: 1, verticalAlign: "middle", color: "text.secondary" }}
              />
            </Tooltip>
          </Box>
        )}

        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={loading}
          sx={{
            mt: 3,
            height: "45px",
            backgroundColor: "#ad57c1ff",
            "&:hover": { backgroundColor: "#4A148C" },
            fontWeight: 'bold'
          }}
        >
          {loading ? "Creating..." : "Create Ride"}
        </Button>
      </Box>
    </Container>
  );
};

export default CreateRidePage;