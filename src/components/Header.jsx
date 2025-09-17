// src/components/Header.jsx

import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { AppBar, Toolbar, Typography, Button, Box, IconButton } from '@mui/material';
import { Add, Dashboard } from '@mui/icons-material';

const Header = ({ session }) => {

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AppBar position="static" sx={{ bgcolor: 'white', color: 'black', borderBottom: '1px solid #e0e0e0' }}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
          <RouterLink
          to="/"
          style={{
            textDecoration: 'none',
            color: 'inherit',
            display: 'flex',
            alignItems: 'center',
            flexGrow: 1
          }}
        >
          <img
            src="/pwa-192x192.png" 
            alt="CabMate Logo"
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%', 
              marginRight: '12px',
            }}
          />
          <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
            CabMate
          </Typography>
        </RouterLink>
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {session ? (
            <>
              <Button color="inherit" component={RouterLink} to="/dashboard" startIcon={<Dashboard />}>
                Dashboard
              </Button>
              <Button color="inherit" component={RouterLink} to="/my-rides">
                My Rides
              </Button>
              <Button color="inherit" component={RouterLink} to="/local-cabs">
                Local Cabs
              </Button>
               <Button color="inherit" component={RouterLink} to="/profile">
                {session.user.email}
              </Button>
              <IconButton
                color="primary"
                component={RouterLink}
                to="/create"
                aria-label="create new ride"
                sx={{ border: '1px solid', borderColor: 'primary.main', borderRadius: '8px' }}
              >
                <Add />
              </IconButton>
              <Button variant="outlined" color="primary" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <Button variant="contained" component={RouterLink} to="/login">
              Login
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;