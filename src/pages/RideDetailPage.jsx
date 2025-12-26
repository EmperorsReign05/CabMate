import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Box,
  CircularProgress,
} from "@mui/material";
import { useNotification } from "../context/NotificationContext";

const RideDetailPage = ({ session }) => {
  const { id: rideId } = useParams();
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [hasRequested, setHasRequested] = useState(false);


  const user = session?.user ?? null;

  /** FETCH RIDE */
  useEffect(() => {
  let mounted = true;

  const fetchRide = async () => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/rides/${rideId}`);
      if (!res.ok) throw new Error("Ride not found");
      const data = await res.json();
      if (mounted) setRide(data);
    } catch {
      showNotification("Could not fetch the requested ride.", "error");
    } finally {
      if (mounted) setLoading(false);
    }
  };

  if (rideId) fetchRide();

  return () => {
    mounted = false;
  };
}, [rideId, showNotification]);


  /** CREATOR CHECK */
  //const isCreator =
  // user && ride && user.id === ride.created_by;
  const isCreator = session?.user?.id === ride?.created_by;


  /** REQUEST TO JOIN */
  const handleRequestToJoin = async () => {
  if (!rideId || !user?.id) {
    showNotification("Ride or user not loaded yet", "error");
    return;
  }

  setRequesting(true);

  try {
    const res = await fetch(
      `http://127.0.0.1:8000/rides/${rideId}/request`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user.id }),
      }
    );

    if (res.status === 400) {
  showNotification("You have already requested to join this ride.", "info");
  setHasRequested(true);
  return;
}

if (!res.ok) {
  throw new Error("Failed to request ride");
}


    setRequestSent(true);
    showNotification("Request sent successfully", "success");
  } catch {
    showNotification("Could not send request", "error");
  } finally {
    setRequesting(false);
  }
};

  /** LOADING */
  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!ride) {
    return (
      <Typography sx={{ textAlign: "center", mt: 4 }}>
        Ride not found.
      </Typography>
    );
  }
console.log("rideId:", rideId);
console.log("ride:", ride);

  return (
    <Container maxWidth="md">
      <Card sx={{ mt: 4, p: 2 }}>
        <CardContent>
          <Typography variant="h4" fontWeight="bold">
            Ride from {ride.from_location} to {ride.to_location}
          </Typography>

          <Typography variant="h6" sx={{ mt: 2 }}>
            Departure: {new Date(ride.departure_time).toLocaleString()}
          </Typography>

          <Typography variant="h6">
            Seats Available: {ride.seats_available}
          </Typography>
          
          <Button
  fullWidth
  variant="contained"
  sx={{ mt: 3, backgroundColor: "#ad57c1ff" }}
  disabled={
    requesting ||
    requestSent ||
    hasRequested ||
    isCreator ||
    ride.seats_available === 0
  }
  onClick={handleRequestToJoin}
>
  {isCreator
    ? "YOU CREATED THIS RIDE"
    : hasRequested || requestSent
    ? "REQUEST SENT"
    : ride.seats_available === 0
    ? "NO SEATS AVAILABLE"
    : "REQUEST TO JOIN"}
</Button>

        </CardContent>
      </Card>
    </Container>
  );
};

export default RideDetailPage;
