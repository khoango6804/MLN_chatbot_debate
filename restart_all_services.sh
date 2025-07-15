#!/bin/bash

echo "🚀 RESTARTING ALL SERVICES WITH PHASE 2 FIXES"
echo "=============================================="
echo ""

echo "🔧 FIXES INCLUDED:"
echo "✅ Backend: Relaxed validation for Phase 2 answers"
echo "✅ Backend: Anti-repetition logic for AI questions"  
echo "✅ Frontend: Always show 'Request Next Question' button"
echo "✅ Frontend: Improved error handling & fallback logic"
echo ""

echo "📋 STEP 1: RESTARTING BACKEND"
echo "=============================="
echo ""

# Kill backend processes
echo "Stopping backend processes..."
pkill -f uvicorn 2>/dev/null
sleep 3

# Start backend
echo "Starting backend on port 8000..."
cd backend
source venv/bin/activate 2>/dev/null
uvicorn main:app --host 127.0.0.1 --port 8000 --reload > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..

echo "Backend PID: $BACKEND_PID"
echo "Waiting 10 seconds for backend startup..."
sleep 10

# Test backend
if netstat -tulpn | grep :8000 >/dev/null 2>&1; then
    echo "✅ Backend is running on port 8000!"
else
    echo "❌ Backend failed to start"
    exit 1
fi

echo ""
echo "📋 STEP 2: RESTARTING FRONTEND"  
echo "==============================="
echo ""

# Kill frontend processes
echo "Stopping frontend processes..."
pkill -f "node.*3001" 2>/dev/null
pkill -f "npm.*start" 2>/dev/null
sleep 3

# Start frontend
echo "Starting frontend on port 3001..."
cd frontend
HOST=0.0.0.0 PORT=3001 npm start > ../frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

echo "Frontend PID: $FRONTEND_PID"
echo "Waiting 20 seconds for frontend startup..."
sleep 20

# Test frontend
if netstat -tulpn | grep :3001 >/dev/null 2>&1; then
    echo "✅ Frontend is running on port 3001!"
else
    echo "❌ Frontend failed to start"
    exit 1
fi

echo ""
echo "📋 STEP 3: TESTING SERVICES"
echo "============================"
echo ""

echo "Backend status:"
netstat -tulpn | grep :8000 || echo "❌ Backend not found"

echo "Frontend status:"  
netstat -tulpn | grep :3001 || echo "❌ Frontend not found"

echo "Nginx status:"
netstat -tulpn | grep -E ":80|:443" | head -2 || echo "❌ Nginx not found"

echo ""
echo "🎉 ALL SERVICES RESTARTED!"
echo "=========================="
echo ""
echo "🌐 ACCESS POINTS:"
echo "Direct Frontend: http://localhost:3001"  
echo "Direct Backend: http://localhost:8000"
echo "Production Site: https://mlndebate.io.vn"
echo ""
echo "🧪 TESTING PHASE 2:"
echo "1. Go to https://mlndebate.io.vn"
echo "2. Start a debate session"
echo "3. Get to Phase 2"
echo "4. Submit answer like '11111111111 asdf'"
echo "5. Look for 'Yêu cầu câu hỏi tiếp theo' button"
echo "6. Click it to get next AI question"
echo ""
echo "🐛 DEBUGGING:"
echo "- Check browser DevTools Console (F12)"
echo "- Look for '🔧 DEBUG:' messages"
echo "- Check backend.log and frontend.log if issues" 