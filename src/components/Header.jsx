import React, { useState } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { 
  AppBar, Toolbar, Typography, Button, Box, Container, 
  IconButton, Drawer, List, ListItem, ListItemButton, 
  ListItemText, Divider, Avatar 
} from '@mui/material';
import { 
  Dashboard, Menu as MenuIcon, Home, DirectionsCar, 
  LocalTaxi, Person, Logout 
} from '@mui/icons-material';

const Header = ({ session, profile }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation(); // To check active route

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const toggleDrawer = (open) => () => {
    setDrawerOpen(open);
  };

  // Modern Button Style
  const navButtonStyle = (path) => ({
    textTransform: 'none', // Modern look (no ALL CAPS)
    fontWeight: 600,
    borderRadius: 3, // Pill shape
    px: 2,
    mx: 0.5,
    color: location.pathname === path ? '#ad57c1ff' : 'text.primary',
    backgroundColor: location.pathname === path ? 'rgba(173, 87, 193, 0.08)' : 'transparent',
    '&:hover': {
      backgroundColor: 'rgba(173, 87, 193, 0.15)',
      color: '#ad57c1ff',
    },
    transition: 'all 0.2s ease-in-out'
  });

  return (
    <Container maxWidth="lg">
      <AppBar
        position="sticky"
        elevation={0} // Remove default shadow for cleaner look
        sx={{
          borderRadius: 4,
          mt: 2,
          backdropFilter: 'blur(12px)', // Stronger blur
          backgroundColor: 'rgba(255, 255, 255, 0.8)', // Slightly more opaque
          border: '1px solid rgba(255, 255, 255, 0.3)', // Glass border effect
          color: 'black',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          {/* LOGO */}
          <RouterLink to="/" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}>
            <img
              src="/pwa-192x192.png"
              alt="CabMate Logo"
              style={{ width: '40px', height: '40px', borderRadius: '50%', marginRight: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
            />
            <Typography variant="h6" component="div" sx={{ fontWeight: '800', letterSpacing: '-0.5px' }}>
              CabMate
            </Typography>
          </RouterLink>

          {/* DESKTOP NAV */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
            {/* Always show Home */}
            <Button component={RouterLink} to="/" startIcon={<Home />} sx={navButtonStyle('/')}>
              Home
            </Button>

            {session ? (
              <>
                <Button component={RouterLink} to="/dashboard" startIcon={<Dashboard />} sx={navButtonStyle('/dashboard')}>
                  Dashboard
                </Button>
                <Button component={RouterLink} to="/my-rides" startIcon={<DirectionsCar />} sx={navButtonStyle('/my-rides')}>
                  My Rides
                </Button>
                <Button component={RouterLink} to="/local-cabs" startIcon={<LocalTaxi />} sx={navButtonStyle('/local-cabs')}>
                  Local Cabs
                </Button>
                
                {/* Profile Button - Special Style */}
                <Button 
                  component={RouterLink} 
                  to="/profile" 
                  startIcon={<Person />} 
                  sx={{
                    ...navButtonStyle('/profile'),
                    ml: 1,
                    border: '1px solid rgba(0,0,0,0.05)'
                  }}
                >
                  My Profile
                </Button>

                <IconButton 
                  onClick={handleLogout} 
                  size="small" 
                  sx={{ 
                    ml: 1, 
                    color: '#ff5252', 
                    bgcolor: 'rgba(255, 82, 82, 0.1)',
                    '&:hover': { bgcolor: '#ff5252', color: 'white' } 
                  }}
                >
                  <Logout fontSize="small" />
                </IconButton>
              </>
            ) : (
              <Button 
                variant="contained" 
                component={RouterLink} 
                to="/login" 
                sx={{
                  borderRadius: 3,
                  textTransform: 'none',
                  fontWeight: 'bold',
                  px: 4,
                  backgroundColor: '#ad57c1ff',
                  boxShadow: '0 4px 14px rgba(173, 87, 193, 0.4)',
                  '&:hover': { backgroundColor: '#4A148C', transform: 'translateY(-1px)' },
                  transition: 'all 0.2s'
                }}
              >
                Login
              </Button>
            )}
          </Box>

          {/* MOBILE HAMBURGER */}
          <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
            <IconButton edge="end" color="inherit" onClick={toggleDrawer(true)}>
              <MenuIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* MOBILE DRAWER */}
      <Drawer 
        anchor="right" 
        open={drawerOpen} 
        onClose={toggleDrawer(false)}
        PaperProps={{
          sx: {
            width: 280,
            borderRadius: '20px 0 0 20px',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)'
          }
        }}
      >
        <Box sx={{ p: 2 }} role="presentation" onClick={toggleDrawer(false)} onKeyDown={toggleDrawer(false)}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, pl: 1 }}>
             <img src="/pwa-192x192.png" alt="Logo" style={{ width: 32, height: 32, marginRight: 10 }} />
             <Typography variant="h6" fontWeight="bold">CabMate</Typography>
          </Box>
          <Divider sx={{ mb: 2 }} />
          
          <List>
            <ListItem disablePadding sx={{ mb: 1 }}>
              <ListItemButton component={RouterLink} to="/" sx={{ borderRadius: 2 }}>
                <Home sx={{ mr: 2, color: '#ad57c1ff' }} />
                <ListItemText primary="Home" primaryTypographyProps={{ fontWeight: 600 }} />
              </ListItemButton>
            </ListItem>

            {session ? (
              <>
                <ListItem disablePadding sx={{ mb: 1 }}>
                  <ListItemButton component={RouterLink} to="/dashboard" sx={{ borderRadius: 2 }}>
                    <Dashboard sx={{ mr: 2, color: '#ad57c1ff' }} />
                    <ListItemText primary="Dashboard" primaryTypographyProps={{ fontWeight: 600 }} />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding sx={{ mb: 1 }}>
                  <ListItemButton component={RouterLink} to="/my-rides" sx={{ borderRadius: 2 }}>
                    <DirectionsCar sx={{ mr: 2, color: '#ad57c1ff' }} />
                    <ListItemText primary="My Rides" primaryTypographyProps={{ fontWeight: 600 }} />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding sx={{ mb: 1 }}>
                  <ListItemButton component={RouterLink} to="/local-cabs" sx={{ borderRadius: 2 }}>
                    <LocalTaxi sx={{ mr: 2, color: '#ad57c1ff' }} />
                    <ListItemText primary="Local Cabs" primaryTypographyProps={{ fontWeight: 600 }} />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding sx={{ mb: 1 }}>
                  <ListItemButton component={RouterLink} to="/profile" sx={{ borderRadius: 2 }}>
                    <Person sx={{ mr: 2, color: '#ad57c1ff' }} />
                    <ListItemText primary="My Profile" primaryTypographyProps={{ fontWeight: 600 }} />
                  </ListItemButton>
                </ListItem>
                <Divider sx={{ my: 2 }} />
                <ListItem disablePadding>
                  <ListItemButton onClick={handleLogout} sx={{ borderRadius: 2, color: '#ff5252' }}>
                    <Logout sx={{ mr: 2 }} />
                    <ListItemText primary="Logout" primaryTypographyProps={{ fontWeight: 600 }} />
                  </ListItemButton>
                </ListItem>
              </>
            ) : (
              <ListItem disablePadding>
                <ListItemButton component={RouterLink} to="/login" sx={{ borderRadius: 2 }}>
                  <ListItemText primary="Login" primaryTypographyProps={{ fontWeight: 600 }} />
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