#!/bin/bash

echo "🔍 KIỂM TRA NHANH TRẠNG THÁI WEBSITE"
echo "===================================="
echo ""

# Kiểm tra Backend
echo "1️⃣ BACKEND (Port 5000):"
if pgrep -f "uvicorn main:app" > /dev/null; then
    echo "   ✅ Process: uvicorn đang chạy"
    PID=$(pgrep -f "uvicorn main:app")
    echo "   📋 PID: $PID"
elif pgrep -f "python3 main.py" > /dev/null; then
    echo "   ⚠️  Process: python3 main.py đang chạy (nên dùng uvicorn)"
    PID=$(pgrep -f "python3 main.py")
    echo "   📋 PID: $PID"
else
    echo "   ❌ Process: KHÔNG chạy"
fi

# Test API
echo "   🧪 API Test:"
API_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/api/admin/sessions 2>/dev/null)
if [ "$API_RESPONSE" = "200" ] || [ "$API_RESPONSE" = "405" ]; then
    echo "   ✅ API: Phản hồi OK (HTTP $API_RESPONSE)"
else
    echo "   ❌ API: Không phản hồi (HTTP $API_RESPONSE)"
fi

echo ""

# Kiểm tra Frontend
echo "2️⃣ FRONTEND (Port 3001):"
if pgrep -f "react-scripts" > /dev/null; then
    echo "   ✅ Process: React đang chạy"
    PID=$(pgrep -f "react-scripts")
    echo "   📋 PID: $PID"
else
    echo "   ❌ Process: KHÔNG chạy"
fi

# Test React
echo "   🧪 React Test:"
REACT_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001 2>/dev/null)
if [ "$REACT_RESPONSE" = "200" ]; then
    echo "   ✅ React: Phản hồi OK (HTTP $REACT_RESPONSE)"
else
    echo "   ❌ React: Không phản hồi (HTTP $REACT_RESPONSE)"
fi

echo ""

# Kiểm tra Nginx
echo "3️⃣ NGINX:"
if systemctl is-active --quiet nginx 2>/dev/null; then
    echo "   ✅ Service: Đang chạy"
else
    echo "   ❌ Service: KHÔNG chạy"
fi

echo ""

# Kiểm tra Website
echo "4️⃣ WEBSITE TEST:"
WEBSITE_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" https://mlndebate.io.vn/api/admin/sessions 2>/dev/null)
echo "   🌐 mlndebate.io.vn: HTTP $WEBSITE_RESPONSE"

case $WEBSITE_RESPONSE in
    200|405)
        echo "   🎉 WEBSITE HOẠT ĐỘNG BÌNH THƯỜNG!"
        ;;
    502)
        echo "   🚨 LỖI 502 BAD GATEWAY - Cần khắc phục"
        ;;
    *)
        echo "   ⚠️  Lỗi khác hoặc không thể kết nối"
        ;;
esac

echo ""

# Kiểm tra files quan trọng
echo "5️⃣ FILES QUAN TRỌNG:"
if [ -f /home/ubuntu/MLN_chatbot_debate/backend/.env ]; then
    echo "   ✅ backend/.env: Tồn tại"
else
    echo "   ❌ backend/.env: THIẾU - Cần tạo với GOOGLE_API_KEY"
fi

if [ -d /home/ubuntu/MLN_chatbot_debate/frontend/node_modules ]; then
    echo "   ✅ frontend/node_modules: Tồn tại"
else
    echo "   ❌ frontend/node_modules: THIẾU - Cần chạy npm install"
fi

echo ""

# Kết luận
echo "📋 TÓM TẮT:"
echo "==========="

if [ "$API_RESPONSE" = "200" ] || [ "$API_RESPONSE" = "405" ]; then
    if [ "$REACT_RESPONSE" = "200" ]; then
        if [ "$WEBSITE_RESPONSE" = "200" ] || [ "$WEBSITE_RESPONSE" = "405" ]; then
            echo "🎉 TẤT CẢ HOẠT ĐỘNG BÌNH THƯỜNG!"
        else
            echo "⚠️  Backend/Frontend OK nhưng website vẫn lỗi - Kiểm tra Nginx"
        fi
    else
        echo "⚠️  Backend OK, Frontend có vấn đề"
    fi
else
    echo "🚨 BACKEND KHÔNG HOẠT ĐỘNG - Đây là nguyên nhân chính!"
fi

echo ""
echo "🔧 KHẮC PHỤC:"
if [ "$WEBSITE_RESPONSE" = "502" ]; then
    echo "   sudo bash QUICK_FIX_502.sh"
else
    echo "   Hệ thống có vẻ ổn, có thể chỉ cần đợi thêm"
fi

echo ""
echo "📄 CHI TIẾT: Xem file 'HƯỚNG_DẪN_KHẮC_PHỤC_502.md'" 