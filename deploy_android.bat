@echo off
REM ============================================
REM  GAIA Android App - Bench Deployment
REM  Builds and installs Gaia app on connected Android device
REM ============================================

echo.
echo ============================================
echo    GAIA ANDROID APP DEPLOYMENT
echo ============================================
echo.

REM Set environment
set JAVA_HOME=C:\Program Files\Android\Android Studio\jbr
set ANDROID_HOME=C:\Users\k250079\AppData\Local\Android\Sdk
set PATH=%PATH%;%ANDROID_HOME%\platform-tools

REM Get IP
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
    set IP=%%a
    goto :found
)
:found
set IP=%IP:~1%

echo [INFO] PC IP Address: %IP%
echo.

REM Update bench-config.js with current IP
echo // Bench Configuration for Android App > "%~dp0cameratest\dms-app\dist\bench-config.js"
echo window.GAIA_CONFIG = { >> "%~dp0cameratest\dms-app\dist\bench-config.js"
echo   DMS_SERVER_URL: 'http://%IP%:5000', >> "%~dp0cameratest\dms-app\dist\bench-config.js"
echo   DMS_FULLSCREEN_ALERTS: true >> "%~dp0cameratest\dms-app\dist\bench-config.js"
echo }; >> "%~dp0cameratest\dms-app\dist\bench-config.js"
echo [INFO] Updated DMS_SERVER_URL to http://%IP%:5000
echo.

REM Sync Capacitor
echo [BUILD] Syncing Capacitor...
cd /d "%~dp0cameratest\dms-app"
call npx cap sync android

REM Build APK
echo.
echo [BUILD] Building APK...
cd /d "%~dp0cameratest\dms-app\android"
call gradlew.bat assembleDebug

echo.
echo [ADB] Checking connected devices...
adb devices

echo.
set /p INSTALL="Install APK on connected device? (Y/N): "
if /i "%INSTALL%"=="Y" (
    echo [ADB] Installing APK...
    adb install -r "%~dp0cameratest\dms-app\android\app\build\outputs\apk\debug\app-debug.apk"
    echo.
    echo [ADB] Starting app...
    adb shell am start -n com.renault.gaia/.MainActivity
)

echo.
echo ============================================
echo    DEPLOYMENT COMPLETE!
echo ============================================
echo.
echo APK Location:
echo   %~dp0cameratest\dms-app\android\app\build\outputs\apk\debug\app-debug.apk
echo.
echo On the Android device, configure WiFi to connect to same network as PC.
echo DMS Server: http://%IP%:5000
echo.
pause
