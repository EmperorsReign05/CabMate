import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNotification } from '../context/NotificationContext';
import { Container, Box, TextField, Button, Typography } from '@mui/material';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { showNotification } = useNotification();

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/update-password', // Where to redirect after email link click
      });
      if (error) throw error;
      showNotification('Password reset link sent! Please check your email.', 'success');
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
          Forgot Password
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
          Enter your email address and we'll send you a link to reset your password.
        </Typography>
        <Box component="form" onSubmit={handlePasswordReset} noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }} disabled={loading}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default ForgotPasswordPage;