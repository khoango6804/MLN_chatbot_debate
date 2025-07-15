#!/bin/bash

echo "🚀 ULTIMATE FIX: WEBSOCKET + API 404 ISSUES"
echo "==========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🎯 Đây là script tổng hợp để khắc phục:${NC}"
echo "1. ❌ WebSocket Insecure errors (mobile)"
echo "2. ❌ API 404 admin/sessions errors"
echo "3. ❌ HTTPS/HTTP mixed content issues"
echo ""

read -p "📋 Bạn có muốn tiếp tục? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Đã hủy"
    exit 1
fi

echo ""
echo -e "${YELLOW}🔧 BƯỚC 1: THÊM ADMIN ROUTES VÀO BACKEND${NC}"
echo "==========================================="

# Run Python script to add admin routes
echo "Chạy add_admin_routes.py..."
chmod +x add_admin_routes.py
python3 add_admin_routes.py

echo ""
echo -e "${YELLOW}🔧 BƯỚC 2: SỬA FRONTEND CONFIGURATION${NC}"
echo "======================================"

# Run frontend config fix
echo "Chạy fix_frontend_config.sh..."
chmod +x fix_frontend_config.sh
./fix_frontend_config.sh

echo ""
echo -e "${YELLOW}🔧 BƯỚC 3: CHẠY WEBSOCKET + API FIX${NC}"
echo "=================================="

# Run main websocket/API fix
echo "Chạy fix_websocket_api_issues.sh..."
chmod +x fix_websocket_api_issues.sh
./fix_websocket_api_issues.sh

echo ""
echo -e "${YELLOW}🔧 BƯỚC 4: WAIT FOR SERVICES TO START${NC}"
echo "====================================="

echo "⏳ Đợi services khởi động (30 giây)..."
for i in {30..1}; do
    echo -ne "\rCountdown: $i giây... "
    sleep 1
done
echo ""

echo ""
echo -e "${YELLOW}🧪 BƯỚC 5: FINAL TESTING${NC}"
echo "========================"

echo "Testing endpoints..."

# Test all endpoints
FRONTEND_LOCAL=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/ 2>/dev/null)
BACKEND_LOCAL=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/api/health 2>/dev/null)
ADMIN_LOCAL=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/api/admin/sessions 2>/dev/null)

