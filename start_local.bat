@echo off
echo ========================================
echo Starting MLN Debate System (Local)
echo ========================================
echo.

echo [1/2] Starting Backend API...
start "Backend API" cmd /k "cd backend && python main.py"

timeout /t 3 /nobreak >nul

echo [2/2] Starting Frontend...
start "Frontend" cmd /k "cd frontend && npm start"

echo.
echo ========================================
echo Services are starting...
echo ========================================
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3001
echo API Docs: http://localhost:5000/docs
echo.
echo Press any key to close this window...
pause >nul

