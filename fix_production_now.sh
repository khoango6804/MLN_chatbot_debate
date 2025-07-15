#!/bin/bash

echo "🚀 FIXING PRODUCTION BACKEND NOW..."

# Kill existing backend processes
echo "🛑 Stopping existing backend processes..."
pkill -f "python3.*main.py" || true
pkill -f "uvicorn" || true

# Wait for processes to stop
sleep 3

# Start backend in production mode
echo "🔥 Starting production backend..."
cd /home/ubuntu/MLN_chatbot_debate/backend
nohup python3 main.py > ../backend.log 2>&1 &
BACKEND_PID=$!

# Wait for backend to start
echo "⏳ Waiting for backend to start..."
sleep 8

# Test local backend
echo "🧪 Testing local backend..."
LOCAL_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/api/health 2>/dev/null || echo "000")

if [ "$LOCAL_STATUS" = "200" ]; then
    echo "✅ Local backend is running (PID: $BACKEND_PID)"
else
    echo "❌ Local backend failed to start (Status: $LOCAL_STATUS)"
fi

# Test production API through nginx
echo "🌐 Testing production API..."
PROD_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://mlndebate.io.vn/api/health 2>/dev/null || echo "000")

if [ "$PROD_STATUS" = "200" ]; then
    echo "✅ Production API is working!"
else
    echo "⚠️  Production API status: $PROD_STATUS"
    echo "🔄 Restarting nginx..."
    sudo systemctl restart nginx
    sleep 3
    
    # Test again
    PROD_STATUS2=$(curl -s -o /dev/null -w "%{http_code}" https://mlndebate.io.vn/api/health 2>/dev/null || echo "000")
    if [ "$PROD_STATUS2" = "200" ]; then
        echo "✅ Production API fixed after nginx restart!"
    else
        echo "❌ Still having issues (Status: $PROD_STATUS2)"
    fi
fi

# Test admin endpoint specifically
echo "👤 Testing admin endpoint..."
ADMIN_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://mlndebate.io.vn/api/admin/sessions 2>/dev/null || echo "000")

if [ "$ADMIN_STATUS" = "200" ]; then
    echo "✅ Admin API is working!"
else
    echo "⚠️  Admin API status: $ADMIN_STATUS"
fi

echo ""
echo "🎯 FINAL STATUS:"
echo "=================="
echo "Local Backend: HTTP $LOCAL_STATUS"
echo "Production API: HTTP $PROD_STATUS (nginx->backend)"
echo "Admin Endpoint: HTTP $ADMIN_STATUS"
echo ""

if [ "$PROD_STATUS" = "200" ] && [ "$ADMIN_STATUS" = "200" ]; then
    echo "🎉 SUCCESS! Production is now working!"
    echo "✅ Frontend: https://mlndebate.io.vn/admin"
    echo "✅ API: https://mlndebate.io.vn/api/"
    echo ""
    echo "👉 Please refresh your browser with Ctrl+F5"
else
    echo "❌ Still having issues. Check logs:"
    echo "Backend log: tail -20 /home/ubuntu/MLN_chatbot_debate/backend.log"
    echo "Nginx log: sudo tail -20 /var/log/nginx/error.log"
fi 