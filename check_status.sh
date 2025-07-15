#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

echo "🔍 KIỂM TRA TRẠNG THÁI HỆ THỐNG - $(date)"
echo "=========================================="

# Check backend
print_status "Kiểm tra Backend..."
if curl -s http://localhost:8000/api/health > /dev/null 2>&1; then
    print_success "✅ Backend: RUNNING (http://localhost:8000)"
    
    # Check API endpoints
    if curl -s http://localhost:8000/docs > /dev/null 2>&1; then
        print_success "   - API Docs: Available"
    else
        print_warning "   - API Docs: Not accessible"
    fi
else
    print_error "❌ Backend: NOT RUNNING"
    
    # Check if process exists
    if pgrep -f "uvicorn.*main:app" > /dev/null; then
        print_warning "   - Process exists but not responding"
    else
        print_error "   - No backend process found"
    fi
fi

# Check frontend
print_status "Kiểm tra Frontend..."
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    print_success "✅ Frontend: RUNNING (http://localhost:3000)"
else
    print_error "❌ Frontend: NOT RUNNING"
    
    # Check if process exists
    if pgrep -f "react-scripts" > /dev/null || pgrep -f "npm start" > /dev/null; then
        print_warning "   - Process exists but not responding"
    else
        print_error "   - No frontend process found"
    fi
fi

# Check nginx
print_status "Kiểm tra Nginx..."
if pgrep nginx > /dev/null; then
    print_success "✅ Nginx: RUNNING"
    
    # Check if nginx is listening on port 80
    if netstat -tlnp | grep :80 > /dev/null 2>&1; then
        print_success "   - Listening on port 80"
    else
        print_warning "   - Not listening on port 80"
    fi
else
    print_warning "⚠️ Nginx: NOT RUNNING"
fi

# Check ports
print_status "Kiểm tra Ports..."
echo "Port usage:"
netstat -tlnp 2>/dev/null | grep -E ":(3000|8000|80|443)" | while read line; do
    echo "   $line"
done

# Check disk space
print_status "Kiểm tra Disk Space..."
df -h | grep -E "(/$|/home)" | while read line; do
    echo "   $line"
done

# Check recent logs
print_status "Kiểm tra Logs gần đây..."
if [ -f "backend/backend.log" ]; then
    echo "Backend log (5 dòng cuối):"
    tail -5 backend/backend.log | sed 's/^/   /'
else
    print_warning "   - Không tìm thấy backend log"
fi

if [ -f "frontend/frontend.log" ]; then
    echo "Frontend log (5 dòng cuối):"
    tail -5 frontend/frontend.log | sed 's/^/   /'
else
    print_warning "   - Không tìm thấy frontend log"
fi

echo ""
echo "=========================================="
echo "🚀 LINKS:"
echo "=========================================="
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:8000"
echo "📚 API Docs: http://localhost:8000/docs"
echo ""
echo "📝 Commands:"
echo "   Reset all: ./reset_all_services.sh"
echo "   Check status: ./check_status.sh"
echo "" 