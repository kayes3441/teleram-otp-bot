# Mac Quick Start Guide - Test Login Locally

Quick guide to test your bot login on Mac using Chrome.

---

## Step 1: Install Node.js (if not installed)

```bash
# Check if Node.js is installed
node --version

# If not installed, use Homebrew:
brew install node

# Or download from: https://nodejs.org/
```

---

## Step 2: Install Dependencies

```bash
cd ~/path/to/teleram-otp-bot
npm install
```

---

## Step 3: Start Chrome with Remote Debugging

**Close all Chrome windows first**, then run:

```bash
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222 --user-data-dir="/tmp/chrome-debug-profile"
```

Chrome will open automatically.

---

## Step 4: Login Manually in Chrome

1. In the Chrome window that opened, navigate to:
   ```
   http://185.2.83.39/ints/login
   ```

2. Enter your credentials:
   - Username: `mhmehedi007`
   - Password: `##2023@@$$`
   - Solve the math CAPTCHA
   - Click Login

3. After successful login, navigate to:
   ```
   http://185.2.83.39/ints/agent/SMSCDRStats
   ```

4. **Keep Chrome open** (don't close it)

---

## Step 5: Verify Chrome Debugging

Open a **new terminal window** and test:

```bash
curl http://localhost:9222/json/version
```

You should see Chrome version information in JSON format.

---

## Step 6: Test Login

### Option A: Quick Test Script

```bash
# Set environment variables
export USE_EXTERNAL_CHROME="true"
export SMS_USERNAME="mhmehedi007"
export SMS_PASSWORD="##2023@@$$"

# Run test script
node test-login.js
```

This will:
- ✅ Check if Chrome debugging is accessible
- ✅ Verify login page is reachable
- ✅ Check if form fields exist
- ✅ Show you what's working

### Option B: Run Full Bot

```bash
# Set environment variables
export USE_EXTERNAL_CHROME="true"
export TELEGRAM_BOT_TOKEN="your-bot-token-here"
export SMS_USERNAME="mhmehedi007"
export SMS_PASSWORD="##2023@@$$"

# Run bot
node telegramNumberBot.js
```

---

## Step 7: Check Results

Watch the terminal output. You should see:
- ✅ `"Connecting to Chrome at http://localhost:9222..."`
- ✅ `"✅ Already logged in! Skipping login process."`
- ✅ `"Bot is running..."`

---

## Troubleshooting

### Chrome debugging not accessible?

```bash
# Check if Chrome is running with debugging
curl http://localhost:9222/json/version

# If it fails, make sure:
# 1. All Chrome windows are closed
# 2. Run the Chrome command again
# 3. Check if port 9222 is in use:
lsof -i :9222
```

### Can't find Chrome?

```bash
# Check if Chrome is installed
ls -la "/Applications/Google Chrome.app"

# If not found, install Chrome from:
# https://www.google.com/chrome/
```

### Port 9222 already in use?

```bash
# Find what's using the port
lsof -i :9222

# Kill the process (replace PID with actual process ID)
kill -9 PID

# Or use a different port (update in Chrome command and bot)
```

---

## Quick Commands Reference

```bash
# Start Chrome with debugging
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222 --user-data-dir="/tmp/chrome-debug-profile"

# Test Chrome debugging
curl http://localhost:9222/json/version

# Run test script
export USE_EXTERNAL_CHROME="true"
node test-login.js

# Run full bot
export USE_EXTERNAL_CHROME="true"
export TELEGRAM_BOT_TOKEN="your-token"
node telegramNumberBot.js
```

---

## Success Indicators

✅ Chrome opens with debugging enabled  
✅ Can access login page in Chrome  
✅ `curl http://localhost:9222/json/version` returns JSON  
✅ Test script shows "✅ Connected to Chrome"  
✅ Bot shows "✅ Already logged in!"  

---

**That's it! You're ready to test on Mac! 🍎**

