from fastapi import FastAPI, WebSocket, HTTPException, Body, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any
import json
import traceback
from datetime import datetime, timezone
from urllib.parse import unquote
from debate_system import DebateSession, DebateSystem, DEBATE_CRITERIA
from fastapi.responses import FileResponse
from docx import Document
from docx.shared import Pt, Inches
from docx.enum.text import WD_ALIGN_PARAGRAPH
import io
from starlette.responses import StreamingResponse
import re
import os
from pymongo import MongoClient

app = FastAPI()
api_router = APIRouter(prefix="/api")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
mongo_client = MongoClient(MONGO_URI)
mongo_db = mongo_client["debate_db"]
mongo_sessions = mongo_db["sessions"]
  
# Store active and completed debate sessions
active_sessions: Dict[str, DebateSession] = {}
completed_sessions: Dict[str, Dict[str, Any]] = {}

# Tự động load lại session từ MongoDB khi backend khởi động
for session_data in mongo_sessions.find():
    session = DebateSession()
    session.__dict__.update(session_data)
    active_sessions[session.team_id] = session

def save_sessions():
    serializable = {k: v.__dict__ for k, v in active_sessions.items()}
    with open(SESSIONS_FILE, "w", encoding="utf-8") as f:
        json.dump(serializable, f, ensure_ascii=False, indent=2)

def load_sessions():
    if not os.path.exists(SESSIONS_FILE):
        return
    with open(SESSIONS_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)
        for k, v in data.items():
            session = DebateSession()
            session.__dict__.update(v)
            active_sessions[k] = session

class DebateTeam(BaseModel):
    team_id: str
    members: List[str]
    course_code: str

class DebateResponse(BaseModel):
    message: str
    data: Optional[Dict] = None

class TeamArguments(BaseModel):
    team_arguments: List[str]

class TeamResponses(BaseModel):
    team_responses: List[str]

class DebateTurn(BaseModel):
    asker: str  # 'ai' hoặc 'student'
    question: str
    answer: Optional[str] = None

class DebateSummary(BaseModel):
    student_summary: str

class PhaseUpdateRequest(BaseModel):
    phase: str

class EndSessionPayload(BaseModel):
    reason: Optional[str] = None

@api_router.post("/debate/start")
async def start_debate(team: DebateTeam):
    try:
        # Check if team_id already exists in active or completed sessions
        if team.team_id in active_sessions or team.team_id in completed_sessions:
            raise HTTPException(
                status_code=409,
                detail=f"Tên đội '{team.team_id}' đã tồn tại. Vui lòng chọn một tên khác."
            )

        session = DebateSession()
        topic = session.start_debate(
            course_code=team.course_code, 
            members=team.members
        )
        active_sessions[team.team_id] = session
        session.team_id = team.team_id
        
        # Create serializable version for MongoDB (exclude non-serializable objects)
        session_data = {k: v for k, v in session.__dict__.items() if k != 'debate_system'}
        session_data['team_id'] = session.team_id
        mongo_sessions.replace_one({"team_id": session.team_id}, session_data, upsert=True)
        
        return DebateResponse(
            message="Debate started successfully",
            data={
                "topic": topic,
                "team_id": team.team_id
            }
        )
    except HTTPException as http_exc:
        raise http_exc # Re-raise known HTTP exceptions
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/debate/{team_id}/info")
async def get_debate_info(team_id: str):
    decoded_team_id = unquote(team_id)
    if decoded_team_id not in active_sessions:
        session_data = mongo_sessions.find_one({"team_id": decoded_team_id})
        if session_data:
            session = DebateSession()
            session.__dict__.update(session_data)
            active_sessions[decoded_team_id] = session
        else:
            raise HTTPException(status_code=404, detail="Debate session not found")
    session = active_sessions[decoded_team_id]
    return {
        "topic": session.topic,
        "members": session.members,
        "course_code": session.course_code,
        "team_id": decoded_team_id
    }

@api_router.post("/debate/{team_id}/phase")
async def update_phase(team_id: str, request: PhaseUpdateRequest):
    decoded_team_id = unquote(team_id)
    if decoded_team_id not in active_sessions:
        raise HTTPException(status_code=404, detail="Debate session not found")
    session = active_sessions[decoded_team_id]
    session.current_phase = request.phase
    return {"message": f"Phase updated to {request.phase}"}

