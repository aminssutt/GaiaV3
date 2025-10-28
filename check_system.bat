@echo off
echo ========================================
echo    GAIA - System Check
echo ========================================
echo.

echo Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [X] Node.js not found! Please install Node.js
    echo     Download from: https://nodejs.org/
) else (
    echo [OK] Node.js installed
    node --version
)
echo.

echo Checking Python installation...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [X] Python not found! Please install Python 3.8+
    echo     Download from: https://www.python.org/
) else (
    echo [OK] Python installed
    python --version
)
echo.

echo Checking npm packages...
cd Gaia
if exist "node_modules" (
    echo [OK] Node modules installed
) else (
    echo [!] Node modules not found
    echo     Run: npm install
)
cd ..
echo.

echo Checking Python packages...
cd backend
if exist "venv" (
    echo [OK] Virtual environment found
) else (
    echo [!] Virtual environment not found
    echo     Run: python -m venv venv
)
echo.

if exist ".env" (
    echo [OK] .env file found
) else (
    echo [!] .env file not found
    echo     Copy .env.example to .env and add your API key
)
cd ..
echo.

echo ========================================
echo    Quick Start Commands
echo ========================================
echo.
echo Frontend (Terminal 1):
echo   cd Gaia
echo   npm run dev
echo.
echo Backend (Terminal 2):
echo   cd backend
echo   .\venv\Scripts\Activate.ps1
echo   python server.py
echo.
echo ========================================
pause
