# 🛠️ TOOLS KHẮC PHỤC LỖI 502 BAD GATEWAY

## 🚀 KHẮC PHỤC NHANH (1 lệnh)

```bash
sudo bash QUICK_FIX_502.sh
```

## 📋 TẤT CẢ CÁC TOOLS CÓ SẴN

| Tool | Mô tả | Cách sử dụng |
|------|-------|--------------|
| `QUICK_FIX_502.sh` | **Script khắc phục chính** - Tự động khắc phục tất cả | `sudo bash QUICK_FIX_502.sh` |
| `KIỂM_TRA_NHANH.sh` | Kiểm tra trạng thái hiện tại (không cần sudo) | `bash KIỂM_TRA_NHANH.sh` |
| `check_502_status.sh` | Kiểm tra chi tiết nguyên nhân lỗi 502 | `bash check_502_status.sh` |
| `fix_502_error.sh` | Script khắc phục cũ (backup) | `sudo bash fix_502_error.sh` |
| `start_backend_correct.sh` | Khởi động chỉ backend | `bash start_backend_correct.sh` |
| `start_frontend_correct.sh` | Khởi động chỉ frontend | `bash start_frontend_correct.sh` |

## 📚 TÀI LIỆU

| File | Mô tả |
|------|-------|
| `HƯỚNG_DẪN_KHẮC_PHỤC_502.md` | Hướng dẫn chi tiết từng bước |
| `ERROR_502_EXPLANATION.md` | Giải thích lỗi và nguyên nhân |
| `README_TOOLS.md` | File này - Tổng quan tools |

## 🎯 WORKFLOW KHUYẾN NGHỊ

### 1. Kiểm tra tình trạng hiện tại
```bash
bash KIỂM_TRA_NHANH.sh
```

### 2. Nếu có lỗi 502, khắc phục ngay
```bash
sudo bash QUICK_FIX_502.sh
```

### 3. Nếu vẫn lỗi, kiểm tra chi tiết
```bash
bash check_502_status.sh
```

### 4. Khắc phục từng phần nếu cần
```bash
# Chỉ backend
bash start_backend_correct.sh

# Chỉ frontend  
bash start_frontend_correct.sh
```

## ⚠️ LƯU Ý QUAN TRỌNG

1. **Quyền sudo**: Script chính cần quyền root
2. **File .env**: Backend cần Google Gemini API key
3. **Thời gian**: React cần 1-2 phút để compile
4. **Logs**: Luôn kiểm tra logs nếu có lỗi

## 🔍 KIỂM TRA KẾT QUẢ

Sau khi chạy script, kiểm tra:
- ✅ https://mlndebate.io.vn
- ✅ https://mlndebate.io.vn/admin  
- ✅ `curl http://localhost:5000/api/admin/sessions`
- ✅ `curl http://localhost:3001`

## 🆘 TROUBLESHOOTING

### Nếu Backend không khởi động:
```bash
# Kiểm tra log
tail -f /home/ubuntu/MLN_chatbot_debate/backend/*.log

# Kiểm tra file .env
cat /home/ubuntu/MLN_chatbot_debate/backend/.env

# Test thủ công
cd /home/ubuntu/MLN_chatbot_debate/backend
uvicorn main:app --host 0.0.0.0 --port 5000
```

### Nếu Frontend không khởi động:
```bash
# Kiểm tra log
tail -f /home/ubuntu/MLN_chatbot_debate/frontend/*.log

# Reinstall dependencies
cd /home/ubuntu/MLN_chatbot_debate/frontend
rm -rf node_modules package-lock.json
npm install

# Test thủ công
PORT=3001 npm start
```

### Nếu Nginx có vấn đề:
```bash
# Kiểm tra config
sudo nginx -t

# Kiểm tra status
sudo systemctl status nginx

# Restart
sudo systemctl restart nginx

# Xem logs
sudo tail -f /var/log/nginx/mlndebate_error.log
```

## 🎉 THÀNH CÔNG

Khi mọi thứ hoạt động, bạn sẽ thấy:
- Website mlndebate.io.vn load bình thường
- Không còn lỗi 502 Bad Gateway
- Backend API phản hồi
- React frontend hiển thị

## 📞 HỖ TRỢ

Nếu vẫn gặp vấn đề, cung cấp:
1. Kết quả `bash KIỂM_TRA_NHANH.sh`
2. Nội dung logs từ backend và frontend
3. Kết quả `sudo nginx -t`
4. Screenshot lỗi nếu có 