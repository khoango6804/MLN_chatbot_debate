# 🚀 Quick Start - Test Local

## Cách 1: Dùng Script Tự Động (Dễ nhất)

### Windows PowerShell:
```powershell
.\quick_test_local.ps1
```

Script sẽ tự động:
- ✅ Kiểm tra dependencies
- ✅ Cài đặt nếu thiếu
- ✅ Chạy Backend (port 5000)
- ✅ Chạy Frontend (port 3001)

## Cách 2: Chạy Thủ Công (2 terminal riêng)

### Terminal 1 - Backend:
```bash
cd backend
python main.py
```

Sẽ chạy tại: **http://localhost:5000**

### Terminal 2 - Frontend:
```bash
cd frontend  
npm start
```

Sẽ chạy tại: **http://localhost:3001**

## ⚙️ Setup Lần Đầu (nếu chưa cài)

### 1. Backend Dependencies:
```bash
cd backend
pip install -r requirements.txt
```

### 2. Frontend Dependencies:
```bash
cd frontend
npm install
```

### 3. Environment Variables:

Tạo file `backend/.env`:
```env
GOOGLE_API_KEY=your_api_key_here
```

**Lấy API Key tại:** https://makersuite.google.com/app/apikey

## ✅ Kiểm Tra

1. **Backend hoạt động?**
   - Mở: http://localhost:5000/api/health
   - Hoặc: http://localhost:5000/docs

2. **Frontend hoạt động?**
   - Mở: http://localhost:3001
   - Frontend sẽ tự động proxy API tới backend

3. **API Connection?**
   - Mở Browser Console (F12)
   - Thử tạo debate mới
   - Kiểm tra không có lỗi CORS

## 📝 Lưu Ý

- **setupProxy.js** sẽ tự động proxy `/api/*` từ frontend → `http://localhost:5000`
- Frontend config (`api.js`) sẽ tự dùng `http://localhost:5000/api` khi development
- Không cần thay đổi gì, mọi thứ đã được config sẵn!

## 🔧 Troubleshooting

**Backend không chạy?**
- Kiểm tra port 5000: `netstat -ano | findstr :5000`
- Kiểm tra Python: `python --version`
- Kiểm tra FastAPI: `pip list | grep fastapi`

**Frontend không connect?**
- Đảm bảo Backend đã chạy trước
- Kiểm tra Browser Console có lỗi gì
- Thử refresh lại (Ctrl+F5)

**Lỗi API Key?**
- Đảm bảo file `backend/.env` có `GOOGLE_API_KEY`
- Kiểm tra API key có valid không

