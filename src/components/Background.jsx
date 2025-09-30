import React from 'react';
import { Box } from '@mui/material';

// This component will wrap our entire application
const Background = ({ children }) => {
  // We use the sx prop to apply the styles from the template
  return (
    <Box sx={{ minHeight: '100vh', width: '100%', position: 'relative' }}>
      {/* This Box is the actual gradient layer. It sits behind everything else. */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: -1, // Ensures it stays in the background
          background: `
            radial-gradient(ellipse 80% 60% at 60% 20%, rgba(175, 109, 255, 0.50), transparent 65%),
            radial-gradient(ellipse 70% 60% at 20% 80%, rgba(255, 100, 180, 0.45), transparent 65%),
            radial-gradient(ellipse 60% 50% at 60% 65%, rgba(255, 235, 170, 0.43), transparent 62%),
            radial-gradient(ellipse 65% 40% at 50% 60%, rgba(120, 190, 255, 0.48), transparent 68%),
            linear-gradient(180deg, #f7eaff 0%, #fde2ea 100%)
          `,
        }}
      />
      {/* This renders the rest of your app on top of the background */}
      {children}
    </Box>
  );
};

export default Background;