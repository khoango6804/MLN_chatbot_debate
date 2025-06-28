import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  CircularProgress,
  Snackbar,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider
} from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';
import DownloadIcon from '@mui/icons-material/Download';
import CloseIcon from '@mui/icons-material/Close';
// Icons removed to reduce unused imports
import axios from 'axios';
import { useLayout } from '../context/LayoutContext';
// date-fns removed to reduce unused imports
import Skeleton from '@mui/material/Skeleton';
import { useTheme } from '@mui/material/styles';

console.log('DEBATE ROOM JS LOADED');

// Create axios instance with default config
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Hàm mới để định dạng văn bản từ AI, xóa bỏ các dấu *
function formatAIResponse(text) {
  if (!text) return '';
  // Thay thế **text** bằng thẻ <b>text</b> để in đậm
  // Thay thế dấu xuống dòng bằng thẻ <br>
  return text
    .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
    .replace(/\n/g, '<br />');
}

function DebateRoom() {
  const navigate = useNavigate();
  const { team_id } = useParams(); // Lấy team_id từ URL
  const { setShowHeader } = useLayout();
  const theme = useTheme();

  const [teamInfo, setTeamInfo] = useState({ teamId: team_id }); // Khởi tạo với teamId

  const [phase, setPhase] = useState(0);
  const [topic, setTopic] = useState('');
  // Unused state variables removed to fix warnings
  const [evaluation, setEvaluation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [debateHistory, setDebateHistory] = useState(() => {
    const saved = localStorage.getItem('debateHistory');
    return saved ? JSON.parse(saved) : [];
  });
  const [showHistory, setShowHistory] = useState(false);
  // showExportDialog removed - unused
  const [turns, setTurns] = useState([]);
  const [turnsPhase2, setTurnsPhase2] = useState([]); // Lưu lịch sử phase 2
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [turnLoading, setTurnLoading] = useState(false);
  // Removed unused state variables
  const [studentArguments, setStudentArguments] = useState(["", "", ""]);
  const [aiPoints, setAiPoints] = useState([]);
  const [violationDetected, setViolationDetected] = useState(false);
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes for preparation
  const [timerActive, setTimerActive] = useState(false);
  // Removed unused variables to fix warnings

  // Effect to hide/show header
  useEffect(() => {
    setShowHeader(false); // Hide header when entering the debate room
    return () => {
      setShowHeader(true); // Show header when leaving
    };
  }, [setShowHeader]);

  useEffect(() => {
    if (!team_id) {
      navigate('/');
      return;
    }
    
    const fetchSessionInfo = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/debate/${team_id}/info`);
        const { topic, members, course_code } = response.data;
        
        setTopic(topic);
        setTeamInfo({ teamId: team_id, members, courseCode: course_code });
        // setSessionInfo removed - unused variable
        setPhase(0.5); // Bắt đầu vào giai đoạn chuẩn bị
        setSuccess('Đã tải thông tin debate! Bắt đầu 10 phút chuẩn bị.');

      } catch (error) {
        console.error("Failed to fetch debate info:", error);
        if (error.response?.status === 404) {
          setError('Phiên debate không tồn tại hoặc đã hết hạn. Đang chuyển về trang chủ...');
        } else {
          setError('Không thể tải thông tin debate. Vui lòng thử lại hoặc tạo phiên mới.');
        }
        setTimeout(() => navigate('/'), 3000);
      } finally {
        setLoading(false);
      }
    };

    fetchSessionInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [team_id, navigate]);

  // Define utility functions first
  const requestFullscreen = async () => {
    const element = document.documentElement;
    if (element.requestFullscreen) {
      try {
        await element.requestFullscreen();
      } catch (err) {
        console.error(`Lỗi khi vào chế độ toàn màn hình: ${err.message}`);
        setError("Không thể vào chế độ toàn màn hình. Vui lòng tự bật (F11).");
      }
    }
  };

  // Function to map numeric phase to descriptive string
  const getPhaseName = useCallback((p) => {
    switch (p) {
      case 0.5: return "GĐ Chuẩn bị";
      case 1: return "Phiên 1: Trình bày luận điểm mở";
      case 2: return "Phiên 2: AI hỏi, SV trả lời";
      case 3: return "Phiên 3: SV hỏi, AI trả lời";
      case 4: return "Phiên 4: Kết luận & Đánh giá";
      default: return "Bắt đầu";
    }
  }, []);

  // Function to report phase changes to the backend
  const updateBackendPhase = useCallback(async (newPhase) => {
    if (!teamInfo) return;
    try {
      await api.post(`/debate/${teamInfo.teamId}/phase`, { phase: getPhaseName(newPhase) });
    } catch (error) {
      console.error("Failed to update phase on backend", error);
    }
  }, [teamInfo, getPhaseName]);

  // Define handlePhase1 function before using it
  const handlePhase1 = useCallback(async () => {
    if (!team_id) {
      setError('Không tìm thấy team ID');
      return;
    }
    
    console.log('Team ID:', team_id);
    await requestFullscreen();
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post(`/debate/${team_id}/phase1`);
      console.log('Response:', response.data);      
      if (response.data?.data?.ai_arguments) {
        setAiPoints(response.data.data.ai_arguments);
        setPhase(1.5);
        setTimeLeft(300);
        setTimerActive(true);
        setSuccess('Đã lấy thành công luận điểm AI!');
      } else {
        throw new Error('Không có dữ liệu luận điểm AI');
      }
    } catch (error) {
      console.error('Lỗi API:', error);
      setError('Không thể lấy luận điểm AI. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, [team_id]);

  // Define handleEvaluation function before using it
  const handleEvaluation = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post(`/debate/${team_id}/phase4/evaluate`);
      console.log('EVALUATION RESPONSE', response.data);
      setEvaluation(response.data.data?.evaluation || response.data.evaluation);
      setTimerActive(false);
      setSuccess("Debate evaluated successfully!");
    } catch (err) {
      console.error("Lỗi khi chấm điểm:", err.response?.data || err.message);
      if (err.response?.status === 404) {
        setError("Phiên debate không tồn tại hoặc đã hết hạn. Đang chuyển về trang chủ...");
        setTimeout(() => navigate('/'), 3000);
      } else {
        setError(err.response?.data?.detail || "Failed to evaluate debate.");
      }
    } finally {
      setLoading(false);
    }
  }, [team_id, navigate]);

  // Timer countdown effect
  useEffect(() => {
    if (!timerActive || timeLeft <= 0) {
      if (timeLeft <= 0) {
        setTimerActive(false);
        if (phase === 0.5) {
          // Reset về phase 1.5 và set lại timeLeft 5 phút
          setPhase(1.5);
          setTimeLeft(300);
          setTimerActive(true);
          handlePhase1(); // Lấy luận điểm AI nếu cần
          return;
        } else if (phase === 2) {
          setPhase(3); // Chuyển từ Phase 2 sang Phase 3
        } else if (phase === 3) {
          setPhase(4); // Chuyển từ Phase 3 sang Phase 4
        }
      }
      return;
    }
    const intervalId = setInterval(() => {
      setTimeLeft(prevTime => prevTime - 1);
    }, 1000);
    return () => clearInterval(intervalId);
  }, [timeLeft, timerActive, phase, handlePhase1]);

  // Effect to set timers when phase changes
  useEffect(() => {
    setTimerActive(false); // Stop any previous timer
    updateBackendPhase(phase); // Report new phase to backend

    if (phase === 0.5) { // GĐ Chuẩn bị
      setTimeLeft(600); // 10 phút
      setTimerActive(true);
    } else if (phase === 1.5) { // Phiên 1: Trình bày luận điểm mở
      setTimeLeft(300); // 5 phút
      setTimerActive(true);
    } else if (phase === 2) { // Phase 2: AI hỏi, SV trả lời
      setTimeLeft(420); // 7 phút
      setTimerActive(true);
    } else if (phase === 3) { // Phase 3: SV hỏi, AI trả lời
      setTimeLeft(420); // 7 phút
      setTimerActive(true);
    }
  }, [phase, updateBackendPhase]);

  // Effect to handle screen lock (fullscreen and visibility)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleViolation();
      }
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        handleViolation();
      }
    };

    const handleViolation = () => {
      // Chỉ xử lý vi phạm trong các giai đoạn chính của debate
      if ((phase >= 1 && phase <= 3) && !violationDetected) {
        setTimerActive(false); // Dừng timer khi vi phạm
        setViolationDetected(true);
      }
    };

    if ((phase >= 1 && phase <= 3) && !violationDetected) {
      document.addEventListener('visibilitychange', handleVisibilityChange);
      document.addEventListener('fullscreenchange', handleFullscreenChange);
    }

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [phase, violationDetected]);

  useEffect(() => {
    if (phase === 4 && evaluation) {
      const newHistory = [
        ...debateHistory,
        {
          topic,
          evaluation,
          time: new Date().toLocaleString(),
        },
      ];
      setDebateHistory(newHistory);
      localStorage.setItem('debateHistory', JSON.stringify(newHistory));
    }
    // eslint-disable-next-line
  }, [phase, evaluation]);

  useEffect(() => {
    if (phase === 4 && !evaluation && !loading && !error) {
      handleEvaluation();
    }
  }, [phase, evaluation, loading, error, handleEvaluation]);

  // startDebate function removed - unused

  // Gửi luận điểm nhóm và khởi tạo phase 2
  const handleSendStudentArguments = async () => {
    console.log('handleSendStudentArguments CALLED');
    if (!team_id) return;
    try {
      setLoading(true);
      setError(null);
      // 1. Gửi luận điểm nhóm
      await api.post(`/debate/${team_id}/phase2`, { team_arguments: studentArguments });
      // 2. Khởi tạo phase 2
      const phase2Response = await api.post(`/debate/${team_id}/phase2/start`);
      console.log('setTurnsPhase2 (from handleSendStudentArguments):', phase2Response.data.turns);
      setTurnsPhase2(phase2Response.data.turns || []); // Cập nhật turnsPhase2 từ response
      setSuccess('Đã gửi luận điểm nhóm và bắt đầu Debate Socratic!');
      setPhase(2); // Sang phase 2
    } catch (err) {
      setError('Gửi luận điểm nhóm hoặc khởi tạo Debate Socratic thất bại!');
    } finally {
      setLoading(false);
    }
  };

  // Gửi lượt debate phase 2 (AI chất vấn sinh viên)
  const handleSendStudentTurn = async () => {
    if (turnsPhase2.length === 0) return;
    const lastAIQuestion = [...turnsPhase2].reverse().find(t => t.asker === 'ai');
    if (!lastAIQuestion || !lastAIQuestion.question) return;
    if (!currentAnswer.trim()) return;
    try {
      setTurnLoading(true);
      const response = await api.post(`/debate/${team_id}/ai-question/turn`, {
        answer: currentAnswer.trim(),
        asker: 'student',
        question: lastAIQuestion.question,
      });
      setCurrentAnswer('');
      console.log('setTurnsPhase2 (from handleSendStudentTurn):', response.data.turns);
      setTurnsPhase2(response.data.turns || []);
    } catch (err) {
      setError(err.response?.data?.detail || "Gửi lượt debate phase 3 (Sinh viên chất vấn AI) thất bại!");
    } finally {
      setTurnLoading(false);
    }
  };

  // Gửi lượt debate phase 3 (Sinh viên chất vấn AI)
  const handleSendStudentQuestion = async (question) => {
    // Bỏ giới hạn số lượt nếu muốn debate thoải mái
    try {
      setTurnLoading(true);
      const response = await api.post(`/debate/${team_id}/student-question/turn`, {
        asker: 'student',
        question: question,
        answer: null
      });
      // Cập nhật turns từ response
      setTurns(response.data.turns || []);
      setCurrentAnswer(''); // Clear input field
    } catch (err) {
      setError(err.response?.data?.detail || "Gửi lượt debate phase 3 (Sinh viên chất vấn AI) thất bại!");
    } finally {
      setTurnLoading(false);
    }
  };

  // Unused functions commented out to fix warnings
  /*
  const handleSendConclusion = async (conclusion) => {
    try {
      setLoading(true);
      await api.post(`/debate/${team_id}/conclusion`, { conclusion });
      setPhase(5);
    } catch (err) {
      setError('Gửi kết luận thất bại!');
    } finally {
      setLoading(false);
    }
  };

  const handleGetResult = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/debate/${team_id}/result`);
      setResult(res.data);
    } catch (err) {
      setError('Lấy kết quả debate thất bại!');
    } finally {
      setLoading(false);
    }
  };

  const handleTeamArgumentChange = (index, value) => {
    const newArguments = [...teamArguments];
    newArguments[index] = value;
    setTeamArguments(newArguments);
  };

  const handleResponseChange = (index, value) => {
    const newResponses = [...responses];
    newResponses[index] = value;
    setResponses(newResponses);
  };
  */

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  // handleExportResult commented out - unused
  /*
  const handleExportResult = async () => {
    // Large export function commented out
  };
  */

  // handleSendSummary commented out - unused
  /*
  const handleSendSummary = async () => {
    // Function commented out
  };
  */



  // Hàm gọi xoá session khi về Home hoặc debate mới
  const handleEndSession = async (reason = null) => {
    if (!team_id) return;
    try {
      const config = {
        data: reason ? { reason: reason } : undefined,
      };
      await api.delete(`/debate/${team_id}/end`, config);
      setSuccess('Phiên đã kết thúc.');
      if (document.fullscreenElement) {
        document.exitFullscreen();
      }
    } catch (error) {
      setError('Không thể kết thúc phiên.');
      console.error("Ending session failed", error);
    }
  };



  const handleDownloadReport = async () => {
    if (!team_id) {
        setError("Không thể tải báo cáo: Thiếu Team ID.");
        return;
    }
    try {
        const response = await api.get(`/debate/${team_id}/export_docx`, {
            responseType: 'blob',
        });

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `debate_result_${team_id}.docx`);
        document.body.appendChild(link);
        link.click();
        link.remove();
    } catch (err) {
        console.error("Tải báo cáo thất bại:", err);
        setError("Không thể tải báo cáo. Vui lòng thử lại sau hoặc tải từ trang admin.");
    }
  };

  // More unused functions commented out
  /*
  const handleStartPhase2 = async () => {
    // Function commented out
  };

  const handleSendResponse = async () => {
    // Function commented out
  };

  const handleStartPhase3 = async () => {
    // Function commented out
  };
  */

  useEffect(() => {
    if (phase === 2 && team_id) {
      (async () => {
        setLoading(true);
        const res = await api.post(`/debate/${team_id}/phase2/start`);
        setTurnsPhase2(res.data.turns || []);
        setLoading(false);
      })();
    }
  }, [phase, team_id]);

  // Khi chuyển sang phase 3, reset turns cho phase 3 (turnsPhase2 đã có dữ liệu phase 2 rồi)
  const handleGoToPhase3 = () => {
    setTurns([]); // Reset chat cho phase 3
    setPhase(3);
  };

  if (loading) {
    return (
      <Box sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #7ecbff 0%, #007AFF 100%)',
        position: 'relative',
        overflow: 'hidden',
        color: theme.palette.text.primary
      }}>
        <Container maxWidth="md" sx={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <CircularProgress size={48} sx={{ mb: 3 }} />
          <Skeleton variant="rectangular" width="100%" height={60} sx={{ mb: 2, borderRadius: 2 }} />
          <Skeleton variant="rectangular" width="100%" height={180} sx={{ mb: 2, borderRadius: 2 }} />
          <Skeleton variant="rectangular" width="100%" height={120} sx={{ mb: 2, borderRadius: 2 }} />
        </Container>
      </Box>
    );
  }

  if (!teamInfo || loading) {
    return (
      <Box sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #7ecbff 0%, #007AFF 100%)',
        position: 'relative',
        overflow: 'hidden',
        color: theme.palette.text.primary
      }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
          <CircularProgress />
          {!teamInfo && <Typography sx={{ ml: 2 }}>Redirecting to home...</Typography>}
        </Box>
      </Box>
    );
  }

  console.log('RENDER: phase', phase, 'evaluation', evaluation);

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #7ecbff 0%, #007AFF 100%)',
      position: 'relative',
      overflow: 'hidden',
      color: theme.palette.text.primary
    }}>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper elevation={4} sx={{ p: 4, borderRadius: 3, background: theme.palette.background.paper, color: theme.palette.text.primary }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h4" color="primary" gutterBottom align="center">
              AI Debate System
            </Typography>
            <IconButton color="primary" onClick={() => setShowHistory(true)} title="Xem lịch sử debate">
              <HistoryIcon />
            </IconButton>
          </Box>
          {error && (
            <Snackbar open={!!error} autoHideDuration={4000} onClose={() => setError(null)}>
              <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>
            </Snackbar>
          )}
          {success && (
            <Snackbar open={!!success} autoHideDuration={3000} onClose={() => setSuccess(null)}>
              <Alert severity="success" onClose={() => setSuccess(null)}>{success}</Alert>
            </Snackbar>
          )}

          {phase === 0 && (
            <Box sx={{ textAlign: 'center', p: 4 }}>
              <Typography variant="h6" gutterBottom>
                Starting your debate session...
              </Typography>
              <CircularProgress sx={{ mt: 2 }}/>
            </Box>
          )}

          {phase === 0.5 && (
            <Box>
              <Typography variant="h6" gutterBottom align="center" color="secondary">
                Giai đoạn 0: Chuẩn bị
              </Typography>
               <Box sx={{ mb: 2, p: 2, border: '1px solid #ddd', borderRadius: 2, textAlign: 'center' }}>
                <Typography variant="h5" color={timeLeft < 60 ? 'error' : 'primary'}>
                  Thời gian chuẩn bị: {formatTime(timeLeft)}
                </Typography>
                <Typography variant="body1" sx={{ mt: 1 }}>
                  Bạn có 10 phút để nghiên cứu chủ đề. 
                  Hết giờ, hệ thống sẽ tự động chuyển sang Giai đoạn 1.
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  sx={{ mt: 2 }}
                  onClick={() => {
                    setTimerActive(false);
                    handlePhase1();
                  }}
                >
                  Bắt đầu Phiên 1 ngay
                </Button>
              </Box>
            </Box>
          )}

          {phase > 0 && (
            <Box sx={{ mb: 3, background: '#f8f8f8', p: 2, borderRadius: 2 }}>
              <Typography variant="subtitle1" sx={{ fontSize: '1.1rem', whiteSpace: 'pre-line', wordBreak: 'break-word' }}>
                <b>Chủ đề Debate:</b> {topic}
              </Typography>
            </Box>
          )}

          {phase === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Phase 1: Luận điểm AI
              </Typography>
              <Button variant="contained" onClick={handlePhase1}>
                Lấy luận điểm AI
              </Button>
            </Box>
          )}

          {phase === 1.5 && (
            <Box>
              <Box sx={{ mb: 2, p: 2, border: '1px solid #ddd', borderRadius: 2, textAlign: 'center' }}>
                <Typography variant="h5" color={timeLeft < 60 ? 'error' : 'primary'}>
                  Thời gian trình bày luận điểm: {formatTime(timeLeft)}
                </Typography>
                {timeLeft <= 0 && (
                  <Typography color="error" variant="h6" sx={{ mt: 1 }}>
                    Hết giờ! Bạn không thể nộp luận điểm được nữa.
                  </Typography>
                )}
              </Box>

              <Typography variant="h6" gutterBottom>
                3 luận điểm của AI
              </Typography>
              <Box component="ul" sx={{ pl: 2, listStyle: 'none' }}>
                {aiPoints.map((point, idx) => (
                  <Typography component="li" key={idx} sx={{ mb: 2, lineHeight: 1.7 }}>
                    <span dangerouslySetInnerHTML={{ __html: formatAIResponse(point) }} />
                  </Typography>
                ))}
              </Box>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Nhóm nhập ít nhất 3 luận điểm của mình
              </Typography>
              {studentArguments.map((arg, idx) => (
                <TextField
                  key={idx}
                  fullWidth
                  multiline
                  rows={2}
                  label={`Luận điểm ${idx + 1}`}
                  value={arg}
                  onChange={e => {
                    const newArgs = [...studentArguments];
                    newArgs[idx] = e.target.value;
                    setStudentArguments(newArgs);
                  }}
                  sx={{ mb: 2 }}
                  onPaste={(e) => { e.preventDefault(); return false; }}
                  onCopy={(e) => { e.preventDefault(); return false; }}
                  onCut={(e) => { e.preventDefault(); return false; }}
                  helperText="Chức năng sao chép, cắt, dán đã được vô hiệu hóa."
                  disabled={timeLeft <= 0}
                />
              ))}
              <Button
                variant="contained"
                sx={{ mt: 1, mr: 2 }}
                onClick={() => setStudentArguments([...studentArguments, ""])}
                disabled={timeLeft <= 0}
              >
                Thêm luận điểm
              </Button>
              <Button
                variant="contained"
                color="success"
                sx={{ mt: 1 }}
                disabled={studentArguments.filter(arg => arg.trim()).length < 3 || timeLeft <= 0}
                onClick={() => {
                  console.log('CLICK gửi luận điểm nhóm');
                  handleSendStudentArguments();
                }}
              >
                Gửi luận điểm nhóm & Bắt đầu Debate Socratic
              </Button>
            </Box>
          )}

          {phase === 2 && (
            <Box>
              <Box sx={{ mb: 2, p: 2, border: '1px solid #ddd', borderRadius: 2, textAlign: 'center' }}>
                <Typography variant="h5" color={timeLeft < 60 ? 'error' : 'primary'}>
                  Thời gian Debate: {formatTime(timeLeft)}
                </Typography>
              </Box>
              <Typography variant="h6" gutterBottom>
                Phase 2: AI hỏi, SV trả lời
              </Typography>
              <Box sx={{ maxHeight: 350, overflowY: 'auto', mb: 2, p: 1, background: '#f8f8f8', borderRadius: 2 }}>
                {(() => {
                  console.log('turnsPhase2:', turnsPhase2);
                  const lastAIQuestion = [...turnsPhase2].reverse().find(t => t.asker === 'ai' && t.question);
                  console.log('lastAIQuestion:', lastAIQuestion);
                  if (!lastAIQuestion) {
                    return <Typography color="text.secondary">Đang lấy câu hỏi từ AI...</Typography>;
                  }
                  return (
                    <>
                      <Typography variant="subtitle2" color="primary">AI hỏi:</Typography>
                      <Typography sx={{ whiteSpace: 'pre-line' }} dangerouslySetInnerHTML={{ __html: formatAIResponse(lastAIQuestion.question) }} />
                    </>
                  );
                })()}
                {turnsPhase2.slice(0, -1).map((turn, idx) => (
                  <Box key={idx} sx={{ mb: 1, pl: turn.asker === 'ai' ? 0 : 2 }}>
                    {turn.asker === 'ai' ? (
                      <>
                        <Typography variant="subtitle2" color="primary">AI hỏi:</Typography>
                        <Typography sx={{ whiteSpace: 'pre-line' }} dangerouslySetInnerHTML={{ __html: formatAIResponse(turn.question) }} />
                      </>
                    ) : (
                      <>
                        <Typography variant="subtitle2" color="secondary">SV trả lời:</Typography>
                        <Typography sx={{ ml: 2, color: 'text.secondary' }} dangerouslySetInnerHTML={{ __html: formatAIResponse(turn.answer) }} />
                      </>
                    )}
                  </Box>
                ))}
              </Box>
              {turnsPhase2.length > 0 && turnsPhase2[turnsPhase2.length-1].asker === 'ai' && (
                <Box>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label="Câu trả lời của bạn"
                    value={currentAnswer}
                    onChange={e => setCurrentAnswer(e.target.value)}
                    sx={{ mb: 2 }}
                    onPaste={e => { e.preventDefault(); return false; }}
                    onCopy={e => { e.preventDefault(); return false; }}
                    onCut={e => { e.preventDefault(); return false; }}
                    helperText="Chức năng sao chép, cắt, dán đã được vô hiệu hóa."
                  />
                  <Button
                    variant="contained"
                    onClick={handleSendStudentTurn}
                    disabled={turnLoading || !currentAnswer.trim()}
                  >
                    Gửi trả lời & Nhận câu hỏi AI tiếp theo
                  </Button>
                </Box>
              )}
              <Box sx={{ mt: 2 }}>
                <Typography>Số lượt debate Phase 2: {turnsPhase2.length}</Typography>
                <Button
                  variant="contained"
                  color="success"
                  sx={{ mt: 1, ml: 1 }}
                  onClick={handleGoToPhase3}
                >
                  Chuyển sang Phase 3 (SV hỏi)
                </Button>
              </Box>
            </Box>
          )}

          {phase === 3 && (
            <Box>
              <Box sx={{ mb: 2, p: 2, border: '1px solid #ddd', borderRadius: 2, textAlign: 'center' }}>
                <Typography variant="h5" color={timeLeft < 60 ? 'error' : 'primary'}>
                  Thời gian Debate: {formatTime(timeLeft)}
                </Typography>
              </Box>
              <Typography variant="h6" gutterBottom>
                Phase 3: SV hỏi, AI trả lời
              </Typography>
              <Box sx={{ maxHeight: 350, overflowY: 'auto', mb: 2, p: 1, background: '#f8f8f8', borderRadius: 2 }}>
                {/* Hiển thị lịch sử Phase 2 */}
                {turnsPhase2.length > 0 && (
                  <>
                    <Typography variant="subtitle1" color="primary" sx={{ fontWeight: 'bold', mb: 1 }}>
                      Lịch sử Phase 2 (AI hỏi - SV trả lời):
                    </Typography>
                    {turnsPhase2.map((turn, idx) => (
                      <Box key={`phase2-${idx}`} sx={{ mb: 1, pl: turn.asker === 'ai' ? 0 : 2 }}>
                        {turn.asker === 'ai' ? (
                          <>
                            <Typography variant="subtitle2" color="primary">AI hỏi:</Typography>
                            <Typography sx={{ whiteSpace: 'pre-line' }} dangerouslySetInnerHTML={{ __html: formatAIResponse(turn.question) }} />
                          </>
                        ) : (
                          <>
                            <Typography variant="subtitle2" color="secondary">SV trả lời:</Typography>
                            <Typography sx={{ ml: 2, color: 'text.secondary' }} dangerouslySetInnerHTML={{ __html: formatAIResponse(turn.answer) }} />
                          </>
                        )}
                      </Box>
                    ))}
                    <Divider sx={{ my: 2 }} />
                  </>
                )}
                
                {/* Hiển thị lịch sử Phase 3 */}
                {turns.length === 0 && (
                  <Typography color="text.secondary">Chưa có lượt debate Phase 3 nào. Sinh viên sẽ đặt câu hỏi trước.</Typography>
                )}
                {turns.length > 0 && (
                  <>
                    <Typography variant="subtitle1" color="secondary" sx={{ fontWeight: 'bold', mb: 1 }}>
                      Lịch sử Phase 3 (SV hỏi - AI trả lời):
                    </Typography>
                    {turns.map((turn, idx) => (
                      <Box key={`phase3-${idx}`} sx={{ mb: 1, pl: turn.asker === 'student' ? 0 : 2 }}>
                        {turn.asker === 'student' ? (
                          <>
                            <Typography variant="subtitle2" color="secondary">SV hỏi:</Typography>
                            <Typography sx={{ whiteSpace: 'pre-line' }} dangerouslySetInnerHTML={{ __html: formatAIResponse(turn.question) }} />
                          </>
                        ) : (
                          <>
                            <Typography variant="subtitle2" color="primary">AI trả lời:</Typography>
                            <Typography sx={{ ml: 2, color: 'text.secondary' }} dangerouslySetInnerHTML={{ __html: formatAIResponse(turn.answer) }} />
                          </>
                        )}
                      </Box>
                    ))}
                  </>
                )}
              </Box>
              <Box>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Câu hỏi của bạn cho AI"
                  value={currentAnswer}
                  onChange={e => setCurrentAnswer(e.target.value)}
                  sx={{ mb: 2 }}
                  onPaste={e => { e.preventDefault(); return false; }}
                  onCopy={e => { e.preventDefault(); return false; }}
                  onCut={e => { e.preventDefault(); return false; }}
                  helperText="Chức năng sao chép, cắt, dán đã được vô hiệu hóa."
                />
                <Button
                  variant="contained"
                  onClick={() => handleSendStudentQuestion(currentAnswer)}
                  disabled={turnLoading || !currentAnswer.trim()}
                >
                  Gửi câu hỏi & Nhận câu trả lời từ AI
                </Button>
              </Box>
              <Box sx={{ mt: 2 }}>
                <Typography>Số lượt debate Phase 2: {turnsPhase2.length}</Typography>
                <Typography>Số lượt debate Phase 3: {turns.length}</Typography>
                <Typography color="primary" sx={{ mt: 1 }}>
                  Số lượt hỏi còn lại trong Phase 3: {Math.max(0, 5 - turns.filter(t => t.asker === 'student' && t.question && !t.answer).length)}
                </Typography>
                <Button
                  variant="contained"
                  color="success"
                  sx={{ mt: 1, ml: 1 }}
                  onClick={() => {
                    setPhase(4);
                    handleEvaluation(); // Gọi luôn khi chuyển phase
                  }}
                >
                  Chuyển sang Phase 4 (Kết luận)
                </Button>
              </Box>
            </Box>
          )}

          {phase === 4 && !evaluation && !loading && (
            <Box sx={{ textAlign: 'center', p: 4 }}>
              <Typography variant="h6" color="error" gutterBottom>
                Không thể tải kết quả đánh giá
              </Typography>
              <Typography variant="body1" sx={{ mb: 3 }}>
                Phiên debate có thể đã hết hạn hoặc không tồn tại.
              </Typography>
              <Button
                variant="contained"
                onClick={() => navigate('/')}
              >
                Về trang chủ
              </Button>
            </Box>
          )}

          {phase === 4 && evaluation && (
            <Paper sx={{ p: { xs: 2, md: 4 }, mt: 4, background: 'rgba(255, 255, 255, 0.98)', borderRadius: '20px', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)' }}>
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, color: '#1d1d1f', textAlign: 'center' }}>
                Kết quả Debate Chi tiết
              </Typography>
              
              {/* Hiển thị bảng điểm chi tiết theo từng giai đoạn */}
              {evaluation.scores && Object.entries(evaluation.scores).map(([phase, scores]) => {
                if (phase === 'phase1' || phase === 'phase2A' || phase === 'phase2B' || phase === 'phase3') {
                  const phaseTitle = phase === 'phase1' ? 'Giai đoạn 1: Luận điểm ban đầu' :
                                   phase === 'phase2A' ? 'Giai đoạn 2A: Phản biện AI' :
                                   phase === 'phase2B' ? 'Giai đoạn 2B: Phản biện SV' :
                                   'Giai đoạn 3: Kết luận & Tổng hợp';
                  
                  const phaseTotal = Object.values(scores).reduce((sum, score) => sum + (parseInt(score) || 0), 0);
                  const maxScore = phase === 'phase1' ? 25 : (phase === 'phase3' ? 25 : 24); // Tổng điểm tối đa của mỗi giai đoạn
                  
                  return (
                    <Box key={phase} sx={{ mb: 3, p: 2, border: '1px solid #ddd', borderRadius: 2 }}>
                      <Typography variant="h6" color="primary" gutterBottom>
                        {phaseTitle}
                      </Typography>
                      
                      <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 1, mb: 2 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Tiêu chí</Typography>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', textAlign: 'center' }}>Điểm</Typography>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', textAlign: 'center' }}>Tối đa</Typography>
                      </Box>
                      
                      {phase === 'phase1' && (
                        <>
                          <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 1, mb: 1 }}>
                            <Typography>Hiểu biết & nhận thức</Typography>
                            <Typography sx={{ textAlign: 'center' }}>{scores['1.1'] || 0}</Typography>
                            <Typography sx={{ textAlign: 'center' }}>6</Typography>
                          </Box>
                          <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 1, mb: 1 }}>
                            <Typography>Tư duy phản biện</Typography>
                            <Typography sx={{ textAlign: 'center' }}>{scores['1.2'] || 0}</Typography>
                            <Typography sx={{ textAlign: 'center' }}>4</Typography>
                          </Box>
                          <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 1, mb: 1 }}>
                            <Typography>Nhận diện văn hóa – xã hội</Typography>
                            <Typography sx={{ textAlign: 'center' }}>{scores['1.3'] || 0}</Typography>
                            <Typography sx={{ textAlign: 'center' }}>3</Typography>
                          </Box>
                          <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 1, mb: 1 }}>
                            <Typography>Bản sắc & chiến lược</Typography>
                            <Typography sx={{ textAlign: 'center' }}>{scores['1.4'] || 0}</Typography>
                            <Typography sx={{ textAlign: 'center' }}>4</Typography>
                          </Box>
                          <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 1, mb: 1 }}>
                            <Typography>Sáng tạo học thuật</Typography>
                            <Typography sx={{ textAlign: 'center' }}>{scores['1.5'] || 0}</Typography>
                            <Typography sx={{ textAlign: 'center' }}>4</Typography>
                          </Box>
                          <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 1, mb: 1 }}>
                            <Typography>Đạo đức học thuật</Typography>
                            <Typography sx={{ textAlign: 'center' }}>{scores['1.6'] || 0}</Typography>
                            <Typography sx={{ textAlign: 'center' }}>4</Typography>
                          </Box>
                        </>
                      )}
                      
                      {phase === 'phase2A' && (
                        <>
                          <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 1, mb: 1 }}>
                            <Typography>Hiểu biết & nhận thức</Typography>
                            <Typography sx={{ textAlign: 'center' }}>{scores['2A.1'] || 0}</Typography>
                            <Typography sx={{ textAlign: 'center' }}>5</Typography>
                          </Box>
                          <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 1, mb: 1 }}>
                            <Typography>Tư duy phản biện</Typography>
                            <Typography sx={{ textAlign: 'center' }}>{scores['2A.2'] || 0}</Typography>
                            <Typography sx={{ textAlign: 'center' }}>5</Typography>
                          </Box>
                          <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 1, mb: 1 }}>
                            <Typography>Ngôn ngữ & thuật ngữ</Typography>
                            <Typography sx={{ textAlign: 'center' }}>{scores['2A.3'] || 0}</Typography>
                            <Typography sx={{ textAlign: 'center' }}>4</Typography>
                          </Box>
                          <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 1, mb: 1 }}>
                            <Typography>Chiến lược & điều hướng</Typography>
                            <Typography sx={{ textAlign: 'center' }}>{scores['2A.4'] || 0}</Typography>
                            <Typography sx={{ textAlign: 'center' }}>4</Typography>
                          </Box>
                          <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 1, mb: 1 }}>
                            <Typography>Văn hóa – xã hội</Typography>
                            <Typography sx={{ textAlign: 'center' }}>{scores['2A.5'] || 0}</Typography>
                            <Typography sx={{ textAlign: 'center' }}>3</Typography>
                          </Box>
                          <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 1, mb: 1 }}>
                            <Typography>Đạo đức & trung thực</Typography>
                            <Typography sx={{ textAlign: 'center' }}>{scores['2A.6'] || 0}</Typography>
                            <Typography sx={{ textAlign: 'center' }}>4</Typography>
                          </Box>
                        </>
                      )}
                      
                      {phase === 'phase2B' && (
                        <>
                          <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 1, mb: 1 }}>
                            <Typography>Hiểu biết & nhận thức</Typography>
                            <Typography sx={{ textAlign: 'center' }}>{scores['2B.1'] || 0}</Typography>
                            <Typography sx={{ textAlign: 'center' }}>5</Typography>
                          </Box>
                          <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 1, mb: 1 }}>
                            <Typography>Tư duy phản biện</Typography>
                            <Typography sx={{ textAlign: 'center' }}>{scores['2B.2'] || 0}</Typography>
                            <Typography sx={{ textAlign: 'center' }}>6</Typography>
                          </Box>
                          <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 1, mb: 1 }}>
                            <Typography>Ngôn ngữ & thuật ngữ</Typography>
                            <Typography sx={{ textAlign: 'center' }}>{scores['2B.3'] || 0}</Typography>
                            <Typography sx={{ textAlign: 'center' }}>4</Typography>
                          </Box>
                          <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 1, mb: 1 }}>
                            <Typography>Chiến lược & điều hướng</Typography>
                            <Typography sx={{ textAlign: 'center' }}>{scores['2B.4'] || 0}</Typography>
                            <Typography sx={{ textAlign: 'center' }}>4</Typography>
                          </Box>
                          <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 1, mb: 1 }}>
                            <Typography>Văn hóa – xã hội</Typography>
                            <Typography sx={{ textAlign: 'center' }}>{scores['2B.5'] || 0}</Typography>
                            <Typography sx={{ textAlign: 'center' }}>3</Typography>
                          </Box>
                          <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 1, mb: 1 }}>
                            <Typography>Đạo đức & đối thoại</Typography>
                            <Typography sx={{ textAlign: 'center' }}>{scores['2B.6'] || 0}</Typography>
                            <Typography sx={{ textAlign: 'center' }}>3</Typography>
                          </Box>
                        </>
                      )}
                      
                      <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 1, mt: 2, p: 1, background: '#f0f0f0', borderRadius: 1 }}>
                        <Typography sx={{ fontWeight: 'bold' }}>Tổng điểm giai đoạn</Typography>
                        <Typography sx={{ textAlign: 'center', fontWeight: 'bold' }}>{phaseTotal}</Typography>
                        <Typography sx={{ textAlign: 'center', fontWeight: 'bold' }}>{maxScore}</Typography>
                      </Box>
                    </Box>
                  );
                }
                return null;
              })}
              
              {/* Tổng điểm toàn bộ */}
              {evaluation.scores && (() => {
                const totalScore = Object.entries(evaluation.scores)
                  .filter(([phase]) => phase === 'phase1' || phase === 'phase2A' || phase === 'phase2B' || phase === 'phase3')
                  .reduce((total, [_, scores]) => {
                    return total + Object.values(scores).reduce((sum, score) => sum + (parseInt(score) || 0), 0);
                  }, 0);
                const totalMaxScore = 100; // 25 + 25 + 25 + 25
                
                return (
                  <Box sx={{ p: 2, background: '#e3f2fd', borderRadius: 2, mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                      TỔNG ĐIỂM TOÀN BỘ: {totalScore} / {totalMaxScore}
                    </Typography>
                    <Typography variant="body1" sx={{ textAlign: 'center', mt: 1, fontWeight: 500 }}>
                      Tỷ lệ đạt: {((totalScore / totalMaxScore) * 100).toFixed(1)}%
                    </Typography>
                  </Box>
                );
              })()}
              
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', gap: 2 }}>
                  <Button
                    variant="contained"
                    startIcon={<DownloadIcon />}
                    onClick={handleDownloadReport}
                  >
                    Tải Báo Cáo (docx)
                  </Button>

                  <Button
                    variant="outlined"
                    onClick={async () => {
                      await handleEndSession("Hoàn thành");
                      navigate('/');
                    }}
                  >
                    Về trang chủ
                  </Button>
              </Box>
            </Paper>
          )}

          <Dialog
            open={violationDetected}
            // Ngăn người dùng đóng dialog
            disableEscapeKeyDown 
            onClose={(event, reason) => {
              if (reason !== 'backdropClick') {
                // do nothing
              }
            }}
          >
            <DialogTitle>Phát hiện hành vi không hợp lệ</DialogTitle>
            <DialogContent>
              <Typography>
                Bạn đã chuyển tab hoặc thoát khỏi chế độ toàn màn hình.
                Phiên debate đã bị kết thúc để đảm bảo tính toàn vẹn.
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button 
                variant="contained" 
                color="error"
                onClick={async () => {
                  await handleEndSession("Vi phạm: Thoát khỏi chế độ thi.");
                  navigate('/');
                }}
              >
                Về trang chủ
              </Button>
            </DialogActions>
          </Dialog>

          <Dialog open={showHistory} onClose={() => setShowHistory(false)} maxWidth="md" fullWidth>
            <DialogTitle>
              Lịch sử Debate
              <IconButton
                aria-label="close"
                onClick={() => setShowHistory(false)}
                sx={{ position: 'absolute', right: 8, top: 8 }}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent dividers>
              {debateHistory.length === 0 ? (
                <Typography>Chưa có lịch sử debate nào.</Typography>
              ) : (
                debateHistory.map((item, idx) => (
                  <Paper key={idx} sx={{ p: 2, mb: 2, background: '#f5f5f5' }}>
                    <Typography variant="subtitle2">{item.time}</Typography>
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>{item.topic}</Typography>
                    <Typography variant="body2">Kết quả: {JSON.stringify(item.evaluation)}</Typography>
                  </Paper>
                ))
              )}
            </DialogContent>
          </Dialog>
        </Paper>
      </Container>
    </Box>
  );
}

export default DebateRoom; 
