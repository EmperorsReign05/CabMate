import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useNotification } from '../context/NotificationContext';
import { 
  Container, Typography, Box, TextField, Button, 
  CircularProgress, FormControl, InputLabel, Select, 
  MenuItem, Paper, Avatar, Divider, Stack, InputAdornment 
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';

const API_BASE = "http://127.0.0.1:8000";

const ProfilePage = ({ session, onProfileUpdate}) => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const pinkColor = '#ad57c1ff';

  useEffect(() => {
    if (!session) {
      navigate('/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await fetch(`${API_BASE}/profiles/${session.user.id}`);
        if (response.ok) {
          const data = await response.json();
          setFullName(data.full_name || '');
          setGender(data.gender || '');
          
          
          let phone = data.phone || '';
          if (phone.startsWith('+91')) {
            phone = phone.replace('+91', '');
          }
          setPhoneNumber(phone);
        }
      } catch (error) {
        console.log("No existing profile found to pre-fill.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [session, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

  
    const formattedPhone = `+91${phoneNumber}`;

    try {
      const response = await fetch(`${API_BASE}/profiles/${session.user.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName,
          phone: formattedPhone, 
          email: session.user.email,
          gender: gender,
        }),
      });

      if (response.ok) {
        showNotification('Profile setup complete!', 'success');
        
        if (onProfileUpdate) {
          await onProfileUpdate(); 
        }
        
        navigate('/dashboard'); 
      } else {
        throw new Error('Failed to save profile');
      }
    } catch (error) {
      showNotification(error.message, 'error');
    } finally {
      setSaving(false);
    }
  };
  
  if (loading) return (
    <Box display="flex" justifyContent="center" mt={10}><CircularProgress sx={{color: pinkColor}}/></Box>
  );

  return (
    <Container maxWidth="xs">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Paper elevation={3} sx={{ p: 4, width: '100%', borderRadius: 4, textAlign: 'center' }}>
          <Avatar sx={{ m: '0 auto 16px', bgcolor: pinkColor, width: 56, height: 56 }}>
            <PersonIcon />
          </Avatar>

          <Typography variant="h5" fontWeight="bold">Complete Profile</Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
            Setup your account to start riding
          </Typography>

          <Divider sx={{ mb: 3 }} />

          <Stack component="form" onSubmit={handleSubmit} spacing={2.5}>
            <TextField
              label="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              fullWidth
              required
              sx={{ '& .MuiOutlinedInput-root.Mui-focused fieldset': { borderColor: pinkColor }, '& label.Mui-focused': { color: pinkColor } }}
            />

            <TextField
              label="Phone Number"
              value={phoneNumber}
              // Optional: Only allow typing numbers
              onChange={(e) => {
                const val = e.target.value;
                if (/^\d*$/.test(val)) setPhoneNumber(val);
              }}
              fullWidth
              required
              type="tel"
              // 
              InputProps={{
                startAdornment: <InputAdornment position="start">+91</InputAdornment>,
              }}
              sx={{ '& .MuiOutlinedInput-root.Mui-focused fieldset': { borderColor: pinkColor }, '& label.Mui-focused': { color: pinkColor } }}
            />

            <FormControl fullWidth required>
              <InputLabel sx={{ '&.Mui-focused': { color: pinkColor } }}>Gender</InputLabel>
              <Select
                value={gender}
                label="Gender"
                onChange={(e) => setGender(e.target.value)}
                sx={{ '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: pinkColor } }}
              >
                <MenuItem value="male">Male</MenuItem>
                <MenuItem value="female">Female</MenuItem>
                
              </Select>
            </FormControl>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={saving}
              sx={{
                py: 1.5,
                backgroundColor: pinkColor,
                '&:hover': { backgroundColor: '#8e44ad' },
                borderRadius: 2,
                fontWeight: 'bold'
              }}
            >
              {saving ? <CircularProgress size={24} color="inherit" /> : 'Save and Continue'}
            </Button>
          </Stack>
        </Paper>
      </Box>
    </Container>
  );
};

export default ProfilePage;