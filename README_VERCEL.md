# 🚀 Deploy MLN Debate System lên Vercel

## Tổng quan

Project đã được cấu hình để deploy trên **Vercel** thay vì server truyền thống. Toàn bộ hệ thống bao gồm:
- **Frontend**: React app được build và serve static
- **Backend**: FastAPI chuyển thành Vercel serverless functions

## ⚡ Thay đổi chính

### 1. Backend → Serverless Functions
- FastAPI app được wrap bằng Mangum adapter
- Tất cả API routes được handle qua `api/[...path].py`
- Dependencies được quản lý qua `api/requirements.txt` và `backend/requirements.txt`

### 2. Frontend → Static Build
- React app được build thành static files
- API calls tự động sử dụng relative URLs trong production
- Config linh hoạt qua `frontend/src/config/api.js`

### 3. CORS Configuration
- Tự động detect Vercel URLs
- Hỗ trợ preview và production environments
- Compatible với localhost development

## 📁 Cấu trúc Files Mới

```
├── api/
│   ├── [...path].py          # Catch-all serverless function
│   └── requirements.txt      # API dependencies
├── vercel.json               # Vercel configuration
├── .vercelignore            # Files to ignore
└── frontend/src/config/
    └── api.js               # API configuration (NEW)
```

## 🛠️ Các File Đã Được Cập Nhật

1. **backend/main.py**
   - CORS config tự động detect Vercel environment
   - Hỗ trợ dynamic origins

2. **backend/requirements.txt**
   - Thêm `mangum>=0.17.0` để chạy FastAPI trên serverless

3. **frontend/src/pages/DebateRoom.js**
   - Sử dụng `API_CONFIG` thay vì hardcoded URL

4. **frontend/src/pages/AdminDashboard.js**
   - Sử dụng `API_CONFIG` thay vì hardcoded URL

5. **frontend/src/pages/StartDebate.js**
   - Sử dụng `API_CONFIG` thay vì hardcoded URL

## 📝 Hướng Dẫn Deploy

Xem file `VERCEL_DEPLOY.md` để biết hướng dẫn chi tiết.

Tóm tắt:
1. Push code lên Git repository
2. Import vào Vercel
3. Thêm environment variables (GOOGLE_API_KEY, etc.)
4. Deploy và test

## 🔧 Development

### Local Development vẫn hoạt động bình thường:

```bash
# Backend
cd backend
python main.py

# Frontend
cd frontend
npm start
```

Frontend sẽ tự động detect environment và sử dụng:
- Development: `http://localhost:5000/api` hoặc `REACT_APP_API_URL`
- Production: Relative URL `/api`

## ⚠️ Lưu ý Quan Trọng

1. **Environment Variables**: Phải set trong Vercel Dashboard
   - `GOOGLE_API_KEY`
   - `OPENAI_API_KEY` (nếu dùng)

2. **Serverless Limitations**:
   - Function timeout: 60 giây
   - Cold start có thể xảy ra
   - In-memory storage sẽ reset mỗi lần cold start

3. **Database**: Hiện tại dùng in-memory storage. Để production thực sự, cần:
   - Sử dụng external database (MongoDB, PostgreSQL, etc.)
   - Hoặc Vercel KV / Vercel Postgres

## 📚 Tài Liệu Tham Khảo

- [Vercel Python Runtime](https://vercel.com/docs/concepts/functions/serverless-functions/runtimes/python)
- [Mangum Documentation](https://mangum.io/)
- [FastAPI Deployment](https://fastapi.tiangolo.com/deployment/)

## ✅ Checklist Trước Khi Deploy

- [ ] Environment variables đã được set trong Vercel
- [ ] `backend/requirements.txt` bao gồm tất cả dependencies
- [ ] `api/requirements.txt` có mangum
- [ ] Frontend build thành công (`npm run build`)
- [ ] API config sử dụng đúng environment
- [ ] CORS configuration đã được cập nhật

