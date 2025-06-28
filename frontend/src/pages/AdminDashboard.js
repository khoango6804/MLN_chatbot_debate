import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
    Container, Typography, Grid, Card, CardContent, CardActions,
    CircularProgress, Box, Alert, Button, Chip, Tabs, Tab,
    Dialog, DialogTitle, DialogContent, DialogActions, IconButton,
    LinearProgress, Divider, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, Avatar
} from '@mui/material';
import { 
    Close as CloseIcon, 
    Download as DownloadIcon, 
    Delete as DeleteIcon,
    EmojiEvents as TrophyIcon,
    TrendingUp as TrendingUpIcon,
    Group as GroupIcon,
    Speed as LiveIcon,
    Refresh as RefreshIcon,
    AccessTime as TimeIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useTheme } from '@mui/material/styles';

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

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

const LeaderboardTable = ({ data, stats, loading }) => {
    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
    }

    if (!data || data.length === 0) {
        return <Alert severity="info" sx={{ mt: 2 }}>Không có dữ liệu để hiển thị leaderboard.</Alert>;
    }

    const getRankIcon = (position) => {
        if (position === 1) return '🏆';
        if (position === 2) return '🥈';
        if (position === 3) return '🥉';
        return position;
    };

    const getRankColor = (rank_level) => {
        if (rank_level.includes('Platinum')) return '#E5E4E2';
        if (rank_level.includes('Gold')) return '#FFD700';
        if (rank_level.includes('Silver')) return '#C0C0C0';
        return '#CD7F32'; // Bronze
    };

    return (
        <Box>
            {/* Statistics Cards */}
            {stats && (
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} md={3}>
                        <Card sx={{ textAlign: 'center', p: 2 }}>
                            <GroupIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{stats.total_teams}</Typography>
                            <Typography color="text.secondary">Tổng số nhóm</Typography>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <Card sx={{ textAlign: 'center', p: 2 }}>
                            <TrendingUpIcon color="secondary" sx={{ fontSize: 40, mb: 1 }} />
                            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{stats.average_score}</Typography>
                            <Typography color="text.secondary">Điểm trung bình</Typography>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <Card sx={{ textAlign: 'center', p: 2 }}>
                            <TrophyIcon color="warning" sx={{ fontSize: 40, mb: 1 }} />
                            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{stats.highest_score}</Typography>
                            <Typography color="text.secondary">Điểm cao nhất</Typography>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <Card sx={{ textAlign: 'center', p: 2 }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>Phân bố hạng</Typography>
                                {Object.entries(stats.rank_distribution).map(([rank, count]) => (
                                    <Typography key={rank} variant="body2">
                                        {rank}: {count}
                                    </Typography>
                                ))}
                            </Box>
                        </Card>
                    </Grid>
                </Grid>
            )}

            {/* Leaderboard Table */}
            <TableContainer component={Paper} sx={{ borderRadius: 3, overflow: 'hidden' }}>
                <Table>
                    <TableHead sx={{ backgroundColor: '#1976d2' }}>
                        <TableRow>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Hạng</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Nhóm</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Chủ đề</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Thành viên</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Điểm số</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Phần trăm</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Cấp độ</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Ngày hoàn thành</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data.map((entry, index) => (
                            <TableRow 
                                key={entry.team_id}
                                sx={{ 
                                    '&:nth-of-type(odd)': { backgroundColor: 'rgba(0, 0, 0, 0.04)' },
                                    '&:hover': { backgroundColor: 'rgba(25, 118, 210, 0.08)' }
                                }}
                            >
                                <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Avatar sx={{ 
                                            bgcolor: entry.position <= 3 ? getRankColor(entry.rank_level) : 'grey.300',
                                            width: 40, 
                                            height: 40,
                                            fontSize: '1.2rem'
                                        }}>
                                            {getRankIcon(entry.position)}
                                        </Avatar>
                                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                            #{entry.position}
                                        </Typography>
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                        {entry.team_id}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {entry.course_code}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2" sx={{ 
                                        maxWidth: 200, 
                                        overflow: 'hidden', 
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap'
                                    }}>
                                        {entry.topic}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2">
                                        {entry.members.slice(0, 2).join(', ')}
                                        {entry.members.length > 2 && ` (+${entry.members.length - 2})`}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                        {entry.total_score}/{entry.max_score}
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                                        <Chip size="small" label={`P1: ${entry.phase_scores.phase1}`} />
                                        <Chip size="small" label={`P2A: ${entry.phase_scores.phase2A}`} />
                                        <Chip size="small" label={`P2B: ${entry.phase_scores.phase2B}`} />
                                        <Chip size="small" label={`P3: ${entry.phase_scores.phase3}`} />
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                            {entry.percentage}%
                                        </Typography>
                                        <LinearProgress 
                                            variant="determinate" 
                                            value={entry.percentage} 
                                            sx={{ width: 60, height: 8, borderRadius: 4 }}
                                        />
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    <Chip 
                                        label={entry.rank_level}
                                        sx={{ 
                                            bgcolor: getRankColor(entry.rank_level),
                                            color: 'white',
                                            fontWeight: 'bold'
                                        }}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2">
                                        {format(new Date(entry.completed_at), 'dd/MM/yyyy HH:mm')}
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

const LiveScoringTable = ({ data, stats, loading, onRefresh }) => {
    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
    }

    if (!data || data.length === 0) {
        return <Alert severity="info" sx={{ mt: 2 }}>Hiện tại không có team nào đang thi.</Alert>;
    }

    const getPhaseColor = (status) => {
        switch (status) {
            case 'completed': return 'success';
            case 'current': return 'warning';
            default: return 'default';
        }
    };

    const getPhaseIcon = (status) => {
        switch (status) {
            case 'completed': return '✅';
            case 'current': return '⚡';
            default: return '⏳';
        }
    };

    return (
        <Box>
            {/* Live Statistics Cards - Apple Style */}
            {stats && (
                <Grid container spacing={4} sx={{ mb: 5 }}>
                    <Grid item xs={12} md={3}>
                        <Card sx={{ 
                            textAlign: 'center', 
                            p: 3,
                            borderRadius: 4,
                            background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255,255,255,0.3)',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                transform: 'translateY(-8px)',
                                boxShadow: '0 16px 48px rgba(0,0,0,0.15)'
                            }
                        }}>
                            <Box sx={{ 
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                borderRadius: '50%',
                                width: 64,
                                height: 64,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mx: 'auto',
                                mb: 2
                            }}>
                                <LiveIcon sx={{ fontSize: 32, color: 'white' }} />
                            </Box>
                            <Typography variant="h3" sx={{ 
                                fontWeight: 700, 
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                backgroundClip: 'text',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                mb: 1
                            }}>
                                {stats.active_teams}
                            </Typography>
                            <Typography sx={{ 
                                color: 'rgba(0,0,0,0.6)', 
                                fontWeight: 500,
                                fontSize: '1rem'
                            }}>
                                Teams đang thi
                            </Typography>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <Card sx={{ 
                            textAlign: 'center', 
                            p: 3,
                            borderRadius: 4,
                            background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255,255,255,0.3)',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                transform: 'translateY(-8px)',
                                boxShadow: '0 16px 48px rgba(0,0,0,0.15)'
                            }
                        }}>
                            <Box sx={{ 
                                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                                borderRadius: '50%',
                                width: 64,
                                height: 64,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mx: 'auto',
                                mb: 2
                            }}>
                                <TrendingUpIcon sx={{ fontSize: 32, color: 'white' }} />
                            </Box>
                            <Typography variant="h3" sx={{ 
                                fontWeight: 700, 
                                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                                backgroundClip: 'text',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                mb: 1
                            }}>
                                {stats.average_score}
                            </Typography>
                            <Typography sx={{ 
                                color: 'rgba(0,0,0,0.6)', 
                                fontWeight: 500,
                                fontSize: '1rem'
                            }}>
                                Điểm TB hiện tại
                            </Typography>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <Card sx={{ 
                            textAlign: 'center', 
                            p: 3,
                            borderRadius: 4,
                            background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255,255,255,0.3)',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                transform: 'translateY(-8px)',
                                boxShadow: '0 16px 48px rgba(0,0,0,0.15)'
                            }
                        }}>
                            <Box sx={{ 
                                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                                borderRadius: '50%',
                                width: 64,
                                height: 64,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mx: 'auto',
                                mb: 2
                            }}>
                                <TrophyIcon sx={{ fontSize: 32, color: 'white' }} />
                            </Box>
                            <Typography variant="h3" sx={{ 
                                fontWeight: 700, 
                                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                                backgroundClip: 'text',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                mb: 1
                            }}>
                                {stats.highest_score}
                            </Typography>
                            <Typography sx={{ 
                                color: 'rgba(0,0,0,0.6)', 
                                fontWeight: 500,
                                fontSize: '1rem'
                            }}>
                                Điểm cao nhất
                            </Typography>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <Card sx={{ 
                            textAlign: 'center', 
                            p: 3,
                            borderRadius: 4,
                            background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255,255,255,0.3)',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                transform: 'translateY(-8px)',
                                boxShadow: '0 16px 48px rgba(0,0,0,0.15)'
                            }
                        }}>
                            <Typography variant="h6" sx={{ 
                                fontWeight: 700, 
                                mb: 2,
                                background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
                                backgroundClip: 'text',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent'
                            }}>
                                Phân bố Phase
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                {Object.entries(stats.phases_distribution).map(([phase, count]) => (
                                    <Box key={phase} sx={{ 
                                        display: 'flex', 
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        p: 1,
                                        borderRadius: 2,
                                        background: 'rgba(255,255,255,0.5)'
                                    }}>
                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                            {phase}
                                        </Typography>
                                        <Typography variant="body2" sx={{ 
                                            fontWeight: 700,
                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            backgroundClip: 'text',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent'
                                        }}>
                                            {count}
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>
                        </Card>
                    </Grid>
                </Grid>
            )}

            {/* Refresh Button - Apple Style */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
                <Button
                    startIcon={<RefreshIcon />}
                    onClick={onRefresh}
                    sx={{
                        px: 3,
                        py: 1.5,
                        borderRadius: 3,
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255,255,255,0.3)',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                        color: '#333',
                        fontWeight: 600,
                        textTransform: 'none',
                        fontSize: '0.9rem',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                            background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.8) 100%)'
                        }
                    }}
                >
                    Refresh Now
                </Button>
            </Box>

            {/* Live Scoring Table - Apple Style */}
            <TableContainer 
                component={Paper} 
                sx={{ 
                    borderRadius: 4,
                    overflow: 'hidden',
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    boxShadow: '0 12px 40px rgba(0,0,0,0.12)'
                }}
            >
                <Table>
                    <TableHead sx={{ 
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        position: 'sticky',
                        top: 0,
                        zIndex: 10
                    }}>
                        <TableRow>
                            <TableCell sx={{ 
                                color: 'white', 
                                fontWeight: 700, 
                                fontSize: '1rem',
                                py: 2,
                                borderBottom: 'none'
                            }}>
                                Hạng
                            </TableCell>
                            <TableCell sx={{ 
                                color: 'white', 
                                fontWeight: 700, 
                                fontSize: '1rem',
                                py: 2,
                                borderBottom: 'none'
                            }}>
                                Team
                            </TableCell>
                            <TableCell sx={{ 
                                color: 'white', 
                                fontWeight: 700, 
                                fontSize: '1rem',
                                py: 2,
                                borderBottom: 'none'
                            }}>
                                Chủ đề
                            </TableCell>
                            <TableCell sx={{ 
                                color: 'white', 
                                fontWeight: 700, 
                                fontSize: '1rem',
                                py: 2,
                                borderBottom: 'none'
                            }}>
                                Phase hiện tại
                            </TableCell>
                            <TableCell sx={{ 
                                color: 'white', 
                                fontWeight: 700, 
                                fontSize: '1rem',
                                py: 2,
                                borderBottom: 'none'
                            }}>
                                Điểm hiện tại
                            </TableCell>
                            <TableCell sx={{ 
                                color: 'white', 
                                fontWeight: 700, 
                                fontSize: '1rem',
                                py: 2,
                                borderBottom: 'none'
                            }}>
                                Tiến độ Phase
                            </TableCell>
                            <TableCell sx={{ 
                                color: 'white', 
                                fontWeight: 700, 
                                fontSize: '1rem',
                                py: 2,
                                borderBottom: 'none'
                            }}>
                                Thời gian bắt đầu
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data.map((entry, index) => (
                            <TableRow 
                                key={entry.team_id}
                                sx={{ 
                                    '&:nth-of-type(odd)': { backgroundColor: 'rgba(0, 0, 0, 0.04)' },
                                    '&:hover': { backgroundColor: 'rgba(25, 118, 210, 0.08)' }
                                }}
                            >
                                <TableCell sx={{ py: 3, borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Avatar sx={{ 
                                            background: entry.position <= 3 ? 
                                                'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' :
                                                'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            width: 48, 
                                            height: 48,
                                            fontSize: '1.2rem',
                                            fontWeight: 700,
                                            color: 'white',
                                            boxShadow: '0 4px 16px rgba(0,0,0,0.2)'
                                        }}>
                                            #{entry.position}
                                        </Avatar>
                                    </Box>
                                </TableCell>
                                <TableCell sx={{ py: 3, borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
                                    <Typography variant="h6" sx={{ 
                                        fontWeight: 700,
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        backgroundClip: 'text',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        mb: 0.5
                                    }}>
                                        {entry.team_id}
                                    </Typography>
                                    <Box sx={{ 
                                        px: 1.5,
                                        py: 0.5,
                                        borderRadius: 2,
                                        background: 'rgba(102, 126, 234, 0.1)',
                                        display: 'inline-block',
                                        mb: 1
                                    }}>
                                        <Typography variant="caption" sx={{ 
                                            color: '#667eea',
                                            fontWeight: 600
                                        }}>
                                            {entry.course_code}
                                        </Typography>
                                    </Box>
                                    <br />
                                    <Typography variant="body2" sx={{ 
                                        color: 'rgba(0,0,0,0.6)',
                                        fontWeight: 500
                                    }}>
                                        {entry.members.slice(0, 2).join(', ')}
                                        {entry.members.length > 2 && ` (+${entry.members.length - 2})`}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2" sx={{ 
                                        maxWidth: 200, 
                                        overflow: 'hidden', 
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap'
                                    }}>
                                        {entry.topic}
                                    </Typography>
                                </TableCell>
                                <TableCell sx={{ py: 3, borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
                                    <Chip 
                                        label={entry.current_phase}
                                        icon={<LiveIcon />}
                                        sx={{
                                            background: entry.current_phase.includes('Phase 4') ? 
                                                'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' :
                                                'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                                            color: 'white',
                                            fontWeight: 600,
                                            borderRadius: 3,
                                            px: 2,
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                            '& .MuiChip-icon': {
                                                color: 'white'
                                            }
                                        }}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                        {entry.total_current_score}/{entry.max_score}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {entry.percentage}%
                                    </Typography>
                                    <LinearProgress 
                                        variant="determinate" 
                                        value={entry.percentage} 
                                        sx={{ 
                                            mt: 0.5, 
                                            height: 6, 
                                            borderRadius: 3,
                                            backgroundColor: 'rgba(0,0,0,0.1)'
                                        }} 
                                    />
                                                                         <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                                         <Chip 
                                             size="small" 
                                             label={`P1: ${entry.phase_scores.phase1}`} 
                                             sx={{
                                                 background: entry.phases_status.phase1 === 'completed' ? 
                                                     'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' : 
                                                     'rgba(0,0,0,0.1)',
                                                 color: entry.phases_status.phase1 === 'completed' ? 'white' : 'rgba(0,0,0,0.6)',
                                                 fontWeight: 600,
                                                 borderRadius: 2
                                             }}
                                         />
                                         <Chip 
                                             size="small" 
                                             label={`P2A: ${entry.phase_scores.phase2A}`} 
                                             sx={{
                                                 background: entry.phases_status.phase2A === 'completed' ? 
                                                     'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' : 
                                                     'rgba(0,0,0,0.1)',
                                                 color: entry.phases_status.phase2A === 'completed' ? 'white' : 'rgba(0,0,0,0.6)',
                                                 fontWeight: 600,
                                                 borderRadius: 2
                                             }}
                                         />
                                         <Chip 
                                             size="small" 
                                             label={`P2B: ${entry.phase_scores.phase2B}`} 
                                             sx={{
                                                 background: entry.phases_status.phase2B === 'completed' ? 
                                                     'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' : 
                                                     'rgba(0,0,0,0.1)',
                                                 color: entry.phases_status.phase2B === 'completed' ? 'white' : 'rgba(0,0,0,0.6)',
                                                 fontWeight: 600,
                                                 borderRadius: 2
                                             }}
                                         />
                                         <Chip 
                                             size="small" 
                                             label={`P3: ${entry.phase_scores.phase3}`} 
                                             sx={{
                                                 background: entry.phases_status.phase3 === 'completed' ? 
                                                     'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' : 
                                                     'rgba(0,0,0,0.1)',
                                                 color: entry.phases_status.phase3 === 'completed' ? 'white' : 'rgba(0,0,0,0.6)',
                                                 fontWeight: 600,
                                                 borderRadius: 2
                                             }}
                                         />
                                     </Box>
                                </TableCell>
                                <TableCell>
                                                                         <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                         {Object.entries(entry.phases_status).map(([phase, status]) => {
                                             const phaseLabel = {
                                                 'phase1': 'P1',
                                                 'phase2A': 'P2A', 
                                                 'phase2B': 'P2B',
                                                 'phase3': 'P3'
                                             }[phase] || phase;
                                             return (
                                                 <Chip
                                                     key={phase}
                                                     size="small"
                                                     label={`${phaseLabel}: ${getPhaseIcon(status)}`}
                                                     color={getPhaseColor(status)}
                                                     variant={status === 'completed' ? 'filled' : 'outlined'}
                                                 />
                                             );
                                         })}
                                     </Box>
                                </TableCell>
                                <TableCell sx={{ py: 3, borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                        <Box sx={{
                                            background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
                                            borderRadius: '50%',
                                            width: 24,
                                            height: 24,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <TimeIcon sx={{ fontSize: 16, color: 'rgba(0,0,0,0.7)' }} />
                                        </Box>
                                        <Typography variant="body2" sx={{ 
                                            fontWeight: 600,
                                            color: 'rgba(0,0,0,0.8)'
                                        }}>
                                            {format(new Date(entry.started_at), 'HH:mm:ss')}
                                        </Typography>
                                    </Box>
                                    <Typography variant="caption" sx={{ 
                                        color: 'rgba(0,0,0,0.5)',
                                        fontWeight: 500
                                    }}>
                                        {format(new Date(entry.started_at), 'dd/MM/yyyy')}
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
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

    const [leaderboardData, setLeaderboardData] = useState([]);
    const [leaderboardStats, setLeaderboardStats] = useState(null);
    const [leaderboardLoading, setLeaderboardLoading] = useState(false);
    const [liveScoringData, setLiveScoringData] = useState([]);
    const [liveScoringStats, setLiveScoringStats] = useState(null);
    const [liveScoringLoading, setLiveScoringLoading] = useState(false);
    const theme = useTheme();

    const fetchSessions = useCallback(async () => {
        try {
            const response = await api.get('/admin/sessions');
            const data = response.data;
            setActiveSessions(data.active);
            setCompletedSessions(data.completed);
            setCriteria(response.data.criteria);
            if (error) setError(null);
        } catch (err) {
            setError('Failed to fetch sessions. Is the backend running?');
        } finally {
            if (loading) setLoading(false);
        }
    }, [loading, error]);

    const fetchLeaderboard = useCallback(async () => {
        if (currentTab !== 'leaderboard') return;
        
        try {
            setLeaderboardLoading(true);
            const response = await api.get('/admin/leaderboard');
            setLeaderboardData(response.data.leaderboard);
            setLeaderboardStats(response.data.statistics);
        } catch (err) {
            setError('Failed to fetch leaderboard data.');
        } finally {
            setLeaderboardLoading(false);
        }
    }, [currentTab]);

    const fetchLiveScoring = useCallback(async () => {
        if (currentTab !== 'live-scoring') return;
        
        try {
            setLiveScoringLoading(true);
            const response = await api.get('/admin/live-scoring');
            setLiveScoringData(response.data.live_scoring);
            setLiveScoringStats(response.data.statistics);
        } catch (err) {
            setError('Failed to fetch live scoring data.');
        } finally {
            setLiveScoringLoading(false);
        }
    }, [currentTab]);

    useEffect(() => {
        fetchSessions();
        const interval = setInterval(fetchSessions, 5000); // Auto-refresh
        return () => clearInterval(interval);
    }, [fetchSessions]);

    useEffect(() => {
        fetchLeaderboard();
    }, [fetchLeaderboard]);

    useEffect(() => {
        fetchLiveScoring();
        let interval;
        if (currentTab === 'live-scoring') {
            interval = setInterval(fetchLiveScoring, 3000); // Auto-refresh every 3 seconds for live data
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [fetchLiveScoring, currentTab]);

    const handleForceEnd = async (teamId) => {
        if (window.confirm(`Are you sure you want to force end the session for team ${teamId}?`)) {
            try {
                await api.delete(`/debate/${teamId}/end`);
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
                await api.delete(`/admin/history/${teamId}`);
                fetchSessions(); // Tải lại danh sách ngay lập tức
            } catch (err) {
                setError(`Xóa lịch sử của nhóm ${teamId} thất bại.`);
            }
        }
    };
    
    const handleDownload = async (teamId) => {
        try {
            const response = await api.get(`/debate/${teamId}/export_docx`, {
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

        if (currentTab === 'leaderboard') {
            return <LeaderboardTable data={leaderboardData} stats={leaderboardStats} loading={leaderboardLoading} />;
        }

        if (currentTab === 'live-scoring') {
            return <LiveScoringTable 
                data={liveScoringData} 
                stats={liveScoringStats} 
                loading={liveScoringLoading}
                onRefresh={fetchLiveScoring}
            />;
        }

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
        <Box sx={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #7ecbff 0%, #007AFF 100%)',
            position: 'relative',
            overflow: 'hidden',
            color: theme.palette.text.primary
        }}>
            <Container sx={{ py: 4 }} maxWidth="lg">
                <Typography variant="h2" sx={{ fontWeight: 700, mb: 1, color: theme.palette.text.primary }}>Admin Dashboard</Typography>
                <Typography variant="h6" color="text.secondary" sx={{ mb: 4, fontWeight: 300 }}>
                    Monitor active debates and review completed sessions.
                </Typography>

                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                    <Tabs value={currentTab} onChange={(e, newValue) => setCurrentTab(newValue)} aria-label="admin tabs">
                        <Tab label={`Active (${activeSessions.length})`} value="active" />
                        <Tab label={`History (${completedSessions.length})`} value="completed" />
                        <Tab 
                            label="Live Scoring" 
                            value="live-scoring" 
                            icon={<LiveIcon />}
                            iconPosition="start"
                        />
                        <Tab 
                            label="Leaderboard" 
                            value="leaderboard" 
                            icon={<TrophyIcon />}
                            iconPosition="start"
                        />
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
                            <ScoreCategory title="Phase 1: Luận điểm ban đầu" scores={selectedSession.evaluation?.scores?.phase1} criteria={criteria.phase1} />
                            <ScoreCategory title="Phase 2A: AI hỏi, SV trả lời" scores={selectedSession.evaluation?.scores?.phase2A} criteria={criteria.phase2A} />
                            <ScoreCategory title="Phase 2B: SV hỏi, AI trả lời" scores={selectedSession.evaluation?.scores?.phase2B} criteria={criteria.phase2B} />
                            <ScoreCategory title="Phase 3: Kết luận & Tổng hợp" scores={selectedSession.evaluation?.scores?.phase3} criteria={criteria.phase3} />
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