#!/bin/bash

echo "🚀 MLN Debate System - Complete Setup Script"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Step 1: Create .env file for backend
print_status "Setting up backend environment..."
if [ ! -f "backend/.env" ]; then
    cat > backend/.env << 'EOF'
# MLN Debate System Environment Configuration
# Add your actual Google API key below

# Google Generative AI API Key (Required for AI functionality)
# Get your API key from: https://makersuite.google.com/app/apikey
GOOGLE_API_KEY=your_google_api_key_here

# Database Configuration
DATABASE_URL=sqlite:///./debate_system.db

# Environment
ENVIRONMENT=development

# Logging
LOG_LEVEL=INFO
EOF
    print_success "Created backend/.env file"
    print_warning "⚠️  IMPORTANT: Edit backend/.env and add your Google API key!"
else
    print_status "backend/.env already exists"
fi

# Step 2: Install backend dependencies
print_status "Installing backend dependencies..."
cd backend
if ! command -v python3 &> /dev/null; then
    print_error "Python3 is not installed. Please install Python 3.8+ first."
    exit 1
fi

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    python3 -m venv venv
    print_success "Created Python virtual environment"
fi

# Activate virtual environment
source venv/bin/activate
print_success "Activated virtual environment"

# Install requirements
pip install -r requirements.txt
print_success "Installed backend dependencies"

cd ..

# Step 3: Install frontend dependencies
print_status "Installing frontend dependencies..."
cd frontend

if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install Node.js and npm first."
    exit 1
fi

npm install
print_success "Installed frontend dependencies"

cd ..

# Step 4: Create startup scripts
print_status "Creating startup scripts..."

# Backend startup script
cat > start_backend_final.sh << 'EOF'
#!/bin/bash
echo "🐍 Starting MLN Debate Backend..."

cd backend

# Check if .env exists and has API key
if [ ! -f ".env" ]; then
    echo "❌ Error: .env file not found in backend directory"
    echo "Please run SETUP_COMPLETE_SYSTEM.sh first"
    exit 1
fi

if grep -q "your_google_api_key_here" .env; then
    echo "⚠️  Warning: Please add your Google API key to backend/.env"
    echo "Get your API key from: https://makersuite.google.com/app/apikey"
    echo "Replace 'your_google_api_key_here' with your actual API key"
fi

# Kill any existing backend processes
pkill -f "uvicorn main:app" 2>/dev/null || true
pkill -f "python3 main.py" 2>/dev/null || true
sleep 2

# Activate virtual environment if it exists
if [ -f "venv/bin/activate" ]; then
    source venv/bin/activate
    echo "✅ Activated virtual environment"
fi

# Start backend with uvicorn
echo "🚀 Starting FastAPI backend on port 5000..."
uvicorn main:app --host 0.0.0.0 --port 5000 --reload &

# Get the process ID
BACKEND_PID=$!
echo "✅ Backend started with PID: $BACKEND_PID"
echo "🔗 Backend API: http://localhost:5000"
echo "📚 API Documentation: http://localhost:5000/docs"

# Wait a moment and check if process is still running
sleep 3
if ps -p $BACKEND_PID > /dev/null; then
    echo "✅ Backend is running successfully!"
else
    echo "❌ Backend failed to start. Check for errors above."
    exit 1
fi
EOF

# Frontend startup script  
cat > start_frontend_final.sh << 'EOF'
#!/bin/bash
echo "⚛️  Starting MLN Debate Frontend..."

cd frontend

# Kill any existing frontend processes
pkill -f "react-scripts start" 2>/dev/null || true
pkill -f "PORT=3001" 2>/dev/null || true
sleep 2

# Start frontend
echo "🚀 Starting React frontend on port 3001..."
HOST=0.0.0.0 PORT=3001 npm start &

# Get the process ID
FRONTEND_PID=$!
echo "✅ Frontend started with PID: $FRONTEND_PID"
echo "🔗 Frontend URL: http://localhost:3001"

# Wait a moment and check if process is still running
sleep 5
if ps -p $FRONTEND_PID > /dev/null; then
    echo "✅ Frontend is running successfully!"
else
    echo "❌ Frontend failed to start. Check for errors above."
    exit 1
fi
EOF

