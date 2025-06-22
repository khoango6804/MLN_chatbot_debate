import React from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container
} from '@mui/material';
import { School, AdminPanelSettings } from '@mui/icons-material';

const Navbar = () => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <AppBar 
      position="static" 
      sx={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
      }}
    >
      <Container maxWidth="lg">
        <Toolbar sx={{ px: { xs: 0 } }}>
          {/* Logo */}
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 4 }}>
            <School sx={{ 
              fontSize: 32, 
              color: 'white',
              mr: 1
            }} />
            <Typography
              variant="h6"
              component={RouterLink}
              to="/"
              sx={{
                textDecoration: 'none',
                color: 'white',
                fontWeight: 700,
                fontSize: '1.5rem',
                background: 'linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              AI Debate
            </Typography>
          </Box>

          {/* Navigation Links */}
          <Box sx={{ flexGrow: 1, display: 'flex', gap: 2 }}>
            <Button
              component={RouterLink}
              to="/"
              sx={{
                color: 'white',
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: isActive('/') ? 600 : 400,
                background: isActive('/') ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                borderRadius: '12px',
                px: 2,
                py: 1,
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.15)',
                  transform: 'translateY(-1px)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              Trang chủ
            </Button>
            <Button
              component={RouterLink}
              to="/start-debate"
              sx={{
                color: 'white',
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: isActive('/start-debate') ? 600 : 400,
                background: isActive('/start-debate') ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                borderRadius: '12px',
                px: 2,
                py: 1,
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.15)',
                  transform: 'translateY(-1px)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              Bắt đầu tranh luận
            </Button>
          </Box>

          {/* Admin Button */}
          <Button
            component={RouterLink}
            to="/admin-login"
            startIcon={<AdminPanelSettings />}
            sx={{
              background: 'linear-gradient(135deg, #007AFF 0%, #5856D6 100%)',
              color: 'white',
              textTransform: 'none',
              borderRadius: '50px',
              px: 3,
              py: 1,
              fontWeight: 600,
              boxShadow: '0 4px 15px rgba(0, 122, 255, 0.3)',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 25px rgba(0, 122, 255, 0.4)',
                background: 'linear-gradient(135deg, #0056CC 0%, #4A4AC4 100%)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            Admin
          </Button>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar; 