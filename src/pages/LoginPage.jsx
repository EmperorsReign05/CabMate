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
    <Container 
      maxWidth="xs" 
      sx={{ 
        height: 'calc(100vh - 90px)',
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center',     
        pt: 0, 
        pb: 2
      }}
    >
      <Paper 
        elevation={6} 
        sx={{ 
          p: 3, 
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
              mb: 2, 
              minHeight: '36px', 
              '& .MuiTabs-indicator': { backgroundColor: pinkColor },
              '& .Mui-selected': { color: `${pinkColor} !important`, fontWeight: 'bold' },
            }}
          >
            <Tab label="Sign In" sx={{ py: 0.5, minHeight: '36px' }} />
            <Tab label="Sign Up" sx={{ py: 0.5, minHeight: '36px' }} />
          </Tabs>

          <Button
            fullWidth
            variant="contained"
            onClick={handleGuestLogin}
            startIcon={<PersonIcon />}
            disabled={loading}
            size="small"
            sx={{ 
              mb: 2,
              bgcolor: '#2e7d32', 
              color: 'white',
              fontWeight: 'bold',
              textTransform: 'none',
              py: 1,
              '&:hover': { bgcolor: '#1b5e20' }
            }}
          >
            Log in as Guest
          </Button>

          <Divider sx={{ width: '100%', mb: 2, color: 'text.secondary', fontSize: '0.8rem' }}>
             Or continue with
          </Divider>
          <Stack direction="row" spacing={2} width="100%" sx={{ mb: 2 }}>
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

          <Divider sx={{ width: '100%', mb: 2 }} />
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
                mt: 2, 
                mb: 1, 
                py: 1,
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
                  sx={{ textTransform: 'none', color: 'text.secondary', fontSize: '0.8rem' }}
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