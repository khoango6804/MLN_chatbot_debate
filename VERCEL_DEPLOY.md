# Hướng dẫn Deploy lên Vercel

## Tổng quan

Project này đã được cấu hình để deploy trên Vercel với:
- **Frontend**: React app được build và serve static
- **Backend**: FastAPI được chuyển đổi thành Vercel serverless functions

## Cấu trúc Project

```
MLN_chatbot_debate/
├── api/                    # Vercel serverless functions
│   ├── [...path].py       # Catch-all route cho FastAPI
│   └── requirements.txt   # Python dependencies cho API
├── backend/               # FastAPI backend source code
│   ├── main.py           # FastAPI app
│   ├── debate_system.py
│   └── requirements.txt
├── frontend/              # React frontend
│   ├── src/
│   ├── package.json
│   └── build/            # Build output (auto-generated)
└── vercel.json           # Vercel configuration
```

## Bước 1: Chuẩn bị

1. **Đảm bảo có tài khoản Vercel**
   - Đăng ký tại https://vercel.com
   - Đăng nhập với GitHub/GitLab/Bitbucket

2. **Cài đặt Vercel CLI (tùy chọn)**
   ```bash
   npm install -g vercel
   ```

## Bước 2: Cấu hình Environment Variables

Vào Vercel Dashboard -> Project Settings -> Environment Variables và thêm:

```
GOOGLE_API_KEY=your_google_api_key_here
OPENAI_API_KEY=your_openai_api_key_here (nếu dùng)
```

**Lưu ý**: Các biến môi trường này sẽ được backend sử dụng để kết nối với AI services.

## Bước 3: Deploy

### Option 1: Deploy qua Vercel Dashboard

1. Push code lên GitHub/GitLab
2. Vào https://vercel.com/new
3. Import repository
4. Vercel sẽ tự động detect và deploy

### Option 2: Deploy qua CLI

```bash
# Đăng nhập
vercel login

# Deploy (lần đầu sẽ hỏi config)
vercel

# Deploy production
vercel --prod
```

## Bước 4: Kiểm tra

Sau khi deploy xong:

1. **Frontend**: Truy cập URL được Vercel cung cấp (ví dụ: `https://your-project.vercel.app`)
2. **API**: Test endpoint `/api/health` (ví dụ: `https://your-project.vercel.app/api/health`)

## Cấu hình Routes

Vercel sẽ tự động route:
- `/api/*` → Serverless functions trong `api/`
- `/*` → Frontend React app

## Lưu ý quan trọng

### 1. Python Dependencies

Vercel sẽ tự động install dependencies từ:
- `api/requirements.txt` cho serverless functions
- `backend/requirements.txt` được import bởi API functions

### 2. CORS

Backend đã được cấu hình để tự động cho phép:
- Vercel deployment URLs
- Vercel preview URLs  
- Localhost trong development

### 3. Serverless Functions Limitations

- **Timeout**: Tối đa 60 giây (đã config trong `vercel.json`)
- **Memory**: Mặc định 1024MB
- **Cold Start**: Có thể có delay khi function lần đầu được gọi

### 4. Environment Variables

Frontend sẽ tự động sử dụng:
- Relative URLs trong production (`/api`)
- Environment variables trong development (`REACT_APP_API_URL`)

## Troubleshooting

### Lỗi "Failed to initialize FastAPI app"

- Kiểm tra `mangum` đã được thêm vào `backend/requirements.txt`
- Kiểm tra Python dependencies đã được install

### API không hoạt động

- Kiểm tra Vercel Functions logs trong Dashboard
- Kiểm tra environment variables đã được set
- Kiểm tra CORS configuration

### Frontend không kết nối được API

- Kiểm tra `frontend/src/config/api.js` sử dụng đúng config
- Kiểm tra Vercel routes trong `vercel.json`

## Custom Domain

Sau khi deploy, có thể thêm custom domain:
1. Vào Vercel Dashboard -> Settings -> Domains
2. Thêm domain của bạn
3. Cập nhật DNS records theo hướng dẫn

## Production Checklist

- [ ] Environment variables đã được set
- [ ] API endpoints hoạt động (`/api/health`)
- [ ] Frontend load được
- [ ] CORS configuration đúng
- [ ] Custom domain (nếu có) đã được cấu hình

## Support

Nếu gặp vấn đề, kiểm tra:
1. Vercel Build Logs trong Dashboard
2. Vercel Function Logs
3. Browser Console logs
4. Network tab để xem API requests

