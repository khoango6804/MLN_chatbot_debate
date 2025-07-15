#!/bin/bash

echo "🔍 KIỂM TRA NGUYÊN NHÂN LỖI 502 BAD GATEWAY"
echo "==========================================="
echo ""

# 1. Kiểm tra Backend
echo "1️⃣ BACKEND API (Port 5000):"
if pgrep -f "uvicorn main:app" > /dev/null || pgrep -f "python3 main.py" > /dev/null; then
    echo "   ✅ Process: Đang chạy"
    if curl -s -f http://localhost:5000/api/admin/sessions > /dev/null 2>&1; then
        echo "   ✅ API: Phản hồi OK"
    else
        echo "   ❌ API: Không phản hồi"
    fi
else
    echo "   ❌ Process: KHÔNG chạy"
    echo "   → Đây là nguyên nhân chính gây lỗi 502!"
fi

# 2. Kiểm tra Frontend
echo ""
echo "2️⃣ FRONTEND REACT (Port 3001):"
if pgrep -f "node.*react-scripts" > /dev/null; then
    echo "   ✅ Process: Đang chạy"
    if curl -s -f http://localhost:3001 > /dev/null 2>&1; then
        echo "   ✅ React: Phản hồi OK"
    else
        echo "   ⚠️  React: Có thể đang compile..."
    fi
else
    echo "   ❌ Process: KHÔNG chạy"
fi

# 3. Kiểm tra Nginx
echo ""
echo "3️⃣ NGINX:"
if systemctl is-active --quiet nginx; then
    echo "   ✅ Service: Đang chạy"
    # Kiểm tra cấu hình
    if sudo nginx -t 2>/dev/null; then
        echo "   ✅ Config: Hợp lệ"
    else
        echo "   ❌ Config: Có lỗi"
    fi
else
    echo "   ❌ Service: KHÔNG chạy"
fi

# 4. Kiểm tra Ports
echo ""
echo "4️⃣ PORTS:"
sudo lsof -i :5000 > /dev/null 2>&1 && echo "   ✅ 5000: Đã sử dụng" || echo "   ❌ 5000: Chưa sử dụng"
sudo lsof -i :3001 > /dev/null 2>&1 && echo "   ✅ 3001: Đã sử dụng" || echo "   ❌ 3001: Chưa sử dụng"
sudo lsof -i :80 > /dev/null 2>&1 && echo "   ✅ 80: Đã sử dụng" || echo "   ❌ 80: Chưa sử dụng"
sudo lsof -i :443 > /dev/null 2>&1 && echo "   ✅ 443: Đã sử dụng" || echo "   ❌ 443: Chưa sử dụng"

# 5. Kiểm tra file quan trọng
echo ""
echo "5️⃣ FILES QUAN TRỌNG:"
[ -f /home/ubuntu/MLN_chatbot_debate/backend/.env ] && echo "   ✅ backend/.env: Tồn tại" || echo "   ❌ backend/.env: THIẾU (cần cho API keys)"
[ -d /home/ubuntu/MLN_chatbot_debate/frontend/node_modules ] && echo "   ✅ frontend/node_modules: Tồn tại" || echo "   ❌ frontend/node_modules: THIẾU (cần npm install)"

# 6. Kết luận
echo ""
echo "📋 KẾT LUẬN:"
echo "============"

ISSUES=0

if ! pgrep -f "uvicorn main:app" > /dev/null && ! pgrep -f "python3 main.py" > /dev/null; then
    echo "❌ Backend không chạy - ĐÂY LÀ NGUYÊN NHÂN CHÍNH!"
    ISSUES=$((ISSUES + 1))
fi

if ! pgrep -f "node.*react-scripts" > /dev/null; then
    echo "⚠️  Frontend không chạy"
    ISSUES=$((ISSUES + 1))
fi

if [ ! -f /home/ubuntu/MLN_chatbot_debate/backend/.env ]; then
    echo "⚠️  Thiếu file .env cho backend"
    ISSUES=$((ISSUES + 1))
fi

if [ $ISSUES -eq 0 ]; then
    echo "✅ Các service đều đang chạy. Có thể cần đợi thêm để khởi động hoàn tất."
else
    echo ""
    echo "🔧 ĐỀ XUẤT: Chạy lệnh sau để khắc phục:"
    echo "   bash fix_502_error.sh"
fi 