@api_router.post("/debate/{team_id}/phase1")
async def phase1_arguments(team_id: str):
    decoded_team_id = unquote(team_id)
    if decoded_team_id not in active_sessions:
        raise HTTPException(status_code=404, detail="Debate session not found")
    
    session = active_sessions[decoded_team_id]
    ai_arguments = session.phase1_arguments()
    
    return DebateResponse(
        message="Phase 1 arguments generated",
        data={"ai_arguments": ai_arguments}
    )

@api_router.post("/debate/{team_id}/phase2")
async def phase2_questions(team_id: str, args: TeamArguments):
    decoded_team_id = unquote(team_id)
    if decoded_team_id not in active_sessions:
        raise HTTPException(status_code=404, detail="Debate session not found")
    
    session = active_sessions[decoded_team_id]
    session.team_arguments = args.team_arguments
    questions = session.phase2_questions()
    
    return DebateResponse(
        message="Phase 2 questions generated",
        data={"questions": questions}
    )

@api_router.post("/debate/{team_id}/phase3/summary")
async def phase3_summary_text(team_id: str, summary: DebateSummary):
    """Phase 3: Tóm tắt quan điểm trước khi kết luận"""
    decoded_team_id = unquote(team_id)
    if decoded_team_id not in active_sessions:
        raise HTTPException(status_code=404, detail="Debate session not found")
    session = active_sessions[decoded_team_id]
    session.student_summary = summary.student_summary
    # Sinh tóm tắt AI dựa trên lịch sử debate
    turns_text = "\n".join([
        f"Lượt {t['turn']}: {t['asker']} hỏi: {t['question']} | trả lời: {t['answer']}" for t in session.turns
    ])
    ai_prompt = f"""
Bạn là AI debate. Dựa trên chủ đề: {session.topic}, lịch sử debate sau (dạng hỏi đáp):\n{turns_text}\nHãy tóm tắt lại quan điểm, luận điểm của bạn (AI) và nêu lý do vì sao bạn xứng đáng chiến thắng. Tóm tắt ngắn gọn, rõ ràng, không giải thích ngoài nội dung tóm tắt.
"""
    print("[DEBUG] Prompt gửi lên Gemini:", ai_prompt)
    ai_response = session.debate_system.model.invoke(ai_prompt)
    print("[DEBUG] Response từ Gemini:", ai_response)
    ai_content = ai_response.content
    if isinstance(ai_content, list):
        session.ai_summary = " ".join(map(str, ai_content)).strip()
    else:
        session.ai_summary = str(ai_content).strip()
    session.chat_history.append({"phase": 3, "role": "ai", "content": f"Summary: {session.ai_summary}"})

    return {"message": "Summaries submitted", "ai_summary": session.ai_summary}

@api_router.post("/debate/{team_id}/phase2/start")
async def start_phase2(team_id: str):
    """Generates the first AI question to officially start Phase 2."""
    decoded_team_id = unquote(team_id)
    if decoded_team_id not in active_sessions:
        raise HTTPException(status_code=404, detail="Active session not found")
    session = active_sessions[decoded_team_id]
    try:
        print("[DEBUG] /phase2/start called for team_id:", team_id)
        print("[DEBUG] session.team_arguments:", session.team_arguments)
        print("[DEBUG] session.turns:", session.turns)
        # Chỉ thực hiện nếu chưa có lượt nào
        if not session.turns:
            # Generate AI questions based on student's arguments
            if not session.team_arguments or not isinstance(session.team_arguments, list) or len(session.team_arguments) < 1:
                raise HTTPException(status_code=400, detail="Cần ít nhất 1 luận điểm nhóm để bắt đầu phase 2.")
            questions = session.phase2_questions() # Tạo và lưu câu hỏi vào session
            if not questions or len(questions) == 0:
                raise HTTPException(status_code=500, detail="AI không thể tạo câu hỏi. Hãy kiểm tra lại cấu hình AI hoặc nội dung luận điểm.")
            first_question = session.questions.pop(0)
            # Thêm lượt đầu tiên do AI khởi xướng
            session.add_turn(asker="ai", question=first_question, answer=None)
        # Chỉ trả về message và turns, không trả về mảng questions/data
        return {"message": "Phase 2 started. AI asks first.", "turns": session.turns}
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        import traceback
        tb = traceback.format_exc()
        print("[ERROR] /phase2/start exception:", str(e))
        print("[ERROR] Traceback:", tb)
        raise HTTPException(status_code=500, detail=f"Lỗi hệ thống khi khởi tạo phase 2: {str(e)}\n{tb}")

