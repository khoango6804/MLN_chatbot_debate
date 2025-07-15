#!/bin/bash
echo "🚀 Quick Deploy - Dev server as production with nginx proxy..."

# Kill any existing processes
pkill -f "npm start" || true
pkill -f "uvicorn" || true

# Start backend
echo "Starting backend..."
cd backend
nohup uvicorn main:app --host 0.0.0.0 --port 5000 > ../backend.log 2>&1 &
echo "Backend started on port 5000"
cd ..

# Start frontend on port 3001
echo "Starting frontend on port 3001..."
cd frontend
nohup HOST=0.0.0.0 PORT=3001 npm start > ../frontend.log 2>&1 &
echo "Frontend started on port 3001"
cd ..

# Update nginx to proxy to dev server
echo "Updating nginx config..."
sudo tee /etc/nginx/sites-available/default > /dev/null << 'EOF'
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;

    # Serve React dev server
    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Proxy API requests to backend
    location /api/ {
        proxy_pass http://127.0.0.1:5000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Reload nginx
sudo systemctl reload nginx

echo "✅ Deployment complete!"
echo "🌐 Check: https://mlndebate.io.vn"

sleep 10
echo "Health check:"
curl -s http://localhost:5000/api/health | head -1 