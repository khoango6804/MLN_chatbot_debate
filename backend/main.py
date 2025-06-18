import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import FastAPI, WebSocket, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional, Any
import json
from debate_system import DebateSession, DebateSystem
from fastapi.responses import FileResponse
from docx import Document
from docx.shared import Pt
from docx.enum.text import WD_ALIGN_PARAGRAPH

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://192.168.0.117:3000", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Store active debate sessions
active_sessions: Dict[str, DebateSession] = {}

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

@app.post("/api/debate/start")
async def start_debate(team: DebateTeam):
    try:
        session = DebateSession()
        topic = session.start_debate()
        active_sessions[team.team_id] = session
        
        return DebateResponse(
            message="Debate started successfully",
            data={
                "topic": topic,
                "team_id": team.team_id
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/debate/{team_id}/phase1")
async def phase1_arguments(team_id: str):
    if team_id not in active_sessions:
        raise HTTPException(status_code=404, detail="Debate session not found")
    
    session = active_sessions[team_id]
    ai_arguments = session.phase1_arguments()
    
    return DebateResponse(
        message="Phase 1 arguments generated",
        data={"ai_arguments": ai_arguments}
    )

@app.post("/api/debate/{team_id}/phase2")
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

@app.post("/api/debate/{team_id}/phase3/summary")
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
    session.ai_summary = ai_response.content.strip()
    return {"ai_summary": session.ai_summary}

@app.post("/api/debate/{team_id}/phase3")
async def phase3_summary(team_id: str, args: TeamResponses):
    if team_id not in active_sessions:
        raise HTTPException(status_code=404, detail="Debate session not found")
    session = active_sessions[team_id]
    # Lấy tất cả câu trả lời của SV từ session.turns
    team_responses = [turn['answer'] for turn in session.turns if turn['asker'] == 'student' and turn['answer']]
    session.responses = team_responses
    # Lấy tóm tắt từ session
    student_summary = getattr(session, 'student_summary', "")
    ai_summary = getattr(session, 'ai_summary', "")
    # Gọi hàm phase3_summary với đầy đủ tham số
    evaluation = session.phase3_summary(student_summary=student_summary, ai_summary=ai_summary)
    return DebateResponse(
        message="Debate completed",
        data={"evaluation": evaluation}
    )

@app.post("/api/debate/{team_id}/phase2/turn")
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
        next_question = ai_response.content.strip()
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

@app.get("/api/debate/{team_id}/history")
async def get_debate_history(team_id: str):
    if team_id not in active_sessions:
        raise HTTPException(status_code=404, detail="Debate session not found")
    session = active_sessions[team_id]
    return {"chat_history": session.chat_history}

@app.delete("/api/debate/{team_id}/end")
async def end_debate_session(team_id: str):
    if team_id in active_sessions:
        del active_sessions[team_id]
    return {"message": "Session ended"}

@app.get("/api/debate/{team_id}/export_docx")
async def export_debate_docx(team_id: str):
    if team_id not in active_sessions:
        raise HTTPException(status_code=404, detail="Debate session not found")
    session = active_sessions[team_id]

    doc = Document()
    doc.add_heading('KẾT QUẢ DEBATE AI', 0)

    # Chủ đề
    doc.add_heading('Chủ đề debate:', level=1)
    doc.add_paragraph(session.topic)

    # Lý do chủ đề phù hợp
    doc.add_heading('Lý do chủ đề phù hợp:', level=2)
    if hasattr(session, 'topic') and isinstance(session.topic, str):
        topic_lines = session.topic.split('\n')
        for line in topic_lines[1:]:
            doc.add_paragraph(line, style='List Bullet')

    # Kết quả chấm điểm
    doc.add_heading('Kết quả chấm điểm', level=1)
    if hasattr(session, 'evaluation') and session.evaluation:
        table = doc.add_table(rows=1, cols=3)
        hdr_cells = table.rows[0].cells
        hdr_cells[0].text = 'Tiêu chí'
        hdr_cells[1].text = 'Team'
        hdr_cells[2].text = 'AI'
        for key in session.evaluation['team_score']:
            row_cells = table.add_row().cells
            row_cells[0].text = key
            row_cells[1].text = str(session.evaluation['team_score'][key])
            row_cells[2].text = str(session.evaluation['ai_score'][key])
        doc.add_paragraph(f"Người thắng cuộc: {session.evaluation['winner']}")

    # Lịch sử debate
    doc.add_heading('Lịch sử debate', level=1)
    if hasattr(session, 'chat_history'):
        for item in session.chat_history:
            doc.add_paragraph(f"Phase {item['phase']} - {item['role']}:\n{item['content']}")

    # Lưu file tạm
    file_path = f"debate_result_{team_id}.docx"
    doc.save(file_path)
    return FileResponse(path=file_path, filename=file_path, media_type='application/vnd.openxmlformats-officedocument.wordprocessingml.document') 