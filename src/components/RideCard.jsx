import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Grid, Card, CardContent, CardActionArea, Typography, CardActions, Button } from '@mui/material';

const RideCard = ({ ride, isCreator = false, onDelete = () => {} }) => {
  return (
    <Grid item xs={12} sm={6} md={4}>
      <Card>
        <CardActionArea component={RouterLink} to={`/ride/${ride.id}`}>
          <CardContent>
            <Typography variant="h6" component="div" noWrap title={ride.from_display || ride.from}>
              {ride.from_display || ride.from}
            </Typography>
            <Typography variant="body1" noWrap title={ride.to_display || ride.to}>
              to {ride.to_display || ride.to}
            </Typography>
            <Typography sx={{ my: 1.5 }} color="text.secondary">
              {new Date(ride.departure_time).toLocaleString()}
            </Typography>
            <Typography variant="body2">
              Seats Available: {ride.seats_available}
            </Typography>
          </CardContent>
        </CardActionArea>
        {isCreator && (
          <CardActions>
            <Button size="small" color="error" onClick={() => onDelete(ride.id)}>
              Delete
            </Button>
          </CardActions>
        )}
      </Card>
    </Grid>
  );
};

export default RideCard;