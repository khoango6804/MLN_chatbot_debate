#!/bin/bash

echo "🔍 KIỂM TRA NGINX CONFIGURATION CHO EXTERNAL ACCESS"
echo "================================================="
echo ""

echo "📋 Nginx configuration hiện tại:"
echo "================================"
sudo cat /etc/nginx/sites-enabled/mlndebate.io.vn
echo ""

echo "🔍 Kiểm tra listen directives:"
echo "============================="
sudo grep -n "listen" /etc/nginx/sites-enabled/mlndebate.io.vn
echo ""

echo "🌐 Kiểm tra server_name:"
echo "======================"
sudo grep -n "server_name" /etc/nginx/sites-enabled/mlndebate.io.vn
echo ""

echo "🎯 ĐỀ XUẤT SỬA LỖI:"
echo "=================="

# Check if nginx is listening on all interfaces
LISTEN_ALL_80=$(sudo grep -c "listen.*0\.0\.0\.0:80\|listen.*80" /etc/nginx/sites-enabled/mlndebate.io.vn)
LISTEN_ALL_443=$(sudo grep -c "listen.*0\.0\.0\.0:443\|listen.*443" /etc/nginx/sites-enabled/mlndebate.io.vn)
LISTEN_LOCALHOST=$(sudo grep -c "listen.*127\.0\.0\.1" /etc/nginx/sites-enabled/mlndebate.io.vn)

if [ "$LISTEN_LOCALHOST" -gt 0 ]; then
    echo "❌ PHÁT HIỆN VẤN ĐỀ: Nginx chỉ listen localhost (127.0.0.1)"
    echo "   Cần sửa thành listen 0.0.0.0 hoặc bỏ IP address"
    echo ""
elif [ "$LISTEN_ALL_80" -eq 0 ] || [ "$LISTEN_ALL_443" -eq 0 ]; then
    echo "⚠️  Cần kiểm tra: Nginx có thể chưa listen đúng ports"
    echo ""
else
    echo "✅ Nginx configuration có vẻ ổn"
    echo ""
fi

echo "🔧 Nếu cần sửa, configuration nên có dạng:"
echo "server {"
echo "    listen 80;"
echo "    listen [::]:80;"
echo "    listen 443 ssl;"
echo "    listen [::]:443 ssl;"
echo "    server_name mlndebate.io.vn www.mlndebate.io.vn;"
echo "    ..."
echo "}"
echo ""

echo "🧪 Test connectivity:"
echo "==================="
echo "Từ server này, test external IP:"
EXTERNAL_IP=$(curl -s http://checkip.amazonaws.com/ || curl -s http://icanhazip.com/)
echo "External IP: $EXTERNAL_IP"
echo ""

if [ ! -z "$EXTERNAL_IP" ]; then
    echo "Test HTTP to external IP:"
    curl -I "http://$EXTERNAL_IP/" 2>/dev/null | head -5
    echo ""
    
    echo "Test HTTPS to domain:"
    curl -I "https://mlndebate.io.vn/" 2>/dev/null | head -5
    echo ""
fi

echo "📞 HƯỚNG DẪN DEBUG TỪ MÁY BÊN NGOÀI:"
echo "===================================="
echo "1. Ping server:"
echo "   ping $EXTERNAL_IP"
echo ""
echo "2. Test port connectivity:"
echo "   telnet $EXTERNAL_IP 80"
echo "   telnet $EXTERNAL_IP 443"
echo ""
echo "3. Test HTTP/HTTPS:"
echo "   curl -v http://$EXTERNAL_IP/"
echo "   curl -v https://mlndebate.io.vn/"
echo ""
echo "4. Check DNS resolution:"
echo "   nslookup mlndebate.io.vn"
echo "   dig mlndebate.io.vn" 