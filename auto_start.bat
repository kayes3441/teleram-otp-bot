@echo off
title Telegram OTP Bot - Auto Start
color 0A
echo.
echo ========================================
echo   Telegram OTP Bot - Auto Start
echo   Everything will be automated!
echo ========================================
echo.

REM Change to script directory
cd /d "%~dp0"

REM Step 1: Check Python
echo [1/5] Checking Python installation...
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is not installed!
    echo.
    echo Please install Python from: https://www.python.org/downloads/
    echo Make sure to check "Add Python to PATH" during installation
    echo.
    echo Opening Python download page...
    start https://www.python.org/downloads/
    pause
    exit /b 1
)
for /f "tokens=2" %%i in ('python --version 2^>^&1') do set PYTHON_VERSION=%%i
echo [OK] Python %PYTHON_VERSION% found
echo.

REM Step 2: Check/Install pip
echo [2/5] Checking pip...
python -m pip --version >nul 2>&1
if errorlevel 1 (
    echo [INFO] Installing pip...
    python -m ensurepip --upgrade
)
echo [OK] pip is ready
echo.

REM Step 3: Install Python packages
echo [3/5] Installing/Updating Python packages...
echo This may take a minute on first run...
python -m pip install --upgrade pip --quiet
python -m pip install selenium webdriver-manager --quiet --disable-pip-version-check
if errorlevel 1 (
    echo [ERROR] Failed to install packages
    echo Trying with verbose output...
    python -m pip install selenium webdriver-manager
    if errorlevel 1 (
        echo [ERROR] Installation failed. Please check your internet connection.
        pause
        exit /b 1
    )
)
echo [OK] All Python packages installed
echo.

REM Step 4: Check Node.js (for bot)
echo [4/5] Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo [WARNING] Node.js is not installed!
    echo The login will work, but you need Node.js to run the bot.
    echo.
    set /p CONTINUE="Continue with login only? (Y/N): "
    if /i not "%CONTINUE%"=="Y" (
        echo Opening Node.js download page...
        start https://nodejs.org/
        pause
        exit /b 1
    )
) else (
    for /f %%i in ('node --version 2^>^&1') do set NODE_VERSION=%%i
    echo [OK] Node.js %NODE_VERSION% found
    
    REM Check if node_modules exists
    if not exist "node_modules" (
        echo [INFO] Installing Node.js packages...
        call npm install --silent
        if errorlevel 1 (
            echo [WARNING] Failed to install Node.js packages
            echo You may need to run: npm install
        ) else (
            echo [OK] Node.js packages installed
        )
    ) else (
        echo [OK] Node.js packages already installed
    )
)
echo.

REM Step 5: Set environment variables (if not set)
if not defined SMS_USERNAME (
    set SMS_USERNAME=mhmehedi007
    echo [INFO] Using default SMS_USERNAME: mhmehedi007
)
if not defined SMS_PASSWORD (
    set SMS_PASSWORD=##2023@@$$
    echo [INFO] Using default SMS_PASSWORD: ********
)
echo.

REM Step 6: Run login script
echo [5/5] Starting login process...
echo.
echo ========================================
echo   Chrome will open automatically
echo   Login will happen automatically
echo   Keep Chrome open to maintain session
echo ========================================
echo.
echo Press Ctrl+C to stop at any time
echo.

python login_test_windows.py

REM Check if login was successful
if errorlevel 1 (
    echo.
    echo [ERROR] Login failed!
    echo Please check:
    echo 1. Internet connection
    echo 2. Login credentials
    echo 3. Login URL is accessible
    pause
    exit /b 1
)

echo.
echo ========================================
echo   Login successful!
echo ========================================
echo.

REM Ask if user wants to start the bot
if exist "node_modules" (
    set /p START_BOT="Do you want to start the Telegram bot now? (Y/N): "
    if /i "%START_BOT%"=="Y" (
        echo.
        echo Starting Telegram bot...
        echo Press Ctrl+C to stop the bot
        echo.
        call npm start
    ) else (
        echo.
        echo To start the bot later, run: npm start
        echo.
    )
) else (
    echo To start the bot, first install Node.js packages: npm install
    echo Then run: npm start
    echo.
)

echo.
echo ========================================
echo   Setup Complete!
echo ========================================
echo.
pause