@api_router.post("/debate/{team_id}/phase4/evaluate")
async def run_phase4_evaluation(team_id: str):
    """Phase 4: Kết luận và đánh giá debate"""
    decoded_team_id = unquote(team_id)
    if decoded_team_id not in active_sessions:
        raise HTTPException(status_code=404, detail="Active session not found")
    
    session = active_sessions[decoded_team_id]
    session.current_phase = "Phase 4: Evaluation"

    # The core of the debate evaluation
    evaluation_result = session.evaluate_debate()
    session.evaluation = evaluation_result

    return {"message": "Debate evaluated successfully", "data": {"evaluation": evaluation_result}}

@api_router.post("/debate/{team_id}/ai-question/turn")
async def ai_question_turn(team_id: str, turn: DebateTurn):
    """Phase 2: AI chất vấn sinh viên"""
    decoded_team_id = unquote(team_id)
    if decoded_team_id not in active_sessions:
        raise HTTPException(status_code=404, detail="Debate session not found")
    session = active_sessions[decoded_team_id]

    # Kiểm tra đã khởi tạo phase 2 chưa
    if not session.turns or session.turns[0]['asker'] != 'ai':
        raise HTTPException(status_code=400, detail="Chưa khởi tạo phase 2. Hãy gọi /phase2/start trước.")

    # Đếm số lượt AI hỏi (SV trả lời) ở phase 2
    ai_question_turns = [t for t in session.turns if t['asker'] == 'ai']
    if len(ai_question_turns) >= 5:
        raise HTTPException(status_code=400, detail="Đã hết lượt debate phase 2 (tối đa 5 câu hỏi AI).")

    # Lưu lượt debate
    session.add_turn(turn.asker, turn.question, turn.answer)

    # Nếu đến lượt AI hỏi, sinh câu hỏi Socrates mới
    next_question = None
    if turn.asker == "student":
        previous_context = ""
        for t in session.turns[-3:]:
            previous_context += f"Lượt {t['turn']}: {t['asker']} - {t.get('question', '')} | {t.get('answer', '')}\n"
        questions = session.debate_system.generate_questions(
            [turn.answer] if turn.answer else [],
            session.topic
        )
        if questions:
            next_question = questions[0]
            session.add_turn("ai", next_question)

    return {"turns": session.turns, "next_question": next_question}

@api_router.post("/debate/{team_id}/student-question/turn")
async def student_question_turn(team_id: str, turn: DebateTurn):
    """Phase 3: Sinh viên chất vấn AI"""
    decoded_team_id = unquote(team_id)
    if decoded_team_id not in active_sessions:
        raise HTTPException(status_code=404, detail="Debate session not found")
    session = active_sessions[decoded_team_id]

    # Đếm số lượt SV hỏi ở phase 3 (chỉ đếm các lượt có question, không đếm các lượt trả lời)
    student_question_turns = [t for t in session.turns if t['asker'] == 'student' and t.get('question') and not t.get('answer')]
    if len(student_question_turns) >= 5:
        raise HTTPException(status_code=400, detail="Đã hết lượt debate phase 3 (tối đa 5 câu hỏi SV).")

    # Lưu lượt debate
    session.add_turn(turn.asker, turn.question, turn.answer)

    # Nếu sinh viên hỏi, AI trả lời theo phương pháp Socratic
    ai_answer = None
    if turn.asker == "student" and turn.question:
        previous_context = ""
        for t in session.turns[-3:]:
            previous_context += f"Lượt {t['turn']}: {t['asker']} - {t.get('question', '')} | {t.get('answer', '')}\n"
        ai_answer = session.debate_system.generate_socratic_answer(
            student_question=turn.question,
            topic=session.topic,
            previous_context=previous_context
        )
        session.add_turn("ai", "Response", ai_answer)

    return {"turns": session.turns, "ai_answer": ai_answer}

@api_router.websocket("/ws/debate/{team_id}")
async def websocket_endpoint(websocket: WebSocket, team_id: str):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            # Handle real-time debate updates
            await websocket.send_text(json.dumps({
                "type": "update",
                "data": "Processing..."
            }))
    except Exception as e:
        await websocket.close()

