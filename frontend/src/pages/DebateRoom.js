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
  baseURL: 'https://mlndebate.io.vn/api',
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
  const { setShowHeader, setShowFooter } = useLayout();
  const theme = useTheme();

  const [teamInfo, setTeamInfo] = useState({ teamId: team_id }); // Khởi tạo với teamId
  const [phase, setPhase] = useState(0);
  const [topic, setTopic] = useState('');
  const [stance, setStance] = useState(''); // Add stance state
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
  const [turnsPhase3, setTurnsPhase3] = useState([]); // Lưu lịch sử phase 3
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [turnLoading, setTurnLoading] = useState(false);
  const [canRequestNextQuestion, setCanRequestNextQuestion] = useState(false);
  // Removed unused state variables
  const [studentArguments, setStudentArguments] = useState(["", "", ""]);
  const [aiPoints, setAiPoints] = useState([]);
  const [violationDetected, setViolationDetected] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes for preparation
  const [timerActive, setTimerActive] = useState(false);
  const [aiCounterArguments, setAiCounterArguments] = useState([]);
  // Removed unused variables to fix warnings

  // Effect to hide/show header
  useEffect(() => {
    setShowHeader(false); // Hide header when entering the debate room
    setShowFooter(false); // Hide footer when entering the debate room
    return () => {
      setShowHeader(true); // Show header when leaving
      setShowFooter(true); // Show footer when leaving
    };
  }, [setShowHeader, setShowFooter]);

  useEffect(() => {
    if (!team_id) {
      navigate('/');
      return;
    }
    
    const fetchSessionInfo = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/debate/${team_id}/info`);
        const { topic, members, course_code, current_phase } = response.data;
        
        // 🔧 FIX: Check if session already has stance and phase
        let sessionStance = response.data.stance;
        let sessionPhase = current_phase;
        
        if (!sessionStance) {
          // Randomly assign stance only if not already set
          const randomStance = Math.random() < 0.5 ? 'ĐỒNG TÌNH' : 'PHẢN ĐỐI';
          await api.post(`/debate/${team_id}/stance`, { stance: randomStance });
          sessionStance = randomStance;
        }
        
        setTopic(topic);
        setTeamInfo({ teamId: team_id, members, courseCode: course_code });
        setStance(sessionStance);
        
        // 🔧 FIX: Set phase based on current session state
        if (sessionPhase === 'Phase 2') {
          setPhase(2);
          // Load existing Phase 2 turns data immediately
          try {
            const turnsResponse = await api.get(`/debate/${team_id}/turns`);
            if (turnsResponse.data.success && turnsResponse.data.phase2_turns) {
              setTurnsPhase2(turnsResponse.data.phase2_turns);
              console.log('✅ Loaded existing Phase 2 turns on page load:', turnsResponse.data.phase2_turns.length);
            }
          } catch (turnsError) {
            console.error('Failed to load existing turns:', turnsError);
          }
        } else if (sessionPhase === 'Phase 3') {
          setPhase(3);
          // Load existing turns for both phases
          try {
            const turnsResponse = await api.get(`/debate/${team_id}/turns`);
            if (turnsResponse.data.success) {
              setTurnsPhase2(turnsResponse.data.phase2_turns || []);
              setTurnsPhase3(turnsResponse.data.phase3_turns || []);
              console.log('✅ Loaded existing turns for Phase 3');
            }
          } catch (turnsError) {
            console.error('Failed to load existing turns:', turnsError);
          }
        } else {
          setPhase(0.5); // Start with preparation phase
          setTimeLeft(300); // 5 minutes
          setTimerActive(true);
        }
        
        setSuccess('Đã tải thông tin debate! Lập trường của nhóm: ' + sessionStance);

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
      // Step 1: Submit user's conclusion from Phase 4
      const conclusion = studentArguments[0]?.trim();
      if (!conclusion || conclusion.length < 100) {
        setError("Vui lòng nhập kết luận ít nhất 100 ký tự trước khi chấm điểm.");
        return;
      }
      
      try {
        const conclusionResponse = await api.post(`/debate/${team_id}/phase4/conclusion`, {
          team_id: team_id,
          arguments: [conclusion] // Phase 4 chỉ cần 1 conclusion
        });
        console.log('CONCLUSION RESPONSE', conclusionResponse.data);
      } catch (conclusionErr) {
        // If session not found, redirect to home
        if (conclusionErr.response?.status === 404) {
          setError("Session không tồn tại. Đang chuyển về trang chủ...");
          setTimeout(() => navigate('/'), 2000);
          return;
        }
        // If conclusion already exists, that's fine
        if (conclusionErr.response?.status !== 400) {
          throw conclusionErr;
        }
      }

      // Step 2: Generate AI counter-arguments (Skip nếu có lỗi)
      try {
        const aiResponse = await api.post(`/debate/${team_id}/phase4/ai-conclusion`);
        console.log('AI COUNTER-CONCLUSION RESPONSE', aiResponse.data);
        setAiCounterArguments(aiResponse.data.ai_counter_arguments || []);
      } catch (aiErr) {
        console.log('Skipping AI counter-arguments due to error:', aiErr.response?.data);
        // Skip AI step nếu có lỗi
        setAiCounterArguments(["AI counter-arguments bị bỏ qua do lỗi hệ thống"]);
      }

      // Step 3: Complete Phase 4
      try {
        await api.post(`/debate/${team_id}/phase4/evaluate`);
        console.log('PHASE 4 COMPLETED');
      } catch (phase4Err) {
        // If already completed, that's fine
        if (phase4Err.response?.status !== 400) {
          console.log('Phase 4 evaluate error (continuing):', phase4Err.response?.data);
        }
      }

      // Step 4: Final evaluation (Phase 5)
      const response = await api.post(`/debate/${team_id}/phase5/evaluate`);
      console.log('EVALUATION RESPONSE', response.data);
      const evaluationData = response.data.data?.evaluation || response.data.evaluation;
      console.log('SETTING EVALUATION:', evaluationData);
      setEvaluation(evaluationData);
      setPhase(5); // Force phase to 5 to show results
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
  }, [team_id, navigate, studentArguments]);

  // Handle AI counter-conclusion generation
  const handleAICounterConclusion = async () => {
    setLoading(true);
    setError(null);
    try {
      // Step 1: Submit student conclusion first
      const conclusion = studentArguments[0]?.trim();
      if (!conclusion || conclusion.length < 100) {
        setError("Vui lòng nhập kết luận ít nhất 100 ký tự trước khi lấy phản bác AI.");
        return;
      }
      
      try {
        const conclusionResponse = await api.post(`/debate/${team_id}/phase4/conclusion`, {
          team_id: team_id,
          arguments: [conclusion] // Phase 4 chỉ cần 1 conclusion
        });
        console.log('CONCLUSION SUBMITTED', conclusionResponse.data);
      } catch (conclusionErr) {
        console.log('Conclusion already submitted or error:', conclusionErr.response?.data);
        // Continue anyway, might be already submitted
      }
      
      // Step 2: Get AI counter arguments
      const response = await api.post(`/debate/${team_id}/phase4/ai-conclusion`);
      console.log('AI COUNTER-CONCLUSION RESPONSE', response.data);
      setAiCounterArguments(response.data.ai_counter_arguments || []);
      setSuccess("AI đã tạo luận điểm tổng kết phản bác!");
    } catch (err) {
      console.error("Lỗi khi tạo luận điểm AI:", err.response?.data || err.message);
      if (err.response?.status === 404) {
        setError("Session không tồn tại hoặc đã hết hạn. Đang chuyển về trang chủ...");
        setTimeout(() => navigate('/'), 2000);
      } else {
        setError("Lỗi khi tạo luận điểm AI: " + (err.response?.data?.detail || err.message));
      }
    } finally {
      setLoading(false);
    }
  };

  // Timer countdown effect
  useEffect(() => {
    if (!timerActive || timeLeft <= 0) {
      if (timeLeft <= 0) {
        setTimerActive(false);
        if (phase === 0.5) {
          // When prep phase ends, start phase 1 by getting AI arguments
          handlePhase1();
        } else if (phase === 1.5) {
          // When phase 1.5 ends (student arguments input), auto-submit if valid
          const validArguments = studentArguments.filter(arg => arg?.trim().length > 0);
          if (validArguments.length >= 3) {
            handleSendStudentArguments();
          } else {
            setError("Vui lòng nhập đủ 3 luận điểm trước khi hết giờ!");
            setTimeLeft(60); // Give 1 more minute
          setTimerActive(true);
          }
        } else if (phase === 2) {
          setPhase(3); // Move from Phase 2 to Phase 3
        } else if (phase === 3) {
          setPhase(4); // Move from Phase 3 to Phase 4
        } else if (phase === 4) {
          // Phase 4 timeout handling
          const hasConclusion = studentArguments.filter(arg => arg?.trim()).length >= 1 && 
                              studentArguments[0]?.trim().length >= 100;
          
          if (hasConclusion) {
            // Auto-submit conclusion when time runs out
            (async () => {
              setLoading(true);
              try {
                // Step 1: Submit conclusion
                await api.post(`/debate/${team_id}/phase4/conclusion`, {
                  team_id: team_id,
                  arguments: [studentArguments[0].trim()]
                });
                
                // Step 2: Generate AI counter-arguments
                try {
                  const aiResponse = await api.post(`/debate/${team_id}/phase4/ai-conclusion`);
                  setAiCounterArguments(aiResponse.data.ai_counter_arguments || ["AI không có phản hồi"]);
                } catch (aiErr) {
                  console.log('AI counter-arguments skipped:', aiErr.response?.data);
                  setAiCounterArguments(["AI đã từ chối tham gia phản bác"]);
                }
                
                // Step 3: Complete Phase 4
                try {
                  await api.post(`/debate/${team_id}/phase4/evaluate`);
                } catch (phase4Err) {
                  if (phase4Err.response?.status !== 400) {
                    console.log('Phase 4 evaluate error (continuing):', phase4Err.response?.data);
                  }
                }
                
                // Step 4: Final evaluation (Phase 5)
                setSuccess("⏳ Thời gian hết! AI đang phân tích toàn bộ debate và chấm điểm... (5-10 giây)");
                const response = await api.post(`/debate/${team_id}/phase5/evaluate`);
                const evaluationData = response.data.data?.evaluation || response.data.evaluation;
                setEvaluation(evaluationData);
                setPhase(5);
                setTimerActive(false);
                setSuccess("🎉 Debate đã được chấm điểm tự động thành công!");
                
              } catch (err) {
                console.error("Lỗi khi tự động nộp kết luận:", err);
                setError("Lỗi khi tự động nộp kết luận: " + (err.response?.data?.detail || err.message));
              } finally {
                setLoading(false);
              }
            })();
          } else {
            // Nếu chưa có kết luận hợp lệ
            setError("⚠️ Thời gian đã hết! Vui lòng nhập kết luận có ít nhất 100 ký tự để được chấm điểm.");
          }
        }
      }
      return;
    }
    const intervalId = setInterval(() => {
      setTimeLeft(prevTime => prevTime - 1);
    }, 1000);
    return () => clearInterval(intervalId);
  }, [timeLeft, timerActive, phase, handlePhase1, studentArguments, team_id, api, setLoading, setEvaluation, setPhase, setTimerActive, setSuccess, setError, navigate]);

  // Effect to set timers when phase changes
  useEffect(() => {
    setTimerActive(false); // Stop any previous timer
    updateBackendPhase(phase); // Report new phase to backend

    if (phase === 0.5) { // GĐ Chuẩn bị
      console.log('🔧 DEBUG [v2.0]: Setting Phase 0.5 timer to 300 seconds (5 minutes) at', new Date().toLocaleTimeString());
      setTimeLeft(300); // 5 phút
      setTimerActive(true);
    } else if (phase === 1.5) { // Phiên 1: Trình bày luận điểm mở
      console.log('🔧 DEBUG [v2.0]: Setting Phase 1.5 timer to 600 seconds (10 minutes) at', new Date().toLocaleTimeString());
      setTimeLeft(600); // 10 phút
      setTimerActive(true);
    } else if (phase === 2) { // Phase 2: AI hỏi, SV trả lời
      setTimeLeft(420); // 7 phút
      setTimerActive(true);
    } else if (phase === 3) { // Phase 3: SV hỏi, AI trả lời
      setTimeLeft(420); // 7 phút
      setTimerActive(true);
    } else if (phase === 4) { // Phase 4: Kết luận Debate
      console.log('🔧 DEBUG [v2.0]: Setting Phase 4 timer to 300 seconds (5 minutes) at', new Date().toLocaleTimeString());
      setTimeLeft(300); // 5 phút
      setTimerActive(true);
      // Reset arguments for phase 4 conclusion
      setStudentArguments(['', '', '']);
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
      // Chỉ xử lý vi phạm trong Phase 1-3, không áp dụng cho Phase 4 và khi có evaluation
      // Phase 4 cho phép tự do hơn vì là giai đoạn tổng kết
      if ((phase >= 1 && phase <= 3) && !violationDetected && !loading && !evaluation) {
        setTimerActive(false); // Dừng timer khi vi phạm
        setViolationDetected(true);
      }
    };

    // Chỉ enable detection cho Phase 1-3, không cho Phase 4
    if ((phase >= 1 && phase <= 3) && !violationDetected && !evaluation) {
      document.addEventListener('visibilitychange', handleVisibilityChange);
      document.addEventListener('fullscreenchange', handleFullscreenChange);
    }

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [phase, violationDetected, loading, evaluation]);

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

  // Phase 4 không tự động evaluate, cần người dùng thực hiện conclusion trước

  // startDebate function removed - unused

  // Gửi luận điểm nhóm và khởi tạo phase 2
  const handleSendStudentArguments = async () => {
    console.log('handleSendStudentArguments CALLED');
    if (!team_id) return;
    try {
      setLoading(true);
      setError(null);
      // 1. Lấy câu hỏi AI từ Phase 2
      const phase2Response = await api.post(`/debate/${team_id}/phase2`, { team_arguments: studentArguments });
      console.log('Phase 2 AI Questions Response:', phase2Response.data);
      
      // 2. Chuyển đổi ai_questions thành format turns (chỉ lấy 1 câu hỏi đầu tiên)
      const aiQuestions = phase2Response.data.data?.ai_questions || [];
      const selectedQuestion = aiQuestions.length > 0 ? aiQuestions[0] : "Không có câu hỏi từ AI";
      const formattedTurns = [{
        asker: 'ai',
        question: selectedQuestion,
        answer: null,
        turn_number: 1
      }];
      
      console.log('Formatted AI Questions as Turns:', formattedTurns);
      setTurnsPhase2(formattedTurns);
      
      // 3. Khởi tạo phase 2
      await api.post(`/debate/${team_id}/phase2/start`);
      
      setSuccess('Đã lấy câu hỏi AI và bắt đầu Phase 2!');
      setPhase(2); // Sang phase 2
    } catch (err) {
      console.error('Phase 2 Error:', err);
      setError('Lấy câu hỏi AI hoặc khởi tạo Phase 2 thất bại!');
    } finally {
      setLoading(false);
    }
  };

  // Validation function cho nội dung câu trả lời
  const isValidContent = (content) => {
    if (!content || typeof content !== 'string') return false;
    const trimmedContent = content.trim();
    if (trimmedContent.length < 10) return false; // Tối thiểu 10 ký tự
    
    // Kiểm tra nội dung không phải chỉ là ký tự lặp lại
    const uniqueChars = new Set(trimmedContent.toLowerCase().replace(/\s/g, ''));
    if (uniqueChars.size < 3) return false; // Tối thiểu 3 ký tự khác nhau
    
    // Kiểm tra không phải chỉ toàn số hoặc ký tự đặc biệt
    const hasLetters = /[a-zA-ZÀ-ỹ]/.test(trimmedContent);
    if (!hasLetters) return false;
    
    return true;
  };

  // Gửi lượt debate phase 2 (AI chất vấn sinh viên)
  const handleSendStudentTurn = async () => {
    if (turnsPhase2.length === 0) return;
    const lastAIQuestion = [...turnsPhase2].reverse().find(t => t.asker === 'ai');
    if (!lastAIQuestion || !lastAIQuestion.question) return;
    
    // Enhanced validation
    if (!isValidContent(currentAnswer)) {
      setError('Vui lòng nhập câu trả lời có ý nghĩa (tối thiểu 10 ký tự, có chữ cái)');
      return;
    }
    
    const answerToSubmit = currentAnswer.trim();
    
    try {
      setTurnLoading(true);
      setError(null);
      
      // 🔧 FIX: Optimistic update matching sequential pairing logic
      const optimisticTurns = [...turnsPhase2];
      
      // Find if there's already a student turn for this AI question that needs updating
      const existingStudentTurn = optimisticTurns.find(t => 
        t.asker === 'student' && 
        t.question === lastAIQuestion.question && 
        (!t.answer || t.answer === 'null' || t.answer.trim() === '')
      );
      
      if (existingStudentTurn) {
        // Update existing student turn
        existingStudentTurn.answer = answerToSubmit;
        console.log('🔧 DEBUG: Updated existing student turn:', existingStudentTurn);
      } else {
        // Add new student turn with proper turn_number
        const newStudentTurn = {
          asker: 'student',
          question: lastAIQuestion.question,
          answer: answerToSubmit,
          turn_number: optimisticTurns.length + 1
        };
        optimisticTurns.push(newStudentTurn);
        console.log('🔧 DEBUG: Added new student turn:', newStudentTurn);
      }
      
      console.log('🔧 DEBUG: Optimistic update with student answer:', answerToSubmit);
      setTurnsPhase2(optimisticTurns);
      
      // Clear input immediately
      setCurrentAnswer('');
      
      // Send to backend
      const response = await api.post(`/debate/${team_id}/ai-question/turn`, {
        answer: answerToSubmit,
        asker: 'student',
        question: lastAIQuestion.question,
      });
      
      console.log('🔧 DEBUG: Full backend response:', response.data);
      
      // 🔧 FIX: Smart merge backend response with optimistic update
      if (response.data.turns) {
        const backendTurns = response.data.turns.map((turn, idx) => ({
          asker: turn.asker,
          question: turn.question,
          answer: turn.answer === 'null' ? null : turn.answer, // Convert "null" string to null
          turn_number: idx + 1
        }));
        
        console.log('🔧 DEBUG: Backend response turns:', backendTurns);
        
                 // 🔧 FIX: Use backend turns directly since they contain all data
         // Backend already has the complete data including the new answer
         const mergedTurns = backendTurns;
        
        console.log('🔧 DEBUG: Final merged turns:', mergedTurns);
        setTurnsPhase2(mergedTurns);
      }
      
      // 🔧 FIX: Always enable "Request Next Question" button after successful answer submission
      // regardless of backend response format to ensure UX continuity
      console.log('🔧 DEBUG: Enabling Request Next Question button');
      setCanRequestNextQuestion(true);
      setSuccess('Câu trả lời đã được gửi! Bạn có thể yêu cầu câu hỏi tiếp theo.');
      
    } catch (err) {
      console.error('Phase 2 turn error:', err);
      setError(err.response?.data?.detail || "Gửi câu trả lời thất bại! Vui lòng thử lại.");
      
      // 🔧 FIX: Revert optimistic update on error
      const revertedTurns = turnsPhase2.filter(t => 
        !(t.asker === 'student' && t.answer === answerToSubmit)
      );
      setTurnsPhase2(revertedTurns);
      setCurrentAnswer(answerToSubmit); // Restore input
    } finally {
      setTurnLoading(false);
    }
  };

  // 🔧 NEW: Handle requesting next AI question
  const handleRequestNextQuestion = async () => {
    try {
      setTurnLoading(true);
      setError(null);
      
      console.log('🔧 DEBUG: Requesting next AI question for team:', team_id);
      const response = await api.post(`/debate/${team_id}/ai-question/generate`);
      console.log('🔧 DEBUG: AI question generate response:', response.data);
      
      if (response.data.turns) {
        const backendTurns = response.data.turns.map((turn, idx) => ({
          asker: turn.asker,
          question: turn.question,
          answer: turn.answer === 'null' ? null : turn.answer,
          turn_number: idx + 1
        }));
        
        console.log('🔧 DEBUG: New AI question received, updating turns:', backendTurns);
        setTurnsPhase2(backendTurns);
        setCanRequestNextQuestion(false); // Disable button after getting new question
        setSuccess('Đã nhận câu hỏi AI mới!');
      } else if (response.data.success) {
        // 🔧 FALLBACK: If response is successful but no turns field, create manual turn
        console.log('🔧 DEBUG: No turns field, but response successful. Creating fallback question.');
        const fallbackQuestion = "Bạn có thể giải thích thêm về quan điểm của mình không?";
        const newTurn = {
          asker: 'ai',
          question: fallbackQuestion,
          answer: null,
          turn_number: turnsPhase2.length + 1
        };
        setTurnsPhase2(prev => [...prev, newTurn]);
        setCanRequestNextQuestion(false);
        setSuccess('Đã tạo câu hỏi AI mới!');
      } else {
        throw new Error('Response không hợp lệ từ backend');
      }
      
    } catch (err) {
      console.error('Request next question error:', err);
      setError(`Lỗi lấy câu hỏi tiếp theo: ${err.response?.data?.detail || err.message}. Vui lòng thử lại.`);
    } finally {
      setTurnLoading(false);
    }
  };

  // Gửi lượt debate phase 3 (Sinh viên chất vấn AI)
  const handleSendStudentQuestion = async (question) => {
    // Enhanced validation cho câu hỏi
    if (!isValidContent(question)) {
      setError('Vui lòng nhập câu hỏi có ý nghĩa (tối thiểu 10 ký tự, có chữ cái)');
      return;
    }
    
    try {
      setTurnLoading(true);
      
      // Optimistic update: Add student question first to Phase 3 turns
      const optimisticQuestionTurn = {
        asker: 'student',
        question: question.trim(),
        answer: null,
        turn_number: turnsPhase3.length + 1
      };
      
      setTurnsPhase3(prev => [...prev, optimisticQuestionTurn]);
      setCurrentAnswer(''); // Clear input field immediately
      
      const response = await api.post(`/debate/${team_id}/student-question/turn`, {
        asker: 'student',
        question: question.trim(),
        answer: null
      });
      
      console.log('🔧 DEBUG Phase 3 response:', response.data);
      
      // 🔧 FIX: Use backend Phase 3 turns directly
      if (response.data.turns) {
        const backendTurns = response.data.turns;
        console.log('🔧 DEBUG: Backend Phase 3 turns:', backendTurns);
        
        // Convert backend format to frontend format
        const formattedTurns = backendTurns.map((turn, idx) => ({
          asker: turn.asker,
          question: turn.question,
          answer: turn.answer === 'null' ? null : turn.answer,
          turn_number: idx + 1
        }));
        
        setTurnsPhase3(formattedTurns);
      }
      
    } catch (err) {
      console.error('Phase 3 error:', err);
      setError(err.response?.data?.detail || "Gửi lượt debate phase 3 (Sinh viên chất vấn AI) thất bại!");
      
      // Revert optimistic update on error
      setTurnsPhase3(prev => prev.slice(0, -1));
      setCurrentAnswer(question); // Restore input
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
    console.log(`🔧 DEBUG formatTime: ${seconds} seconds = ${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`);
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
    if (phase === 2 && team_id && turnsPhase2.length === 0) {
      (async () => {
        try {
          setLoading(true);
          
          // 🔧 FIX: First try to load existing Phase 2 turns data
          console.log('🔧 DEBUG: Loading existing Phase 2 turns data...');
          const turnsResponse = await api.get(`/debate/${team_id}/turns`);
          if (turnsResponse.data.success && turnsResponse.data.phase2_turns && turnsResponse.data.phase2_turns.length > 0) {
            // Existing turns found - load them
            console.log('🔧 DEBUG: Found existing Phase 2 turns:', turnsResponse.data.phase2_turns);
            setTurnsPhase2(turnsResponse.data.phase2_turns);
            console.log('✅ Loaded existing Phase 2 turns from backend');
          } else {
            // No existing turns - initialize Phase 2
            console.log('🔧 DEBUG: No existing turns found, initializing Phase 2...');
            
            // 1. Lấy câu hỏi AI cho Phase 2
            const questionsResponse = await api.post(`/debate/${team_id}/phase2`);
            console.log('Phase 2 Questions Response:', questionsResponse.data);
            
            // 2. Chuyển đổi ai_questions thành format turns (chỉ lấy 1 câu hỏi đầu tiên)
            const aiQuestions = questionsResponse.data.data?.ai_questions || [];
            const selectedQuestion = aiQuestions.length > 0 ? aiQuestions[0] : "Không có câu hỏi từ AI";
            const formattedTurns = [{
              asker: 'ai',
              question: selectedQuestion,
              answer: null,
              turn_number: 1
            }];
            
            console.log('Formatted AI Questions as Turns:', formattedTurns);
            setTurnsPhase2(formattedTurns);
            
            // 3. Khởi tạo phase 2
            await api.post(`/debate/${team_id}/phase2/start`);
          }
          
        } catch (error) {
          console.error('Phase 2 initialization error:', error);
          setError('Không thể tải dữ liệu Phase 2');
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [phase, team_id, turnsPhase2.length]);

  // Khi chuyển sang phase 3, load existing turns data correctly separated
  const handleGoToPhase3 = async () => {
    try {
      // Load existing turns data from backend with proper separation
      const response = await api.get(`/debate/${team_id}/turns`);
      if (response.data.success) {
        setTurnsPhase2(response.data.phase2_turns || []);
        setTurnsPhase3(response.data.phase3_turns || []);
        console.log('🔧 DEBUG: Loaded separated turns data:', {
          phase2: response.data.phase2_turns?.length || 0,
          phase3: response.data.phase3_turns?.length || 0
        });
      }
    } catch (error) {
      console.error('Failed to load turns data:', error);
      // Initialize with empty arrays if loading fails
      setTurnsPhase3([]);
    }
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

  console.log('RENDER: phase', phase, 'evaluation', evaluation, 'hasEvaluation', !!evaluation);

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #7ecbff 0%, #007AFF 100%)',
      position: 'relative',
      overflow: 'hidden',
      color: theme.palette.text.primary
    }}>
      <Container maxWidth="md" sx={{ py: { xs: 2, sm: 3, md: 4 }, px: { xs: 2, sm: 3 } }}>
        <Paper elevation={4} sx={{ 
          p: { xs: 3, sm: 4, md: 4 }, 
          borderRadius: { xs: 2, md: 3 }, 
          background: theme.palette.background.paper, 
          color: theme.palette.text.primary,
          mx: { xs: 0, sm: 0 }
        }}>
          <Box 
            display="flex" 
            justifyContent="space-between" 
            alignItems="center" 
            mb={2}
            flexDirection={{ xs: "column", sm: "row" }}
            gap={{ xs: 1, sm: 0 }}
          >
            <Typography 
              variant={{ xs: "h5", sm: "h4" }} 
              color="primary" 
              gutterBottom 
              align="center"
              sx={{ fontSize: { xs: '1.75rem', sm: '2rem', md: '2.125rem' } }}
            >
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
              <Box sx={{ mb: 2, p: 2, border: '1px solid #ddd', borderRadius: 2, textAlign: 'center' }}>
                <Typography variant="h5" color={timeLeft < 60 ? 'error' : 'primary'}>
                  ⏳ Thời gian chuẩn bị: {formatTime(timeLeft)}
                </Typography>
                {timeLeft <= 0 && (
                  <Typography color="error" variant="h6" sx={{ mt: 1 }}>
                    Hết giờ! Chuyển sang phase 1...
                  </Typography>
                )}
              </Box>

              <Box sx={{ 
                p: 3, 
                mb: 3, 
                bgcolor: stance === 'ĐỒNG TÌNH' ? '#e8f5e9' : '#ffebee',
                borderRadius: 2,
                border: `2px solid ${stance === 'ĐỒNG TÌNH' ? '#4caf50' : '#f44336'}`
              }}>
                <Typography variant="h6" align="center" sx={{ mb: 2 }}>
                  Chủ đề: {topic}
                </Typography>
                
                <Typography variant="h6" align="center" sx={{
                  color: stance === 'ĐỒNG TÌNH' ? '#2e7d32' : '#d32f2f',
                  fontWeight: 'bold',
                  mb: 2
                }}>
                  Lập trường của nhóm: {stance} {stance === 'ĐỒNG TÌNH' ? '✅' : '❌'}
                </Typography>
                
                <Typography variant="body1" align="center" sx={{ color: 'text.secondary' }}>
                  Hãy dành 5 phút để chuẩn bị các luận điểm {stance.toLowerCase()} với chủ đề này.
                </Typography>
              </Box>

              <Box sx={{ textAlign: 'center', mt: 3 }}>
                <Button 
                  variant="contained" 
                  color="primary" 
                  size="large"
                  onClick={handlePhase1}
                  disabled={loading}
                  sx={{ px: 4, py: 1.5, fontSize: '1.1rem' }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Bắt đầu Phase 1'}
                </Button>
                <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                  Hoặc đợi {formatTime(timeLeft)} để tự động bắt đầu
                </Typography>
              </Box>
            </Box>
          )}

          {phase === 1.5 && (
            <Box>
              <Box sx={{ mb: 2, p: 2, border: '1px solid #ddd', borderRadius: 2, textAlign: 'center' }}>
                <Typography variant="h5" color={timeLeft < 60 ? 'error' : 'primary'}>
                  ⏳ Thời gian trình bày luận điểm: {formatTime(timeLeft)}
                </Typography>
                {timeLeft <= 0 && (
                  <Typography color="error" variant="h6" sx={{ mt: 1 }}>
                    Hết giờ! Bạn không thể nộp luận điểm được nữa.
                  </Typography>
                )}
              </Box>

              <Typography variant="h6" gutterBottom>
                3 luận điểm của AI {stance === 'ĐỒNG TÌNH' ? 'PHẢN ĐỐI' : 'ĐỒNG TÌNH'}:
              </Typography>
              <Box component="ul" sx={{ pl: 2, listStyle: 'none' }}>
                {aiPoints.map((point, idx) => (
                  <Typography component="li" key={idx} sx={{ mb: 2, lineHeight: 1.7 }}>
                    <span dangerouslySetInnerHTML={{ __html: formatAIResponse(point) }} />
                  </Typography>
                ))}
              </Box>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Nhập 3 luận điểm {stance} của nhóm:
              </Typography>
              {studentArguments.map((arg, idx) => (
                <TextField
                  key={idx}
                  fullWidth
                  multiline
                  rows={4}
                  label={`Luận điểm ${idx + 1}`}
                  value={arg}
                  onChange={e => {
                    const newArgs = [...studentArguments];
                    newArgs[idx] = e.target.value;
                    setStudentArguments(newArgs);
                  }}
                  sx={{ 
                    mb: 2,
                    '& .MuiInputBase-input': {
                      fontSize: '1.1rem',
                      lineHeight: 1.6
                    },
                    '& .MuiInputLabel-root': {
                      fontSize: '1.1rem'
                    }
                  }}
                  onPaste={(e) => { e.preventDefault(); return false; }}
                  onCopy={(e) => { e.preventDefault(); return false; }}
                  onCut={(e) => { e.preventDefault(); return false; }}
                  helperText="Chức năng sao chép, cắt, dán đã được vô hiệu hóa."
                  disabled={timeLeft <= 0}
                />
              ))}
              <Box sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', sm: 'row' }, 
                gap: { xs: 1, sm: 2 },
                mt: 1 
              }}>
                <Button
                  variant="contained"
                  onClick={() => setStudentArguments([...studentArguments, ""])}
                  disabled={timeLeft <= 0}
                  sx={{ 
                    px: { xs: 2, sm: 3 },
                    py: { xs: 1, sm: 1.5 },
                    fontSize: { xs: '0.875rem', sm: '1rem' }
                  }}
                >
                  Thêm luận điểm
                </Button>
                <Button
                  variant="contained"
                  color="success"
                  disabled={
                    studentArguments.filter(arg => isValidContent(arg)).length < 3 || 
                    timeLeft <= 0
                  }
                  onClick={() => {
                    console.log('CLICK gửi luận điểm nhóm');
                    handleSendStudentArguments();
                  }}
                  sx={{ 
                    px: { xs: 2, sm: 3 },
                    py: { xs: 1, sm: 1.5 },
                    fontSize: { xs: '0.875rem', sm: '1rem' }
                  }}
                >
                  Gửi luận điểm nhóm & Bắt đầu Debate Socratic
                </Button>
              </Box>
            </Box>
          )}

          {(phase === 2 || phase === 3) && (
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



          {phase === 2 && (
            <Box>
              <Box sx={{ mb: 2, p: 2, border: '1px solid #ddd', borderRadius: 2, textAlign: 'center', position: 'sticky', top: 0, zIndex: 10, bgcolor: 'white' }}>
                <Typography 
                  variant={{ xs: "h6", sm: "h5" }} 
                  color={timeLeft < 60 ? 'error' : 'primary'}
                  sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' }, mb: 1 }}
                >
                  Thời gian Debate: {formatTime(timeLeft)}
                </Typography>
                <Typography 
                  variant={{ xs: "body1", sm: "h6" }} 
                  sx={{ fontSize: { xs: '0.875rem', sm: '1.125rem' }, mb: 1 }}
                >
                  Phase 2: AI hỏi, SV trả lời
                </Typography>
                <Typography 
                  variant={{ xs: "body2", sm: "subtitle1" }}
                  sx={{ fontSize: { xs: '0.75rem', sm: '1rem' }, color: 'text.secondary' }}
                >
                  Lượt: {turnsPhase2.length}
                </Typography>
              </Box>
              
              {/* Phase 2 Conversation History */}
              <Paper sx={{ p: 2, mb: 2, bgcolor: '#f8f9fa', borderRadius: 2 }}>
                <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold', mb: 2, textAlign: 'center' }}>
                  🔄 Cuộc hội thoại Phase 2 (AI chất vấn Team)
                </Typography>
                
                {turnsPhase2.length === 0 ? (
                  <Typography color="text.secondary" sx={{ textAlign: 'center', fontStyle: 'italic' }}>
                    Đang tải câu hỏi từ AI...
                  </Typography>
                ) : (
                  <Box sx={{ maxHeight: 500, overflowY: 'auto' }}>
                    {(() => {
                      // Group turns into conversation pairs
                      const conversationPairs = [];
                      let currentPair = null;
                      
                      console.log('🔧 DEBUG: Processing turnsPhase2:', turnsPhase2);
                      
                      // 🔧 FIX: Sequential pairing logic - each AI question gets its own turn
                      const allTurns = turnsPhase2.sort((a, b) => (a.turn_number || 0) - (b.turn_number || 0));
                      
                      console.log('🔧 DEBUG: All turns sorted:', allTurns);
                      
                      let currentAIQuestion = null;
                      let turnNumber = 0;
                      
                      allTurns.forEach((turn) => {
                        if (turn.asker === 'ai' && turn.question) {
                          // New AI question starts a new conversation pair
                          turnNumber++;
                          currentAIQuestion = {
                            turnNumber: turnNumber,
                            aiQuestion: turn.question,
                            studentAnswer: null
                          };
                          conversationPairs.push(currentAIQuestion);
                          console.log(`🔧 DEBUG: Created Lượt ${turnNumber} with AI question:`, turn.question);
                          
                        } else if (turn.asker === 'student' && turn.answer && turn.answer !== 'null' && turn.answer.trim() !== '' && currentAIQuestion && !currentAIQuestion.studentAnswer) {
                          // Add student answer to the current (latest) AI question
                          currentAIQuestion.studentAnswer = turn.answer;
                          console.log(`🔧 DEBUG: Added student answer to Lượt ${currentAIQuestion.turnNumber}:`, turn.answer);
                        }
                      });
                      
                      console.log('🔧 DEBUG: Final conversationPairs:', conversationPairs);
                      
                      return conversationPairs.map((pair, idx) => (
                        <Paper key={idx} elevation={2} sx={{ p: 2, mb: 2, bgcolor: 'white', borderRadius: 2 }}>
                          <Typography variant="subtitle1" color="text.secondary" sx={{ fontWeight: 'bold', mb: 1 }}>
                            Lượt {pair.turnNumber}:
                          </Typography>
                          
                          {/* AI Question */}
                          <Box sx={{ mb: 2, p: 1.5, bgcolor: '#e3f2fd', borderRadius: 1, borderLeft: '4px solid #2196f3' }}>
                            <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 'bold', mb: 1 }}>
                              🤖 AI hỏi:
                            </Typography>
                            <Typography 
                              variant="body1" 
                              sx={{ whiteSpace: 'pre-line', lineHeight: 1.6 }}
                              dangerouslySetInnerHTML={{ __html: formatAIResponse(pair.aiQuestion) }}
                            />
                          </Box>
                          
                          {/* Student Answer */}
                          <Box sx={{ p: 1.5, bgcolor: pair.studentAnswer ? '#e8f5e8' : '#fff3e0', borderRadius: 1, borderLeft: `4px solid ${pair.studentAnswer ? '#4caf50' : '#ff9800'}` }}>
                            <Typography variant="subtitle2" color={pair.studentAnswer ? 'secondary' : 'warning'} sx={{ fontWeight: 'bold', mb: 1 }}>
                              👥 Team trả lời:
                            </Typography>
                            {pair.studentAnswer ? (
                              <Typography 
                                variant="body1" 
                                sx={{ whiteSpace: 'pre-line', lineHeight: 1.6 }}
                                dangerouslySetInnerHTML={{ __html: formatAIResponse(pair.studentAnswer) }}
                              />
                            ) : (
                              <Typography variant="body1" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                                (Chưa trả lời)
                              </Typography>
                            )}
                          </Box>
                        </Paper>
                      ));
                    })()}
                  </Box>
                )}
              </Paper>
              
              {/* Input for current answer */}
              {turnsPhase2.length > 0 && (() => {
                const lastTurn = turnsPhase2[turnsPhase2.length - 1];
                const hasUnansweredQuestion = lastTurn.asker === 'ai' && lastTurn.question && !lastTurn.answer;
                return hasUnansweredQuestion && (
                  <Box sx={{ mb: 2 }}>
                    <TextField
                      fullWidth
                      multiline
                      rows={5}
                      label="Câu trả lời của Team"
                      value={currentAnswer}
                      onChange={e => setCurrentAnswer(e.target.value)}
                      sx={{ 
                        mb: 2,
                        '& .MuiInputBase-input': {
                          fontSize: '1.1rem',
                          lineHeight: 1.6
                        },
                        '& .MuiInputLabel-root': {
                          fontSize: '1.1rem'
                        }
                      }}
                      onPaste={e => { e.preventDefault(); return false; }}
                      onCopy={e => { e.preventDefault(); return false; }}
                      onCut={e => { e.preventDefault(); return false; }}
                      helperText="Chức năng sao chép, cắt, dán đã được vô hiệu hóa."
                    />
                    <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                      <Button
                        variant="contained"
                        onClick={handleSendStudentTurn}
                        disabled={turnLoading || !currentAnswer.trim()}
                        sx={{ 
                          px: { xs: 2, sm: 3 },
                          py: { xs: 1, sm: 1.5 },
                          fontSize: { xs: '0.875rem', sm: '1rem' },
                          width: { xs: '100%', sm: 'auto' }
                        }}
                      >
                        {turnLoading ? 'Đang gửi...' : 'Gửi trả lời'}
                      </Button>
                    </Box>
                  </Box>
                );
              })()}
              
              {/* 🔧 FIX: Request Next Question button - independent of hasUnansweredQuestion */}
              {canRequestNextQuestion && (
                <Box sx={{ mb: 2, textAlign: 'center' }}>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={handleRequestNextQuestion}
                    disabled={turnLoading}
                    sx={{ 
                      px: { xs: 2, sm: 3 },
                      py: { xs: 1, sm: 1.5 },
                      fontSize: { xs: '0.875rem', sm: '1rem' },
                      width: { xs: '100%', sm: 'auto' }
                    }}
                  >
                    {turnLoading ? 'Đang tải...' : 'Yêu cầu câu hỏi tiếp theo'}
                  </Button>
                </Box>
              )}
              
              <Box sx={{ mt: 2, p: 2, bgcolor: '#f0f0f0', borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Số lượt debate Phase 2: {turnsPhase2.length}
                </Typography>
                <Button
                  variant="contained"
                  color="success"
                  sx={{ 
                    mt: 1, 
                    px: { xs: 2, sm: 3 },
                    py: { xs: 1, sm: 1.5 },
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                    width: { xs: '100%', sm: 'auto' }
                  }}
                  onClick={handleGoToPhase3}
                >
                  Chuyển sang Phase 3 (SV hỏi)
                </Button>
              </Box>
            </Box>
          )}

          {phase === 3 && (
            <Box>
              <Box sx={{ mb: 2, p: 2, border: '1px solid #ddd', borderRadius: 2, textAlign: 'center', position: 'sticky', top: 0, zIndex: 10, bgcolor: 'white' }}>
                <Typography 
                  variant={{ xs: "h6", sm: "h5" }} 
                  color={timeLeft < 60 ? 'error' : 'primary'}
                  sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' }, mb: 1 }}
                >
                  Thời gian Debate: {formatTime(timeLeft)}
                </Typography>
                <Typography 
                  variant={{ xs: "body1", sm: "h6" }} 
                  sx={{ fontSize: { xs: '0.875rem', sm: '1.125rem' }, mb: 1 }}
                >
                  Phase 3: SV hỏi, AI trả lời
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
                  <Typography 
                    variant={{ xs: "body2", sm: "subtitle1" }}
                    sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, color: 'text.secondary' }}
                  >
                    Phase 2: {turnsPhase2.length} lượt
                  </Typography>
                  <Typography 
                    variant={{ xs: "body2", sm: "subtitle1" }}
                    sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, color: 'text.secondary' }}
                  >
                    Phase 3: {turnsPhase3.length} lượt
                  </Typography>
                </Box>
              </Box>
              
              {/* Phase 2 Summary - Collapsed */}
              {turnsPhase2.length > 0 && (
                <Paper sx={{ p: 2, mb: 2, bgcolor: '#fff3e0', borderRadius: 2 }}>
                  <Typography variant="subtitle1" color="orange" sx={{ fontWeight: 'bold', mb: 1 }}>
                    📋 Tóm tắt Phase 2 ({turnsPhase2.length} lượt - AI hỏi, SV trả lời):
                  </Typography>
                  <Box sx={{ maxHeight: 200, overflowY: 'auto' }}>
                    {(() => {
                      const conversationPairs = [];
                      let currentPair = null;
                      
                      turnsPhase2.forEach((turn, idx) => {
                        if (turn.asker === 'ai' && turn.question) {
                          currentPair = {
                            turnNumber: Math.floor(idx / 2) + 1,
                            aiQuestion: turn.question,
                            studentAnswer: null
                          };
                          conversationPairs.push(currentPair);
                        } else if (turn.asker === 'student' && turn.answer && currentPair) {
                          currentPair.studentAnswer = turn.answer;
                        }
                      });
                      
                      return conversationPairs.map((pair, idx) => (
                        <Paper key={idx} elevation={1} sx={{ p: 1, mb: 1, bgcolor: 'white', borderRadius: 1 }}>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                            Lượt {pair.turnNumber}: 
                          </Typography>
                          <Typography variant="body2" sx={{ display: 'inline', ml: 0.5 }}>
                            🤖 "{pair.aiQuestion?.substring(0, 60)}..." 
                            → 👥 "{pair.studentAnswer ? pair.studentAnswer.substring(0, 60) + '...' : '(Chưa trả lời)'}"
                          </Typography>
                        </Paper>
                      ));
                    })()}
                  </Box>
                </Paper>
              )}
              
              {/* Phase 3 Conversation */}
              <Paper sx={{ p: 2, mb: 2, bgcolor: '#e8f5e8', borderRadius: 2 }}>
                <Typography variant="h6" color="secondary" sx={{ fontWeight: 'bold', mb: 2, textAlign: 'center' }}>
                  🔄 Lượt hỏi đáp Phase 3 (Team chất vấn AI)
                </Typography>
                
                {turnsPhase3.length === 0 ? (
                  <Typography color="text.secondary" sx={{ textAlign: 'center', fontStyle: 'italic' }}>
                    Chưa có câu hỏi nào. Hãy đặt câu hỏi đầu tiên cho AI!
                  </Typography>
                ) : (
                  <Box sx={{ maxHeight: 500, overflowY: 'auto' }}>
                    {(() => {
                      // Group turns into pairs: student question + AI answer
                      const conversationPairs = [];
                      let currentQuestion = null;
                      
                      turnsPhase3.forEach((turn) => {
                        if (turn.asker === 'student' && turn.question) {
                          // Student question starts a new pair
                          currentQuestion = {
                            studentQuestion: turn.question,
                            aiAnswer: null
                          };
                          conversationPairs.push(currentQuestion);
                        } else if (turn.asker === 'ai' && turn.answer && currentQuestion) {
                          // AI answer completes the current pair
                          currentQuestion.aiAnswer = turn.answer;
                        }
                      });
                      
                      return conversationPairs.map((pair, idx) => (
                        <Paper key={idx} elevation={2} sx={{ p: 2, mb: 2, bgcolor: 'white', borderRadius: 2 }}>
                          {/* Student Question */}
                          <Box sx={{ mb: 2, p: 1.5, bgcolor: '#e8f5e8', borderRadius: 1, borderLeft: '4px solid #4caf50' }}>
                            <Typography variant="subtitle2" color="secondary" sx={{ fontWeight: 'bold', mb: 1 }}>
                              👥 Team hỏi:
                            </Typography>
                            <Typography 
                              variant="body1" 
                              sx={{ whiteSpace: 'pre-line', lineHeight: 1.6 }}
                              dangerouslySetInnerHTML={{ __html: formatAIResponse(pair.studentQuestion) }}
                            />
                          </Box>
                          
                          {/* AI Answer */}
                          <Box sx={{ p: 1.5, bgcolor: pair.aiAnswer ? '#e3f2fd' : '#fff3e0', borderRadius: 1, borderLeft: `4px solid ${pair.aiAnswer ? '#2196f3' : '#ff9800'}` }}>
                            <Typography variant="subtitle2" color={pair.aiAnswer ? 'primary' : 'warning'} sx={{ fontWeight: 'bold', mb: 1 }}>
                              🤖 AI trả lời:
                            </Typography>
                            {pair.aiAnswer ? (
                              <Typography 
                                variant="body1" 
                                sx={{ whiteSpace: 'pre-line', lineHeight: 1.6 }}
                                dangerouslySetInnerHTML={{ __html: formatAIResponse(pair.aiAnswer) }}
                              />
                            ) : (
                              <Typography variant="body1" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                                (Đang chờ AI trả lời...)
                              </Typography>
                            )}
                          </Box>
                        </Paper>
                      ));
                    })()}
                  </Box>
                )}
              </Paper>
              
              {/* Input for new question */}
              <Box sx={{ mb: 2 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Câu hỏi của Team cho AI"
                  value={currentAnswer}
                  onChange={e => setCurrentAnswer(e.target.value)}
                  sx={{ 
                    mb: 2,
                    '& .MuiInputBase-input': {
                      fontSize: '1.1rem',
                      lineHeight: 1.6
                    },
                    '& .MuiInputLabel-root': {
                      fontSize: '1.1rem'
                    }
                  }}
                  onPaste={e => { e.preventDefault(); return false; }}
                  onCopy={e => { e.preventDefault(); return false; }}
                  onCut={e => { e.preventDefault(); return false; }}
                  helperText="Chức năng sao chép, cắt, dán đã được vô hiệu hóa."
                />
                <Button
                  variant="contained"
                  onClick={() => handleSendStudentQuestion(currentAnswer)}
                  disabled={turnLoading || !currentAnswer.trim()}
                  sx={{ 
                    px: { xs: 2, sm: 3 },
                    py: { xs: 1, sm: 1.5 },
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                    width: { xs: '100%', sm: 'auto' }
                  }}
                >
                  {turnLoading ? 'Đang gửi...' : 'Gửi câu hỏi & Nhận câu trả lời từ AI'}
                </Button>
              </Box>
              
              <Box sx={{ mt: 2, p: 2, bgcolor: '#f0f0f0', borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Số lượt debate Phase 2: {turnsPhase2.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Số lượt debate Phase 3: {turnsPhase3.length}
                </Typography>
                <Typography variant="body2" color="primary" sx={{ mt: 1 }}>
                  Số lượt hỏi còn lại trong Phase 3: {Math.max(0, 5 - turnsPhase3.filter(t => t.asker === 'student' && t.question && !t.answer).length)}
                </Typography>
                <Button
                  variant="contained"
                  color="success"
                  sx={{ 
                    mt: 1, 
                    px: { xs: 2, sm: 3 },
                    py: { xs: 1, sm: 1.5 },
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                    width: { xs: '100%', sm: 'auto' }
                  }}
                  onClick={() => {
                    setPhase(4);
                    // Chỉ chuyển phase, không gọi evaluation
                  }}
                >
                  Chuyển sang Phase 4 (Kết luận)
                </Button>
              </Box>
            </Box>
          )}

          {phase === 4 && !evaluation && (
            <Paper sx={{ p: 4, mt: 3, borderRadius: '16px' }}>
              <Box sx={{ mb: 2, p: 2, border: '1px solid #ddd', borderRadius: 2, textAlign: 'center', position: 'sticky', top: 0, zIndex: 10, bgcolor: 'white' }}>
                <Typography 
                  variant={{ xs: "h6", sm: "h5" }} 
                  color={timeLeft < 60 ? 'error' : 'primary'}
                  sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' }, mb: 1 }}
                >
                  ⏳ Thời gian còn lại: {formatTime(timeLeft)}
                </Typography>
                {timeLeft <= 0 && (
                  <Typography color="error" variant="subtitle1">
                    Hết giờ! Vui lòng nộp kết luận ngay.
                  </Typography>
                )}
              </Box>

              <Box sx={{ 
                p: 3, 
                mb: 3, 
                bgcolor: stance === 'ĐỒNG TÌNH' ? '#e8f5e9' : '#ffebee',
                borderRadius: 2,
                border: `2px solid ${stance === 'ĐỒNG TÌNH' ? '#4caf50' : '#f44336'}`
              }}>
                <Typography variant="h6" align="center" sx={{ mb: 2 }}>
                  Chủ đề: {topic}
                </Typography>
                
                <Typography variant="h6" align="center" sx={{
                  color: stance === 'ĐỒNG TÌNH' ? '#2e7d32' : '#d32f2f',
                  fontWeight: 'bold'
                }}>
                  Lập trường của nhóm: {stance} {stance === 'ĐỒNG TÌNH' ? '✅' : '❌'}
                </Typography>
              </Box>

              <Typography 
                variant={{ xs: "h6", sm: "h5" }} 
                gutterBottom 
                align="center" 
                color="primary" 
                sx={{ 
                  fontWeight: 600,
                  fontSize: { xs: '1.25rem', sm: '1.5rem' }
                }}
              >
                🎯 Phase 4: Tổng kết luận điểm
              </Typography>
              <Typography variant="body1" sx={{ mb: 3, textAlign: 'center', color: '#666' }}>
                Trình bày tại sao quan điểm {stance} của nhóm là đúng đắn
              </Typography>

              <TextField
                fullWidth
                multiline
                rows={6}
                label={`Kết luận ${stance} của nhóm`}
                value={studentArguments[0] || ''}
                onChange={(e) => {
                  const newArgs = [...studentArguments];
                  newArgs[0] = e.target.value;
                  setStudentArguments(newArgs);
                }}
                sx={{ mb: 3 }}
                disabled={timeLeft <= 0}
                helperText="Tối thiểu 100 ký tự"
              />

              {/* Phase 4 Action Buttons */}
              <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' }, mb: 3 }}>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={handleAICounterConclusion}
                  disabled={
                    loading || 
                    !isValidContent(studentArguments[0]) || 
                    (studentArguments[0] && studentArguments[0].length < 100)
                  }
                  sx={{ flex: 1 }}
                >
                  🤖 Lấy luận điểm phản bác của AI
                </Button>
                
                <Button
                  variant="contained"
                  color="success"
                  onClick={handleEvaluation}
                  disabled={
                    loading || 
                    !isValidContent(studentArguments[0]) || 
                    (studentArguments[0] && studentArguments[0].length < 100)
                  }
                  sx={{ flex: 1 }}
                >
                  📊 Chấm điểm Debate
                </Button>
              </Box>

              {/* Display AI Counter Arguments if available */}
              {aiCounterArguments && aiCounterArguments.length > 0 && (
                <Paper sx={{ p: 3, mb: 3, bgcolor: '#ffebee', borderRadius: 2 }}>
                  <Typography variant="h6" color="error" gutterBottom sx={{ fontWeight: 'bold' }}>
                    🤖 Luận điểm phản bác của AI:
                  </Typography>
                  {aiCounterArguments.map((arg, idx) => (
                    <Typography 
                      key={idx} 
                      variant="body1" 
                      sx={{ mb: 2, lineHeight: 1.6 }}
                      dangerouslySetInnerHTML={{ __html: formatAIResponse(arg) }}
                    />
                  ))}
                </Paper>
              )}
            </Paper>
          )}

          {(phase === 4 || phase === 5) && evaluation && (
            <Paper sx={{ p: { xs: 2, md: 4 }, mt: 4, background: 'rgba(255, 255, 255, 0.98)', borderRadius: '20px', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)' }}>
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, color: '#1d1d1f', textAlign: 'center' }}>
                Kết quả Debate Chi tiết
              </Typography>

              {/* Warning box about submitting results */}
              <Box sx={{ 
                mb: 4, 
                p: 3, 
                bgcolor: '#e3f2fd', 
                borderRadius: 2,
                border: '1px solid #2196f3',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 2
              }}>
                <Box sx={{ 
                  width: 40, 
                  height: 40, 
                  borderRadius: '50%', 
                  bgcolor: '#2196f3',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '20px'
                }}>
                  📋
                </Box>
                <Box>
                  <Typography variant="subtitle1" sx={{ color: '#1565c0', fontWeight: 600, mb: 0.5 }}>
                    Lưu ý quan trọng về nộp bài!
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#0d47a1' }}>
                    Để tự động nộp bài và lưu kết quả debate của bạn, vui lòng bấm nút "Về trang chủ" ở cuối trang. 
                    Không nên thoát trực tiếp hoặc đóng trình duyệt mà không bấm nút này.
                  </Typography>
                </Box>
              </Box>

              {/* Existing evaluation display */}
              {evaluation.scores && Object.entries(evaluation.scores).map(([phase, scores]) => {
                if (phase === 'phase1' || phase === 'phase2' || phase === 'phase3' || phase === 'phase4') {
                  const phaseTitle = phase === 'phase1' ? 'Giai đoạn 1: Luận điểm ban đầu' :
                                   phase === 'phase2' ? 'Giai đoạn 2: AI chất vấn SV' :
                                   phase === 'phase3' ? 'Giai đoạn 3: SV chất vấn AI' :
                                   'Giai đoạn 4: Tổng kết luận điểm';
                  
                  // Tính tổng điểm cho phase hiện tại
                  const phaseScores = Object.values(scores || {});
                  const phaseTotal = phaseScores.reduce((sum, score) => sum + (parseInt(score) || 0), 0);
                  const maxScore = 25; // Mỗi phase 25 điểm
                  
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
                      
                      {phase === 'phase2' && (
                        <>
                          <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 1, mb: 1 }}>
                            <Typography>Hiểu biết & nhận thức</Typography>
                            <Typography sx={{ textAlign: 'center' }}>{scores['2.1'] || 0}</Typography>
                            <Typography sx={{ textAlign: 'center' }}>5</Typography>
                          </Box>
                          <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 1, mb: 1 }}>
                            <Typography>Tư duy phản biện</Typography>
                            <Typography sx={{ textAlign: 'center' }}>{scores['2.2'] || 0}</Typography>
                            <Typography sx={{ textAlign: 'center' }}>5</Typography>
                          </Box>
                          <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 1, mb: 1 }}>
                            <Typography>Ngôn ngữ & thuật ngữ</Typography>
                            <Typography sx={{ textAlign: 'center' }}>{scores['2.3'] || 0}</Typography>
                            <Typography sx={{ textAlign: 'center' }}>5</Typography>
                          </Box>
                          <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 1, mb: 1 }}>
                            <Typography>Chiến lược & điều hướng</Typography>
                            <Typography sx={{ textAlign: 'center' }}>{scores['2.4'] || 0}</Typography>
                            <Typography sx={{ textAlign: 'center' }}>5</Typography>
                          </Box>
                          <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 1, mb: 1 }}>
                            <Typography>Văn hóa – xã hội</Typography>
                            <Typography sx={{ textAlign: 'center' }}>{scores['2.5'] || 0}</Typography>
                            <Typography sx={{ textAlign: 'center' }}>5</Typography>
                          </Box>
                        </>
                      )}
                      

                      {phase === 'phase3' && (
                        <>
                          <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 1, mb: 1 }}>
                            <Typography>Hiểu biết & nhận thức</Typography>
                            <Typography sx={{ textAlign: 'center' }}>{scores['3.1'] || 0}</Typography>
                            <Typography sx={{ textAlign: 'center' }}>5</Typography>
                          </Box>
                          <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 1, mb: 1 }}>
                            <Typography>Tư duy phản biện</Typography>
                            <Typography sx={{ textAlign: 'center' }}>{scores['3.2'] || 0}</Typography>
                            <Typography sx={{ textAlign: 'center' }}>5</Typography>
                          </Box>
                          <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 1, mb: 1 }}>
                            <Typography>Ngôn ngữ & thuật ngữ</Typography>
                            <Typography sx={{ textAlign: 'center' }}>{scores['3.3'] || 0}</Typography>
                            <Typography sx={{ textAlign: 'center' }}>4</Typography>
                          </Box>
                          <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 1, mb: 1 }}>
                            <Typography>Chiến lược & điều hướng</Typography>
                            <Typography sx={{ textAlign: 'center' }}>{scores['3.4'] || 0}</Typography>
                            <Typography sx={{ textAlign: 'center' }}>4</Typography>
                          </Box>
                          <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 1, mb: 1 }}>
                            <Typography>Văn hóa – xã hội</Typography>
                            <Typography sx={{ textAlign: 'center' }}>{scores['3.5'] || 0}</Typography>
                            <Typography sx={{ textAlign: 'center' }}>3</Typography>
                          </Box>
                          <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 1, mb: 1 }}>
                            <Typography>Đạo đức & đối thoại</Typography>
                            <Typography sx={{ textAlign: 'center' }}>{scores['3.6'] || 0}</Typography>
                            <Typography sx={{ textAlign: 'center' }}>4</Typography>
                          </Box>
                        </>
                      )}

                      {phase === 'phase4' && (
                        <>
                          <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 1, mb: 1 }}>
                            <Typography>Hiểu biết & hệ thống</Typography>
                            <Typography sx={{ textAlign: 'center' }}>{scores['4.1'] || 0}</Typography>
                            <Typography sx={{ textAlign: 'center' }}>5</Typography>
                          </Box>
                          <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 1, mb: 1 }}>
                            <Typography>Tư duy phân biện</Typography>
                            <Typography sx={{ textAlign: 'center' }}>{scores['4.2'] || 0}</Typography>
                            <Typography sx={{ textAlign: 'center' }}>5</Typography>
                          </Box>
                          <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 1, mb: 1 }}>
                            <Typography>Ngôn ngữ lập luận</Typography>
                            <Typography sx={{ textAlign: 'center' }}>{scores['4.3'] || 0}</Typography>
                            <Typography sx={{ textAlign: 'center' }}>4</Typography>
                          </Box>
                          <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 1, mb: 1 }}>
                            <Typography>Sáng tạo & thuyết phục</Typography>
                            <Typography sx={{ textAlign: 'center' }}>{scores['4.4'] || 0}</Typography>
                            <Typography sx={{ textAlign: 'center' }}>4</Typography>
                          </Box>
                          <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 1, mb: 1 }}>
                            <Typography>Văn hóa - xã hội</Typography>
                            <Typography sx={{ textAlign: 'center' }}>{scores['4.5'] || 0}</Typography>
                            <Typography sx={{ textAlign: 'center' }}>3</Typography>
                          </Box>
                          <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 1, mb: 1 }}>
                            <Typography>Đạo đức & trách nhiệm</Typography>
                            <Typography sx={{ textAlign: 'center' }}>{scores['4.6'] || 0}</Typography>
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
                  .filter(([phase]) => phase === 'phase1' || phase === 'phase2' || phase === 'phase3' || phase === 'phase4')
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
