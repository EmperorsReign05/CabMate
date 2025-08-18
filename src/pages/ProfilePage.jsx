// src/pages/ProfilePage.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useNotification } from '../context/NotificationContext';
import { Container, Typography, Box, TextField, Button, CircularProgress } from '@mui/material';

const ProfilePage = ({ session }) => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState('');

  // Redirect if not logged in
  useEffect(() => {
    if (!session) {
      navigate('/login');
    }
  }, [session, navigate]);

  // Fetch profile data
  useEffect(() => {
    if (session) {
      const fetchProfile = async () => {
        setLoading(true);
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', session.user.id)
            .single(); // Using .single() is fine, we will handle the error

          // This error is expected if the profile doesn't exist yet
          if (error && error.code !== 'PGRST116') {
            throw error;
          }
          if (data) {
            setFullName(data.full_name || '');
          }
        } catch (error) {
          showNotification('Could not fetch profile data.', 'error');
        } finally {
          setLoading(false);
        }
      };
      fetchProfile();
    }
  }, [session]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // --- THIS IS THE FIX ---
      // Use upsert() instead of update(). It will create the profile if it doesn't exist.
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: session.user.id, // This is the primary key to find the row
          full_name: fullName,
          updated_at: new Date(),
        });
      
      if (error) throw error;
      showNotification('Profile updated successfully!', 'success');
    } catch (error) {
      showNotification('Error updating profile.', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  if (!session) {
    return null; // Don't render anything if there's no session
  }
  
  return (
    <Container maxWidth="sm">
      <Box component="form" onSubmit={handleUpdateProfile} sx={{ mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          My Profile
        </Typography>
        {loading ? <CircularProgress /> : (
          <>
            <TextField
              label="Email"
              value={session.user.email || ''}
              fullWidth
              margin="normal"
              disabled
            />
            <TextField
              label="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              fullWidth
              required
              margin="normal"
            />
            <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }} disabled={loading}>
              {loading ? 'Saving...' : 'Save Profile'}
            </Button>
          </>
        )}
      </Box>
    </Container>
  );
};

export default ProfilePage;