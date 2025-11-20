@echo off
echo ========================================
echo   Telegram OTP Bot - Windows Login
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is not installed or not in PATH
    echo.
    echo Please install Python from: https://www.python.org/downloads/
    echo Make sure to check "Add Python to PATH" during installation
    pause
    exit /b 1
)

echo [OK] Python found
echo.

REM Check if required packages are installed
echo Checking Python packages...
python -c "import selenium" >nul 2>&1
if errorlevel 1 (
    echo [INFO] Installing selenium...
    pip install selenium webdriver-manager
    if errorlevel 1 (
        echo [ERROR] Failed to install packages
        pause
        exit /b 1
    )
)

python -c "import webdriver_manager" >nul 2>&1
if errorlevel 1 (
    echo [INFO] Installing webdriver-manager...
    pip install webdriver-manager
    if errorlevel 1 (
        echo [ERROR] Failed to install packages
        pause
        exit /b 1
    )
)

echo [OK] All packages installed
echo.

REM Set environment variables (optional - can be set in system settings)
if not defined SMS_USERNAME (
    set SMS_USERNAME=mhmehedi007
)
if not defined SMS_PASSWORD (
    set SMS_PASSWORD=##2023@@$$
)

echo Starting login script...
echo.
python login_test_windows.py

pause

