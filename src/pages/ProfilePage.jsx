import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useNotification } from '../context/NotificationContext';
import { Container, Typography, Box, TextField, Button, CircularProgress, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

const ProfilePage = ({ session }) => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState(''); // State for gender

  useEffect(() => {
    if (!session) {
      navigate('/login');
    }
  }, [session, navigate]);

  useEffect(() => {
    if (session) {
      const fetchProfile = async () => {
        setLoading(true);
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('full_name, gender') // Fetch gender along with name
            .eq('id', session.user.id)
            .single();

          if (error && error.code !== 'PGRST116') {
            throw error;
          }
          if (data) {
            setFullName(data.full_name || '');
            setGender(data.gender || '');
          }
        } catch (error) {
          showNotification('Could not fetch profile data.', 'error');
        } finally {
          setLoading(false);
        }
      };
      fetchProfile();
    }
  }, [session, showNotification]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!fullName || !gender) {
      showNotification('Please fill out your full name and gender.', 'warning');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: session.user.id,
          full_name: fullName,
          gender: gender, // Save gender to the database
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
    return null;
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
            {/* New Gender Selection Field */}
            <FormControl fullWidth required margin="normal">
              <InputLabel id="gender-select-label">Gender</InputLabel>
              <Select
                labelId="gender-select-label"
                id="gender-select"
                value={gender}
                label="Gender"
                onChange={(e) => setGender(e.target.value)}
              >
                <MenuItem value={'male'}>Male</MenuItem>
                <MenuItem value={'female'}>Female</MenuItem>
                <MenuItem value={'other'}>Other</MenuItem>
              </Select>
            </FormControl>

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