from fastapi import FastAPI, APIRouter, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, ValidationError
from typing import List, Optional, Dict, Any
import random
import json
import os

app = FastAPI(title="MLN Debate System - Minimal", version="2.0.0")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://www.mlndebate.io.vn", "https://mlndebate.io.vn"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

api_router = APIRouter(prefix="/api")

# In-memory storage (simple dictionaries only)
active_sessions = {}
completed_sessions = {}

# Debate topics
TOPICS = [
    "Khi anh giàu, lời anh nói ra chính là chân lý",
    "Cái đẹp không có trên đôi má hồng của người phụ nữ mà chỉ có trong đôi mắt của kẻ si tình.",
    "Con cái phải nghe lời bố mẹ, nên ai nắm quyền kinh tế sẽ quyết định chính trị, tư tưởng."
]

# Models
class DebateTeam(BaseModel):
    team_id: str
    members: List[str]
    course_code: str

class TeamArguments(BaseModel):
    team_arguments: List[str]

class DebateTurn(BaseModel):
    asker: str
    question: str
    answer: Optional[str] = None

class DebateSummary(BaseModel):
    student_summary: str

@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "message": "Minimal AI Debate System API is running"}

@api_router.post("/debate/start")
async def start_debate(request: Request):
    try:
        # Get raw request body for debugging
        body = await request.body()
        print(f"🔥 DEBUG: Raw request body: {body}")
        
        # Try to parse JSON manually first
        import json
        try:
            data = json.loads(body)
            print(f"🔥 DEBUG: Parsed JSON data: {data}")
        except json.JSONDecodeError as e:
            print(f"🔥 DEBUG: JSON decode error: {e}")
            return {"message": "Invalid JSON format", "error": str(e)}
        
        # Validate required fields manually
        if "team_id" not in data:
            print("🔥 DEBUG: Missing team_id field")
            return {"message": "Missing team_id field", "data": {"team_id": "", "topic": "", "members": [], "course_code": ""}}
        
        if "members" not in data:
            print("🔥 DEBUG: Missing members field")
            return {"message": "Missing members field", "data": {"team_id": data.get("team_id", ""), "topic": "", "members": [], "course_code": ""}}
        
        if "course_code" not in data:
            print("🔥 DEBUG: Missing course_code field")
            return {"message": "Missing course_code field", "data": {"team_id": data.get("team_id", ""), "topic": "", "members": data.get("members", []), "course_code": ""}}
        
        # Now try to create DebateTeam object
        try:
            team = DebateTeam(**data)
            print(f"🔥 DEBUG: Successfully created DebateTeam: {team}")
        except ValidationError as e:
            print(f"🔥 DEBUG: Pydantic validation error: {e}")
            return {"message": f"Validation error: {str(e)}", "error": "validation_error"}
        
        print(f"🔥 DEBUG: Received request data: {team}")
        print(f"🔥 DEBUG: team_id: '{team.team_id}', type: {type(team.team_id)}")
        print(f"🔥 DEBUG: members: {team.members}, type: {type(team.members)}")
        print(f"🔥 DEBUG: course_code: '{team.course_code}', type: {type(team.course_code)}")
        
        # Simple validation
        if not team.team_id or not team.team_id.strip():
            print("🔥 DEBUG: Validation failed - Team ID is required")
            return {
                "message": "Team ID is required",
                "data": {"team_id": "", "topic": "", "members": [], "course_code": ""}
            }
        
        if not team.members or len(team.members) == 0:
            print("🔥 DEBUG: Validation failed - At least one team member is required")
            return {
                "message": "At least one team member is required",
                "data": {"team_id": team.team_id, "topic": "", "members": [], "course_code": team.course_code or ""}
            }
        
        if not team.course_code or not team.course_code.strip():
            print("🔥 DEBUG: Validation failed - Course code is required")
            return {
                "message": "Course code is required",
                "data": {"team_id": team.team_id, "topic": "", "members": team.members, "course_code": ""}
            }
        
        # Clean team ID
        clean_team_id = team.team_id.strip()
        print(f"🔥 DEBUG: Clean team_id: '{clean_team_id}'")
        
        # Check if already exists
        if clean_team_id in active_sessions:
            existing = active_sessions[clean_team_id]
            print(f"🔥 DEBUG: Team already exists, returning existing session")
            return {
                "message": "Team already exists, returning existing session",
                "data": {
                    "team_id": clean_team_id,
                    "topic": existing.get("topic", ""),
                    "members": existing.get("members", []),
                    "course_code": existing.get("course_code", "")
                }
            }
        
        # Create new session (simple dictionary)
        topic = random.choice(TOPICS)
        session = {
            "team_id": clean_team_id,
            "members": [m.strip() for m in team.members if m.strip()],
            "course_code": team.course_code.strip(),
            "topic": topic,
            "status": "active",
            "current_phase": "phase1",
            "chat_history": [],
            "turns": [],
            "team_arguments": []
        }
        
        active_sessions[clean_team_id] = session
        print(f"🔥 DEBUG: Created new session for team '{clean_team_id}' with topic '{topic}'")
        
        return {
            "message": "Debate started successfully",
            "data": {
                "team_id": clean_team_id,
                "topic": topic,
                "members": session["members"],
                "course_code": session["course_code"]
            }
        }
    
    except Exception as e:
        print(f"🔥 DEBUG: Unexpected error in start_debate: {e}")
        import traceback
        print(f"🔥 DEBUG: Traceback: {traceback.format_exc()}")
        return {"message": f"Server error: {str(e)}", "error": "server_error"}

