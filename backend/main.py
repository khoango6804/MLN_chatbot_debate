from fastapi import FastAPI, WebSocket, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any
import json
import traceback
from datetime import datetime, timezone
from debate_system import DebateSession, DebateSystem, DEBATE_CRITERIA
from fastapi.responses import FileResponse
from docx import Document
from docx.shared import Pt, Inches
from docx.enum.text import WD_ALIGN_PARAGRAPH
import io
from starlette.responses import StreamingResponse

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://192.168.0.117:3000", 
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        "http://192.168.0.123:3000",
        "http://192.168.0.123:3001",
        "http://192.168.0.123:3002"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Store active and completed debate sessions
active_sessions: Dict[str, DebateSession] = {}
completed_sessions: Dict[str, Dict[str, Any]] = {}

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

@app.post("/debate/start")
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
        
        # Add team_id to the session object for easier tracking if needed
        session.team_id = team.team_id

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

@app.get("/debate/{team_id}/info")
async def get_debate_info(team_id: str):
    if team_id not in active_sessions:
        raise HTTPException(status_code=404, detail="Debate session not found")
    session = active_sessions[team_id]
    return {
        "topic": session.topic,
        "members": session.members,
        "course_code": session.course_code,
        "team_id": team_id
    }

@app.post("/debate/{team_id}/phase")
async def update_phase(team_id: str, request: PhaseUpdateRequest):
    if team_id not in active_sessions:
        raise HTTPException(status_code=404, detail="Debate session not found")
    session = active_sessions[team_id]
    session.current_phase = request.phase
    return {"message": f"Phase updated to {request.phase}"}

@app.post("/debate/{team_id}/phase1")
async def phase1_arguments(team_id: str):
    if team_id not in active_sessions:
        raise HTTPException(status_code=404, detail="Debate session not found")
    
    session = active_sessions[team_id]
    ai_arguments = session.phase1_arguments()
    
    return DebateResponse(
        message="Phase 1 arguments generated",
        data={"ai_arguments": ai_arguments}
    )

@app.post("/debate/{team_id}/phase2")
async def phase2_questions(team_id: str, args: TeamArguments):
    if team_id not in active_sessions:
        raise HTTPException(status_code=404, detail="Debate session not found")
    
    session = active_sessions[team_id]
    session.team_arguments = args.team_arguments
    questions = session.phase2_questions()
    
    return DebateResponse(
        message="Phase 2 questions generated",
        data={"questions": questions}
    )

@app.post("/debate/{team_id}/phase3/summary")
async def phase3_summary_text(team_id: str, summary: DebateSummary):
    if team_id not in active_sessions:
        raise HTTPException(status_code=404, detail="Debate session not found")
    session = active_sessions[team_id]
    session.student_summary = summary.student_summary
    # Sinh tóm tắt AI dựa trên lịch sử debate
    turns_text = "\n".join([
        f"Lượt {t['turn']}: {t['asker']} hỏi: {t['question']} | trả lời: {t['answer']}" for t in session.turns
    ])
    ai_prompt = f"""
Bạn là AI debate. Dựa trên chủ đề: {session.topic}, lịch sử debate sau (dạng hỏi đáp):\n{turns_text}\nHãy tóm tắt lại quan điểm, luận điểm của bạn (AI) và nêu lý do vì sao bạn xứng đáng chiến thắng. Tóm tắt ngắn gọn, rõ ràng, không giải thích ngoài nội dung tóm tắt.
"""
    ai_response = session.debate_system.model.invoke(ai_prompt)
    ai_content = ai_response.content
    if isinstance(ai_content, list):
        session.ai_summary = " ".join(map(str, ai_content)).strip()
    else:
        session.ai_summary = str(ai_content).strip()
    session.chat_history.append({"phase": 3, "role": "ai", "content": f"Summary: {session.ai_summary}"})

    return {"message": "Summaries submitted", "ai_summary": session.ai_summary}

