# Windows Setup Guide

## Quick Start

### Option 1: Using Batch File (Easiest)

1. **Double-click** `run_login_windows.bat`
2. The script will:
   - Check if Python is installed
   - Install required packages automatically
   - Run the login script
   - Keep Chrome open to maintain session

### Option 2: Manual Setup

1. **Install Python** (if not installed):
   - Download from: https://www.python.org/downloads/
   - **IMPORTANT**: Check "Add Python to PATH" during installation
   - Install Python 3.8 or higher

2. **Install Required Packages**:
   ```cmd
   pip install selenium webdriver-manager
   ```

3. **Set Environment Variables** (Optional):
   ```cmd
   set SMS_USERNAME=your_username
   set SMS_PASSWORD=your_password
   ```
   
   Or set them permanently in Windows:
   - Right-click "This PC" → Properties
   - Advanced system settings → Environment Variables
   - Add `SMS_USERNAME` and `SMS_PASSWORD`

4. **Run Login Script**:
   ```cmd
   python login_test_windows.py
   ```

## Features

- ✅ Automatically detects if Chrome is already running with debug port
- ✅ Opens visible Chrome window (not headless)
- ✅ Saves cookies for session persistence
- ✅ Keeps browser open to maintain login

## Troubleshooting

### "Python is not recognized"
- Install Python and check "Add Python to PATH"
- Or add Python to PATH manually:
  - Find Python installation (usually `C:\Python3x\`)
  - Add to System Environment Variables → Path

### "ChromeDriver not found"
- The script uses `webdriver-manager` which downloads ChromeDriver automatically
- Make sure you have internet connection on first run

### "Login failed"
- Check your credentials in environment variables
- Make sure the login URL is accessible: http://185.2.83.39/ints/login
- Check if Chrome is blocking the site (disable extensions if needed)

### "Chrome window closes immediately"
- This is normal if login fails
- Check the error message in the console
- Make sure credentials are correct

## Running the Bot

After successful login:

1. **Keep the Chrome window open** (don't close it)

2. **Start the Telegram bot**:
   ```cmd
   npm start
   ```

3. The bot will connect to the open Chrome instance and start scraping OTPs

## Stopping

- Press `Ctrl+C` in the terminal to stop the login script
- Close Chrome window to end the session
- Use Task Manager to kill Chrome if it doesn't close

