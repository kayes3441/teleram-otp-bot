# Mac Simple Test Guide - Use External Chrome

Since Puppeteer's Chromium is being blocked, use External Chrome instead. It's simpler and more reliable.

---

## Quick Start (3 Steps)

### Step 1: Start Chrome with Debugging

**Close all Chrome windows first**, then run:

```bash
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222 --user-data-dir="/tmp/chrome-debug-profile"
```

Chrome will open automatically.

---

### Step 2: Login Manually

1. In Chrome, go to: `http://185.2.83.39/ints/login`
2. Enter your credentials:
   - Username: `mhmehedi007`
   - Password: `##2023@@$$`
   - Solve the math CAPTCHA
   - Click Login
3. After login, navigate to: `http://185.2.83.39/ints/agent/SMSCDRStats`
4. **Keep Chrome open**

---

### Step 3: Test Connection

```bash
# Run the simple test
node test-login-simple.js
```

This will:
- ✅ Check if Chrome debugging is working
- ✅ Verify you're logged in
- ✅ Check if form fields exist
- ✅ Show you what's working

---

## Run Your Bot

Once the test passes:

```bash
export USE_EXTERNAL_CHROME="true"
export TELEGRAM_BOT_TOKEN="your-bot-token-here"

node telegramNumberBot.js
```

The bot will:
- Connect to your Chrome
- Use your existing login session
- Start scraping SMS data

---

## Why External Chrome?

✅ **No blocking issues** - Uses your real Chrome  
✅ **Manual login** - You login once, bot uses the session  
✅ **More reliable** - No automation detection  
✅ **Simpler** - No complex Puppeteer setup  

---

## Troubleshooting

### Chrome debugging not working?

```bash
# Check if Chrome is running
curl http://localhost:9222/json/version

# If it fails, make sure:
# 1. All Chrome windows are closed
# 2. Run the Chrome command again
# 3. Check if port 9222 is in use:
lsof -i :9222
```

### Not logged in?

1. Make sure you're logged in manually in Chrome
2. Navigate to: `http://185.2.83.39/ints/agent/SMSCDRStats`
3. You should see the SMS stats page (not login page)
4. Keep Chrome open

---

## That's It!

This is the recommended way to test and run your bot on Mac. Much simpler than trying to automate login with Puppeteer! 🎉

