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
  DialogActions
} from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';
import DownloadIcon from '@mui/icons-material/Download';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';

// API URL should be configured in environment variables
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Hàm tự động in đậm các cụm cần thiết
function boldify(text) {
  if (!text) return '';
  return text
    .replace(/(Dẫn chứng lý thuyết:)/g, '<b>$1</b>')
    .replace(/(Ví dụ thực tiễn:)/g, '<b>$1</b>')
    .replace(/(Lập luận:)/g, '<b>$1</b>');
}

function DebateRoom() {
  const { teamId } = useParams();
  const [phase, setPhase] = useState(0);
  const [topic, setTopic] = useState('');
  const [customTopic, setCustomTopic] = useState('');
  const [useCustomTopic, setUseCustomTopic] = useState(false);
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
  const navigate = useNavigate();
  const [studentArguments, setStudentArguments] = useState(["", "", ""]);
  const [aiPoints, setAiPoints] = useState([]);
  const [studentSummary, setStudentSummary] = useState("");
  const [aiSummary, setAiSummary] = useState("");
  const [summaryLoading, setSummaryLoading] = useState(false);

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

  const startDebate = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.post('/api/debate/start', {
        team_id: teamId,
        members: ['Member 1', 'Member 2', 'Member 3', 'Member 4', 'Member 5'],
        course_code: 'MLN111'
      });
      setTopic(response.data.data.topic);
      setPhase(1);
      setSuccess('Đã tạo chủ đề debate tự động!');
    } catch (error) {
      setError('Không thể tạo chủ đề debate.');
    } finally {
      setLoading(false);
    }
  };

  const handlePhase1 = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.post(`/api/debate/${teamId}/phase1`);
      setAiPoints(response.data.data.ai_arguments);
      setPhase(1.5); // 1.5: chờ SV nhập luận điểm
    } catch (error) {
      setError('Không thể lấy luận điểm AI.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendStudentArguments = async () => {
    try {
      setLoading(true);
      setError(null);
      // Gửi luận điểm sinh viên lên backend (nếu cần)
      setPhase(2);
    } catch (error) {
      setError('Không thể gửi luận điểm nhóm.');
    } finally {
      setLoading(false);
    }
  };

  const handlePhase3 = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.post(`/api/debate/${teamId}/phase3`, {
        team_responses: responses
      });
      setEvaluation(response.data.data.evaluation);
      setPhase(4);
    } catch (error) {
      setError('Không thể gửi phản hồi.');
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

  const handleExportResult = async () => {
    if (!evaluation) return;
    let historyText = '';
    try {
      const res = await api.get(`/api/debate/${teamId}/history`);
      const chatHistory = res.data.chat_history || [];
      historyText = '\n\n--- Lịch sử debate ---\n';
      chatHistory.forEach(item => {
        historyText += `Phase ${item.phase} - ${item.role}:\n${item.content}\n\n`;
      });
    } catch (err) {
      historyText = '\n\n(Lấy lịch sử debate thất bại)';
    }
    const text = `Chủ đề: ${topic}\nKết quả debate:\n- Team Score:\n  + Lý thuyết: ${evaluation.team_score.theoretical_knowledge}\n  + Thực tiễn: ${evaluation.team_score.practical_application}\n  + Logic: ${evaluation.team_score.argument_strength}\n  + Văn hóa: ${evaluation.team_score.cultural_relevance}\n  + Trả lời: ${evaluation.team_score.response_quality}\n- AI Score:\n  + Lý thuyết: ${evaluation.ai_score.theoretical_knowledge}\n  + Thực tiễn: ${evaluation.ai_score.practical_application}\n  + Logic: ${evaluation.ai_score.argument_strength}\n  + Văn hóa: ${evaluation.ai_score.cultural_relevance}\n  + Trả lời: ${evaluation.ai_score.response_quality}\n- Winner: ${evaluation.winner}\n${historyText}`;
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'debate_result.txt';
    link.click();
    URL.revokeObjectURL(url);
    setShowExportDialog(false);
  };

  const handleSendStudentTurn = async () => {
    if (!currentAnswer.trim()) return;
    setTurnLoading(true);
    try {
      // Gửi lượt SV trả lời
      const lastAiTurn = turns.length > 0 ? turns[turns.length - 1] : null;
      const res = await api.post(`/api/debate/${teamId}/phase2/turn`, {
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
    setSummaryLoading(true);
    try {
      // Gửi tóm tắt SV lên backend, nhận tóm tắt AI về
      const res = await api.post(`/api/debate/${teamId}/phase3/summary`, {
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
  const handleEndSession = async () => {
    try {
      await api.delete(`/api/debate/${teamId}/end`);
    } catch (err) {
      // Không cần xử lý lỗi, chỉ log nếu muốn
      // console.error('Không thể xoá session:', err);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
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
          <Box>
            <Typography variant="h6" gutterBottom>
              Nhập chủ đề debate hoặc tạo tự động
            </Typography>
            <TextField
              label="Nhập chủ đề debate"
              value={customTopic}
              onChange={e => setCustomTopic(e.target.value)}
              fullWidth
              sx={{ mb: 2 }}
            />
            <Button
              variant="contained"
              onClick={async () => {
                setUseCustomTopic(true);
                setTopic(customTopic);
                setSuccess('Đã sử dụng chủ đề bạn nhập!');
                setLoading(true);
                setError(null);
                try {
                  // Gọi API để khởi tạo session
                  await api.post('/api/debate/start', {
                    team_id: teamId,
                    members: ['Member 1', 'Member 2', 'Member 3', 'Member 4', 'Member 5'],
                    course_code: 'MLN111'
                  });
                  setPhase(2); // Chuyển sang phase 2 sau khi backend đã có session
                } catch (err) {
                  setError('Không thể khởi tạo debate.');
                } finally {
                  setLoading(false);
                }
              }}
              disabled={!customTopic.trim()}
            >
              Sử dụng chủ đề này
            </Button>
            <Button
              variant="outlined"
              onClick={() => {
                setUseCustomTopic(false);
                startDebate();
              }}
              sx={{ ml: 2 }}
            >
              Tạo chủ đề tự động
            </Button>
          </Box>
        )}

        {phase > 0 && (
          <Box sx={{ mb: 3, background: '#f8f8f8', p: 2, borderRadius: 2 }}>
            <Typography variant="subtitle1" sx={{ fontSize: '1.1rem', whiteSpace: 'pre-line', wordBreak: 'break-word' }}>
              <b>Chủ đề Debate:</b>\n{topic}
            </Typography>
          </Box>
        )}

        {phase === 1 && !useCustomTopic && (
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
            <Typography variant="h6" gutterBottom>
              3 luận điểm của AI
            </Typography>
            <ul>
              {aiPoints.map((point, idx) => (
                <li key={idx}>
                  <span dangerouslySetInnerHTML={{ __html: boldify(point) }} />
                </li>
              ))}
            </ul>
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
              />
            ))}
            <Button
              variant="contained"
              sx={{ mt: 1, mr: 2 }}
              onClick={() => setStudentArguments([...studentArguments, ""])}
            >
              Thêm luận điểm
            </Button>
            <Button
              variant="contained"
              color="success"
              sx={{ mt: 1 }}
              disabled={studentArguments.filter(arg => arg.trim()).length < 3}
              onClick={handleSendStudentArguments}
            >
              Gửi luận điểm nhóm & Bắt đầu Debate Socratic
            </Button>
          </Box>
        )}

        {phase === 2 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Phase 2: Debate Socratic (Turn-based)
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
                      <Typography sx={{ whiteSpace: 'pre-line' }} dangerouslySetInnerHTML={{ __html: boldify(turn.question) }} />
                    </>
                  ) : (
                    <>
                      <Typography variant="subtitle2" color="secondary">SV trả lời:</Typography>
                      <Typography sx={{ ml: 2, color: 'text.secondary' }} dangerouslySetInnerHTML={{ __html: boldify(turn.answer) }} />
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
            <Typography variant="h6" gutterBottom>
              Phase 3: Tóm tắt quan điểm & Chấm điểm
            </Typography>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              Nhóm nhập tóm tắt quan điểm, luận điểm và lý do nhóm xứng đáng chiến thắng:
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Tóm tắt quan điểm nhóm"
              value={studentSummary}
              onChange={e => setStudentSummary(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Button
              variant="contained"
              onClick={handleSendSummary}
              disabled={!studentSummary.trim() || summaryLoading}
              sx={{ mb: 2 }}
            >
              Gửi tóm tắt nhóm & Lấy tóm tắt AI
            </Button>
            {aiSummary && (
              <Box sx={{ mt: 2, p: 2, background: '#f8f8f8', borderRadius: 2 }}>
                <Typography variant="subtitle2" color="primary">Tóm tắt của AI:</Typography>
                <Typography sx={{ whiteSpace: 'pre-line' }}>{aiSummary}</Typography>
              </Box>
            )}
            <Button
              variant="contained"
              color="success"
              sx={{ mt: 2 }}
              disabled={!aiSummary || !studentSummary.trim()}
              onClick={handlePhase3}
            >
              Chấm điểm debate
            </Button>
          </Box>
        )}

        {phase === 4 && evaluation && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Kết quả Debate
            </Typography>
            <Typography>Team Score:</Typography>
            <ul style={{marginTop: 0, marginBottom: 8}}>
              <li>Lý thuyết: {evaluation.team_score.theoretical_knowledge}</li>
              <li>Thực tiễn: {evaluation.team_score.practical_application}</li>
              <li>Logic: {evaluation.team_score.argument_strength}</li>
              <li>Văn hóa: {evaluation.team_score.cultural_relevance}</li>
              <li>Trả lời: {evaluation.team_score.response_quality}</li>
            </ul>
            <Typography>AI Score:</Typography>
            <ul style={{marginTop: 0, marginBottom: 8}}>
              <li>Lý thuyết: {evaluation.ai_score.theoretical_knowledge}</li>
              <li>Thực tiễn: {evaluation.ai_score.practical_application}</li>
              <li>Logic: {evaluation.ai_score.argument_strength}</li>
              <li>Văn hóa: {evaluation.ai_score.cultural_relevance}</li>
              <li>Trả lời: {evaluation.ai_score.response_quality}</li>
            </ul>
            <Typography>Winner: {evaluation.winner}</Typography>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              sx={{ mt: 2, mr: 2 }}
              onClick={() => setShowExportDialog(true)}
            >
              Xuất kết quả ra file
            </Button>
            <Button
              variant="outlined"
              sx={{ mt: 2 }}
              onClick={async () => {
                await handleEndSession();
                setPhase(0);
              }}
            >
              Debate mới
            </Button>
          </Box>
        )}

        <Dialog open={showExportDialog} onClose={() => setShowExportDialog(false)}>
          <DialogTitle>Xuất kết quả debate</DialogTitle>
          <DialogContent>Bạn có muốn xuất kết quả debate ra file txt không?</DialogContent>
          <DialogActions>
            <Button onClick={() => setShowExportDialog(false)}>Hủy</Button>
            <Button onClick={handleExportResult} variant="contained">Xuất file</Button>
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