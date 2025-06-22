import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
    Container, Typography, Grid, Card, CardContent, CardActions,
    CircularProgress, Box, Alert, Button, Chip, Tabs, Tab,
    Dialog, DialogTitle, DialogContent, DialogActions, IconButton,
    LinearProgress, Divider
} from '@mui/material';
import { Close as CloseIcon, Download as DownloadIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { format } from 'date-fns';

const API_URL = 'http://localhost:5000/api';

const ScoreCategory = ({ title, scores, criteria }) => {
    if (!scores || !criteria) return null;
    const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
    const maxScore = criteria.reduce((sum, item) => sum + item.max_score, 0);

    return (
        <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>{title}</Typography>
                <Chip label={`Tổng: ${totalScore} / ${maxScore}`} color="primary" />
            </Box>
            {criteria.map((item) => {
                const score = scores[item.id] ?? 0;
                const percentage = item.max_score > 0 ? (score / item.max_score) * 100 : 0;
                return (
                    <Box key={item.id} sx={{ mb: 1.5 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="body2">{item.name}</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>{score} / {item.max_score}</Typography>
                        </Box>
                        <LinearProgress variant="determinate" value={percentage} />
                    </Box>
                );
            })}
        </Box>
    );
};


const AdminDashboard = () => {
    const [activeSessions, setActiveSessions] = useState([]);
    const [completedSessions, setCompletedSessions] = useState([]);
    const [criteria, setCriteria] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentTab, setCurrentTab] = useState('active');
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedSession, setSelectedSession] = useState(null);

    const fetchSessions = useCallback(async () => {
        try {
            const response = await axios.get(`${API_URL}/admin/sessions`);
            setActiveSessions(response.data.active || []);
            setCompletedSessions(response.data.completed || []);
            setCriteria(response.data.criteria);
            if (error) setError(null);
        } catch (err) {
            setError('Failed to fetch sessions. Is the backend running?');
        } finally {
            if (loading) setLoading(false);
        }
    }, [loading, error]);

    useEffect(() => {
        fetchSessions();
        const interval = setInterval(fetchSessions, 5000); // Auto-refresh
        return () => clearInterval(interval);
    }, [fetchSessions]);

    const handleForceEnd = async (teamId) => {
        if (window.confirm(`Are you sure you want to force end the session for team ${teamId}?`)) {
            try {
                await axios.delete(`${API_URL}/debate/${teamId}/end`);
                fetchSessions(); // Refresh immediately
            } catch (err) {
                setError(`Failed to end session for team ${teamId}.`);
            }
        }
    };

    const handleViewDetails = (session) => {
        setSelectedSession(session);
        setModalOpen(true);
    };

    const handleDeleteHistory = async (teamId) => {
        if (window.confirm(`Bạn có chắc chắn muốn xóa vĩnh viễn lịch sử của nhóm ${teamId} không?`)) {
            try {
                await axios.delete(`${API_URL}/admin/history/${teamId}`);
                fetchSessions(); // Tải lại danh sách ngay lập tức
            } catch (err) {
                setError(`Xóa lịch sử của nhóm ${teamId} thất bại.`);
            }
        }
    };
    
    const handleDownload = async (teamId) => {
        try {
            const response = await axios.get(`${API_URL}/debate/${teamId}/export_docx`, {
                responseType: 'blob', // Important
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `debate_result_${teamId}.docx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            setError(`Failed to download report for team ${teamId}.`);
        }
    };

    const renderSessionCard = (session, is_active = true) => (
        <Grid item key={is_active ? session.team_id : session.completed_at} xs={12} sm={6} md={4}>
            <Card sx={{
                background: 'rgba(255, 255, 255, 0.95)',
                borderRadius: '20px',
                height: '100%',
                transition: 'all 0.3s ease',
                '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 40px rgba(0, 0, 0, 0.1)' }
            }}>
                <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
                            Team: {session.team_id || "N/A"}
                        </Typography>
                        <Chip 
                            label={session.status || (is_active ? session.current_phase : "Hoàn thành")} 
                            color={session.status?.startsWith('Vi phạm') ? "error" : (is_active ? "success" : "default")} 
                            size="small" 
                        />
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        <b>Topic:</b> {session.topic || 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        <b>Members:</b> {session.members?.join(', ') || 'N/A'}
                    </Typography>
                    {is_active ? (
                        <Typography variant="body2" color="text.secondary">
                            <b>Turns:</b> {session.turns_taken ?? 0}
                        </Typography>
                    ) : (
                         <Typography variant="body2" color="text.secondary">
                            <b>Completed:</b> {format(new Date(session.completed_at), 'Pp')}
                        </Typography>
                    )}
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-end', pr: 2, pb: 2 }}>
                    {is_active ? (
                        <Button size="small" color="error" variant="outlined" onClick={() => handleForceEnd(session.team_id)}>
                            Force End
                        </Button>
                    ) : (
                        <Box>
                            <Button size="small" variant="contained" onClick={() => handleViewDetails(session)}>
                                View Score
                            </Button>
                            <IconButton color="warning" size="small" onClick={() => handleDeleteHistory(session.team_id)} sx={{ ml: 1 }}>
                                <DeleteIcon />
                            </IconButton>
                        </Box>
                    )}
                </CardActions>
            </Card>
        </Grid>
    );

    const renderContent = () => {
        if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
        if (error) return <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>;

        const sessionsToRender = currentTab === 'active' ? activeSessions : completedSessions;
        const noDataMessage = currentTab === 'active' ? "No active sessions found." : "No completed sessions found.";

        if (sessionsToRender.length === 0) {
            return <Alert severity="info" sx={{ mt: 2 }}>{noDataMessage}</Alert>;
        }

        return (
            <Grid container spacing={3} sx={{ mt: 0 }}>
                {sessionsToRender.map(session => renderSessionCard(session, currentTab === 'active'))}
            </Grid>
        );
    };

    return (
        <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
            <Container sx={{ py: 4 }} maxWidth="lg">
                <Typography variant="h2" sx={{ fontWeight: 700, mb: 1, color: '#1d1d1f' }}>Admin Dashboard</Typography>
                <Typography variant="h6" color="text.secondary" sx={{ mb: 4, fontWeight: 300 }}>
                    Monitor active debates and review completed sessions.
                </Typography>

                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                    <Tabs value={currentTab} onChange={(e, newValue) => setCurrentTab(newValue)} aria-label="admin tabs">
                        <Tab label={`Active (${activeSessions.length})`} value="active" />
                        <Tab label={`History (${completedSessions.length})`} value="completed" />
                    </Tabs>
                </Box>

                {renderContent()}

                {selectedSession && criteria && (
                    <Dialog open={modalOpen} onClose={() => setModalOpen(false)} fullWidth maxWidth="md">
                        <DialogTitle sx={{ fontWeight: 600 }}>
                            Score Details for Team: {selectedSession.team_id}
                            <IconButton onClick={() => setModalOpen(false)} sx={{ position: 'absolute', right: 8, top: 8 }}>
                                <CloseIcon />
                            </IconButton>
                        </DialogTitle>
                        <DialogContent dividers>
                            <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>Overall Feedback</Typography>
                            <Typography variant="body1" paragraph sx={{ whiteSpace: 'pre-wrap' }}>
                                {selectedSession.evaluation?.feedback || "No feedback provided."}
                            </Typography>
                            <Divider sx={{ my: 3 }} />
                            <ScoreCategory title="Phase 1: Initial Arguments" scores={selectedSession.evaluation?.scores?.phase1} criteria={criteria.phase1} />
                            <ScoreCategory title="Phase 2A: Socrates Questions" scores={selectedSession.evaluation?.scores?.phase2A} criteria={criteria.phase2A} />
                            <ScoreCategory title="Phase 2B: Socrates Answers" scores={selectedSession.evaluation?.scores?.phase2B} criteria={criteria.phase2B} />
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => handleDownload(selectedSession.team_id)} startIcon={<DownloadIcon />}>
                                Download Report
                            </Button>
                            <Button onClick={() => setModalOpen(false)}>Close</Button>
                        </DialogActions>
                    </Dialog>
                )}
            </Container>
        </Box>
    );
};

export default AdminDashboard; 