@api_router.get("/debate/{team_id}/history")
async def get_debate_history(team_id: str):
    decoded_team_id = unquote(team_id)
    if decoded_team_id not in active_sessions:
        raise HTTPException(status_code=404, detail="Debate session not found")
    session = active_sessions[decoded_team_id]
    return {"chat_history": session.chat_history}

@api_router.delete("/debate/{team_id}/end")
async def end_session(team_id: str, payload: Optional[EndSessionPayload] = None):
    """Ends a session, saves it with a status, and moves it to completed."""
    decoded_team_id = unquote(team_id)
    if decoded_team_id in active_sessions:
        session = active_sessions.pop(decoded_team_id)
        
        status = "Hoàn thành"
        if payload and payload.reason:
            status = payload.reason

        completed_sessions[decoded_team_id] = {
            "team_id": decoded_team_id,
            "topic": session.topic,
            "members": session.members,
            "evaluation": session.evaluation,
            "completed_at": datetime.now().isoformat(),
            "chat_history": session.chat_history,
            "status": status,
        }
        mongo_sessions.delete_one({"team_id": decoded_team_id})
        return {"message": f"Session for team {decoded_team_id} has been ended with status: {status}"}
    
    raise HTTPException(status_code=404, detail="Active session not found")

@api_router.delete("/admin/history/{team_id}")
async def delete_history(team_id: str):
    """Deletes a specific session from the completed sessions history."""
    decoded_team_id = unquote(team_id)
    if decoded_team_id in completed_sessions:
        del completed_sessions[decoded_team_id]
        return {"message": f"History for team {decoded_team_id} has been deleted."}
    
    raise HTTPException(status_code=404, detail="Team ID not found in history.")

@api_router.get("/admin/sessions")
async def get_admin_sessions():
    """Returns a list of active and completed sessions for the admin dashboard."""
    active_session_summaries = {}
    for team_id, session in active_sessions.items():
        active_session_summaries[team_id] = {
            "team_id": team_id,
            "topic": session.topic,
            "course_code": session.course_code,
            "members": session.members,
            "current_phase": session.current_phase,
            "turns_taken": len(session.turns)
        }
    
    # Sort completed sessions by completion time, newest first
    sorted_completed_sessions = dict(sorted(
        completed_sessions.items(), 
        key=lambda item: item[1]['completed_at'], 
        reverse=True
    ))

    return {
        "active": list(active_session_summaries.values()),
        "completed": list(sorted_completed_sessions.values()),
        "criteria": DEBATE_CRITERIA
    }

@api_router.get("/admin/live-scoring")
async def get_live_scoring():
    """Returns live scoring data for active sessions."""
    live_scoring_data = []
    
    for team_id, session in active_sessions.items():
        # Calculate current scores for completed phases
        current_scores = {
            "phase1": 0,
            "phase2A": 0, 
            "phase2B": 0,
            "phase3": 0
        }
        
        evaluation = getattr(session, 'evaluation', None)
        if evaluation and evaluation.get('scores'):
            for phase_key, criteria_list in DEBATE_CRITERIA.items():
                phase_scores = evaluation["scores"].get(phase_key, {})
                current_scores[phase_key] = sum(phase_scores.values())
        
        # Calculate total current score
        total_current_score = sum(current_scores.values())
        total_max_score = 100  # 25 per phase
        
        # Calculate percentage
        percentage = (total_current_score / total_max_score * 100) if total_max_score > 0 else 0
        
        # Get current phase status
        current_phase = getattr(session, 'current_phase', 'Preparing')
        
        # Determine which phases are completed based on current phase
        phases_status = {
            "phase1": "pending",
            "phase2A": "pending", 
            "phase2B": "pending",
            "phase3": "pending"
        }
        
        # Phase 1 completed when not in preparation
        if not ("Preparing" in current_phase):
            phases_status["phase1"] = "completed"
        
        # Phase 2A & 2B completed when in Phase 3 or 4
        if "Phase 3" in current_phase or "Phase 4" in current_phase:
            phases_status["phase2A"] = "completed"
            phases_status["phase2B"] = "completed"
        
        # Phase 3 (Conclusion) completed when in Phase 4 (Evaluation)
        if "Phase 4" in current_phase:
            phases_status["phase3"] = "completed"
        
        live_entry = {
            "team_id": team_id,
            "topic": session.topic,
            "members": session.members,
            "course_code": getattr(session, 'course_code', 'N/A'),
            "current_phase": current_phase,
            "total_current_score": total_current_score,
            "max_score": total_max_score,
            "percentage": round(percentage, 1),
            "phase_scores": current_scores,
            "phases_status": phases_status,
            "started_at": getattr(session, 'start_time', datetime.now()).isoformat()
        }
        live_scoring_data.append(live_entry)
    
    # Sort by total current score (descending)
    live_scoring_data.sort(key=lambda x: x["total_current_score"], reverse=True)
    
    # Add temporary ranking positions
    for i, entry in enumerate(live_scoring_data):
        entry["position"] = i + 1
    
    # Calculate live statistics
    statistics = {
        "active_teams": len(live_scoring_data),
        "average_score": round(sum(entry["total_current_score"] for entry in live_scoring_data) / len(live_scoring_data), 1) if live_scoring_data else 0,
        "highest_score": max(entry["total_current_score"] for entry in live_scoring_data) if live_scoring_data else 0,
        "phases_distribution": {
            "Preparing": len([e for e in live_scoring_data if "Preparing" in e["current_phase"]]),
            "Phase 1": len([e for e in live_scoring_data if "Phase 1" in e["current_phase"]]),
            "Phase 2": len([e for e in live_scoring_data if "Phase 2" in e["current_phase"]]),
            "Phase 3": len([e for e in live_scoring_data if "Phase 3" in e["current_phase"]]),
            "Phase 4": len([e for e in live_scoring_data if "Phase 4" in e["current_phase"]])
        }
    }
    
    return {
        "live_scoring": live_scoring_data,
        "statistics": statistics
    }

