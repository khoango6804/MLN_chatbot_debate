# 🚨 Giải thích lỗi 502 Bad Gateway trên mlndebate.io.vn

## Lỗi là gì?
**502 Bad Gateway** xảy ra khi Nginx (web server) không thể kết nối với các ứng dụng phía sau (backend/frontend).

## Kiến trúc hệ thống:
```
User → Nginx (Port 80/443) → Backend Python (Port 5000)
                           → Frontend React (Port 3001)
```

## Nguyên nhân chính:
1. **Backend API (Python/FastAPI) không chạy trên port 5000**
2. **Frontend React không chạy trên port 3001**
3. **Thiếu file cấu hình (.env) chứa API keys**

## Cách khắc phục nhanh:

### Bước 1: Kiểm tra nguyên nhân
```bash
chmod +x check_502_status.sh
bash check_502_status.sh
```

### Bước 2: Khắc phục tự động
```bash
chmod +x fix_502_error.sh
sudo bash fix_502_error.sh
```

### Bước 3: Kiểm tra kết quả
Đợi 30-60 giây sau đó truy cập:
- https://mlndebate.io.vn
- https://mlndebate.io.vn/admin

## Khắc phục thủ công (nếu cần):

### 1. Khởi động Backend:
```bash
cd /home/ubuntu/MLN_chatbot_debate/backend
# Tạo file .env nếu chưa có
python3 main.py
```

### 2. Khởi động Frontend:
```bash
cd /home/ubuntu/MLN_chatbot_debate/frontend
npm install  # Nếu chưa cài dependencies
PORT=3001 npm start
```

### 3. Restart Nginx:
```bash
sudo systemctl restart nginx
```

## Kiểm tra logs:
- Backend: `/home/ubuntu/MLN_chatbot_debate/backend/backend_*.log`
- Frontend: `/home/ubuntu/MLN_chatbot_debate/frontend/frontend_*.log`
- Nginx: `/var/log/nginx/mlndebate_error.log`

## Lưu ý quan trọng:
- Backend cần file `.env` với các API keys (Google Gemini, etc.)
- Frontend cần `node_modules` (chạy `npm install` nếu thiếu)
- Quá trình khởi động React có thể mất 1-2 phút 