#!/bin/bash

echo "🔧 KHẮC PHỤC HTTP 404 VÀ NGINX CONFLICTS"
echo "========================================"
echo ""

echo "🔍 BƯỚC 1: Kiểm tra nginx configuration files..."
echo "Các nginx config files:"
ls -la /etc/nginx/sites-enabled/
echo ""

echo "🔍 BƯỚC 2: Kiểm tra conflicting configurations..."
echo "Tìm duplicate server names:"
sudo grep -r "server_name.*mlndebate.io.vn" /etc/nginx/sites-enabled/
echo ""

echo "🔍 BƯỚC 3: Kiểm tra HTTP redirect configuration..."
echo "HTTP server block trong main config:"
sudo grep -A 20 -B 5 "listen.*80" /etc/nginx/sites-enabled/mlndebate.io.vn
echo ""

echo "🔧 BƯỚC 4: Backup và kiểm tra default nginx config..."
if [ -f "/etc/nginx/sites-enabled/default" ]; then
    echo "⚠️  Tìm thấy default config có thể conflict"
    sudo mv /etc/nginx/sites-enabled/default /etc/nginx/sites-enabled/default.disabled
    echo "✅ Đã disable default config"
else
    echo "✅ Không có default config conflict"
fi
echo ""

echo "🔧 BƯỚC 5: Kiểm tra và sửa HTTP server block..."
# Check if HTTP server block exists and properly configured
HTTP_REDIRECT=$(sudo grep -c "return 301.*https" /etc/nginx/sites-enabled/mlndebate.io.vn)

if [ "$HTTP_REDIRECT" -eq 0 ]; then
    echo "⚠️  Không tìm thấy HTTP redirect, đang thêm..."
    
    # Create a proper HTTP redirect block
    sudo cp /etc/nginx/sites-enabled/mlndebate.io.vn /etc/nginx/sites-enabled/mlndebate.io.vn.backup.$(date +%Y%m%d_%H%M%S)
    
    # Add HTTP server block if missing
    cat << 'EOF' | sudo tee /tmp/http_server_block.conf
server {
    listen 80;
    listen [::]:80;
    server_name mlndebate.io.vn www.mlndebate.io.vn;
    
    # Redirect all HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

EOF
    
    # Insert HTTP block at the beginning of the config
    sudo sed -i '1i\# HTTP to HTTPS redirect' /etc/nginx/sites-enabled/mlndebate.io.vn
    sudo sed -i '1r /tmp/http_server_block.conf' /etc/nginx/sites-enabled/mlndebate.io.vn
    
    echo "✅ Đã thêm HTTP redirect block"
else
    echo "✅ HTTP redirect đã tồn tại"
fi

echo ""
echo "🔧 BƯỚC 6: Test và reload nginx..."
if sudo nginx -t; then
    echo "✅ Nginx syntax OK"
    sudo systemctl reload nginx
    echo "✅ Nginx reloaded"
else
    echo "❌ Nginx syntax error, khôi phục backup..."
    sudo cp /etc/nginx/sites-enabled/mlndebate.io.vn.backup.* /etc/nginx/sites-enabled/mlndebate.io.vn 2>/dev/null
fi

echo ""
echo "🧪 BƯỚC 7: Test HTTP và HTTPS..."
echo "HTTP test (should redirect to HTTPS):"
curl -I http://localhost/ 2>/dev/null | head -5
echo ""

echo "HTTP test with domain:"
curl -I http://mlndebate.io.vn/ 2>/dev/null | head -5
echo ""

echo "HTTPS test:"
curl -I https://mlndebate.io.vn/ 2>/dev/null | head -5
echo ""

echo "🌐 BƯỚC 8: Test external access..."
EXTERNAL_IP=$(curl -s http://checkip.amazonaws.com/ 2>/dev/null)
echo "Server IP: $EXTERNAL_IP"
echo ""

echo "Test external HTTP (should redirect):"
curl -I "http://$EXTERNAL_IP/" 2>/dev/null | head -5
echo ""

echo "🎯 KẾT QUẢ:"
echo "==========="
LOCAL_HTTP=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/ 2>/dev/null)
LOCAL_HTTPS=$(curl -s -o /dev/null -w "%{http_code}" https://mlndebate.io.vn/ 2>/dev/null)
EXTERNAL_HTTP=$(curl -s -o /dev/null -w "%{http_code}" "http://$EXTERNAL_IP/" 2>/dev/null)

echo "Local HTTP: $LOCAL_HTTP (should be 301 redirect)"
echo "Local HTTPS: $LOCAL_HTTPS (should be 200)"
echo "External HTTP: $EXTERNAL_HTTP (should be 301 redirect)"
echo ""

if [ "$LOCAL_HTTP" = "301" ] && [ "$LOCAL_HTTPS" = "200" ]; then
    echo "🎉 THÀNH CÔNG! Website đã hoạt động hoàn toàn!"
    echo ""
    echo "🧪 TEST TỪ MÁY BÊN NGOÀI:"
    echo "========================"
    echo "1. HTTP redirect: curl -I http://$EXTERNAL_IP/"
    echo "2. HTTPS direct: curl -I https://mlndebate.io.vn/"
    echo "3. Browser: https://mlndebate.io.vn/"
    echo ""
    echo "✅ Tất cả đều sẽ redirect về HTTPS và hiển thị website!"
else
    echo "⚠️  Vẫn còn vấn đề, cần kiểm tra thêm nginx configuration"
fi

# Cleanup
sudo rm -f /tmp/http_server_block.conf 