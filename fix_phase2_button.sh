#!/bin/bash

echo "🔧 FIXING PHASE 2 REQUEST NEXT QUESTION BUTTON"
echo "=============================================="
echo ""

echo "🚨 Problem: Button 'Yêu cầu câu hỏi tiếp theo' không hiển thị sau khi gửi câu trả lời"
echo "📋 Solution: Fixed canRequestNextQuestion logic + improved error handling"
echo ""

echo "✅ APPLIED FIXES:"
echo "  1. Always enable 'Request Next Question' button after successful answer submission"
echo "  2. Added debug logging for AI question generation flow"
echo "  3. Added fallback logic if backend response missing 'turns' field"
echo "  4. Improved error handling with detailed messages"
echo ""

echo "🔄 Restarting frontend to apply changes..."
echo ""

# Kill existing frontend
echo "1. Stopping current frontend..."
pkill -f "node.*3001" 2>/dev/null
pkill -f "npm.*start" 2>/dev/null
sleep 3

# Restart frontend
echo "2. Starting frontend on port 3001..."
cd frontend
HOST=0.0.0.0 PORT=3001 npm start > ../frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

echo "Frontend PID: $FRONTEND_PID"
echo "Waiting 20 seconds for startup..."
sleep 20

# Test if frontend is running
echo "3. Testing frontend..."
if netstat -tulpn | grep :3001 >/dev/null; then
    echo "✅ Frontend is running on port 3001!"
else
    echo "❌ Frontend failed to start. Check frontend.log"
    exit 1
fi

echo ""
echo "🎉 FRONTEND RESTART COMPLETE!"
echo "============================="
echo ""
echo "NOW TRY:"
echo "1. Reload your browser page (F5)"
echo "2. Send a Phase 2 answer like '11111111111 asdf'"  
echo "3. Look for button 'Yêu cầu câu hỏi tiếp theo'"
echo "4. Click it to get next AI question"
echo ""
echo "🐛 DEBUGGING:"
echo "- Open browser DevTools (F12) → Console tab"
echo "- Look for debug messages starting with '🔧 DEBUG:'"
echo "- Check for any error messages" 