#!/bin/bash

echo "🌐 TEST EXTERNAL ACCESS - CHẠY TỪ MÁY BÊN NGOÀI"
echo "=============================================="
echo ""

# Server info
SERVER_IP="206.189.40.105"
DOMAIN="mlndebate.io.vn"

echo "📋 THÔNG TIN SERVER:"
echo "Server IP: $SERVER_IP"
echo "Domain: $DOMAIN"
echo ""

echo "🧪 TEST 1: PING SERVER"
echo "======================"
echo "Ping $SERVER_IP..."
ping -c 4 $SERVER_IP
PING_RESULT=$?
echo ""

echo "🧪 TEST 2: DNS RESOLUTION"
echo "========================="
echo "DNS lookup for $DOMAIN..."
nslookup $DOMAIN
echo ""

echo "🧪 TEST 3: PORT CONNECTIVITY"
echo "============================"
echo "Test port 80 (HTTP)..."
timeout 5 bash -c "</dev/tcp/$SERVER_IP/80" && echo "✅ Port 80 OPEN" || echo "❌ Port 80 CLOSED/FILTERED"

echo "Test port 443 (HTTPS)..."
timeout 5 bash -c "</dev/tcp/$SERVER_IP/443" && echo "✅ Port 443 OPEN" || echo "❌ Port 443 CLOSED/FILTERED"
echo ""

echo "🧪 TEST 4: HTTP ACCESS"
echo "======================"
echo "Test HTTP to IP (should redirect to HTTPS):"
curl -I "http://$SERVER_IP/" 2>/dev/null || echo "❌ HTTP request failed"
echo ""

echo "Test HTTP to domain (should redirect to HTTPS):"
curl -I "http://$DOMAIN/" 2>/dev/null || echo "❌ HTTP request to domain failed"
echo ""

echo "🧪 TEST 5: HTTPS ACCESS"
echo "======================="
echo "Test HTTPS to domain:"
curl -I "https://$DOMAIN/" 2>/dev/null || echo "❌ HTTPS request failed"
echo ""

echo "🧪 TEST 6: FULL HTTP REQUEST"
echo "============================"
echo "Get actual content from HTTPS:"
curl -s "https://$DOMAIN/" | head -20 || echo "❌ Failed to get content"
echo ""

echo "🎯 SUMMARY"
echo "=========="

# Test results
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://$SERVER_IP/" 2>/dev/null)
HTTPS_CODE=$(curl -s -o /dev/null -w "%{http_code}" "https://$DOMAIN/" 2>/dev/null)

echo "HTTP Response Code: $HTTP_CODE"
echo "HTTPS Response Code: $HTTPS_CODE"
echo ""

if [ "$PING_RESULT" -eq 0 ]; then
    echo "✅ Server reachable"
else
    echo "❌ Server NOT reachable"
fi

if [ "$HTTP_CODE" = "301" ] || [ "$HTTP_CODE" = "302" ]; then
    echo "✅ HTTP correctly redirects to HTTPS"
elif [ "$HTTP_CODE" = "200" ]; then
    echo "⚠️  HTTP returns 200 (no redirect)"
else
    echo "❌ HTTP not working (code: $HTTP_CODE)"
fi

if [ "$HTTPS_CODE" = "200" ]; then
    echo "✅ HTTPS working perfectly"
else
    echo "❌ HTTPS not working (code: $HTTPS_CODE)"
fi

echo ""
echo "🌐 BROWSER TESTS:"
echo "================"
echo "Try these URLs in your browser:"
echo "1. http://$SERVER_IP/ (should redirect to HTTPS)"
echo "2. http://$DOMAIN/ (should redirect to HTTPS)" 
echo "3. https://$DOMAIN/ (should show the website)"
echo ""

if [ "$HTTPS_CODE" = "200" ]; then
    echo "🎉 SUCCESS! Website is accessible from external networks!"
    echo "Your website at https://$DOMAIN/ is working!"
else
    echo "❌ There are still issues accessing the website externally."
    echo "Please check:"
    echo "- Cloud Security Groups (AWS/GCP/Azure)"
    echo "- Server firewall settings"  
    echo "- Network configuration"
fi 