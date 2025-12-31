import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Card, CardContent, Typography, Button, CardActions, Chip, Divider, Stack } from '@mui/material';
import { People, Delete, Woman, Circle, LocationOn } from '@mui/icons-material';

const getShortLocation = (address) => {
  if (!address) return "Unknown";
  const lowerAddr = address.toLowerCase();
  if (lowerAddr.includes("ghs hostel")) return "GHS Hostel";
  if (lowerAddr.includes("airport")) return "Jaipur Airport";
  if (lowerAddr.includes("sindhi camp")) {
    if (lowerAddr.includes("wq9q") || lowerAddr.includes("railway")) {
      return "Jaipur Junction";
    }
    return "Sindhi Camp";
  }
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
        borderRadius: '24px', 
        border: '1px solid rgba(255, 255, 255, 0.6)', 
        background: 'rgba(255, 255, 255, 0.75)', 
        backdropFilter: 'blur(16px)', 
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)', 
        transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)', 
        overflow: 'visible', 
        '&:hover': { 
          transform: 'translateY(-8px)', 
          boxShadow: '0 20px 40px rgba(173, 87, 193, 0.25)', 
          borderColor: '#ad57c1',
        } 
      }}
    >
      <RouterLink to={`/ride/${rideId}`} style={{ textDecoration: 'none', color: 'inherit', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <CardContent sx={{ p: 3, pb: 1, flexGrow: 1 }}>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
            <Box>
               <Typography variant="h4" sx={{ fontWeight: '800', color: '#2c3e50', letterSpacing: '-1px', lineHeight: 1 }}>
                 {timeStr}
               </Typography>
               <Typography variant="body2" sx={{ fontWeight: '600', color: '#ad57c1', textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '1px', mt: 0.5 }}>
                 {dateStr}
               </Typography>
            </Box>
            
            <Stack direction="column" alignItems="flex-end" spacing={1}>
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

          <Box sx={{ position: 'relative', pl: 1, mb: 2 }}>
            
            <Box 
                sx={{ 
                    position: 'absolute', 
                    top: 12, 
                    bottom: 32, 
                    left: '16px', 
                    width: '2px', 
                    borderRadius: '2px',
                    background: 'linear-gradient(to bottom, #ad57c1 0%, #e0e0e0 100%)', // Gradient line
                    zIndex: 0
                }} 
            />

            <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2.5, position: 'relative', zIndex: 1 }}>
              <Box sx={{ width: '24px', display: 'flex', justifyContent: 'center', mt: 0.5, mr: 2 }}>
                <Circle sx={{ fontSize: 14, color: '#ad57c1', bgcolor: 'white', borderRadius: '50%', boxShadow: '0 0 0 4px rgba(255,255,255,0.8)' }} />
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, letterSpacing: '0.5px' }}>FROM</Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2, fontSize: '1.1rem' }}>
                  {getShortLocation(ride.from_location)}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
              <Box sx={{ width: '24px', display: 'flex', justifyContent: 'center', mt: 0.2, mr: 2 }}>
                <LocationOn sx={{ fontSize: 22, color: '#ff5252', filter: 'drop-shadow(0 2px 4px rgba(255,82,82,0.3))' }} />
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, letterSpacing: '0.5px' }}>TO</Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2, fontSize: '1.1rem' }}>
                   {getShortLocation(ride.to_location)}
                </Typography>
              </Box>
            </Box>
          </Box>

        </CardContent>
        
        <Box sx={{ p: 3, pt: 0, mt: 'auto', display: 'flex', justifyContent: 'flex-end' }}>
            <Box sx={{ 
                background: 'linear-gradient(135deg, #ad57c1 0%, #7b1fa2 100%)', //Gradient background
                borderRadius: '50px',
                px: 2.5,
                py: 0.8,
                boxShadow: '0 4px 12px rgba(173, 87, 193, 0.4)',
                color: 'white',
                display: 'flex',
                alignItems: 'baseline',
                gap: 0.5
            }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                ₹{ride.price_per_seat}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.9, fontWeight: 500 }}>
                /seat
                </Typography>
            </Box>
        </Box>
      </RouterLink>

      {isCreator && (
        <CardActions sx={{ px: 3, pb: 3, pt: 0 }}>
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
            sx={{ 
                borderRadius: 3, 
                textTransform: 'none', 
                fontWeight: 700,
                borderWidth: '2px',
                '&:hover': { borderWidth: '2px', bgcolor: 'rgba(211, 47, 47, 0.05)' }
            }}
          >
            Delete
          </Button>
        </CardActions>
      )}
    </Card>
  );
};

export default RideCard;