# Complete system startup script
cat > start_complete_system.sh << 'EOF'
#!/bin/bash
echo "🚀 MLN Debate System - Complete Startup"
echo "======================================"

# Function to check if port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo "⚠️  Port $1 is already in use"
        return 1
    else
        return 0
    fi
}

# Check required ports
print_status "Checking ports..."
if ! check_port 5000; then
    echo "Killing processes on port 5000..."
    pkill -f ":5000" 2>/dev/null || true
    sleep 2
fi

if ! check_port 3001; then
    echo "Killing processes on port 3001..."
    pkill -f ":3001" 2>/dev/null || true
    sleep 2
fi

echo "🐍 Starting Backend..."
./start_backend_final.sh &
sleep 5

echo "⚛️  Starting Frontend..."
./start_frontend_final.sh &
sleep 5

echo ""
echo "🎉 MLN Debate System Started Successfully!"
echo "=========================================="
echo "🔗 Frontend (Admin Dashboard): http://localhost:3001"
echo "🔗 Backend API: http://localhost:5000"
echo "📚 API Documentation: http://localhost:5000/docs"
echo ""
echo "📋 Next Steps:"
echo "1. Open http://localhost:3001 in your browser"
echo "2. Go to Admin Dashboard to manage debates"
echo "3. Create new debate sessions and monitor progress"
echo ""
echo "⚠️  Important Notes:"
echo "- Make sure you've added your Google API key to backend/.env"
echo "- Both services are running in the background"
echo "- Use Ctrl+C to stop this script (services will continue running)"
echo "- To stop all services, run: pkill -f 'uvicorn\\|react-scripts'"
EOF

# Make scripts executable
chmod +x start_backend_final.sh
chmod +x start_frontend_final.sh  
chmod +x start_complete_system.sh

print_success "Created startup scripts"

# Step 5: Create status checking script
cat > check_system_status.sh << 'EOF'
#!/bin/bash
echo "📊 MLN Debate System Status"
echo "=========================="

# Check backend
echo "🐍 Backend Status:"
if curl -s http://localhost:5000/api/health > /dev/null; then
    echo "  ✅ Backend is running on port 5000"
    curl -s http://localhost:5000/api/health | python3 -m json.tool 2>/dev/null || echo "  📡 API responding"
else
    echo "  ❌ Backend is not responding on port 5000"
fi

echo ""

# Check frontend
echo "⚛️  Frontend Status:"
if curl -s http://localhost:3001 > /dev/null; then
    echo "  ✅ Frontend is running on port 3001"
else
    echo "  ❌ Frontend is not responding on port 3001"
fi

echo ""

# Check processes
echo "🔍 Running Processes:"
echo "Backend processes:"
ps aux | grep -E "(uvicorn|main:app)" | grep -v grep || echo "  No backend processes found"

echo "Frontend processes:"
ps aux | grep -E "(react-scripts|PORT=3001)" | grep -v grep || echo "  No frontend processes found"

echo ""

# Check ports
echo "🔌 Port Usage:"
echo "Port 5000 (Backend):"
lsof -i :5000 2>/dev/null || echo "  Port 5000 is free"

echo "Port 3001 (Frontend):"
lsof -i :3001 2>/dev/null || echo "  Port 3001 is free"
EOF

chmod +x check_system_status.sh
print_success "Created status checking script"

# Step 6: Final instructions
echo ""
echo "🎉 Setup Complete!"
echo "=================="
echo ""
print_success "✅ Backend environment configured"
print_success "✅ Dependencies installed"
print_success "✅ Startup scripts created"
print_success "✅ Status checking script created"
echo ""
echo "📋 Next Steps:"
echo "1. Edit backend/.env and add your Google API key"
echo "   Get key from: https://makersuite.google.com/app/apikey"
echo ""
echo "2. Start the complete system:"
echo "   ./start_complete_system.sh"
echo ""
echo "3. Check system status anytime:"
echo "   ./check_system_status.sh"
echo ""
echo "🔗 URLs after startup:"
echo "   Frontend: http://localhost:3001"
echo "   Backend API: http://localhost:5000"
echo "   API Docs: http://localhost:5000/docs"
echo ""
print_warning "⚠️  Remember to add your Google API key to backend/.env before starting!"
echo "" 