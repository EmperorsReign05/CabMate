
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Card, CardContent, Typography, Button, CardActions } from '@mui/material';
import { Place, Schedule, People, Delete } from '@mui/icons-material'; 

const RideCard = ({ ride, isCreator = false, onDelete = () => {} }) => {
  const formattedTime = new Date(ride.departure_time).toLocaleString("en-IN", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%', border: '1px solid #e0e0e0', '&:hover': { boxShadow: 3 } }}>
      <RouterLink to={`/ride/${ride.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <CardContent sx={{ flexGrow: 1 }}>
          {/* From/To Section */}
          <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
            <Place color="primary" sx={{ mt: '4px', mr: 1 }} />
            <Box>
              <Typography variant="h6" component="div" noWrap title={ride.from_display || ride.from}>
                {ride.from_display || ride.from}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                to {ride.to_display || ride.to}
              </Typography>
            </Box>
          </Box>
          
          {/* Time and Seats Section */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Schedule sx={{ fontSize: '1rem', mr: 0.5 }} color="action" />
              <Typography variant="body2" color="text.secondary">{formattedTime}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <People sx={{ fontSize: '1rem', mr: 0.5 }} color="action" />
              <Typography variant="body2" color="text.secondary">{ride.seats_available} seats</Typography>
            </Box>
          </Box>
          
          {/* Cost Section */}
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="h6" component="span" color="primary" sx={{ fontWeight: 'bold' }}>
              ₹{ride.cost_per_seat}
            </Typography>
            <Typography variant="body2" component="span" color="text.secondary">
              /seat
            </Typography>
          </Box>
        </CardContent>
      </RouterLink>

      {isCreator && (
        <CardActions>
          <Button
            variant="contained"
            color="error"
            size="small"
            onClick={() => onDelete(ride.id)}
            fullWidth
            startIcon={<Delete />}
          >
            Delete Ride
          </Button>
        </CardActions>
      )}
    </Card>
  );
};

export default RideCard;