# 🚀 KHẮC PHỤC TRUY CẬP TỪ BÊN NGOÀI - HƯỚNG DẪN NHANH

## ⚡ CHẠY NGAY (3 BƯỚC)

### 1. **Make executable và chạy chẩn đoán:**
```bash
chmod +x *.sh
./diagnose_external_access.sh
```

### 2. **Khắc phục tự động:**
```bash
./fix_external_access.sh
```

### 3. **Nếu vẫn lỗi, kiểm tra nginx:**
```bash
./check_nginx_external.sh
./fix_nginx_external.sh
```

---

## 📋 CÁC SCRIPT ĐÃ TẠO

| Script | Mô tả | Khi nào dùng |
|--------|-------|---------------|
| `diagnose_external_access.sh` | 🩺 Chẩn đoán toàn diện | **CHẠY TRƯỚC** |
| `fix_external_access.sh` | 🔧 Khắc phục tổng hợp | Sau khi chẩn đoán |
| `check_nginx_external.sh` | 🔍 Kiểm tra nginx config | Nếu nginx có vấn đề |
| `fix_nginx_external.sh` | 🛠️ Sửa nginx config | Nếu nginx bind localhost |

---

## 🎯 NGUYÊN NHÂN THƯỜNG GẶP

### ⭐ **Firewall chặn ports** (90% trường hợp)
```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### ⭐ **Nginx chỉ listen localhost**
- Configuration có `listen 127.0.0.1:80`
- Cần sửa thành `listen 80` hoặc `listen 0.0.0.0:80`

### ⭐ **Cloud Security Groups** 
- AWS EC2, GCP, Azure chưa mở port 80, 443

---

## 🧪 TEST NHANH

**Từ server:**
```bash
curl -I http://localhost/
curl http://checkip.amazonaws.com/    # Lấy IP
```

**Từ máy bên ngoài:**
```bash
ping YOUR_SERVER_IP
telnet YOUR_SERVER_IP 80
curl -I http://YOUR_SERVER_IP/
curl -I https://mlndebate.io.vn/
```

---

## ☁️ CLOUD PLATFORM

### AWS EC2
1. EC2 Console → Security Groups
2. Add Inbound Rules:
   - Port 80 (HTTP) from 0.0.0.0/0
   - Port 443 (HTTPS) from 0.0.0.0/0

### Google Cloud
```bash
gcloud compute firewall-rules create allow-http --allow tcp:80 --source-ranges 0.0.0.0/0
gcloud compute firewall-rules create allow-https --allow tcp:443 --source-ranges 0.0.0.0/0
```

### Azure
Network Security Groups → Add port 80, 443

---

## 🆘 NẾU VẪN KHÔNG ĐƯỢC

Chụp màn hình kết quả của:
```bash
./diagnose_external_access.sh
sudo ufw status
ping YOUR_EXTERNAL_IP (từ máy bên ngoài)
```

Và cung cấp thông tin platform (AWS/GCP/Azure/VPS) để được hỗ trợ chi tiết! 