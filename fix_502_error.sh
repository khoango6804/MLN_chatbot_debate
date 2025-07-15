#!/bin/bash

echo "🔧 Khắc phục lỗi 502 Bad Gateway..."

# 1. Kill các process cũ
echo "🛑 Dừng các process cũ..."
sudo pkill -f "python3 main.py" 2>/dev/null
sudo pkill -f "node" 2>/dev/null
sudo pkill -f "npm" 2>/dev/null
sleep 2

# 2. Khởi động Backend (đúng cách với uvicorn)
echo "🚀 Khởi động Backend API..."
cd /home/ubuntu/MLN_chatbot_debate/backend

# Kiểm tra file .env
if [ ! -f .env ]; then
    echo "⚠️  Cảnh báo: File .env không tồn tại trong backend/"
    echo "Tạo file .env mẫu..."
    cat > .env << 'EOF'
# Thêm các API keys của bạn vào đây
GOOGLE_API_KEY=your_google_api_key_here
# Thêm các config khác nếu cần
EOF
    echo "✅ Đã tạo file .env mẫu. Vui lòng cập nhật API keys!"
fi

# Chạy backend với uvicorn (đúng cách)
echo "🔧 Khởi động với uvicorn..."
nohup uvicorn main:app --host 0.0.0.0 --port 5000 --reload > backend_uvicorn_$(date +%Y%m%d_%H%M%S).log 2>&1 &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"
sleep 8

# 3. Kiểm tra Backend
echo "🧪 Kiểm tra Backend..."
for i in {1..6}; do
    if curl -s -f http://localhost:5000/api/admin/sessions > /dev/null 2>&1; then
        echo "✅ Backend đang chạy OK"
        break
    else
        echo "   Thử lần $i/6..."
        sleep 3
    fi
    if [ $i -eq 6 ]; then
        echo "❌ Backend chưa sẵn sàng. Kiểm tra log:"
        tail -20 backend_uvicorn_*.log
    fi
done

# 4. Khởi động Frontend
echo "🎨 Khởi động Frontend React..."
cd /home/ubuntu/MLN_chatbot_debate/frontend

# Kiểm tra node_modules
if [ ! -d "node_modules" ]; then
    echo "📦 Cài đặt dependencies..."
    npm install
fi

# Chạy frontend
export NODE_OPTIONS="--max-old-space-size=4096"
export PORT=3001
nohup npm start > frontend_log_$(date +%Y%m%d_%H%M%S).log 2>&1 &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"

# 5. Khởi động lại Nginx
echo "🔄 Khởi động lại Nginx..."
sudo systemctl restart nginx
sleep 2

# 6. Kiểm tra tổng thể
echo ""
echo "📊 KIỂM TRA TRẠNG THÁI:"
echo "========================"

# Check ports
echo "🔍 Kiểm tra ports:"
sudo lsof -i :5000 > /dev/null 2>&1 && echo "✅ Port 5000 (Backend): OK" || echo "❌ Port 5000 (Backend): KHÔNG HOẠT ĐỘNG"
sudo lsof -i :3001 > /dev/null 2>&1 && echo "✅ Port 3001 (Frontend): OK" || echo "❌ Port 3001 (Frontend): KHÔNG HOẠT ĐỘNG"

# Check nginx
if sudo systemctl is-active --quiet nginx; then
    echo "✅ Nginx: Đang chạy"
else
    echo "❌ Nginx: Không chạy"
fi

# Test website
echo ""
echo "🌐 Kiểm tra website..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://mlndebate.io.vn/api/admin/sessions 2>/dev/null)
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "405" ]; then
    echo "✅ Website hoạt động bình thường (HTTP $HTTP_CODE)"
elif [ "$HTTP_CODE" = "502" ]; then
    echo "⚠️  Vẫn còn lỗi 502. Frontend/Backend có thể đang khởi động..."
    echo "   Vui lòng đợi 30-60 giây và thử lại"
else
    echo "❌ Lỗi HTTP: $HTTP_CODE"
fi

echo ""
echo "💡 GỢI Ý:"
echo "- Nếu Backend không chạy: Kiểm tra file .env và các API keys"
echo "- Nếu Frontend không chạy: Đợi npm install hoàn tất (có thể mất vài phút)"
echo "- Logs được lưu tại:"
echo "  - Backend: /home/ubuntu/MLN_chatbot_debate/backend/backend_uvicorn_*.log"
echo "  - Frontend: /home/ubuntu/MLN_chatbot_debate/frontend/frontend_log_*.log"
echo "  - Nginx: /var/log/nginx/mlndebate_error.log"
echo ""
echo "🔧 LỆNH KIỂM TRA NHANH:"
echo "  - Xem backend log: tail -f /home/ubuntu/MLN_chatbot_debate/backend/backend_uvicorn_*.log"
echo "  - Test API: curl http://localhost:5000/api/admin/sessions"
echo "  - Test website: curl -I https://mlndebate.io.vn" 