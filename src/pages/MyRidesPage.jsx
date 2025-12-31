import React, { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { 
  Container, Typography, Box, Grid, Card, CardContent, 
  CardHeader, CircularProgress, Button, Avatar, Chip, Stack, Divider 
} from '@mui/material';
import { CheckCircleOutline, HighlightOff, WhatsApp, Person, VerifiedUser } from '@mui/icons-material';
import { useNotification } from '../context/NotificationContext';
import RideCard from '../components/RideCard';
const API_BASE = import.meta.env.VITE_API_BASE_URL;
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

    const fetchAllMyRides = async () => {
      try {
        const res = await fetch(
          `${API_BASE}/rides/user/${session.user.id}`
        );

        if (!res.ok) {
          throw new Error("Failed to fetch rides");
        }

        const data = await res.json();
        setCreatedRides(data.created || []); 
        setJoinedRides(data.joined || []);
        setLoading(false);
      } catch (err) {
        console.error(err);
        showNotification("Could not load your rides", "error");
        setLoading(false);
      }
    };

    fetchAllMyRides();
  }, [session]);

  const fetchRideRequests = async (rideId) => {
    if (rideRequests[rideId]) {
        setRideRequests((prev) => {
            const newState = { ...prev };
            delete newState[rideId];
            return newState;
        });
        return;
    }

    try {
      setLoadingRequests(true);
      const res = await fetch(`${API_BASE}/rides/${rideId}/requests`);
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
    await fetch(`${API_BASE}/rides/${rideId}/requests/${requesterId}/approve`, { method: "POST" });
    
    setRideRequests((prev) => ({
      ...prev,
      [rideId]: prev[rideId].map((r) => 
        r.requester_id === requesterId ? { ...r, status: 'approved' } : r
      ),
    }));

    setCreatedRides((prev) =>
      prev.map((ride) =>
        ride._id === rideId ? { ...ride, seats_available: ride.seats_available - 1 } : ride
      )
    );
  };

  const handleReject = async (rideId, requesterId) => {
    await fetch(`${API_BASE}/rides/${rideId}/requests/${requesterId}/reject`, { method: "POST" });
    
    setRideRequests((prev) => ({
      ...prev,
      [rideId]: prev[rideId].filter((r) => r.requester_id !== requesterId),
    }));
  };

  const handleDelete = async (rideId) => {
    if (window.confirm('Are you sure you want to delete this ride? This action cannot be undone.')) {
      try {
        const res = await fetch(`${API_BASE}/rides/${rideId}?user_id=${session.user.id}`, {
            method: 'DELETE',
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.detail || 'Failed to delete ride');
        }

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
                px: 3,
                borderRadius: 2,
                textTransform: 'none',
                backgroundColor: '#ad57c1ff',
                fontWeight: 'bold',
                '&:hover': { backgroundColor: '#4A148C' },
              }}>
                + Create New
              </Button>
            }
          />
          <CardContent>
            {createdRides.length > 0 ? (
              <Grid container spacing={3}>
                {createdRides.map((ride) => {
                  const allRequests = rideRequests[ride._id] || [];
                  const pendingRequests = allRequests.filter(r => r.status === 'pending');
                  const approvedRequests = allRequests.filter(r => r.status === 'approved');

                  return (
                    <Grid item xs={12} sm={6} md={4} key={ride._id}>
                      <Box sx={{ mb: 2 }}>
                        <RideCard 
                          ride={ride} 
                          isCreator={true} 
                          onDelete={handleDelete} 
                        />
                        
                        <Button
                          size="small"
                          sx={{ mt: 1, textTransform: 'none', color: '#666' }}
                          onClick={() => fetchRideRequests(ride._id)}
                        >
                          {rideRequests[ride._id] ? 'Hide Requests' : 'View Requests'}
                        </Button>
                      </Box>
                      {(pendingRequests.length > 0 || approvedRequests.length > 0) && (
                        <Box sx={{ 
                          mt: 1, 
                          p: 2, 
                          bgcolor: 'white', 
                          borderRadius: 3, 
                          boxShadow: '0 4px 12px rgba(0,0,0,0.05)' 
                        }}>
                          
                          {pendingRequests.length > 0 && (
                            <Box sx={{ mb: approvedRequests.length > 0 ? 2 : 0 }}>
                              <Typography variant="caption" sx={{ color: 'orange', fontWeight: 'bold', mb: 1, display: 'block' }}>
                                PENDING REQUESTS
                              </Typography>
                              
                              {pendingRequests.map((req) => (
                                <Box key={req._id} sx={{ mb: 2, pb: 2, borderBottom: '1px dashed #eee' }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                      <Avatar sx={{ width: 24, height: 24, bgcolor: '#ff9800' }}>
                                          <Person sx={{ fontSize: 16 }} />
                                      </Avatar>
                                      <Typography variant="body2" fontWeight="600">
                                          {req.requester?.full_name || "Unknown user"}
                                      </Typography>
                                  </Box>
                                  <Stack direction="row" spacing={1}>
                                    <Button 
                                      variant="contained" 
                                      size="small" 
                                      startIcon={<CheckCircleOutline />}
                                      onClick={() => handleApprove(ride._id, req.requester_id)}
                                      disabled={ride.seats_available === 0}
                                      sx={{ flex: 1, bgcolor: '#00c853', color: 'white', fontWeight: 'bold', textTransform: 'none', borderRadius: 2 }}
                                    >
                                      Approve
                                    </Button>
                                    <Button 
                                      variant="outlined" size="small" color="error"
                                      onClick={() => handleReject(ride._id, req.requester_id)}
                                      sx={{ minWidth: '40px', borderRadius: 2 }}
                                    >
                                      <HighlightOff />
                                    </Button>
                                    <Button 
                                      variant="contained" size="small" 
                                      onClick={() => {
                                          if (!req.requester?.phone) { alert("Phone number not available"); return; }
                                          openWhatsApp(req.requester.phone, req.requester.full_name, ride.from_location, ride.to_location);
                                      }}
                                      sx={{ minWidth: '40px', bgcolor: '#25D366', color: 'white', borderRadius: 2 }}
                                    >
                                      <WhatsApp />
                                    </Button>
                                  </Stack>
                                </Box>
                              ))}
                            </Box>
                          )}
                          {approvedRequests.length > 0 && (
                            <Box>
                              <Typography variant="caption" sx={{ color: '#00c853', fontWeight: 'bold', mb: 1, display: 'block' }}>
                                APPROVED PASSENGERS
                              </Typography>
                              
                              {approvedRequests.map((req) => (
                                <Box key={req._id} sx={{ 
                                  display: 'flex', 
                                  justifyContent: 'space-between', 
                                  alignItems: 'center', 
                                  mb: 1, 
                                  p: 1,
                                  bgcolor: '#f1f8e9',
                                  borderRadius: 2
                                }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <Avatar sx={{ width: 24, height: 24, bgcolor: '#00c853' }}>
                                          <VerifiedUser sx={{ fontSize: 14 }} />
                                      </Avatar>
                                      <Typography variant="body2" fontWeight="600">
                                          {req.requester?.full_name || "Passenger"}
                                      </Typography>
                                  </Box>
                                  
                                  <Button 
                                    size="small" 
                                    onClick={() => {
                                        if (!req.requester?.phone) { alert("Phone number not available"); return; }
                                        openWhatsApp(req.requester.phone, req.requester.full_name, ride.from_location, ride.to_location);
                                    }}
                                    sx={{ minWidth: '32px', color: '#25D366' }}
                                  >
                                    <WhatsApp />
                                  </Button>
                                </Box>
                              ))}
                            </Box>
                          )}
                        </Box>
                      )}
                    </Grid>
                  );
                })}
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
              <Grid container spacing={3}>
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