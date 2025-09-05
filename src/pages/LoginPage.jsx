// src/pages/LoginPage.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Link as RouterLink } from 'react-router-dom'; 
import { Container, Box, TextField, Button, Typography, Tabs, Tab, Grid } from '@mui/material';
import { useNotification } from '../hooks/useNotification';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const { showNotification } = useNotification();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [tabIndex, setTabIndex] = useState(0); // 0 for Sign In, 1 for Sign Up
  const navigate = useNavigate();

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (tabIndex === 1) { // Sign Up logic
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        showNotification('Account created! Please check your email to confirm your sign up.');
      } else { // Sign In logic
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate('/'); // Redirect to home on successful login
      }
    } catch (error) {
      showNotification(error.error_description || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Tabs value={tabIndex} onChange={handleTabChange} aria-label="Sign In Sign Up Tabs">
          <Tab label="Sign In" />
          <Tab label="Sign Up" />
        </Tabs>

        <Typography component="h1" variant="h5" sx={{ mt: 2 }}>
          {tabIndex === 0 ? 'Sign In' : 'Create an Account'}
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <TextField margin="normal" required fullWidth id="email" label="Email Address" name="email" autoComplete="email" autoFocus value={email} onChange={(e) => setEmail(e.target.value)} />
          <TextField margin="normal" required fullWidth name="password" label="Password" type="password" id="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }} disabled={loading}>
            {loading ? 'Processing...' : (tabIndex === 0 ? 'Sign In' : 'Sign Up')}
          </Button>
          <Grid container justifyContent="flex-end">
    <Grid item>
      <Button component={RouterLink} to="/forgot-password" sx={{ textTransform: 'none' }}>
        Forgot password?
      </Button>
    </Grid>
  </Grid>
        </Box>
      </Box>
    </Container>
  );
};

export default LoginPage;