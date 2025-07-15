#!/bin/bash

echo "🔄 BẮT ĐẦU RESET TOÀN BỘ HỆ THỐNG - $(date)"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Step 1: Stop all services
print_status "Bước 1: Dừng tất cả các dịch vụ..."

# Kill all Node.js processes (React)
print_status "Dừng tất cả React processes..."
pkill -f "react-scripts" 2>/dev/null || true
pkill -f "npm start" 2>/dev/null || true
pkill -f "node.*react" 2>/dev/null || true

# Kill all Python/FastAPI processes
print_status "Dừng tất cả FastAPI processes..."
pkill -f "uvicorn.*main:app" 2>/dev/null || true
pkill -f "python.*main.py" 2>/dev/null || true
pkill -f "fastapi" 2>/dev/null || true

# Kill all nginx processes
print_status "Dừng nginx..."
sudo pkill nginx 2>/dev/null || true
sudo systemctl stop nginx 2>/dev/null || true

# Kill any remaining processes on common ports
print_status "Giải phóng các port..."
sudo fuser -k 3000/tcp 2>/dev/null || true  # React port
sudo fuser -k 8000/tcp 2>/dev/null || true  # FastAPI port
sudo fuser -k 80/tcp 2>/dev/null || true    # HTTP port
sudo fuser -k 443/tcp 2>/dev/null || true   # HTTPS port

sleep 3
print_success "Đã dừng tất cả dịch vụ"

# Step 2: Clean up logs and temporary files
print_status "Bước 2: Dọn dẹp logs và files tạm thời..."

# Backend cleanup
cd backend 2>/dev/null || { print_error "Thư mục backend không tồn tại"; exit 1; }
rm -f *.log nohup.out 2>/dev/null || true
rm -rf __pycache__ 2>/dev/null || true
print_success "Đã dọn dẹp backend logs"

# Frontend cleanup
cd ../frontend 2>/dev/null || { print_error "Thư mục frontend không tồn tại"; exit 1; }
rm -f *.log nohup.out 2>/dev/null || true
rm -rf build 2>/dev/null || true
print_success "Đã dọn dẹp frontend logs và build"

# Root cleanup
cd ..
rm -f *.log 2>/dev/null || true
print_success "Đã dọn dẹp root logs"

# Step 3: Reset backend
print_status "Bước 3: Reset Backend..."
cd backend

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    print_status "Tạo virtual environment mới..."
    python3 -m venv venv
fi

# Activate virtual environment
print_status "Kích hoạt virtual environment..."
source venv/bin/activate

# Install/update dependencies
print_status "Cài đặt dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

print_success "Backend đã được reset"

# Step 4: Reset frontend
print_status "Bước 4: Reset Frontend..."
cd ../frontend

# Check if node_modules exists, if not install
if [ ! -d "node_modules" ]; then
    print_status "Cài đặt npm dependencies..."
    npm install
else
    print_status "Cập nhật npm dependencies..."
    npm ci
fi

print_success "Frontend đã được reset"

# Step 5: Start backend
print_status "Bước 5: Khởi động Backend..."
cd ../backend

# Start backend in background
print_status "Đang khởi động FastAPI server..."
source venv/bin/activate
nohup uvicorn main:app --host 0.0.0.0 --port 8000 --reload > backend.log 2>&1 &
BACKEND_PID=$!

# Wait for backend to start
sleep 5

# Check if backend is running
if curl -s http://localhost:8000/health > /dev/null 2>&1; then
    print_success "Backend đang chạy tại http://localhost:8000"
    echo "Backend PID: $BACKEND_PID" > backend.pid
else
    print_warning "Backend có thể đang khởi động, kiểm tra log: tail -f backend/backend.log"
fi

# Step 6: Start frontend
print_status "Bước 6: Khởi động Frontend..."
cd ../frontend

# Start frontend in background
print_status "Đang khởi động React server..."
export REACT_APP_API_URL=https://mlndebate.io.vn/api
nohup npm start > frontend.log 2>&1 &
FRONTEND_PID=$!

# Wait for frontend to start
sleep 10

# Check if frontend is running
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    print_success "Frontend đang chạy tại http://localhost:3000"
    echo "Frontend PID: $FRONTEND_PID" > frontend.pid
else
    print_warning "Frontend có thể đang khởi động, kiểm tra log: tail -f frontend/frontend.log"
fi

# Step 7: Configure nginx (if needed)
print_status "Bước 7: Cấu hình nginx..."
cd ..

# Check if nginx config exists and restart nginx
if [ -f "frontend/nginx.conf" ]; then
    print_status "Khởi động lại nginx..."
    sudo systemctl start nginx 2>/dev/null || print_warning "Không thể khởi động nginx"
fi

# Step 8: Final status check
print_status "Bước 8: Kiểm tra trạng thái cuối cùng..."

echo ""
echo "=========================================="
echo "📊 TRẠNG THÁI CÁC DỊCH VỤ:"
echo "=========================================="

# Check backend
if curl -s http://localhost:8000/health > /dev/null 2>&1; then
    print_success "✅ Backend: RUNNING (http://localhost:8000)"
else
    print_error "❌ Backend: NOT RUNNING"
fi

# Check frontend
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    print_success "✅ Frontend: RUNNING (http://localhost:3000)"
else
    print_error "❌ Frontend: NOT RUNNING"
fi

# Check nginx
if pgrep nginx > /dev/null; then
    print_success "✅ Nginx: RUNNING"
else
    print_warning "⚠️ Nginx: NOT RUNNING"
fi

echo ""
echo "=========================================="
echo "🚀 HƯỚNG DẪN SỬ DỤNG:"
echo "=========================================="
echo "1. Truy cập ứng dụng: http://localhost:3000"
echo "2. API Backend: http://localhost:8000"
echo "3. API Docs: http://localhost:8000/docs"
echo ""
echo "📝 Kiểm tra logs:"
echo "   Backend: tail -f backend/backend.log"
echo "   Frontend: tail -f frontend/frontend.log"
echo ""
echo "🛑 Dừng dịch vụ:"
echo "   Backend: kill \$(cat backend/backend.pid)"
echo "   Frontend: kill \$(cat frontend/frontend.pid)"
echo ""

print_success "🎉 RESET HOÀN TẤT - $(date)"

# Save process info
cd backend
echo "Backend PID: $BACKEND_PID" > backend.pid
echo "Started at: $(date)" >> backend.pid

cd ../frontend  
echo "Frontend PID: $FRONTEND_PID" > frontend.pid
echo "Started at: $(date)" >> frontend.pid

cd ..
echo "Reset completed at: $(date)" > last_reset.log
echo "Backend PID: $BACKEND_PID" >> last_reset.log
echo "Frontend PID: $FRONTEND_PID" >> last_reset.log 