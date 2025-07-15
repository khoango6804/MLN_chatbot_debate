#!/bin/bash

echo "🔧 SỬA NGINX CONFIGURATION CHO EXTERNAL ACCESS"
echo "=============================================="
echo ""

# Backup existing configuration
echo "📦 Backup nginx configuration..."
sudo cp /etc/nginx/sites-enabled/mlndebate.io.vn /etc/nginx/sites-enabled/mlndebate.io.vn.backup.$(date +%Y%m%d_%H%M%S)
echo "✅ Backup completed"
echo ""

echo "🔍 Kiểm tra configuration hiện tại..."
sudo grep -n "listen" /etc/nginx/sites-enabled/mlndebate.io.vn
echo ""

# Check if listening on localhost only
LOCALHOST_ONLY=$(sudo grep -c "listen.*127\.0\.0\.1" /etc/nginx/sites-enabled/mlndebate.io.vn)

if [ "$LOCALHOST_ONLY" -gt 0 ]; then
    echo "❌ Phát hiện nginx chỉ listen localhost"
    echo "🔧 Đang sửa..."
    
    # Replace localhost bindings with all interfaces
    sudo sed -i 's/listen 127\.0\.0\.1:80/listen 80/g' /etc/nginx/sites-enabled/mlndebate.io.vn
    sudo sed -i 's/listen 127\.0\.0\.1:443/listen 443/g' /etc/nginx/sites-enabled/mlndebate.io.vn
    
    echo "✅ Đã sửa listen directives"
else
    echo "✅ Nginx đã listen trên tất cả interfaces"
fi

echo ""
echo "📋 Configuration sau khi sửa:"
sudo grep -n "listen" /etc/nginx/sites-enabled/mlndebate.io.vn
echo ""

echo "🧪 Test nginx configuration..."
if sudo nginx -t; then
    echo "✅ Nginx configuration syntax OK"
    
    echo "🔄 Restart nginx..."
    sudo systemctl reload nginx
    sudo systemctl status nginx --no-pager -l
    echo ""
    
    echo "🧪 Test website access..."
    echo "HTTP test:"
    curl -I http://localhost/ 2>/dev/null | head -3
    echo ""
    
    echo "HTTPS test:"
    curl -I https://mlndebate.io.vn/ 2>/dev/null | head -3
    echo ""
    
    echo "✅ Website fix completed!"
    echo ""
    echo "🌐 Bây giờ hãy test từ máy bên ngoài:"
    EXTERNAL_IP=$(curl -s http://checkip.amazonaws.com/ 2>/dev/null || curl -s http://icanhazip.com/ 2>/dev/null)
    echo "Server IP: $EXTERNAL_IP"
    echo "Test URL: http://$EXTERNAL_IP/"
    echo "Test URL: https://mlndebate.io.vn/"
    
else
    echo "❌ Nginx configuration có lỗi syntax"
    echo "🔄 Khôi phục backup..."
    sudo cp /etc/nginx/sites-enabled/mlndebate.io.vn.backup.* /etc/nginx/sites-enabled/mlndebate.io.vn
    echo "⚠️  Đã khôi phục configuration cũ"
fi 