// src/pages/LoginPage.jsx

import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { 
  Container, Box, TextField, Button, Typography, 
  Tabs, Tab, Paper, Divider, Stack, SvgIcon, Grid 
} from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import PersonIcon from '@mui/icons-material/Person';
import { useNotification } from '../context/NotificationContext';

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

  const pinkColor = '#ad57c1'; 

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

  const handleGuestLogin = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ 
        email: 'guest@cabmate.com', 
        password: 'guest123456' 
      });
      if (error) throw error;
      showNotification('Welcome, Guest!', 'success');
      navigate('/');
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
      if (tabIndex === 1) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        showNotification('Account created! Check email to confirm.', 'success');
      } else { 
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
    <Box sx={{ 
      display: 'flex', 
      minHeight: '100vh', 
      width: '100vw', 
      alignItems: 'center', 
      justifyContent: 'center', 
      bgcolor: '#e8e2d9', 
      p: { xs: 2, md: 4 }
    }}>
      <Paper sx={{ 
        display: 'flex', 
        width: '100%', 
        maxWidth: '1100px', 
        minHeight: '520px',
        borderRadius: '32px', 
        overflow: 'hidden', 
        boxShadow: '0 24px 64px rgba(0,0,0,0.1)' 
      }}>
        {/* Left side: Image */}
        <Box sx={{ 
          flex: 1, 
        display: { xs: 'none', md: 'flex' }, 
        position: 'relative',
        backgroundImage: 'url(/login_bg.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        padding: 6,
        alignItems: 'flex-end'
      }}>
        <Box sx={{ color: 'white', textShadow: '0 2px 10px rgba(0,0,0,0.5)', maxWidth: '500px' }}>
          <Typography variant="overline" sx={{ letterSpacing: 2, fontWeight: 600 }}>CABMATE WORKSPACE</Typography>
          <Typography variant="h3" sx={{ fontFamily: '"Playfair Display", serif', fontStyle: 'italic', fontWeight: 600, mt: 1, mb: 2 }}>
            Log in and continue from exactly where you left off.
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9 }}>
            Keep your commute simple, safe, and ready for every journey.
          </Typography>
        </Box>
      </Box>

        {/* Right side: Form */}
        <Box sx={{ 
          flex: { xs: 1, md: '0 0 450px' }, 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center',
          bgcolor: '#f5f1ea',
          p: { xs: 4, md: 6 }
        }}>
        <Box sx={{ width: '100%', maxWidth: '360px', mx: 'auto' }}>
          <Typography variant="overline" sx={{ color: '#8c7b68', fontWeight: 700, letterSpacing: 1.5 }}>
            {tabIndex === 0 ? 'WELCOME BACK' : 'GET STARTED'}
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#2c251f', mb: 1, mt: 0.5 }}>
            {tabIndex === 0 ? 'Sign In' : 'Create Account'}
          </Typography>
          <Typography variant="body2" sx={{ color: '#5e554d', mb: 2 }}>
            Use your email and password to access your dashboard.
          </Typography>

          <Tabs
            value={tabIndex}
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{
              mb: 2, 
              minHeight: '36px', 
              '& .MuiTabs-indicator': { backgroundColor: '#2c251f' },
              '& .Mui-selected': { color: '#2c251f !important', fontWeight: 'bold' },
              '& .MuiTab-root': { color: '#8c7b68', textTransform: 'none', fontWeight: 600 }
            }}
          >
            <Tab label="Sign In" sx={{ py: 0.5, minHeight: '36px' }} />
            <Tab label="Sign Up" sx={{ py: 0.5, minHeight: '36px' }} />
          </Tabs>

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#5e554d', mb: 0.5 }}>Email</Typography>
            <TextField
              required
              fullWidth
              id="email"
              placeholder="Enter your email"
              name="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'transparent',
                  borderRadius: '12px',
                  '& fieldset': { borderColor: '#d1c9c0' },
                  '&:hover fieldset': { borderColor: '#b5a99d' },
                  '&.Mui-focused fieldset': { borderColor: '#2c251f' },
                }
              }}
            />

            <Typography variant="body2" sx={{ fontWeight: 600, color: '#5e554d', mb: 0.5 }}>Password</Typography>
            <TextField
              required
              fullWidth
              name="password"
              placeholder="Enter your password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'transparent',
                  borderRadius: '12px',
                  '& fieldset': { borderColor: '#d1c9c0' },
                  '&:hover fieldset': { borderColor: '#b5a99d' },
                  '&.Mui-focused fieldset': { borderColor: '#2c251f' },
                }
              }}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{ 
                py: 1.5,
                borderRadius: '12px',
                backgroundColor: '#2c251f', 
                color: 'white',
                fontWeight: 600,
                textTransform: 'none',
                fontSize: '1rem',
                boxShadow: 'none',
                '&:hover': { backgroundColor: '#1a1511', boxShadow: 'none' }
              }}
            >
              {loading ? 'Processing...' : (tabIndex === 0 ? 'Sign In' : 'Create Account')}
            </Button>

            <Divider sx={{ my: 3, color: '#8c7b68', fontSize: '0.8rem', fontWeight: 600, '&::before, &::after': { borderColor: '#d1c9c0' } }}>
               OR
            </Divider>

            <Button 
              fullWidth 
              variant="outlined" 
              startIcon={<GoogleIcon />}
              onClick={handleGoogleLogin}
              sx={{ 
                mb: 2,
                py: 1.2,
                borderRadius: '12px',
                borderColor: '#d1c9c0', 
                color: '#2c251f', 
                textTransform: 'none', 
                fontWeight: 600,
                bgcolor: 'transparent',
                '&:hover': { bgcolor: 'rgba(0,0,0,0.02)', borderColor: '#b5a99d' }
              }}
            >
              Continue with Google
            </Button>

            <Button 
              fullWidth 
              variant="outlined" 
              startIcon={<GitHubIcon />}
              onClick={handleGithubLogin}
              sx={{ 
                mb: 2,
                py: 1.2,
                borderRadius: '12px',
                borderColor: '#d1c9c0', 
                color: '#2c251f', 
                textTransform: 'none', 
                fontWeight: 600,
                bgcolor: 'transparent',
                '&:hover': { bgcolor: 'rgba(0,0,0,0.02)', borderColor: '#b5a99d' }
              }}
            >
              Continue with GitHub
            </Button>

            <Button
              fullWidth
              variant="text"
              onClick={handleGuestLogin}
              disabled={loading}
              sx={{ 
                color: '#5e554d',
                fontWeight: 600,
                textTransform: 'none',
                '&:hover': { bgcolor: 'transparent', color: '#2c251f' }
              }}
            >
              Log in as Guest
            </Button>
            
            {tabIndex === 0 && (
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Button
                  component={RouterLink}
                  to="/forgot-password"
                  sx={{ textTransform: 'none', color: '#5e554d', fontWeight: 600 }}
                >
                  Forgot password?
                </Button>
              </Box>
            )}
          </Box>
        </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default LoginPage;