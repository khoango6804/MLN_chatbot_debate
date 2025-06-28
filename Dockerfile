# syntax=docker/dockerfile:1

# 1. Sử dụng một base image chính thức của Python
FROM python:3.9-slim

# 2. Thiết lập thư mục làm việc bên trong container
WORKDIR /app

# 3. Sao chép file requirements.txt và cài đặt các thư viện
COPY requirements.txt requirements.txt
RUN pip install --no-cache-dir --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

# 4. Sao chép toàn bộ code của backend vào thư mục làm việc
COPY . .

# 5. Thêm Gunicorn vào requirements và cài đặt
# Gunicorn sẽ là server WSGI production của chúng ta
RUN pip install gunicorn

# 6. Expose port 8000 để container có thể nhận kết nối
EXPOSE 8000

# 7. Lệnh để chạy ứng dụng khi container khởi động
# Chúng ta dùng Gunicorn để chạy Uvicorn worker cho hiệu suất cao
CMD ["gunicorn", "-k", "uvicorn.workers.UvicornWorker", "-w", "4", "-b", "0.0.0.0:8000", "main:app"] 