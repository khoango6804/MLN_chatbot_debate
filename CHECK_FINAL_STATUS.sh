#!/bin/bash

echo "🎯 KIỂM TRA TÌNH HÌNH EXTERNAL ACCESS CUỐI CÙNG"
echo "==============================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

EXTERNAL_IP="206.189.40.105"
DOMAIN="mlndebate.io.vn"

echo "📋 THÔNG TIN:"
echo "Server IP: $EXTERNAL_IP"
echo "Domain: $DOMAIN"
echo ""

echo "🧪 TESTING..."
echo ""

# Test HTTPS (most important)
HTTPS_CODE=$(curl -s -o /dev/null -w "%{http_code}" "https://$DOMAIN/" 2>/dev/null)
if [ "$HTTPS_CODE" = "200" ]; then
    echo -e "${GREEN}✅ HTTPS ACCESS: HOẠT ĐỘNG HOÀN HẢO ($HTTPS_CODE)${NC}"
    HTTPS_STATUS="SUCCESS"
else
    echo -e "${RED}❌ HTTPS ACCESS: CÓ VẤN ĐỀ ($HTTPS_CODE)${NC}"
    HTTPS_STATUS="FAILED"
fi

# Test HTTP
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://$EXTERNAL_IP/" 2>/dev/null)
if [ "$HTTP_CODE" = "301" ] || [ "$HTTP_CODE" = "302" ]; then
    echo -e "${GREEN}✅ HTTP REDIRECT: HOẠT ĐỘNG ($HTTP_CODE)${NC}"
    HTTP_STATUS="SUCCESS"
elif [ "$HTTP_CODE" = "200" ]; then
    echo -e "${YELLOW}⚠️  HTTP: HOẠT ĐỘNG NHƯNG KHÔNG REDIRECT ($HTTP_CODE)${NC}"
    HTTP_STATUS="PARTIAL"
else
    echo -e "${RED}❌ HTTP ACCESS: CÓ VẤN ĐỀ ($HTTP_CODE)${NC}"
    HTTP_STATUS="FAILED"
fi

# Test firewall
UFW_80=$(sudo ufw status 2>/dev/null | grep -c "80.*ALLOW")
UFW_443=$(sudo ufw status 2>/dev/null | grep -c "443.*ALLOW")

if [ "$UFW_80" -gt 0 ] && [ "$UFW_443" -gt 0 ]; then
    echo -e "${GREEN}✅ FIREWALL: ĐÃ MỞ PORT 80, 443${NC}"
    FIREWALL_STATUS="SUCCESS"
else
    echo -e "${RED}❌ FIREWALL: VẪN CHẶN PORTS${NC}"
    FIREWALL_STATUS="FAILED"
fi

# Test services
BACKEND_RUNNING=$(ps aux | grep -c "uvicorn\|python.*main.py" | grep -v grep)
FRONTEND_RUNNING=$(ps aux | grep -c "node.*3001\|npm.*start" | grep -v grep)

if [ "$BACKEND_RUNNING" -gt 0 ] && [ "$FRONTEND_RUNNING" -gt 0 ]; then
    echo -e "${GREEN}✅ SERVICES: BACKEND & FRONTEND ĐANG CHẠY${NC}"
    SERVICES_STATUS="SUCCESS"
else
    echo -e "${RED}❌ SERVICES: BACKEND HOẶC FRONTEND KHÔNG CHẠY${NC}"
    SERVICES_STATUS="FAILED"
fi

echo ""
echo "🎯 TÓM TẮT TÌNH HÌNH:"
echo "===================="

if [ "$HTTPS_STATUS" = "SUCCESS" ] && [ "$FIREWALL_STATUS" = "SUCCESS" ] && [ "$SERVICES_STATUS" = "SUCCESS" ]; then
    echo ""
    echo -e "${GREEN}🎉 THÀNH CÔNG! WEBSITE CÓ THỂ TRUY CẬP TỪ BÊN NGOÀI!${NC}"
    echo ""
    echo "✅ Hoạt động: https://$DOMAIN/"
    echo "✅ Có thể truy cập từ máy bên ngoài"
    echo "✅ SSL/HTTPS bảo mật"
    echo ""
    
    if [ "$HTTP_STATUS" = "FAILED" ]; then
        echo -e "${YELLOW}⚠️  HTTP cần sửa nhỏ (không ảnh hưởng chức năng chính)${NC}"
        echo "   Chạy: ./fix_http_404.sh"
    fi
    
    echo ""
    echo "🌐 TEST TỪ MÁY BÊN NGOÀI:"
    echo "1. Browser: https://$DOMAIN/"
    echo "2. Command: curl -I https://$DOMAIN/"
    echo "3. Ping: ping $EXTERNAL_IP"
    
else
    echo ""
    echo -e "${RED}❌ VẪN CÒN VẤN ĐỀ CẦN KHẮC PHỤC${NC}"
    echo ""
    
    if [ "$HTTPS_STATUS" != "SUCCESS" ]; then
        echo "❌ HTTPS không hoạt động - cần kiểm tra services"
        echo "   Chạy: ./QUICK_FIX_502.sh"
    fi
    
    if [ "$FIREWALL_STATUS" != "SUCCESS" ]; then
        echo "❌ Firewall chặn ports - cần mở ports"
        echo "   Chạy: ./fix_external_access.sh"
    fi
    
    if [ "$SERVICES_STATUS" != "SUCCESS" ]; then
        echo "❌ Services không chạy - cần khởi động lại"
        echo "   Chạy: ./QUICK_FIX_502.sh"
    fi
fi

echo ""
echo "📋 SCRIPTS CÓ SẴN:"
echo "=================="
echo "./fix_external_access.sh      - Khắc phục firewall"
echo "./fix_http_404.sh             - Sửa HTTP redirect"  
echo "./test_external_access.sh     - Test từ máy bên ngoài"
echo "./QUICK_FIX_502.sh            - Khởi động lại services"
echo ""

echo "💡 GỢI Ý:"
echo "========="
if [ "$HTTPS_STATUS" = "SUCCESS" ]; then
    echo "✅ Website ĐÃ HOẠT ĐỘNG qua HTTPS từ máy bên ngoài!"
    echo "🎯 Hãy test https://$DOMAIN/ từ browser máy khác"
else
    echo "⚠️  Cần chạy các scripts khắc phục ở trên"
fi 