#!/bin/bash

echo "🔄 RESETTING ALL SERVICES - MLN DEBATE SYSTEM"
echo "=============================================="
echo ""

echo "🛑 STEP 1: KILLING ALL PROCESSES"
echo "================================="
echo ""

echo "Killing frontend processes..."
pkill -f "node.*3001" 2>/dev/null || echo "No frontend processes found"
pkill -f "npm.*start" 2>/dev/null || echo "No npm processes found"

echo "Killing backend processes..."
pkill -f uvicorn 2>/dev/null || echo "No uvicorn processes found"

echo "Waiting 5 seconds for processes to terminate..."
sleep 5

echo ""
echo "🚀 STEP 2: STARTING BACKEND"
echo "============================"
echo ""

cd backend
echo "Activating virtual environment..."
source venv/bin/activate 2>/dev/null || echo "Virtual env activation may have failed, continuing..."

echo "Starting backend on port 8000..."
uvicorn main:app --host 127.0.0.1 --port 8000 --reload > ../backend.log 2>&1 &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"
cd ..

echo "Waiting 10 seconds for backend startup..."
sleep 10

# Test backend
if netstat -tulpn 2>/dev/null | grep :8000 >/dev/null; then
    echo "✅ Backend is running on port 8000!"
else
    echo "⚠️  Backend may not be running, but continuing..."
fi

echo ""
echo "🌐 STEP 3: STARTING FRONTEND"
echo "============================="
echo ""

cd frontend
echo "Starting frontend on port 3001..."
HOST=0.0.0.0 PORT=3001 npm start > ../frontend.log 2>&1 &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"
cd ..

echo "Waiting 20 seconds for frontend startup..."
sleep 20

# Test frontend
if netstat -tulpn 2>/dev/null | grep :3001 >/dev/null; then
    echo "✅ Frontend is running on port 3001!"
else
    echo "⚠️  Frontend may not be running, check frontend.log"
fi

echo ""
echo "🎉 RESET COMPLETE!"
echo "=================="
echo ""

echo "📊 SERVICE STATUS:"
echo "=================="
echo ""

echo "Backend (port 8000):"
if netstat -tulpn 2>/dev/null | grep :8000 >/dev/null; then
    echo "✅ RUNNING"
else
    echo "❌ NOT RUNNING"
fi

echo ""
echo "Frontend (port 3001):"
if netstat -tulpn 2>/dev/null | grep :3001 >/dev/null; then
    echo "✅ RUNNING"
else
    echo "❌ NOT RUNNING"
fi

echo ""
echo "Nginx (ports 80, 443):"
if netstat -tulpn 2>/dev/null | grep -E ":80|:443" >/dev/null; then
    echo "✅ RUNNING"
else
    echo "❌ NOT RUNNING"
fi

echo ""
echo "🌐 ACCESS POINTS:"
echo "================="
echo "• Production: https://mlndebate.io.vn"
echo "• Direct Frontend: http://localhost:3001"
echo "• Direct Backend: http://localhost:8000"
echo ""

echo "🔧 FIXES APPLIED:"
echo "================="
echo "✅ Phase 2 validation relaxed (allows test content)"
echo "✅ Anti-repetition logic for AI questions"
echo "✅ Request Next Question button fixed (shows after answer)"
echo "✅ Improved error handling and debugging"
echo ""

echo "🧪 TESTING PHASE 2:"
echo "=================="
echo "1. Go to https://mlndebate.io.vn"
echo "2. Start a debate session"
echo "3. Submit answer like '11111111111 asdf'"
echo "4. Look for 'Yêu cầu câu hỏi tiếp theo' button"
echo "5. Click it to get next AI question"
echo ""

echo "🔍 TROUBLESHOOTING:"
echo "==================="
echo "• Check browser DevTools Console (F12)"
echo "• Look for '🔧 DEBUG:' messages"
echo "• Check backend.log and frontend.log for errors"
echo "• Try reloading page (F5) if issues persist" 