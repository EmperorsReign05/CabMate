import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Card, CardContent, Typography, Button, CardActions, Chip, Divider, Stack } from '@mui/material';
import { Schedule, People, Delete, Woman, ArrowForward, Circle, LocationOn } from '@mui/icons-material';

// Helper function to get Short Name
const getShortLocation = (address) => {
  if (!address) return "Unknown";

  // Normalize string for easier matching
  const lowerAddr = address.toLowerCase();

  // Match known locations from your Common Routes
  if (lowerAddr.includes("ghs hostel")) return "GHS Hostel";
  if (lowerAddr.includes("airport")) return "Jaipur Airport";
  if (lowerAddr.includes("sindhi camp")) {
    // Distinguish between the Bus Station and Railway Station if they share keywords, 
    // or just catch specific unique parts.
    if (lowerAddr.includes("wq9q") || lowerAddr.includes("railway")) {
      return "Jaipur Junction";
    }
    return "Sindhi Camp";
  }
  
  // Fallback for custom locations: return the first part (e.g., "Malviya Nagar")
  return address.split(',')[0];
};

const RideCard = ({ ride, isCreator = false, onDelete = () => {} }) => {
  const rideId = ride._id || ride.id;
  
  const dateStr = new Date(ride.departure_time).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
  });

  const timeStr = new Date(ride.departure_time).toLocaleString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column', 
        borderRadius: 4, 
        border: 'none',
        background: 'rgba(255, 255, 255, 0.9)', 
        backdropFilter: 'blur(10px)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)', 
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': { 
          transform: 'translateY(-4px)',
          boxShadow: '0 12px 24px rgba(173, 87, 193, 0.2)' 
        } 
      }}
    >
      <RouterLink to={`/ride/${rideId}`} style={{ textDecoration: 'none', color: 'inherit', flexGrow: 1 }}>
        <CardContent sx={{ p: 2.5, pb: 1, flexGrow: 1 }}>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box>
               <Typography variant="h5" sx={{ fontWeight: '800', color: '#333' }}>
                 {timeStr}
               </Typography>
               <Typography variant="body2" sx={{ fontWeight: '500', color: '#333', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                 {dateStr}
               </Typography>
            </Box>
            
            <Stack direction="row" spacing={1}>
                {ride.is_ladies_only && (
                    <Chip 
                        icon={<Woman sx={{ fontSize: 16 }} />} 
                        label="Ladies" 
                        size="small" 
                        sx={{ bgcolor: '#fce4ec', color: '#c2185b', fontWeight: 'bold', fontSize: '0.7rem', height: 24 }} 
                    />
                )}
                <Chip 
                    icon={<People sx={{ fontSize: 14 }} />} 
                    label={`${ride.seats_available} left`}
                    size="small"
                    sx={{ bgcolor: '#e3f2fd', color: '#1565c0', fontWeight: 'bold', fontSize: '0.7rem', height: 24 }}
                />
            </Stack>
          </Box>

          <Divider sx={{ mb: 2, borderStyle: 'dashed' }} />

          <Box sx={{ position: 'relative', pl: 1 }}>
            <Box 
                sx={{ 
                    position: 'absolute', 
                    top: 8, 
                    bottom: 24, 
                    left: 7, 
                    width: '2px', 
                    bgcolor: '#e0e0e0',
                    zIndex: 0
                }} 
            />

            {/* FROM LOCATION */}
            <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2, position: 'relative', zIndex: 1 }}>
              <Circle sx={{ fontSize: 14, color: '#ad57c1ff', mt: 0.5, mr: 1.5, bgcolor: 'white', borderRadius: '50%' }} />
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>From</Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                  {/* ✅ USE HELPER FUNCTION HERE */}
                  {getShortLocation(ride.from_location)}
                </Typography>
              </Box>
            </Box>

            {/* TO LOCATION */}
            <Box sx={{ display: 'flex', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
              <LocationOn sx={{ fontSize: 18, color: '#ff5252', mt: 0.2, mr: 1, ml: -0.2 }} />
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>To</Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                   {/* ✅ USE HELPER FUNCTION HERE */}
                   {getShortLocation(ride.to_location)}
                </Typography>
              </Box>
            </Box>
          </Box>

        </CardContent>
        
        <Box sx={{ p: 2, pt: 0, mt: 'auto', display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end' }}>
            <Box sx={{ textAlign: 'right' }}>
                <Typography variant="h5" color="primary" sx={{ fontWeight: 'bold', color: '#ad57c1ff' }}>
                ₹{ride.price_per_seat}
                </Typography>
            </Box>
        </Box>
      </RouterLink>

      {isCreator && (
        <CardActions sx={{ px: 2, pb: 2, pt: 0 }}>
          <Button
            variant="outlined"
            color="error"
            size="small"
            onClick={(e) => {
                e.preventDefault(); 
                onDelete(rideId);
            }}
            fullWidth
            startIcon={<Delete />}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
          >
            Delete
          </Button>
        </CardActions>
      )}
    </Card>
  );
};

export default RideCard;