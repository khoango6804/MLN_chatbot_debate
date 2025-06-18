import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';

function Home() {
  const navigate = useNavigate();
  const [teamId, setTeamId] = useState('');
  const [courseCode, setCourseCode] = useState('MLN111');
  const [members, setMembers] = useState(['', '', '', '', '']);

  const handleMemberChange = (index, value) => {
    const newMembers = [...members];
    newMembers[index] = value;
    setMembers(newMembers);
  };

  const handleStartDebate = () => {
    if (teamId && members.every(member => member.trim())) {
      navigate(`/debate/${teamId}`);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom align="center">
          AI Debate System
        </Typography>
        <Typography variant="subtitle1" gutterBottom align="center" color="text.secondary">
          Engage in structured debates on MLN111 and MLN122 topics
        </Typography>

        <Box sx={{ mt: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Team ID"
                value={teamId}
                onChange={(e) => setTeamId(e.target.value)}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Course Code</InputLabel>
                <Select
                  value={courseCode}
                  label="Course Code"
                  onChange={(e) => setCourseCode(e.target.value)}
                >
                  <MenuItem value="MLN111">MLN111 - Những nguyên lý cơ bản của chủ nghĩa Mác-Lênin</MenuItem>
                  <MenuItem value="MLN122">MLN122 - Tư tưởng Hồ Chí Minh</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Team Members
              </Typography>
              {members.map((member, index) => (
                <TextField
                  key={index}
                  fullWidth
                  label={`Member ${index + 1}`}
                  value={member}
                  onChange={(e) => handleMemberChange(index, e.target.value)}
                  required
                  sx={{ mb: 2 }}
                />
              ))}
            </Grid>

            <Grid item xs={12}>
              <Button
                variant="contained"
                size="large"
                fullWidth
                onClick={handleStartDebate}
                disabled={!teamId || members.some(member => !member.trim())}
              >
                Start Debate
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
}

export default Home; 