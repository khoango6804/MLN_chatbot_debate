#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

echo ""
echo "🎉 ====================================="
echo "    HỆ THỐNG ĐÃ ĐƯỢC RESET THÀNH CÔNG!"
echo "======================================"
echo ""

# Check backend
if curl -s http://localhost:8000/api/health > /dev/null 2>&1; then
    print_success "✅ Backend: RUNNING"
    echo "   📍 URL: http://localhost:8000"
    echo "   📚 API Docs: http://localhost:8000/docs"
else
    echo -e "${RED}❌ Backend: NOT RUNNING${NC}"
fi

echo ""

# Check frontend on different ports
FRONTEND_PORT=""
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    FRONTEND_PORT="3000"
elif curl -s http://localhost:3001 > /dev/null 2>&1; then
    FRONTEND_PORT="3001"
fi

if [ -n "$FRONTEND_PORT" ]; then
    print_success "✅ Frontend: RUNNING"
    echo "   📍 URL: http://localhost:$FRONTEND_PORT"
    echo "   🌐 Access: http://localhost:$FRONTEND_PORT"
else
    echo -e "${RED}❌ Frontend: NOT RUNNING${NC}"
fi

echo ""

# Check nginx
if pgrep nginx > /dev/null; then
    print_success "✅ Nginx: RUNNING"
    echo "   📍 Port 80: http://localhost"
    if [ -n "$FRONTEND_PORT" ]; then
        echo "   🔄 Proxying to React on port $FRONTEND_PORT"
    fi
else
    echo -e "${YELLOW}⚠️ Nginx: NOT RUNNING${NC}"
fi

echo ""
echo "======================================"
echo "🚀 CÁCH SỬ DỤNG:"
echo "======================================"
if [ -n "$FRONTEND_PORT" ]; then
    echo "1. 🌐 Truy cập ứng dụng: http://localhost:$FRONTEND_PORT"
else
    echo "1. ❌ Frontend chưa sẵn sàng"
fi
echo "2. 🔧 API Backend: http://localhost:8000"
echo "3. 📚 API Documentation: http://localhost:8000/docs"
echo "4. 🌍 Nginx (nếu có): http://localhost"
echo ""
echo "📝 Kiểm tra logs:"
echo "   Backend: tail -f backend/backend.log"
echo "   Frontend: tail -f frontend/frontend.log"
echo ""
echo "🔄 Commands hữu ích:"
echo "   ./reset_all_services.sh  - Reset toàn bộ hệ thống"
echo "   ./check_status.sh        - Kiểm tra trạng thái"
echo "   ./final_status.sh        - Hiển thị thông tin này"
echo ""
print_success "🎯 Hệ thống đã sẵn sàng sử dụng!"
echo "" 