#!/bin/bash

echo "🚀 Khởi động Backend API đúng cách..."

# Di chuyển vào thư mục backend
cd /home/ubuntu/MLN_chatbot_debate/backend

# Kill process cũ nếu có
pkill -f "uvicorn" 2>/dev/null
pkill -f "python3 main.py" 2>/dev/null
sleep 2

# Kiểm tra file .env
if [ ! -f .env ]; then
    echo "⚠️  CẢNH BÁO: File .env không tồn tại!"
    echo "Tạo file .env với 10 API key slots..."
    cat > .env << 'EOF'
# === GEMINI API KEYS - Hệ thống tự động chuyển đổi khi hết quota ===
# Thêm các API keys thực tế của bạn vào đây, thay thế các placeholder
# Hệ thống sẽ tự động thử key khác khi một key hết quota

GEMINI_API_KEY_1=your_gemini_api_key_1_here
GEMINI_API_KEY_2=your_gemini_api_key_2_here  
GEMINI_API_KEY_3=your_gemini_api_key_3_here
GEMINI_API_KEY_4=your_gemini_api_key_4_here
GEMINI_API_KEY_5=your_gemini_api_key_5_here
GEMINI_API_KEY_6=your_gemini_api_key_6_here
GEMINI_API_KEY_7=your_gemini_api_key_7_here
GEMINI_API_KEY_8=your_gemini_api_key_8_here
GEMINI_API_KEY_9=your_gemini_api_key_9_here
GEMINI_API_KEY_10=your_gemini_api_key_10_here

# Giữ lại GOOGLE_API_KEY để backward compatibility
GEMINI_API_KEY=your_gemini_api_key_primary_here

# === MÔI TRƯỜNG KHÁC ===
# MongoDB connection (nếu cần)
# MONGO_URI=mongodb://localhost:27017/

# Debug mode (optional)  
# DEBUG=true
EOF
    echo "✅ Đã tạo file .env với 10 API key slots!"
    echo "📝 Vui lòng thay thế các placeholder bằng API keys thực tế của bạn"
    echo "🔄 Hệ thống sẽ tự động chuyển đổi API key khi gặp lỗi quota"
fi

# Khởi động với uvicorn command line (đúng cách)
echo "🔧 Khởi động backend với uvicorn..."
nohup uvicorn main:app --host 0.0.0.0 --port 5000 --reload > backend_uvicorn.log 2>&1 &
BACKEND_PID=$!

echo "Backend PID: $BACKEND_PID"
echo "⏳ Đợi backend khởi động..."
sleep 8

# Kiểm tra backend
echo "🧪 Kiểm tra backend..."
for i in {1..10}; do
    if curl -s -f http://localhost:5000/api/admin/sessions > /dev/null 2>&1; then
        echo "✅ Backend đã sẵn sàng!"
        echo "📍 Backend API: http://localhost:5000"
        echo "📍 API Docs: http://localhost:5000/docs"
        exit 0
    else
        echo "   Thử lần $i/10..."
        sleep 2
    fi
done

echo "❌ Backend chưa sẵn sàng sau 20 giây. Kiểm tra log:"
echo ""
echo "=== BACKEND LOG ==="
tail -20 backend_uvicorn.log
echo "===================" 