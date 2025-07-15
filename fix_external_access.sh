#!/bin/bash

echo "🌐 KHẮC PHỤC TRUY CẬP WEBSITE TỪ BÊN NGOÀI"
echo "=========================================="
echo ""

echo "🔍 BƯỚC 1: Kiểm tra Firewall..."
echo "UFW Status:"
sudo ufw status
echo ""

echo "🔍 BƯỚC 2: Kiểm tra Nginx binding..."
echo "Nginx listening ports:"
sudo netstat -tulpn | grep nginx
echo ""

echo "🔍 BƯỚC 3: Kiểm tra IP address của server..."
echo "Server IP addresses:"
ip addr show | grep "inet " | grep -v "127.0.0.1"
echo ""

echo "🔧 BƯỚC 4: Mở firewall ports..."
echo "Mở port 80 (HTTP):"
sudo ufw allow 80/tcp
echo "Mở port 443 (HTTPS):"
sudo ufw allow 443/tcp
echo "Mở port 22 (SSH):"
sudo ufw allow 22/tcp
echo ""

echo "🔧 BƯỚC 5: Enable UFW nếu chưa enable..."
sudo ufw --force enable
echo ""

echo "🔧 BƯỚC 6: Kiểm tra Nginx configuration..."
echo "Nginx configuration test:"
sudo nginx -t
echo ""

echo "🔧 BƯỚC 7: Restart Nginx..."
sudo systemctl restart nginx
sudo systemctl status nginx --no-pager -l
echo ""

echo "🧪 BƯỚC 8: Test từ server..."
echo "Test local access:"
curl -I http://localhost/
echo ""
curl -I https://mlndebate.io.vn/
echo ""

echo "📊 BƯỚC 9: Kiểm tra Cloud Security Groups..."
echo "Nếu đây là cloud server (AWS, GCP, Azure), cần kiểm tra:"
echo "- Security Groups cho phép port 80, 443"
echo "- Network ACLs"
echo "- Load Balancer configuration"
echo ""

echo "🔍 BƯỚC 10: Thông tin debug..."
echo "Server external IP:"
curl -s http://checkip.amazonaws.com/ || curl -s http://icanhazip.com/
echo ""

echo "Nginx error log (10 dòng cuối):"
sudo tail -10 /var/log/nginx/error.log
echo ""

echo "🎯 KẾT QUẢ KIỂM TRA:"
echo "==================="

# Test internal access
LOCAL_HTTP=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/ 2>/dev/null)
LOCAL_HTTPS=$(curl -s -o /dev/null -w "%{http_code}" https://mlndebate.io.vn/ 2>/dev/null)

echo "✅ Local HTTP access: $LOCAL_HTTP"
echo "✅ Local HTTPS access: $LOCAL_HTTPS"

# Check if UFW is blocking
UFW_STATUS=$(sudo ufw status | grep -c "Status: active")
if [ "$UFW_STATUS" -eq 1 ]; then
    echo "✅ UFW Firewall: Active"
    UFW_80=$(sudo ufw status | grep -c "80/tcp.*ALLOW")
    UFW_443=$(sudo ufw status | grep -c "443/tcp.*ALLOW")
    if [ "$UFW_80" -eq 0 ]; then
        echo "❌ Port 80 chưa được mở trong UFW"
    else
        echo "✅ Port 80 đã được mở trong UFW"
    fi
    if [ "$UFW_443" -eq 0 ]; then
        echo "❌ Port 443 chưa được mở trong UFW"
    else
        echo "✅ Port 443 đã được mở trong UFW"
    fi
else
    echo "⚠️  UFW Firewall: Inactive"
fi

echo ""
echo "📋 HƯỚNG DẪN KIỂM TRA THÊM:"
echo "========================="
echo "1. Từ máy bên ngoài, test:"
echo "   curl -I http://$(curl -s http://checkip.amazonaws.com/)"
echo "   curl -I https://mlndebate.io.vn"
echo ""
echo "2. Nếu vẫn không truy cập được, kiểm tra:"
echo "   - Cloud Security Groups (AWS EC2, GCP, Azure)"
echo "   - Router/NAT configuration"
echo "   - ISP blocking"
echo "   - DNS resolution: nslookup mlndebate.io.vn"
echo ""
echo "3. Nginx configuration:"
echo "   - Đảm bảo listen 0.0.0.0:80 và 0.0.0.0:443"
echo "   - Không chỉ listen 127.0.0.1"
echo ""
echo "4. Test ports từ bên ngoài:"
echo "   telnet YOUR_SERVER_IP 80"
echo "   telnet YOUR_SERVER_IP 443" 