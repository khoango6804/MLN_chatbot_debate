#!/bin/bash

echo "🚨 KHẮC PHỤC LỖI 502 BAD GATEWAY - MLNDEBATE.IO.VN"
echo "=================================================="
echo ""

# Kiểm tra quyền root
if [ "$EUID" -ne 0 ]; then
    echo "⚠️  Script này cần quyền root. Chạy với: sudo bash QUICK_FIX_502.sh"
    exit 1
fi

echo "🛑 BƯỚC 1: Dừng tất cả processes cũ..."
pkill -f "uvicorn" 2>/dev/null
pkill -f "python3 main.py" 2>/dev/null
pkill -f "node.*react-scripts" 2>/dev/null
pkill -f "npm start" 2>/dev/null
sleep 3
echo "✅ Đã dừng processes cũ"

echo ""
echo "🚀 BƯỚC 2: Khởi động Backend..."
cd /home/ubuntu/MLN_chatbot_debate/backend

# Tạo .env nếu chưa có
if [ ! -f .env ]; then
    echo "📝 Tạo file .env..."
    cat > .env << 'EOF'
# API Keys - Vui lòng cập nhật với keys thực tế
GOOGLE_API_KEY=your_google_gemini_api_key_here
EOF
    echo "⚠️  QUAN TRỌNG: Vui lòng cập nhật GOOGLE_API_KEY trong file backend/.env"
fi

# Khởi động backend
echo "🔧 Khởi động backend với uvicorn..."
nohup uvicorn main:app --host 0.0.0.0 --port 5000 --reload > backend_fix.log 2>&1 &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

echo ""
echo "🎨 BƯỚC 3: Khởi động Frontend..."
cd /home/ubuntu/MLN_chatbot_debate/frontend

# Kiểm tra node_modules
if [ ! -d "node_modules" ]; then
    echo "📦 Cài đặt npm dependencies..."
    npm install
fi

# Khởi động frontend
export NODE_OPTIONS="--max-old-space-size=4096"
export PORT=3001
export BROWSER=none
echo "🔧 Khởi động React frontend..."
nohup npm start > frontend_fix.log 2>&1 &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"

echo ""
echo "🔄 BƯỚC 4: Restart Nginx..."
systemctl restart nginx
systemctl status nginx --no-pager -l

echo ""
echo "⏳ BƯỚC 5: Đợi services khởi động..."
echo "Backend đang khởi động..."
for i in {1..15}; do
    if curl -s -f http://localhost:5000/api/admin/sessions > /dev/null 2>&1; then
        echo "✅ Backend sẵn sàng sau ${i}0 giây"
        BACKEND_READY=1
        break
    else
        echo -n "."
        sleep 10
    fi
done

if [ -z "$BACKEND_READY" ]; then
    echo ""
    echo "❌ Backend chưa sẵn sàng sau 2.5 phút. Log:"
    tail -20 /home/ubuntu/MLN_chatbot_debate/backend/backend_fix.log
fi

echo ""
echo "Frontend đang compile..."
for i in {1..18}; do
    if curl -s -f http://localhost:3001 > /dev/null 2>&1; then
        echo "✅ Frontend sẵn sàng sau ${i}0 giây"
        FRONTEND_READY=1
        break
    else
        echo -n "."
        sleep 10
    fi
done

if [ -z "$FRONTEND_READY" ]; then
    echo ""
    echo "⚠️  Frontend chưa sẵn sàng sau 3 phút (bình thường với React)"
fi

echo ""
echo "🧪 BƯỚC 6: Kiểm tra website..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://mlndebate.io.vn/api/admin/sessions 2>/dev/null)

echo "Status code: $HTTP_CODE"
case $HTTP_CODE in
    200|405)
        echo "🎉 THÀNH CÔNG! Website đã hoạt động bình thường"
        echo "✅ https://mlndebate.io.vn - OK"
        echo "✅ https://mlndebate.io.vn/admin - OK"
        ;;
    502)
        echo "⚠️  Vẫn còn lỗi 502. Có thể cần đợi thêm hoặc kiểm tra:"
        echo "   - File .env có API keys đúng không"
        echo "   - Backend log: tail -f /home/ubuntu/MLN_chatbot_debate/backend/backend_fix.log"
        echo "   - Frontend log: tail -f /home/ubuntu/MLN_chatbot_debate/frontend/frontend_fix.log"
        ;;
    *)
        echo "❌ Lỗi khác: HTTP $HTTP_CODE"
        ;;
esac

echo ""
echo "📊 TÓM TẮT:"
echo "=========="
echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo "Logs:"
echo "  - Backend: /home/ubuntu/MLN_chatbot_debate/backend/backend_fix.log"
echo "  - Frontend: /home/ubuntu/MLN_chatbot_debate/frontend/frontend_fix.log"
echo "  - Nginx: /var/log/nginx/mlndebate_error.log"
echo ""
echo "🔧 LỆNH KIỂM TRA:"
echo "  - ps aux | grep uvicorn"
echo "  - ps aux | grep react-scripts"
echo "  - curl http://localhost:5000/api/admin/sessions"
echo "  - curl http://localhost:3001"
echo ""
echo "⚠️  LƯU Ý: Nếu backend vẫn lỗi, hãy cập nhật GOOGLE_API_KEY trong backend/.env" 