# 🌐 HƯỚNG DẪN KHẮC PHỤC TRUY CẬP WEBSITE TỪ BÊN NGOÀI

## ❓ VẤN ĐỀ
Website mlndebate.io.vn chạy được trên server nhưng không thể truy cập từ máy bên ngoài.

## 🔍 NGUYÊN NHÂN PHỔ BIẾN

### 1. **Firewall chặn ports** ⭐ (Nguyên nhân thường gặp nhất)
- UFW (Ubuntu Firewall) chặn port 80, 443
- Cloud Security Groups chưa mở ports

### 2. **Nginx chỉ listen localhost**
- Configuration bind 127.0.0.1 thay vì 0.0.0.0
- Chỉ accept connection từ localhost

### 3. **Cloud Network Configuration**
- AWS Security Groups
- GCP Firewall Rules
- Azure Network Security Groups

## 🚀 CÁCH KHẮC PHỤC

### BƯỚC 1: Chạy script kiểm tra và sửa lỗi
```bash
# Make executable
chmod +x fix_external_access.sh
chmod +x check_nginx_external.sh
chmod +x fix_nginx_external.sh

# Chạy script chính để khắc phục
./fix_external_access.sh
```

### BƯỚC 2: Nếu script báo lỗi nginx configuration
```bash
# Kiểm tra chi tiết nginx config
./check_nginx_external.sh

# Sửa nginx config tự động
./fix_nginx_external.sh
```

### BƯỚC 3: Kiểm tra thủ công nếu cần

#### A. Kiểm tra Firewall
```bash
# Kiểm tra status
sudo ufw status

# Mở ports nếu chưa mở
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp
sudo ufw enable
```

#### B. Kiểm tra Nginx Configuration
```bash
# Xem config hiện tại
sudo cat /etc/nginx/sites-enabled/mlndebate.io.vn

# Tìm listen directives
sudo grep "listen" /etc/nginx/sites-enabled/mlndebate.io.vn
```

**❌ Sai:** `listen 127.0.0.1:80;`
**✅ Đúng:** `listen 80;` hoặc `listen 0.0.0.0:80;`

#### C. Sửa Nginx Configuration (nếu cần)
```bash
# Backup
sudo cp /etc/nginx/sites-enabled/mlndebate.io.vn /etc/nginx/sites-enabled/mlndebate.io.vn.backup

# Sửa file (thay 127.0.0.1 bằng 0.0.0.0)
sudo nano /etc/nginx/sites-enabled/mlndebate.io.vn

# Test và reload
sudo nginx -t
sudo systemctl reload nginx
```

## 🧪 CÁCH TEST

### 1. Test từ Server
```bash
# Lấy IP external
curl http://checkip.amazonaws.com/

# Test local
curl -I http://localhost/
curl -I https://mlndebate.io.vn/

# Test external IP
curl -I http://YOUR_EXTERNAL_IP/
```

### 2. Test từ Máy Bên Ngoài
```bash
# Ping server
ping YOUR_EXTERNAL_IP

# Test port connectivity
telnet YOUR_EXTERNAL_IP 80
telnet YOUR_EXTERNAL_IP 443

# Test HTTP/HTTPS
curl -v http://YOUR_EXTERNAL_IP/
curl -v https://mlndebate.io.vn/

# Check DNS
nslookup mlndebate.io.vn
```

## ☁️ CLOUD PLATFORM SPECIFIC

### AWS EC2
1. **Security Groups:**
   - Mở Inbound Rules cho port 80 (HTTP) từ 0.0.0.0/0
   - Mở Inbound Rules cho port 443 (HTTPS) từ 0.0.0.0/0

2. **Network ACLs:**
   - Kiểm tra ACLs allow traffic

### Google Cloud Platform
```bash
# Mở firewall
gcloud compute firewall-rules create allow-http --allow tcp:80 --source-ranges 0.0.0.0/0
gcloud compute firewall-rules create allow-https --allow tcp:443 --source-ranges 0.0.0.0/0
```

### Azure
- Network Security Groups cần allow port 80, 443

## 🔧 NGINX CONFIGURATION MẪU

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name mlndebate.io.vn www.mlndebate.io.vn;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    listen [::]:443 ssl;
    server_name mlndebate.io.vn www.mlndebate.io.vn;

    # SSL certificates
    ssl_certificate /etc/letsencrypt/live/mlndebate.io.vn/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/mlndebate.io.vn/privkey.pem;

    # Frontend (React)
    location / {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 📊 TROUBLESHOOTING CHECKLIST

- [ ] UFW firewall mở port 80, 443
- [ ] Cloud Security Groups mở port 80, 443
- [ ] Nginx listen 0.0.0.0:80 và 0.0.0.0:443 (không phải 127.0.0.1)
- [ ] Nginx configuration syntax OK (`sudo nginx -t`)
- [ ] Backend service đang chạy (port 5000)
- [ ] Frontend service đang chạy (port 3001)
- [ ] DNS resolution OK (`nslookup mlndebate.io.vn`)
- [ ] SSL certificates hợp lệ

## 🆘 NẾU VẪN KHÔNG ĐƯỢC

1. **Chụp màn hình kết quả** của các lệnh:
   ```bash
   sudo ufw status
   curl -I http://localhost/
   sudo netstat -tulpn | grep nginx
   ```

2. **Test từ máy bên ngoài:**
   ```bash
   ping YOUR_EXTERNAL_IP
   telnet YOUR_EXTERNAL_IP 80
   ```

3. **Kiểm tra Cloud Console:**
   - AWS: EC2 Security Groups
   - GCP: VPC Firewall Rules
   - Azure: Network Security Groups

Cung cấp thông tin này để được hỗ trợ chi tiết hơn! 