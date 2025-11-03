#!/bin/bash

echo "========================================"
echo "Starting MLN Debate System (Local)"
echo "========================================"
echo ""

echo "[1/2] Starting Backend API..."
cd backend
python3 main.py &
BACKEND_PID=$!
cd ..

sleep 3

echo "[2/2] Starting Frontend..."
cd frontend
npm start &
FRONTEND_PID=$!
cd ..

echo ""
echo "========================================"
echo "Services are starting..."
echo "========================================"
echo "Backend: http://localhost:5000"
echo "Frontend: http://localhost:3001"
echo "API Docs: http://localhost:5000/docs"
echo ""
echo "Press Ctrl+C to stop all services"
echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"

# Wait for interrupt
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" SIGINT SIGTERM
wait