@api_router.get("/debate/{team_id}/info")
async def get_debate_info(team_id: str):
    if team_id not in active_sessions:
        return {"topic": "Default Topic", "members": [], "course_code": "UNKNOWN"}
    
    session = active_sessions[team_id]
    return {
        "topic": session.get("topic", "Default Topic"),
        "members": session.get("members", []),
        "course_code": session.get("course_code", "UNKNOWN")
    }

@api_router.post("/debate/{team_id}/phase1")
async def phase1_arguments(team_id: str):
    return {
        "data": {
            "ai_arguments": [
                "Luận điểm 1: Phân tích từ góc độ lịch sử và thực tiễn xã hội",
                "Luận điểm 2: Đánh giá tác động của công nghệ và toàn cầu hóa",
                "Luận điểm 3: Xem xét vai trò của các thể chế chính trị hiện đại"
            ]
        }
    }

@api_router.post("/debate/{team_id}/phase2")
async def phase2_questions(team_id: str, args: TeamArguments):
    if team_id not in active_sessions:
        return {
            "message": "Session not found",
            "data": {"questions": ["Sample question 1?", "Sample question 2?", "Sample question 3?"]}
        }
    
    session = active_sessions[team_id]
    session["team_arguments"] = args.team_arguments
    
    topic = session.get("topic", "Chủ đề tranh luận")
    questions = [
        f"Bạn có thể giải thích thêm về luận điểm đầu tiên liên quan đến {topic}?",
        f"Làm thế nào để chứng minh tính thuyết phục của quan điểm về {topic}?",
        f"Bạn có dự đoán được những phản bác nào từ phía đối lập về {topic}?"
    ]
    
    return {"message": "Phase 2 questions generated", "data": {"questions": questions}}

@api_router.post("/debate/{team_id}/phase3/summary")
async def phase3_summary(team_id: str, summary: DebateSummary):
    if team_id not in active_sessions:
        return {"message": "Session not found", "ai_summary": "AI không tìm thấy session để tóm tắt."}
    
    session = active_sessions[team_id]
    session["student_summary"] = summary.student_summary
    
    topic = session.get("topic", "Chủ đề tranh luận")
    ai_summary = f"Về chủ đề '{topic}', tôi đã trình bày quan điểm một cách logic và có căn cứ. Tôi tin rằng các luận điểm của mình đáng để được xem xét."
    session["ai_summary"] = ai_summary
    
    return {"message": "Summaries submitted", "ai_summary": ai_summary}

@api_router.get("/admin/sessions")
async def get_admin_sessions():
    return {
        "active": [],
        "completed": [],
        "criteria": {
            "phase1": [{"id": "logic", "name": "Logic", "max_score": 10}],
            "phase2A": [{"id": "response", "name": "Response", "max_score": 10}],
            "phase2B": [{"id": "question", "name": "Question", "max_score": 10}],
            "phase3": [{"id": "conclusion", "name": "Conclusion", "max_score": 10}]
        },
        "status": "success",
        "message": "Admin dashboard loaded successfully - minimal mode"
    }

@api_router.get("/admin/live-scoring")
async def get_admin_live_scoring():
    return {"live_scoring": [], "statistics": {"active_debates": 0}}

@api_router.get("/admin/leaderboard")
async def get_admin_leaderboard():
    return {
        "leaderboard": [],
        "statistics": {
            "total_teams": 0,
            "average_score": 0,
            "highest_score": 0,
            "rank_distribution": {}
        }
    }

# Add router to app
app.include_router(api_router)

@app.get("/")
async def root():
    return {"message": "MLN Debate System - Minimal Mode", "status": "running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000) 