import React from 'react';
import {
  Box,
  Container,
  Typography,
  Link,
  Divider
} from '@mui/material';
import {
  Phone,
  Email,
  School,
  Facebook,
  GitHub
} from '@mui/icons-material';

const Footer = () => {
  return (
    <Box
      sx={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255, 255, 255, 0.2)',
        mt: 'auto',
        py: 4
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', color: 'white' }}>
          {/* Contact Info */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Liên hệ
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4, flexWrap: 'wrap' }}>
              <Link
                href="tel:0703089685"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  color: 'white',
                  textDecoration: 'none',
                  '&:hover': {
                    color: '#007AFF',
                    transform: 'translateY(-1px)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                <Phone sx={{ fontSize: 20 }} />
                0703089685
              </Link>
              <Link
                href="mailto:anhkhoa.ngo0608@gmail.com"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  color: 'white',
                  textDecoration: 'none',
                  '&:hover': {
                    color: '#007AFF',
                    transform: 'translateY(-1px)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                <Email sx={{ fontSize: 20 }} />
                anhkhoa.ngo0608@gmail.com
              </Link>
              <Link
                href="https://www.facebook.com/khoa.ngo.25590/"
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  color: 'white',
                  textDecoration: 'none',
                  '&:hover': {
                    color: '#1877F2',
                    transform: 'translateY(-1px)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                <Facebook sx={{ fontSize: 20 }} />
                Facebook
              </Link>
              <Link
                href="https://github.com/khoango6804"
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  color: 'white',
                  textDecoration: 'none',
                  '&:hover': {
                    color: '#333',
                    transform: 'translateY(-1px)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                <GitHub sx={{ fontSize: 20 }} />
                GitHub
              </Link>
            </Box>
          </Box>

          {/* Mentorship Info */}
          <Typography 
            variant="body2" 
            sx={{ 
              fontStyle: 'italic', 
              mb: 3,
              opacity: 0.9,
              background: 'linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            Được hướng dẫn bởi giảng viên Nguyễn Văn Bình và Hải Anh
          </Typography>

          <Divider sx={{ 
            my: 3, 
            borderColor: 'rgba(255, 255, 255, 0.2)',
            opacity: 0.5
          }} />

          {/* Copyright */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
            <School sx={{ fontSize: 20, opacity: 0.8 }} />
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              {'© '}
              {new Date().getFullYear()}
              {' AI Debate System. All rights reserved.'}
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer; 