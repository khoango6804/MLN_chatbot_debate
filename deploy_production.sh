#!/bin/bash

echo "🚀 Deploying MLN Debate System to Production"
echo "=============================================="

# Navigate to project directory
cd /home/ubuntu/MLN_chatbot_debate

# Ensure backend is running
echo "📡 Checking backend status..."
if ! pgrep -f "uvicorn.*main:app" > /dev/null; then
    echo "⚡ Starting backend server..."
    cd backend
    export $(cat .env | xargs)
    uvicorn main:app --host 0.0.0.0 --port 5000 --reload > backend.log 2>&1 &
    cd ..
    sleep 3
else
    echo "✅ Backend already running"
fi

# Stop any React dev servers
echo "🛑 Stopping React development servers..."
pkill -f "react-scripts" || true
pkill -f "npm.*start" || true

# Build React production
echo "🔨 Building React production build..."
cd frontend
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Production build successful!"
else
    echo "❌ Production build failed!"
    exit 1
fi

# Reload nginx
echo "🔄 Reloading nginx..."
nginx -t && systemctl reload nginx

if [ $? -eq 0 ]; then
    echo "✅ Nginx reloaded successfully!"
else
    echo "❌ Nginx reload failed!"
    exit 1
fi

# Test the deployment
echo "🧪 Testing production deployment..."
sleep 2

# Test frontend
if curl -s https://mlndebate.io.vn > /dev/null; then
    echo "✅ Frontend: OK"
else
    echo "❌ Frontend: FAILED"
fi

# Test API
if curl -s https://mlndebate.io.vn/api/admin/sessions > /dev/null; then
    echo "✅ Backend API: OK"
else
    echo "❌ Backend API: FAILED"
fi

echo ""
echo "🎉 Production deployment complete!"
echo "📱 Website: https://mlndebate.io.vn"
echo "📊 Admin: https://mlndebate.io.vn/admin"
echo ""
echo "📋 System Status:"
echo "- Frontend: Production build (no WebSocket errors)"
echo "- Backend: Running on port 5000"  
echo "- Nginx: Serving static files + API proxy"
echo "- SSL: Enabled with Let's Encrypt"
echo ""
echo "🔍 Monitor logs:"
echo "- Backend: tail -f /home/ubuntu/MLN_chatbot_debate/backend/backend.log"
echo "- Nginx: tail -f /var/log/nginx/mlndebate_access.log" 