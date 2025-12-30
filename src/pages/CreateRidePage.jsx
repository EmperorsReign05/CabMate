import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useJsApiLoader } from "@react-google-maps/api";
import LocationAutocomplete from "../components/LocationAutocomplete";
import {
  Container, Box, TextField, Button, Typography, CircularProgress,
  FormControlLabel, Checkbox, Tooltip, Stack, Chip, IconButton,
  Paper, Grid, Fade
} from "@mui/material";
import { useNotification } from "../context/NotificationContext";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import SwapVertIcon from '@mui/icons-material/SwapVert';
import NotesIcon from '@mui/icons-material/Notes';

const libraries = ["places"];

const commonRoutes = [
  {
    label: "Hostel ➝ Station",
    from: { address: "GHS Hostel campus...", shortName: "GHS Hostel", lat: 26.84, lng: 75.56 },
    to: { address: "Railway Station...", shortName: "Jaipur Junction", lat: 26.91, lng: 75.78 }
  },
  {
    label: "Hostel ➝ Airport",
    from: { address: "GHS Hostel campus...", shortName: "GHS Hostel", lat: 26.84, lng: 75.56 },
    to: { address: "Airport Rd...", shortName: "Jaipur Airport", lat: 26.82, lng: 75.80 }
  },
  {
    label: "Hostel ➝ Sindhi Camp",
    from: { address: "GHS Hostel...", shortName: "GHS Hostel", lat: 26.84, lng: 75.56 },
    to: { address: "Sindhi Camp...", shortName: "Sindhi Camp", lat: 26.92, lng: 75.80 }
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
    remark: "", // ✅ NEW FIELD
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
    if (!session) { navigate("/login"); return; }
    const fetchProfile = async () => {
      const { data } = await supabase.from("profiles").select("gender").eq("id", session.user.id).single();
      setUserProfile(data);
    };
    fetchProfile();
  }, [session, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "seats_available" && value < 1 && value !== "") return;
    if (name === "cost_per_seat" && value < 0 && value !== "") return;
    setRideDetails({ ...rideDetails, [name]: value });
  };

  const handleSwap = () => { const temp = from; setFrom(to); setTo(temp); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!from || !to) { showNotification("Please select locations.", "warning"); return; }
    setLoading(true);

    const payload = {
      from_location: from.address,
      to_location: to.address,
      departure_time: new Date(rideDetails.departure_time).toISOString(),
      seats_available: Number(rideDetails.seats_available),
      price_per_seat: Number(rideDetails.cost_per_seat),
      is_ladies_only: isLadiesOnly,
      remark: rideDetails.remark, // ✅ SENDING REMARK
      created_by: session.user.id 
    };

    try {
      const res = await fetch("http://127.0.0.1:8000/rides/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload), 
      });
      if (!res.ok) throw new Error(await res.text());
      showNotification("Ride created successfully!", "success");
      navigate("/dashboard");
    } catch (error) {
      showNotification(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded || !userProfile) return <CircularProgress sx={{ mt: 5, mx: 'auto', display: 'block' }} />;

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Fade in={true} timeout={600}>
        <Paper
          elevation={0}
          component="form"
          onSubmit={handleSubmit}
          sx={{
            p: 4,
            borderRadius: '24px',
            background: 'rgba(255, 255, 255, 0.75)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.6)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.05)',
          }}
        >
          <Typography variant="h5" fontWeight="800" gutterBottom sx={{ color: '#2c3e50', textAlign: 'center', mb: 3 }}>
            Publish a Ride
          </Typography>

          {/* Quick Routes */}
          <Stack direction="row" spacing={1} sx={{ mb: 3, overflowX: 'auto', pb: 1, '::-webkit-scrollbar': { display: 'none' } }}>
            {commonRoutes.map((route) => (
              <Chip
                key={route.label}
                label={route.label}
                onClick={() => { setFrom(route.from); setTo(route.to); }}
                clickable
                sx={{
                  bgcolor: 'white',
                  fontWeight: 600,
                  color: '#ad57c1',
                  border: '1px solid rgba(173, 87, 193, 0.2)',
                  '&:hover': { bgcolor: '#f3e5f5' }
                }}
              />
            ))}
          </Stack>

          {/* Location Inputs */}
          <Box sx={{ position: 'relative', mb: 2 }}>
            <Box sx={{ bgcolor: 'white', borderRadius: 3, p: 0.5, mb: 1.5, boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
              <LocationAutocomplete label="Leaving from..." onPlaceSelect={setFrom} value={from} />
            </Box>

            <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 10 }}>
              <IconButton onClick={handleSwap} sx={{ bgcolor: 'white', border: '1px solid #eee', width: 32, height: 32, '&:hover': { bgcolor: '#f5f5f5' } }}>
                <SwapVertIcon fontSize="small" color="primary" sx={{ color: '#ad57c1' }} />
              </IconButton>
            </Box>

            <Box sx={{ bgcolor: 'white', borderRadius: 3, p: 0.5, boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
              <LocationAutocomplete label="Going to..." onPlaceSelect={setTo} value={to} />
            </Box>
          </Box>

          {/* Date & Time */}
          <TextField
            name="departure_time"
            label="Departure Time"
            type="datetime-local"
            value={rideDetails.departure_time}
            onChange={handleChange}
            fullWidth
            required
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 2, '& .MuiOutlinedInput-root': { bgcolor: 'white', borderRadius: 3 } }}
            onClick={(e) => e.target.showPicker && e.target.showPicker()}
          />

          {/* Seats & Cost - SIDE BY SIDE to save space */}
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={6}>
              <TextField
                name="seats_available"
                label="Seats"
                type="number"
                value={rideDetails.seats_available}
                onChange={handleChange}
                fullWidth
                required
                InputProps={{ inputProps: { min: 1 } }}
                sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'white', borderRadius: 3 } }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                name="cost_per_seat"
                label="Price (₹)"
                type="number"
                value={rideDetails.cost_per_seat}
                onChange={handleChange}
                fullWidth
                InputProps={{ inputProps: { min: 0 } }}
                sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'white', borderRadius: 3 } }}
              />
            </Grid>
          </Grid>

          {/* ✅ NEW: Remark Field */}
          <TextField
            name="remark"
            label="Remarks (Optional)"
            placeholder="e.g. Meeting at main gate, 2 bags max..."
            value={rideDetails.remark}
            onChange={handleChange}
            fullWidth
            multiline
            maxRows={2}
            InputProps={{
              startAdornment: <NotesIcon color="action" sx={{ mr: 1, opacity: 0.6 }} />,
            }}
            sx={{ 
                mb: 2, 
                '& .MuiOutlinedInput-root': { bgcolor: 'white', borderRadius: 3 } 
            }}
          />

          {/* Footer Actions */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
            {userProfile?.gender === "female" && (
              <FormControlLabel
                control={
                  <Checkbox checked={isLadiesOnly} onChange={(e) => setIsLadiesOnly(e.target.checked)} sx={{ color: '#ad57c1', '&.Mui-checked': { color: '#ad57c1' } }} />
                }
                label={<Typography variant="body2" fontWeight="600" color="text.secondary">Ladies Only</Typography>}
              />
            )}
            
            <Button
              type="submit"
              variant="contained"
              fullWidth={userProfile?.gender !== "female"} // Full width if not female (no checkbox)
              disabled={loading}
              sx={{
                flex: userProfile?.gender === "female" ? 1 : 'auto',
                ml: userProfile?.gender === "female" ? 2 : 0,
                py: 1.5,
                borderRadius: 3,
                background: 'linear-gradient(135deg, #ad57c1 0%, #7b1fa2 100%)',
                boxShadow: '0 4px 14px rgba(173, 87, 193, 0.4)',
                fontWeight: 'bold',
                textTransform: 'none',
                fontSize: '1rem',
                '&:hover': { boxShadow: '0 6px 20px rgba(173, 87, 193, 0.6)' }
              }}
            >
              {loading ? "Publishing..." : "Publish Ride"}
            </Button>
          </Box>
        </Paper>
      </Fade>
    </Container>
  );
};

export default CreateRidePage;