@api_router.get("/admin/leaderboard")
async def get_leaderboard():
    """Returns leaderboard data with rankings based on total scores."""
    leaderboard_data = []
    
    for team_id, session in completed_sessions.items():
        evaluation = session.get("evaluation")
        if not evaluation or not evaluation.get("scores"):
            continue
            
        # Calculate total score
        total_score = 0
        total_max_score = 0
        
        for phase_key, criteria_list in DEBATE_CRITERIA.items():
            phase_scores = evaluation["scores"].get(phase_key, {})
            for criterion in criteria_list:
                score = phase_scores.get(criterion['id'], 0)
                max_score = criterion['max_score']
                total_score += score
                total_max_score += max_score
        
        # Calculate percentage
        percentage = (total_score / total_max_score * 100) if total_max_score > 0 else 0
        
        # Determine rank level
        rank_level = "🥉 Bronze"
        if percentage >= 90:
            rank_level = "🏆 Platinum"
        elif percentage >= 80:
            rank_level = "🥇 Gold"
        elif percentage >= 70:
            rank_level = "🥈 Silver"
        
        leaderboard_entry = {
            "team_id": team_id,
            "topic": session.get("topic", "N/A"),
            "members": session.get("members", []),
            "course_code": session.get("course_code", "N/A"),
            "total_score": total_score,
            "max_score": total_max_score,
            "percentage": round(percentage, 1),
            "rank_level": rank_level,
            "completed_at": session.get("completed_at"),
            "phase_scores": {
                "phase1": sum(evaluation["scores"].get("phase1", {}).values()),
                "phase2A": sum(evaluation["scores"].get("phase2A", {}).values()),
                "phase2B": sum(evaluation["scores"].get("phase2B", {}).values()),
                "phase3": sum(evaluation["scores"].get("phase3", {}).values())
            }
        }
        leaderboard_data.append(leaderboard_entry)
    
    # Sort by total score (descending) and then by completion time (recent first)
    leaderboard_data.sort(key=lambda x: (x["total_score"], x["completed_at"]), reverse=True)
    
    # Add ranking positions
    for i, entry in enumerate(leaderboard_data):
        entry["position"] = i + 1
    
    # Calculate statistics
    statistics = {
        "total_teams": len(leaderboard_data),
        "average_score": round(sum(entry["total_score"] for entry in leaderboard_data) / len(leaderboard_data), 1) if leaderboard_data else 0,
        "highest_score": max(entry["total_score"] for entry in leaderboard_data) if leaderboard_data else 0,
        "rank_distribution": {
            "🏆 Platinum": len([e for e in leaderboard_data if e["percentage"] >= 90]),
            "🥇 Gold": len([e for e in leaderboard_data if 80 <= e["percentage"] < 90]),
            "🥈 Silver": len([e for e in leaderboard_data if 70 <= e["percentage"] < 80]),
            "🥉 Bronze": len([e for e in leaderboard_data if e["percentage"] < 70])
        }
    }
    
    return {
        "leaderboard": leaderboard_data,
        "statistics": statistics
    }

