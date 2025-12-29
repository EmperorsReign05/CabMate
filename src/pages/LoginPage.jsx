// src/pages/LoginPage.jsx

import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Container, Box, TextField, Button, Typography, Tabs, Tab, Grid } from '@mui/material';
import { useNotification } from '../context/NotificationContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const { showNotification } = useNotification();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);
  const navigate = useNavigate();

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };
  const handleGoogleLogin = async () => {
  await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: window.location.origin,
    },
  });
};

const handleGithubLogin = async () => {
  await supabase.auth.signInWithOAuth({
    provider: "github",
    options: {
      redirectTo: window.location.origin,
    },
  });
};
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (tabIndex === 1) { // Sign Up
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        showNotification('Account created! Please check your email to confirm your sign up.');
      } else { // Sign In
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate('/'); // Redirect to home page on successful login
      }
    } catch (error) {
      showNotification(error.error_description || error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const pinkColor = '#d253c9ff'; // Defining our pink color

  return (
    <Container component="main" maxWidth="xs">
      <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Tabs
          value={tabIndex}
          onChange={handleTabChange}
          aria-label="Sign In Sign Up Tabs"
          // Styles for the tabs indicator
          sx={{
            '& .MuiTabs-indicator': {
              backgroundColor: pinkColor,
            },
            '& .Mui-selected': {
              color: `${pinkColor} !important`,
            },
          }}
        >
          <Tab label="Sign In" />
          <Tab label="Sign Up" />
        </Tabs>

        <Typography component="h1" variant="h5" sx={{ mt: 2 }}>
          {tabIndex === 0 ? 'Sign In' : 'Create an Account'}
        </Typography>
        <Button fullWidth onClick={handleGoogleLogin}>
  Continue with Google
</Button>

<Button fullWidth onClick={handleGithubLogin}>
  Continue with GitHub
</Button>

        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
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
            // Styles for the text field focus color
            sx={{
              '& .MuiOutlinedInput-root': {
                '&.Mui-focused fieldset': { borderColor: pinkColor },
              },
              '& label.Mui-focused': { color: pinkColor },
            }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            // Styles for the text field focus color
            sx={{
              '& .MuiOutlinedInput-root': {
                '&.Mui-focused fieldset': { borderColor: pinkColor },
              },
              '& label.Mui-focused': { color: pinkColor },
            }}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 , backgroundColor: '#ad57c1ff', // A deep purple color
              '&:hover': {
                backgroundColor: '#4A148C', // A slightly darker purple for hover
              },}}
            disabled={loading}
          >
            {loading ? 'Processing...' : (tabIndex === 0 ? 'Sign In' : 'Sign Up')}
          </Button>
          <Grid container justifyContent="flex-end">
            <Grid item>
              
              <Button
                component={RouterLink}
                to="/forgot-password"
                // Style for the "Forgot password?" link
                sx={{ textTransform: 'none', color: pinkColor }}
              >
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