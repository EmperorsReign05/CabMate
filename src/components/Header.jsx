// src/components/Header.jsx

import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { AppBar, Toolbar, Typography, Button, Box, Container } from '@mui/material';
import { Add, Dashboard } from '@mui/icons-material';

const Header = ({ session, profile }) => {
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    // Wrap the AppBar in a Container to give it space from the edges
    <Container maxWidth="lg">
          <AppBar
        position="sticky"
        sx={{
          // These styles create the modern, rounded, transparent look
          borderRadius: 4, // This makes the corners rounded (16px)
          mt: 2, // No margin at the top
          backdropFilter: 'blur(8px)',
          backgroundColor: 'rgba(255, 255, 255, 0.7)',
          boxShadow: '0 ',
          color: 'black',
        }}
      >
        <Toolbar>
          <RouterLink to="/" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <img
              src="/pwa-192x192.png"
              alt="CabMate Logo"
              style={{ width: '48px', height: '48px', borderRadius: '50%', marginRight: '12px' }}
            />
            <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
              CabMate
            </Typography>
          </RouterLink>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0,pt:0 }}>
            {session ? (
              <>
                <Button color="inherit" component={RouterLink} to="/dashboard" startIcon={<Dashboard />}>Dashboard</Button>
                <Button color="inherit" component={RouterLink} to="/my-rides">My Rides</Button>
                <Button color="inherit" component={RouterLink} to="/local-cabs">Local Cabs</Button>
                <Button color="inherit" component={RouterLink} to="/profile">
                  {profile?.full_name ? profile.full_name.split(' ')[0] : session.user.email}
                </Button>
               {/*<IconButton color="primary" component={RouterLink} to="/create" aria-label="create new ride" sx={{ border: '1px solid', borderColor: 'primary.main', borderRadius: '8px' }}>
                  <Add />
                </IconButton>*/}
                <Button variant="outlined" color="primary" onClick={handleLogout}>Logout</Button>
              </>
            ) : (
              <Button variant="contained" component={RouterLink} to="/login">Login</Button>
            )}
          </Box>
        </Toolbar>
      </AppBar>
    </Container>
  );
};

export default Header;