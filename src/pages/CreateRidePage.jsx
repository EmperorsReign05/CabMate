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
} from "@mui/material";
import { useNotification } from "../context/NotificationContext";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

const libraries = ["places"];
const API_BASE = import.meta.env.VITE_API_BASE_URL;

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

  // Fetch user profile (Supabase is still fine for auth/profile)
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
    setRideDetails({ ...rideDetails, [e.target.name]: e.target.value });
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
      /*if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Failed to create ride");
      }*/

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
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Create a New Ride
        </Typography>

        <Box sx={{ mb: 2 }}>
          <LocationAutocomplete label="From" onPlaceSelect={setFrom} />
        </Box>

        <Box sx={{ mb: 2 }}>
          <LocationAutocomplete label="To" onPlaceSelect={setTo} />
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
        />

        <TextField
          name="cost_per_seat"
          label="Cost per Seat (₹)"
          type="number"
          value={rideDetails.cost_per_seat}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />

        {/* Ladies-only option */}
        {userProfile.gender === "female" && (
          <>
            <FormControlLabel
              control={
                <Checkbox
                  checked={isLadiesOnly}
                  onChange={(e) => setIsLadiesOnly(e.target.checked)}
                />
              }
              label="This is a ladies-only ride"
            />
            <Tooltip title="Only female students will be able to see and join this ride.">
              <InfoOutlinedIcon
                sx={{ ml: 1, verticalAlign: "middle", color: "text.secondary" }}
              />
            </Tooltip>
          </>
        )}

        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={loading}
          sx={{
            mt: 2,
            height: "40px",
            backgroundColor: "#ad57c1ff",
            "&:hover": { backgroundColor: "#4A148C" },
          }}
        >
          {loading ? "Creating..." : "Create Ride"}
        </Button>
      </Box>
    </Container>
  );
};

export default CreateRidePage;
