#!/bin/bash

# Serve production build
cd /home/ubuntu/MLN_chatbot_debate/frontend

# Check if build directory exists
if [ ! -d "build" ]; then
    echo "❌ Build directory not found. Running npm run build first..."
    npm run build
fi

echo "🚀 Starting production server on port 3001..."

# Serve using http-server or python
if command -v http-server &> /dev/null; then
    npx http-server build -p 3001 -a 0.0.0.0 --cors
elif command -v python3 &> /dev/null; then
    cd build && python3 -m http.server 3001 --bind 0.0.0.0
else
    echo "❌ No suitable HTTP server found. Please install http-server:"
    echo "npm install -g http-server"
    exit 1
fi 