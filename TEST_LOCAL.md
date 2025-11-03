# 🧪 Hướng dẫn Test Local

## Bước 1: Cài đặt Dependencies

### Backend
```bash
cd backend
pip install -r requirements.txt
```

**Lưu ý**: Nếu chưa có virtual environment:
```bash
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate
```

### Frontend
```bash
cd frontend
npm install
```

## Bước 2: Cấu hình Environment Variables

Tạo file `backend/.env`:

```env
GOOGLE_API_KEY=your_google_api_key_here
```

**Lưu ý**: Cần có Google API Key để test AI features.

## Bước 3: Chạy Services

### Option 1: Chạy riêng biệt (Recommended)

**Terminal 1 - Backend:**
```bash
cd backend
python main.py
```

Backend sẽ chạy tại: http://localhost:5000

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

Frontend sẽ chạy tại: http://localhost:3001

### Option 2: Chạy tự động

**Windows:**
```bash
start_local.bat
```

**Linux/Mac:**
```bash
chmod +x start_local.sh
./start_local.sh
```

## Bước 4: Test

1. **Kiểm tra Backend API:**
   - Mở: http://localhost:5000/api/health
   - Hoặc: http://localhost:5000/docs (API Documentation)

2. **Kiểm tra Frontend:**
   - Mở: http://localhost:3001
   - Frontend sẽ tự động proxy API requests tới `http://localhost:5000/api`

3. **Test API Connection:**
   - Mở Browser Console (F12)
   - Kiểm tra xem có lỗi CORS hay connection không

## Troubleshooting

### Backend không chạy được
- Kiểm tra Python version: `python --version` (cần >= 3.8)
- Kiểm tra dependencies: `pip list | grep fastapi`
- Kiểm tra port 5000 có bị chiếm không: `netstat -ano | findstr :5000` (Windows)

### Frontend không connect được API
- Kiểm tra Backend đã chạy chưa
- Kiểm tra `setupProxy.js` có đúng target `http://localhost:5000` không
- Kiểm tra Browser Console có lỗi CORS không

### Lỗi Google API Key
- Kiểm tra file `backend/.env` có đúng format không
- Kiểm tra API key có valid không
- Xem logs trong backend terminal

## Cấu trúc URLs khi chạy local:

- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:5000/api
- **API Docs**: http://localhost:5000/docs
- **Health Check**: http://localhost:5000/api/health

## Notes

- `setupProxy.js` sẽ tự động proxy `/api/*` requests từ frontend tới backend
- Frontend sẽ tự động dùng `http://localhost:5000/api` khi chạy local (development mode)
- Production mode (sau khi build) sẽ dùng relative URLs

