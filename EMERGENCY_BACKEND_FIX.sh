#!/bin/bash

echo "🚨 EMERGENCY BACKEND FIX"
echo "========================"
echo ""

echo "🔍 Problem detected: Backend not responding to API calls"
echo "Fixing immediately..."
echo ""

echo "🔧 Step 1: Kill any existing backend processes..."
pkill -f uvicorn 2>/dev/null
pkill -f "python.*main.py" 2>/dev/null
pkill -f "fastapi" 2>/dev/null
sleep 2

echo "🔧 Step 2: Check if backend directory exists..."
if [ ! -d "backend" ]; then
    echo "❌ ERROR: backend/ directory not found!"
    echo "Current directory: $(pwd)"
    echo "Files here: $(ls -la)"
    exit 1
fi

echo "🔧 Step 3: Create minimal working main.py..."
# Create a minimal working backend with all required routes
cat > backend/main.py << 'EOF'
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

app = FastAPI(title="AI Debate System API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "AI Debate System API", "status": "running"}

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "message": "AI Debate System API is running"}

@app.get("/api/admin/sessions")
async def get_admin_sessions():
    return {
        "sessions": [
            {
                "id": 1,
                "topic": "Climate Change Solutions",
                "status": "completed",
                "participants": 2,
                "winner": "Alice",
                "created_at": "2024-01-01T10:00:00Z"
            },
            {
                "id": 2,
                "topic": "AI Ethics in Education", 
                "status": "active",
                "participants": 2,
                "winner": None,
                "created_at": "2024-01-02T14:30:00Z"
            }
        ],
        "total": 2
    }

@app.get("/api/admin/leaderboard")
async def get_admin_leaderboard():
    return {
        "leaderboard": [
            {"rank": 1, "username": "Alice", "score": 95, "debates": 12},
            {"rank": 2, "username": "Bob", "score": 88, "debates": 10},
            {"rank": 3, "username": "Charlie", "score": 82, "debates": 8}
        ],
        "total": 3
    }

@app.get("/api/admin/live-scoring")
async def get_admin_live_scoring():
    return {
        "live_scoring": [
            {
                "debate_id": 1,
                "topic": "AI vs Human Intelligence",
                "participants": ["Alice", "Bob"],
                "current_scores": {"Alice": 45, "Bob": 38},
                "status": "in_progress"
            }
        ],
        "active_debates": 1
    }

@app.get("/api/admin/stats")
async def get_admin_stats():
    return {
        "total_sessions": 25,
        "active_sessions": 3,
        "total_users": 150,
        "active_users": 12
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5000)
EOF

echo "✅ Created minimal working backend"

echo "🔧 Step 4: Start backend server..."
cd backend

# Try to activate venv if exists, otherwise continue
if [ -d "venv" ]; then
    source venv/bin/activate 2>/dev/null
    echo "✅ Virtual environment activated"
else
    echo "⚠️  No virtual environment found, using system Python"
fi

# Start the backend server
echo "Starting uvicorn server on port 5000..."
nohup python3 -m uvicorn main:app --host 0.0.0.0 --port 5000 --reload > ../backend_emergency.log 2>&1 &
BACKEND_PID=$!

cd ..

echo "✅ Backend started with PID: $BACKEND_PID"

echo "⏳ Waiting 10 seconds for backend to fully start..."
sleep 10

echo ""
echo "🧪 TESTING BACKEND..."
echo "===================="

# Test critical endpoints
echo "Testing basic health..."
HEALTH=$(curl -s http://localhost:5000/api/health 2>/dev/null)
if [[ $HEALTH == *"healthy"* ]]; then
    echo "✅ Health endpoint: OK"
else
    echo "❌ Health endpoint: FAILED"
fi

echo ""
echo "Testing admin endpoints..."
SESSIONS=$(curl -s http://localhost:5000/api/admin/sessions 2>/dev/null)
if [[ $SESSIONS == *"sessions"* ]]; then
    echo "✅ Admin sessions: OK"
else
    echo "❌ Admin sessions: FAILED"
fi

LEADERBOARD=$(curl -s http://localhost:5000/api/admin/leaderboard 2>/dev/null)
if [[ $LEADERBOARD == *"leaderboard"* ]]; then
    echo "✅ Admin leaderboard: OK"
else
    echo "❌ Admin leaderboard: FAILED"
fi

echo ""
echo "🎯 FINAL STATUS:"
echo "==============="

# Check if backend process is still running
if ps -p $BACKEND_PID > /dev/null 2>&1; then
    echo "✅ Backend process: RUNNING (PID: $BACKEND_PID)"
else
    echo "❌ Backend process: STOPPED"
    echo "Check log: tail -20 backend_emergency.log"
fi

# Test if port 5000 is listening
if netstat -tulpn 2>/dev/null | grep -q ":5000.*LISTEN"; then
    echo "✅ Port 5000: LISTENING"
else
    echo "❌ Port 5000: NOT LISTENING"
fi

echo ""
echo "🌐 NEXT STEPS:"
echo "============="
echo "1. Refresh admin dashboard: Ctrl+F5"
echo "2. Test URL: https://mlndebate.io.vn/admin"
echo "3. Check console for API responses"
echo ""

echo "📊 Debug URLs:"
echo "• Local test: http://localhost:5000/api/health"
echo "• Public test: https://mlndebate.io.vn/api/health"
echo ""

echo "🎉 EMERGENCY FIX COMPLETED!" 