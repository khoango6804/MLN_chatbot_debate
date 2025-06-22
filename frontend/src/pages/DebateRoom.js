import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  Grid,
  CircularProgress,
  Snackbar,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';
import DownloadIcon from '@mui/icons-material/Download';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';
import { useLayout } from '../context/LayoutContext';

// API URL should be configured in environment variables
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
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

  const [teamInfo, setTeamInfo] = useState({ teamId: team_id }); // Khởi tạo với teamId

  const [phase, setPhase] = useState(0);
  const [topic, setTopic] = useState('');
  const [courseCode, setCourseCode] = useState('MLN111');
  const [aiArguments, setAiArguments] = useState([]);
  const [teamArguments, setTeamArguments] = useState(['', '', '']);
  const [questions, setQuestions] = useState([]);
  const [responses, setResponses] = useState([]);
  const [evaluation, setEvaluation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [debateHistory, setDebateHistory] = useState(() => {
    const saved = localStorage.getItem('debateHistory');
    return saved ? JSON.parse(saved) : [];
  });
  const [showHistory, setShowHistory] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [turns, setTurns] = useState([]);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [turnLoading, setTurnLoading] = useState(false);
  const MIN_TURNS = 15;
  const [studentArguments, setStudentArguments] = useState(["", "", ""]);
  const [aiPoints, setAiPoints] = useState([]);
  const [studentSummary, setStudentSummary] = useState("");
  const [aiSummary, setAiSummary] = useState("");
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [violationDetected, setViolationDetected] = useState(false);
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes for preparation
  const [timerActive, setTimerActive] = useState(false);

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
    
    const fetchDebateInfo = async () => {
      try {
        setLoading(true);
        // Đã gỡ bỏ code yêu cầu toàn màn hình để tránh lỗi
        const response = await api.get(`/api/debate/${team_id}/info`);
        const { topic, members, course_code } = response.data;
        
        setTopic(topic);
        setTeamInfo({ teamId: team_id, members, courseCode: course_code });
        setPhase(0.5); // Bắt đầu vào giai đoạn chuẩn bị
        setSuccess('Đã tải thông tin debate! Bắt đầu 10 phút chuẩn bị.');

      } catch (error) {
        console.error("Failed to fetch debate info:", error);
        setError('Không thể tải thông tin debate. Phiên có thể đã hết hạn. Đang chuyển về trang chủ...');
        setTimeout(() => navigate('/'), 3000);
      } finally {
        setLoading(false);
      }
    };

    fetchDebateInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [team_id, navigate]);

  // Timer countdown effect
  useEffect(() => {
    if (!timerActive || timeLeft <= 0) {
      if (timeLeft <= 0) {
        setTimerActive(false);
        if (phase === 0.5) {
          handlePhase1();
        } else if (phase === 2) {
          setPhase(3);
        }
      }
      return;
    }
    const intervalId = setInterval(() => {
      setTimeLeft(prevTime => prevTime - 1);
    }, 1000);
    return () => clearInterval(intervalId);
  }, [timeLeft, timerActive, phase]);

  // Effect to set timers when phase changes
  useEffect(() => {
    setTimerActive(false); // Stop any previous timer
    updateBackendPhase(phase); // Report new phase to backend

    if (phase === 0.5) { // GĐ Chuẩn bị
      setTimeLeft(600);
      setTimerActive(true);
    } else if (phase === 1.5) { // GĐ 1 Làm bài
      setTimeLeft(300);
      setTimerActive(true);
    } else if (phase === 2) { // GĐ 2 Debate
      setTimeLeft(420);
      setTimerActive(true);
    } else if (phase === 3) { // GĐ 3 Kết luận
      setTimeLeft(300);
      setTimerActive(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

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
      if (phase > 0 && phase < 4 && !violationDetected) {
        setTimerActive(false); // Dừng timer khi vi phạm
        setViolationDetected(true);
      }
    };

    if (phase > 0 && phase < 4 && !violationDetected) {
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

  const startDebate = async () => {
    // Hàm này giờ trống vì logic đã được chuyển vào useEffect
  };

  const handlePhase1 = async () => {
    if (!team_id) return;
    await requestFullscreen(); // Yêu cầu toàn màn hình khi bắt đầu
    try {
      setLoading(true);
      setError(null);
      const response = await api.post(`/api/debate/${team_id}/phase1`);
      if(!topic) setTopic(response.data.data.topic);
      setAiPoints(response.data.data.ai_arguments);
      setPhase(1.5);
    } catch (error) {
      setError('Không thể lấy luận điểm AI.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendStudentArguments = async () => {
    if (!team_id) return;
    try {
      setLoading(true);
      setError(null);
      setPhase(2);
    } catch (error) {
      setError('Không thể gửi luận điểm nhóm.');
    } finally {
      setLoading(false);
    }
  };

  const handlePhase3 = async () => {
    if (!team_id) return;
    try {
      setLoading(true);
      setError(null);
      // This endpoint now only evaluates, it doesn't need a body
      const response = await api.post(`/api/debate/${team_id}/phase3`);
      setEvaluation(response.data.data.evaluation);
      setPhase(4);
    } catch (error) {
      console.error("Failed to evaluate debate:", error);
      setError('Không thể chấm điểm debate.');
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

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const handleExportResult = async () => {
    if (!evaluation || !teamInfo) return;
    let historyText = '';
    try {
      const res = await api.get(`/api/debate/${teamInfo.teamId}/history`);
      const chatHistory = res.data.chat_history || [];
      historyText = '\n\n--- Lịch sử debate ---\n';
      chatHistory.forEach(item => {
        historyText += `Phase ${item.phase} - ${item.role}:\n${item.content}\n\n`;
      });
    } catch (err) {
      historyText = '\n\n(Lấy lịch sử debate thất bại)';
    }

    // Tạo nội dung xuất file với bảng điểm chi tiết
    let exportText = `Chủ đề: ${topic}\n\nKẾT QUẢ CHẤM ĐIỂM CHI TIẾT:\n`;
    
    // Tính tổng điểm
    const totalScore = Object.entries(evaluation)
      .filter(([phase]) => phase === 'phase1' || phase === 'phase2A' || phase === 'phase2B')
      .reduce((total, [_, scores]) => {
        return total + Object.values(scores).reduce((sum, score) => sum + (parseInt(score) || 0), 0);
      }, 0);
    const totalMaxScore = 73; // 25 + 24 + 24

    // Xuất điểm từng giai đoạn
    Object.entries(evaluation).forEach(([phase, scores]) => {
      if (phase === 'phase1' || phase === 'phase2A' || phase === 'phase2B') {
        const phaseTitle = phase === 'phase1' ? 'GIAI ĐOẠN 1: Luận điểm ban đầu' :
                          phase === 'phase2A' ? 'GIAI ĐOẠN 2A: Phản biện AI' :
                          'GIAI ĐOẠN 2B: Phản biện SV';
        
        exportText += `\n${phaseTitle}:\n`;
        exportText += `Tiêu chí\t\t\tĐiểm\tTối đa\n`;
        exportText += `----------------------------------------\n`;
        
        if (phase === 'phase1') {
          exportText += `Hiểu biết & nhận thức\t\t${scores['1.1'] || 0}\t6\n`;
          exportText += `Tư duy phản biện\t\t\t${scores['1.2'] || 0}\t4\n`;
          exportText += `Nhận diện văn hóa – xã hội\t\t${scores['1.3'] || 0}\t3\n`;
          exportText += `Bản sắc & chiến lược\t\t\t${scores['1.4'] || 0}\t4\n`;
          exportText += `Sáng tạo học thuật\t\t\t${scores['1.5'] || 0}\t4\n`;
          exportText += `Đạo đức học thuật\t\t\t${scores['1.6'] || 0}\t4\n`;
        } else if (phase === 'phase2A') {
          exportText += `Hiểu biết & nhận thức\t\t${scores['2A.1'] || 0}\t5\n`;
          exportText += `Tư duy phản biện\t\t\t${scores['2A.2'] || 0}\t5\n`;
          exportText += `Ngôn ngữ & thuật ngữ\t\t\t${scores['2A.3'] || 0}\t4\n`;
          exportText += `Chiến lược & điều hướng\t\t${scores['2A.4'] || 0}\t3\n`;
          exportText += `Văn hóa – xã hội\t\t\t${scores['2A.5'] || 0}\t3\n`;
          exportText += `Đạo đức & trung thực\t\t\t${scores['2A.6'] || 0}\t4\n`;
        } else if (phase === 'phase2B') {
          exportText += `Hiểu biết & nhận thức\t\t${scores['2B.1'] || 0}\t5\n`;
          exportText += `Tư duy phản biện\t\t\t${scores['2B.2'] || 0}\t5\n`;
          exportText += `Ngôn ngữ & thuật ngữ\t\t\t${scores['2B.3'] || 0}\t4\n`;
          exportText += `Chiến lược & điều hướng\t\t${scores['2B.4'] || 0}\t3\n`;
          exportText += `Văn hóa – xã hội\t\t\t${scores['2B.5'] || 0}\t3\n`;
          exportText += `Đạo đức & đối thoại\t\t\t${scores['2B.6'] || 0}\t4\n`;
        }
        
        const phaseTotal = Object.values(scores).reduce((sum, score) => sum + (parseInt(score) || 0), 0);
        const maxScore = phase === 'phase1' ? 25 : 24;
        exportText += `----------------------------------------\n`;
        exportText += `Tổng điểm giai đoạn:\t\t\t${phaseTotal}\t${maxScore}\n`;
      }
    });
    
    exportText += `\n========================================\n`;
    exportText += `TỔNG ĐIỂM TOÀN BỘ:\t\t\t${totalScore}\t${totalMaxScore}\n`;
    exportText += `Tỷ lệ đạt:\t\t\t\t${((totalScore / totalMaxScore) * 100).toFixed(1)}%\n`;
    exportText += `========================================\n`;
    exportText += historyText;

    const blob = new Blob([exportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'debate_result.txt';
    link.click();
    URL.revokeObjectURL(url);
    setShowExportDialog(false);
  };

  const handleSendStudentTurn = async () => {
    if (!currentAnswer.trim() || !teamInfo) return;
    setTurnLoading(true);
    try {
      // Gửi lượt SV trả lời
      const lastAiTurn = turns.length > 0 ? turns[turns.length - 1] : null;
      const res = await api.post(`/api/debate/${teamInfo.teamId}/phase2/turn`, {
        asker: "student",
        question: lastAiTurn ? lastAiTurn.question : "",
        answer: currentAnswer
      });
      setTurns(res.data.turns);
      setCurrentAnswer("");
      // Nếu có câu hỏi mới của AI, tự động hiển thị
      if (res.data.next_question) {
        setTimeout(() => {
          window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
        }, 200);
      }
    } catch (err) {
      setError("Không gửi được lượt debate.");
    } finally {
      setTurnLoading(false);
    }
  };

  // Gửi tóm tắt của SV và lấy tóm tắt AI từ backend
  const handleSendSummary = async () => {
    if (!teamInfo) return;
    setSummaryLoading(true);
    try {
      // Gửi tóm tắt SV lên backend, nhận tóm tắt AI về
      const res = await api.post(`/api/debate/${teamInfo.teamId}/phase3/summary`, {
        student_summary: studentSummary
      });
      setAiSummary(res.data.ai_summary);
      setSuccess("Đã gửi tóm tắt. Bạn có thể chấm điểm!");
    } catch (err) {
      setError("Không gửi được tóm tắt hoặc lấy tóm tắt AI.");
    } finally {
      setSummaryLoading(false);
    }
  };

  // Hàm gọi xoá session khi về Home hoặc debate mới
  const handleEndSession = async (reason = null) => {
    if (!team_id) return;
    try {
      const config = {
        data: reason ? { reason: reason } : undefined,
      };
      await api.delete(`/api/debate/${team_id}/end`, config);
      setSuccess('Phiên đã kết thúc.');
      if (document.fullscreenElement) {
        document.exitFullscreen();
      }
    } catch (error) {
      setError('Không thể kết thúc phiên.');
      console.error("Ending session failed", error);
    }
  };

  // Function to map numeric phase to descriptive string
  const getPhaseName = (p) => {
    switch (p) {
      case 0.5: return "GĐ Chuẩn bị";
      case 1: return "GĐ 1: Trình bày luận điểm";
      case 1.5: return "GĐ 1: Làm bài";
      case 2: return "GĐ 2: Tranh luận Socrates";
      case 3: return "GĐ 3: Kết luận";
      case 4: return "Kết quả";
      default: return "Bắt đầu";
    }
  };
  
  // Function to report phase changes to the backend
  const updateBackendPhase = async (newPhase) => {
    if (!teamInfo) return;
    try {
      await api.post(`/api/debate/${teamInfo.teamId}/phase`, { phase: getPhaseName(newPhase) });
    } catch (error) {
      console.error("Failed to update phase on backend", error);
    }
  };

  const handleDownloadReport = async () => {
    if (!team_id) {
        setError("Không thể tải báo cáo: Thiếu Team ID.");
        return;
    }
    try {
        const response = await api.get(`/api/debate/${team_id}/export_docx`, {
            responseType: 'blob',
        });

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `debate_result_${team_id}.docx`);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
        URL.revokeObjectURL(url);
    } catch (err) {
        console.error("Tải báo cáo thất bại:", err);
        setError("Không thể tải báo cáo. Vui lòng thử lại sau hoặc tải từ trang admin.");
    }
  };

  if (!teamInfo || loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
        {!teamInfo && <Typography sx={{ ml: 2 }}>Redirecting to home...</Typography>}
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={4} sx={{ p: 4, borderRadius: 3 }}>
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
                Thời gian chuẩn bị: {formatTime(timeLeft)}
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
              onClick={handleSendStudentArguments}
            >
              Gửi luận điểm nhóm & Bắt đầu Debate Socratic
            </Button>
          </Box>
        )}

        {phase === 2 && (
          <Box>
            <Box sx={{ mb: 2, p: 2, border: '1px solid #ddd', borderRadius: 2, textAlign: 'center' }}>
              <Typography variant="h5" color={timeLeft < 60 ? 'error' : 'primary'}>
                Thời gian phản biện: {formatTime(timeLeft)}
              </Typography>
            </Box>
            <Typography variant="h6" gutterBottom>
              Phase 2: Debate Socratic (AI hỏi trước)
            </Typography>
            <Box sx={{ maxHeight: 350, overflowY: 'auto', mb: 2, p: 1, background: '#f8f8f8', borderRadius: 2 }}>
              {turns.length === 0 && (
                <Typography color="text.secondary">Chưa có lượt debate nào. Hãy bắt đầu bằng câu hỏi của AI hoặc nhập câu trả lời đầu tiên.</Typography>
              )}
              {turns.map((turn, idx) => (
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
            {turns.length === 0 || (turns.length > 0 && turns[turns.length - 1].asker === 'ai') ? (
              <Box>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Câu trả lời của bạn"
                  value={currentAnswer}
                  onChange={e => setCurrentAnswer(e.target.value)}
                  sx={{ mb: 2 }}
                  onPaste={(e) => { e.preventDefault(); return false; }}
                  onCopy={(e) => { e.preventDefault(); return false; }}
                  onCut={(e) => { e.preventDefault(); return false; }}
                  helperText="Chức năng sao chép, cắt, dán đã được vô hiệu hóa."
                />
                <Button
                  variant="contained"
                  onClick={handleSendStudentTurn}
                  disabled={turnLoading || !currentAnswer.trim()}
                >
                  Gửi trả lời & Nhận câu hỏi Socrates tiếp theo
                </Button>
              </Box>
            ) : (
              <Typography color="text.secondary">Đang chờ AI đặt câu hỏi Socrates...</Typography>
            )}
            <Box sx={{ mt: 2 }}>
              <Typography>Số lượt debate: {turns.length}</Typography>
              <Button
                variant="contained"
                color="success"
                sx={{ mt: 1, ml: 1 }}
                disabled={turns.length < MIN_TURNS}
                onClick={() => setPhase(3)}
              >
                Kết thúc phase 2 (đủ lượt)
              </Button>
            </Box>
          </Box>
        )}

        {phase === 3 && (
          <Box>
            <Box sx={{ mb: 2, p: 2, border: '1px solid #ddd', borderRadius: 2, textAlign: 'center' }}>
              <Typography variant="h5" color={timeLeft < 60 ? 'error' : 'primary'}>
                Thời gian kết luận: {formatTime(timeLeft)}
              </Typography>
               {timeLeft <= 0 && (
                <Typography color="error" variant="h6" sx={{ mt: 1 }}>
                  Hết giờ!
                </Typography>
              )}
            </Box>
            <Typography variant="h6" gutterBottom>
              Phase 3: Tóm tắt quan điểm & Chấm điểm
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Tóm tắt quan điểm nhóm"
              value={studentSummary}
              onChange={e => setStudentSummary(e.target.value)}
              sx={{ mb: 2 }}
              onPaste={(e) => { e.preventDefault(); return false; }}
              onCopy={(e) => { e.preventDefault(); return false; }}
              onCut={(e) => { e.preventDefault(); return false; }}
              helperText="Chức năng sao chép, cắt, dán đã được vô hiệu hóa."
              disabled={timeLeft <= 0}
            />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2, mb: 2 }}>
              <Button
                variant="contained"
                onClick={handleSendSummary}
                disabled={!studentSummary.trim() || summaryLoading || timeLeft <= 0}
              >
                Gửi tóm tắt nhóm & Lấy tóm tắt AI
              </Button>
              <Button
                variant="contained"
                color="success"
                disabled={!aiSummary || !studentSummary.trim() || timeLeft <= 0}
                onClick={handlePhase3}
              >
                Chấm điểm Debate
              </Button>
            </Box>
            
            {aiSummary && (
              <Box sx={{ mt: 2, p: 2, background: '#f8f8f8', borderRadius: 2 }}>
                <Typography variant="subtitle2" color="primary">Tóm tắt của AI:</Typography>
                <Typography sx={{ whiteSpace: 'pre-line' }}>{aiSummary}</Typography>
              </Box>
            )}
          </Box>
        )}

        {phase === 4 && evaluation && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Kết quả Debate Chi tiết
            </Typography>
            
            {/* Hiển thị bảng điểm chi tiết theo từng giai đoạn */}
            {evaluation.scores && Object.entries(evaluation.scores).map(([phase, scores]) => {
              if (phase === 'phase1' || phase === 'phase2A' || phase === 'phase2B') {
                const phaseTitle = phase === 'phase1' ? 'Giai đoạn 1: Luận điểm ban đầu' :
                                 phase === 'phase2A' ? 'Giai đoạn 2A: Phản biện AI' :
                                 'Giai đoạn 2B: Phản biện SV';
                
                const phaseTotal = Object.values(scores).reduce((sum, score) => sum + (parseInt(score) || 0), 0);
                const maxScore = phase === 'phase1' ? 25 : 24; // Tổng điểm tối đa của mỗi giai đoạn
                
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
                          <Typography sx={{ textAlign: 'center' }}>3</Typography>
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
                          <Typography sx={{ textAlign: 'center' }}>5</Typography>
                        </Box>
                        <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 1, mb: 1 }}>
                          <Typography>Ngôn ngữ & thuật ngữ</Typography>
                          <Typography sx={{ textAlign: 'center' }}>{scores['2B.3'] || 0}</Typography>
                          <Typography sx={{ textAlign: 'center' }}>4</Typography>
                        </Box>
                        <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 1, mb: 1 }}>
                          <Typography>Chiến lược & điều hướng</Typography>
                          <Typography sx={{ textAlign: 'center' }}>{scores['2B.4'] || 0}</Typography>
                          <Typography sx={{ textAlign: 'center' }}>3</Typography>
                        </Box>
                        <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 1, mb: 1 }}>
                          <Typography>Văn hóa – xã hội</Typography>
                          <Typography sx={{ textAlign: 'center' }}>{scores['2B.5'] || 0}</Typography>
                          <Typography sx={{ textAlign: 'center' }}>3</Typography>
                        </Box>
                        <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 1, mb: 1 }}>
                          <Typography>Đạo đức & đối thoại</Typography>
                          <Typography sx={{ textAlign: 'center' }}>{scores['2B.6'] || 0}</Typography>
                          <Typography sx={{ textAlign: 'center' }}>4</Typography>
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
                .filter(([phase]) => phase === 'phase1' || phase === 'phase2A' || phase === 'phase2B')
                .reduce((total, [_, scores]) => {
                  return total + Object.values(scores).reduce((sum, score) => sum + (parseInt(score) || 0), 0);
                }, 0);
              const totalMaxScore = 73; // 25 + 24 + 24
              
              return (
                <Box sx={{ p: 2, background: '#e3f2fd', borderRadius: 2, mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                    TỔNG ĐIỂM TOÀN BỘ: {totalScore} / {totalMaxScore}
                  </Typography>
                  <Typography variant="body2" sx={{ textAlign: 'center', mt: 1 }}>
                    Tỷ lệ đạt: {((totalScore / totalMaxScore) * 100).toFixed(1)}%
                  </Typography>
                </Box>
              );
            })()}
            
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              sx={{ mt: 2, mr: 2 }}
              onClick={handleDownloadReport}
            >
              Tải Báo Cáo (docx)
            </Button>

            <Button
              variant="outlined"
              sx={{ mt: 2 }}
              onClick={async () => {
                await handleEndSession("Hoàn thành");
                navigate('/');
              }}
            >
              Về trang chủ
            </Button>
          </Box>
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
  );
}

export default DebateRoom; 