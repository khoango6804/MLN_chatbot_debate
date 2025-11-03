import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Grid,
  Alert,
  CircularProgress,
  Chip,
  Snackbar
} from '@mui/material';
import {
  School,
  Group,
  Timer,
  PlayArrow
} from '@mui/icons-material';
import axios from 'axios';
import { useTheme } from '@mui/material/styles';
import MuiAlert from '@mui/material/Alert';
import API_CONFIG from '../config/api';

const StartDebate = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [formData, setFormData] = useState({
    teamId: '',
    member1: '',
    member2: '',
    member3: '',
    member4: '',
    member5: '',
    course: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const courses = [
    { value: 'MLN111+MLN122', label: 'MLN111+MLN122 - Triết học & Kinh tế Chính trị Marx - Lenin' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    
    console.log('🚀 Starting handleSubmit...');
    console.log('Form data:', formData);
    
    try {
      // Filter out empty members
      const members = [formData.member1, formData.member2, formData.member3, formData.member4, formData.member5]
        .map(m => m.trim())
        .filter(m => m.length > 0);
      
      console.log('📝 Filtered members:', members);
      
      if (!formData.teamId.trim()) {
        setError('Vui lòng nhập Team ID');
        setLoading(false);
        return;
      }
      
      if (members.length === 0) {
        setError('Vui lòng nhập ít nhất một thành viên');
        setLoading(false);
        return;
      }
      
      if (!formData.course) {
        setError('Vui lòng chọn môn học');
        setLoading(false);
        return;
      }
      
      const requestData = {
        members: members,
        course_code: formData.course,
        team_id: formData.teamId.trim(), // Team ID is now required
      };
      
      console.log('📤 Sending request:', requestData);
      
      const response = await axios.post(`${API_CONFIG.baseURL}/debate/start`, requestData);
      
      console.log('📥 Response received:', response);
      console.log('📊 Response data:', response.data);
      console.log('📊 Response status:', response.status);
      
      // Backend returns: { success: true, team_id: "TEAM001", topic: "...", message: "..." }
      const { success, team_id, topic } = response.data;
      
      if (success && team_id) {
        console.log('✅ Debate started successfully:', { team_id, topic, members });
        setSnackbar({ 
          open: true, 
          message: `Tạo debate thành công! Team ID: ${team_id} - Chủ đề: ${topic}`, 
          severity: 'success' 
        });
        setTimeout(() => {
          console.log('🔄 Navigating to:', `/debate/${team_id}`);
          navigate(`/debate/${team_id}`);
        }, 1200);
      } else {
        console.log('❌ Invalid response:', response.data);
        setError('Server response invalid');
      }
    } catch (err) {
      console.error('❌ Start debate error:', err);
      console.error('❌ Error response:', err.response);
      console.error('❌ Error message:', err.message);
      
      const errorMsg = err.response?.data?.detail || err.message || 'Failed to start debate. Please try again.';
      setError(errorMsg);
      setSnackbar({ open: true, message: errorMsg, severity: 'error' });
    } finally {
      setLoading(false);
      console.log('🏁 handleSubmit finished');
    }
  };

  const features = [
    {
      icon: <School sx={{ fontSize: 30, color: '#007AFF' }} />,
      title: "Đề tài đa dạng",
      description: "Chọn từ kho đề tài phong phú của MLN111+MLN122"
    },
    {
      icon: <Group sx={{ fontSize: 30, color: '#5856D6' }} />,
      title: "Làm việc nhóm",
      description: "Hợp tác với 5 thành viên để đạt kết quả tốt nhất"
    },
    {
      icon: <Timer sx={{ fontSize: 30, color: '#FF9500' }} />,
      title: "Thời gian thực",
      description: "Trải nghiệm tranh luận với đồng hồ đếm ngược"
    }
  ];

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #7ecbff 0%, #007AFF 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background decoration */}
      <Box sx={{
        position: 'absolute',
        top: -100,
        right: -100,
        width: 300,
        height: 300,
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '50%',
        filter: 'blur(60px)'
      }} />
      <Box sx={{
        position: 'absolute',
        bottom: -50,
        left: -50,
        width: 200,
        height: 200,
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '50%',
        filter: 'blur(40px)'
      }} />

              <Container maxWidth="lg" sx={{ 
          position: 'relative', 
          zIndex: 1, 
          py: { xs: 2, sm: 3, md: 4 },
          px: { xs: 2, sm: 3, md: 4 }
        }}>
        {/* Header */}
        <Box sx={{ 
          textAlign: 'center', 
          mb: 6, 
          color: theme.palette.text.primary,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2
        }}>
          <Typography
            variant={{ xs: "h4", sm: "h3", md: "h2" }}
            sx={{
              fontWeight: 700,
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
              background: 'linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              color: theme.palette.text.primary,
              lineHeight: 1.2,
              display: 'block',
              width: '100%'
            }}
          >
            Bắt đầu tranh luận
          </Typography>
          <Typography 
            variant={{ xs: "body1", sm: "h6" }} 
            sx={{ 
              opacity: 0.9, 
              fontWeight: 300, 
              color: theme.palette.text.secondary,
              fontSize: { xs: '1rem', sm: '1.25rem' },
              px: { xs: 2, sm: 0 },
              lineHeight: 1.4,
              display: 'block',
              width: '100%',
              mt: 1
            }}
          >
            Điền thông tin đội để bắt đầu cuộc thi
          </Typography>
        </Box>

        <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
          {/* Form Section */}
          <Grid item xs={12} lg={7}>
            <Card sx={{
              background: theme.palette.background.paper,
              borderRadius: '24px',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              color: theme.palette.text.primary
            }}>
              <CardContent sx={{ p: { xs: 3, sm: 4, md: 5 } }}>
                <Typography 
                  variant={{ xs: "h5", sm: "h4" }} 
                  sx={{ 
                    mb: 3, 
                    fontWeight: 600, 
                    color: theme.palette.text.primary,
                    fontSize: { xs: '1.5rem', sm: '2rem' }
                  }}
                >
                  Thông tin đội
                </Typography>

                {error && (
                  <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>
                    {error}
                  </Alert>
                )}

                <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <TextField
                    name="teamId"
                    label="Team ID *"
                    value={formData.teamId}
                    onChange={handleInputChange}
                    fullWidth
                    required
                    placeholder="VD: NHOM1, TEAM-A, MLN-GROUP1"
                    helperText="Nhập Team ID duy nhất cho nhóm của bạn"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        '&:hover fieldset': {
                          borderColor: '#007AFF',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#007AFF',
                        },
                      },
                    }}
                  />

                  <TextField
                    name="member1"
                    label="Thành viên 1"
                    value={formData.member1}
                    onChange={handleInputChange}
                    fullWidth
                    required
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        '&:hover fieldset': {
                          borderColor: '#007AFF',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#007AFF',
                        },
                      },
                    }}
                  />

                  <TextField
                    name="member2"
                    label="Thành viên 2"
                    value={formData.member2}
                    onChange={handleInputChange}
                    fullWidth
                    required
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        '&:hover fieldset': {
                          borderColor: '#007AFF',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#007AFF',
                        },
                      },
                    }}
                  />

                  <TextField
                    name="member3"
                    label="Thành viên 3"
                    value={formData.member3}
                    onChange={handleInputChange}
                    fullWidth
                    required
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        '&:hover fieldset': {
                          borderColor: '#007AFF',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#007AFF',
                        },
                      },
                    }}
                  />

                  <TextField
                    name="member4"
                    label="Thành viên 4"
                    value={formData.member4}
                    onChange={handleInputChange}
                    fullWidth
                    required
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        '&:hover fieldset': {
                          borderColor: '#007AFF',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#007AFF',
                        },
                      },
                    }}
                  />

                  <TextField
                    name="member5"
                    label="Thành viên 5"
                    value={formData.member5}
                    onChange={handleInputChange}
                    fullWidth
                    required
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        '&:hover fieldset': {
                          borderColor: '#007AFF',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#007AFF',
                        },
                      },
                    }}
                  />

                  <FormControl fullWidth required>
                    <InputLabel sx={{ color: '#666' }}>Chọn môn học</InputLabel>
                    <Select
                      name="course"
                      value={formData.course}
                      onChange={handleInputChange}
                      sx={{
                        borderRadius: '12px',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(0, 122, 255, 0.2)',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#007AFF',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#007AFF',
                        },
                      }}
                    >
                      {courses.map((course) => (
                        <MenuItem key={course.value} value={course.value}>
                          {course.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={loading}
                    sx={{
                      background: 'linear-gradient(135deg, #007AFF 0%, #5856D6 100%)',
                      borderRadius: '50px',
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
                      '&:disabled': {
                        background: '#ccc',
                        transform: 'none',
                        boxShadow: 'none'
                      },
                      transition: 'all 0.3s ease'
                    }}
                    endIcon={loading ? <CircularProgress size={20} color="inherit" /> : <PlayArrow />}
                  >
                    {loading ? 'Đang tạo phiên...' : 'Bắt đầu tranh luận'}
                  </Button>
                  
                  {/* Debug Test Button */}
                  <Button
                    onClick={async () => {
                      console.log('🧪 Direct API Test - Starting...');
                      try {
                        const testData = {
                          members: ["Test User Debug"],
                          course_code: "MLN111+MLN122"
                        };
                        console.log('🧪 Test request:', testData);
                        
                        const response = await axios.post(`${API_CONFIG.baseURL}/debate/start`, testData);
                        console.log('🧪 Test response:', response);
                        console.log('🧪 Test success:', response.data);
                        
                        alert(`✅ API TEST SUCCESS:\n${JSON.stringify(response.data, null, 2)}`);
                      } catch (err) {
                        console.error('🧪 Test error:', err);
                        console.error('🧪 Test error response:', err.response);
                        alert(`❌ API TEST ERROR:\n${err.message}\nResponse: ${err.response?.data?.detail || 'No detail'}`);
                      }
                    }}
                    variant="outlined"
                    size="small"
                    sx={{ 
                      mt: 1, 
                      fontSize: '12px',
                      borderColor: '#007AFF',
                      color: '#007AFF',
                      '&:hover': {
                        borderColor: '#0056CC',
                        backgroundColor: 'rgba(0, 122, 255, 0.04)'
                      }
                    }}
                  >
                    🧪 Test API Debug
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Features Section */}
          <Grid item xs={12} lg={5}>
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 3 }}>
              {features.map((feature, index) => (
                <Card
                  key={index}
                  sx={{
                    background: 'rgba(255, 255, 255, 0.9)',
                    borderRadius: '20px',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 12px 40px rgba(0, 0, 0, 0.1)'
                    }
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ 
                        p: 1.5, 
                        borderRadius: '12px',
                        background: 'rgba(0, 122, 255, 0.1)'
                      }}>
                        {feature.icon}
                      </Box>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                          {feature.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {feature.description}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}

              {/* Info Card */}
              <Card sx={{
                background: 'rgba(255, 255, 255, 0.9)',
                borderRadius: '20px',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#1d1d1f' }}>
                    Lưu ý quan trọng
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Chip
                      label="Không được copy-paste trong quá trình làm bài"
                      size="small"
                      sx={{
                        background: 'rgba(255, 59, 48, 0.1)',
                        color: '#FF3B30',
                        fontWeight: 500
                      }}
                    />
                    <Chip
                      label="Không được thoát khỏi màn hình"
                      size="small"
                      sx={{
                        background: 'rgba(255, 149, 0, 0.1)',
                        color: '#FF9500',
                        fontWeight: 500
                      }}
                    />
                    <Chip
                      label="Tuân thủ thời gian quy định"
                      size="small"
                      sx={{
                        background: 'rgba(0, 122, 255, 0.1)',
                        color: '#007AFF',
                        fontWeight: 500
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <MuiAlert elevation={6} variant="filled" severity={snackbar.severity} sx={{ borderRadius: 2 }}>
          {snackbar.message}
        </MuiAlert>
      </Snackbar>
    </Box>
  );
};

export default StartDebate; 
