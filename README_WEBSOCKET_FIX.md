# 🔧 KHẮC PHỤC WEBSOCKET & API 404 ISSUES

## ❌ **CÁC VẤN ĐỀ:**
1. **WebSocket Insecure Error** (mobile): `"The operation is insecure"`
2. **API 404 Admin Dashboard**: `"Failed to fetch sessions"`
3. **HTTPS Mixed Content**: Frontend dùng HTTP APIs trên HTTPS site

---

## 🚀 **GIẢI PHÁP NHANH (1 LỆNH):**

```bash
chmod +x ULTIMATE_FIX_WEBSOCKET_API.sh
./ULTIMATE_FIX_WEBSOCKET_API.sh
```

**⏳ Script sẽ:**
- ✅ Thêm admin API routes vào backend
- ✅ Sửa frontend config để dùng HTTPS/WSS
- ✅ Restart services với config mới
- ✅ Test tất cả endpoints
- ✅ Thêm WebSocket support vào nginx

---

## 📋 **SCRIPTS CHI TIẾT:**

### **Nếu muốn chạy từng bước:**

1. **Thêm Admin Routes:**
   ```bash
   python3 add_admin_routes.py
   ```

2. **Sửa Frontend Config:**
   ```bash
   ./fix_frontend_config.sh
   ```

3. **Khắc phục WebSocket/API:**
   ```bash
   ./fix_websocket_api_issues.sh
   ```

---

## 🧪 **SAU KHI CHẠY SCRIPT:**

### **Test ngay trong browser:**
1. **Hard refresh**: `Ctrl + F5`
2. **Clear cache**: `Ctrl + Shift + Del`
3. **Open**: https://mlndebate.io.vn/
4. **Click Admin button** - should work without 404

### **Test trên mobile:**
- Mở https://mlndebate.io.vn/ trên điện thoại
- Không còn WebSocket errors

---

## 🎯 **KẾT QUẢ MONG ĐỢI:**

✅ **Frontend**: https://mlndebate.io.vn/ (200 OK)  
✅ **API Health**: https://mlndebate.io.vn/api/health (200 OK)  
✅ **Admin API**: https://mlndebate.io.vn/api/admin/sessions (200 OK)  
✅ **WebSocket**: wss://mlndebate.io.vn/ws (Secure)  

---

## 🔍 **NẾU VẪN CÓ LỖI:**

### **Kiểm tra logs:**
```bash
tail -20 backend.log
tail -20 frontend_new.log
```

### **Restart manual:**
```bash
./QUICK_FIX_502.sh
```

### **Kiểm tra services:**
```bash
ps aux | grep -E "uvicorn|node.*3001"
```

---

## 📁 **FILES ĐƯỢC TẠO/SỬA:**

- `frontend/.env` - Environment variables mới
- `frontend/src/setupProxy.js` - Proxy config
- `backend/main.py` - Admin routes added
- Nginx config - WebSocket support added

---

## 🎊 **MISSION:**
**Từ WebSocket Insecure + API 404 → Website hoạt động hoàn hảo!** 