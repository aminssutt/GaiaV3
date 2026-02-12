@echo off
REM ============================================
REM  GAIA + DMS Bench Launcher
REM  Lance tous les services pour le bench véhicule
REM ============================================

echo.
echo ============================================
echo    GAIA BENCH LAUNCHER
echo ============================================
echo.

REM Get local IP
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
    set IP=%%a
    goto :found
)
:found
set IP=%IP:~1%

echo [INFO] IP Address: %IP%
echo.

REM Check if Gaia bench build exists
if not exist "Gaia\dist-bench\index.html" (
    echo [BUILD] Building Gaia for bench...
    cd Gaia
    call npm run build:bench
    cd ..
)

echo [START] Starting DMS Server on port 5000...
start "DMS Server" cmd /k "cd cameratest && python web_dms_server.py"

echo [START] Starting Gaia Web Server on port 8080...
start "Gaia Server" cmd /k "cd Gaia\dist-bench && python -m http.server 8080 --bind 0.0.0.0"

timeout /t 3 /nobreak > nul

echo.
echo ============================================
echo    BENCH READY!
echo ============================================
echo.
echo    DMS Server:  http://%IP%:5000
echo    Gaia App:    http://%IP%:8080
echo.
echo    Sur la WebView du bench, ouvrir:
echo    http://%IP%:8080
echo.
echo    Puis configurer DMS URL dans Gaia:
echo    http://%IP%:5000
echo.
echo ============================================
echo.
pause
