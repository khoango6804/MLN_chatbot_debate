# 🎉 CHÚC MỪNG! Đã khắc phục lỗi 502 Bad Gateway

Website đã hoạt động trở lại! Tuy nhiên, vẫn còn vấn đề nhỏ với **API Backend trả về 404**.

## 🔍 TÌNH TRẠNG HIỆN TẠI

✅ **Đã OK:** Website load được, Frontend React hoạt động  
❌ **Còn lại:** Backend API endpoints trả về 404  
🎯 **Cần làm:** Khắc phục routing/endpoint issues  

## ⚡ KHẮC PHỤC NHANH

### Bước 1: Dừng tất cả backend processes cũ
```bash
sudo pkill -f "uvicorn"
sudo pkill -f "python3 main.py"
sudo lsof -ti:5000 | xargs -r sudo kill -9
```

### Bước 2: Khởi động lại backend đúng cách
```bash
cd /home/ubuntu/MLN_chatbot_debate/backend
uvicorn main:app --host 0.0.0.0 --port 5000 --reload
```

### Bước 3: Kiểm tra API (trong terminal mới)
```bash
# Test backend trực tiếp
curl http://localhost:5000/api/admin/sessions

# Test FastAPI docs
curl http://localhost:5000/docs

# Test website API
curl https://mlndebate.io.vn/api/admin/sessions
```

## 🔧 SCRIPT TỰ ĐỘNG

Hoặc chạy script tự động:
```bash
chmod +x fix_api_404.sh
sudo bash fix_api_404.sh
```

## 🧪 KIỂM TRA CHI TIẾT

Chạy script kiểm tra FastAPI routes:
```bash
cd /home/ubuntu/MLN_chatbot_debate
python3 check_fastapi_routes.py
```

## 🚨 NẾU VẪN LỖI 404

### Khả năng 1: Process cũ vẫn chạy
```bash
# Xem processes nào đang dùng port 5000
sudo lsof -i :5000

# Kill tất cả
sudo lsof -ti:5000 | xargs -r sudo kill -9

# Khởi động lại
cd /home/ubuntu/MLN_chatbot_debate/backend
uvicorn main:app --host 0.0.0.0 --port 5000 --reload
```

### Khả năng 2: Backend chạy sai port
```bash
# Kiểm tra backend đang chạy port nào
ps aux | grep uvicorn
netstat -tulpn | grep python
```

### Khả năng 3: Routing configuration sai
```bash
# Kiểm tra main.py có lỗi không
cd /home/ubuntu/MLN_chatbot_debate/backend
python3 -c "from main import app; print('App OK')"

# Xem routes có được định nghĩa không
python3 -c "from main import app; print([route.path for route in app.routes])"
```

### Khả năng 4: Environment/Dependencies
```bash
# Kiểm tra .env file
ls -la /home/ubuntu/MLN_chatbot_debate/backend/.env

# Kiểm tra dependencies
cd /home/ubuntu/MLN_chatbot_debate/backend
pip list | grep -E "fastapi|uvicorn"
```

## 📋 TROUBLESHOOTING CHECKLIST

- [ ] Backend process đã dừng hết chưa?
- [ ] Port 5000 có free không?
- [ ] Uvicorn khởi động không lỗi?
- [ ] FastAPI app import được không?
- [ ] API routes có được định nghĩa không?
- [ ] File .env có tồn tại không?
- [ ] Nginx có restart chưa?

## 🎯 KẾT QUẢ MONG ĐỢI

Sau khi khắc phục:
- ✅ Frontend hiển thị dữ liệu từ backend
- ✅ Admin dashboard không còn lỗi "Failed to fetch sessions"
- ✅ API endpoints trả về 200/405 thay vì 404
- ✅ Console không còn HTTP errors

## 📞 NẾU CẦN HỖ TRỢ

Nếu vẫn gặp vấn đề, cung cấp:

1. **Kết quả lệnh:**
   ```bash
   ps aux | grep uvicorn
   curl -v http://localhost:5000/api/admin/sessions
   ```

2. **Backend logs:**
   ```bash
   tail -20 /home/ubuntu/MLN_chatbot_debate/backend/*.log
   ```

3. **FastAPI routes:**
   ```bash
   python3 check_fastapi_routes.py
   ```

---

💡 **Lưu ý:** Vấn đề API 404 thường dễ khắc phục hơn 502 Bad Gateway vì backend đã chạy được, chỉ cần sửa routing/endpoint issues. 