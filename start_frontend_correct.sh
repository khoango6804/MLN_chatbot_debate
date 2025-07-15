#!/bin/bash

echo "🎨 Khởi động Frontend React..."

# Di chuyển vào thư mục frontend
cd /home/ubuntu/MLN_chatbot_debate/frontend

# Kill process cũ nếu có
pkill -f "node.*react-scripts" 2>/dev/null
pkill -f "npm start" 2>/dev/null
sleep 2

# Kiểm tra node_modules
if [ ! -d "node_modules" ]; then
    echo "📦 node_modules không tồn tại. Cài đặt dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ npm install thất bại!"
        exit 1
    fi
fi

# Set environment variables
export NODE_OPTIONS="--max-old-space-size=4096"
export PORT=3001
export BROWSER=none  # Không mở browser tự động

echo "🔧 Khởi động React với PORT=3001..."
nohup npm start > frontend_react.log 2>&1 &
FRONTEND_PID=$!

echo "Frontend PID: $FRONTEND_PID"
echo "⏳ Đợi React compile (có thể mất 1-2 phút)..."

# Kiểm tra frontend (React mất thời gian compile)
for i in {1..30}; do
    if curl -s -f http://localhost:3001 > /dev/null 2>&1; then
        echo "✅ Frontend đã sẵn sàng!"
        echo "📍 Frontend: http://localhost:3001"
        exit 0
    else
        echo "   Compile... $i/30 ($(($i * 10))s)"
        sleep 10
    fi
done

echo "⚠️  Frontend chưa sẵn sàng sau 5 phút. Kiểm tra log:"
echo ""
echo "=== FRONTEND LOG ==="
tail -20 frontend_react.log
echo "====================" 