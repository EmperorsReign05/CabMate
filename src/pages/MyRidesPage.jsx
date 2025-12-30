// src/pages/MyRidesPage.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Container, Typography, Box, Grid, Card, CardContent, CardHeader, CircularProgress, Button } from '@mui/material';
import { useNotification } from '../context/NotificationContext';
import RideCard from '../components/RideCard';

const MyRidesPage = ({ session }) => {
  const navigate = useNavigate();
  const [createdRides, setCreatedRides] = useState([]);
  const [joinedRides, setJoinedRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showNotification } = useNotification();
  const [rideRequests, setRideRequests] = useState({});
  const [loadingRequests, setLoadingRequests] = useState(false);

  useEffect(() => {
    if (!session) return;

    const fetchMyCreatedRides = async () => {
      try {
        const res = await fetch(
          `http://127.0.0.1:8000/rides/my-created?user_id=${session.user.id}`
        );

        if (!res.ok) {
          throw new Error("Failed to fetch created rides");
        }

        const data = await res.json();
        setCreatedRides(data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        showNotification("Could not load your rides", "error");
        setLoading(false);
      }
    };

    fetchMyCreatedRides();
  }, [session]);

  const fetchRideRequests = async (rideId) => {
    try {
      setLoadingRequests(true);
      const res = await fetch(`http://127.0.0.1:8000/rides/${rideId}/requests`);
      if (!res.ok) throw new Error("Failed to fetch requests");
      const data = await res.json();
      setRideRequests((prev) => ({ ...prev, [rideId]: data }));
    } catch (err) {
      showNotification("Could not load ride requests", "error");
    } finally {
      setLoadingRequests(false);
    }
  };

  const handleApprove = async (rideId, requesterId) => {
    await fetch(`http://127.0.0.1:8000/rides/${rideId}/requests/${requesterId}/approve`, { method: "POST" });
    setRideRequests((prev) => ({
      ...prev,
      [rideId]: prev[rideId].filter((r) => r.requester_id !== requesterId),
    }));
    setCreatedRides((prev) =>
      prev.map((ride) =>
        ride._id === rideId ? { ...ride, seats_available: ride.seats_available - 1 } : ride
      )
    );
  };

  const handleReject = async (rideId, requesterId) => {
    await fetch(`http://127.0.0.1:8000/rides/${rideId}/requests/${requesterId}/reject`, { method: "POST" });
    setRideRequests((prev) => ({
      ...prev,
      [rideId]: prev[rideId].filter((r) => r.requester_id !== requesterId),
    }));
  };

  // ✅ NEW DELETE FUNCTION
  const handleDelete = async (rideId) => {
    if (window.confirm('Are you sure you want to delete this ride? This action cannot be undone.')) {
      try {
        // Pass user_id as a query param for ownership verification
        const res = await fetch(`http://127.0.0.1:8000/rides/${rideId}?user_id=${session.user.id}`, {
            method: 'DELETE',
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.detail || 'Failed to delete ride');
        }

        // Remove from UI immediately
        setCreatedRides(prevRides => prevRides.filter(ride => ride._id !== rideId));
        showNotification('Ride deleted successfully', 'success');

      } catch (error) {
        console.error("Delete Error:", error);
        showNotification(error.message, 'error');
      }
    }
  };

  const openWhatsApp = (phone, name, from, to) => {
    const message = encodeURIComponent(`Hi ${name}, about the CabMate ride from ${from} to ${to}.`);
    window.open(`https://wa.me/${phone}?text=${message}`, "_blank");
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  }

  const cardStyles = {
    borderRadius: 4,
    border: '1px solid rgba(255, 255, 255, 0.5)',
    bgcolor: 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(4px)',
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Card sx={cardStyles}>
          <CardHeader
            title={<Typography variant="h5" component="h1" sx={{ fontWeight: 'bold' }}>Rides Created</Typography>}
            action={
              <Button component={RouterLink} to="/create" variant="contained" sx={{
                height: '35px',
                width: { xs: '100%', md: 'auto' },
                px: 4,
                backgroundColor: '#ad57c1ff',
                '&:hover': { backgroundColor: '#4A148C' },
              }}>
                Create New Ride
              </Button>
            }
          />
          <CardContent>
            {createdRides.length > 0 ? (
              <Grid container spacing={2}>
                {createdRides.map((ride) => (
                  <Grid item xs={12} sm={6} md={4} key={ride._id}>
                    <Box sx={{ mt: 1 }}>
                      <RideCard 
                        ride={ride} 
                        isCreator={true} 
                        onDelete={handleDelete} 
                      />

                      <Button
                        size="small"
                        sx={{ mt: 1 }}
                        onClick={() => fetchRideRequests(ride._id)}
                      >
                        View Requests
                      </Button>
                    </Box>
                    {rideRequests[ride._id]?.length > 0 && (
                      <Box sx={{ mt: 1 }}>
                        {rideRequests[ride._id].map((req) => (
                          <Box key={req._id} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                            <Typography variant="body2">{req.requester?.full_name || "Unknown user"}</Typography>
                            <Box>
                              <Button size="small" variant="contained" sx={{ mr: 1 }} disabled={ride.seats_available === 0} onClick={() => handleApprove(ride._id, req.requester_id)}>Approve</Button>
                              <Button size="small" variant="outlined" color="error" onClick={() => handleReject(ride._id, req.requester_id)}>Reject</Button>
                              <Button size="small" color="success" onClick={() => {
                                if (!req.requester?.phone) { alert("Phone number not available"); return; }
                                openWhatsApp(req.requester.phone, req.requester.full_name, ride.from_location, ride.to_location);
                              }}>CHAT</Button>
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    )}
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Typography sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>You haven't created any rides yet.</Typography>
            )}
          </CardContent>
        </Card>
      </Box>

      <Box>
        <Card sx={cardStyles}>
          <CardHeader title={<Typography variant="h5" component="h1" sx={{ fontWeight: 'bold' }}>Rides Joined</Typography>} />
          <CardContent>
            {joinedRides.length > 0 ? (
              <Grid container spacing={2}>
                {joinedRides.map(ride => (
                  <Grid item xs={12} sm={6} md={4} key={ride._id}>
                    <RideCard ride={ride} />
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Typography sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>You haven't joined any rides yet.</Typography>
            )}
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default MyRidesPage;