import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useNotification } from '../context/NotificationContext';
import { Container, Box, TextField, Button, Typography } from '@mui/material';

const UpdatePasswordPage = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      showNotification("Passwords do not match.", 'error');
      return;
    }
    setLoading(true);
    try {
      //user is already logged in at this point from the reset link.
      // just update their password.
      const { error } = await supabase.auth.updateUser({
        password: password,
      });
      if (error) throw error;
      showNotification('Your password has been updated successfully!', 'success');
      navigate('/'); // Redirect to home after successful update
    } catch (error) {
      showNotification(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5">
          Choose a New Password
        </Typography>
        <Box component="form" onSubmit={handleUpdatePassword} noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="New Password"
            type="password"
            id="password"
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="confirmPassword"
            label="Confirm New Password"
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }} disabled={loading}>
            {loading ? 'Saving...' : 'Save New Password'}
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default UpdatePasswordPage;