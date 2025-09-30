import React from 'react';
import { Container, Typography, Box, Grid } from '@mui/material';
import CabContactCard from '../components/CabContactCard';

const cabData = [
  {
    phone: '+917240111339',
    price: 700,
    locations: 'Popular locations: Airport, Sindhi Camp, Station, or Ajmeri Pulia',
    notes: '"New cab booking stall"'
  },
  {
    phone: '+919799845311',
    price: 800,
    locations: 'Popular locations: Airport, Sindhi Camp, Station, or Ajmer Pulia',
    notes: '"Confirm the number of passengers, generally the rate is for 3 people. Try negotiating, though prices are generally fixed."'
  },
  {
    phone: '+919509027828',
    price: 900,
    locations: 'Popular locations: Airport, Sindhi Camp, Station, or Ajmeri Pulia',
    notes: '"Confirm the number of passengers, generally the rate is for 3 people. Try negotiating, though prices are generally fixed."'
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
          Cab booking options for rides.
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