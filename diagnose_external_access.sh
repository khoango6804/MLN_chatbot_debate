#!/bin/bash

echo "🩺 CHẨN ĐOÁN TOÀN DIỆN EXTERNAL ACCESS"
echo "====================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    if [ "$2" = "OK" ]; then
        echo -e "${GREEN}✅ $1${NC}"
    elif [ "$2" = "WARNING" ]; then
        echo -e "${YELLOW}⚠️  $1${NC}"
    else
        echo -e "${RED}❌ $1${NC}"
    fi
}

echo "🔍 1. KIỂM TRA SERVICES"
echo "======================"

# Check backend
BACKEND_RUNNING=$(ps aux | grep -c "uvicorn\|python.*main.py" | grep -v grep)
if [ "$BACKEND_RUNNING" -gt 0 ]; then
    print_status "Backend service đang chạy" "OK"
else
    print_status "Backend service KHÔNG chạy" "ERROR"
fi

# Check frontend
FRONTEND_RUNNING=$(ps aux | grep -c "node.*3001\|npm.*start" | grep -v grep)
if [ "$FRONTEND_RUNNING" -gt 0 ]; then
    print_status "Frontend service đang chạy" "OK"
else
    print_status "Frontend service KHÔNG chạy" "ERROR"
fi

# Check nginx
NGINX_RUNNING=$(systemctl is-active nginx 2>/dev/null)
if [ "$NGINX_RUNNING" = "active" ]; then
    print_status "Nginx đang chạy" "OK"
else
    print_status "Nginx KHÔNG chạy" "ERROR"
fi

echo ""
echo "🔍 2. KIỂM TRA NETWORK"
echo "===================="

