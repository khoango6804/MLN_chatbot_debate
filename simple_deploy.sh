#!/bin/bash
echo "🚀 Simple production deployment without Docker..."

# Kill npm dev servers
pkill -f "npm start" || true

# Start backend
echo "Starting backend..."
cd backend
nohup uvicorn main:app --host 0.0.0.0 --port 5000 > ../backend.log 2>&1 &
cd ..

# Build frontend manually
echo "Building frontend..."
cd frontend
npm run build 2>&1 | tee build.log

# Check if build was successful
if [ -f "build/index.html" ]; then
    echo "✅ Frontend build successful!"
    
    # Copy build to nginx directory
    sudo cp -r build/* /var/www/html/
    
    # Restart nginx
    sudo systemctl restart nginx
    
    echo "✅ Deployment complete!"
    echo "🌐 Check: https://mlndebate.io.vn"
else
    echo "❌ Frontend build failed! Check build.log"
    cat build.log
fi 