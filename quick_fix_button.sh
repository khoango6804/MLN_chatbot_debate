#!/bin/bash

echo "🚨 QUICK FIX: Phase 2 Request Next Question Button"
echo "================================================="
echo ""

echo "🔧 PROBLEM IDENTIFIED:"
echo "❌ Button was hidden inside 'hasUnansweredQuestion' logic"
echo "❌ After user answers, hasUnansweredQuestion becomes false"
echo "❌ So button disappears along with input field"
echo ""

echo "✅ SOLUTION APPLIED:"
echo "✅ Moved button OUTSIDE hasUnansweredQuestion logic"
echo "✅ Button now shows independently when canRequestNextQuestion=true"
echo "✅ Button persists after user submits answer"
echo ""

echo "🔄 Restarting frontend to apply fix..."

# Kill frontend
pkill -f "node.*3001" 2>/dev/null
pkill -f "npm.*start" 2>/dev/null
sleep 3

# Start frontend
cd frontend
HOST=0.0.0.0 PORT=3001 npm start > ../frontend.log 2>&1 &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"
cd ..

echo "Waiting 20 seconds for startup..."
sleep 20

if netstat -tulpn | grep :3001 >/dev/null 2>&1; then
    echo "✅ Frontend restarted successfully!"
else
    echo "❌ Frontend failed to start - check frontend.log"
    exit 1
fi

echo ""
echo "🎉 BUTTON FIX COMPLETE!"
echo "======================"
echo ""
echo "📋 TEST STEPS:"
echo "1. Reload page (F5)"
echo "2. Submit Phase 2 answer"
echo "3. Look for 'Yêu cầu câu hỏi tiếp theo' button"
echo "4. Button should appear BELOW the conversation"
echo "5. Click it to get next AI question"
echo ""
echo "🔍 DEBUG:"
echo "- Check browser console for '🔧 DEBUG: Enabling Request Next Question button'"
echo "- Button should be visible as soon as answer is submitted" 