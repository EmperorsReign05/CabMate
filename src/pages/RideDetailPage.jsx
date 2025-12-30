import React, { useState, useEffect } from "react";
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
  
  // ✅ NEW: Track the specific status of the current user's request
  const [myRequestStatus, setMyRequestStatus] = useState(null); // 'pending', 'approved', 'rejected'
  const [requesting, setRequesting] = useState(false);

  const user = session?.user ?? null;

  const openWhatsApp = (phone, from, to) => {
    const message = encodeURIComponent(
      `Hi, I found your CabMate ride from ${from} to ${to}.`
    );
    window.open(`https://wa.me/${phone}?text=${message}`, "_blank");
  };

  /** FETCH RIDE & STATUS */
  useEffect(() => {
    let mounted = true;

    const fetchRideAndStatus = async () => {
      try {
        // 1. Fetch Ride Details
        const res = await fetch(`http://127.0.0.1:8000/rides/${rideId}`);
        if (!res.ok) throw new Error("Ride not found");
        const rideData = await res.json();
        
        if (mounted) setRide(rideData);

        // 2. ✅ NEW: Fetch Requests to check my status
        if (user?.id) {
          const reqRes = await fetch(`http://127.0.0.1:8000/rides/${rideId}/requests`);
          if (reqRes.ok) {
            const requests = await reqRes.json();
            const myReq = requests.find((r) => r.requester_id === user.id);
            if (myReq && mounted) {
              setMyRequestStatus(myReq.status);
            }
          }
        }

      } catch (err) {
        console.error(err);
        showNotification("Could not fetch ride details.", "error");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    if (rideId) fetchRideAndStatus();

    return () => {
      mounted = false;
    };
  }, [rideId, user, showNotification]);

  const isCreator = user?.id === ride?.created_by;

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
        setMyRequestStatus("pending"); // Optimistic update
        return;
      }

      if (!res.ok) {
        throw new Error("Failed to request ride");
      }

      setMyRequestStatus("pending"); // Update UI immediately
      showNotification("Request sent successfully", "success");
    } catch {
      showNotification("Could not send request", "error");
    } finally {
      setRequesting(false);
    }
  };

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

          {ride.remark && (
  <Box sx={{ 
      mt: 3, 
      p: 2, 
      bgcolor: 'rgba(173, 87, 193, 0.08)', 
      borderRadius: 2, 
      border: '1px dashed rgba(173, 87, 193, 0.3)' 
  }}>
      <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#ad57c1', textTransform: 'uppercase' }}>
          Note from Ride Creator
      </Typography>
      <Typography variant="body1" sx={{ color: '#4a4a4a', mt: 0.5 }}>
          "{ride.remark}"
      </Typography>
  </Box>
)}

          <Button
            fullWidth
            variant="contained"
            sx={{ mt: 3, backgroundColor: "#ad57c1ff" }}
            disabled={
              requesting ||
              isCreator ||
              myRequestStatus === "pending" ||
              myRequestStatus === "approved" ||
              myRequestStatus === "rejected" ||
              ride.seats_available === 0
            }
            onClick={handleRequestToJoin}
          >
            
            {isCreator
              ? "YOU CREATED THIS RIDE"
              : myRequestStatus === "approved"
              ? " YOU'VE JOINED THIS RIDE"
              : myRequestStatus === "pending"
              ? " REQUEST PENDING"
              : myRequestStatus === "rejected"
              ? " REQUEST REJECTED"
              : ride.seats_available === 0
              ? "NO SEATS AVAILABLE"
              : "REQUEST TO JOIN"}
          </Button>

          {ride?.creator?.phone && (
            <Button
              fullWidth
              variant="outlined"
              color="success"
              sx={{ mt: 2 }}
              onClick={() =>
                openWhatsApp(ride.creator.phone, ride.from_location, ride.to_location)
              }
            >
              CHAT ON WHATSAPP
            </Button>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default RideDetailPage;