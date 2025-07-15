#!/bin/bash

echo "🚀 Starting AI Debate System Services..."

# Kill existing processes
echo "🛑 Stopping existing services..."
pkill -f "python3 main.py" 2>/dev/null || true
pkill -f "react-scripts" 2>/dev/null || true

# Wait for processes to stop
sleep 3

# Start Backend API
echo "🔥 Starting Backend API on port 5000..."
cd /home/ubuntu/MLN_chatbot_debate/backend
python3 main.py &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

# Wait for backend to start
sleep 5

# Test backend
echo "🧪 Testing Backend API..."
if curl -s http://localhost:5000/api/admin/sessions > /dev/null; then
    echo "✅ Backend API is running"
else
    echo "❌ Backend API failed to start"
    exit 1
fi

# Start React Frontend
echo "🎨 Starting React Frontend on port 3001..."
cd /home/ubuntu/MLN_chatbot_debate/frontend
NODE_OPTIONS="--max-old-space-size=4096" PORT=3001 npm start &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"

# Test Nginx
echo "🌐 Testing Nginx reverse proxy..."
if curl -I https://mlndebate.io.vn/api/admin/sessions 2>/dev/null | grep -q "200\|405"; then
    echo "✅ Nginx reverse proxy is working"
else
    echo "❌ Nginx reverse proxy failed"
fi

# Wait for React to start
echo "⏳ Waiting for React to compile..."
sleep 30

# Test React
echo "🧪 Testing React Frontend..."
if curl -s http://localhost:3001 > /dev/null; then
    echo "✅ React Frontend is running"
else
    echo "⚠️  React Frontend might still be starting..."
fi

echo ""
echo "🎉 AI Debate System Services Status:"
echo "📊 Backend API: http://localhost:5000"
echo "🎨 React Frontend: http://localhost:3001"
echo "🌐 Public Website: https://mlndebate.io.vn"
echo "👨‍💼 Admin Dashboard: https://mlndebate.io.vn/admin"
echo ""
echo "📝 Process IDs:"
echo "Backend: $BACKEND_PID"
echo "Frontend: $FRONTEND_PID"
echo ""
echo "✨ System is ready! ✨"

# Save PIDs for easy management
echo $BACKEND_PID > /tmp/backend.pid
echo $FRONTEND_PID > /tmp/frontend.pid

# Monitor processes
trap 'kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit' SIGINT SIGTERM
wait 