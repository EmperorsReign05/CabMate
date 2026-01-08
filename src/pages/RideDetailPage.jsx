import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container, Typography, Button, Paper, Box, CircularProgress,
  Avatar, Chip, Stack, Divider, Fade, Grid
} from "@mui/material";
import {
  Event, Schedule, Person, WhatsApp, Circle, LocationOn,
  ArrowBack, VerifiedUser, InfoOutlined
} from "@mui/icons-material";
import { useNotification } from "../context/NotificationContext";
const API_BASE = import.meta.env.VITE_API_BASE_URL;
const THEME = {
  primary: '#ad57c1',
  gradient: 'linear-gradient(135deg, #ad57c1 0%, #7b1fa2 100%)',
  glass: 'rgba(255, 255, 255, 0.8)',
  glassBorder: '1px solid rgba(255, 255, 255, 0.6)',
};

const RideDetailPage = ({ session }) => {
  const { id: rideId } = useParams();
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [myRequestStatus, setMyRequestStatus] = useState(null);
  const [requesting, setRequesting] = useState(false);

  const user = session?.user ?? null;

  const openWhatsApp = () => {
    if (user?.email === 'guest@cabmate.com') {
      showNotification("You are on a guest login", "warning");
      return;
    }

    if (!ride?.creator?.phone) {
      showNotification("Creator's phone number not available", "warning");
      return;
    }

    let text = `Hi ${ride.creator.full_name}, I saw your CabMate ride from ${ride.from_location.split(',')[0]} to ${ride.to_location.split(',')[0]}.`;

    if (myRequestStatus === 'approved') {
      text = `Hi ${ride.creator.full_name}, I'm confirmed for your CabMate ride. Just wanted to coordinate!`;
    } else if (myRequestStatus === 'pending') {
      text = `Hi ${ride.creator.full_name}, I just requested to join your CabMate ride. Can you please check?`;
    }

    const message = encodeURIComponent(text);
    window.open(`https://wa.me/${ride.creator.phone}?text=${message}`, "_blank");
  };

  useEffect(() => {
    let mounted = true;

    const fetchRideAndStatus = async () => {
      try {
        const res = await fetch(`${API_BASE}/rides/${rideId}`);
        if (!res.ok) throw new Error("Ride not found");
        const rideData = await res.json();

        if (mounted) setRide(rideData);

        if (user?.id) {
          const reqRes = await fetch(`${API_BASE}/rides/${rideId}/requests`);
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
    return () => { mounted = false; };
  }, [rideId, user, showNotification]);

  const handleRequestToJoin = async () => {
    if (!rideId || !user?.id) return;

    if (user.email === 'guest@cabmate.com') {
      showNotification("You are on a guest login", "warning");
      return;
    }

    setRequesting(true);
    try {
      const res = await fetch(`${API_BASE}/rides/${rideId}/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user.id }),
      });

      if (res.status === 400) {
        showNotification("Request already sent.", "info");
        setMyRequestStatus("pending");
        return;
      }
      if (!res.ok) throw new Error("Failed");
      setMyRequestStatus("pending");
      showNotification("Request sent successfully!", "success");
    } catch {
      showNotification("Could not send request", "error");
    } finally {
      setRequesting(false);
    }
  };

  if (loading) return <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}><CircularProgress sx={{ color: '#ad57c1' }} /></Box>;
  if (!ride) return <Typography sx={{ mt: 10, textAlign: "center" }}>Ride not found.</Typography>;

  const isCreator = user?.id === ride?.created_by;
  const dateStr = new Date(ride.departure_time).toLocaleString("en-IN", { weekday: 'short', day: 'numeric', month: 'short' });
  const timeStr = new Date(ride.departure_time).toLocaleString("en-IN", { hour: 'numeric', minute: '2-digit' });

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>

      {/*back*/}
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate(-1)}
        sx={{ mb: 2, color: '#666', textTransform: 'none', fontWeight: 600 }}
      >
        Back
      </Button>

      <Fade in={true} timeout={600}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 5 },
            borderRadius: '32px',
            background: THEME.glass,
            backdropFilter: 'blur(20px)',
            border: THEME.glassBorder,
            boxShadow: '0 20px 60px rgba(173, 87, 193, 0.15)',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4, flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h4" fontWeight="800" sx={{ color: '#2c3e50', letterSpacing: '-1px' }}>
                Ride Details
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1, color: 'text.secondary' }}>
                <Event fontSize="small" />
                <Typography fontWeight="500">{dateStr} • {timeStr}</Typography>
              </Stack>
            </Box>

            {myRequestStatus && (
              <Chip
                label={myRequestStatus === 'approved' ? "You've Joined" : myRequestStatus === 'rejected' ? "Request Rejected" : "Request Pending"}
                color={myRequestStatus === 'approved' ? 'success' : myRequestStatus === 'rejected' ? 'error' : 'warning'}
                sx={{ fontWeight: 'bold', borderRadius: '12px' }}
              />
            )}
          </Box>

          <Divider sx={{ mb: 4 }} />

          <Grid container spacing={4}>
            <Grid item xs={12} md={7}>
              <Box sx={{ position: 'relative', pl: 1 }}>
                <Box sx={{
                  position: 'absolute', top: 12, bottom: 32, left: '18px', width: '2px',
                  background: 'linear-gradient(to bottom, #ad57c1 0%, #e0e0e0 100%)'
                }} />

                {/* FROM */}
                <Box sx={{ display: 'flex', mb: 4, position: 'relative', zIndex: 1 }}>
                  <Box sx={{ width: '24px', display: 'flex', justifyContent: 'center', mt: 0.5, mr: 2 }}>
                    <Circle sx={{ fontSize: 16, color: '#ad57c1', bgcolor: 'white', borderRadius: '50%' }} />
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight="bold">FROM</Typography>
                    <Typography variant="h6" fontWeight="700" lineHeight={1.2}>
                      {ride.from_location}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', position: 'relative', zIndex: 1 }}>
                  <Box sx={{ width: '24px', display: 'flex', justifyContent: 'center', mt: 0.2, mr: 2 }}>
                    <LocationOn sx={{ fontSize: 24, color: '#ff5252' }} />
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight="bold">TO</Typography>
                    <Typography variant="h6" fontWeight="700" lineHeight={1.2}>
                      {ride.to_location}
                    </Typography>
                  </Box>
                </Box>
              </Box>
              {ride.remark && (
                <Box sx={{ mt: 4, p: 2, bgcolor: 'rgba(173, 87, 193, 0.08)', borderRadius: 3, border: '1px dashed rgba(173, 87, 193, 0.3)' }}>
                  <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                    <InfoOutlined fontSize="small" sx={{ color: '#ad57c1' }} />
                    <Typography variant="caption" fontWeight="bold" sx={{ color: '#ad57c1', textTransform: 'uppercase' }}>
                      Note from Ride Creator
                    </Typography>
                  </Stack>
                  <Typography variant="body2" color="#444">"{ride.remark}"</Typography>
                </Box>
              )}
            </Grid>
            <Grid item xs={12} md={5}>
              <Paper elevation={0} sx={{ p: 3, bgcolor: 'rgba(255,255,255,0.5)', borderRadius: '24px' }}>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Avatar sx={{ width: 48, height: 48, bgcolor: '#ad57c1', mr: 2 }}>
                    <Person />
                  </Avatar>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Ride Creator</Typography>
                    <Typography variant="h6" fontWeight="bold">
                      {ride.creator?.full_name || "Unknown User"}
                    </Typography>
                  </Box>
                </Box>

                <Stack direction="row" spacing={1} mb={3}>
                  <Chip label={`${ride.seats_available} Seats Left`} size="small" sx={{ bgcolor: '#e3f2fd', color: '#1976d2', fontWeight: 'bold' }} />
                  <Chip label={`₹${ride.price_per_seat}/seat`} size="small" sx={{ bgcolor: '#fce4ec', color: '#c2185b', fontWeight: 'bold' }} />
                </Stack>
                <Stack spacing={2}>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={handleRequestToJoin}
                    disabled={requesting || isCreator || myRequestStatus === 'pending' || myRequestStatus === 'approved' || myRequestStatus === 'rejected' || ride.seats_available === 0}
                    sx={{
                      py: 1.5,
                      borderRadius: '12px',
                      background: THEME.gradient,
                      fontWeight: 'bold',
                      textTransform: 'none',
                      boxShadow: '0 8px 20px rgba(173, 87, 193, 0.3)',
                      opacity: (isCreator || myRequestStatus) ? 0.7 : 1
                    }}
                  >
                    {isCreator ? "You Created This Ride" :
                      myRequestStatus === 'approved' ? "You're In! " :
                        myRequestStatus === 'pending' ? "Request Pending..." :
                          myRequestStatus === 'rejected' ? "Request Rejected" :
                            ride.seats_available === 0 ? "Ride Full" : "Request to Join"}
                  </Button>
                  {!isCreator && (
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<WhatsApp />}
                      onClick={openWhatsApp}
                      sx={{
                        py: 1.5,
                        borderRadius: '12px',
                        borderColor: '#25D366',
                        color: '#25D366',
                        fontWeight: 'bold',
                        textTransform: 'none',
                        borderWidth: '2px',
                        '&:hover': {
                          borderWidth: '2px',
                          bgcolor: 'rgba(37, 211, 102, 0.1)',
                          borderColor: '#128C7E',
                          color: '#128C7E'
                        }
                      }}
                    >
                      Chat on WhatsApp
                    </Button>
                  )}
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        </Paper>
      </Fade>
    </Container>
  );
};

export default RideDetailPage;