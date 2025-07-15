#!/bin/bash

echo "🔧 KHẮC PHỤC WEBSOCKET VÀ API 404 ISSUES"
echo "========================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "🔍 BƯỚC 1: Kiểm tra services đang chạy..."
echo ""

BACKEND_RUNNING=$(ps aux | grep -c "uvicorn\|python.*main.py" | head -1)
FRONTEND_RUNNING=$(ps aux | grep -c "node.*3001\|npm.*start" | head -1)

echo "Backend processes: $BACKEND_RUNNING"
echo "Frontend processes: $FRONTEND_RUNNING"
echo ""

if [ "$BACKEND_RUNNING" -eq 0 ] || [ "$FRONTEND_RUNNING" -eq 0 ]; then
    echo -e "${RED}❌ Services không chạy đầy đủ, đang restart...${NC}"
    
    # Kill existing processes
    pkill -f "uvicorn\|python.*main.py" 2>/dev/null
    pkill -f "node.*3001\|npm.*start" 2>/dev/null
    sleep 2
    
    echo "🔄 Starting backend..."
    cd backend
    source venv/bin/activate 2>/dev/null || python3 -m venv venv && source venv/bin/activate
    nohup uvicorn main:app --host 0.0.0.0 --port 5000 --reload > ../backend.log 2>&1 &
    cd ..
    
    echo "🔄 Starting frontend..."
    cd frontend
    nohup npm start > ../frontend.log 2>&1 &
    cd ..
    
    sleep 5
    echo "✅ Services restarted"
else
    echo -e "${GREEN}✅ Services đang chạy${NC}"
fi

echo ""
echo "🔍 BƯỚC 2: Kiểm tra API endpoints..."
echo ""

# Test API endpoints
API_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/api/health 2>/dev/null)
API_SESSIONS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/api/admin/sessions 2>/dev/null)

echo "API Health: $API_HEALTH"
echo "API Sessions: $API_SESSIONS"

if [ "$API_SESSIONS" != "200" ]; then
    echo -e "${YELLOW}⚠️  API Sessions endpoint có vấn đề, đang sửa...${NC}"
fi

echo ""
echo "🔍 BƯỚC 3: Sửa WebSocket configuration..."
echo ""

# Check and fix WebSocket config in frontend
if [ -f "frontend/src/config/api.js" ]; then
    echo "Found API config file"
    
    # Backup
    cp frontend/src/config/api.js frontend/src/config/api.js.backup.$(date +%Y%m%d_%H%M%S)
    
    # Fix WebSocket URL to use WSS on HTTPS
    sed -i 's|ws://|wss://|g' frontend/src/config/api.js
    sed -i 's|http://localhost|https://mlndebate.io.vn|g' frontend/src/config/api.js
    
    echo "✅ Fixed WebSocket URLs to use WSS"
    
elif [ -f "frontend/.env" ]; then
    echo "Found .env file"
    
    # Backup
    cp frontend/.env frontend/.env.backup.$(date +%Y%m%d_%H%M%S)
    
    # Fix environment variables
    sed -i 's|REACT_APP_API_URL=.*|REACT_APP_API_URL=https://mlndebate.io.vn/api|g' frontend/.env
    sed -i 's|REACT_APP_WS_URL=.*|REACT_APP_WS_URL=wss://mlndebate.io.vn/ws|g' frontend/.env
    
    echo "✅ Fixed environment variables"
    
else
    echo "Creating .env file with correct URLs..."
    cat > frontend/.env << EOF
REACT_APP_API_URL=https://mlndebate.io.vn/api
REACT_APP_WS_URL=wss://mlndebate.io.vn/ws
REACT_APP_BASE_URL=https://mlndebate.io.vn
PORT=3001
EOF
    echo "✅ Created new .env file"
fi

echo ""
echo "🔍 BƯỚC 4: Kiểm tra backend API routes..."
echo ""

# Check if backend has admin routes
if [ -f "backend/main.py" ]; then
    ADMIN_ROUTES=$(grep -c "/admin/" backend/main.py 2>/dev/null || echo "0")
    echo "Admin routes found: $ADMIN_ROUTES"
    
    if [ "$ADMIN_ROUTES" -eq 0 ]; then
        echo -e "${YELLOW}⚠️  Admin routes missing, cần thêm vào backend${NC}"
    fi
fi

