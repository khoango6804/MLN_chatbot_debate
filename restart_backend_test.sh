#!/bin/bash

echo "🔧 RESTART BACKEND WITH ANTI-REPETITION FIX"
echo "=========================================="

# Kill existing backend
pkill -f uvicorn 2>/dev/null
sleep 3

# Start backend
cd backend
source venv/bin/activate
uvicorn main:app --host 127.0.0.1 --port 8000 --reload > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..

echo "Backend PID: $BACKEND_PID"
echo "Waiting 15 seconds for startup..."
sleep 15

# Test if backend is responding
echo "Testing backend health..."
if curl -s http://127.0.0.1:8000/api/health > /dev/null; then
    echo "✅ Backend is healthy!"
else
    echo "❌ Backend not responding"
    exit 1
fi

echo ""
echo "🎉 BACKEND READY!"
echo "================"
echo ""
echo "FIXES APPLIED:"
echo "✅ Anti-repetition logic for Phase 2 questions"
echo "✅ Relaxed validation (allows test content)"  
echo "✅ 13 diverse fallback questions"
echo "✅ Smart selection to avoid duplicates"
echo "✅ Numbered questions if all used"
echo ""
echo "🧪 NOW TEST:"
echo "1. Refresh: https://mlndebate.io.vn"
echo "2. Start new debate session"
echo "3. Answer AI questions in Phase 2"
echo "4. Click 'Yêu cầu câu hỏi tiếp theo'"
echo "5. Should get DIFFERENT questions each time!"
echo "" 