# Check external IP
EXTERNAL_IP=$(curl -s http://checkip.amazonaws.com/ 2>/dev/null || curl -s http://icanhazip.com/ 2>/dev/null)
if [ ! -z "$EXTERNAL_IP" ]; then
    print_status "External IP: $EXTERNAL_IP" "OK"
else
    print_status "Không lấy được external IP" "WARNING"
fi

# Check listening ports
NGINX_80=$(netstat -tulpn 2>/dev/null | grep ":80.*nginx")
NGINX_443=$(netstat -tulpn 2>/dev/null | grep ":443.*nginx")

if [ ! -z "$NGINX_80" ]; then
    print_status "Nginx listening port 80" "OK"
else
    print_status "Nginx KHÔNG listen port 80" "ERROR"
fi

if [ ! -z "$NGINX_443" ]; then
    print_status "Nginx listening port 443" "OK"
else
    print_status "Nginx KHÔNG listen port 443" "ERROR"
fi

echo ""
echo "🔍 3. KIỂM TRA FIREWALL"
echo "====================="

# Check UFW status
UFW_STATUS=$(ufw status 2>/dev/null | head -1)
echo "UFW Status: $UFW_STATUS"

if echo "$UFW_STATUS" | grep -q "active"; then
    UFW_80=$(ufw status | grep -c "80/tcp.*ALLOW")
    UFW_443=$(ufw status | grep -c "443/tcp.*ALLOW")
    
    if [ "$UFW_80" -gt 0 ]; then
        print_status "UFW cho phép port 80" "OK"
    else
        print_status "UFW CHẶN port 80" "ERROR"
    fi
    
    if [ "$UFW_443" -gt 0 ]; then
        print_status "UFW cho phép port 443" "OK"
    else
        print_status "UFW CHẶN port 443" "ERROR"
    fi
else
    print_status "UFW không active" "WARNING"
fi

echo ""
echo "🔍 4. KIỂM TRA NGINX CONFIG"
echo "=========================="

# Check nginx configuration
if [ -f "/etc/nginx/sites-enabled/mlndebate.io.vn" ]; then
    print_status "Nginx config file tồn tại" "OK"
    
    # Check listen directives
    LISTEN_LOCALHOST=$(grep -c "listen.*127\.0\.0\.1" /etc/nginx/sites-enabled/mlndebate.io.vn 2>/dev/null)
    if [ "$LISTEN_LOCALHOST" -gt 0 ]; then
        print_status "Nginx chỉ listen localhost (127.0.0.1)" "ERROR"
    else
        print_status "Nginx listen tất cả interfaces" "OK"
    fi
    
    # Test nginx syntax
    if nginx -t >/dev/null 2>&1; then
        print_status "Nginx syntax OK" "OK"
    else
        print_status "Nginx syntax có LỖI" "ERROR"
    fi
else
    print_status "Nginx config file KHÔNG tồn tại" "ERROR"
fi

echo ""
echo "🔍 5. KIỂM TRA CONNECTIVITY"
echo "=========================="

# Test local connections
LOCAL_HTTP=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/ 2>/dev/null)
LOCAL_HTTPS=$(curl -s -o /dev/null -w "%{http_code}" https://mlndebate.io.vn/ 2>/dev/null)

if [ "$LOCAL_HTTP" = "200" ] || [ "$LOCAL_HTTP" = "301" ] || [ "$LOCAL_HTTP" = "302" ]; then
    print_status "Local HTTP connection: $LOCAL_HTTP" "OK"
else
    print_status "Local HTTP connection FAILED: $LOCAL_HTTP" "ERROR"
fi

if [ "$LOCAL_HTTPS" = "200" ] || [ "$LOCAL_HTTPS" = "301" ] || [ "$LOCAL_HTTPS" = "302" ]; then
    print_status "Local HTTPS connection: $LOCAL_HTTPS" "OK"
else
    print_status "Local HTTPS connection FAILED: $LOCAL_HTTPS" "ERROR"
fi

echo ""
echo "🔍 6. KIỂM TRA DNS"
echo "=================="

# Check DNS resolution
DNS_RESULT=$(nslookup mlndebate.io.vn 2>/dev/null | grep -c "Address:")
if [ "$DNS_RESULT" -gt 1 ]; then
    print_status "DNS resolution OK" "OK"
else
    print_status "DNS resolution có vấn đề" "WARNING"
fi

echo ""
echo "📋 TÓM TẮT VÀ KHUYẾN NGHỊ"
echo "========================"

echo ""
echo "🌐 THÔNG TIN SERVER:"
echo "External IP: $EXTERNAL_IP"
echo "Local HTTP: $LOCAL_HTTP"
echo "Local HTTPS: $LOCAL_HTTPS"
echo ""

echo "🔧 HÀNH ĐỘNG CẦN THỰC HIỆN:"

# Recommendations based on checks
if [ "$BACKEND_RUNNING" -eq 0 ] || [ "$FRONTEND_RUNNING" -eq 0 ]; then
    echo "1. ⚠️  Khởi động lại services:"
    echo "   ./QUICK_FIX_502.sh"
fi

if [ "$LISTEN_LOCALHOST" -gt 0 ]; then
    echo "2. ⚠️  Sửa nginx config:"
    echo "   ./fix_nginx_external.sh"
fi

UFW_NEEDS_FIX=$(ufw status 2>/dev/null | grep -c "Status: active")
if [ "$UFW_NEEDS_FIX" -gt 0 ]; then
    UFW_80_MISSING=$(ufw status | grep -c "80/tcp.*ALLOW")
    UFW_443_MISSING=$(ufw status | grep -c "443/tcp.*ALLOW")
    if [ "$UFW_80_MISSING" -eq 0 ] || [ "$UFW_443_MISSING" -eq 0 ]; then
        echo "3. ⚠️  Mở firewall ports:"
        echo "   sudo ufw allow 80/tcp"
        echo "   sudo ufw allow 443/tcp"
    fi
fi

echo ""
echo "🧪 TEST TỪ MÁY BÊN NGOÀI:"
echo "ping $EXTERNAL_IP"
echo "curl -I http://$EXTERNAL_IP/"
echo "curl -I https://mlndebate.io.vn/"
echo ""

echo "☁️ NẾU VẪN KHÔNG ĐƯỢC, KIỂM TRA CLOUD:"
echo "- AWS: Security Groups EC2"
echo "- GCP: VPC Firewall Rules"
echo "- Azure: Network Security Groups" 