FRONTEND_HTTPS=$(curl -s -o /dev/null -w "%{http_code}" https://mlndebate.io.vn/ 2>/dev/null)
API_HTTPS=$(curl -s -o /dev/null -w "%{http_code}" https://mlndebate.io.vn/api/health 2>/dev/null)
ADMIN_HTTPS=$(curl -s -o /dev/null -w "%{http_code}" https://mlndebate.io.vn/api/admin/sessions 2>/dev/null)

echo ""
echo "📊 TEST RESULTS:"
echo "==============="
echo "Local Frontend:     $FRONTEND_LOCAL"
echo "Local Backend:      $BACKEND_LOCAL"
echo "Local Admin API:    $ADMIN_LOCAL"
echo ""
echo "HTTPS Frontend:     $FRONTEND_HTTPS"
echo "HTTPS API:          $API_HTTPS"
echo "HTTPS Admin API:    $ADMIN_HTTPS"

echo ""
echo -e "${BLUE}🎯 FINAL VERDICT:${NC}"
echo "================="

# Count successful tests
SUCCESS_COUNT=0
TOTAL_TESTS=6

if [ "$FRONTEND_LOCAL" = "200" ]; then ((SUCCESS_COUNT++)); fi
if [ "$BACKEND_LOCAL" = "200" ]; then ((SUCCESS_COUNT++)); fi
if [ "$ADMIN_LOCAL" = "200" ]; then ((SUCCESS_COUNT++)); fi
if [ "$FRONTEND_HTTPS" = "200" ]; then ((SUCCESS_COUNT++)); fi
if [ "$API_HTTPS" = "200" ]; then ((SUCCESS_COUNT++)); fi
if [ "$ADMIN_HTTPS" = "200" ]; then ((SUCCESS_COUNT++)); fi

PERCENTAGE=$((SUCCESS_COUNT * 100 / TOTAL_TESTS))

if [ $SUCCESS_COUNT -eq $TOTAL_TESTS ]; then
    echo -e "${GREEN}🎉 HOÀN TOÀN THÀNH CÔNG! ($SUCCESS_COUNT/$TOTAL_TESTS tests passed)${NC}"
    echo ""
    echo "✅ Website: https://mlndebate.io.vn/"
    echo "✅ API: https://mlndebate.io.vn/api/health"
    echo "✅ Admin: https://mlndebate.io.vn/api/admin/sessions"
    echo "✅ WebSocket: wss://mlndebate.io.vn/ws"
    echo ""
    echo -e "${GREEN}🌟 WEBSITE ĐÃ HOẠT ĐỘNG HOÀN HẢO!${NC}"
    echo ""
    echo "📱 ACTIONS NEEDED:"
    echo "1. Ctrl+F5 (hard refresh) trên browser"
    echo "2. Clear browser cache"
    echo "3. Test trên mobile/other devices"
    
elif [ $PERCENTAGE -ge 66 ]; then
    echo -e "${YELLOW}⚠️  GẦN THÀNH CÔNG ($SUCCESS_COUNT/$TOTAL_TESTS tests passed - $PERCENTAGE%)${NC}"
    echo ""
    echo "🔍 CÒN VẤN ĐỀ:"
    
    if [ "$ADMIN_LOCAL" != "200" ] || [ "$ADMIN_HTTPS" != "200" ]; then
        echo "❌ Admin API routes cần kiểm tra thêm"
        echo "   Chạy: cd backend && cat main.py | grep admin"
    fi
    
    if [ "$FRONTEND_HTTPS" != "200" ] || [ "$API_HTTPS" != "200" ]; then
        echo "❌ HTTPS endpoints cần restart nginx"
        echo "   Chạy: sudo systemctl restart nginx"
    fi
    
else
    echo -e "${RED}❌ VẪN CÓ NHIỀU VẤN ĐỀ ($SUCCESS_COUNT/$TOTAL_TESTS tests passed - $PERCENTAGE%)${NC}"
    echo ""
    echo "🔍 TROUBLESHOOTING:"
    echo "1. Kiểm tra logs:"
    echo "   tail -20 backend.log"
    echo "   tail -20 frontend_new.log"
    echo ""
    echo "2. Restart services manually:"
    echo "   ./QUICK_FIX_502.sh"
    echo ""
    echo "3. Kiểm tra ports:"
    echo "   netstat -tulpn | grep -E '3001|5000'"
fi

echo ""
echo -e "${BLUE}📋 FILES CREATED/MODIFIED:${NC}"
echo "=========================="
echo "✅ add_admin_routes.py - Thêm admin API routes"
echo "✅ fix_frontend_config.sh - Sửa frontend config"
echo "✅ fix_websocket_api_issues.sh - Khắc phục WebSocket/API"
echo "✅ frontend/.env - Environment variables mới"
echo "✅ frontend/src/setupProxy.js - Proxy configuration"
echo "✅ backend/main.py - Có thể đã thêm admin routes"

echo ""
echo -e "${GREEN}🚀 WEBSITE STATUS: READY FOR TESTING!${NC}"
echo ""
echo "🌐 TEST NGAY:"
echo "============"
echo "1. Browser: https://mlndebate.io.vn/"
echo "2. Admin: https://mlndebate.io.vn/ (click Admin button)"
echo "3. Mobile: Same URLs from mobile device"
echo ""

if [ $SUCCESS_COUNT -eq $TOTAL_TESTS ]; then
    echo -e "${GREEN}🎊 CONGRATULATIONS! VẤN ĐỀ ĐÃ ĐƯỢC KHẮC PHỤC HOÀN TOÀN!${NC}"
fi 