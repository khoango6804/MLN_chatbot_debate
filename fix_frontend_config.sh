#!/bin/bash

echo "🔧 SỬA FRONTEND CONFIGURATION CHO HTTPS/WSS"
echo "============================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "🔍 BƯỚC 1: Kiểm tra frontend directory..."
if [ ! -d "frontend" ]; then
    echo -e "${RED}❌ frontend/ directory không tồn tại${NC}"
    exit 1
fi

cd frontend
echo -e "${GREEN}✅ Found frontend directory${NC}"

echo ""
echo "🔍 BƯỚC 2: Tìm các config files..."

# Find config files
CONFIG_FILES=()

if [ -f ".env" ]; then
    CONFIG_FILES+=(".env")
    echo "Found: .env"
fi

if [ -f ".env.local" ]; then
    CONFIG_FILES+=(".env.local")
    echo "Found: .env.local"
fi

if [ -f "src/config/api.js" ]; then
    CONFIG_FILES+=("src/config/api.js")
    echo "Found: src/config/api.js"
fi

if [ -f "src/config/config.js" ]; then
    CONFIG_FILES+=("src/config/config.js")
    echo "Found: src/config/config.js"
fi

if [ -f "src/utils/api.js" ]; then
    CONFIG_FILES+=("src/utils/api.js")
    echo "Found: src/utils/api.js"
fi

# Search for files containing localhost or API URLs
echo "Searching for files with API/WebSocket configurations..."
API_FILES=$(find src -name "*.js" -o -name "*.jsx" -o -name "*.ts" -o -name "*.tsx" 2>/dev/null | xargs grep -l "localhost\|127.0.0.1\|ws://\|api/" 2>/dev/null || true)

if [ ! -z "$API_FILES" ]; then
    echo "Files containing API/WS configurations:"
    echo "$API_FILES"
fi

echo ""
echo "🔍 BƯỚC 3: Backup các config files..."

for file in "${CONFIG_FILES[@]}"; do
    if [ -f "$file" ]; then
        cp "$file" "${file}.backup.$(date +%Y%m%d_%H%M%S)"
        echo "✅ Backed up $file"
    fi
done

echo ""
echo "🔧 BƯỚC 4: Sửa environment variables..."

# Create or update .env file
cat > .env << 'EOF'
# API Configuration for HTTPS
REACT_APP_API_URL=https://mlndebate.io.vn/api
REACT_APP_WS_URL=wss://mlndebate.io.vn/ws
REACT_APP_BASE_URL=https://mlndebate.io.vn

# Development settings
PORT=3001
HTTPS=false
HOST=0.0.0.0

# Build settings
GENERATE_SOURCEMAP=false
EOF

echo -e "${GREEN}✅ Created/updated .env file${NC}"

echo ""
echo "🔧 BƯỚC 5: Sửa các JavaScript config files..."

# Fix JavaScript config files
for file in "${CONFIG_FILES[@]}"; do
    if [[ "$file" == *.js ]]; then
        echo "Fixing $file..."
        
        # Replace HTTP with HTTPS
        sed -i 's|http://localhost:3001|https://mlndebate.io.vn|g' "$file"
        sed -i 's|http://localhost:5000|https://mlndebate.io.vn/api|g' "$file"
        sed -i 's|http://127.0.0.1:3001|https://mlndebate.io.vn|g' "$file"
        sed -i 's|http://127.0.0.1:5000|https://mlndebate.io.vn/api|g' "$file"
        
        # Replace WS with WSS
        sed -i 's|ws://localhost|wss://mlndebate.io.vn/ws|g' "$file"
        sed -i 's|ws://127.0.0.1|wss://mlndebate.io.vn/ws|g' "$file"
        
        echo "✅ Fixed $file"
    fi
done

echo ""
echo "🔧 BƯỚC 6: Tìm và sửa hardcoded URLs trong source code..."

# Find and fix hardcoded URLs in source files
if [ ! -z "$API_FILES" ]; then
    echo "$API_FILES" | while read -r file; do
        if [ -f "$file" ]; then
            echo "Checking $file..."
            
            # Backup
            cp "$file" "${file}.backup.$(date +%Y%m%d_%H%M%S)"
            
            # Replace localhost URLs
            sed -i 's|http://localhost:3001|https://mlndebate.io.vn|g' "$file"
            sed -i 's|http://localhost:5000|https://mlndebate.io.vn|g' "$file"
            sed -i 's|ws://localhost|wss://mlndebate.io.vn/ws|g' "$file"
            
            # Replace with environment variables where possible
            sed -i 's|"https://mlndebate.io.vn/api"|process.env.REACT_APP_API_URL|g' "$file"
            sed -i 's|"wss://mlndebate.io.vn/ws"|process.env.REACT_APP_WS_URL|g' "$file"
            
            echo "✅ Fixed $file"
        fi
    done
fi

echo ""
echo "🔧 BƯỚC 7: Kiểm tra package.json scripts..."

if [ -f "package.json" ]; then
    # Backup package.json
    cp package.json package.json.backup.$(date +%Y%m%d_%H%M%S)
    
    # Ensure start script uses correct host and port
    sed -i 's/"start": "react-scripts start"/"start": "HOST=0.0.0.0 PORT=3001 react-scripts start"/g' package.json
    
    echo "✅ Updated package.json scripts"
fi

echo ""
echo "🔧 BƯỚC 8: Tạo webpack config override nếu cần..."

# Create public/_redirects for SPA routing
mkdir -p public
cat > public/_redirects << 'EOF'
/*    /index.html   200
EOF

echo "✅ Created SPA routing redirects"

echo ""
echo "🔧 BƯỚC 9: Tạo setupProxy.js cho development..."

cat > src/setupProxy.js << 'EOF'
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Proxy API requests to backend
  app.use(
    '/api',
    createProxyMiddleware({
      target: process.env.NODE_ENV === 'production' 
        ? 'https://mlndebate.io.vn'
        : 'http://localhost:5000',
      changeOrigin: true,
      secure: true,
    })
  );

  // Proxy WebSocket connections
  app.use(
    '/ws',
    createProxyMiddleware({
      target: process.env.NODE_ENV === 'production'
        ? 'wss://mlndebate.io.vn'
        : 'ws://localhost:5000',
      ws: true,
      changeOrigin: true,
    })
  );
};
EOF

echo "✅ Created setupProxy.js"

echo ""
echo "🧪 BƯỚC 10: Kiểm tra cấu hình cuối..."

echo "Current .env content:"
cat .env
echo ""

echo "🎯 KẾT QUẢ:"
echo "==========="
echo -e "${GREEN}✅ Frontend configuration đã được cập nhật để sử dụng HTTPS/WSS${NC}"
echo ""

echo "📋 NEXT STEPS:"
echo "=============="
echo "1. Install dependencies (nếu thiếu):"
echo "   npm install http-proxy-middleware"
echo ""
echo "2. Restart frontend:"
echo "   pkill -f 'node.*3001'"
echo "   npm start &"
echo ""
echo "3. Test URLs trong browser:"
echo "   - Frontend: https://mlndebate.io.vn/"
echo "   - API: https://mlndebate.io.vn/api/health"
echo ""
echo "4. Kiểm tra browser console không còn WebSocket errors"
echo ""

cd ..

echo "✅ Frontend configuration completed!" 