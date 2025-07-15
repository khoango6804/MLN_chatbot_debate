#!/bin/bash

echo "🔑 SCRIPT THÊM API KEYS VÀO .ENV FILE"
echo "======================================"

ENV_FILE="/home/ubuntu/MLN_chatbot_debate/backend/.env"

if [ ! -f "$ENV_FILE" ]; then
    echo "❌ File .env không tồn tại!"
    exit 1
fi

echo "📋 Hướng dẫn thêm API keys:"
echo "1. Mỗi lần enter, nhập 1 API key"
echo "2. Để trống và enter để bỏ qua key đó"
echo "3. Ctrl+C để thoát"
echo ""

# Backup trước khi edit
cp "$ENV_FILE" "$ENV_FILE.backup.$(date +%Y%m%d_%H%M%S)"
echo "✅ Đã backup file .env"

# Thêm từng key
for i in {2..10}; do
    echo -n "🔑 Nhập GEMINI_API_KEY_$i (hoặc Enter để bỏ qua): "
    read -r api_key
    
    if [ ! -z "$api_key" ]; then
        # Replace placeholder với key thực
        sed -i "s/GEMINI_API_KEY_$i=your_gemini_api_key_${i}_here/GEMINI_API_KEY_$i=$api_key/" "$ENV_FILE"
        echo "   ✅ Đã thêm key #$i"
    else
        echo "   ⏭️  Bỏ qua key #$i"
    fi
done

echo ""
echo "🎉 Hoàn thành! Kiểm tra file .env:"
echo "=================================="
grep "GEMINI_API_KEY_" "$ENV_FILE" | head -10

echo ""
echo "🚀 Test hệ thống:"
echo "cd /home/ubuntu/MLN_chatbot_debate/backend && python3 test_multiple_keys.py" 