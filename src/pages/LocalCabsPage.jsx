import React from 'react';
import { 
  Container, Typography, Box, Grid, Button, Paper, 
  Fade, Avatar, Stack, Chip 
} from '@mui/material';
import { 
  LocalTaxi, Phone, LocationOn, InfoOutlined, Call 
} from '@mui/icons-material';

const THEME = {
  primary: '#ad57c1',
  gradient: 'linear-gradient(135deg, #ad57c1 0%, #7b1fa2 100%)',
  glass: 'rgba(255, 255, 255, 0.8)',
  glassBorder: '1px solid rgba(255, 255, 255, 0.6)',
};

const cabData = [
  {
    name: "Standard Booking",
    phone: '+917240111339',
    price: '700-900',
    locations: 'Airport, Sindhi Camp, Station, Ajmeri Pulia',
    notes: 'New cab booking stall'
  },
  {
    name: "Direct Cab",
    phone: '+919799845311',
    price: '700-900',
    locations: 'Airport, Sindhi Camp, Station, Ajmer Pulia',
    notes: 'Confirm passengers & negotiate price.'
  },
  {
    name: "City Taxi",
    phone: '+919509027828',
    price: '700-900',
    locations: 'Airport, Sindhi Camp, Station, Ajmeri Pulia',
    notes: 'Prices generally fixed, but try negotiating.'
  }
];

const LocalCabsPage = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 6, minHeight: '80vh' }}>
      
      {/*header*/}
      <Box sx={{ textAlign: 'center', mb: 8 }}>
        <Fade in={true} timeout={800}>
          <Typography variant="h3" component="h1" sx={{ 
              fontWeight: '800', 
              mb: 2,
              background: 'linear-gradient(45deg, #2c3e50 30%, #ad57c1 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-1px'
          }}>
            Local Cab Contacts
          </Typography>
        </Fade>
        <Fade in={true} timeout={1200}>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: '600px', mx: 'auto' }}>
            Direct contacts for stalls in GHS. Negotiate your fare and travel instantly.
          </Typography>
        </Fade>
      </Box>

      {/*cards*/}
      <Grid container spacing={4} justifyContent="center">
        {cabData.map((cab, index) => (
          <Grid item xs={12} md={4} key={index}>
            <Fade in={true} style={{ transitionDelay: `${index * 150}ms` }}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  height: '100%',
                  borderRadius: '24px',
                  background: 'rgba(255, 255, 255, 0.6)',
                  backdropFilter: 'blur(20px)', 
                  border: THEME.glassBorder,
                  boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 20px 40px rgba(173, 87, 193, 0.2)',
                    borderColor: '#ad57c1'
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Avatar sx={{ 
                      bgcolor: '#f3e5f5', 
                      color: '#ad57c1', 
                      width: 56, 
                      height: 56, 
                      mr: 2,
                      boxShadow: '0 4px 12px rgba(173, 87, 193, 0.2)'
                  }}>
                    <LocalTaxi sx={{ fontSize: 32 }} />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight="bold" sx={{ color: '#333', lineHeight: 1.2 }}>
                      {cab.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" fontWeight="500">
                      Available 24/7
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Chip 
                    label={`₹${cab.price}`} 
                    sx={{ 
                        bgcolor: '#ad57c1', 
                        color: 'white', 
                        fontWeight: 'bold', 
                        fontSize: '1rem',
                        height: '32px',
                        boxShadow: '0 4px 12px rgba(173, 87, 193, 0.4)'
                    }} 
                  />
                  <Typography variant="caption" sx={{ ml: 1, color: 'text.secondary', fontWeight: 600 }}>
                    Estimated Fare
                  </Typography>
                </Box>

                <Stack spacing={2} sx={{ mb: 4, flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <LocationOn sx={{ color: '#ff5252', fontSize: 20, mt: 0.5, mr: 1.5 }} />
                    <Box>
                      <Typography variant="body2" fontWeight="bold" color="text.primary">
                        Popular Drops
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.4 }}>
                        {cab.locations}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <InfoOutlined sx={{ color: '#2196f3', fontSize: 20, mt: 0.5, mr: 1.5 }} />
                    <Box>
                      <Typography variant="body2" fontWeight="bold" color="text.primary">
                        Note
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.4, fontStyle: 'italic' }}>
                        {cab.notes}
                      </Typography>
                    </Box>
                  </Box>
                </Stack>

                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<Call />}
                  onClick={() => window.open(`tel:${cab.phone}`)}
                  sx={{
                    borderRadius: '16px',
                    py: 1.5,
                    background: THEME.gradient,
                    textTransform: 'none',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    boxShadow: '0 8px 20px rgba(173, 87, 193, 0.3)',
                    '&:hover': {
                      boxShadow: '0 12px 24px rgba(173, 87, 193, 0.5)',
                      transform: 'scale(1.02)'
                    },
                    transition: 'all 0.2s'
                  }}
                >
                  Call {cab.phone}
                </Button>

              </Paper>
            </Fade>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default LocalCabsPage;