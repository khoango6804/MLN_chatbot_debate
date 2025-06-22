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
  Chip
} from '@mui/material';
import {
  School,
  Group,
  Timer,
  PlayArrow
} from '@mui/icons-material';

const StartDebate = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    teamName: '',
    member1: '',
    member2: '',
    member3: '',
    course: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const courses = [
    { value: 'MLN111', label: 'MLN111 - Logic học đại cương' },
    { value: 'MLN122', label: 'MLN122 - Logic học ứng dụng' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate form
    if (!formData.teamName || !formData.member1 || !formData.member2 || !formData.member3 || !formData.course) {
      setError('Vui lòng điền đầy đủ thông tin');
      setLoading(false);
      return;
    }

    try {
      const payload = {
        team_id: formData.teamName,
        members: [formData.member1, formData.member2, formData.member3],
        course_code: formData.course
      };

      const response = await fetch('http://localhost:5000/api/debate/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        navigate(`/debate/${data.data.team_id}`);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Có lỗi xảy ra khi tạo phiên tranh luận');
      }
    } catch (err) {
      setError('Không thể kết nối đến máy chủ');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: <School sx={{ fontSize: 30, color: '#007AFF' }} />,
      title: "Đề tài đa dạng",
      description: "Chọn từ kho đề tài phong phú của MLN111 và MLN122"
    },
    {
      icon: <Group sx={{ fontSize: 30, color: '#5856D6' }} />,
      title: "Làm việc nhóm",
      description: "Hợp tác với 3 thành viên để đạt kết quả tốt nhất"
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
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, py: 4 }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 6, color: 'white' }}>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 700,
              mb: 2,
              background: 'linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            Bắt đầu tranh luận
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 300 }}>
            Điền thông tin đội để bắt đầu cuộc thi
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {/* Form Section */}
          <Grid item xs={12} lg={7}>
            <Card sx={{
              background: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '24px',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
            }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h4" sx={{ mb: 3, fontWeight: 600, color: '#1d1d1f' }}>
                  Thông tin đội
                </Typography>

                {error && (
                  <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>
                    {error}
                  </Alert>
                )}

                <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <TextField
                    name="teamName"
                    label="Tên đội"
                    value={formData.teamName}
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
    </Box>
  );
};

export default StartDebate; 