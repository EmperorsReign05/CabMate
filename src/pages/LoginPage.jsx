// src/pages/LoginPage.jsx

import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { 
  Container, Box, TextField, Button, Typography, 
  Tabs, Tab, Paper, Divider, Stack, SvgIcon, Grid, Chip 
} from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import PersonIcon from '@mui/icons-material/Person'; // Icon for guest
import { useNotification } from '../context/NotificationContext';

// Custom Google Icon
const GoogleIcon = (props) => (
  <SvgIcon {...props}>
    <path d="M21.35,11.1H12.18V13.83H18.69C18.36,17.64 15.19,19.27 12.19,19.27C8.36,19.27 5,16.25 5,12C5,7.9 8.2,4.73 12.2,4.73C15.29,4.73 17.1,6.7 17.1,6.7L19,4.72C19,4.72 16.56,2 12.1,2C6.42,2 2.03,6.8 2.03,12C2.03,17.05 6.16,22 12.25,22C17.6,22 21.5,18.33 21.5,12.91C21.5,11.76 21.35,11.1 21.35,11.1V11.1Z" />
  </SvgIcon>
);

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const { showNotification } = useNotification();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);
  const navigate = useNavigate();

  const pinkColor = '#ad57c1ff'; 

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
  };

  const handleGithubLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: { redirectTo: window.location.origin },
    });
  };

  // ✅ NEW: Guest Login Function
  const handleGuestLogin = async () => {
    setLoading(true);
    try {
      // Replace these with the actual credentials of a user you created in Supabase
      const { error } = await supabase.auth.signInWithPassword({ 
        email: 'guest@cabmate.com', 
        password: 'guest123456' 
      });
      if (error) throw error;
      showNotification('Welcome, Guest!', 'success');
      navigate('/dashboard');
    } catch (error) {
      showNotification('Guest login failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (tabIndex === 1) { // Sign Up
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        showNotification('Account created! Check email to confirm.', 'success');
      } else { // Sign In
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate('/dashboard'); 
      }
    } catch (error) {
      showNotification(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container 
      maxWidth="xs" 
      sx={{ 
        minHeight: 'calc(100vh - 100px)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        pb: 4
      }}
    >
      <Paper 
        elevation={6} 
        sx={{ 
          p: 4, 
          width: '100%', 
          borderRadius: 4, 
          bgcolor: 'rgba(255, 255, 255, 0.9)', 
          backdropFilter: 'blur(10px)' 
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          
          <Typography component="h1" variant="h5" fontWeight="bold" sx={{ mb: 1 }}>
             {tabIndex === 0 ? 'Welcome Back' : 'Create Account'}
          </Typography>

          <Tabs
            value={tabIndex}
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{
              width: '100%',
              mb: 3,
              minHeight: '40px', 
              '& .MuiTabs-indicator': { backgroundColor: pinkColor },
              '& .Mui-selected': { color: `${pinkColor} !important`, fontWeight: 'bold' },
            }}
          >
            <Tab label="Sign In" sx={{ py: 1 }} />
            <Tab label="Sign Up" sx={{ py: 1 }} />
          </Tabs>

          {/* ✅ RECRUITER FRIENDLY BUTTON */}
          <Button
            fullWidth
            variant="contained"
            onClick={handleGuestLogin}
            startIcon={<PersonIcon />}
            disabled={loading}
            sx={{ 
              mb: 3,
              bgcolor: '#2e7d32', // Green for "Go"
              color: 'white',
              fontWeight: 'bold',
              textTransform: 'none',
              py: 1.2,
              '&:hover': { bgcolor: '#1b5e20' }
            }}
          >
            Log in as Guest
          </Button>

          <Divider sx={{ width: '100%', mb: 3, color: 'text.secondary', fontSize: '0.875rem' }}>
             Or continue with
          </Divider>

          <Stack spacing={1.5} width="100%" sx={{ mb: 3 }}>
            <Button 
              fullWidth 
              variant="outlined" 
              startIcon={<GoogleIcon />}
              onClick={handleGoogleLogin}
              sx={{ 
                borderColor: '#e0e0e0', color: '#666', textTransform: 'none', bgcolor: 'white',
                '&:hover': { bgcolor: '#f5f5f5', borderColor: '#bdbdbd' }
              }}
            >
              Google
            </Button>
            <Button 
              fullWidth 
              variant="outlined" 
              startIcon={<GitHubIcon />}
              onClick={handleGithubLogin}
              sx={{ 
                borderColor: '#e0e0e0', color: '#666', textTransform: 'none', bgcolor: 'white',
                '&:hover': { bgcolor: '#f5f5f5', borderColor: '#bdbdbd' }
              }}
            >
              GitHub
            </Button>
          </Stack>

          <Divider sx={{ width: '100%', mb: 3 }} />

          {/* Email Form */}
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ width: '100%' }}>
            <TextField
              margin="dense"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              size="small"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root.Mui-focused fieldset': { borderColor: pinkColor },
                '& label.Mui-focused': { color: pinkColor },
              }}
            />
            <TextField
              margin="dense"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              size="small"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root.Mui-focused fieldset': { borderColor: pinkColor },
                '& label.Mui-focused': { color: pinkColor },
              }}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{ 
                mt: 3, 
                mb: 2, 
                py: 1.2,
                borderRadius: 2,
                backgroundColor: pinkColor, 
                fontWeight: 'bold',
                textTransform: 'none',
                fontSize: '1rem',
                '&:hover': { backgroundColor: '#8e44ad' }
              }}
            >
              {loading ? 'Processing...' : (tabIndex === 0 ? 'Sign In' : 'Sign Up')}
            </Button>

            <Grid container justifyContent="center">
              <Grid item>
                <Button
                  component={RouterLink}
                  to="/forgot-password"
                  size="small"
                  sx={{ textTransform: 'none', color: 'text.secondary' }}
                >
                  Forgot password?
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default LoginPage;