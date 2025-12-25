// src/pages/RideDetailPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Container, Typography, Button, Card, CardContent, Box, CircularProgress, List, ListItem, ListItemText, Divider, Chip, Stack } from '@mui/material';
import { useNotification } from '../context/NotificationContext';
import RideChat from '../components/RideChat';

const RideDetailPage = ({ session }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ride, setRide] = useState(null);
  const [passengers, setPassengers] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [creator, setCreator] = useState(null);
  const [creatorProfile, setCreatorProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const { showNotification } = useNotification();
  const [userRequestStatus, setUserRequestStatus] = useState(null);
  

  const fetchRideDetails = useCallback(async () => {
    const rideId = id;
    setLoading(true);
    try {
      const res = await fetch(`http://127.0.0.1:8000/rides/${rideId}`);

if (!res.ok) {
  throw new Error("Ride not found");
}
      const data = await res.json();
      setRide(data);

      // Fetch minimal creator profile first (more likely allowed by RLS)
      const { data: creatorMinimal, error: creatorMinimalError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('id', data.creator_id)
        .single();
      if (creatorMinimalError) throw creatorMinimalError;
      setCreator(creatorMinimal);
      setCreatorProfile(creatorMinimal);

      // Try to enrich creator profile with contact fields; ignore if not permitted
      try {
        const { data: creatorExtra } = await supabase
          .from('profiles')
          .select('email, phone_number')
          .eq('id', rideData.creator_id)
          .single();
        if (creatorExtra) {
          setCreatorProfile({ ...creatorMinimal, ...creatorExtra });
        }
      } catch (_) {
        // silently ignore extra field fetch failures
      }

      // Fetch passengers with minimal fields to ensure success
      const { data: passengerData, error: passengerError } = await supabase
        .from('ride_passengers')
        .select('user_id, status, profiles(id, full_name)')
        .eq('ride_id', id);
      if (passengerError) throw passengerError;

      const cleanPassengerData = passengerData.map(p => ({ ...p, profiles: p.profiles })).filter(p => p.user_id);

      // Determine current user's status before optional enrichment
      if (session) {
        const currentUserRequest = cleanPassengerData.find(p => p.user_id === session.user.id);
        setUserRequestStatus(currentUserRequest ? currentUserRequest.status : null);
      }

      // Optionally enrich approved passengers with contact info; ignore failures
      try {
        const approved = cleanPassengerData.filter(p => p.status === 'approved');
        const approvedIds = approved.map(p => p.profiles?.id).filter(Boolean);
        if (approvedIds.length > 0) {
          const { data: profileExtras } = await supabase
            .from('profiles')
            .select('id, email, phone_number')
            .in('id', approvedIds);
          if (profileExtras) {
            const extrasMap = Object.fromEntries(profileExtras.map(pe => [pe.id, pe]));
            approved.forEach(p => {
              const extra = extrasMap[p.profiles?.id];
              if (extra) {
                p.profiles = { ...p.profiles, ...extra };
              }
            });
          }
        }
      } catch (_) {
        // ignore enrichment failures due to RLS
      }

      setPassengers(cleanPassengerData.filter(p => p.status === 'approved'));
      setPendingRequests(cleanPassengerData.filter(p => p.status === 'pending'));

    } catch (error) {
      console.error("Critical Fetch Error:", error);
      showNotification('Could not fetch the requested ride.', 'error');
    } finally {
      setLoading(false);
    }
  }, [id, session, showNotification]);

  useEffect(() => {
    fetchRideDetails();
  }, [fetchRideDetails]);


  const handleRequestRide = async () => {
    if (!session) {
      showNotification('You must be logged in to request a ride.', 'warning');
      navigate('/login');
      return;
    }
    setIsProcessing(true);
    try {
      const { error } = await supabase.from('ride_passengers').insert([{ ride_id: ride.id, user_id: session.user.id, status: 'pending' }]);
      if (error) throw error;
      setUserRequestStatus('pending'); 
      showNotification('Your request has been sent!', 'success');
      fetchRideDetails();
    } catch (error) {
      if (error.code === '23505') {
        showNotification('You have already sent a request for this ride.', 'warning');
        setUserRequestStatus('pending');
      } else {
        showNotification('Failed to send request: ' + error.message, 'error');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApproveRequest = async (passengerUserId) => {
    setIsProcessing(true);
    try {
      const { error } = await supabase.rpc('approve_ride_request', {
        ride_id_to_approve: ride.id,
        user_id_to_approve: passengerUserId
      });
      if (error) throw error;
      showNotification('Passenger approved!', 'success');
      fetchRideDetails();
    } catch (error) {
      showNotification('Failed to approve request: ' + error.message, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  }
  if (!ride) {
    return <Typography sx={{ textAlign: 'center', mt: 4 }}>Ride not found or you do not have permission to view it.</Typography>;
  }

  const isCreator = session && session.user.id === creator?.id;
  const isApprovedPassenger = userRequestStatus === 'approved';
  const canViewChat = isCreator || isApprovedPassenger;
  const canRequest = session && !isCreator && ride.seats_available > 0 && !userRequestStatus;

  return (
    <Container maxWidth="md">
      <Card sx={{ mt: 4, p: 2 }}>
        <CardContent>
          
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
            Ride from {ride.from_display || ride.from} to {ride.to_display || ride.to}
          </Typography>
          
          {creator && <Typography variant="subtitle1" color="text.secondary">Created by: {creator.full_name || 'A user'}</Typography>}
          
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            Departure: {new Date(ride.departure_time).toLocaleString()}
          </Typography>
          
          <Typography variant="h6">Seats Available: {ride.seats_available}</Typography>

          {canRequest && (
            <Button variant="contained" onClick={handleRequestRide} disabled={isProcessing} sx={{ 
              mt: 2, 
              width: '100%',
              backgroundColor: '#ad57c1ff',
              '&:hover': {
                backgroundColor: '#4A148C',
              },
            }}>
              {isProcessing ? 'Sending...' : 'Request to Join'}
            </Button>
          )}
          {userRequestStatus === 'pending' && <Chip label="Request Sent" color="info" sx={{ mt: 2, width: '100%' }} />}
          {userRequestStatus === 'approved' && <Chip label="You're a passenger!" color="success" sx={{ mt: 2, width: '100%' }} />}
          
          <Divider sx={{ my: 3 }} />

          {isCreator && (
            <Box mb={2}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>My Contact Info</Typography>
              <Typography>Email: {session?.user?.email}</Typography>
              <Typography>Phone: {creatorProfile?.phone_number || 'Not provided'}</Typography>
            </Box>
          )}

          {isCreator && pendingRequests.length > 0 && (
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Pending Requests ({pendingRequests.length})</Typography>
              <List>
                {pendingRequests.map(req => (
                  // --- FIX #2: The key and the approve function now use req.user_id, which is always correct ---
                  <ListItem key={req.user_id} secondaryAction={
                    <Stack direction="row" spacing={1}>
                      <Button 
                        variant="outlined" 
                        size="small" 
                        onClick={() => handleApproveRequest(req.user_id)} 
                        disabled={isProcessing || ride.seats_available === 0}
                      >
                        Approve
                      </Button>
                    </Stack>
                  }>
                    <ListItemText primary={req.profiles?.full_name || 'User with no profile'} />
                  </ListItem>
                ))}
              </List>
              <Divider sx={{ my: 3 }} />
            </Box>
          )}
          

          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Approved Passengers ({passengers.length})</Typography>
          {passengers.length > 0 ? (
            <List>
              {passengers.map(passenger => (
                <ListItem key={passenger.user_id}>
                  <ListItemText
                    primary={passenger.profiles?.full_name || 'A user'}
                    secondary={
                      (isCreator || (isApprovedPassenger && passenger.profiles?.id === session?.user?.id)) && (
                        <>
                          <Typography component="span" variant="body2">Email: {passenger.profiles?.email || 'Not available'}</Typography>
                          <br />
                          <Typography component="span" variant="body2">Phone: {passenger.profiles?.phone_number || 'Not provided'}</Typography>
                        </>
                      )
                    }
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>No passengers have joined yet.</Typography>
          )}

          {isApprovedPassenger && creatorProfile && (
            <Box mt={2}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Creator's Contact Info</Typography>
              <Typography>Name: {creatorProfile.full_name}</Typography>
              <Typography>Email: {creatorProfile.email || 'Not available'}</Typography>
              <Typography>Phone: {creatorProfile.phone_number || 'Not provided'}</Typography>
            </Box>
          )}
        </CardContent>
      </Card>
      {canViewChat && (
        <RideChat rideId={ride.id} session={session} creatorId={creator.id} />
      )}

    </Container>
  );
};

export default RideDetailPage;