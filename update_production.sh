#!/bin/bash
echo "🚀 Updating production with latest frontend changes..."

# Kill any running npm dev servers
pkill -f "npm start" || true

# Stop current Docker containers
docker-compose down

# Rebuild and restart containers with latest code
docker-compose up --build -d

# Wait for containers to start
sleep 10

# Check status
echo "✅ Checking production status..."
curl -s http://localhost/api/health
echo ""
echo "🌐 Production updated! Check: https://mlndebate.io.vn" 