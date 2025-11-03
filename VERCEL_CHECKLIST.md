# ✅ Vercel Deployment Checklist

## 📋 Checklist Trước Khi Deploy

### 1. Files và Cấu hình ✅
- [x] `vercel.json` đã được tạo và config đúng
- [x] `api/[...path].py` - Serverless function wrapper
- [x] `api/requirements.txt` - Có mangum
- [x] `backend/requirements.txt` - Đã thêm mangum
- [x] `frontend/src/config/api.js` - API config linh hoạt
- [x] `.vercelignore` - Files cần ignore

### 2. Backend Updates ✅
- [x] CORS đã được cập nhật để tự động detect Vercel URLs
- [x] `mangum` đã được thêm vào requirements.txt
- [x] Backend imports đúng paths

### 3. Frontend Updates ✅
- [x] `DebateRoom.js` - Sử dụng `API_CONFIG`
- [x] `AdminDashboard.js` - Sử dụng `API_CONFIG`
- [x] `StartDebate.js` - Sử dụng `API_CONFIG`
- [x] `EmergencyTest.js` - Sử dụng `API_CONFIG`
- [x] Tất cả hardcoded URLs đã được thay thế

### 4. Environment Variables 🔧 (Cần set trong Vercel)
- [ ] `GOOGLE_API_KEY` - API key cho Google Generative AI
- [ ] `OPENAI_API_KEY` - (Nếu có dùng)
- [ ] Các env vars khác từ backend/.env (nếu có)

### 5. Testing Checklist 🧪
- [ ] Test build frontend: `cd frontend && npm run build`
- [ ] Test API locally với mangum (tùy chọn)
- [ ] Kiểm tra không có lỗi linting

## 🚀 Sau Khi Deploy

### Kiểm tra:
1. ✅ Frontend load được không?
2. ✅ API `/api/health` trả về gì?
3. ✅ Test một request API (ví dụ: `/api/debate/start`)
4. ✅ CORS có hoạt động không?
5. ✅ Environment variables đã được set chưa?

### Nếu có lỗi:
1. Kiểm tra Vercel Build Logs
2. Kiểm tra Vercel Function Logs  
3. Kiểm tra Browser Console
4. Xem `VERCEL_DEPLOY.md` để troubleshoot

## 📝 Notes

- `setupProxy.js` chỉ dùng cho development, không ảnh hưởng production
- Localhost URLs trong `api.js` chỉ là fallback cho development
- Production sẽ tự động dùng relative URLs (`/api`)

## ✅ Sẵn sàng để deploy!

Tất cả code đã được cập nhật. Giờ chỉ cần:
1. Push code lên Git
2. Import vào Vercel
3. Set environment variables
4. Deploy!