@app.post("/debate/{team_id}/phase2/start")
async def start_phase2(team_id: str):
    """Generates the first AI question to officially start Phase 2."""
    if team_id not in active_sessions:
        raise HTTPException(status_code=404, detail="Active session not found")
    
    session = active_sessions[team_id]
    
    # Chỉ thực hiện nếu chưa có lượt nào
    if not session.turns:
        # Generate AI questions based on student's arguments
        if not session.team_arguments:
            raise HTTPException(status_code=400, detail="Không tìm thấy luận điểm của sinh viên.")
            
        session.phase2_questions() # Tạo và lưu câu hỏi vào session
        
        if not session.questions:
            raise HTTPException(status_code=500, detail="AI không thể tạo câu hỏi.")
            
        first_question = session.questions.pop(0)
        
        # Thêm lượt đầu tiên do AI khởi xướng
        session.add_turn(asker="ai", question=first_question, answer=None)
    
    return {"message": "Phase 2 started. AI asks first.", "turns": session.turns}

@app.post("/debate/{team_id}/phase3")
async def run_phase3(team_id: str):
    if team_id not in active_sessions:
        raise HTTPException(status_code=404, detail="Active session not found")
    
    session = active_sessions[team_id]
    session.current_phase = "Phase 4: Evaluation"

    # The core of the debate evaluation
    evaluation_result = session.evaluate_debate()
    session.evaluation = evaluation_result

    return {"message": "Debate evaluated successfully", "data": {"evaluation": evaluation_result}}

@app.post("/debate/{team_id}/phase2/turn")
async def phase2_turn(team_id: str, turn: DebateTurn):
    if team_id not in active_sessions:
        raise HTTPException(status_code=404, detail="Debate session not found")
    session = active_sessions[team_id]
    # Lưu lượt debate
    session.add_turn(turn.asker, turn.question, turn.answer)
    # Nếu đến lượt AI hỏi, sinh câu hỏi Socrates mới
    next_question = None
    if turn.asker == "student":
        # Sinh câu hỏi Socrates mới dựa trên lịch sử debate
        socrates_prompt = f"""
Bạn là AI debate sử dụng phương pháp Socrates. Dựa trên chủ đề: {session.topic}, lịch sử debate sau (dạng hỏi đáp):
"""
        for t in session.turns:
            socrates_prompt += f"\nLượt {t['turn']}: {t['asker']} hỏi: {t['question']} | trả lời: {t['answer']}"
        socrates_prompt += "\nHãy đặt 1 câu hỏi phản biện theo phương pháp Socrates: hỏi ngược, gợi mở, không khẳng định, giúp đối phương tự suy nghĩ, tự phản biện. Không trả lời thay, không giải thích. Chỉ trả về đúng 1 câu hỏi."
        ai_response = session.debate_system.model.invoke(socrates_prompt)
        ai_content = ai_response.content
        if isinstance(ai_content, list):
            next_question = " ".join(map(str, ai_content)).strip()
        else:
            next_question = str(ai_content).strip()
        session.add_turn("ai", next_question)
    return {"turns": session.turns, "next_question": next_question}

@app.websocket("/ws/debate/{team_id}")
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

@app.get("/debate/{team_id}/history")
async def get_debate_history(team_id: str):
    if team_id not in active_sessions:
        raise HTTPException(status_code=404, detail="Debate session not found")
    session = active_sessions[team_id]
    return {"chat_history": session.chat_history}

@app.delete("/debate/{team_id}/end")
async def end_session(team_id: str, payload: Optional[EndSessionPayload] = None):
    """Ends a session, saves it with a status, and moves it to completed."""
    if team_id in active_sessions:
        session = active_sessions.pop(team_id)
        
        status = "Hoàn thành"
        if payload and payload.reason:
            status = payload.reason

        completed_sessions[team_id] = {
            "team_id": team_id,
            "topic": session.topic,
            "members": session.members,
            "evaluation": session.evaluation,
            "completed_at": datetime.now().isoformat(),
            "chat_history": session.chat_history,
            "status": status,
        }
        
        return {"message": f"Session for team {team_id} has been ended with status: {status}"}
    
    raise HTTPException(status_code=404, detail="Active session not found")

