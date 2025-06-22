# syntax=docker/dockerfile:1

# ----- Giai đoạn 1: Build ứng dụng React -----
FROM node:18-alpine as build

# Thiết lập thư mục làm việc
WORKDIR /app

# Sao chép package.json và package-lock.json
COPY package.json package-lock.json ./

# Cài đặt các dependencies
RUN npm install

# Sao chép toàn bộ source code
COPY . .

# Build ứng dụng
RUN npm run build

# ----- Giai đoạn 2: Serve bằng Nginx -----
FROM nginx:1.21.0-alpine

# Sao chép các file tĩnh đã được build từ giai đoạn 1
COPY --from=build /app/build /usr/share/nginx/html

# Sao chép file cấu hình Nginx (chúng ta sẽ tạo file này ở bước tiếp theo)
# File này sẽ định nghĩa cách Nginx phục vụ app và làm reverse proxy
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Lệnh để khởi động Nginx
CMD ["nginx", "-g", "daemon off;"] 