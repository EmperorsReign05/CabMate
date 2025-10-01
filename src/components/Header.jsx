// src/components/Header.jsx

import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { AppBar, Toolbar, Typography, Button, Box, Container, IconButton, Drawer, List, ListItem, ListItemButton, ListItemText, Divider } from '@mui/material';
import { Add, Dashboard, Menu as MenuIcon } from '@mui/icons-material';

const Header = ({ session, profile }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const toggleDrawer = (open) => () => {
    setDrawerOpen(open);
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

          {/* Desktop navigation */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1, flexShrink: 0, pt: 0 }}>
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
                <Button variant="outlined" color="white" onClick={handleLogout} >Logout</Button>
              </>
            ) : (
              <Button variant="contained" component={RouterLink} to="/login" sx={{backgroundColor: '#ad57c1ff', // A deep purple color
              '&:hover': {
                backgroundColor: '#4A148C', // A slightly darker purple for hover
              },}}>Login</Button>
            )}
          </Box>

          {/* Mobile hamburger */}
          <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
            <IconButton edge="end" color="inherit" aria-label="menu" onClick={toggleDrawer(true)}>
              <MenuIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Drawer for mobile */}
      <Drawer 
        anchor="right" 
        open={drawerOpen} 
        onClose={toggleDrawer(false)}
        sx={{
          '& .MuiDrawer-paper': {
            background: `
              radial-gradient(ellipse 80% 60% at 60% 20%, rgba(175, 109, 255, 0.50), transparent 65%),
              radial-gradient(ellipse 70% 60% at 20% 80%, rgba(255, 100, 180, 0.45), transparent 65%),
              radial-gradient(ellipse 60% 50% at 60% 65%, rgba(255, 235, 170, 0.43), transparent 62%),
              radial-gradient(ellipse 65% 40% at 50% 60%, rgba(120, 190, 255, 0.48), transparent 68%),
              linear-gradient(180deg, #f7eaff 0%, #fde2ea 100%)
            `,
          }
        }}
      >
        <Box sx={{ width: 260, p: 1 }} role="presentation" onClick={toggleDrawer(false)} onKeyDown={toggleDrawer(false)}>
          <List>
            <ListItem disablePadding>
              <ListItemButton component={RouterLink} to="/">
                <ListItemText primary="Home" />
              </ListItemButton>
            </ListItem>
            <Divider />
            {session ? (
              <>
                <ListItem disablePadding>
                  <ListItemButton component={RouterLink} to="/dashboard">
                    <ListItemText primary="Dashboard" />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton component={RouterLink} to="/my-rides">
                    <ListItemText primary="My Rides" />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton component={RouterLink} to="/local-cabs">
                    <ListItemText primary="Local Cabs" />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton component={RouterLink} to="/create">
                    <ListItemText primary="Create New Ride" />
                  </ListItemButton>
                </ListItem>
                <Divider sx={{ my: 1 }} />
                <ListItem disablePadding>
                  <ListItemButton component={RouterLink} to="/profile">
                    <ListItemText primary={profile?.full_name ? profile.full_name : session.user.email} />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton onClick={handleLogout}>
                    <ListItemText primary="Logout" />
                  </ListItemButton>
                </ListItem>
              </>
            ) : (
              <ListItem disablePadding>
                <ListItemButton component={RouterLink} to="/login">
                  <ListItemText primary="Login" />
                </ListItemButton>
              </ListItem>
            )}
          </List>
        </Box>
      </Drawer>
    </Container>
  );
};

export default Header;