@app.delete("/admin/history/{team_id}")
async def delete_history(team_id: str):
    """Deletes a specific session from the completed sessions history."""
    if team_id in completed_sessions:
        del completed_sessions[team_id]
        return {"message": f"History for team {team_id} has been deleted."}
    
    raise HTTPException(status_code=404, detail="Team ID not found in history.")

@app.get("/admin/sessions")
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

@app.get("/debate/{team_id}/export_docx")
async def export_docx(team_id: str):
    session_data = None
    if team_id in completed_sessions:
        session_data = completed_sessions[team_id]
    elif team_id in active_sessions:
        # If the session is active but has been evaluated, we can still export it.
        active_session = active_sessions[team_id]
        if active_session.evaluation:
             session_data = {
                "team_id": active_session.team_id,
                "topic": active_session.topic,
                "members": active_session.members,
                "evaluation": active_session.evaluation,
                "completed_at": datetime.now().isoformat(),
                "chat_history": active_session.chat_history
            }

    if not session_data:
        raise HTTPException(status_code=404, detail="Completed session with evaluation data not found")

    evaluation = session_data.get("evaluation", {})
    scores = evaluation.get("scores", {})
    if not scores: # Check if scores dict is empty
         raise HTTPException(status_code=404, detail="No scores found to generate the report.")

    feedback = evaluation.get("feedback", "No feedback provided.")
    
    document = Document()
    document.add_heading('Debate Result Details', level=1)

    # --- Basic Info ---
    document.add_heading('Session Information', level=2)
    document.add_paragraph(f"Team ID: {session_data.get('team_id', 'N/A')}")
    document.add_paragraph(f"Topic: {session_data.get('topic', 'N/A')}")
    document.add_paragraph(f"Members: {', '.join(session_data.get('members', []))}")
    if session_data.get('completed_at'):
        completed_time = datetime.fromisoformat(session_data['completed_at']).strftime('%Y-%m-%d %H:%M:%S')
        document.add_paragraph(f"Completed At: {completed_time}")

    # --- AI Feedback ---
    document.add_heading('Overall Feedback from AI', level=2)
    document.add_paragraph(feedback)

    # --- Detailed Scores ---
    document.add_heading('Detailed Scores', level=2)
    
    total_score = 0
    total_max_score = 0

    for phase_key, criteria_list in DEBATE_CRITERIA.items():
        phase_scores = scores.get(phase_key, {})
        phase_name = {
            "phase1": "Phase 1: Initial Arguments",
            "phase2A": "Phase 2A: Socrates Questions (Student's ability to answer)",
            "phase2B": "Phase 2B: Socrates Answers (Student's ability to question)"
        }.get(phase_key, phase_key)

        document.add_heading(phase_name, level=3)
        
        table = document.add_table(rows=1, cols=3)
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
    document.add_heading('Final Score', level=2)
    document.add_paragraph(f"Grand Total: {total_score} / {total_max_score}")

    # --- Chat History ---
    document.add_heading('Debate History', level=2)
    chat_history = session_data.get("chat_history", [])
    if chat_history:
        for item in chat_history:
            document.add_paragraph(f"[{item.get('phase', 'N/A')}] {item.get('role', 'N/A')}: {item.get('content', '')}", style='Intense Quote')
    else:
        document.add_paragraph("No chat history was recorded.")


    # --- Save to memory and return ---
    f = io.BytesIO()
    document.save(f)
    f.seek(0)
    
    return StreamingResponse(f, media_type='application/vnd.openxmlformats-officedocument.wordprocessingml.document', headers={'Content-Disposition': f'attachment; filename="debate_result_{team_id}.docx"'})

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000, reload=True) 