@api_router.get("/debate/{team_id}/export_docx")
async def export_docx(team_id: str):
    decoded_team_id = unquote(team_id)
    if decoded_team_id not in completed_sessions:
        raise HTTPException(status_code=404, detail="Completed session not found")

    session_data = completed_sessions[decoded_team_id]
    
    # Defensive check for evaluation data
    evaluation = session_data.get("evaluation")
    if not evaluation:
        evaluation = {
            "feedback": "No evaluation data available for this session.",
            "scores": {}
        }

    doc = Document()
    doc.add_heading('Debate Result Details', level=1)

    # --- Basic Info ---
    doc.add_heading('Session Information', level=2)
    doc.add_paragraph(f"Team ID: {session_data.get('team_id', 'N/A')}")
    doc.add_paragraph(f"Topic: {session_data.get('topic', 'N/A')}")
    doc.add_paragraph(f"Members: {', '.join(session_data.get('members', []))}")
    if session_data.get('completed_at'):
        completed_time = datetime.fromisoformat(session_data['completed_at']).strftime('%Y-%m-%d %H:%M:%S')
        doc.add_paragraph(f"Completed At: {completed_time}")

    # --- AI Feedback ---
    doc.add_heading('Overall Feedback from AI', level=2)
    doc.add_paragraph(evaluation.get("feedback", "No feedback provided."))

    # --- Detailed Scores ---
    doc.add_heading('Detailed Scores', level=2)
    
    total_score = 0
    total_max_score = 0

    for phase_key, criteria_list in DEBATE_CRITERIA.items():
        phase_scores = evaluation.get(phase_key, {})
        phase_name = {
            "phase1": "Phase 1: Luận điểm ban đầu",
            "phase2A": "Phase 2A: AI hỏi, SV trả lời", 
            "phase2B": "Phase 2B: SV hỏi, AI trả lời",
            "phase3": "Phase 3: Kết luận & Tổng hợp"
        }.get(phase_key, phase_key)

        doc.add_heading(phase_name, level=3)
        
        table = doc.add_table(rows=1, cols=3)
        table.style = 'Table Grid'
        hdr_cells = table.rows[0].cells
        hdr_cells[0].text = 'Criteria'
        hdr_cells[1].text = 'Score'
        hdr_cells[2].text = 'Max Score'

        phase_total = 0
        phase_max_total = 0

        for criterion in criteria_list:
            score = phase_scores.get(criterion['id'], 0)
            max_score = criterion['max_score']
            row_cells = table.add_row().cells
            row_cells[0].text = criterion['name']
            row_cells[1].text = str(score)
            row_cells[2].text = str(max_score)
            phase_total += score
            phase_max_total += max_score
        
        # Add phase total row
        total_row = table.add_row().cells
        total_row[0].text = 'Phase Total'
        total_row[0].paragraphs[0].runs[0].font.bold = True
        total_row[1].text = str(phase_total)
        total_row[1].paragraphs[0].runs[0].font.bold = True
        total_row[2].text = str(phase_max_total)
        total_row[2].paragraphs[0].runs[0].font.bold = True
        
        total_score += phase_total
        total_max_score += phase_max_total

    # --- Grand Total ---
    doc.add_heading('Final Score', level=2)
    doc.add_paragraph(f"Grand Total: {total_score} / {total_max_score}")

    # --- Chat History ---
    doc.add_heading('Debate History', level=2)
    chat_history = session_data.get("chat_history", [])
    if chat_history:
        for item in chat_history:
            doc.add_paragraph(f"[{item.get('phase', 'N/A')}] {item.get('role', 'N/A')}: {item.get('content', '')}", style='Intense Quote')
    else:
        doc.add_paragraph("No chat history was recorded.")


    # --- Save to memory and return ---
    f = io.BytesIO()
    doc.save(f)
    f.seek(0)
    
    return StreamingResponse(f, media_type='application/vnd.openxmlformats-officedocument.wordprocessingml.document', headers={'Content-Disposition': f'attachment; filename="debate_result_{decoded_team_id}.docx"'})

app.include_router(api_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000, reload=True) 