import React, { useState } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { 
  AppBar, Toolbar, Typography, Button, Box, Container, 
  IconButton, Drawer, List, ListItem, ListItemButton, 
  ListItemText, Divider, Avatar, Stack
} from '@mui/material';
import { 
  Dashboard, Menu as MenuIcon, Home, DirectionsCar, 
  LocalTaxi, Person, Logout 
} from '@mui/icons-material';

const Header = ({ session, profile }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const toggleDrawer = (open) => () => {
    setDrawerOpen(open);
  };

  const navButtonStyle = (path) => {
    const isActive = location.pathname === path;
    return {
      textTransform: 'none',
      fontWeight: isActive ? 700 : 600,
      borderRadius: '50px', 
      px: 3,
      py: 1,
      mx: 0.5,
      fontSize: '0.9rem',
      color: isActive ? '#fff' : '#555',
      background: isActive ? 'linear-gradient(135deg, #ad57c1 0%, #7b1fa2 100%)' : 'transparent',
      boxShadow: isActive ? '0 4px 12px rgba(173, 87, 193, 0.3)' : 'none',
      '&:hover': {
        backgroundColor: isActive ? '#ad57c1' : 'rgba(173, 87, 193, 0.08)',
        color: isActive ? '#fff' : '#ad57c1',
        transform: 'translateY(-1px)',
      },
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
    };
  };

  return (
    <Container maxWidth="xl" sx={{ position: 'relative', mt: 2, zIndex: 1100, pointerEvents: 'none', mb: 2 }}>
      <AppBar
        position="static"
        elevation={0}
        sx={{
          pointerEvents: 'auto',
          borderRadius: '50px',
          backdropFilter: 'blur(16px)',
          backgroundColor: 'rgba(255, 255, 255, 0.85)',
          border: '1px solid rgba(255, 255, 255, 0.5)',
          boxShadow: '0 8px 32px rgba(173, 87, 193, 0.1)',
          color: 'black',
          maxWidth: '1200px',
          mx: 'auto', 
          py: 0.5
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, md: 4 } }}>
          
          <RouterLink to="/" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}>
            <Box 
                component="img"
                src="/pwa-192x192.png"
                alt="CabMate"
                sx={{ 
                    width: 40, 
                    height: 40, 
                    borderRadius: '50%', 
                    mr: 1.5,
                    boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                }}
            />
            <Typography variant="h6" sx={{ fontWeight: '800', letterSpacing: '-0.5px', color: '#2c3e50' }}>
              CabMate
            </Typography>
          </RouterLink>

          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
            
            <Stack direction="row" spacing={0.5} sx={{ bg: 'rgba(0,0,0,0.02)', p: 0.5, borderRadius: '50px' }}>
                <Button component={RouterLink} to="/" startIcon={<Home sx={{ fontSize: 20 }} />} sx={navButtonStyle('/')}>
                Home
                </Button>

                {session && (
                    <>
                        <Button component={RouterLink} to="/dashboard" startIcon={<Dashboard sx={{ fontSize: 20 }} />} sx={navButtonStyle('/dashboard')}>
                        Dashboard
                        </Button>
                        <Button component={RouterLink} to="/my-rides" startIcon={<DirectionsCar sx={{ fontSize: 20 }} />} sx={navButtonStyle('/my-rides')}>
                        My Rides
                        </Button>
                        <Button component={RouterLink} to="/local-cabs" startIcon={<LocalTaxi sx={{ fontSize: 20 }} />} sx={navButtonStyle('/local-cabs')}>
                        Local Cabs
                        </Button>
                    </>
                )}
            </Stack>

            {session ? (
              <>
                 <Box sx={{ width: '1px', height: '24px', bgcolor: 'rgba(0,0,0,0.1)', mx: 2 }} />
                
                <Button 
                  component={RouterLink} 
                  to="/profile" 
                  startIcon={<Person />} 
                  sx={{
                    textTransform: 'none',
                    borderRadius: '50px',
                    fontWeight: 700,
                    color: location.pathname === '/profile' ? '#ad57c1' : '#555',
                    px: 2,
                    '&:hover': { color: '#ad57c1', bgcolor: 'rgba(173, 87, 193, 0.05)' }
                  }}
                >
                  {profile?.full_name?.split(' ')[0] || "Profile"}
                </Button>

                <IconButton 
                  onClick={handleLogout} 
                  size="small" 
                  sx={{ 
                    ml: 1, 
                    color: '#ff5252', 
                    border: '1px solid rgba(255, 82, 82, 0.2)',
                    bgcolor: 'rgba(255, 82, 82, 0.05)',
                    p: 1,
                    '&:hover': { bgcolor: '#ff5252', color: 'white', borderColor: '#ff5252' },
                    transition: 'all 0.2s'
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
                  ml: 2,
                  borderRadius: '50px',
                  textTransform: 'none',
                  fontWeight: 'bold',
                  px: 4,
                  background: 'linear-gradient(135deg, #ad57c1 0%, #7b1fa2 100%)',
                  boxShadow: '0 8px 16px rgba(173, 87, 193, 0.3)',
                  '&:hover': { transform: 'translateY(-1px)', boxShadow: '0 12px 20px rgba(173, 87, 193, 0.4)' },
                }}
              >
                Login
              </Button>
            )}
          </Box>

          <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
            <IconButton 
                edge="end" 
                color="inherit" 
                onClick={toggleDrawer(true)}
                sx={{ bgcolor: 'rgba(0,0,0,0.03)', '&:hover': { bgcolor: 'rgba(0,0,0,0.05)' } }}
            >
              <MenuIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer 
        anchor="right" 
        open={drawerOpen} 
        onClose={toggleDrawer(false)}
        PaperProps={{
          sx: {
            width: 280,
            borderRadius: '24px 0 0 24px',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)'
          }
        }}
      >
        <Box sx={{ p: 3 }} role="presentation" onClick={toggleDrawer(false)}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
             <img src="/pwa-192x192.png" alt="Logo" style={{ width: 40, height: 40, marginRight: 12, borderRadius: '50%' }} />
             <Typography variant="h6" fontWeight="800">CabMate</Typography>
          </Box>
          <Divider sx={{ mb: 3 }} />
          
          <List>
            <ListItem disablePadding sx={{ mb: 1 }}>
              <ListItemButton component={RouterLink} to="/" sx={{ borderRadius: 3, bgcolor: location.pathname === '/' ? 'rgba(173, 87, 193, 0.1)' : 'transparent' }}>
                <Home sx={{ mr: 2, color: '#ad57c1' }} />
                <ListItemText primary="Home" primaryTypographyProps={{ fontWeight: 600 }} />
              </ListItemButton>
            </ListItem>

            {session ? (
              <>
                <ListItem disablePadding sx={{ mb: 1 }}>
                  <ListItemButton component={RouterLink} to="/dashboard" sx={{ borderRadius: 3, bgcolor: location.pathname === '/dashboard' ? 'rgba(173, 87, 193, 0.1)' : 'transparent' }}>
                    <Dashboard sx={{ mr: 2, color: '#ad57c1' }} />
                    <ListItemText primary="Dashboard" primaryTypographyProps={{ fontWeight: 600 }} />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding sx={{ mb: 1 }}>
                  <ListItemButton component={RouterLink} to="/my-rides" sx={{ borderRadius: 3, bgcolor: location.pathname === '/my-rides' ? 'rgba(173, 87, 193, 0.1)' : 'transparent' }}>
                    <DirectionsCar sx={{ mr: 2, color: '#ad57c1' }} />
                    <ListItemText primary="My Rides" primaryTypographyProps={{ fontWeight: 600 }} />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding sx={{ mb: 1 }}>
                  <ListItemButton component={RouterLink} to="/local-cabs" sx={{ borderRadius: 3, bgcolor: location.pathname === '/local-cabs' ? 'rgba(173, 87, 193, 0.1)' : 'transparent' }}>
                    <LocalTaxi sx={{ mr: 2, color: '#ad57c1' }} />
                    <ListItemText primary="Local Cabs" primaryTypographyProps={{ fontWeight: 600 }} />
                  </ListItemButton>
                </ListItem>
                <Divider sx={{ my: 2 }} />
                <ListItem disablePadding sx={{ mb: 1 }}>
                  <ListItemButton component={RouterLink} to="/profile" sx={{ borderRadius: 3 }}>
                    <Person sx={{ mr: 2, color: '#555' }} />
                    <ListItemText primary="My Profile" primaryTypographyProps={{ fontWeight: 600 }} />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton onClick={handleLogout} sx={{ borderRadius: 3, color: '#ff5252' }}>
                    <Logout sx={{ mr: 2 }} />
                    <ListItemText primary="Logout" primaryTypographyProps={{ fontWeight: 600 }} />
                  </ListItemButton>
                </ListItem>
              </>
            ) : (
              <ListItem disablePadding>
                <ListItemButton component={RouterLink} to="/login" sx={{ borderRadius: 3 }}>
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