# 🚨 HƯỚNG DẪN KHẮC PHỤC LỖI 502 BAD GATEWAY

## ⚡ KHẮC PHỤC NHANH (1 lệnh)

```bash
sudo bash QUICK_FIX_502.sh
```

Sau đó đợi 2-3 phút và kiểm tra website: https://mlndebate.io.vn

---

## 🔍 NGUYÊN NHÂN

Website bị lỗi **502 Bad Gateway** vì:
1. **Backend API** (Python/FastAPI) không chạy trên port 5000
2. **Frontend React** không chạy trên port 3001  
3. **Nginx** không thể kết nối với backend/frontend

---

## 📋 KHẮC PHỤC THỦ CÔNG (từng bước)

### Bước 1: Dừng tất cả processes cũ
```bash
sudo pkill -f "uvicorn"
sudo pkill -f "python3 main.py" 
sudo pkill -f "node.*react-scripts"
sudo pkill -f "npm start"
```

### Bước 2: Khởi động Backend
```bash
cd /home/ubuntu/MLN_chatbot_debate/backend

# Kiểm tra file .env (quan trọng!)
ls -la .env

# Nếu chưa có .env, tạo file:
cat > .env << 'EOF'
GOOGLE_API_KEY=your_actual_google_gemini_api_key_here
EOF

# Khởi động backend với uvicorn
uvicorn main:app --host 0.0.0.0 --port 5000 --reload &
```

### Bước 3: Khởi động Frontend  
```bash
cd /home/ubuntu/MLN_chatbot_debate/frontend

# Cài dependencies nếu cần
npm install

# Khởi động React
PORT=3001 npm start &
```

### Bước 4: Restart Nginx
```bash
sudo systemctl restart nginx
sudo systemctl status nginx
```

### Bước 5: Kiểm tra
```bash
# Test backend
curl http://localhost:5000/api/admin/sessions

# Test frontend  
curl http://localhost:3001

# Test website
curl -I https://mlndebate.io.vn
```

---

## 🔧 KIỂM TRA TRẠNG THÁI

```bash
# Kiểm tra processes
ps aux | grep uvicorn
ps aux | grep react-scripts

# Kiểm tra ports
sudo lsof -i :5000
sudo lsof -i :3001

# Xem logs
tail -f /home/ubuntu/MLN_chatbot_debate/backend/*.log
tail -f /home/ubuntu/MLN_chatbot_debate/frontend/*.log
tail -f /var/log/nginx/mlndebate_error.log
```

---

## ⚠️ LƯU Ý QUAN TRỌNG

1. **File .env**: Backend cần Google Gemini API key để hoạt động
2. **Thời gian**: React cần 1-2 phút để compile
3. **Quyền**: Một số lệnh cần sudo
4. **API Keys**: Không commit API keys vào git

---

## 🎯 KẾT QUẢ MONG ĐỢI

Sau khi khắc phục thành công:
- ✅ https://mlndebate.io.vn - Trang chủ hoạt động
- ✅ https://mlndebate.io.vn/admin - Admin panel hoạt động  
- ✅ Backend API phản hồi status 200/405
- ✅ Frontend React load được

---

## 🆘 NẾU VẪN LỖI

1. **Kiểm tra logs** để tìm lỗi cụ thể
2. **Đảm bảo API keys** trong .env đúng
3. **Chờ thêm thời gian** để React compile
4. **Restart lại server** nếu cần thiết

## 📞 LIÊN HỆ HỖ TRỢ

Nếu vẫn gặp lỗi, vui lòng cung cấp:
- Nội dung file logs
- Kết quả lệnh `ps aux | grep uvicorn`
- Kết quả lệnh `curl http://localhost:5000/api/admin/sessions` 