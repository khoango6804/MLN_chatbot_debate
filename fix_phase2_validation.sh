#!/bin/bash

echo "🔧 FIXING PHASE 2 VALIDATION ISSUE"
echo "=================================="
echo ""

echo "🚨 Problem: Phase 2 chỉ cho phép 1 lượt vì validation quá nghiêm"
echo "   Câu trả lời như '1111111111 asd fasd' bị block"
echo ""

echo "🔧 Solution: Relaxed validation để cho phép test content"
echo ""

echo "1. Kill existing backend..."
pkill -f uvicorn 2>/dev/null
sleep 3

echo "2. Restart backend with relaxed validation..."
cd backend
source venv/bin/activate 2>/dev/null
nohup uvicorn main:app --host 127.0.0.1 --port 8000 --reload > ../backend.log 2>&1 &
cd ..

echo "3. Wait for startup..."
sleep 10

echo "4. Check backend status..."
if netstat -tulpn | grep :8000 >/dev/null; then
    echo "✅ Backend running on port 8000"
else
    echo "❌ Backend failed to start"
    exit 1
fi

echo ""
echo "🧪 TEST NOW:"
echo "============"
echo "1. Refresh website: https://mlndebate.io.vn"
echo "2. Start new debate session"
echo "3. In Phase 2, try answering with test content like '1111 test answer'"
echo "4. Should now allow multiple turns!"
echo ""

echo "📋 CHANGES MADE:"
echo "- ✅ Removed '1111', '2222' etc from blocked patterns"
echo "- ✅ Reduced minimum answer length from 30 to 5 characters"
echo "- ✅ Allow mixed numbers + text content"
echo "- ✅ Only block pure nonsense like 'ádfasd' or pure numbers"
echo ""

echo "🎉 Phase 2 validation is now more forgiving!"
echo "Ready for testing multiple turns in Phase 2!" 