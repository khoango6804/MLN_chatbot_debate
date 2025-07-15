#!/bin/bash

echo "🔧 KHẮC PHỤC LỖI API 404 - Backend Issues"
echo "========================================"
echo ""

echo "🛑 BƯỚC 1: Dừng tất cả backend processes..."
# Kill tất cả các backend processes có thể
sudo pkill -f "uvicorn" 2>/dev/null
sudo pkill -f "python3 main.py" 2>/dev/null
sudo pkill -f "main:app" 2>/dev/null

# Kill processes đang sử dụng port 5000
sudo lsof -ti:5000 | xargs -r sudo kill -9 2>/dev/null

sleep 3
echo "✅ Đã dừng tất cả backend processes"

echo ""
echo "🚀 BƯỚC 2: Khởi động Backend với uvicorn..."
cd /home/ubuntu/MLN_chatbot_debate/backend

# Đảm bảo có file .env
if [ ! -f .env ]; then
    echo "📝 Tạo file .env..."
    cat > .env << 'EOF'
GOOGLE_API_KEY=your_google_gemini_api_key_here
EOF
    echo "⚠️  LƯU Ý: Cần cập nhật GOOGLE_API_KEY trong .env"
fi

# Khởi động backend với uvicorn
echo "🔧 Khởi động uvicorn..."
nohup uvicorn main:app --host 0.0.0.0 --port 5000 --reload > api_fix.log 2>&1 &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

echo ""
echo "⏳ BƯỚC 3: Đợi backend khởi động..."
for i in {1..20}; do
    echo "   Kiểm tra lần $i/20..."
    
    # Test với curl
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/api/admin/sessions 2>/dev/null)
    
    if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "405" ]; then
        echo "✅ Backend API sẵn sàng! (HTTP $HTTP_CODE)"
        break
    elif [ "$HTTP_CODE" = "404" ]; then
        echo "⚠️  Backend chạy nhưng endpoint 404. Kiểm tra routing..."
        # Test root endpoint
        ROOT_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/ 2>/dev/null)
        echo "   Root endpoint /: HTTP $ROOT_CODE"
        
        # Test docs endpoint
        DOCS_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/docs 2>/dev/null)
        echo "   Docs endpoint /docs: HTTP $DOCS_CODE"
        break
    else
        echo "   HTTP $HTTP_CODE - Đang khởi động..."
        sleep 3
    fi
    
    if [ $i -eq 20 ]; then
        echo "❌ Backend không khởi động sau 1 phút"
        echo ""
        echo "=== BACKEND LOG ==="
        tail -20 api_fix.log
        echo "==================="
        exit 1
    fi
done

echo ""
echo "🧪 BƯỚC 4: Test các API endpoints..."

# Test các endpoints quan trọng
echo "Testing endpoints:"

endpoints=(
    "/api/admin/sessions"
    "/docs"
    "/"
    "/api/admin/live-scoring"
)

for endpoint in "${endpoints[@]}"; do
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:5000$endpoint" 2>/dev/null)
    if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "405" ]; then
        echo "   ✅ $endpoint: HTTP $HTTP_CODE"
    else
        echo "   ❌ $endpoint: HTTP $HTTP_CODE"
    fi
done

echo ""
echo "🔄 BƯỚC 5: Restart Nginx..."
sudo systemctl restart nginx
sleep 2

echo ""
echo "🌐 BƯỚC 6: Test website API..."
WEBSITE_API=$(curl -s -o /dev/null -w "%{http_code}" https://mlndebate.io.vn/api/admin/sessions 2>/dev/null)
echo "Website API: HTTP $WEBSITE_API"

if [ "$WEBSITE_API" = "200" ] || [ "$WEBSITE_API" = "405" ]; then
    echo "🎉 THÀNH CÔNG! API đã hoạt động bình thường"
    echo "✅ Truy cập: https://mlndebate.io.vn/admin"
elif [ "$WEBSITE_API" = "404" ]; then
    echo "⚠️  Vẫn lỗi 404. Có thể do:"
    echo "   - Backend routing có vấn đề"
    echo "   - API endpoints không được định nghĩa đúng"
    echo "   - FastAPI app configuration"
elif [ "$WEBSITE_API" = "502" ]; then
    echo "❌ Vẫn lỗi 502. Backend chưa sẵn sàng hoàn toàn"
else
    echo "⚠️  Lỗi khác: HTTP $WEBSITE_API"
fi

echo ""
echo "📊 TÓM TẮT:"
echo "Backend PID: $BACKEND_PID"
echo "Log file: /home/ubuntu/MLN_chatbot_debate/backend/api_fix.log"
echo ""
echo "🔍 KIỂM TRA THÊM:"
echo "  - FastAPI docs: http://localhost:5000/docs"
echo "  - Backend log: tail -f /home/ubuntu/MLN_chatbot_debate/backend/api_fix.log"
echo "  - Test API: curl http://localhost:5000/api/admin/sessions" 