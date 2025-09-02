// src/pages/RideDetailPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Container, Typography, Button, Card, CardContent, Box, CircularProgress, List, ListItem, ListItemText, Divider, Chip, Stack } from '@mui/material';
import { useNotification } from '../context/NotificationContext';

const RideDetailPage = ({ session }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ride, setRide] = useState(null);
  const [passengers, setPassengers] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [creator, setCreator] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const { showNotification } = useNotification();

  // --- NEW: This state will track the current user's request status ---
  const [userRequestStatus, setUserRequestStatus] = useState(null); // null, 'pending', 'approved'

  const fetchRideDetails = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('rides')
        .select(`
          *,
          creator:profiles (id, full_name),
          passengers:ride_passengers (
            user_id,
            status,
            profiles (id, full_name)
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      setRide(data);
      setCreator(data.creator);
      
      // Separate passengers into approved and pending
      const approved = data.passengers.filter(p => p.status === 'approved').map(p => p.profiles);
      const pending = data.passengers.filter(p => p.status === 'pending');
      
      setPassengers(approved);
      setPendingRequests(pending);

      // Check if the current user has a pending or approved request
      if (session) {
        const currentUserRequest = data.passengers.find(p => p.profiles.id === session.user.id);
        setUserRequestStatus(currentUserRequest ? currentUserRequest.status : null);
      }

    } catch (error) {
      showNotification('Could not find the requested ride.', 'error');
      navigate('/');
    } finally {
      setLoading(false);
    }
  }, [id, navigate, showNotification, session]);

  useEffect(() => {
    fetchRideDetails();
  }, [fetchRideDetails]);

  // --- NEW: handleRequestRide function ---
  const handleRequestRide = async () => {
    if (!session) {
      showNotification('You must be logged in to request a ride.', 'warning');
      navigate('/login');
      return;
    }
    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from('ride_passengers')
        .insert([{ ride_id: ride.id, user_id: session.user.id, status: 'pending' }]);
      if (error) throw error;

      showNotification('Your request has been sent to the driver!', 'success');
      fetchRideDetails(); // Refresh data to show "Request Sent"
    } catch (error) {
      showNotification('Failed to send request: ' + error.message, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // --- NEW: handleApproveRequest function ---
  const handleApproveRequest = async (passengerUserId) => {
    setIsProcessing(true);
    try {
        // Use an RPC function to ensure this is an atomic operation
        const { error } = await supabase.rpc('approve_ride_request', {
            ride_id_to_approve: ride.id,
            user_id_to_approve: passengerUserId
        });

        if (error) throw error;

        showNotification('Passenger approved!', 'success');
        fetchRideDetails(); // Refresh data
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
    return <Typography>Ride not found.</Typography>;
  }

  const isCreator = session && session.user.id === creator.id;
  const canRequest = session && !isCreator && ride.seats_available > 0 && !userRequestStatus;

  // --- RENDER LOGIC ---
  return (
    <Container maxWidth="md">
      <Card sx={{ mt: 4 }}>
        <CardContent>
          <Typography variant="h4" component="h1" gutterBottom>
            Ride from {ride.from_display || ride.from} to {ride.to_display || ride.to}
          </Typography>
          
          {creator && <Typography variant="subtitle1">Created by: {creator.full_name || 'A user'}</Typography>}
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Departure: {new Date(ride.departure_time).toLocaleString()}
          </Typography>
          {/* ... other ride info ... */}
          <Typography variant="h6">Seats Available: {ride.seats_available}</Typography>

          {/* --- NEW: Dynamic Action Button --- */}
          {canRequest && (
            <Button variant="contained" onClick={handleRequestRide} disabled={isProcessing} sx={{ mt: 2 }}>
              {isProcessing ? 'Sending...' : 'Request to Join'}
            </Button>
          )}
          {userRequestStatus === 'pending' && <Chip label="Request Sent" color="info" sx={{ mt: 2 }} />}
          {userRequestStatus === 'approved' && <Chip label="You're a passenger!" color="success" sx={{ mt: 2 }} />}
          
          <Divider sx={{ my: 3 }} />

          {/* --- NEW: Section for creator to see pending requests --- */}
          {isCreator && pendingRequests.length > 0 && (
            <Box>
              <Typography variant="h6">Pending Requests ({pendingRequests.length})</Typography>
              <List>
                {pendingRequests.map(req => (
                  <ListItem key={req.profiles.id} secondaryAction={
                    <Stack direction="row" spacing={1}>
                      <Button 
                        variant="outlined" 
                        size="small" 
                        onClick={() => handleApproveRequest(req.profiles.id)} 
                        disabled={isProcessing || ride.seats_available === 0}
                      >
                        Approve
                      </Button>
                      {/* You can add a reject button here */}
                    </Stack>
                  }>
                    <ListItemText primary={req.profiles.full_name || 'A user'} />
                  </ListItem>
                ))}
              </List>
              <Divider sx={{ my: 3 }} />
            </Box>
          )}

          <Typography variant="h6">Approved Passengers ({passengers.length})</Typography>
          {passengers.length > 0 ? (
            <List>
              {passengers.map(passenger => (
                <ListItem key={passenger.id}>
                  <ListItemText primary={passenger.full_name || 'A user'} />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography variant="body2" color="text.secondary">No passengers have joined yet.</Typography>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default RideDetailPage;