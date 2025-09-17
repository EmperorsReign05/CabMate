import React from 'react';
import { Container, Typography, Box, Grid } from '@mui/material';
import CabContactCard from '../components/CabContactCard';

const cabData = [
  {
    phone: '+919799845311',
    price: 800,
    locations: 'Airport, Sindhi Camp, Station, or Ajmer Pulia',
    notes: '"Mention you are from a carpool group to avail this rate. Confirm the number of passengers, generally the rate is for 3 people."'
  },
  {
    phone: '+919509027828',
    price: 900,
    locations: 'Airport, Sindhi Camp, Station, or Ajmeri Pulia',
    notes: '"Mention you are from a carpool group to avail this rate. Confirm the number of passengers, generally the rate is for 3 people."'
  }
];

const LocalCabsPage = () => {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          Local Cab Contacts
        </Typography>
        <Typography color="text.secondary">
          Fixed-rate cab options for rides to MUJ when carpooling isn't available.
        </Typography>
      </Box>

      <Grid container spacing={3} justifyContent="center">
        {cabData.map((cab, index) => (
          <Grid item xs={12} sm={6} md={5} key={index}>
            <CabContactCard {...cab} />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default LocalCabsPage;