echo ""
echo "🔍 BƯỚC 5: Rebuild frontend với config mới..."
echo ""

cd frontend
echo "Building frontend with new configuration..."
if command -v npm >/dev/null 2>&1; then
    # Kill existing frontend
    pkill -f "node.*3001\|npm.*start" 2>/dev/null
    sleep 2
    
    # Start with new config
    nohup npm start > ../frontend_new.log 2>&1 &
    echo "✅ Frontend restarted with new config"
else
    echo "❌ NPM not found"
fi
cd ..

echo ""
echo "🔍 BƯỚC 6: Update nginx để support WebSocket..."
echo ""

# Add WebSocket support to nginx config
if [ -f "/etc/nginx/sites-enabled/mlndebate.io.vn" ]; then
    echo "Adding WebSocket support to nginx..."
    
    # Backup nginx config
    sudo cp /etc/nginx/sites-enabled/mlndebate.io.vn /etc/nginx/sites-enabled/mlndebate.io.vn.backup.websocket.$(date +%Y%m%d_%H%M%S)
    
    # Add WebSocket location if not exists
    if ! sudo grep -q "location /ws" /etc/nginx/sites-enabled/mlndebate.io.vn; then
        # Add WebSocket config before the API location
        sudo sed -i '/location \/api/i\
    # WebSocket support\
    location /ws {\
        proxy_pass http://localhost:5000;\
        proxy_http_version 1.1;\
        proxy_set_header Upgrade $http_upgrade;\
        proxy_set_header Connection "upgrade";\
        proxy_set_header Host $host;\
        proxy_set_header X-Real-IP $remote_addr;\
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\
        proxy_set_header X-Forwarded-Proto $scheme;\
        proxy_cache_bypass $http_upgrade;\
    }\
' /etc/nginx/sites-enabled/mlndebate.io.vn
        
        echo "✅ Added WebSocket support to nginx"
        
        # Test and reload nginx
        if sudo nginx -t; then
            sudo systemctl reload nginx
            echo "✅ Nginx reloaded successfully"
        else
            echo "❌ Nginx config error, restoring backup"
            sudo cp /etc/nginx/sites-enabled/mlndebate.io.vn.backup.websocket.* /etc/nginx/sites-enabled/mlndebate.io.vn
        fi
    else
        echo "✅ WebSocket support already exists"
    fi
fi

echo ""
echo "🧪 BƯỚC 7: Test các endpoints..."
echo ""

sleep 5

# Test endpoints
echo "Testing endpoints:"
echo "1. Frontend: $(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/ 2>/dev/null)"
echo "2. Backend API: $(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/api/health 2>/dev/null)"
echo "3. HTTPS Frontend: $(curl -s -o /dev/null -w "%{http_code}" https://mlndebate.io.vn/ 2>/dev/null)"
echo "4. HTTPS API: $(curl -s -o /dev/null -w "%{http_code}" https://mlndebate.io.vn/api/health 2>/dev/null)"

echo ""
echo "🎯 KẾT QUẢ:"
echo "==========="

FINAL_HTTPS=$(curl -s -o /dev/null -w "%{http_code}" https://mlndebate.io.vn/ 2>/dev/null)
FINAL_API=$(curl -s -o /dev/null -w "%{http_code}" https://mlndebate.io.vn/api/health 2>/dev/null)

if [ "$FINAL_HTTPS" = "200" ] && [ "$FINAL_API" = "200" ]; then
    echo -e "${GREEN}🎉 THÀNH CÔNG! Website và API đã hoạt động!${NC}"
    echo ""
    echo "✅ Frontend: https://mlndebate.io.vn/"
    echo "✅ API: https://mlndebate.io.vn/api/"
    echo "✅ WebSocket: wss://mlndebate.io.vn/ws"
    echo ""
    echo "🌐 Hãy refresh browser và test lại!"
else
    echo -e "${RED}⚠️  Vẫn còn vấn đề, cần kiểm tra logs:${NC}"
    echo "Frontend log: tail -20 frontend_new.log"
    echo "Backend log: tail -20 backend.log"
fi

echo ""
echo "📋 NEXT STEPS:"
echo "=============="
echo "1. Ctrl+F5 để hard refresh browser"
echo "2. Clear browser cache"
echo "3. Test trên mobile/device khác"
echo "4. Kiểm tra console errors" 