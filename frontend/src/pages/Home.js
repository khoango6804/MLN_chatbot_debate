import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Button, 
  Container, 
  Grid, 
  Card, 
  CardContent,
  Chip,
  Divider
} from '@mui/material';
import { 
  School, 
  Psychology, 
  Timer, 
  EmojiEvents,
  ArrowForward,
  Group,
  Security
} from '@mui/icons-material';

const Home = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <School sx={{ fontSize: 40, color: '#007AFF' }} />,
      title: "Học tập tương tác",
      description: "Tham gia tranh luận trực tuyến với AI thông minh"
    },
    {
      icon: <Psychology sx={{ fontSize: 40, color: '#5856D6' }} />,
      title: "Phát triển tư duy",
      description: "Rèn luyện kỹ năng phân tích và lập luận logic"
    },
    {
      icon: <Timer sx={{ fontSize: 40, color: '#FF9500' }} />,
      title: "Thời gian thực",
      description: "Trải nghiệm tranh luận với đồng hồ đếm ngược"
    },
    {
      icon: <EmojiEvents sx={{ fontSize: 40, color: '#FF3B30' }} />,
      title: "Đánh giá chi tiết",
      description: "Nhận phản hồi và điểm số từng tiêu chí"
    }
  ];

  const rules = [
    "Mỗi đội có 3 thành viên",
    "Thời gian chuẩn bị: 10 phút",
    "Thời gian làm bài: 5 phút", 
    "Thời gian tranh luận: 7 phút",
    "Thời gian kết luận: 5 phút"
  ];

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background decoration */}
      <Box sx={{
        position: 'absolute',
        top: -50,
        right: -50,
        width: 200,
        height: 200,
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '50%',
        filter: 'blur(40px)'
      }} />
      <Box sx={{
        position: 'absolute',
        bottom: -100,
        left: -100,
        width: 300,
        height: 300,
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '50%',
        filter: 'blur(60px)'
      }} />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        {/* Hero Section */}
        <Box sx={{ 
          textAlign: 'center', 
          py: 8,
          color: 'white'
        }}>
          <Typography 
            variant="h1" 
            sx={{ 
              fontSize: { xs: '2.5rem', md: '4rem' },
              fontWeight: 700,
              mb: 2,
              background: 'linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
            className="fade-in"
          >
            AI Debate System
          </Typography>
          <Typography 
            variant="h5" 
            sx={{ 
              mb: 4, 
              opacity: 0.9,
              fontWeight: 300,
              maxWidth: 600,
              mx: 'auto'
            }}
            className="slide-up"
          >
            Hệ thống tranh luận thông minh giúp sinh viên phát triển kỹ năng tư duy phản biện
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/start-debate')}
            sx={{
              background: 'linear-gradient(135deg, #007AFF 0%, #5856D6 100%)',
              borderRadius: '50px',
              px: 4,
              py: 2,
              fontSize: '1.1rem',
              fontWeight: 600,
              textTransform: 'none',
              boxShadow: '0 8px 32px rgba(0, 122, 255, 0.3)',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 12px 40px rgba(0, 122, 255, 0.4)',
                background: 'linear-gradient(135deg, #0056CC 0%, #4A4AC4 100%)'
              },
              transition: 'all 0.3s ease'
            }}
            endIcon={<ArrowForward />}
            className="slide-up"
          >
            Bắt đầu tranh luận
          </Button>
        </Box>

        {/* Features Section */}
        <Box sx={{ py: 8 }}>
          <Typography 
            variant="h3" 
            sx={{ 
              textAlign: 'center', 
              mb: 6,
              color: 'white',
              fontWeight: 600
            }}
          >
            Tính năng nổi bật
          </Typography>
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card 
                  sx={{ 
                    background: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: '20px',
                    height: '100%',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)'
                    }
                  }}
                  className="fade-in"
                >
                  <CardContent sx={{ textAlign: 'center', p: 3 }}>
                    <Box sx={{ mb: 2 }}>
                      {feature.icon}
                    </Box>
                    <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Rules Section */}
        <Box sx={{ py: 8 }}>
          <Card 
            sx={{ 
              background: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '20px',
              p: 4
            }}
            className="fade-in"
          >
            <Typography 
              variant="h4" 
              sx={{ 
                textAlign: 'center', 
                mb: 4,
                fontWeight: 600,
                color: '#1d1d1f'
              }}
            >
              Thể lệ cuộc thi
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Group sx={{ color: '#007AFF' }} />
                    Cấu trúc đội
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Mỗi đội tham gia gồm 3 thành viên, cùng nhau chuẩn bị và thực hiện phần tranh luận.
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Security sx={{ color: '#5856D6' }} />
                    Bảo mật
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Hệ thống có các biện pháp chống gian lận như chặn copy-paste và giám sát màn hình.
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Thời gian các giai đoạn:
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {rules.map((rule, index) => (
                    <Chip
                      key={index}
                      label={rule}
                      sx={{
                        background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                        border: '1px solid rgba(0, 122, 255, 0.1)',
                        fontWeight: 500
                      }}
                    />
                  ))}
                </Box>
              </Grid>
            </Grid>
          </Card>
        </Box>

        {/* CTA Section */}
        <Box sx={{ 
          textAlign: 'center', 
          py: 8,
          color: 'white'
        }}>
          <Typography 
            variant="h4" 
            sx={{ 
              mb: 3,
              fontWeight: 600
            }}
          >
            Sẵn sàng thử thách?
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              mb: 4,
              opacity: 0.9,
              fontWeight: 300
            }}
          >
            Tham gia ngay để trải nghiệm hệ thống tranh luận thông minh
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/start-debate')}
            sx={{
              background: 'linear-gradient(135deg, #FF3B30 0%, #FF6B6B 100%)',
              borderRadius: '50px',
              px: 6,
              py: 2,
              fontSize: '1.2rem',
              fontWeight: 600,
              textTransform: 'none',
              boxShadow: '0 8px 32px rgba(255, 59, 48, 0.3)',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 12px 40px rgba(255, 59, 48, 0.4)',
                background: 'linear-gradient(135deg, #E63946 0%, #FF5252 100%)'
              },
              transition: 'all 0.3s ease'
            }}
            endIcon={<ArrowForward />}
          >
            Bắt đầu ngay
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default Home; 