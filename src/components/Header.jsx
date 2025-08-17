import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { supabase } from '../supabaseClient'; // <-- Added supabase import
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import AddCircleIcon from '@mui/icons-material/AddCircle';

// The component now correctly accepts the 'session' prop
const Header = ({ session }) => {

  // This function signs the user out
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          <RouterLink to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            CabMate
          </RouterLink>
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {/* This conditional logic will now work correctly */}
          {session ? (
            <>
               <Button color="inherit" component={RouterLink} to="/my-rides">
                My Rides
              </Button>
              <IconButton
                color="inherit"
                component={RouterLink}
                to="/create"
                aria-label="create new ride"
              >
                <AddCircleIcon />
              </IconButton>
              <Typography variant="body2" component="span" sx={{ ml: 2, mr: 2 }}>
                {session.user.email}
              </Typography>
              <Button color="inherit" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <Button color="inherit" component={RouterLink} to="/login">
              Login
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;