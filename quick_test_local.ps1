# PowerShell script to start local development
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Starting MLN Debate System (Local)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if backend dependencies are installed
Write-Host "[CHECK] Checking Python dependencies..." -ForegroundColor Yellow
$fastapiInstalled = python -c "import fastapi" 2>$null
if (-not $fastapiInstalled) {
    Write-Host "[WARN] FastAPI not found. Installing..." -ForegroundColor Yellow
    cd backend
    pip install -r requirements.txt
    cd ..
}

# Check if frontend dependencies are installed
Write-Host "[CHECK] Checking Node dependencies..." -ForegroundColor Yellow
if (-not (Test-Path "frontend/node_modules")) {
    Write-Host "[WARN] node_modules not found. Installing..." -ForegroundColor Yellow
    cd frontend
    npm install
    cd ..
}

Write-Host ""
Write-Host "[1/2] Starting Backend API on port 5000..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\backend'; python main.py"

Start-Sleep -Seconds 5

Write-Host "[2/2] Starting Frontend on port 3001..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\frontend'; npm start"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Services started!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Backend:  http://localhost:5000" -ForegroundColor White
Write-Host "Frontend: http://localhost:3001" -ForegroundColor White
Write-Host "API Docs: http://localhost:5000/docs" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to close this window..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

