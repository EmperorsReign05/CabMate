import React from 'react';
import { Card, CardContent, Typography, Button, Box, Chip } from '@mui/material';
import PhoneIcon from '@mui/icons-material/Phone';

const CabContactCard = ({ phone, price, locations, notes }) => {
  return (
    <Card sx={{ border: '1px solid #e0e0e0', height: '100%' }}>
      <CardContent sx={{ textAlign: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
          ₹{price}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2 }}>
          Fixed Rate to MUJ
        </Typography>
        <Chip label={phone} color="success" sx={{ mb: 2, fontSize: '1rem' }} />

        <Typography variant="body2" sx={{ my: 2 }}>
          {notes}
        </Typography>

        <Box sx={{ my: 2 }}>
          <Typography variant="caption" color="text.secondary">
            From: {locations}
          </Typography>
        </Box>
        
        <Button
          variant="contained"
          startIcon={<PhoneIcon />}
          href={`tel:${phone}`}
          fullWidth
        >
          Call to Book
        </Button>
      </CardContent>
    </Card>
  );
};

export default CabContactCard;