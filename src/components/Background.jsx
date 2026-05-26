import React from 'react';
import { Box } from '@mui/material';

// This component will wrap our entire application
const Background = ({ children }) => {
  return (
    <Box sx={{ minHeight: '100vh', width: '100%', position: 'relative' }}>
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: -1,
          background: 'linear-gradient(180deg, #faf9f7 0%, #f5f2eb 100%)'
        }}
      />
      {children}
    </Box>
  );
};

export default Background;