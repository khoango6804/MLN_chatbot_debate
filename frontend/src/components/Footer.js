import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Chip,
  Avatar,
  Link,
  Divider
} from '@mui/material';
import {
  Phone,
  Email,
  Facebook,
  Group,
  EmojiEvents
} from '@mui/icons-material';

function Footer() {
  const teamMembers = [
    "Ngô Quốc Anh Khoa",
    "Văn Hồng Bảo Trân", 
    "Trần Huy Anh",
    "Nguyễn Xuân An",
    "Vũ Anh Khôi",
    "Nguyễn Lê Hoàng Phúc",
    "Nguyễn Song Châu Thịnh",
    "Nguyễn Hữu Dương",
    "Trần Đình Gia Bảo"
  ];

  return (
    <Box sx={{
      background: 'linear-gradient(135deg, #7ecbff 0%, #007AFF 100%)',
      backdropFilter: 'blur(20px)',
      borderTop: '1px solid rgba(126, 203, 255, 0.5)',
      boxShadow: '0 -12px 40px rgba(0, 122, 255, 0.3)',
      mt: 'auto',
      py: { xs: 4, md: 6 },
      px: { xs: 2, md: 3 },
      color: '#ffffff',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background decoration */}
      <Box sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.08) 0%, transparent 50%)',
        pointerEvents: 'none'
      }} />
      
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        {/* Logo Section */}
        <Box sx={{ textAlign: 'center', mb: { xs: 3, md: 5 } }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            mb: { xs: 2, md: 3 }, 
            gap: { xs: 2, md: 4 },
            flexDirection: { xs: 'column', sm: 'row' }
          }}>
            {/* FPT Logo */}
            <Box sx={{ 
              p: 2,
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)'
              }
            }}>
              <img 
                src="/fpt_logo.png" 
                alt="FPT University Logo" 
                style={{ 
                  height: 60, 
                  width: 'auto', 
                  objectFit: 'contain'
                }}
              />
            </Box>
            
            {/* Divider - Hidden on mobile */}
            <Box sx={{ 
              width: 4, 
              height: 60, 
              background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.4) 100%)',
              borderRadius: 3,
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
              display: { xs: 'none', sm: 'block' }
            }} />
            
            {/* Soft Skills Logo */}
            <Box sx={{ 
              p: 2,
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)'
              }
            }}>
              <img 
                src="/softskills_logo.png" 
                alt="Soft Skills Department Logo" 
                style={{ 
                  height: 60, 
                  width: 'auto', 
                  objectFit: 'contain',
                  borderRadius: '8px'
                }}
              />
            </Box>
          </Box>
        </Box>
        
        <Grid container spacing={{ xs: 2, md: 4 }}>
          {/* Left Column - Instructors and Team */}
          <Grid item xs={12} md={8}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2, md: 3 }, height: '100%' }}>
              {/* Instructors Section */}
              <Box sx={{ 
                p: { xs: 3, md: 4 },
                borderRadius: 4,
                background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.6) 100%)',
                backdropFilter: 'blur(15px)',
                border: '1px solid rgba(255,255,255,0.4)',
                boxShadow: '0 8px 32px rgba(126, 203, 255, 0.15)',
                transition: 'all 0.3s ease',
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                '&:hover': {
                  boxShadow: '0 12px 40px rgba(126, 203, 255, 0.2)'
                }
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 2, md: 3 }, gap: 2 }}>
                  <Box sx={{
                    background: 'linear-gradient(135deg, #4682b4 0%, #5f9ea0 100%)',
                    borderRadius: '50%',
                    width: { xs: 40, md: 48 },
                    height: { xs: 40, md: 48 },
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <EmojiEvents sx={{ fontSize: { xs: 20, md: 24 }, color: 'white' }} />
                  </Box>
                  <Typography
                    variant={{ xs: "h6", md: "h5" }}
                    sx={{
                      fontWeight: 700,
                      color: '#4682b4',
                      fontSize: { xs: '1.125rem', md: '1.5rem' }
                    }}
                  >
                    Giảng viên hướng dẫn
                  </Typography>
                </Box>
                
                <Box sx={{ 
                  display: 'flex', 
                  gap: { xs: 1, md: 2 }, 
                  flexWrap: 'wrap', 
                  flex: 1, 
                  alignItems: 'flex-start',
                  flexDirection: { xs: 'column', sm: 'row' }
                }}>
                  <Chip
                    label="Nguyễn Văn Bình"
                    avatar={
                      <Avatar sx={{ 
                        background: 'linear-gradient(135deg, #4682b4 0%, #5f9ea0 100%)',
                        color: 'white', 
                        fontWeight: 600,
                        fontSize: { xs: '0.75rem', md: '0.9rem' },
                        width: { xs: 24, md: 32 },
                        height: { xs: 24, md: 32 }
                      }}>
                        NB
                      </Avatar>
                    }
                    sx={{
                      fontSize: { xs: '0.875rem', md: '1rem' },
                      fontWeight: 500,
                      py: { xs: 2, md: 2.5 },
                      px: { xs: 1, md: 1.5 },
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255,255,255,0.4)',
                      boxShadow: '0 4px 16px rgba(126, 203, 255, 0.15)',
                      transition: 'all 0.3s ease',
                      width: { xs: '100%', sm: 'auto' },
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 32px rgba(126, 203, 255, 0.2)'
                      }
                    }}
                  />
                  <Chip
                    label="Tô Hải Anh"
                    avatar={
                      <Avatar sx={{ 
                        background: 'linear-gradient(135deg, #20b2aa 0%, #87ceeb 100%)',
                        color: 'white',
                        fontWeight: 600,
                        fontSize: { xs: '0.75rem', md: '0.9rem' },
                        width: { xs: 24, md: 32 },
                        height: { xs: 24, md: 32 }
                      }}>
                        HA
                      </Avatar>
                    }
                    sx={{
                      fontSize: { xs: '0.875rem', md: '1rem' },
                      fontWeight: 500,
                      py: { xs: 2, md: 2.5 },
                      px: { xs: 1, md: 1.5 },
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255,255,255,0.4)',
                      boxShadow: '0 4px 16px rgba(126, 203, 255, 0.15)',
                      transition: 'all 0.3s ease',
                      width: { xs: '100%', sm: 'auto' },
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 32px rgba(126, 203, 255, 0.2)'
                      }
                    }}
                  />
                </Box>
              </Box>

              {/* Team Members Section */}
              <Box sx={{ 
                p: { xs: 3, md: 4 },
                borderRadius: 4,
                background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.6) 100%)',
                backdropFilter: 'blur(15px)',
                border: '1px solid rgba(255,255,255,0.4)',
                boxShadow: '0 8px 32px rgba(126, 203, 255, 0.15)',
                transition: 'all 0.3s ease',
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                '&:hover': {
                  boxShadow: '0 12px 40px rgba(126, 203, 255, 0.2)'
                }
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 2, md: 3 }, gap: 2 }}>
                  <Box sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: '50%',
                    width: { xs: 40, md: 48 },
                    height: { xs: 40, md: 48 },
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Group sx={{ fontSize: { xs: 20, md: 24 }, color: 'white' }} />
                  </Box>
                  <Typography
                    variant={{ xs: "h6", md: "h5" }}
                    sx={{
                      fontWeight: 700,
                      color: '#667eea',
                      fontSize: { xs: '1.125rem', md: '1.5rem' }
                    }}
                  >
                    Thành viên thực hiện dự án
                  </Typography>
                </Box>
                
                <Box sx={{ 
                  display: 'flex', 
                  flexWrap: 'wrap', 
                  gap: { xs: 1, md: 2 }, 
                  flex: 1, 
                  alignItems: 'flex-start' 
                }}>
                  {teamMembers.map((member, index) => (
                    <Chip
                      key={index}
                      label={member}
                      avatar={
                        <Avatar sx={{ 
                          background: `linear-gradient(135deg, ${
                            index % 4 === 0 ? '#667eea, #764ba2' :
                            index % 4 === 1 ? '#f093fb, #f5576c' :
                            index % 4 === 2 ? '#4facfe, #00f2fe' :
                            '#a8edea, #fed6e3'
                          })`,
                          color: 'white',
                          fontWeight: 600,
                          fontSize: { xs: '0.625rem', md: '0.75rem' },
                          width: { xs: 20, md: 28 },
                          height: { xs: 20, md: 28 }
                        }}>
                          {member.split(' ').slice(-2).map(n => n[0]).join('')}
                        </Avatar>
                      }
                      sx={{
                        fontSize: { xs: '0.75rem', md: '0.9rem' },
                        fontWeight: 500,
                        py: { xs: 1.5, md: 2 },
                        px: { xs: 1, md: 1.2 },
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.4)',
                        boxShadow: '0 4px 16px rgba(126, 203, 255, 0.15)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 8px 32px rgba(126, 203, 255, 0.2)'
                        }
                      }}
                    />
                  ))}
                </Box>
              </Box>
            </Box>
          </Grid>
          
          {/* Contact Section - Right Column */}
          <Grid item xs={12} md={4}>
            <Box sx={{ 
              p: { xs: 3, md: 5 },
              borderRadius: 4,
              background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.6) 100%)',
              backdropFilter: 'blur(15px)',
              border: '1px solid rgba(255,255,255,0.4)',
              boxShadow: '0 8px 32px rgba(70, 130, 180, 0.15)',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: '0 12px 40px rgba(70, 130, 180, 0.2)'
              }
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 3, md: 4 }, gap: 2 }}>
                <Box sx={{
                  background: 'linear-gradient(135deg, #4682b4 0%, #5f9ea0 100%)',
                  borderRadius: '50%',
                  width: { xs: 40, md: 48 },
                  height: { xs: 40, md: 48 },
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Phone sx={{ fontSize: { xs: 20, md: 24 }, color: 'white' }} />
                </Box>
                <Typography
                  variant={{ xs: "h6", md: "h5" }}
                  sx={{
                    fontWeight: 700,
                    color: '#4682b4',
                    fontSize: { xs: '1.125rem', md: '1.5rem' }
                  }}
                >
                  Liên hệ
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2, md: 3 }, flex: 1 }}>
                <Link 
                  href="tel:0703089685" 
                  sx={{ 
                    color: '#333', 
                    fontSize: { xs: '1rem', md: '1.1rem' }, 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: { xs: 2, md: 3 },
                    p: { xs: 2, md: 3 },
                    borderRadius: 3,
                    background: 'rgba(255,255,255,0.5)',
                    transition: 'all 0.3s ease',
                    textDecoration: 'none',
                    fontWeight: 500,
                    '&:hover': { 
                      color: '#007AFF',
                      background: 'rgba(0,122,255,0.1)',
                      transform: 'translateX(4px)'
                    }
                  }}
                >
                  <Box sx={{
                    background: 'linear-gradient(135deg, #4682b4 0%, #5f9ea0 100%)',
                    borderRadius: '50%',
                    width: { xs: 32, md: 36 },
                    height: { xs: 32, md: 36 },
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Phone sx={{ fontSize: { xs: 16, md: 20 }, color: 'white' }} />
                  </Box>
                  0703089685
                </Link>
                
                <Link 
                  href="mailto:anhkhoa.ngo0608@gmail.com" 
                  sx={{ 
                    color: '#333', 
                    fontSize: { xs: '1rem', md: '1.1rem' }, 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: { xs: 2, md: 3 },
                    p: { xs: 2, md: 3 },
                    borderRadius: 3,
                    background: 'rgba(255,255,255,0.5)',
                    transition: 'all 0.3s ease',
                    textDecoration: 'none',
                    fontWeight: 500,
                    '&:hover': { 
                      color: '#007AFF',
                      background: 'rgba(0,122,255,0.1)',
                      transform: 'translateX(4px)'
                    }
                  }}
                >
                  <Box sx={{
                    background: 'linear-gradient(135deg, #20b2aa 0%, #87ceeb 100%)',
                    borderRadius: '50%',
                    width: { xs: 32, md: 36 },
                    height: { xs: 32, md: 36 },
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Email sx={{ fontSize: { xs: 16, md: 20 }, color: 'white' }} />
                  </Box>
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    overflow: 'hidden'
                  }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: { xs: '0.875rem', md: '1rem' } }}>
                      Email
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      fontSize: { xs: '0.75rem', md: '0.9rem' }, 
                      opacity: 0.8,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: { xs: '150px', md: '200px' }
                    }}>
                      anhkhoa.ngo0608@gmail.com
                    </Typography>
                  </Box>
                </Link>
                
                <Link 
                  href="https://www.facebook.com/SSC.FPTU.HCM" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  sx={{ 
                    color: '#333', 
                    fontSize: { xs: '1rem', md: '1.1rem' }, 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: { xs: 2, md: 3 },
                    p: { xs: 2, md: 3 },
                    borderRadius: 3,
                    background: 'rgba(255,255,255,0.5)',
                    transition: 'all 0.3s ease',
                    textDecoration: 'none',
                    fontWeight: 500,
                    '&:hover': { 
                      color: '#1877F2',
                      background: 'rgba(24,119,242,0.1)',
                      transform: 'translateX(4px)'
                    }
                  }}
                >
                  <Box sx={{
                    background: 'linear-gradient(135deg, #6495ed 0%, #00bfff 100%)',
                    borderRadius: '50%',
                    width: { xs: 32, md: 36 },
                    height: { xs: 32, md: 36 },
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Facebook sx={{ fontSize: { xs: 16, md: 20 }, color: 'white' }} />
                  </Box>
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column'
                  }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: { xs: '0.875rem', md: '1rem' } }}>
                      Facebook
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', md: '0.9rem' }, opacity: 0.8 }}>
                      Soft Skills Club FPTU HCMC
                    </Typography>
                  </Box>
                </Link>
              </Box>
            </Box>
          </Grid>
        </Grid>
        
        {/* Bottom Section */}
        <Box sx={{ mt: { xs: 3, md: 5 }, pt: { xs: 2, md: 3 } }}>
          <Divider sx={{ 
            mb: { xs: 2, md: 3 }, 
            borderColor: 'rgba(255, 255, 255, 0.3)',
            background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.5) 50%, transparent 100%)',
            height: 1
          }} />
          
          <Box sx={{ 
            textAlign: 'center',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
            backdropFilter: 'blur(10px)',
            borderRadius: 3,
            p: { xs: 2, md: 3 },
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <Typography 
              variant="body1" 
              sx={{ 
                fontWeight: 500,
                background: 'linear-gradient(135deg, #ffffff 0%, #e6f3ff 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontSize: { xs: '0.875rem', md: '1rem' }
              }}
            >
              © 2025 AI Debate System - MLN111+MLN122
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                mt: 1,
                opacity: 0.8,
                fontStyle: 'italic',
                fontSize: { xs: '0.75rem', md: '0.875rem' }
              }}
            >
              Phát triển bởi nhóm sinh viên môn MLN111+MLN122 lớp AI1804
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

export default Footer; 